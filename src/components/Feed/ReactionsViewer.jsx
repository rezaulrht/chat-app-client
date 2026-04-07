"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import api from "@/app/api/Axios";

export default function ReactionsViewer({
  targetId,
  targetType,
  initialEmoji,
  currentUserId,
  onRemoveReaction,
  onClose,
}) {
  const [reactions, setReactions] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("__all__");

  useEffect(() => {
    const endpoint =
      targetType === "comment"
        ? `/api/feed/comments/${targetId}/reactions`
        : `/api/feed/posts/${targetId}/reactions`;

    api
      .get(endpoint)
      .then((res) => {
        const data = res.data.reactions ?? {};
        setReactions(data);
        setActiveTab(initialEmoji ?? "__all__");
      })
      .catch(() => setReactions({}))
      .finally(() => setLoading(false));
  }, [targetId, targetType, initialEmoji]);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function handleRemove(emoji) {
    // Optimistically remove from local state
    setReactions((prev) => {
      const updated = { ...prev };
      updated[emoji] = (updated[emoji] ?? []).filter((u) => u._id !== currentUserId);
      if (updated[emoji].length === 0) delete updated[emoji];
      return updated;
    });
    onRemoveReaction?.(emoji);
  }

  const emojis = Object.keys(reactions);
  const totalCount = emojis.reduce((sum, e) => sum + (reactions[e]?.length ?? 0), 0);

  const listItems =
    activeTab === "__all__"
      ? emojis.flatMap((e) => (reactions[e] ?? []).map((u) => ({ ...u, emoji: e })))
      : (reactions[activeTab] ?? []).map((u) => ({ ...u, emoji: activeTab }));

  // If active tab was deleted (all its reactions removed), fall back to All
  useEffect(() => {
    if (activeTab !== "__all__" && !reactions[activeTab]) {
      setActiveTab("__all__");
    }
  }, [reactions, activeTab]);

  return createPortal(
    <div
      className="fixed inset-0 z-[400] flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" />

      <div
        className="relative z-10 w-full max-w-sm rounded-2xl bg-deep border border-white/[0.08] shadow-2xl shadow-black/70 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-semibold text-ivory/85 tracking-wide">Reactions</span>
            {!loading && (
              <span className="text-[11px] text-ivory/30 bg-white/[0.05] rounded-full px-2 py-0.5 tabular-nums">
                {totalCount}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-ivory/30 hover:text-ivory/70 hover:bg-white/[0.07] transition-all"
          >
            <X size={15} />
          </button>
        </div>

        {/* Emoji tab strip */}
        <div className="flex items-center gap-1 px-3 pt-3 pb-2 flex-wrap border-b border-white/[0.04]">
          {loading ? (
            <div className="h-8 w-48 bg-white/[0.05] rounded-lg animate-pulse" />
          ) : emojis.length === 0 ? (
            <span className="text-xs text-ivory/30 px-1">No reactions yet</span>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setActiveTab("__all__")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  activeTab === "__all__"
                    ? "bg-white/[0.09] text-ivory/90 ring-1 ring-white/[0.08]"
                    : "text-ivory/40 hover:text-ivory/65 hover:bg-white/[0.05]"
                }`}
              >
                All
                <span className={`tabular-nums text-[10px] ${activeTab === "__all__" ? "text-ivory/50" : "text-ivory/25"}`}>
                  {totalCount}
                </span>
              </button>

              {emojis.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setActiveTab(e)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-150 ${
                    activeTab === e
                      ? "bg-accent/15 ring-1 ring-accent/25 text-ivory/90"
                      : "text-ivory/55 hover:text-ivory/75 hover:bg-white/[0.05]"
                  }`}
                >
                  <span>{e}</span>
                  <span className={`tabular-nums text-[10px] font-mono ${activeTab === e ? "text-ivory/50" : "text-ivory/28"}`}>
                    {reactions[e]?.length ?? 0}
                  </span>
                </button>
              ))}
            </>
          )}
        </div>

        {/* Reactor list */}
        <div className="max-h-72 overflow-y-auto px-2 py-2 space-y-px">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2">
                <div className="w-8 h-8 rounded-full bg-white/[0.06] animate-pulse shrink-0" />
                <div className="flex-1 h-3 w-32 bg-white/[0.05] rounded animate-pulse" />
                <div className="w-5 h-5 bg-white/[0.04] rounded animate-pulse shrink-0" />
              </div>
            ))
          ) : listItems.length === 0 ? (
            <p className="text-center text-xs text-ivory/25 py-8">No reactions yet</p>
          ) : (
            listItems.map((user, idx) => {
              const isMe = user._id === currentUserId;
              return (
                <div
                  key={`${user._id}-${user.emoji}-${idx}`}
                  className={`group flex items-center gap-3 px-3 py-2 rounded-xl transition-colors duration-100 ${
                    isMe ? "bg-accent/5 hover:bg-accent/8" : "hover:bg-white/[0.04]"
                  }`}
                >
                  {/* Avatar */}
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name}
                      width={32}
                      height={32}
                      className="rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs text-accent font-semibold shrink-0">
                      {user.name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                  )}

                  {/* Name */}
                  <span className={`flex-1 text-sm font-medium truncate ${isMe ? "text-ivory/90" : "text-ivory/70"}`}>
                    {user.name}
                    {isMe && <span className="ml-1.5 text-[10px] font-mono text-accent/50">you</span>}
                  </span>

                  {/* Emoji + remove button (own reactions only) */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-lg leading-none">{user.emoji}</span>
                    {isMe && (
                      <button
                        type="button"
                        onClick={() => handleRemove(user.emoji)}
                        title="Remove your reaction"
                        className="w-5 h-5 flex items-center justify-center rounded-md text-ivory/20 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <X size={11} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
