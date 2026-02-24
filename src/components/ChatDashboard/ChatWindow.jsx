"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Phone, Video, Info, Plus, Smile, Send, X } from "lucide-react";
import api from "@/app/api/Axios";
import { useSocket } from "@/hooks/useSocket";
import useAuth from "@/hooks/useAuth";

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
      <header className="h-20 border-b border-slate-800/50 flex justify-between items-center px-6 backdrop-blur-md bg-[#0B0E11]/80 z-20">
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
              alt="avatar"
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
                <span className="text-green-500 font-medium">Online</span>
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
          <Phone
            size={18}
            className="cursor-pointer hover:text-white transition-colors"
          />
          <Video
            size={18}
            className="cursor-pointer hover:text-white transition-colors"
          />
          <Info
            size={18}
            className="cursor-pointer hover:text-white transition-colors"
          />
        </div>
      </header>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col scrollbar-thin scrollbar-thumb-slate-800">
        {loadingMessages && (
          <p className="text-center text-slate-600 text-xs">
            Loading sync history...
          </p>
        )}

        {messages.map((msg) => {
          const isMe =
            msg.sender?._id === user?._id || msg.sender === user?._id;

          return (
            <div
              key={msg._id}
              id={msg._id}
              className={`flex ${isMe ? "justify-end" : "justify-start animate-in fade-in slide-in-from-left-2"}`}
            >
              <div
                className={`max-w-[75%] p-4 rounded-2xl text-sm transition-all ${
                  isMe
                    ? "bg-teal-900/20 text-white rounded-br-none border border-teal-500/20 shadow-lg"
                    : "bg-[#1C2227] text-slate-300 rounded-bl-none border border-white/5"
                } ${msg.isOptimistic ? "opacity-50" : "opacity-100"}`}
              >
                {/* Premium Reply Block */}
                {msg.replyTo && (
                  <div
                    className={`mb-3 flex flex-col border-l-2 ${isMe ? "border-teal-400 bg-teal-400/5" : "border-slate-500 bg-slate-500/10"} p-2.5 rounded-r-lg backdrop-blur-sm cursor-pointer hover:bg-white/5 transition-all`}
                    onClick={() =>
                      document.getElementById(msg.replyTo._id)?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      })
                    }
                  >
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isMe ? "text-teal-300" : "text-slate-400"}`}
                    >
                      {msg.replyTo.sender?.name}
                    </span>
                    <p className="text-[11px] leading-relaxed line-clamp-2 opacity-70 italic font-light">
                      "{msg.replyTo.text}"
                    </p>
                  </div>
                )}

                <p className="leading-relaxed">{msg.text}</p>

                <div className="flex items-center justify-end gap-2 mt-2">
                  <span className="text-[9px] opacity-40">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {!isMe && (
                    <button
                      onClick={() => setReplyTo(msg)}
                      className="text-[10px] font-bold text-slate-500 hover:text-teal-400 transition-colors uppercase tracking-tighter"
                    >
                      Reply
                    </button>
                  )}
                </div>
              </div>
            </div>
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
            className="flex-1 bg-transparent outline-none text-sm text-slate-200 px-2 placeholder:text-slate-600"
            placeholder="Type your message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Smile
            size={20}
            className="text-slate-500 mx-2 cursor-pointer hover:text-teal-400 transition-colors"
          />
          <button
            type="submit"
            className="bg-teal-400 p-2.5 rounded-xl text-black ml-2 hover:bg-teal-300 transition-all active:scale-90 shadow-lg shadow-teal-500/20"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </main>
  );
}
