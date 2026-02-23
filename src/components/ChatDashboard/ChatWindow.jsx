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

  // Listen for incoming messages and delivery acks on the socket
  useEffect(() => {
    if (!socket) return;

    // A new message arrived from the other user
    const handleReceive = (msg) => {
      if (msg.conversationId !== conversation?._id) return;
      setMessages((prev) => [...prev, msg]);
    };

    // Our sent message was saved — replace the optimistic temp entry with the real one
    const handleDelivered = (msg) => {
      if (msg.conversationId !== conversation?._id) return;
      setMessages((prev) =>
        prev.map((m) => (m._id === msg.tempId ? { ...msg } : m)),
      );
      onMessageSent(msg.conversationId, msg.text);
    };

    socket.on("message:receive", handleReceive);
    socket.on("message:delivered", handleDelivered);

    return () => {
      socket.off("message:receive", handleReceive);
      socket.off("message:delivered", handleDelivered);
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
              {/* Wrapper for bubble + hover toolbar */}
              <div className="relative group max-w-[70%]">
                {/* Hover Actions — floats below the bubble */}
                {!msg.isOptimistic && (
                  <div
                    className={`absolute -bottom-4 ${isMe ? "right-1" : "left-1"} hidden group-hover:flex items-center gap-0.5 bg-[#15191C] border border-slate-700/60 rounded-lg p-0.5 shadow-xl shadow-black/40 z-20`}
                  >
                    <button
                      className="p-1.5 text-slate-400 hover:text-teal-400 hover:bg-slate-700/60 rounded-md transition-all duration-150"
                      title="React"
                    >
                      <Smile size={15} />
                    </button>
                    <button
                      className="p-1.5 text-slate-400 hover:text-teal-400 hover:bg-slate-700/60 rounded-md transition-all duration-150"
                      title="Reply"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="15"
                        height="15"
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
                          className="p-1.5 text-slate-400 hover:text-teal-400 hover:bg-slate-700/60 rounded-md transition-all duration-150"
                          title="Edit"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="15"
                            height="15"
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
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700/60 rounded-md transition-all duration-150"
                          title="Delete"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="15"
                            height="15"
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
                  className={`p-4 rounded-2xl text-sm ${
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
