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

export default function ChatWindow({ conversation, onMessageSent }) {
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
    onMessageSent?.(conversation._id, "GIF");
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
      <div className="flex-1 bg-background-dark flex flex-col items-center justify-center gap-6 p-8">
        <div className="w-20 h-20 rounded-[2.5rem] bg-teal-normal/5 border border-teal-normal/10 flex items-center justify-center animate-pulse shadow-2xl shadow-teal-normal/5">
          <Send size={32} className="text-teal-normal opacity-40 rotate-12" />
        </div>
        <div className="text-center max-w-xs transition-all">
          <h2 className="text-white font-bold text-lg tracking-tight">
            Select a Conversation
          </h2>
          <p className="text-slate-500 text-sm mt-2 leading-relaxed font-medium">
            Choose a friend from the sidebar or start a new chat to begin your
            ConvoX experience.
          </p>
        </div>
      </div>
    );
  }

  const participant = conversation.participant;
  const isParticipantOnline = onlineUsers?.get(participant?._id)?.online;

  return (
    <main className="flex-1 flex flex-col bg-background-dark relative h-full overflow-hidden">
      <header className="h-14 border-b border-white/5 flex justify-between items-center px-6 bg-background-dark/80 backdrop-blur-xl shrink-0 z-40">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-full overflow-hidden ring-1 ring-white/10 ring-offset-2 ring-offset-background-dark">
              <Image
                src={
                  participant?.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${participant?.name}`
                }
                width={36}
                height={36}
                className="rounded-full object-cover"
                alt={participant?.name || "avatar"}
                unoptimized
              />
            </div>
            <div
              className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-[3px] border-background-dark active-status-shadow ${isParticipantOnline ? "bg-[#23a559]" : "bg-slate-600"}`}
            ></div>
          </div>
          <div className="flex flex-col">
            <h2 className="font-bold text-white text-[15px] leading-tight tracking-tight flex items-center gap-2">
              {participant?.name}
              <span className="w-1 h-1 rounded-full bg-slate-700"></span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">
                Direct
              </span>
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-[10px] text-slate-500 font-black leading-tight uppercase tracking-widest">
                {isParticipantOnline
                  ? "Available Now"
                  : `Away • ${formatLastSeen(onlineUsers?.get(participant?._id)?.lastSeen) || "Recently"}`}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {[{ icon: Phone }, { icon: Video }, { icon: Info }].map(
            ({ icon: Icon }, i) => (
              <button
                key={i}
                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-teal-normal hover:bg-white/5 rounded-2xl transition-all duration-300"
              >
                <Icon size={18} strokeWidth={2.5} />
              </button>
            ),
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-1.5 custom-scrollbar bg-background-dark overflow-x-hidden">
        {loadingMessages && (
          <div className="flex flex-col items-center justify-center gap-4 mt-16 scale-110">
            <div className="w-8 h-8 rounded-full border-[3px] border-teal-normal/20 border-t-teal-normal animate-spin shadow-lg shadow-teal-normal/5"></div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
              Syncing messages...
            </p>
          </div>
        )}
        {!loadingMessages && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 gap-6 max-w-sm mx-auto text-center py-20">
            <div className="relative">
              <div className="absolute inset-0 bg-teal-normal/20 blur-3xl rounded-full scale-150 opacity-20 animate-pulse"></div>
              <div className="relative w-24 h-24 rounded-[2.5rem] bg-surface-dark flex items-center justify-center shadow-2xl border border-white/5 rotate-3 hover:rotate-0 transition-transform duration-500">
                <Image
                  src={
                    participant?.avatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${participant?.name}`
                  }
                  width={96}
                  height={96}
                  className="rounded-[2.25rem] object-cover p-1"
                  alt={participant?.name || "avatar"}
                  unoptimized
                />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-black text-3xl tracking-tighter">
                {participant?.name}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                Your secure interaction with{" "}
                <span className="text-teal-normal font-bold">
                  {participant?.name}
                </span>{" "}
                starts here. Send a greeting to begin!
              </p>
            </div>
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
                <div className="flex items-center gap-4 my-8 first:mt-2">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] font-mono">
                    {getDateLabel(msg.createdAt)}
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
                </div>
              )}
              <div
                className={`flex items-end gap-3 group mb-0.5 animate-in fade-in slide-in-from-bottom-1 duration-300 ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[80%]`}
                >
                  <div className="relative group w-fit">
                    {!msg.isOptimistic && (
                      <div
                        className={`absolute -top-10 ${isMe ? "right-0" : "left-0"} hidden group-hover:flex items-center gap-1 bg-surface-dark border border-white/10 rounded-2xl p-1 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-30 animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200`}
                      >
                        {["👍", "❤️", "😂", "😮", "😢"].map((emoji) => (
                          <button
                            key={emoji}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleReaction(msg._id, emoji);
                            }}
                            className={`p-2 rounded-xl transition-all duration-200 hover:bg-white/10 hover:scale-125 active:scale-95 ${reactions[msg._id]?.[emoji]?.includes(user?._id) ? "bg-teal-normal/20 border border-teal-normal/20" : ""}`}
                          >
                            <span className="text-base leading-none">
                              {emoji}
                            </span>
                          </button>
                        ))}
                        <div className="w-px h-6 bg-white/10 mx-1" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setReactionPickerMsgId(
                              reactionPickerMsgId === msg._id ? null : msg._id,
                            );
                          }}
                          className="p-2 text-slate-400 hover:text-teal-normal hover:bg-white/10 rounded-xl transition-all duration-200"
                        >
                          <Smile size={18} />
                        </button>
                        <button
                          onClick={() => setReplyTo(msg)}
                          className="p-2 text-slate-400 hover:text-teal-normal hover:bg-white/10 rounded-xl transition-all duration-200"
                        >
                          <Reply size={18} />
                        </button>
                      </div>
                    )}
                    <div
                      className={`${isGif ? "p-1.5" : "p-3 px-4"} rounded-2xl text-[14px] leading-[1.6] relative z-20 shadow-xl transition-all duration-300 group-hover:shadow-black/30 ${isMe ? (isGif ? "bg-transparent" : "bg-teal-normal text-black font-semibold rounded-br-none shadow-teal-normal/10 hover:shadow-teal-normal/20") : isGif ? "bg-transparent" : "bg-surface-dark text-slate-200 border border-white/5 rounded-bl-none shadow-black/20 hover:border-white/10"} ${msg.isOptimistic ? "opacity-60 blur-[1px]" : ""}`}
                    >
                      {msg.replyTo && (
                        <div className="mb-3 p-2.5 bg-black/30 rounded-xl border-l-[3px] border-teal-normal/50 text-[11px] opacity-90 line-clamp-2 backdrop-blur-sm">
                          <p className="font-black mb-1 text-[10px] text-teal-normal uppercase tracking-wider">
                            {msg.replyTo.sender?.name === user.name
                              ? "You"
                              : msg.replyTo.sender?.name || "Participant"}
                          </p>
                          <span className="opacity-80 leading-relaxed italic">
                            {msg.replyTo.text}
                          </span>
                        </div>
                      )}
                      {isGif ? (
                        <div className="relative group/gif overflow-hidden rounded-2xl">
                          <img
                            src={msg.gifUrl}
                            alt="GIF"
                            className="max-w-[18rem] rounded-2xl shadow-2xl border border-white/10 transition-transform duration-500 group-hover/gif:scale-105"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <span className="whitespace-pre-wrap tracking-tight">
                          {msg.text}
                        </span>
                      )}
                      <div
                        className={`text-[9px] mt-2 opacity-50 flex items-center justify-end gap-1.5 font-black uppercase tracking-widest ${isMe ? "text-black/70" : "text-slate-500"}`}
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
                        className={`absolute bottom-full mb-4 z-50 ${isMe ? "right-0" : "left-0"} shadow-[0_30px_60px_-12px_rgba(0,0,0,0.6)] rounded-3xl overflow-hidden ring-1 ring-white/10 animate-in fade-in slide-in-from-bottom-4 duration-300`}
                      >
                        <EmojiPicker
                          onEmojiClick={(emojiData) =>
                            toggleReaction(msg._id, emojiData.emoji)
                          }
                          theme="dark"
                          emojiStyle="native"
                          width={320}
                          height={400}
                          searchPlaceholder="Find perfect emoji..."
                          previewConfig={{ showPreview: false }}
                          lazyLoadEmojis
                        />
                      </div>
                    )}
                  </div>
                  {reactions[msg._id] &&
                    Object.keys(reactions[msg._id]).length > 0 && (
                      <div
                        className={`flex flex-wrap gap-1.5 mt-2 ${isMe ? "flex-row-reverse" : "flex-row"} max-w-65`}
                      >
                        {Object.entries(reactions[msg._id])
                          .slice(0, 10)
                          .map(([emoji, users]) => (
                            <button
                              key={emoji}
                              onClick={() => toggleReaction(msg._id, emoji)}
                              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-white/5 backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 ${users.includes(user?._id) ? "bg-teal-normal/20 border-teal-normal/50 text-teal-normal shadow-lg shadow-teal-normal/10" : "bg-surface-dark/60 text-slate-400 hover:border-white/20 hover:text-slate-200 shadow-xl"}`}
                            >
                              <span className="text-[14px] leading-none">
                                {emoji}
                              </span>
                              <span className="text-[10px] font-black font-mono">
                                {users.length}
                              </span>
                            </button>
                          ))}
                      </div>
                    )}
                  {isMe && !msg.isOptimistic && (
                    <div className="flex items-center gap-1.5 px-2 mt-1.5 opacity-80 group/status">
                      {msg.status === "sent" && (
                        <div className="text-slate-600 transition-colors group-hover/status:text-slate-400">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                      )}
                      {msg.status === "delivered" && (
                        <div className="text-slate-600 flex transition-colors group-hover/status:text-slate-400">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="7 13 12 18 22 8"></polyline>
                            <polyline points="2 13 7 18 17 8"></polyline>
                          </svg>
                        </div>
                      )}
                      {msg.status === "read" && (
                        <div className="text-teal-normal flex drop-shadow-[0_0_8px_rgba(45,212,191,0.4)] animate-in fade-in duration-500">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="7 13 12 18 22 8"></polyline>
                            <polyline points="2 13 7 18 17 8"></polyline>
                          </svg>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </React.Fragment>
          );
        })}
        {typingUsers?.get(conversation._id) && (
          <div className="flex items-end gap-3 justify-start mt-4 mb-2 animate-in slide-in-from-left-4 fade-in duration-500">
            <div className="flex items-center gap-1.5 px-5 py-4 bg-surface-dark rounded-3xl rounded-bl-none shadow-2xl border border-white/5 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-normal animate-bounce [animation-delay:-300ms] shadow-[0_0_8px_rgba(45,212,191,0.5)]" />
              <span className="w-1.5 h-1.5 rounded-full bg-teal-normal animate-bounce [animation-delay:-150ms] shadow-[0_0_8px_rgba(45,212,191,0.5)]" />
              <span className="w-1.5 h-1.5 rounded-full bg-teal-normal animate-bounce [animation-delay:0ms] shadow-[0_0_8px_rgba(45,212,191,0.5)]" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                Typing
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} className="h-4" />
      </div>

      <form
        onSubmit={handleSend}
        className="p-6 relative bg-background-dark/95 backdrop-blur-xl border-t border-white/5 z-50"
      >
        {replyTo && (
          <div className="absolute bottom-[calc(100%+8px)] left-6 right-6 p-4 bg-surface-dark border border-teal-normal/20 rounded-2xl flex items-center justify-between animate-in slide-in-from-bottom-4 fade-in duration-300 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-4 overflow-hidden">
              <div className="w-1.5 bg-teal-normal h-10 rounded-full shadow-[0_0_15px_rgba(45,212,191,0.3)]"></div>
              <div className="overflow-hidden space-y-0.5">
                <p className="text-[10px] font-black text-teal-normal uppercase tracking-[0.2em]">
                  Replying to {replyTo.sender?.name}
                </p>
                <p className="text-[13px] text-slate-300 truncate font-medium">
                  {replyTo.text}
                </p>
              </div>
            </div>
            <button
              onClick={() => setReplyTo(null)}
              className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-xl text-slate-500 transition-all hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {showGifPicker && (
          <div
            ref={gifPickerRef}
            className="absolute bottom-24 right-6 z-50 shadow-[0_40px_100px_rgba(0,0,0,0.8)] rounded-3xl overflow-hidden border border-white/10 ring-1 ring-white/5 animate-in zoom-in-95 fade-in slide-in-from-bottom-8 duration-300"
          >
            <style>{`.gpr-picker { --gpr-bg-color: #0d1117 !important; --gpr-secondary-bg: #161b22 !important; --gpr-text-color: #e2e8f0 !important; --gpr-text-secondary: #94a3b8 !important; --gpr-border-color: #30363d !important; --gpr-highlight-color: #13c8ec !important; --gpr-highlight-hover: #5eead4 !important; --gpr-input-bg: #010409 !important; --gpr-hover-bg: rgba(19, 200, 236, 0.1) !important; --gpr-radius: 20px !important; border: none !important; } .gpr-trending-terms { display: none !important; }`}</style>
            <GifPicker
              klipyApiKey={process.env.NEXT_PUBLIC_KLIPY_API_KEY}
              onGifClick={handleGifClick}
              theme="dark"
              width={400}
              height={500}
              columns={2}
            />
          </div>
        )}
        {showEmojiPicker && (
          <div
            ref={inputEmojiPickerRef}
            className="absolute bottom-24 right-6 z-50 shadow-[0_40px_100px_rgba(0,0,0,0.8)] rounded-3xl overflow-hidden ring-1 ring-white/10 animate-in zoom-in-95 fade-in slide-in-from-bottom-8 duration-300"
          >
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              theme="dark"
              emojiStyle="native"
              width={380}
              height={450}
              searchPlaceholder="Spark an emotion..."
              previewConfig={{ showPreview: false }}
              lazyLoadEmojis
            />
          </div>
        )}

        <div className="bg-[#0a0f14] rounded-[2rem] flex items-center p-2.5 border border-white/5 focus-within:border-teal-normal/40 focus-within:ring-4 focus-within:ring-teal-normal/5 transition-all shadow-2xl backdrop-blur-md group/input">
          <button
            type="button"
            className="w-11 h-11 flex items-center justify-center text-slate-500 hover:text-teal-normal hover:bg-white/5 rounded-2xl transition-all duration-300 group-focus-within/input:text-teal-normal"
          >
            <Plus size={22} strokeWidth={2.5} />
          </button>
          <input
            className="flex-1 bg-transparent outline-none text-[15px] font-medium text-white px-4 placeholder:text-slate-600 placeholder:font-black placeholder:uppercase placeholder:tracking-widest placeholder:text-[11px]"
            placeholder="Broadcast your thoughts..."
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
          />
          {suggestions.length > 0 && (
            <div className="absolute bottom-[calc(100%+12px)] left-6 bg-surface-dark/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-1.5 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.7)] z-50 min-w-[12rem] animate-in slide-in-from-bottom-2 duration-200">
              <p className="px-3 py-1.5 text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 mb-1.5">
                Emoji Hints
              </p>
              {suggestions.map(([code, emoji], i) => (
                <div
                  key={code}
                  onClick={() => insertEmoji(emoji)}
                  className={`flex items-center gap-4 px-3.5 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${i === suggestionIndex ? "bg-teal-normal/20 text-teal-normal shadow-lg shadow-teal-normal/5" : "hover:bg-white/5 text-slate-400"}`}
                >
                  <span className="text-xl leading-none">{emoji}</span>
                  <span className="text-[11px] font-black font-mono tracking-tighter opacity-80">
                    {code}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-1.5 pr-1.5">
            <button
              type="button"
              onClick={() => {
                setShowGifPicker(!showGifPicker);
                setShowEmojiPicker(false);
              }}
              className={`h-9 px-3 text-[10px] font-black rounded-xl border transition-all duration-300 tracking-widest uppercase ${showGifPicker ? "bg-teal-normal text-black border-teal-normal shadow-lg shadow-teal-normal/20" : "bg-white/5 border-white/5 text-slate-500 hover:text-slate-300 hover:bg-white/10"}`}
            >
              GIF
            </button>
            <button
              type="button"
              onClick={() => {
                setShowEmojiPicker(!showEmojiPicker);
                setShowGifPicker(false);
              }}
              className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-300 ${showEmojiPicker ? "text-teal-normal bg-teal-normal/10" : "text-slate-500 hover:text-slate-200 hover:bg-white/5"}`}
            >
              <Smile size={22} strokeWidth={2.5} />
            </button>
            <button
              type="submit"
              disabled={!text.trim()}
              className={`w-11 h-11 flex items-center justify-center rounded-2xl transition-all duration-500 shadow-2xl ${text.trim() ? "bg-teal-normal text-black hover:scale-105 active:scale-95 shadow-teal-normal/20" : "bg-white/5 text-slate-700 opacity-50 cursor-not-allowed"}`}
            >
              <Send size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
