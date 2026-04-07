"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import data from "@emoji-mart/data";
import { SmilePlus } from "lucide-react";

const Picker = dynamic(() => import("@emoji-mart/react"), { ssr: false });

const QUICK_EMOJIS = ["🔥", "💡", "🚀", "❤️", "🍺", "👏"];

const MAX_VISIBLE_PILLS = 3;

/**
 * SmilePlus button + up to 3 reaction pills + overflow badge.
 * Already-reacted emojis are dotted in the picker for undo.
 * If there are more than MAX_VISIBLE_PILLS distinct emojis,
 * the rest collapse into a "+N" badge that calls onViewAll().
 *
 * The total reactions count / viewer button lives in PostActions (right side).
 */
export default function ReactionBar({
  reactions = {},
  currentUserId = "",
  onReact,
  onViewAll,
}) {
  const [quickOpen, setQuickOpen] = useState(false);
  const [fullPickerOpen, setFullPickerOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState(null);

  const quickRef = useRef(null);
  const btnRef = useRef(null);
  const pickerRef = useRef(null);

  const closeAll = useCallback(() => {
    setQuickOpen(false);
    setFullPickerOpen(false);
  }, []);

  useEffect(() => {
    if (!quickOpen && !fullPickerOpen) return;
    function handleClick(e) {
      const inQuick = quickRef.current?.contains(e.target);
      const inBtn = btnRef.current?.contains(e.target);
      const inPicker = pickerRef.current?.contains(e.target);
      if (!inQuick && !inBtn && !inPicker) closeAll();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [quickOpen, fullPickerOpen, closeAll]);

  // Which emojis has the current user already reacted with?
  const myReactions = Object.entries(reactions)
    .filter(([, users]) => Array.isArray(users) && users.includes(currentUserId))
    .map(([emoji]) => emoji);

  function captureRect(ref) {
    if (ref.current) {
      const r = ref.current.getBoundingClientRect();
      setAnchorRect({ top: r.top, left: r.left, bottom: r.bottom });
    }
  }

  function openQuick(e) {
    e.stopPropagation();
    captureRect(btnRef);
    setQuickOpen((v) => !v);
  }

  const quickPopup = quickOpen ? (
    <div
      ref={quickRef}
      className="fixed z-[200] flex items-center gap-0.5 px-2 py-1.5 rounded-xl bg-deep border border-white/[0.08] shadow-xl shadow-black/40"
      style={{
        left: anchorRect?.left ?? 0,
        top: (anchorRect?.top ?? 0) - 48,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {QUICK_EMOJIS.map((emoji) => {
        const alreadyReacted = myReactions.includes(emoji);
        return (
          <button
            key={emoji}
            type="button"
            onClick={() => {
              closeAll();
              onReact?.(emoji);
            }}
            title={alreadyReacted ? "Remove reaction" : "React"}
            className={`relative text-lg hover:scale-125 transition-transform duration-150 p-0.5 rounded ${
              alreadyReacted ? "opacity-100" : "opacity-55 hover:opacity-100"
            }`}
          >
            {emoji}
            {/* dot indicator for active reaction */}
            {alreadyReacted && (
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
            )}
          </button>
        );
      })}
      <div className="w-px h-5 bg-white/[0.08] mx-0.5" />
      <button
        type="button"
        onClick={() => {
          setQuickOpen(false);
          setFullPickerOpen(true);
          captureRect(btnRef);
        }}
        className="flex items-center justify-center w-6 h-6 rounded-md text-ivory/30 hover:text-ivory/60 hover:bg-white/[0.06] transition-all"
        title="More emojis"
      >
        <SmilePlus size={14} />
      </button>
    </div>
  ) : null;

  const fullPickerPopup = fullPickerOpen ? (
    <div
      ref={pickerRef}
      className="fixed z-[200]"
      style={{
        left: anchorRect?.left ?? 0,
        top: (anchorRect?.top ?? 0) - 350,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <Picker
        data={data}
        onEmojiSelect={(emoji) => {
          setFullPickerOpen(false);
          onReact?.(emoji.native);
        }}
        theme="dark"
        previewPosition="none"
        skinTonePosition="none"
        maxFrequentRows={2}
        perLine={8}
      />
    </div>
  ) : null;

  // Sort by count desc so the most-reacted show first
  const reactionEntries = Object.entries(reactions)
    .filter(([, users]) => Array.isArray(users) && users.length > 0)
    .sort(([, a], [, b]) => b.length - a.length);

  const visiblePills = reactionEntries.slice(0, MAX_VISIBLE_PILLS);
  const hiddenCount = reactionEntries
    .slice(MAX_VISIBLE_PILLS)
    .reduce((sum, [, users]) => sum + users.length, 0);
  const hiddenEmojis = reactionEntries.length - MAX_VISIBLE_PILLS;

  return (
    <>
      {/* SmilePlus — only accent-active when picker is open */}
      <button
        ref={btnRef}
        type="button"
        onClick={openQuick}
        title="React"
        className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-150 ${
          quickOpen
            ? "text-accent/70 bg-accent/10 hover:bg-accent/15"
            : "text-ivory/25 hover:text-ivory/55 hover:bg-white/[0.06]"
        }`}
      >
        <SmilePlus size={14} />
      </button>

      {/* Visible reaction pills (max 3) — click to toggle/undo */}
      {visiblePills.map(([emoji, users]) => {
        const reacted = users.includes(currentUserId);
        return (
          <button
            key={emoji}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onReact?.(emoji);
            }}
            title={reacted ? "Remove reaction" : "React"}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] transition-all duration-150 select-none cursor-pointer ${
              reacted
                ? "bg-accent/15 ring-1 ring-accent/30 text-accent"
                : "bg-white/[0.04] ring-1 ring-white/[0.06] text-ivory/60 hover:bg-white/[0.08] hover:text-ivory/80"
            }`}
          >
            <span>{emoji}</span>
            <span className="font-mono text-[10px] opacity-70">{users.length}</span>
          </button>
        );
      })}

      {/* Overflow badge — shows how many more reactions are hidden */}
      {hiddenEmojis > 0 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onViewAll?.();
          }}
          title={`${hiddenEmojis} more reaction type${hiddenEmojis !== 1 ? "s" : ""}`}
          className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-mono bg-white/[0.04] ring-1 ring-white/[0.06] text-ivory/40 hover:text-ivory/70 hover:bg-white/[0.08] transition-all duration-150 select-none"
        >
          +{hiddenEmojis}
        </button>
      )}

      {typeof document !== "undefined" &&
        createPortal(
          <>
            {quickPopup}
            {fullPickerPopup}
          </>,
          document.body
        )}
    </>
  );
}
