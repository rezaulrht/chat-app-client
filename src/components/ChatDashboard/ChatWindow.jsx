// src/components/ChatDashboard/ChatWindow.jsx
"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Phone, Video, Info, Plus, Smile, Send } from "lucide-react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
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
  const [reactions, setReactions] = useState({}); // { msgId: { '👍': ['userId1'], '❤️': ['userId2'] } }
  const [reactionPickerMsgId, setReactionPickerMsgId] = useState(null);
  const bottomRef = useRef(null);
  const reactionPickerRef = useRef(null);

  // Close reaction picker on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        reactionPickerRef.current &&
        !reactionPickerRef.current.contains(e.target)
      ) {
        setReactionPickerMsgId(null);
      }
    };
    if (reactionPickerMsgId) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [reactionPickerMsgId]);

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

  // Fetch message history whenever the active conversation changes
  useEffect(() => {
    if (!conversation?._id) return;

    const fetchMessages = async () => {
      setLoadingMessages(true);
      setMessages([]);
      setReactions({});
      try {
        const res = await api.get(`/api/chat/messages/${conversation._id}`);
        setMessages(res.data);
        // Build reactions state from fetched messages
        const rxns = {};
        for (const msg of res.data) {
          if (msg.reactions && typeof msg.reactions === "object") {
            const entries =
              msg.reactions instanceof Map
                ? Object.fromEntries(msg.reactions)
                : msg.reactions;
            if (Object.keys(entries).length > 0) {
              rxns[msg._id] = entries;
            }
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

    // Live reaction update from server
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
              <div className="relative group max-w-[70%] w-fit">
                {/* Hover Actions — single row, top-right */}
                {!msg.isOptimistic && (
                  <div
                    className={`absolute -top-5 ${isMe ? "right-0" : "left-0"} hidden group-hover:flex items-center gap-0.5 bg-[#15191C] border border-slate-700/60 rounded-lg p-0.5 shadow-xl shadow-black/40 z-20`}
                  >
                    {["👍", "❤️", "😂", "😮", "😢"].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleReaction(msg._id, emoji);
                        }}
                        className={`text-sm p-1 rounded-md transition-all duration-150 hover:bg-slate-700/60 hover:scale-110 ${
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

                {/* Reactions display */}
                {reactions[msg._id] &&
                  Object.keys(reactions[msg._id]).length > 0 && (
                    <div
                      className={`flex flex-wrap gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      {Object.entries(reactions[msg._id]).map(
                        ([emoji, users]) => (
                          <button
                            key={emoji}
                            onClick={() => toggleReaction(msg._id, emoji)}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-all duration-150 ${
                              users.includes(user?._id)
                                ? "bg-teal-900/30 border-teal-500/40 text-teal-300"
                                : "bg-[#1C2227] border-slate-700/50 text-slate-400 hover:border-slate-600"
                            }`}
                          >
                            <span>{emoji}</span>
                            <span className="text-[10px]">{users.length}</span>
                          </button>
                        ),
                      )}
                    </div>
                  )}

                {/* Full Reaction Picker — opens beside the message */}
                {reactionPickerMsgId === msg._id && (
                  <div
                    ref={reactionPickerRef}
                    className={`absolute top-0 z-50 ${isMe ? "right-full mr-2" : "left-full ml-2"}`}
                  >
                    <Picker
                      data={data}
                      onEmojiSelect={(emoji) =>
                        toggleReaction(msg._id, emoji.native)
                      }
                      theme="dark"
                      previewPosition="none"
                      skinTonePosition="none"
                      set="native"
                      perLine={8}
                      maxFrequentRows={1}
                    />
                  </div>
                )}
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
