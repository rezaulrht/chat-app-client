// src/components/ChatDashboard/ChatDashboard.jsx
"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "./SidebarChats";
import ChatWindow from "./ChatWindow";
import api from "@/app/api/Axios";

export default function ChatDashboard() {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [loadingConversations, setLoadingConversations] = useState(true);

  // Fetch all conversations for the logged-in user on mount
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get("/api/chat/conversations");
        setConversations(res.data);
        // Auto-select the first conversation if any exist
        if (res.data.length > 0) {
          setActiveConversationId(res.data[0]._id);
        }
      } catch (err) {
        console.error("Failed to fetch conversations:", err);
      } finally {
        setLoadingConversations(false);
      }
    };

    fetchConversations();
  }, []);

  const activeConversation = conversations.find(
    (c) => c._id === activeConversationId,
  );

  // Called by ChatWindow when a message is sent — update sidebar's lastMessage
  const handleMessageSent = (conversationId, text) => {
    setConversations((prev) =>
      prev.map((c) =>
        c._id === conversationId
          ? {
              ...c,
              lastMessage: {
                ...c.lastMessage,
                text,
                timestamp: new Date().toISOString(),
              },
            }
          : c,
      ),
    );
  };

  // Called when a new conversation is started from the search modal
  const handleNewConversation = (conversation) => {
    // Add to list if it doesn't already exist
    setConversations((prev) => {
      const exists = prev.find((c) => c._id === conversation._id);
      if (exists) return prev;
      return [conversation, ...prev];
    });
    setActiveConversationId(conversation._id);
  };

  if (loadingConversations) {
    return (
      <div className="flex h-screen w-full bg-[#05050A] items-center justify-center">
        <p className="text-slate-500 text-sm">Loading conversations...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#05050A] overflow-hidden font-sans">
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        setActiveConversationId={setActiveConversationId}
        onNewConversation={handleNewConversation}
      />
      <ChatWindow
        conversation={activeConversation}
        onMessageSent={handleMessageSent}
      />
    </div>
  );
}
