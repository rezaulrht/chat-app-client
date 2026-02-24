"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Phone, Video, Info, Plus, Smile, Send } from "lucide-react";
import api from "@/app/api/Axios";
import { useSocket } from "@/hooks/useSocket";
import useAuth from "@/hooks/useAuth";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });
const GifPicker = dynamic(
  () =>
    import("gif-picker-react-klipy").then((m) => m.GifPicker || m.default || m),
  { ssr: false },
);

const EMOJI_MAP = {
  ":smile:": "😊",
  ":smile_cat:": "😸",
  ":smiling_face_with_three_hearts:": "🥰",
  ":smiling_eyes:": "😊",
  ":grin:": "😁",
  ":joy:": "😂",
  ":rofl:": "🤣",
  ":relaxed:": "☺️",
  ":blush:": "😊",
  ":innocent:": "😇",
  ":slight_smile:": "🙂",
  ":upside_down:": "🙃",
  ":wink:": "😉",
  ":heart_eyes:": "😍",
  ":kissing_heart:": "😘",
  ":yum:": "😋",
  ":stuck_out_tongue:": "😛",
  ":money_mouth:": "🤑",
  ":hugging:": "🤗",
  ":thinking:": "🤔",
  ":neutral_face:": "😐",
  ":expressionless:": "😑",
  ":no_mouth:": "😶",
  ":smirk:": "😏",
  ":unamused:": "😒",
  ":rolling_eyes:": "🙄",
  ":grimacing:": "😬",
  ":lying_face:": "🤥",
  ":relieved:": "😌",
  ":pensive:": "😔",
  ":sleepy:": "😪",
  ":sleeping:": "😴",
  ":mask:": "😷",
  ":sick:": "🤒",
  ":dizzy_face:": "😵",
  ":cool:": "😎",
  ":nerd:": "🤓",
  ":shush:": "🤫",
  ":monocle:": "🧐",
  ":confused:": "😕",
  ":worried:": "😟",
  ":frown:": "☹️",
  ":open_mouth:": "😮",
  ":hushed:": "😯",
  ":astonished:": "😲",
  ":flushed:": "😳",
  ":pleading:": "🥺",
  ":frowning:": "😦",
  ":anguished:": "😧",
  ":fearful:": "😨",
  ":cold_sweat:": "😰",
  ":cry:": "😢",
  ":sob:": "😭",
  ":scream:": "😱",
  ":confounded:": "😖",
  ":weary:": "😩",
  ":tired_face:": "😫",
  ":yawn:": "🥱",
  ":triumph:": "😤",
  ":rage:": "😡",
  ":angry:": "😠",
  ":skull:": "💀",
  ":poop:": "💩",
  ":clown:": "🤡",
  ":ghost:": "👻",
  ":alien:": "👽",
  ":robot:": "🤖",
  ":heart:": "❤️",
  ":sparkles:": "✨",
  ":fire:": "🔥",
  ":star:": "⭐",
  ":rocket:": "🚀",
  ":ok_hand:": "👌",
  ":thumbsup:": "👍",
  ":thumbsdown:": "👎",
  ":clap:": "👏",
  ":pray:": "🙏",
  ":muscle:": "💪",
  ":eyes:": "👀",
  ":party:": "🥳",
  ":check:": "✅",
  ":x:": "❌",
};

