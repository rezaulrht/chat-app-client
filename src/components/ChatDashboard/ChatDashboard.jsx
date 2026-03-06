// src/components/ChatDashboard/ChatDashboard.jsx
"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";

import Sidebar from "./SidebarChats";
import ChannelSidebar from "./ChannelSidebar";
import ChatWindow from "./ChatWindow";
import GroupInfoPanel from "./GroupInfoPanel";
import WorkspaceSidebar from "./WorkspaceSidebar";
import FeedView from "./FeedView";
import api from "@/app/api/Axios";
import { useSocket } from "@/hooks/useSocket";
import useAuth from "@/hooks/useAuth";
import { sortConversations } from "@/utils/sortConversations";
import toast from "react-hot-toast";

export default function ChatDashboard() {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [loadingConversations, setLoadingConversations] = useState(true);
  // Controls the slide-out GroupInfoPanel beside ChatWindow
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const { socket, fetchLastSeenTimes } = useSocket() || {};
  const { user } = useAuth(); // ← New (for self-message check)

  // Workspace and Channel states
  const [activeView, setActiveView] = useState("home"); // 'home' or 'workspace'
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(null);

  // Responsive sidebar states
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);

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

      const description = msg.gifUrl
        ? "Sent a GIF"
        : msg.text
          ? msg.text.length > 65
            ? msg.text.slice(0, 62) + "..."
            : msg.text
          : "";

      toast.custom(
        (t) => (
          <div
            className={`flex flex-col gap-1 px-4 py-3 rounded-xl shadow-xl border border-teal-normal/20 bg-[#15191C] text-slate-200 text-sm min-w-[260px] max-w-[340px] transition-all ${
              t.visible
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-2"
            }`}
          >
            <p className="font-semibold text-slate-100">
              💬 New message from {msg.sender.name}
            </p>
            {description && (
              <p className="text-xs text-slate-400 truncate">{description}</p>
            )}
            <button
              onClick={() => {
                setActiveConversationId(msg.conversationId);
                toast.dismiss(t.id);
              }}
              className="mt-1 self-start text-xs font-bold text-teal-400 hover:text-teal-300 transition-colors"
            >
              Open Chat →
            </button>
          </div>
        ),
        { duration: 4000 },
      );
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
    <div className="flex h-screen w-full bg-[#080b0f] overflow-hidden font-sans relative">
      {/* Mobile Backdrops */}
      {(isSidebarOpen ||
        isWorkspaceOpen ||
        (showGroupInfo && activeConversation?.type === "group")) && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-30 transition-opacity"
          onClick={() => {
            setIsSidebarOpen(false);
            setIsWorkspaceOpen(false);
            setShowGroupInfo(false);
          }}
        />
      )}

      {/* Workspace Sidebar Wrapper */}
      <div
        className={`absolute md:relative z-40 h-full transition-transform duration-300 md:translate-x-0 ${isWorkspaceOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <WorkspaceSidebar
          activeView={activeView}
          setActiveView={(view) => {
            setActiveView(view);
            // Auto close workspace sidebar on mobile when switching views
            if (window.innerWidth < 768) setIsWorkspaceOpen(false);
          }}
          selectedWorkspaceId={selectedWorkspaceId}
          setSelectedWorkspaceId={setSelectedWorkspaceId}
        />
      </div>

      {/* Secondary Sidebar Wrapper (SidebarChats or ChannelSidebar) */}
      <div
        className={`absolute md:relative z-40 h-full transition-transform duration-300 md:translate-x-0 w-80 md:w-auto flex shrink-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {activeView === "home" ? (
          <Sidebar
            conversations={conversations}
            activeConversationId={activeConversationId}
            setActiveConversationId={(id) => {
              setActiveConversationId(id);
              setShowGroupInfo(false);
              // On mobile, close sidebar when chat is selected
              if (window.innerWidth < 768) setIsSidebarOpen(false);
            }}
            onNewConversation={handleNewConversation}
            onConversationUpdate={handleConversationUpdate}
          />
        ) : activeView === "workspace" ? (
          <ChannelSidebar selectedWorkspaceId={selectedWorkspaceId} />
        ) : null}
      </div>

      <div className="flex-1 w-full h-full min-w-0 z-10">
        {activeView === "feed" ? (
          <FeedView toggleSidebar={() => setIsWorkspaceOpen((prev) => !prev)} />
        ) : (
          <ChatWindow
            conversation={activeConversation}
            onMessageSent={handleMessageSent}
            onMessagesSeen={handleMessagesSeen}
            showGroupInfo={showGroupInfo}
            onToggleGroupInfo={() => setShowGroupInfo((v) => !v)}
            onConversationUpdate={handleConversationUpdate}
            conversations={conversations}
            toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
            toggleWorkspace={() => setIsWorkspaceOpen((prev) => !prev)}
          />
        )}
      </div>

      {showGroupInfo && activeConversation?.type === "group" && (
        <div className="absolute top-0 right-0 h-full md:relative z-40 shrink-0">
          <GroupInfoPanel
            conversation={activeConversation}
            currentUser={currentUser}
            onClose={() => setShowGroupInfo(false)}
            onConversationUpdate={handleConversationUpdate}
          />
        </div>
      )}
    </div>
  );
}
