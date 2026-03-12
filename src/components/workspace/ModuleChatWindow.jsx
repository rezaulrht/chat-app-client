"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  Hash,
  Megaphone,
  Smile,
  Send,
  Reply,
  Pencil,
  Trash2,
  ChevronDown,
  Loader2,
  Menu,
  X,
  Plus,
} from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { useModule } from "@/hooks/useModule";
import { useWorkspace } from "@/hooks/useWorkspace";
import { EMOJI_MAP } from "@/utils/emojis";
import { getGroupInitials, getGroupAvatarColor } from "@/utils/groupAvatar";
import toast from "react-hot-toast";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });
const GifPicker = dynamic(
  () =>
    import("gif-picker-react-klipy").then((m) => m.GifPicker || m.default || m),
  { ssr: false },
);

const getDateLabel = (dateStr) => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const isSame = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (isSame(date, today)) return "Today";
  if (isSame(date, yesterday)) return "Yesterday";
  return date.toLocaleDateString([], {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const toDateKey = (d) => {
  const date = new Date(d);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

export default function ModuleChatWindow({
  moduleId,
  workspaceId,
  onToggleSidebar,
}) {
  const { user } = useAuth();
  const { workspaces, modulesCache } = useWorkspace();
  const {
    messages,
    loading,
    hasMore,
    loadMore,
    reactions,
    typingUsers,
    sendMessage,
    sendTyping,
    reactToMessage,
    editMessage,
    deleteMessage,
  } = useModule();

  const workspace = workspaces.find((w) => w._id === workspaceId);
  const modules = modulesCache[workspaceId] || [];
  const activeModule = modules.find((m) => m._id === moduleId);
  const isAnnouncement = activeModule?.type === "announcement";
  const isAdminOrOwner =
    workspace?.myRole === "owner" || workspace?.myRole === "admin";

  // ── Local UI state ────────────────────────────────────────────────────────
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [reactionPickerMsgId, setReactionPickerMsgId] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [longPressedMsgId, setLongPressedMsgId] = useState(null);

  const bottomRef = useRef(null);
  const reactionPickerRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const gifPickerRef = useRef(null);
  const longPressTimer = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Reset input state when module changes
  useEffect(() => {
    setText("");
    setReplyTo(null);
    setEditingId(null);
    setSuggestions([]);
    setReactionPickerMsgId(null);
    setShowEmojiPicker(false);
    setShowGifPicker(false);
  }, [moduleId]);

  // Close pickers on outside click
  useEffect(() => {
    const onDown = (e) => {
      if (
        reactionPickerRef.current &&
        !reactionPickerRef.current.contains(e.target)
      ) {
        setReactionPickerMsgId(null);
      }
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target)
      ) {
        setShowEmojiPicker(false);
      }
      if (gifPickerRef.current && !gifPickerRef.current.contains(e.target)) {
        setShowGifPicker(false);
      }
      if (longPressedMsgId) setLongPressedMsgId(null);
    };
    if (
      reactionPickerMsgId ||
      showEmojiPicker ||
      showGifPicker ||
      longPressedMsgId
    ) {
      document.addEventListener("mousedown", onDown);
    }
    return () => document.removeEventListener("mousedown", onDown);
  }, [reactionPickerMsgId, showEmojiPicker, showGifPicker, longPressedMsgId]);

  // ── Long-press (mobile) ───────────────────────────────────────────────────
  const handleTouchStart = useCallback((msgId) => {
    longPressTimer.current = setTimeout(() => {
      setLongPressedMsgId(msgId);
      if (navigator.vibrate) navigator.vibrate(30);
    }, 500);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  }, []);

  // ── Text change + typing + emoji autocomplete ─────────────────────────────
  const handleTextChange = (e) => {
    let val = e.target.value;
    const lastWord = val.split(" ").pop();
    if (EMOJI_MAP[lastWord]) val = val.replace(lastWord, EMOJI_MAP[lastWord]);
    setText(val);
    sendTyping(val.trim().length > 0);

    const match = val.match(/:([a-zA-Z0-9_]*)$/);
    if (match) {
      const q = match[1].toLowerCase();
      const filtered = Object.entries(EMOJI_MAP)
        .filter(([code]) => {
          const name = code.slice(1, -1);
          return (
            name.startsWith(q) || name.split("_").some((w) => w.startsWith(q))
          );
        })
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(0, 8);
      setSuggestions(filtered);
      setSuggestionIndex(0);
    } else {
      setSuggestions([]);
    }
  };

  const insertEmoji = (emoji) => {
    setText((prev) => {
      const match = prev.match(/:[a-zA-Z0-9_]*$/);
      if (!match) return prev + emoji;
      return prev.slice(0, match.index) + emoji;
    });
    setSuggestions([]);
  };

  const handleKeyDown = (e) => {
    if (suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSuggestionIndex((p) => (p + 1) % suggestions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSuggestionIndex(
          (p) => (p - 1 + suggestions.length) % suggestions.length,
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        insertEmoji(suggestions[suggestionIndex][1]);
      } else if (e.key === "Escape") {
        setSuggestions([]);
      }
    }
  };

  // ── Send ──────────────────────────────────────────────────────────────────
  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    if (isAnnouncement && !isAdminOrOwner) return;
    sendMessage({ text: text.trim(), replyTo });
    setText("");
    setReplyTo(null);
    setSuggestions([]);
    sendTyping(false);
  };

  // ── GIF ───────────────────────────────────────────────────────────────────
  const handleGifClick = (gif) => {
    const gifUrl = gif.url || gif.previewUrl;
    sendMessage({ gifUrl });
    setShowGifPicker(false);
  };

  // ── Edit ──────────────────────────────────────────────────────────────────
  const handleEditSave = () => {
    if (!editedText.trim()) return;
    editMessage(editingId, editedText.trim());
    setEditingId(null);
    setEditedText("");
  };

  // ── Delete (always for everyone in modules) ───────────────────────────────
  const handleDelete = (msgId) => {
    deleteMessage(msgId, true);
  };

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!activeModule) {
    return (
      <div className="flex-1 bg-obsidian flex flex-col items-center justify-center gap-5 p-6">
        <div className="w-16 h-16 rounded-3xl bg-accent/10 border border-accent/20 flex items-center justify-center">
          <Hash size={28} className="text-accent/40" />
        </div>
        <div className="text-center space-y-1.5">
          <h2 className="text-ivory font-display font-bold">Select a module</h2>
          <p className="text-ivory/30 text-sm max-w-55">
            Choose a module from the sidebar to start chatting
          </p>
        </div>
        <button
          onClick={onToggleSidebar}
          className="md:hidden px-4 py-2.5 bg-accent/10 hover:bg-accent/20 border border-accent/20 rounded-xl text-accent text-sm font-bold transition-all"
        >
          Open Modules
        </button>
      </div>
    );
  }

  const ModuleIcon = isAnnouncement ? Megaphone : Hash;
  const canType = !isAnnouncement || isAdminOrOwner;

  return (
    <main className="flex-1 min-w-0 flex flex-col bg-obsidian relative h-full">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="h-14 border-b border-white/6 flex items-center justify-between px-4 bg-obsidian/80 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onToggleSidebar}
            className="md:hidden w-8 h-8 rounded-xl bg-white/4 flex items-center justify-center text-ivory/30 hover:text-ivory transition-colors"
          >
            <Menu size={18} />
          </button>
          <ModuleIcon size={17} className="text-accent/60 shrink-0" />
          <div>
            <h2 className="text-ivory font-display font-bold text-[14px] leading-tight">
              {activeModule.name}
            </h2>
            <p className="text-ivory/25 text-[10px] font-mono">
              {workspace?.name}
              {isAnnouncement && " · Announcement"}
            </p>
          </div>
        </div>
      </header>

      {/* ── Message List ──────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-5 flex flex-col gap-3 scrollbar-hide">
        {/* Load more button */}
        {hasMore && (
          <button
            onClick={loadMore}
            disabled={loading}
            className="self-center px-4 py-1.5 rounded-full text-[11px] font-mono text-ivory/30 hover:text-accent border border-white/6 hover:border-accent/30 transition-all flex items-center gap-1.5"
          >
            {loading ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <ChevronDown size={12} />
            )}
            Load earlier messages
          </button>
        )}

        {loading && messages.length === 0 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Loader2 size={16} className="text-accent/40 animate-spin" />
            <p className="text-ivory/20 text-xs font-mono">
              Loading messages...
            </p>
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 gap-3">
            <div className="w-12 h-12 rounded-3xl bg-accent/10 border border-accent/15 flex items-center justify-center">
              <ModuleIcon size={22} className="text-accent/40" />
            </div>
            <p className="text-ivory/20 text-xs font-mono">
              {isAnnouncement
                ? "No announcements yet."
                : "Be the first to say something!"}
            </p>
          </div>
        )}

        {/* Date-separated message list */}
        {messages.map((msg, index) => {
          const isMe = msg.sender?._id === user?._id;
          const isGif = !!msg.gifUrl;
          const currentKey = toDateKey(msg.createdAt);
          const prevKey =
            index > 0 ? toDateKey(messages[index - 1].createdAt) : null;
          const showDate = currentKey !== prevKey;

          return (
            <React.Fragment key={msg._id}>
              {showDate && (
                <div className="flex items-center gap-3 my-2">
                  <div className="flex-1 h-px bg-white/5" />
                  <span className="text-[10px] font-mono text-ivory/20 px-3 py-1 rounded-full bg-white/4 border border-white/6 shrink-0">
                    {getDateLabel(msg.createdAt)}
                  </span>
                  <div className="flex-1 h-px bg-white/5" />
                </div>
              )}

              <div
                className="flex items-start gap-2.5 group"
                onTouchStart={() => handleTouchStart(msg._id)}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchEnd}
              >
                {/* Sender avatar — always shown in modules */}
                <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 mt-0.5 ring-1 ring-white/6">
                  <Image
                    src={
                      msg.sender?.avatar ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender?.name || "user"}`
                    }
                    width={32}
                    height={32}
                    className="rounded-xl"
                    alt={msg.sender?.name || ""}
                    unoptimized
                  />
                </div>

                <div className="flex-1 min-w-0">
                  {/* Sender name + timestamp */}
                  <div className="flex items-baseline gap-2 mb-1">
                    <span
                      className={`text-[13px] font-display font-bold leading-none ${
                        isMe ? "text-accent/80" : "text-ivory/70"
                      }`}
                    >
                      {isMe ? "You" : msg.sender?.name || "Member"}
                    </span>
                    <span className="text-[10px] font-mono text-ivory/20">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {msg.isEdited && (
                      <span className="text-[9px] font-mono text-ivory/15">
                        (edited)
                      </span>
                    )}
                  </div>

                  {/* Message bubble */}
                  <div className="relative group/bubble">
                    {/* Action toolbar (hover / long-press) */}
                    {!msg.isOptimistic && !msg.isDeleted && (
                      <div
                        className={`absolute -top-7 left-0 items-center gap-0.5 bg-deep border border-white/6 rounded-lg p-0.5 shadow-xl z-30 ${
                          longPressedMsgId === msg._id
                            ? "flex"
                            : "hidden group-hover/bubble:flex"
                        }`}
                      >
                        {/* Quick reactions */}
                        {["👍", "❤️", "😂", "😮", "😢"].map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              reactToMessage(msg._id, emoji);
                              setLongPressedMsgId(null);
                            }}
                            className={`p-1.5 rounded-md text-sm transition-all hover:bg-white/6 hover:scale-125 ${
                              reactions[msg._id]?.[emoji]?.includes(user?._id)
                                ? "bg-accent/20"
                                : ""
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                        <div className="w-px h-5 bg-white/6 mx-0.5" />
                        {/* Full emoji picker trigger */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setReactionPickerMsgId(
                              reactionPickerMsgId === msg._id ? null : msg._id,
                            );
                            setLongPressedMsgId(null);
                          }}
                          className="p-1.5 rounded-md text-ivory/40 hover:text-accent hover:bg-white/6 transition-all"
                        >
                          <Smile size={14} />
                        </button>
                        {/* Reply */}
                        <button
                          type="button"
                          onClick={() => {
                            setReplyTo(msg);
                            setLongPressedMsgId(null);
                          }}
                          className="p-1.5 rounded-md text-ivory/40 hover:text-accent hover:bg-white/6 transition-all"
                        >
                          <Reply size={14} />
                        </button>
                        {/* Edit / Delete (own messages only) */}
                        {isMe && (
                          <>
                            <div className="w-px h-5 bg-white/6 mx-0.5" />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingId(msg._id);
                                setEditedText(msg.text || "");
                                setLongPressedMsgId(null);
                              }}
                              className="p-1.5 rounded-md text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 transition-all"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(msg._id);
                                setLongPressedMsgId(null);
                              }}
                              className="p-1.5 rounded-md text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    {/* Full emoji reaction picker */}
                    {reactionPickerMsgId === msg._id && (
                      <div
                        ref={reactionPickerRef}
                        className="absolute top-6 left-0 z-40"
                      >
                        <EmojiPicker
                          onEmojiClick={(emojiData) => {
                            reactToMessage(msg._id, emojiData.emoji);
                            setReactionPickerMsgId(null);
                          }}
                          theme="dark"
                          height={340}
                          width={300}
                        />
                      </div>
                    )}

                    {/* Message content */}
                    {editingId === msg._id ? (
                      <div className="flex flex-col gap-2 bg-slate-surface rounded-2xl p-3 border border-accent/40 max-w-lg">
                        <span className="text-[10px] font-mono font-bold text-accent uppercase tracking-wider">
                          Editing
                        </span>
                        <textarea
                          className="w-full min-h-16 bg-deep text-ivory text-[13px] px-3 py-2 rounded-xl border border-white/8 focus:outline-none focus:border-accent resize-none scrollbar-hide"
                          value={editedText}
                          onChange={(e) => setEditedText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleEditSave();
                            }
                            if (e.key === "Escape") {
                              setEditingId(null);
                              setEditedText("");
                            }
                          }}
                          autoFocus
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditedText("");
                            }}
                            className="px-3 py-1.5 text-[11px] font-mono text-ivory/30 hover:text-ivory transition-colors rounded-lg hover:bg-white/4"
                          >
                            Cancel (Esc)
                          </button>
                          <button
                            onClick={handleEditSave}
                            className="px-3 py-1.5 text-[11px] font-mono text-accent bg-accent/10 hover:bg-accent/20 rounded-lg border border-accent/20 transition-all"
                          >
                            Save (Enter)
                          </button>
                        </div>
                      </div>
                    ) : msg.isDeleted ? (
                      <div className="flex items-center gap-2 p-2 px-3 bg-white/2 rounded-2xl border border-white/5 opacity-50 select-none w-fit">
                        <Trash2 className="w-3 h-3 text-ivory/30" />
                        <p className="italic text-ivory/40 text-[11px] font-mono leading-none">
                          Deleted
                        </p>
                      </div>
                    ) : isGif ? (
                      <div className="rounded-2xl overflow-hidden max-w-65">
                        <img
                          src={msg.gifUrl}
                          alt="gif"
                          className="w-full h-auto rounded-2xl"
                        />
                      </div>
                    ) : (
                      <div
                        className={`inline-block px-3.5 py-2.5 rounded-2xl rounded-tl-none text-[13px] leading-relaxed max-w-prose ${
                          isMe
                            ? "bg-accent/15 text-ivory border border-accent/20"
                            : "bg-white/4 text-ivory/80 border border-white/6"
                        } ${msg.isOptimistic ? "opacity-60" : ""}`}
                      >
                        {msg.replyTo && (
                          <div className="mb-2 p-2 bg-black/20 rounded-lg border-l-2 border-accent/50 text-[11px] opacity-80 line-clamp-2">
                            <p className="font-bold mb-0.5 text-accent/70">
                              {msg.replyTo.sender?.name || "Member"}
                            </p>
                            {msg.replyTo.text}
                          </div>
                        )}
                        {msg.text}
                      </div>
                    )}

                    {/* Reaction pills */}
                    {reactions[msg._id] &&
                      Object.entries(reactions[msg._id]).some(
                        ([, users]) => users.length > 0,
                      ) && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {Object.entries(reactions[msg._id])
                            .filter(([, users]) => users.length > 0)
                            .map(([emoji, users]) => (
                              <button
                                key={emoji}
                                onClick={() => reactToMessage(msg._id, emoji)}
                                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border transition-all ${
                                  users.some(u => String(u) === String(user?._id))
                                    ? "bg-accent/20 border-accent/40 text-accent"
                                    : "bg-white/4 border-white/6 text-ivory/80 hover:bg-white/8"
                                }`}
                              >
                                <span className="text-[12px] leading-none">{emoji}</span>
                                <span className="text-[10px] font-bold opacity-40 leading-none">
                                  {users.length}
                                </span>
                              </button>
                            ))}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 px-1">
            <div className="flex gap-0.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-accent/50 animate-bounce"
                  style={{ animationDelay: `${i * 120}ms` }}
                />
              ))}
            </div>
            <span className="text-[11px] font-mono text-ivory/25">
              {typingUsers.length === 1
                ? `${typingUsers[0].name} is typing...`
                : `${typingUsers.map((u) => u.name).join(", ")} are typing...`}
            </span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Reply Banner ──────────────────────────────────────────────────────── */}
      {replyTo && (
        <div className="mx-4 mb-1 px-3 py-2 bg-white/3 border border-white/6 rounded-xl flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-mono text-accent/70 font-bold mb-0.5">
              Replying to {replyTo.sender?.name || "Member"}
            </p>
            <p className="text-ivory/30 text-[11px] truncate">{replyTo.text}</p>
          </div>
          <button
            onClick={() => setReplyTo(null)}
            className="w-6 h-6 rounded-lg flex items-center justify-center text-ivory/20 hover:text-ivory/50 hover:bg-white/6 shrink-0 transition-all"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* ── Input Area ────────────────────────────────────────────────────────── */}
      {canType ? (
        <form
          onSubmit={handleSend}
          className="p-4 relative z-20 bg-obsidian/80 backdrop-blur-sm border-t border-white/5"
        >
          {/* Emoji autocomplete suggestions */}
          {suggestions.length > 0 && (
            <div className="absolute bottom-full left-2 sm:left-10 bg-deep/95 backdrop-blur-md border border-white/6 rounded-xl p-1 shadow-2xl z-50 min-w-37.5 max-w-[calc(100vw-2rem)] mb-2">
              {suggestions.map(([code, emoji], i) => (
                <div
                  key={code}
                  onClick={() => insertEmoji(emoji)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    i === suggestionIndex
                      ? "bg-accent/20 text-accent"
                      : "hover:bg-white/6 text-ivory/40"
                  }`}
                >
                  <span className="text-lg">{emoji}</span>
                  <span className="text-xs font-mono">{code}</span>
                </div>
              ))}
            </div>
          )}

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div
              ref={emojiPickerRef}
              className="absolute bottom-20 right-0 sm:right-4 left-0 sm:left-auto z-50 shadow-2xl mx-2 sm:mx-0"
            >
              <EmojiPicker
                onEmojiClick={(data) => {
                  setText((p) => p + data.emoji);
                  setShowEmojiPicker(false);
                }}
                theme="dark"
                emojiStyle="native"
                width={350}
                height={380}
              />
            </div>
          )}

          {/* GIF Picker */}
          {showGifPicker && (
            <div
              ref={gifPickerRef}
              className="absolute bottom-20 right-0 sm:right-4 left-0 sm:left-auto z-50 shadow-2xl rounded-2xl overflow-hidden border border-white/6 mx-2 sm:mx-0"
            >
              <GifPicker
                onGifClick={handleGifClick}
                klipyApiKey={process.env.NEXT_PUBLIC_KLIPY_API_KEY}
                theme="dark"
                width={380}
                height={400}
              />
            </div>
          )}

          <div className="bg-slate-surface rounded-2xl flex items-center flex-wrap p-2 gap-1 border border-white/5 focus-within:border-accent/50 transition-all shadow-inner">
            {/* Using Plus icon for consistency with main chat even if we don't have extra tools yet */}
            <button
              type="button"
              onClick={() => toast("Coming soon", { icon: "🔜" })}
              className="w-9 h-9 flex items-center justify-center text-ivory/30 hover:text-accent/50 transition-colors cursor-not-allowed"
              title="Coming soon"
              aria-disabled="true"
            >
              <Plus size={20} />
            </button>

            <textarea
              className="flex-1 min-w-0 bg-transparent outline-none text-sm text-ivory/80 px-3 placeholder:text-ivory/20 resize-none py-2 scrollbar-hide max-h-32"
              placeholder={
                isAnnouncement
                  ? `Post an announcement in #${activeModule.name}...`
                  : `Message #${activeModule.name}`
              }
              value={text}
              onChange={handleTextChange}
              onKeyDown={(e) => {
                handleKeyDown(e);
                if (e.key === "Enter" && !e.shiftKey && !suggestions.length) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              rows={1}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height =
                  Math.min(e.target.scrollHeight, 128) + "px";
              }}
            />

            <button
              type="button"
              onClick={() => {
                setShowGifPicker((v) => !v);
                setShowEmojiPicker(false);
              }}
              className={`hidden sm:inline-flex px-2 py-1 mx-1 text-[10px] font-black rounded-md border transition-all ${
                showGifPicker
                  ? "bg-accent/20 border-accent/40 text-accent"
                  : "bg-white/4 border-white/10 text-ivory/30 hover:text-ivory/60"
              }`}
            >
              GIF
            </button>

            <button
              type="button"
              onClick={() => {
                setShowEmojiPicker((v) => !v);
                setShowGifPicker(false);
              }}
              className={`w-9 h-9 flex items-center justify-center transition-all ${
                showEmojiPicker
                  ? "text-accent"
                  : "text-ivory/30 hover:text-ivory/60"
              }`}
              title="Emoji"
            >
              <Smile size={20} />
            </button>

            <button
              type="submit"
              disabled={!text.trim()}
              className={`w-9 h-9 flex items-center justify-center rounded-xl ml-1 transition-all active:scale-95 shadow-lg ${
                !text.trim()
                  ? "bg-slate-700 text-ivory/40 cursor-not-allowed"
                  : "bg-accent hover:bg-accent/90 text-black shadow-accent/20"
              }`}
            >
              <Send size={18} />
            </button>

            {/* Mobile-only expanded toolbar row */}
            <div className="sm:hidden w-full flex items-center gap-1 pt-1 border-t border-white/5 mt-1">
              <button
                type="button"
                onClick={() => {
                  setShowGifPicker(!showGifPicker);
                  setShowEmojiPicker(false);
                }}
                className={`px-2 py-1 text-[10px] font-black rounded-md border transition-all ${
                  showGifPicker
                    ? "bg-accent/20 border-accent/40 text-accent"
                    : "bg-white/4 border-white/10 text-ivory/30 hover:text-ivory/60"
                }`}
              >
                GIF
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mx-3 mb-3 px-4 py-3 bg-white/3 border border-white/6 rounded-2xl text-center">
          <p className="text-ivory/20 text-[12px] font-mono">
            Only admins and owners can post in announcement modules
          </p>
        </div>
      )}
    </main>
  );
}
