"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Phone, Video, Info, Plus, Smile, Send, X, Reply } from "lucide-react";
import api from "@/app/api/Axios";
import { useSocket } from "@/hooks/useSocket";
import useAuth from "@/hooks/useAuth";

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

// Helper function to format last seen time
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

export default function ChatWindow({ conversation }) {
  const { socket, onlineUsers } = useSocket() || {};
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const bottomRef = useRef(null);

  // Fetch message history
  useEffect(() => {
    if (!conversation?._id) return;

    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const res = await api.get(`/api/chat/messages/${conversation._id}`);
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [conversation?._id]);

  // Socket listeners
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

      // If I am receiver → mark as seen immediately
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
          // Delivered update
          if (update.messageId && m._id === update.messageId) {
            return { ...m, status: update.status };
          }

          // Bulk read update
          if (
            update.status === "read" &&
            m.sender?._id === user?._id &&
            m.status !== "read"
          ) {
            // Only mark messages up to lastSeenMessageId
            if (m._id <= update.upToMessageId) {
              return { ...m, status: "read" };
            }
          }

          return m;
        }),
      );
    };

    socket.on("message:new", handleReceive);
    socket.on("message:status", handleDelivered);

    return () => {
      socket.off("message:new", handleReceive);
      socket.off("message:status", handleDelivered);
    };
  }, [socket, conversation?._id, user?._id]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ------------------------------------------------
  // Send message
  // ------------------------------------------------
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

    socket.emit("message:send", {
      conversationId: conversation._id,
      receiverId: conversation.participant._id,
      text: optimistic.text,
      tempId,
      replyTo: replyTo?._id || null,
    });

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
      {/* Header */}
      <header className="h-[68px] border-b border-white/5 flex justify-between items-center px-5 bg-[#0a0e13]/80 backdrop-blur-sm shrink-0">
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

      {/* Messages */}
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
                className={`flex items-end gap-2 group ${
                  isMe ? "justify-end" : "justify-start"
                }`}
              >
                {!isMe && (
                  <Image
                    src={
                      participant?.avatar ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${participant?.name}`
                    }
                    width={28}
                    height={28}
                    className="rounded-full shrink-0 mb-0.5"
                    alt="avatar"
                    unoptimized
                  />
                )}
                <div
                  className={`flex flex-col gap-1 max-w-[68%] ${
                    isMe ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`px-4 py-3 text-sm leading-relaxed w-full ${
                      isMe
                        ? "bg-teal-normal text-white rounded-2xl rounded-br-sm shadow-lg shadow-teal-darker/30"
                        : "bg-[#161b21] text-slate-300 rounded-2xl rounded-bl-sm border border-white/5"
                    }`}
                  >
                    {/* Quoted reply preview */}
                    {msg.replyTo && (
                      <div
                        className={`mb-2 px-3 py-2 rounded-xl border-l-2 text-[11px] leading-snug ${
                          isMe
                            ? "bg-white/10 border-teal-light/60 text-teal-light/80"
                            : "bg-white/5 border-teal-normal/50 text-slate-400"
                        }`}
                      >
                        <p className="font-semibold mb-0.5 truncate">
                          {msg.replyTo.sender?.name ?? "Unknown"}
                        </p>
                        <p className="line-clamp-2 italic opacity-80">
                          {msg.replyTo.text}
                        </p>
                      </div>
                    )}
                    <p>{msg.text}</p>
                    <p
                      className={`text-[9px] mt-1.5 ${
                        isMe
                          ? "text-right text-teal-light/60"
                          : "text-left text-slate-600"
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {isMe && (
                    <div className="flex items-center gap-0.5 px-0.5">
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

                {/* Reply button — visible on row hover */}
                <button
                  onClick={() => setReplyTo(msg)}
                  title="Reply"
                  className={`opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-white/8 text-slate-500 hover:text-teal-400 shrink-0 self-center ${isMe ? "order-first" : ""}`}
                >
                  <Reply size={14} />
                </button>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-6">
        {replyTo && (
          <div className="bg-[#15191C] border-t border-x border-slate-800 rounded-t-2xl p-3 flex justify-between items-center animate-in slide-in-from-bottom-2">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-teal-400 rounded-full" />
              <div className="overflow-hidden">
                <p className="text-[10px] text-teal-400 font-bold uppercase">
                  Replying to {replyTo.sender?.name}
                </p>
                <p className="text-xs text-slate-500 line-clamp-1 italic">
                  "{replyTo.text}"
                </p>
              </div>
            </div>
            <button
              onClick={() => setReplyTo(null)}
              className="p-1.5 hover:bg-white/5 rounded-full text-slate-500 hover:text-red-400 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <form
          onSubmit={handleSend}
          className={`bg-[#15191C] flex items-center p-2.5 border border-slate-800 focus-within:border-teal-500/50 transition-all ${replyTo ? "rounded-b-2xl" : "rounded-2xl"}`}
        >
          <Plus
            size={20}
            className="text-slate-500 mx-2 cursor-pointer hover:text-teal-400 transition-colors"
          />
          <input
            className="flex-1 bg-transparent outline-none text-sm text-slate-200 placeholder:text-slate-600 py-1.5"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Smile
            size={20}
            className="text-slate-500 mx-2 cursor-pointer hover:text-teal-400 transition-colors"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="w-9 h-9 rounded-xl bg-teal-normal flex items-center justify-center text-white hover:bg-teal-normal-hover active:bg-teal-normal-active disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shrink-0 shadow-lg shadow-teal-darker/30"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </main>
  );
}
