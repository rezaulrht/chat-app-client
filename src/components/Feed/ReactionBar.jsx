"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import data from "@emoji-mart/data";
import { Smile } from "lucide-react";

// SSR-safe — emoji-mart accesses browser APIs at init
const Picker = dynamic(() => import("@emoji-mart/react"), { ssr: false });

/**
 * ReactionBar — shows existing reactions as toggle buttons + emoji-mart picker.
 *
 * @param {object}   reactions     - { "🔥": ["userId1","userId2"], ... }
 * @param {string}   currentUserId
 * @param {Function} onReact       - (emoji: string) => void
 * @param {"post"|"card"} variant
 */
export default function ReactionBar({
  reactions = {},
  currentUserId = "",
  onReact,
  variant = "post",
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef(null);
  const btnRef = useRef(null);

  // Close picker on outside click
  useEffect(() => {
    if (!pickerOpen) return;
    function handleClick(e) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target) &&
        !btnRef.current?.contains(e.target)
      ) {
        setPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [pickerOpen]);

  const entries = Object.entries(reactions).filter(([, users]) =>
    Array.isArray(users) ? users.length > 0 : Number(users) > 0
  );

  const totalCount = entries.reduce((s, [, users]) => {
    return s + (Array.isArray(users) ? users.length : Number(users) || 0);
  }, 0);

  function handlePick(emoji) {
    setPickerOpen(false);
    onReact?.(emoji.native);
  }

  return (
    <div className="relative flex items-center gap-1.5 flex-wrap">
      {/* Existing reaction buttons */}
      {entries.map(([emoji, users]) => {
        const usersList = Array.isArray(users) ? users : [];
        const count = usersList.length;
        const reacted = usersList.includes(currentUserId);
        return (
          <button
            key={emoji}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onReact?.(emoji);
            }}
            title={`${count} reaction${count !== 1 ? "s" : ""}`}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[12px] font-mono transition-all duration-150 select-none
              ${
                reacted
                  ? "bg-accent/15 ring-1 ring-accent/30 text-accent scale-105"
                  : "bg-white/[0.04] ring-1 ring-white/[0.06] text-ivory/50 hover:bg-white/[0.08] hover:text-ivory/80"
              }`}
          >
            <span>{emoji}</span>
            <span className="leading-none">{count}</span>
          </button>
        );
      })}

      {/* Open picker */}
      <button
        ref={btnRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setPickerOpen((v) => !v);
        }}
        className="flex items-center justify-center w-7 h-6 rounded-lg bg-white/[0.04] ring-1 ring-white/[0.06] text-ivory/30 hover:text-ivory/60 hover:bg-white/[0.08] transition-all duration-150"
        title="Add reaction"
      >
        <Smile size={12} />
      </button>

      {/* Emoji picker — opens upward */}
      {pickerOpen && (
        <div
          ref={pickerRef}
          className="absolute bottom-9 left-0 z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <Picker
            data={data}
            onEmojiSelect={handlePick}
            theme="dark"
            previewPosition="none"
            skinTonePosition="none"
            maxFrequentRows={2}
            perLine={8}
          />
        </div>
      )}

      {/* Total count pill */}
      {totalCount > 0 && variant === "post" && (
        <span className="text-[10px] font-mono text-ivory/20 ml-0.5">
          {totalCount} reaction{totalCount !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}
