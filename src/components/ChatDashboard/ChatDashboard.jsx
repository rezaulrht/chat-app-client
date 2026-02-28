// src/components/ChatDashboard/ChatDashboard.jsx
"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Sidebar from "./SidebarChats";
import ChatWindow from "./ChatWindow";
import api from "@/app/api/Axios";
import { useSocket } from "@/hooks/useSocket";

export default function ChatDashboard() {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const { socket, fetchLastSeenTimes } = useSocket() || {};

  // Fetch all conversations for the logged-in user on mount (only once)
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get("/api/chat/conversations");
        // Sort conversations: pinned first, then by most recent
        const sorted = res.data.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return new Date(b.updatedAt || b.lastMessage?.timestamp || 0).getTime() -
            new Date(a.updatedAt || a.lastMessage?.timestamp || 0).getTime();
        });
        setConversations(sorted);

        // Fetch last seen times for all conversation participants
        if (sorted.length > 0 && fetchLastSeenTimes) {
          const userIds = sorted
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

        // Auto-select the first conversation if any exist (uses sorted order)
        if (sorted.length > 0) {
          setActiveConversationId(sorted[0]._id);
        }
      } catch (err) {
        console.error("Failed to fetch conversations:", err);
      } finally {
        setLoadingConversations(false);
      }
    };

    fetchConversations();
  }, []); // Empty dependency array - load conversations only once on mount

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
        // Update lastMessage and move to top by updating both lastMessage and updatedAt
        setConversations((prev) => {
          const updated = prev.map((c) =>
            c._id === msg.conversationId
              ? {
                ...c,
                lastMessage: {
                  text: msg.text,
                  sender: msg.sender?._id || msg.sender,
                  timestamp: msg.createdAt,
                },
                updatedAt: msg.createdAt, // Update to move conversation to top
              }
              : c,
          );
          // Sort: pinned first, then by most recent messages within each group
          return updated.sort((a, b) => {
            // Pinned conversations always come first
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            // Within the same group (both pinned or both non-pinned), sort by most recent
            return new Date(b.updatedAt || b.lastMessage?.timestamp || 0).getTime() -
              new Date(a.updatedAt || a.lastMessage?.timestamp || 0).getTime();
          });
        });
      } else {
        // New conversation from another user — fetch from server and add to list
        try {
          const res = await api.get("/api/chat/conversations");
          const newConv = res.data.find((c) => c._id === msg.conversationId);
          if (newConv) {
            setConversations((prev) => {
              if (prev.find((c) => c._id === newConv._id)) return prev;
              const updated = [newConv, ...prev];
              // Sort: pinned first, then by most recent within each group
              return updated.sort((a, b) => {
                if (a.isPinned && !b.isPinned) return -1;
                if (!a.isPinned && b.isPinned) return 1;
                return new Date(b.updatedAt || b.lastMessage?.timestamp || 0).getTime() -
                  new Date(a.updatedAt || a.lastMessage?.timestamp || 0).getTime();
              });
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

    const handleUnreadUpdate = ({ conversationId, unreadCount }) => {
      // Only update unread count, don't change the sort order
      // (Conversations should not move when messages are just being read)
      setConversations((prev) =>
        prev.map((c) =>
          c._id === conversationId
            ? { ...c, unreadCount }
            : c,
        ),
      );
    };

    const handleMessageStatus = (update) => {
      // When messages are marked as read, clear unread count
      if (update.status === "read") {
        setConversations((prev) =>
          prev.map((c) =>
            c._id === update.conversationId
              ? { ...c, unreadCount: 0 }
              : c,
          ),
        );
      }
    };

    socket.on("message:new", handleGlobalMessage);
    socket.on("unread:update", handleUnreadUpdate);
    socket.on("message:status", handleMessageStatus);

    return () => {
      socket.off("message:new", handleGlobalMessage);
      socket.off("unread:update", handleUnreadUpdate);
      socket.off("message:status", handleMessageStatus);
    };
  }, [socket, fetchLastSeenTimes]);

  const activeConversation = conversations.find(
    (c) => c._id === activeConversationId,
  );

  // Called by ChatWindow when a message is sent — update sidebar's lastMessage
  const handleMessageSent = useCallback((conversationId, text) => {
    setConversations((prev) => {
      const updated = prev.map((c) =>
        c._id === conversationId
          ? {
            ...c,
            lastMessage: {
              ...c.lastMessage,
              text,
              timestamp: new Date().toISOString(),
            },
            updatedAt: new Date().toISOString(),
          }
          : c,
      );
      // Sort: pinned first, then by most recent within each group
      return updated.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.updatedAt || b.lastMessage?.timestamp || 0).getTime() -
          new Date(a.updatedAt || a.lastMessage?.timestamp || 0).getTime();
      });
    });
  }, []);

  // Called when a new conversation is started from the search modal
  const handleNewConversation = useCallback((conversation) => {
    // Add to list if it doesn't already exist
    setConversations((prev) => {
      const exists = prev.find((c) => c._id === conversation._id);
      if (exists) return prev;
      const updated = [conversation, ...prev];
      // Sort: pinned first, then by most recent within each group
      return updated.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.updatedAt || b.lastMessage?.timestamp || 0).getTime() -
          new Date(a.updatedAt || a.lastMessage?.timestamp || 0).getTime();
      });
    });
    setActiveConversationId(conversation._id);
  }, []);

  // Called when conversation is updated (pin/archive/mute)
  const handleConversationUpdate = useCallback((updatedConversations) => {
    // Sort: pinned first, then by most recent within each group
    const sorted = updatedConversations.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt || b.lastMessage?.timestamp || 0).getTime() -
        new Date(a.updatedAt || a.lastMessage?.timestamp || 0).getTime();
    });
    setConversations(sorted);
  }, []);

  // Called when messages are marked as seen in ChatWindow
  const handleMessagesSeen = useCallback((conversationId) => {
    setConversations((prev) => {
      let changed = false;

      const next = prev.map((c) => {
        if (c._id === conversationId && c.unreadCount !== 0) {
          changed = true;
          return { ...c, unreadCount: 0 };
        }
        return c;
      });

      return changed ? next : prev;
    });
  }, []);

  // Clear unread count when conversation is opened
  useEffect(() => {
    if (activeConversationId) {
      setConversations((prev) => {
        let changed = false;

        const next = prev.map((c) => {
          if (c._id === activeConversationId && c.unreadCount !== 0) {
            changed = true;
            return { ...c, unreadCount: 0 };
          }
          return c;
        });

        return changed ? next : prev;
      });
    }
  }, [activeConversationId]);

  if (loadingConversations) {
    return (
      <div className="flex h-screen w-full bg-[#080b0f] items-center justify-center flex-col gap-4">
        <div className="w-12 h-12 rounded-2xl bg-teal-normal/10 border border-teal-normal/20 flex items-center justify-center">
          <div className="w-5 h-5 rounded-full border-2 border-teal-normal border-t-transparent animate-spin"></div>
        </div>
        <p className="text-slate-600 text-xs">Loading conversations...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#080b0f] overflow-hidden font-sans">
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        setActiveConversationId={setActiveConversationId}
        onNewConversation={handleNewConversation}
        onConversationUpdate={handleConversationUpdate}
      />
      <ChatWindow
        conversation={activeConversation}
        onMessageSent={handleMessageSent}
        onMessagesSeen={handleMessagesSeen}
      />
    </div>
  );
}
