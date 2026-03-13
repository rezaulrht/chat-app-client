"use client";

import { useState } from "react";
import { X, Search, MessageCircle, Users, Send } from "lucide-react";

// ── Mock conversation list used in design phase ───────────────────────────────
const MOCK_CONVERSATIONS = [
  { _id: "c1", type: "dm", name: "Alex Kim", avatar: null },
  { _id: "c2", type: "group", name: "Dev Team", avatar: null },
  { _id: "c3", type: "dm", name: "Maria Santos", avatar: null },
  { _id: "c4", type: "group", name: "Design Sync", avatar: null },
];

/**
 * ShareModal — share a post to a DM or group.
 *
 * @param {object}   post    - post being shared
 * @param {boolean}  open
 * @param {Function} onClose
 * @param {Function} onShare  - (conversationId, message?) => void
 */
export default function ShareModal({ post, open, onClose, onShare }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const filtered = MOCK_CONVERSATIONS.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()),
  );

  const handleSend = () => {
    if (!selected) return;
    onShare?.(selected._id, message);
    onClose();
  };

  const handleCopyLink = () => {
    // TODO: construct real post URL
    const url = `${window.location.origin}/app/feed?post=${post?._id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm glass-card rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <h2 className="font-display font-bold text-ivory text-sm">
            Share Post
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-xl text-ivory/30 hover:text-ivory hover:bg-white/[0.08] transition-all"
          >
            <X size={14} />
          </button>
        </div>

        {/* Post preview */}
        {post && (
          <div className="mx-5 mt-4 p-3 rounded-xl ring-1 ring-white/[0.07] bg-white/[0.03] flex flex-col gap-1">
            <p className="text-[11px] font-mono text-ivory/30 uppercase tracking-wider">
              {post.type}
            </p>
            <p className="text-[13px] font-display font-semibold text-ivory/80 line-clamp-2">
              {post.title ?? post.content?.slice(0, 80) ?? "Post"}
            </p>
            <p className="text-[10px] font-mono text-accent/50">
              by {post.author?.name}
            </p>
          </div>
        )}

        {/* Search conversations */}
        <div className="px-5 pt-4">
          <div className="flex items-center gap-2 bg-white/[0.04] ring-1 ring-white/[0.07] rounded-xl px-3 py-2">
            <Search size={13} className="text-ivory/25 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search conversations…"
              className="flex-1 bg-transparent text-[13px] text-ivory/80 placeholder:text-ivory/20 outline-none font-sans"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="px-5 py-3 max-h-44 overflow-y-auto scrollbar-hide flex flex-col gap-1">
          {filtered.map((c) => (
            <button
              key={c._id}
              type="button"
              onClick={() => setSelected(c)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-left ${
                selected?._id === c._id
                  ? "bg-accent/12 ring-1 ring-accent/25"
                  : "hover:bg-white/[0.06]"
              }`}
            >
              {/* Avatar placeholder */}
              <div className="w-8 h-8 shrink-0 rounded-lg bg-white/[0.06] ring-1 ring-white/[0.08] flex items-center justify-center text-ivory/30">
                {c.type === "group" ? (
                  <Users size={14} />
                ) : (
                  <MessageCircle size={14} />
                )}
              </div>
              <div>
                <p className="text-[13px] font-display font-semibold text-ivory/80">
                  {c.name}
                </p>
                <p className="text-[10px] font-mono text-ivory/25 capitalize">
                  {c.type}
                </p>
              </div>
            </button>
          ))}

          {filtered.length === 0 && (
            <p className="text-center text-[12px] font-mono text-ivory/20 py-4">
              No conversations found
            </p>
          )}
        </div>

        {/* Optional message */}
        {selected && (
          <div className="px-5 pb-2">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a message… (optional)"
              rows={2}
              className="w-full bg-white/[0.04] ring-1 ring-white/[0.07] focus:ring-accent/30 rounded-xl px-3 py-2 text-[13px] text-ivory/80 placeholder:text-ivory/20 font-sans resize-none outline-none transition-all"
            />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={handleCopyLink}
            className="text-[11px] font-mono text-ivory/30 hover:text-ivory/60 transition-colors"
          >
            {copied ? "Link copied!" : "Copy link"}
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={!selected}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-mono font-bold bg-accent/15 ring-1 ring-accent/30 text-accent hover:bg-accent/25 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
          >
            <Send size={12} /> Send
          </button>
        </div>
      </div>
    </div>
  );
}
