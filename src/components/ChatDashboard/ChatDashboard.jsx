// src/components/ChatDashboard/ChatDashboard.jsx
"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Home } from "lucide-react";
import { useSearchParams } from "next/navigation";

import Sidebar from "./SidebarChats";
import ChatWindow from "./ChatWindow";
import GroupInfoPanel from "./GroupInfoPanel";
import DMInfoPanel from "./DMInfoPanel";
import AppSidebar from "@/components/app-shell/AppSidebar";
import { useAppShell } from "@/components/app-shell/AppShellContext";
import api from "@/app/api/Axios";
import { useSocket } from "@/hooks/useSocket";
import useAuth from "@/hooks/useAuth";
import { sortConversations } from "@/utils/sortConversations";
import toast from "react-hot-toast";
import useNotification from "@/hooks/useNotification";

export default function ChatDashboard() {
  const searchParams = useSearchParams();
  const initialConvId = searchParams.get("conv");

  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [loadingConversations, setLoadingConversations] = useState(true);
  // Controls the slide-out GroupInfoPanel beside ChatWindow
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showDmInfo, setShowDmInfo] = useState(false);
  const { socket, fetchLastSeenTimes } = useSocket() || {};
  const { user } = useAuth(); // ← New (for self-message check)
  const { setMutedConversationIds } = useNotification() || {};

  // Responsive sidebar state — driven by AppTopBar hamburger via context
  const { isSidebarOpen, setIsSidebarOpen } = useAppShell();

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

        // Sync muted conversations into NotificationProvider
        if (setMutedConversationIds) {
          const mutedIds = new Set(
            sorted.filter((c) => c.isMuted).map((c) => c._id),
          );
          setMutedConversationIds(mutedIds);
        }

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
          const target =
            initialConvId && sorted.find((c) => c._id === initialConvId);
          setActiveConversationId(target ? target._id : sorted[0]._id);
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
            className={`flex flex-col gap-1.5 px-4 py-3.5 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.3)] glass-card ring-1 ring-accent/15 text-sm min-w-70 max-w-90 transition-all duration-300 ${t.visible
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-3"
              }`}
          >
            <p className="font-display font-bold text-ivory text-[13px]">
              New message from {msg.sender.name}
            </p>
            {description && (
              <p className="text-[11px] text-ivory/35 truncate font-mono">
                {description}
              </p>
            )}
            <button
              onClick={() => {
                setActiveConversationId(msg.conversationId);
                toast.dismiss(t.id);
              }}
              className="mt-0.5 self-start text-[11px] font-bold text-accent hover:text-accent/80 transition-colors font-mono uppercase tracking-wider"
            >
              Open Chat &rarr;
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
      // 🔥 TOAST ONLY WHEN NOT IN THIS CHAT, NOT OUR OWN MESSAGE, AND NOT MUTED
      const isInActiveChat =
        activeConversationIdRef.current === msg.conversationId;
      const isMyMessage =
        user?._id && String(msg.sender?._id) === String(user._id);
      const conv = conversationsRef.current.find(
        (c) => c._id === msg.conversationId,
      );
      const isMuted = !!conv?.isMuted;

      if (!isInActiveChat && !isMyMessage && !isMuted) {
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
                  attachments: msg.attachments || [],
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

    const handleCustomiseUpdated = ({ conversationId, customisation }) => {
      setConversations((prev) =>
        prev.map((c) =>
          c._id === conversationId ? { ...c, customisation } : c,
        ),
      );
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
    socket.on("conversation:customise:updated", handleCustomiseUpdated);

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
      socket.off("conversation:customise:updated", handleCustomiseUpdated);
    };
  }, [socket, fetchLastSeenTimes, user, showNewMessageToast]);

  const activeConversation = conversations.find(
    (c) => c._id === activeConversationId,
  );

  // Called by ChatWindow when a message is sent — update sidebar's lastMessage
  const handleMessageSent = useCallback(
    (conversationId, text, gifUrl = null, attachments = []) => {
      setConversations((prev) => {
        const updated = prev.map((c) =>
          c._id === conversationId
            ? {
              ...c,
              lastMessage: {
                ...c.lastMessage,
                text,
                gifUrl,
                attachments,
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
  const handleConversationUpdate = useCallback(
    (updated) => {
      // Array → full list refresh (from SidebarChats pin/mute/archive/leave)
      if (Array.isArray(updated)) {
        setConversations(sortConversations(updated));
        if (setMutedConversationIds) {
          setMutedConversationIds(
            new Set(updated.filter((c) => c.isMuted).map((c) => c._id)),
          );
        }
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
      setConversations((prev) => {
        const next = sortConversations(
          prev.map((c) => (c._id === updated._id ? { ...c, ...updated } : c)),
        );
        // Keep muted set in sync
        if (setMutedConversationIds) {
          setMutedConversationIds(
            new Set(next.filter((c) => c.isMuted).map((c) => c._id)),
          );
        }
        return next;
      });
    },
    [setMutedConversationIds],
  );

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
      <div className="flex h-full w-full bg-obsidian items-center justify-center flex-col gap-6 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center gap-5">
          <div className="relative">
            <div className="absolute inset-0 bg-accent/20 blur-2xl rounded-full animate-pulse" />
            <div className="relative w-16 h-16 rounded-3xl glass-card flex items-center justify-center shadow-[0_0_40px_rgba(0,211,187,0.1)]">
              <div className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            </div>
          </div>
          <div className="text-center space-y-1.5">
            <p className="font-serif italic text-accent/60 text-lg">Loading</p>
            <p className="text-ivory/20 text-[11px] font-mono tracking-wider uppercase">
              Fetching conversations...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-slate-surface overflow-hidden font-sans relative">
      {/* Mobile Backdrops */}
      {(isSidebarOpen ||
        (showGroupInfo && activeConversation?.type === "group")) && (
          <div
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-all"
            onClick={() => {
              setIsSidebarOpen(false);
              setShowGroupInfo(false);
            }}
          />
        )}

      <div className="flex flex-1 min-h-0 w-full">
        {/* ═══ Desktop: Unified Sidebar ═══ */}
        <AppSidebar
          label="Direct Messages"
          className="lg:flex w-80 overflow-hidden border-r border-white/[0.06]"
          storeKey="chat"
        >
          <Sidebar
            conversations={conversations}
            activeConversationId={activeConversationId}
            setActiveConversationId={(id) => {
              setActiveConversationId(id);
              setShowGroupInfo(false);
            }}
            onNewConversation={handleNewConversation}
            onConversationUpdate={handleConversationUpdate}
          />
        </AppSidebar>

        {/* ═══ Mobile: Slide-in Sidebar ═══ */}
        <div
          className={`lg:hidden absolute z-40 h-full transition-transform duration-300 w-[85vw] sm:w-80 flex shrink-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          <Sidebar
            conversations={conversations}
            activeConversationId={activeConversationId}
            setActiveConversationId={(id) => {
              setActiveConversationId(id);
              setShowGroupInfo(false);
              if (window.innerWidth < 1024) setIsSidebarOpen(false);
            }}
            onNewConversation={handleNewConversation}
            onConversationUpdate={handleConversationUpdate}
          />
        </div>

        {/* Main content */}
        <div className="flex-1 w-full h-full min-w-0 z-10 overflow-hidden">
          <ChatWindow
            conversation={activeConversation}
            onMessageSent={handleMessageSent}
            onMessagesSeen={handleMessagesSeen}
            showGroupInfo={showGroupInfo}
            onToggleGroupInfo={() => setShowGroupInfo((v) => !v)}
            showDmInfo={showDmInfo}
            onToggleDmInfo={() => setShowDmInfo((v) => !v)}
            onConversationUpdate={handleConversationUpdate}
            conversations={conversations}
            toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          />
        </div>

        {showGroupInfo && activeConversation?.type === "group" && (
          <div className="absolute top-0 right-0 h-full lg:relative z-40 shrink-0">
            <GroupInfoPanel
              conversation={activeConversation}
              currentUser={currentUser}
              onClose={() => setShowGroupInfo(false)}
              onConversationUpdate={handleConversationUpdate}
              onMuteChange={(convId, isMuted) =>
                handleConversationUpdate({ _id: convId, isMuted })
              }
            />
          </div>
        )}

        {showDmInfo && activeConversation?.type !== "group" && (
          <div className="absolute top-0 right-0 h-full md:relative z-40 shrink-0">
            <DMInfoPanel
              conversation={activeConversation}
              currentUser={currentUser}
              onClose={() => setShowDmInfo(false)}
              onMuteChange={(convId, isMuted) =>
                handleConversationUpdate({ _id: convId, isMuted })
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
