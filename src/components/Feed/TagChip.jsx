"use client";

import Link from "next/link";

/**
 * TagChip — a clickable tag badge that filters the feed.
 * @param {string}   tag
 * @param {boolean}  followed    - highlight when user follows this tag
 * @param {boolean}  interactive - show follow/unfollow button
 * @param {Function} onClick     - override href with click handler
 */
export default function TagChip({ tag, followed = false, interactive = false, onClick }) {
  const base =
    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold transition-all duration-200 cursor-pointer select-none";

  const style = followed
    ? "bg-accent/12 ring-1 ring-accent/30 text-accent hover:bg-accent/18"
    : "bg-white/[0.05] ring-1 ring-white/[0.07] text-ivory/50 hover:text-ivory/80 hover:bg-white/[0.08]";

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${base} ${style}`}>
        <span className="opacity-60">#</span>
        {tag}
      </button>
    );
  }

  return (
    <Link href={`/app/feed?tag=${encodeURIComponent(tag)}`} className={`${base} ${style}`}>
      <span className="opacity-60">#</span>
      {tag}
    </Link>
  );
}