const formatLastSeen = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ChatWindow({ conversation, onMessageSent }) {
  const { socket, onlineUsers } = useSocket() || {};
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
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
    if (EMOJI_MAP[lastWord]) {
      val = val.replace(lastWord, EMOJI_MAP[lastWord]);
    }
    setText(val);
    const match = val.match(/:([a-zA-Z0-9_]*)$/);
    if (match) {
      const query = match[1].toLowerCase();
      const filtered = Object.entries(EMOJI_MAP)
        .filter(([code]) => code.includes(query))
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

  // Toggle a reaction — emit via socket for persistence + live sync
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

  useEffect(() => {
    if (!socket) return;
    const handleReceive = (msg) => {
      if (msg.conversationId !== conversation?._id) return;
      setMessages((prev) => [...prev, msg]);
    };
    const handleDelivered = (msg) => {
      if (msg.conversationId !== conversation?._id) return;
      setMessages((prev) =>
        prev.map((m) => (m._id === msg.tempId ? { ...msg } : m)),
      );
      onMessageSent(msg.conversationId, msg.text || "GIF");
    };
    const handleReacted = ({
      messageId,
      conversationId: cId,
      reactions: rxns,
    }) => {
      if (cId !== conversation?._id) return;
      setReactions((prev) => ({ ...prev, [messageId]: rxns }));
    };
    socket.on("message:receive", handleReceive);
    socket.on("message:delivered", handleDelivered);
    socket.on("message:reacted", handleReacted);
    return () => {
      socket.off("message:receive", handleReceive);
      socket.off("message:delivered", handleDelivered);
      socket.off("message:reacted", handleReacted);
    };
  }, [socket, conversation?._id, onMessageSent]);

  // Auto-scroll to the latest message
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
      isOptimistic: true,
    };

    setMessages((prev) => [...prev, optimistic]);
    setText("");

    socket.emit("message:send", {
      conversationId: conversation._id,
      receiverId: conversation.participant._id,
      text: text.trim(),
      tempId,
    });
    setSuggestions([]);
  };

  if (!conversation) {
    return (
      <div className="flex-1 bg-[#05050A] flex items-center justify-center">
        <p className="text-slate-600 text-sm">
          Select a conversation to start chatting
        </p>
      </div>
    );
  }

  const participant = conversation.participant;

  return (
    <main className="flex-1 flex flex-col bg-[#0B0E11] relative h-full">
      {/* Header */}
      <header className="h-20 border-b border-slate-800/50 flex justify-between items-center px-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Image
              src={
                participant?.avatar ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${participant?.name}`
              }
              width={40}
              height={40}
              className="rounded-xl"
              alt={participant?.name || "avatar"}
              unoptimized
            />
            {onlineUsers?.get(participant?._id)?.online && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0B0E11]"></div>
            )}
          </div>
          <div>
            <h2 className="font-bold text-white text-sm">
              {participant?.name}
            </h2>
            <p className="text-[10px] text-slate-500">
              {onlineUsers?.get(participant?._id)?.online ? (
                <span className="text-green-500">Online</span>
              ) : (
                <span>
                  Last seen{" "}
                  {formatLastSeen(
                    onlineUsers?.get(participant?._id)?.lastSeen,
                  ) || "Just now"}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex gap-4 text-slate-400">
          <Phone size={18} className="cursor-pointer hover:text-white" />
          <Video size={18} className="cursor-pointer hover:text-white" />
          <Info size={18} className="cursor-pointer hover:text-white" />
        </div>
      </header>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col">
        {loadingMessages && (
          <p className="text-center text-slate-600 text-xs mt-4">
            Loading messages...
          </p>
        )}

        {!loadingMessages && messages.length === 0 && (
          <p className="text-center text-slate-600 text-xs mt-4">
            No messages yet. Say hello! 👋
          </p>
        )}

        {messages.map((msg) => {
          const isMe =
            msg.sender?._id === user?._id || msg.sender === user?._id;
          const isGif = !!msg.gifUrl;
          return (
            <div
              key={msg._id}
              className={`flex ${isMe ? "justify-end" : "justify-start"} px-2`}
            >
              {/* Message Group */}
              <div
                className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[85%]`}
              >
                {/* Bubble Wrapper */}
                <div className="relative group w-fit">
                  {/* Hover Actions */}
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
                          className={`p-1.5 rounded-md transition-all duration-150 hover:bg-slate-700/60 hover:scale-125 ${
                            reactions[msg._id]?.[emoji]?.includes(user?._id)
                              ? "bg-teal-900/40"
                              : ""
                          }`}
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
                        title="More reactions"
                      >
                        <Smile size={14} />
                      </button>
                      <button
                        className="p-1 text-slate-400 hover:text-teal-400 hover:bg-slate-700/60 rounded-md transition-all duration-150"
                        title="Reply"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="9 17 4 12 9 7" />
                          <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
                        </svg>
                      </button>
                      {isMe && (
                        <>
                          <button
                            className="p-1 text-slate-400 hover:text-teal-400 hover:bg-slate-700/60 rounded-md transition-all duration-150"
                            title="Edit"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                              <path d="m15 5 4 4" />
                            </svg>
                          </button>
                          <button
                            className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-700/60 rounded-md transition-all duration-150"
                            title="Delete"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M3 6h18" />
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`${isGif ? "p-1" : "p-4"} rounded-2xl text-sm w-fit relative z-10 ${
                      isMe
                        ? `${isGif ? "bg-transparent" : "bg-teal-900/20"} text-white rounded-br-none ${isGif ? "" : "border border-teal-500/20 shadow-lg shadow-teal-500/5"} ${msg.isOptimistic ? "opacity-60" : ""}`
                        : `${isGif ? "bg-transparent" : "bg-[#1C2227]"} text-slate-300 rounded-bl-none`
                    }`}
                  >
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
                      className={`text-[9px] mt-2 opacity-50 text-right ${isGif ? "px-2" : ""}`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  {/* Reaction Picker — Positioned beside the bubble */}
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
                      className={`flex flex-wrap gap-1 mt-1.5 w-fit ${
                        isMe ? "flex-row-reverse" : "flex-row"
                      } max-w-65`}
                    >
                      {Object.entries(reactions[msg._id])
                        .slice(0, 10)
                        .map(([emoji, users]) => (
                          <button
                            key={emoji}
                            onClick={() => toggleReaction(msg._id, emoji)}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded-full border transition-all duration-150 whitespace-nowrap shadow-sm hover:scale-105 active:scale-95 ${
                              users.includes(user?._id)
                                ? "bg-teal-400/10 border-teal-400/30"
                                : "bg-[#1C2227] border-slate-700/50 hover:border-slate-500"
                            }`}
                          >
                            <span className="text-[15px] leading-none">
                              {emoji}
                            </span>
                            <span className="text-[10px] font-bold text-slate-300">
                              {users.length}
                            </span>
                          </button>
                        ))}
                    </div>
                  )}
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-6 relative">
        {showGifPicker && (
          <div
            ref={gifPickerRef}
            className="absolute bottom-25 right-6 z-50 shadow-2xl rounded-2xl overflow-hidden border border-slate-800"
          >
            <style>
              {`
                .gpr-picker { 
                  --gpr-bg-color: #15191C !important;
                  --gpr-secondary-bg: #1C2227 !important;
                  --gpr-text-color: #cbd5e1 !important;
                  --gpr-text-secondary: #94a3b8 !important;
                  --gpr-border-color: #1e293b !important;
                  --gpr-highlight-color: #2dd4bf !important;
                  --gpr-highlight-hover: #5eead4 !important;
                  --gpr-input-bg: #0B0E11 !important;
                  --gpr-hover-bg: rgba(45, 212, 191, 0.1) !important;
                  --gpr-radius: 16px !important;
                  border: none !important;
                }
                .gpr-trending-terms { display: none !important; }
              `}
            </style>
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
            className="absolute bottom-25 right-6 z-50 shadow-2xl"
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

        <div className="bg-[#15191C] rounded-2xl flex items-center p-2.5 border border-slate-800 focus-within:border-teal-500/50 transition-all shadow-lg">
          <button type="button" className="p-1">
            <Plus
              size={20}
              className="text-slate-500 mx-1 cursor-pointer hover:text-teal-400 transition-colors"
            />
          </button>

          <input
            className="flex-1 bg-transparent outline-none text-sm text-slate-200 px-2 placeholder:text-slate-600"
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
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    i === suggestionIndex
                      ? "bg-teal-500/20 text-teal-400"
                      : "hover:bg-slate-800 text-slate-400"
                  }`}
                >
                  <span className="text-lg">{emoji}</span>
                  <span className="text-xs font-mono">{code}</span>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            className="p-1"
            onClick={() => {
              setShowGifPicker(!showGifPicker);
              setShowEmojiPicker(false);
            }}
          >
            <span
              className={`mx-1 text-[10px] font-extrabold tracking-tight cursor-pointer transition-colors px-1.5 py-0.5 rounded-md border ${
                showGifPicker
                  ? "text-teal-400 border-teal-400/40 bg-teal-400/10"
                  : "text-slate-500 border-slate-600 hover:text-teal-400 hover:border-teal-400/40"
              }`}
            >
              GIF
            </span>
          </button>

          <button
            type="button"
            className="p-1"
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setShowGifPicker(false);
            }}
          >
            <Smile
              size={20}
              className={`mx-1 cursor-pointer transition-colors ${showEmojiPicker ? "text-teal-400" : "text-slate-500 hover:text-teal-400"}`}
            />
          </button>

          <button
            type="submit"
            className="bg-teal-400 p-2.5 rounded-xl text-black ml-2 hover:bg-teal-300 transition-colors active:scale-95 shadow-lg shadow-teal-400/10"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </main>
  );
}
