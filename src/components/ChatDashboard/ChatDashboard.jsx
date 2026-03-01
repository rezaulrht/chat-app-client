// src/components/ChatDashboard/ChatDashboard.jsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import Sidebar from "./SidebarChats";
import ChatWindow from "./ChatWindow";
import RightSidebar from "./RightSidebar";
import api from "@/app/api/Axios";
import { useSocket } from "@/hooks/useSocket";

export default function ChatDashboard() {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const { socket, fetchLastSeenTimes } = useSocket() || {};

  // Fetch all conversations for the logged-in user on mount
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get("/api/chat/conversations");
        setConversations(res.data);

        // Fetch last seen times for all conversation participants
        if (res.data.length > 0 && fetchLastSeenTimes) {
          const userIds = res.data
            .map((conv) => conv.participant?._id)
            .filter(Boolean);

          if (userIds.length > 0) {
            console.log(
              "Fetching last seen times for conversation participants:",
              userIds,
            );
            await fetchLastSeenTimes(userIds);
          }
        }

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
  }, [fetchLastSeenTimes]);

  // Ref to access current conversations in socket handlers without stale closures
  const conversationsRef = useRef([]);
  conversationsRef.current = conversations;

  // Global listener: update sidebar when any message arrives (sent or received)
  useEffect(() => {
    if (!socket) return;

    const handleGlobalMessage = async (msg) => {
      const exists = conversationsRef.current.find(
        (c) => c._id === msg.conversationId,
      );

      if (exists) {
        // Update lastMessage for the existing conversation
        setConversations((prev) =>
          prev.map((c) =>
            c._id === msg.conversationId
              ? {
                  ...c,
                  lastMessage: {
                    text: msg.text,
                    sender: msg.sender?._id || msg.sender,
                    timestamp: msg.createdAt,
                  },
                }
              : c,
          ),
        );
      } else {
        // New conversation from another user — fetch from server and add to list
        try {
          const res = await api.get("/api/chat/conversations");
          const newConv = res.data.find((c) => c._id === msg.conversationId);
          if (newConv) {
            setConversations((prev) => {
              if (prev.find((c) => c._id === newConv._id)) return prev;
              return [newConv, ...prev];
            });
            if (newConv.participant?._id && fetchLastSeenTimes) {
              fetchLastSeenTimes([newConv.participant._id]);
            }
          }
        } catch (err) {
          console.error("Failed to fetch new conversation:", err);
        }
      }
    };

    socket.on("message:new", handleGlobalMessage);

    return () => {
      socket.off("message:new", handleGlobalMessage);
    };
  }, [socket, fetchLastSeenTimes]);

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
      <div className="flex h-screen w-full bg-background-dark items-center justify-center flex-col gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
        </div>
        <p className="text-slate-600 text-xs">Loading conversations...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full bg-background-dark overflow-hidden font-sans">
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
      <RightSidebar />
    </div>
  );
}
