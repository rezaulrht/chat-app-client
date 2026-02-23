// src/components/ChatDashboard/ChatWindow.jsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Phone, Video, Info, Plus, Smile, Send } from "lucide-react";
import api from "@/app/api/Axios";
import { useSocket } from "@/hooks/useSocket";
import useAuth from "@/hooks/useAuth";

// Helper function to format last seen time - show actual timestamp
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
  const bottomRef = useRef(null);

  // Fetch message history whenever the active conversation changes
  useEffect(() => {
    if (!conversation?._id) return;

    const fetchMessages = async () => {
      setLoadingMessages(true);
      setMessages([]);
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

  // Listen for new messages (incoming + ack for own sent messages) and status updates
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      if (msg.conversationId !== conversation?._id) return;

      const isOwnMessage =
        msg.sender?._id === user?._id || msg.sender === user?._id;

      if (isOwnMessage && msg.tempId) {
        // Server ack — replace the optimistic temp entry with the real message
        setMessages((prev) =>
          prev.map((m) => (m._id === msg.tempId ? { ...msg } : m)),
        );
        onMessageSent(msg.conversationId, msg.text);
      } else if (!isOwnMessage) {
        // Incoming message from another user
        setMessages((prev) => [...prev, msg]);
      }
    };

    // Handle delivery/read status updates (ticks)
    const handleStatusUpdate = (update) => {
      if (update.conversationId !== conversation?._id) return;

      if (update.messageId) {
        // Single message status update (delivered)
        setMessages((prev) =>
          prev.map((m) =>
            m._id === update.messageId
              ? {
                  ...m,
                  status: update.status,
                  deliveredAt: update.deliveredAt,
                  seenAt: update.seenAt,
                }
              : m,
          ),
        );
      } else if (update.upToMessageId) {
        // Bulk status update (conversation:seen — read receipts)
        setMessages((prev) => {
          const pivotIdx = prev.findIndex(
            (m) => m._id === update.upToMessageId,
          );
          if (pivotIdx === -1) return prev;
          return prev.map((m, i) =>
            i <= pivotIdx && m.status !== "read"
              ? { ...m, status: update.status, seenAt: update.seenAt }
              : m,
          );
        });
      }
    };

    socket.on("message:new", handleNewMessage);
    socket.on("message:status", handleStatusUpdate);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("message:status", handleStatusUpdate);
    };
  }, [socket, conversation?._id, onMessageSent, user?._id]);

  // Auto-scroll to the latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() || !socket || !conversation) return;

    const tempId = `temp-${Date.now()}`;

    // Optimistic message — shown immediately before server ack
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
            {/* Online indicator in header */}
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
          return (
            <div
              key={msg._id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] p-4 rounded-2xl text-sm ${
                  isMe
                    ? `bg-teal-900/20 text-white rounded-br-none border border-teal-500/20 shadow-lg shadow-teal-500/5 ${msg.isOptimistic ? "opacity-60" : ""}`
                    : "bg-[#1C2227] text-slate-300 rounded-bl-none"
                }`}
              >
                {msg.text}
                <div className="text-[9px] mt-2 opacity-50 text-right">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-6">
        <div className="bg-[#15191C] rounded-2xl flex items-center p-2.5 border border-slate-800 focus-within:border-teal-500/50 transition-all">
          <Plus
            size={20}
            className="text-slate-500 mx-2 cursor-pointer hover:text-teal-400"
          />
          <input
            className="flex-1 bg-transparent outline-none text-sm text-slate-200 px-2"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Smile
            size={20}
            className="text-slate-500 mx-2 cursor-pointer hover:text-teal-400"
          />
          <button
            type="submit"
            className="bg-teal-400 p-2.5 rounded-xl text-black ml-2 hover:bg-teal-300 transition-colors active:scale-95"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </main>
  );
}
