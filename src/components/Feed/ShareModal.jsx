"use client";

import { useState, useEffect } from "react";
import {
  X,
  Search,
  MessageCircle,
  Users,
  Send,
  Loader2,
  Check,
} from "lucide-react";
import Image from "next/image";
import api from "@/app/api/Axios";

/**
 * ShareModal — share a post to a DM or group conversation.
 *
 * @param {object}   post    - post being shared
 * @param {boolean}  open
 * @param {Function} onClose
 */
export default function ShareModal({ post, open, onClose }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load real conversations when modal opens
  useEffect(() => {
    if (!open) return;
    setSelected(null);
    setMessage("");
    setSent(false);
    setError(null);

    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get("/api/chat/conversations");
        setConversations(res.data || []);
      } catch (err) {
        console.error("ShareModal: failed to load conversations", err.message);
        // Preserve any previously loaded list; show error instead of clearing
        setError(
          "Couldn't load conversations. Check your connection and try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open]);

  if (!open) return null;

  // Filter conversations by query
  const filtered = conversations.filter((c) => {
    const name = c.type === "dm" ? c.participant?.name : c.name;
    return name?.toLowerCase().includes(query.toLowerCase());
  });

  // Build post preview text to embed in message
  const buildShareText = () => {
    const postUrl = `${window.location.origin}/app/feed?post=${post?._id}`;
    const title = post?.title ?? post?.content?.slice(0, 80) ?? "Post";
    const author = post?.author?.name ?? "";
    const type = post?.type ?? "post";

    let preview = `📎 *Shared a ${type}*\n`;
    if (title) preview += `**${title}**\n`;
    if (author) preview += `by ${author}\n`;
    preview += postUrl;

    if (message.trim()) {
      return `${message.trim()}\n\n${preview}`;
    }
    return preview;
  };

  const handleSend = async () => {
    if (!selected || sending) return;
    setSending(true);

    try {
      const text = buildShareText();

      // For DM — need receiverId; for group — just conversationId
      const body = {
        conversationId: selected._id,
        text,
      };

      if (selected.type === "dm" && selected.participant?._id) {
        body.receiverId = selected.participant._id;
      }

      await api.post("/api/chat/messages", body);

      setSent(true);
      setTimeout(() => {
        onClose();
        setSent(false);
      }, 1000);
    } catch (err) {
      console.error("ShareModal: failed to send", err.message);
      setError("Failed to send. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleCopyLink = () => {
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

        {/* Search */}
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
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 size={18} className="text-accent/40 animate-spin" />
            </div>
          ) : error ? (
            <p className="text-center text-[12px] font-mono text-red-400/70 py-4 px-2">
              {error}
            </p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-[12px] font-mono text-ivory/20 py-4">
              No conversations found
            </p>
          ) : (
            filtered.map((c) => {
              const name = c.type === "dm" ? c.participant?.name : c.name;
              const avatar = c.type === "dm" ? c.participant?.avatar : c.avatar;

              return (
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
                  {/* Avatar */}
                  <div className="w-8 h-8 shrink-0 rounded-lg overflow-hidden bg-white/[0.06] ring-1 ring-white/[0.08] flex items-center justify-center text-ivory/30">
                    {avatar ? (
                      <Image
                        src={avatar}
                        alt={name}
                        width={32}
                        height={32}
                        className="object-cover w-full h-full"
                        unoptimized
                      />
                    ) : c.type === "group" ? (
                      <Users size={14} />
                    ) : (
                      <MessageCircle size={14} />
                    )}
                  </div>
                  <div>
                    <p className="text-[13px] font-display font-semibold text-ivory/80">
                      {name}
                    </p>
                    <p className="text-[10px] font-mono text-ivory/25 capitalize">
                      {c.type}
                    </p>
                  </div>
                </button>
              );
            })
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
            disabled={!selected || sending || sent}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-mono font-bold bg-accent/15 ring-1 ring-accent/30 text-accent hover:bg-accent/25 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
          >
            {sent ? (
              <>
                <Check size={12} /> Sent!
              </>
            ) : sending ? (
              <>
                <Loader2 size={12} className="animate-spin" /> Sending…
              </>
            ) : (
              <>
                <Send size={12} /> Send
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
