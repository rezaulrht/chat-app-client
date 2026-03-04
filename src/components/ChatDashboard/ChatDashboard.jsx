// src/components/ChatDashboard/ChatDashboard.jsx
"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";

import Sidebar from "./SidebarChats";
import ChatWindow from "./ChatWindow";
import api from "@/app/api/Axios";
import { useSocket } from "@/hooks/useSocket";
import { sortConversations } from "@/utils/sortConversations";

import useAuth from "@/hooks/useAuth"; // ← Added
import { toast } from "sonner";

export default function ChatDashboard() {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const { socket, fetchLastSeenTimes } = useSocket() || {};
  const { user } = useAuth(); // ← New (for self-message check)

  // Refs to avoid stale closures in socket handlers
  const conversationsRef = useRef([]);
  const activeConversationIdRef = useRef(null);
  conversationsRef.current = conversations;
  activeConversationIdRef.current = activeConversationId;

  // Fetch all conversations for the logged-in user on mount (only once)
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get("/api/chat/conversations");
        const sorted = sortConversations(res.data);
        setConversations(sorted);

        if (sorted.length > 0 && fetchLastSeenTimes) {
          const userIds = sorted
            .map((conv) => conv.participant?._id)
            .filter(Boolean);

          if (userIds.length > 0) {
            fetchLastSeenTimes(userIds);
          }
        }

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
  }, [fetchLastSeenTimes]);

  // Toast for new messages when user is NOT in the active chat
  const showNewMessageToast = useCallback(
    (msg) => {
      if (!msg.sender?.name) return;

      toast(`💬 New message from ${msg.sender.name}`, {
        description: msg.gifUrl
          ? "Sent a GIF"
          : msg.text
            ? msg.text.length > 65
              ? msg.text.slice(0, 62) + "..."
              : msg.text
            : "",
        action: {
          label: "Open Chat",
          onClick: () => setActiveConversationId(msg.conversationId),
        },
        duration: 4000,
        richColors: true,
      });
    },
    [setActiveConversationId],
  );

  // Global listener: update sidebar when any message arrives + show toast
  useEffect(() => {
    if (!socket) return;

    const handleGlobalMessage = async (msg) => {
      // 🔥 TOAST ONLY WHEN NOT IN THIS CHAT AND NOT OUR OWN MESSAGE
      const isInActiveChat =
        activeConversationIdRef.current === msg.conversationId;
        const isMyMessage =
          user?._id && String(msg.sender?._id) === String(user._id);

      if (!isInActiveChat && !isMyMessage) {
        showNewMessageToast(msg);
      }

      // === YOUR ORIGINAL LOGIC (unchanged) ===
      const exists = conversationsRef.current.find(
        (c) => c._id === msg.conversationId,
      );

      if (exists) {
        setConversations((prev) => {
          const updated = prev.map((c) =>
            c._id === msg.conversationId
              ? {
                  ...c,
                  lastMessage: {
                    text: msg.text,
                    gifUrl: msg.gifUrl,
                    sender: msg.sender?._id || msg.sender,
                    timestamp: msg.createdAt,
                  },
                  updatedAt: msg.createdAt,
                }
              : c,
          );
          return sortConversations(updated);
        });
      } else {
        try {
          const res = await api.get("/api/chat/conversations");
          const newConv = res.data.find((c) => c._id === msg.conversationId);
          if (newConv) {
            setConversations((prev) => {
              if (prev.find((c) => c._id === newConv._id)) return prev;
              const updated = [newConv, ...prev];
              return sortConversations(updated);
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
      setConversations((prev) =>
        prev.map((c) => (c._id === conversationId ? { ...c, unreadCount } : c)),
      );
    };

    const handleMessageStatus = (update) => {
      if (update.status === "read") {
        setConversations((prev) =>
          prev.map((c) =>
            c._id === update.conversationId ? { ...c, unreadCount: 0 } : c,
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
  }, [socket, fetchLastSeenTimes, user, showNewMessageToast]);

  const activeConversation = conversations.find(
    (c) => c._id === activeConversationId,
  );

  const handleMessageSent = useCallback(
    (conversationId, text, gifUrl = null) => {
      setConversations((prev) => {
        const updated = prev.map((c) =>
          c._id === conversationId
            ? {
                ...c,
                lastMessage: {
                  ...c.lastMessage,
                  text,
                  gifUrl,
                  timestamp: new Date().toISOString(),
                },
                updatedAt: new Date().toISOString(),
              }
            : c,
        );
        return sortConversations(updated);
      });
    },
    [],
  );

  const handleNewConversation = useCallback((conversation) => {
    setConversations((prev) => {
      const exists = prev.find((c) => c._id === conversation._id);
      if (exists) return prev;
      const updated = [conversation, ...prev];
      return sortConversations(updated);
    });
    setActiveConversationId(conversation._id);
  }, []);

  const handleConversationUpdate = useCallback((updatedConversations) => {
    const sorted = sortConversations(updatedConversations);
    setConversations(sorted);
  }, []);

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
