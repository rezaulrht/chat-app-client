"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import data from "@emoji-mart/data";
import { Smile } from "lucide-react";
import ReactionsViewer from "./ReactionsViewer";

// SSR-safe — emoji-mart accesses browser APIs at init
const Picker = dynamic(() => import("@emoji-mart/react"), { ssr: false });

const FIXED_EMOJIS = ["🔥", "💡", "🚀", "❤️", "🍺", "👏"];

function EmojiBtn({ emoji, reactions, currentUserId, onReact }) {
  const usersList = Array.isArray(reactions[emoji]) ? reactions[emoji] : [];
  const reacted = usersList.includes(currentUserId);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onReact?.(emoji);
      }}
      title={emoji}
      className={`flex items-center justify-center w-7 h-6 rounded-lg text-sm transition-all duration-150 select-none
        ${
          reacted
            ? "bg-accent/15 ring-1 ring-accent/30 text-accent scale-105"
            : "bg-white/[0.04] ring-1 ring-white/[0.06] text-ivory/50 hover:bg-white/[0.08] hover:text-ivory/80"
        }`}
    >
      {emoji}
    </button>
  );
}

/**
 * ReactionBar — 6 fixed emoji buttons + custom picker + who-reacted viewer.
 *
 * @param {object}            reactions    - { "🔥": ["userId1"], ... }
 * @param {string}            currentUserId
 * @param {Function}          onReact      - (emoji: string) => void
 * @param {"post"|"card"|"comment"} variant
 * @param {string}            targetId     - post._id or comment._id (for viewer)
 * @param {"post"|"comment"}  targetType   - used by ReactionsViewer endpoint
 */
export default function ReactionBar({
  reactions = {},
  currentUserId = "",
  onReact,
  variant = "post",
  targetId,
  targetType = "post",
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
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

  // Extra emojis that users picked via the picker (not in FIXED_EMOJIS)
  const extraEmojis = Object.keys(reactions).filter(
    (e) =>
      !FIXED_EMOJIS.includes(e) &&
      Array.isArray(reactions[e]) &&
      reactions[e].length > 0
  );

  const totalCount = Object.values(reactions).reduce(
    (sum, users) => sum + (Array.isArray(users) ? users.length : 0),
    0
  );

  function handlePick(emoji) {
    setPickerOpen(false);
    onReact?.(emoji.native);
  }

  return (
    <div className="relative flex items-center gap-1.5 flex-wrap">
      {/* Fixed emoji buttons */}
      {FIXED_EMOJIS.map((emoji) => (
        <EmojiBtn
          key={emoji}
          emoji={emoji}
          reactions={reactions}
          currentUserId={currentUserId}
          onReact={onReact}
        />
      ))}

      {/* Extra emojis added via picker */}
      {extraEmojis.map((emoji) => (
        <EmojiBtn
          key={emoji}
          emoji={emoji}
          reactions={reactions}
          currentUserId={currentUserId}
          onReact={onReact}
        />
      ))}

      {/* Custom picker button */}
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

      {/* Reaction count — only shown when targetId is available; click to toggle viewer */}
      {totalCount > 0 && targetId && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setViewerOpen((v) => !v);
          }}
          className="text-[10px] font-mono text-ivory/30 hover:text-ivory/60 ml-0.5 transition-colors"
        >
          {totalCount} reaction{totalCount !== 1 ? "s" : ""}
        </button>
      )}

      {/* Who-reacted popup */}
      {viewerOpen && targetId && (
        <ReactionsViewer
          targetId={targetId}
          targetType={targetType}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </div>
  );
}
