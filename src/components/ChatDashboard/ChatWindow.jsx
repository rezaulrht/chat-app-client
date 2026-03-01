"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Phone, Video, Info, Plus, Smile, Send, X, Reply } from "lucide-react";
import api from "@/app/api/Axios";
import { useSocket } from "@/hooks/useSocket";
import useAuth from "@/hooks/useAuth";
import { EMOJI_MAP } from "@/utils/emojis";
import { formatLastSeen } from "@/utils/formatLastSeen";

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
  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";
  return date.toLocaleDateString([], {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const toDateKey = (dateStr) => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

export default function ChatWindow({ conversation, onMessageSent, onMessagesSeen }) {
  const { socket, onlineUsers, typingUsers } = useSocket() || {};
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [reactions, setReactions] = useState({});
  const [reactionPickerMsgId, setReactionPickerMsgId] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionIndex, setSuggestionIndex] = useState(0);

  const bottomRef = useRef(null);
  const reactionPickerRef = useRef(null);
  const inputEmojiPickerRef = useRef(null);
  const gifPickerRef = useRef(null);
  const seenInitializedConversationRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        reactionPickerRef.current &&
        !reactionPickerRef.current.contains(e.target)
      )
        setReactionPickerMsgId(null);
      if (
        inputEmojiPickerRef.current &&
        !inputEmojiPickerRef.current.contains(e.target)
      )
        setShowEmojiPicker(false);
      if (gifPickerRef.current && !gifPickerRef.current.contains(e.target))
        setShowGifPicker(false);
    };
    if (reactionPickerMsgId || showEmojiPicker || showGifPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [reactionPickerMsgId, showEmojiPicker, showGifPicker]);

  const handleEmojiClick = (emojiData) =>
    setText((prev) => prev + emojiData.emoji);

  const insertEmoji = (emoji) => {
    setText((prev) => {
      const match = prev.match(/:[a-zA-Z0-9_]*$/);
      if (!match) return prev + emoji;
      return prev.slice(0, match.index) + emoji;
    });
    setSuggestions([]);
  };

  const handleTextChange = (e) => {
    let val = e.target.value;
    const lastWord = val.split(" ").pop();
    if (EMOJI_MAP[lastWord]) val = val.replace(lastWord, EMOJI_MAP[lastWord]);
    setText(val);
    if (socket && conversation) {
      if (val.trim()) {
        socket.emit("typing:start", {
          conversationId: conversation._id,
          receiverId: conversation.participant._id,
        });
      } else {
        socket.emit("typing:stop", {
          conversationId: conversation._id,
          receiverId: conversation.participant._id,
        });
      }
    }
    const match = val.match(/:([a-zA-Z0-9_]*)$/);
    if (match) {
      const query = match[1].toLowerCase();
      const filtered = Object.entries(EMOJI_MAP)
        .filter(([code]) => {
          // code looks like ":cat:" — strip colons to get "cat"
          const name = code.slice(1, -1);
          // Match only if query is at the start of the whole name OR a word segment
          return (
            name.startsWith(query) ||
            name.split("_").some((w) => w.startsWith(query))
          );
        })
        .sort(([a], [b]) => {
          const an = a.slice(1, -1);
          const bn = b.slice(1, -1);
          // Exact-prefix matches first (e.g. "cat", "cat2")
          const aFirst = an.startsWith(query);
          const bFirst = bn.startsWith(query);
          if (aFirst && !bFirst) return -1;
          if (!aFirst && bFirst) return 1;
          return an.localeCompare(bn);
        })
        .slice(0, 8);
      setSuggestions(filtered);
      setSuggestionIndex(0);
    } else {
      setSuggestions([]);
    }
  };

  const handleKeyDown = (e) => {
    if (suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSuggestionIndex((prev) => (prev + 1) % suggestions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSuggestionIndex(
          (prev) => (prev - 1 + suggestions.length) % suggestions.length,
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        insertEmoji(suggestions[suggestionIndex][1]);
      } else if (e.key === "Escape") {
        setSuggestions([]);
      }
    }
  };

  const handleGifClick = (gif) => {
    if (!socket || !conversation) return;
    const tempId = `temp-${Date.now()}`;
    const gifUrl = gif.url || gif.previewUrl;
    const optimistic = {
      _id: tempId,
      conversationId: conversation._id,
      sender: { _id: user._id, name: user.name },
      gifUrl,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    setShowGifPicker(false);
    socket.emit("message:send", {
      conversationId: conversation._id,
      receiverId: conversation.participant._id,
      gifUrl,
      tempId,
    });
    onMessageSent?.(conversation._id, null, gifUrl);
  };

  const toggleReaction = useCallback(
    (msgId, emoji) => {
      if (!socket || !conversation?._id) return;
      socket.emit("message:react", {
        messageId: msgId,
        conversationId: conversation._id,
        emoji,
      });
    },
    [socket, conversation?._id],
  );

  // Fetch messages when conversation changes
  useEffect(() => {
    if (!conversation?._id) return;
    const fetchMessages = async () => {
      setLoadingMessages(true);
      setMessages([]);
      setReactions({});
      try {
        const res = await api.get(`/api/chat/messages/${conversation._id}`);
        setMessages(res.data);
        const rxns = {};
        for (const msg of res.data) {
          if (msg.reactions && typeof msg.reactions === "object") {
            const entries =
              msg.reactions instanceof Map
                ? Object.fromEntries(msg.reactions)
                : msg.reactions;
            if (Object.keys(entries).length > 0) rxns[msg._id] = entries;
          }
        }
        setReactions(rxns);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [conversation?._id]);

  // Mark initial loaded messages as seen once per active conversation
  useEffect(() => {
    if (!socket || !user || !conversation?._id || loadingMessages) return;
    if (seenInitializedConversationRef.current === conversation._id) return;

    // Find the last message from the other user that we haven't read
    const lastUnreadMsg = [...messages]
      .reverse()
      .find((msg) => msg.sender?._id !== user._id && msg.status !== "read");

    if (lastUnreadMsg) {
      socket.emit("conversation:seen", {
        conversationId: conversation._id,
        lastSeenMessageId: lastUnreadMsg._id,
      });

      // Notify parent to update unread count
      onMessagesSeen?.(conversation._id);
    }

    seenInitializedConversationRef.current = conversation._id;
  }, [conversation?._id, messages, socket, user, loadingMessages, onMessagesSeen]);

  // Join the conversation room so we receive real-time reactions
  useEffect(() => {
    if (!socket || !conversation?._id) return;
    socket.emit("conversation:join", conversation._id);
    return () => socket.emit("conversation:leave", conversation._id);
  }, [socket, conversation?._id]);

  useEffect(() => {
    if (!socket) return;
    const handleReceive = (msg) => {
      if (msg.conversationId !== conversation?._id) return;
      setMessages((prev) => {
        const optimisticIndex = prev.findIndex((m) => m._id === msg.tempId);
        if (optimisticIndex !== -1) {
          const updated = [...prev];
          updated[optimisticIndex] = msg;
          return updated;
        }
        return [...prev, msg];
      });
      if (msg.sender?._id !== user?._id) {
        socket.emit("conversation:seen", {
          conversationId: conversation._id,
          lastSeenMessageId: msg._id,
        });
        // Notify parent to update unread count
        if (onMessagesSeen) {
          onMessagesSeen(conversation._id);
        }
      }
    };
    const handleDelivered = (update) => {
      if (update.conversationId !== conversation?._id) return;
      setMessages((prev) =>
        prev.map((m) => {
          if (update.messageId && m._id === update.messageId)
            return { ...m, status: update.status };
          if (
            update.status === "read" &&
            m.sender?._id === user?._id &&
            m.status !== "read"
          ) {
            if (m._id <= update.upToMessageId) return { ...m, status: "read" };
          }
          return m;
        }),
      );
    };
    const handleReacted = ({
      messageId,
      conversationId: cId,
      reactions: rxns,
    }) => {
      if (cId !== conversation?._id) return;
      setReactions((prev) => ({ ...prev, [messageId]: rxns }));
    };
    socket.on("message:new", handleReceive);
    socket.on("message:status", handleDelivered);
    socket.on("message:reacted", handleReacted);
    return () => {
      socket.off("message:new", handleReceive);
      socket.off("message:status", handleDelivered);
      socket.off("message:reacted", handleReacted);
    };
  }, [socket, conversation?._id, user?._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() || !socket || !conversation) return;
    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      _id: tempId,
      conversationId: conversation._id,
      sender: { _id: user._id, name: user.name },
      text: text.trim(),
      createdAt: new Date().toISOString(),
      status: "sent",
      isOptimistic: true,
      replyTo,
    };
    setMessages((prev) => [...prev, optimistic]);
    setText("");
    socket.emit("typing:stop", {
      conversationId: conversation._id,
      receiverId: conversation.participant._id,
    });
    socket.emit("message:send", {
      conversationId: conversation._id,
      receiverId: conversation.participant._id,
      text: optimistic.text,
      tempId,
      replyTo: replyTo?._id || null,
    });
    setSuggestions([]);
    setReplyTo(null);
  };

  if (!conversation) {
    return (
      <div className="flex-1 bg-[#080b0f] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-3xl bg-teal-normal/10 border border-teal-normal/20 flex items-center justify-center">
          <Send size={24} className="text-teal-dark" />
        </div>
        <div className="text-center">
          <p className="text-slate-400 text-sm font-medium">
            No conversation selected
          </p>
          <p className="text-slate-700 text-xs mt-1">
            Choose one from the sidebar to start chatting
          </p>
        </div>
      </div>
    );
  }

  const participant = conversation.participant;
  const isParticipantOnline = onlineUsers?.get(participant?._id)?.online;

  return (
    <main className="flex-1 flex flex-col bg-[#080b0f] relative h-full">
      <header className="h-17 border-b border-white/5 flex justify-between items-center px-5 bg-[#0a0e13]/80 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className={`rounded-2xl overflow-hidden ${isParticipantOnline ? "ring-2 ring-teal-normal/60 ring-offset-1 ring-offset-[#0a0e13]" : ""}`}
            >
              <Image
                src={
                  participant?.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${participant?.name}`
                }
                width={40}
                height={40}
                className="rounded-2xl"
                alt={participant?.name || "avatar"}
                unoptimized
              />
            </div>
            <div
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0a0e13] ${isParticipantOnline ? "bg-green-400" : "bg-slate-600"}`}
            ></div>
          </div>
          <div>
            <h2 className="font-bold text-slate-100 text-sm leading-tight">
              {participant?.name}
            </h2>
            <p className="text-[10px] mt-0.5">
              {isParticipantOnline ? (
                <span className="text-green-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span>
                  Online
                </span>
              ) : (
                <span className="text-slate-600">
                  Last seen{" "}
                  {formatLastSeen(
                    onlineUsers?.get(participant?._id)?.lastSeen,
                  ) || "recently"}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          {[{ icon: Phone }, { icon: Video }, { icon: Info }].map(
            ({ icon: Icon }, i) => (
              <button
                key={i}
                className="w-8 h-8 rounded-xl bg-white/4 hover:bg-teal-normal/10 hover:text-teal-normal flex items-center justify-center text-slate-500 transition-all"
              >
                <Icon size={16} />
              </button>
            ),
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-3 scrollbar-hide">
        {loadingMessages && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <div className="w-4 h-4 rounded-full border-2 border-teal-normal border-t-transparent animate-spin"></div>
            <p className="text-slate-600 text-xs">Loading messages...</p>
          </div>
        )}
        {!loadingMessages && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 gap-3">
            <div className="w-12 h-12 rounded-3xl bg-teal-normal/10 border border-teal-normal/15 flex items-center justify-center">
              <span className="text-xl">👋</span>
            </div>
            <p className="text-slate-600 text-xs">
              No messages yet. Say hello!
            </p>
          </div>
        )}

        {messages.map((msg, index) => {
          const isMe =
            msg.sender?._id === user?._id || msg.sender === user?._id;
          const isGif = !!msg.gifUrl;
          const currentDateKey = toDateKey(msg.createdAt);
          const prevDateKey =
            index > 0 ? toDateKey(messages[index - 1].createdAt) : null;
          const showDateSeparator = currentDateKey !== prevDateKey;

          return (
            <React.Fragment key={msg._id}>
              {showDateSeparator && (
                <div className="flex items-center gap-3 my-2">
                  <div className="flex-1 h-px bg-white/5"></div>
                  <span className="text-[10px] font-medium text-slate-600 px-3 py-1 rounded-full bg-white/4 border border-white/6 shrink-0">
                    {getDateLabel(msg.createdAt)}
                  </span>
                  <div className="flex-1 h-px bg-white/5"></div>
                </div>
              )}
              <div
                className={`flex items-end gap-2 group ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[85%]`}
                >
                  <div className="relative group w-fit">
                    {!msg.isOptimistic && (
                      <div
                        className={`absolute -top-6 ${isMe ? "right-0" : "left-0"} hidden group-hover:flex items-center gap-0.5 bg-[#15191C] border border-slate-700/60 rounded-lg p-0.5 shadow-xl shadow-black/40 z-30`}
                      >
                        {["👍", "❤️", "😂", "😮", "😢"].map((emoji) => (
                          <button
                            key={emoji}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleReaction(msg._id, emoji);
                            }}
                            className={`p-1.5 rounded-md transition-all duration-150 hover:bg-slate-700/60 hover:scale-125 ${reactions[msg._id]?.[emoji]?.includes(user?._id) ? "bg-teal-900/40" : ""}`}
                          >
                            {emoji}
                          </button>
                        ))}
                        <div className="w-px h-5 bg-slate-700/60 mx-0.5" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setReactionPickerMsgId(
                              reactionPickerMsgId === msg._id ? null : msg._id,
                            );
                          }}
                          className="p-1 text-slate-400 hover:text-teal-400 hover:bg-slate-700/60 rounded-md transition-all duration-150"
                        >
                          <Smile size={14} />
                        </button>
                        <button
                          onClick={() => setReplyTo(msg)}
                          className="p-1 text-slate-400 hover:text-teal-400 hover:bg-slate-700/60 rounded-md transition-all duration-150"
                        >
                          <Reply size={14} />
                        </button>
                      </div>
                    )}
                    <div
                      className={`${isGif ? "p-1" : "p-3.5"} rounded-2xl text-[13px] leading-relaxed relative z-10 ${isMe ? (isGif ? "bg-transparent" : "bg-teal-normal text-white rounded-br-none shadow-lg shadow-teal-normal/10") : isGif ? "bg-transparent" : "bg-surface-dark text-slate-200 rounded-bl-none shadow-sm shadow-black/5"} ${msg.isOptimistic ? "opacity-60" : ""}`}
                    >
                      {msg.replyTo && (
                        <div className="mb-2 p-2 bg-black/20 rounded-lg border-l-2 border-teal-normal text-[11px] opacity-80 line-clamp-2">
                          <p className="font-bold mb-0.5">
                            {msg.replyTo.sender?.name === user.name
                              ? "You"
                              : msg.replyTo.sender?.name || "Participant"}
                          </p>
                          {msg.replyTo.text}
                        </div>
                      )}
                      {isGif ? (
                        <img
                          src={msg.gifUrl}
                          alt="GIF"
                          className="max-w-70 rounded-xl"
                          loading="lazy"
                        />
                      ) : (
                        msg.text
                      )}
                      <div
                        className={`text-[9px] mt-1.5 opacity-40 text-right ${isGif ? "px-2" : ""} flex items-center justify-end gap-1`}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                    {reactionPickerMsgId === msg._id && (
                      <div
                        ref={reactionPickerRef}
                        className={`absolute top-0 z-50 ${isMe ? "right-full mr-2" : "left-full ml-2"}`}
                      >
                        <EmojiPicker
                          onEmojiClick={(emojiData) =>
                            toggleReaction(msg._id, emojiData.emoji)
                          }
                          theme="dark"
                          emojiStyle="native"
                          width={320}
                          height={400}
                          searchPlaceholder="Search emoji..."
                          previewConfig={{ showPreview: false }}
                          lazyLoadEmojis
                        />
                      </div>
                    )}
                  </div>
                  {reactions[msg._id] &&
                    Object.keys(reactions[msg._id]).length > 0 && (
                      <div
                        className={`flex flex-wrap gap-1 mt-1 ${isMe ? "flex-row-reverse" : "flex-row"} max-w-65`}
                      >
                        {Object.entries(reactions[msg._id])
                          .slice(0, 10)
                          .map(([emoji, users]) => (
                            <button
                              key={emoji}
                              onClick={() => toggleReaction(msg._id, emoji)}
                              className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded-full border transition-all duration-150 ${users.includes(user?._id) ? "bg-teal-400/10 border-teal-400/30" : "bg-[#1C2227] border-slate-800"}`}
                            >
                              <span className="text-[12px]">{emoji}</span>
                              <span className="text-[9px] font-bold text-slate-400">
                                {users.length}
                              </span>
                            </button>
                          ))}
                      </div>
                    )}
                  {isMe && !msg.isOptimistic && (
                    <div className="flex items-center gap-0.5 px-0.5 mt-0.5">
                      {msg.status === "sent" && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/6 text-slate-500 text-[8px] font-medium">
                          <svg
                            width="8"
                            height="8"
                            viewBox="0 0 12 12"
                            fill="none"
                          >
                            <path
                              d="M2 6l3 3 5-5"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Sent
                        </span>
                      )}
                      {msg.status === "delivered" && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/6 text-slate-400 text-[8px] font-medium">
                          <svg
                            width="10"
                            height="8"
                            viewBox="0 0 16 12"
                            fill="none"
                          >
                            <path
                              d="M1 6l3 3 5-5"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M5 6l3 3 5-5"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Delivered
                        </span>
                      )}
                      {msg.status === "read" && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-normal/15 text-teal-normal text-[8px] font-semibold">
                          <svg
                            width="10"
                            height="8"
                            viewBox="0 0 16 12"
                            fill="none"
                          >
                            <path
                              d="M1 6l3 3 5-5"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M5 6l3 3 5-5"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Seen
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </React.Fragment>
          );
        })}
        {typingUsers?.get(conversation._id) && (
          <div className="flex items-end gap-2 justify-start">
            <div className="flex items-center gap-1 px-4 py-3 bg-surface-dark rounded-2xl rounded-bl-none shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="p-4 relative bg-[#0a0e13]/80 backdrop-blur-sm border-t border-white/5 z-50"
      >
        {replyTo && (
          <div className="absolute bottom-full left-0 right-0 p-3 bg-surface-dark border-t border-teal-normal/30 flex items-center justify-between animate-in slide-in-from-bottom-2 fade-in">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-1 bg-teal-normal h-8 rounded-full"></div>
              <div className="overflow-hidden">
                <p className="text-[11px] font-bold text-teal-normal">
                  Replying to {replyTo.sender?.name}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {replyTo.text}
                </p>
              </div>
            </div>
            <button
              onClick={() => setReplyTo(null)}
              className="p-1.5 hover:bg-white/5 rounded-full text-slate-500"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {showGifPicker && (
          <div
            ref={gifPickerRef}
            className="absolute bottom-20 right-4 z-50 shadow-2xl rounded-2xl overflow-hidden border border-slate-800"
          >
            <style>{`.gpr-picker { --gpr-bg-color: #15191C !important; --gpr-secondary-bg: #1C2227 !important; --gpr-text-color: #cbd5e1 !important; --gpr-text-secondary: #94a3b8 !important; --gpr-border-color: #1e293b !important; --gpr-highlight-color: #2dd4bf !important; --gpr-highlight-hover: #5eead4 !important; --gpr-input-bg: #0B0E11 !important; --gpr-hover-bg: rgba(45, 212, 191, 0.1) !important; --gpr-radius: 16px !important; border: none !important; } .gpr-trending-terms { display: none !important; }`}</style>
            <GifPicker
              klipyApiKey={process.env.NEXT_PUBLIC_KLIPY_API_KEY}
              onGifClick={handleGifClick}
              theme="dark"
              width={380}
              height={450}
              columns={2}
            />
          </div>
        )}
        {showEmojiPicker && (
          <div
            ref={inputEmojiPickerRef}
            className="absolute bottom-20 right-4 z-50 shadow-2xl"
          >
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              theme="dark"
              emojiStyle="native"
              width={350}
              height={420}
              searchPlaceholder="Search emoji..."
              previewConfig={{ showPreview: false }}
              lazyLoadEmojis
            />
          </div>
        )}

        <div className="bg-[#12181f] rounded-2xl flex items-center p-2 border border-white/5 focus-within:border-teal-normal/50 transition-all shadow-inner">
          <button
            type="button"
            className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-teal-normal transition-colors"
          >
            <Plus size={20} />
          </button>
          <input
            className="flex-1 bg-transparent outline-none text-sm text-slate-200 px-3 placeholder:text-slate-600"
            placeholder="Type a message..."
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
          />
          {suggestions.length > 0 && (
            <div className="absolute bottom-20 left-10 bg-[#15191C]/95 backdrop-blur-md border border-slate-800 rounded-xl p-1 shadow-2xl z-50 min-w-37.5">
              {suggestions.map(([code, emoji], i) => (
                <div
                  key={code}
                  onClick={() => insertEmoji(emoji)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${i === suggestionIndex ? "bg-teal-500/20 text-teal-400" : "hover:bg-slate-800 text-slate-400"}`}
                >
                  <span className="text-lg">{emoji}</span>
                  <span className="text-xs font-mono">{code}</span>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              setShowGifPicker(!showGifPicker);
              setShowEmojiPicker(false);
            }}
            className={`px-2 py-1 mx-1 text-[10px] font-black rounded-md border transition-all ${showGifPicker ? "bg-teal-normal/20 border-teal-normal/40 text-teal-normal" : "bg-white/4 border-white/10 text-slate-500 hover:text-slate-300"}`}
          >
            GIF
          </button>
          <button
            type="button"
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setShowGifPicker(false);
            }}
            className={`w-9 h-9 flex items-center justify-center transition-all ${showEmojiPicker ? "text-teal-normal" : "text-slate-500 hover:text-slate-300"}`}
          >
            <Smile size={20} />
          </button>
          <button
            type="submit"
            className="w-9 h-9 flex items-center justify-center bg-teal-normal hover:bg-teal-light text-black rounded-xl ml-2 transition-all active:scale-95 shadow-lg shadow-teal-normal/20"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </main>
  );
}
