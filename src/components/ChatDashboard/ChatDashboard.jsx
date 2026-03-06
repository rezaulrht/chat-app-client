// src/components/ChatDashboard/ChatDashboard.jsx
"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";

import Sidebar from "./SidebarChats";
import ChatWindow from "./ChatWindow";
import GroupInfoPanel from "./GroupInfoPanel";
import api from "@/app/api/Axios";
import { useSocket } from "@/hooks/useSocket";
import useAuth from "@/hooks/useAuth";
import { sortConversations } from "@/utils/sortConversations";
import { toast } from "sonner";

export default function ChatDashboard() {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [loadingConversations, setLoadingConversations] = useState(true);
  // Controls the slide-out GroupInfoPanel beside ChatWindow
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const { socket, fetchLastSeenTimes } = useSocket() || {};
  const { user } = useAuth(); // ← New (for self-message check)

  // Refs to avoid stale closures in socket handlers
  const conversationsRef = useRef([]);
  const activeConversationIdRef = useRef(null);
  conversationsRef.current = conversations;
  activeConversationIdRef.current = activeConversationId;
  const { user: currentUser } = useAuth();

  // Fetch all conversations for the logged-in user on mount (only once)
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get("/api/chat/conversations");
        const sorted = sortConversations(res.data);
        setConversations(sorted);

        // Fetch last seen times for all conversation participants
        if (sorted.length > 0 && fetchLastSeenTimes) {
          const userIds = sorted
            .filter((conv) => conv.type !== "group")
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
        // Update lastMessage and move to top by updating both lastMessage and updatedAt
        setConversations((prev) => {
          const updated = prev.map((c) =>
            c._id === msg.conversationId
              ? {
                  ...c,
                  lastMessage: {
                    text: msg.text,
                    gifUrl: msg.gifUrl,
                    // Keep populated sender object for group last-message preview
                    sender: msg.sender || null,
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

    // ── Group lifecycle events ───────────────────────────────────────

    // Someone created a group and added us — add it to the list
    const handleGroupCreated = ({ conversation }) => {
      if (!conversation) return;
      setConversations((prev) => {
        if (prev.find((c) => c._id === conversation._id)) return prev;
        return sortConversations([conversation, ...prev]);
      });
    };

    // Group was deleted — remove it; deselect if active
    const handleGroupDeleted = ({ conversationId }) => {
      setConversations((prev) => prev.filter((c) => c._id !== conversationId));
      setActiveConversationId((prev) =>
        prev === conversationId ? null : prev,
      );
      setShowGroupInfo(false);
    };

    // Name or avatar updated by an admin
    const handleGroupUpdated = ({ conversationId, name, avatar }) => {
      setConversations((prev) =>
        prev.map((c) =>
          c._id === conversationId ? { ...c, name, avatar } : c,
        ),
      );
    };

    // We were forcibly removed from a group
    const handleGroupRemoved = ({ conversationId }) => {
      setConversations((prev) => prev.filter((c) => c._id !== conversationId));
      setActiveConversationId((prev) =>
        prev === conversationId ? null : prev,
      );
      setShowGroupInfo(false);
    };

    // Members added/removed, someone left, or admin list changed
    // → re-fetch that conversation to get the updated participants/admins arrays
    const handleGroupRefetch = async ({ conversationId }) => {
      if (!conversationId) return;
      try {
        const res = await api.get(`/api/chat/conversations/${conversationId}`);
        const updated = res.data;
        setConversations((prev) =>
          prev.map((c) =>
            c._id === conversationId ? { ...c, ...updated } : c,
          ),
        );
      } catch (err) {
        // 403 means we're no longer a participant — remove from list
        if (err.response?.status === 403) {
          setConversations((prev) =>
            prev.filter((c) => c._id !== conversationId),
          );
          setActiveConversationId((prev) =>
            prev === conversationId ? null : prev,
          );
        }
        console.warn("Group refetch failed:", err.message);
      }
    };

    socket.on("message:new", handleGlobalMessage);
    socket.on("unread:update", handleUnreadUpdate);
    socket.on("message:status", handleMessageStatus);
    socket.on("group:created", handleGroupCreated);
    socket.on("group:deleted", handleGroupDeleted);
    socket.on("group:updated", handleGroupUpdated);
    socket.on("group:removed", handleGroupRemoved);
    socket.on("group:members-added", handleGroupRefetch);
    socket.on("group:members-removed", handleGroupRefetch);
    socket.on("group:member-left", handleGroupRefetch);
    socket.on("group:admin-updated", handleGroupRefetch);

    return () => {
      socket.off("message:new", handleGlobalMessage);
      socket.off("unread:update", handleUnreadUpdate);
      socket.off("message:status", handleMessageStatus);
      socket.off("group:created", handleGroupCreated);
      socket.off("group:deleted", handleGroupDeleted);
      socket.off("group:updated", handleGroupUpdated);
      socket.off("group:removed", handleGroupRemoved);
      socket.off("group:members-added", handleGroupRefetch);
      socket.off("group:members-removed", handleGroupRefetch);
      socket.off("group:member-left", handleGroupRefetch);
      socket.off("group:admin-updated", handleGroupRefetch);
    };
  }, [socket, fetchLastSeenTimes, user, showNewMessageToast]);

  const activeConversation = conversations.find(
    (c) => c._id === activeConversationId,
  );

  // Called by ChatWindow when a message is sent — update sidebar's lastMessage
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

  // Called when conversation is updated (pin/archive/mute)
  const handleConversationUpdate = useCallback((updated) => {
    // Array → full list refresh (from SidebarChats pin/mute/archive/leave)
    if (Array.isArray(updated)) {
      setConversations(sortConversations(updated));
      return;
    }
    // Single object with _removed / _deleted flag → remove from list
    if (updated._removed || updated._deleted) {
      setConversations((prev) => prev.filter((c) => c._id !== updated._id));
      setActiveConversationId((prev) => (prev === updated._id ? null : prev));
      setShowGroupInfo(false);
      return;
    }
    // Single updated conversation → merge into list
    setConversations((prev) =>
      sortConversations(
        prev.map((c) => (c._id === updated._id ? { ...c, ...updated } : c)),
      ),
    );
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
        setActiveConversationId={(id) => {
          setActiveConversationId(id);
          // Close info panel when switching conversations
          setShowGroupInfo(false);
        }}
        onNewConversation={handleNewConversation}
        onConversationUpdate={handleConversationUpdate}
      />
      <ChatWindow
        conversation={activeConversation}
        onMessageSent={handleMessageSent}
        onMessagesSeen={handleMessagesSeen}
        showGroupInfo={showGroupInfo}
        onToggleGroupInfo={() => setShowGroupInfo((v) => !v)}
        onConversationUpdate={handleConversationUpdate}
        conversations={conversations}
      />
      {showGroupInfo && activeConversation?.type === "group" && (
        <GroupInfoPanel
          conversation={activeConversation}
          currentUser={currentUser}
          onClose={() => setShowGroupInfo(false)}
          onConversationUpdate={handleConversationUpdate}
        />
      )}
    </div>
  );
}
