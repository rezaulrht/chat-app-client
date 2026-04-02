"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import api from "@/app/api/Axios";

/**
 * ReactionsViewer — popup showing who reacted with what emoji.
 * Fetches data on mount (on-demand, not on every post render).
 *
 * @param {string}           targetId   - post._id or comment._id
 * @param {"post"|"comment"} targetType
 * @param {Function}         onClose
 */
export default function ReactionsViewer({ targetId, targetType, onClose }) {
  const [reactions, setReactions] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(null);
  const ref = useRef(null);

  // Fetch on open
  useEffect(() => {
    const endpoint =
      targetType === "comment"
        ? `/api/feed/comments/${targetId}/reactions`
        : `/api/feed/posts/${targetId}/reactions`;

    api
      .get(endpoint)
      .then((res) => {
        setReactions(res.data.reactions ?? {});
        const firstEmoji = Object.keys(res.data.reactions ?? {})[0] ?? null;
        setActiveTab(firstEmoji);
      })
      .catch(() => {
        setReactions({});
      })
      .finally(() => setLoading(false));
  }, [targetId, targetType]);

  // Close on outside click or Escape
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  const emojis = Object.keys(reactions);
  const viewers = activeTab ? (reactions[activeTab] ?? []) : [];

  return (
    <div
      ref={ref}
      className="absolute bottom-10 left-0 z-50 w-64 rounded-xl bg-deep border border-white/[0.08] shadow-xl overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Emoji tab row */}
      <div className="flex items-center gap-1 px-3 pt-3 pb-2 border-b border-white/[0.06] flex-wrap">
        {loading ? (
          <div className="h-4 w-32 bg-white/[0.06] rounded animate-pulse" />
        ) : emojis.length === 0 ? (
          <span className="text-xs text-ivory/30">No reactions yet</span>
        ) : (
          emojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setActiveTab(emoji)}
              className={`text-sm px-1.5 py-0.5 rounded-md transition-all ${
                activeTab === emoji
                  ? "bg-accent/15 ring-1 ring-accent/30"
                  : "hover:bg-white/[0.06]"
              }`}
            >
              {emoji}
              <span className="ml-1 text-[10px] text-ivory/40">
                {reactions[emoji]?.length ?? 0}
              </span>
            </button>
          ))
        )}
      </div>

      {/* Reactor list */}
      <div className="max-h-48 overflow-y-auto px-2 py-2 space-y-1">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 px-2 py-1">
              <div className="w-6 h-6 rounded-full bg-white/[0.06] animate-pulse shrink-0" />
              <div className="h-3 w-24 bg-white/[0.06] rounded animate-pulse" />
            </div>
          ))
        ) : (
          viewers.map((user) => (
            <div
              key={user._id}
              className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/[0.04]"
            >
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name}
                  width={24}
                  height={24}
                  className="rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-[10px] text-accent font-medium shrink-0">
                  {user.name?.[0]?.toUpperCase() ?? "?"}
                </div>
              )}
              <span className="text-xs text-ivory/70 truncate">{user.name}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
