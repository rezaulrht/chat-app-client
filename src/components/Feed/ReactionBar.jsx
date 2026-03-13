"use client";

import { useState, useRef } from "react";
import { Smile } from "lucide-react";

const QUICK_REACTIONS = [
  { emoji: "🔥", label: "fire" },
  { emoji: "💡", label: "idea" },
  { emoji: "🚀", label: "rocket" },
  { emoji: "❤️", label: "heart" },
  { emoji: "👏", label: "clap" },
];

/**
 * ReactionBar — quick reaction row with counts and a "+" for more.
 *
 * @param {object}  reactions    - { "🔥": ["userId1","userId2"], ... }
 * @param {string}  currentUserId
 * @param {Function} onReact     - (emoji) => void
 * @param {"post"|"comment"} variant
 */
export default function ReactionBar({
  reactions = {},
  currentUserId = "",
  onReact,
  variant = "post",
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const totalCount = Object.values(reactions).reduce(
    (s, arr) => s + arr.length,
    0,
  );

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {/* Quick reaction buttons */}
      {QUICK_REACTIONS.map(({ emoji, label }) => {
        const users = reactions[emoji] ?? [];
        const count = users.length;
        const reacted = users.includes(currentUserId);

        return (
          <button
            key={label}
            type="button"
            onClick={() => onReact?.(emoji)}
            title={`${label} (${count})`}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[12px] font-mono transition-all duration-150 select-none
              ${
                reacted
                  ? "bg-accent/15 ring-1 ring-accent/30 text-accent scale-105"
                  : "bg-white/[0.04] ring-1 ring-white/[0.06] text-ivory/50 hover:bg-white/[0.08] hover:text-ivory/80"
              }
            `}
          >
            <span>{emoji}</span>
            {count > 0 && <span className="leading-none">{count}</span>}
          </button>
        );
      })}

      {/* "+" more picker hint */}
      <button
        type="button"
        onClick={() => setPickerOpen((v) => !v)}
        className="flex items-center justify-center w-7 h-6 rounded-lg bg-white/[0.04] ring-1 ring-white/[0.06] text-ivory/30 hover:text-ivory/60 hover:bg-white/[0.08] transition-all duration-150"
        title="More reactions"
      >
        <Smile size={12} />
      </button>

      {/* Total count pill (design-only) */}
      {totalCount > 0 && variant === "post" && (
        <span className="text-[10px] font-mono text-ivory/20 ml-0.5">
          {totalCount} reaction{totalCount !== 1 ? "s" : ""}
        </span>
      )}

      {/* TODO: mount real emoji picker when pickerOpen=true */}
    </div>
  );
}
