"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Phone, Video, Info, Plus, Smile, Send } from "lucide-react";
import api from "@/app/api/Axios";
import { useSocket } from "@/hooks/useSocket";
import useAuth from "@/hooks/useAuth";

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

  const bottomRef = useRef(null);

  // ------------------------------------------------
  // Fetch messages
  // ------------------------------------------------
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

  // ------------------------------------------------
  // Auto mark messages as seen when conversation opens
  // ------------------------------------------------
  useEffect(() => {
    if (!socket || !conversation?._id || !messages.length) return;

    const unreadMessages = messages.filter(
      (m) => m.sender?._id !== user?._id && m.status !== "read",
    );

    if (unreadMessages.length > 0) {
      const lastUnread = unreadMessages[unreadMessages.length - 1];

      socket.emit("conversation:seen", {
        conversationId: conversation._id,
        lastSeenMessageId: lastUnread._id,
      });
    }
  }, [messages, socket, conversation?._id, user?._id]);

  // ------------------------------------------------
  // Socket listeners
  // ------------------------------------------------
  useEffect(() => {
    if (!socket) return;

    // New message
    const handleNewMessage = (msg) => {
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

    // Status updates (delivered / read)
    const handleStatus = (update) => {
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

    socket.on("message:new", handleNewMessage);
    socket.on("message:status", handleStatus);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("message:status", handleStatus);
    };
  }, [socket, conversation?._id, user?._id]);

  // ------------------------------------------------
  // Auto scroll
  // ------------------------------------------------
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
    };

    setMessages((prev) => [...prev, optimistic]);
    setText("");

    socket.emit("message:send", {
      conversationId: conversation._id,
      receiverId: conversation.participant._id,
      text: optimistic.text,
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
                 {" "}
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

      {/* Messages */}
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
                    ? `bg-teal-900/20 text-white rounded-br-none border border-teal-500/20 shadow-lg shadow-teal-500/5`
                    : "bg-[#1C2227] text-slate-300 rounded-bl-none"
                }`}
              >
                {msg.text}
                <div className="text-[9px] mt-2 opacity-50 text-right flex items-center gap-1 justify-end">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}

                  {isMe && (
                    <span className="ml-1">
                      {msg.status === "sent" && (
                        <span className="text-gray-500">Sent ✓</span>
                      )}
                      {msg.status === "delivered" && (
                        <span className="text-gray-500">Delivered ✓✓</span>
                      )}
                      {msg.status === "read" && (
                        <span className="text-teal-500">Seen ✓✓</span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-6">
        <div className="bg-[#15191C] rounded-2xl flex items-center p-2.5 border border-slate-800 focus-within:border-teal-500/50 transition-all">
          <Plus size={20} className="text-slate-500 mx-2" />
          <input
            className="flex-1 bg-transparent outline-none text-sm text-slate-200 px-2"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Smile size={20} className="text-slate-500 mx-2" />
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
