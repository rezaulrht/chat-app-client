// src/components/ChatDashboard/ChatDashboard.jsx
"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MessageCircle,
  Compass,
  Layers,
  Plus,
  ChevronUp,
  Home,
} from "lucide-react";

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

  // Mobile bottom nav workspace picker
  const [showMobileWsPicker, setShowMobileWsPicker] = useState(false);
  const mobileWsPickerRef = useRef(null);

  // Close mobile workspace picker on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (
        mobileWsPickerRef.current &&
        !mobileWsPickerRef.current.contains(e.target)
      ) {
        setShowMobileWsPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleClick);
    };
  }, []);

  const workspaces = [
    { id: "ws1", name: "Modernize", color: "#5865f2" },
    { id: "ws2", name: "Dev Team", color: "#3ba55c" },
    { id: "ws3", name: "Startup Hub", color: "#f59e0b" },
  ];

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
            className={`flex flex-col gap-1.5 px-4 py-3.5 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.3)] glass-card ring-1 ring-accent/15 text-sm min-w-[280px] max-w-[360px] transition-all duration-300 ${
              t.visible
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
      <div className="flex h-screen w-full bg-obsidian items-center justify-center flex-col gap-6 relative overflow-hidden">
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
    <div className="flex flex-col md:flex-row h-screen w-full bg-obsidian overflow-hidden font-sans relative">
      {/* Mobile Backdrops */}
      {(isSidebarOpen ||
        (showGroupInfo && activeConversation?.type === "group")) && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-30 transition-opacity"
          onClick={() => {
            setIsSidebarOpen(false);
            setShowGroupInfo(false);
          }}
        />
      )}

      {/* Main row: sidebar + content (fills remaining height above bottom nav) */}
      <div className="flex flex-1 min-h-0 w-full">
        {/* ═══ Desktop: Unified Sidebar ═══ */}
        <div className="hidden md:flex flex-col shrink-0 h-full w-80 overflow-hidden border-r border-white/[0.06]">
          {/* Tab Navigation Header */}
          <WorkspaceSidebar
            activeView={activeView}
            setActiveView={setActiveView}
            selectedWorkspaceId={selectedWorkspaceId}
            setSelectedWorkspaceId={setSelectedWorkspaceId}
          />

          {/* Chats Tab → Conversation List */}
          {activeView === "home" && (
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
          )}

          {/* Feed Tab → Minimal Sidebar Indicator */}
          {activeView === "feed" && (
            <div className="flex-1 glass-panel flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(0,211,187,0.06)]">
                <Compass size={28} className="text-accent/40" />
              </div>
              <p className="text-ivory/50 text-[15px] font-display font-bold mb-1.5">
                Global Feed
              </p>
              <p className="text-ivory/20 text-[11px] font-mono leading-relaxed max-w-[200px]">
                Browse posts and updates from the community
              </p>
              <div className="w-12 h-px bg-gradient-to-r from-transparent via-accent/15 to-transparent mt-6 mb-4" />
              <p className="text-ivory/10 text-[9px] font-mono uppercase tracking-widest">
                Viewing feed →
              </p>
            </div>
          )}

          {/* Spaces Tab → Workspace Picker (no workspace selected) */}
          {activeView === "workspace" && !selectedWorkspaceId && (
            <div className="flex-1 glass-panel flex flex-col overflow-hidden">
              <div className="px-4 py-3 border-b border-white/[0.06]">
                <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-ivory/25">
                  Your Workspaces
                </p>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      setActiveView("workspace");
                      setSelectedWorkspaceId(ws.id);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/[0.04] active:bg-white/[0.08] transition-all duration-150 group"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-display font-bold text-white/80 transition-all group-hover:shadow-lg"
                      style={{
                        background: ws.color + "20",
                        border: "1px solid " + ws.color + "30",
                      }}
                    >
                      {ws.name[0]}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-ivory/70 text-sm font-display font-semibold truncate group-hover:text-ivory transition-colors">
                        {ws.name}
                      </p>
                      <p className="text-ivory/15 text-[10px] font-mono mt-0.5">
                        Workspace
                      </p>
                    </div>
                  </button>
                ))}
                <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-ivory/20 hover:text-accent hover:bg-accent/5 transition-all duration-150 mt-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-dashed border-white/10 hover:border-accent/30 transition-colors">
                    <Plus size={18} />
                  </div>
                  <span className="text-sm font-display font-semibold">
                    Create Workspace
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Spaces Tab → Channel List (workspace selected) */}
          {activeView === "workspace" && selectedWorkspaceId && (
            <ChannelSidebar
              selectedWorkspaceId={selectedWorkspaceId}
              onBack={() => setSelectedWorkspaceId(null)}
            />
          )}
        </div>

        {/* ═══ Mobile: Slide-in Sidebar ═══ */}
        <div
          className={`md:hidden absolute z-40 h-[calc(100%-3.5rem)] transition-transform duration-300 w-[85vw] sm:w-80 flex shrink-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {activeView === "home" ? (
            <Sidebar
              conversations={conversations}
              activeConversationId={activeConversationId}
              setActiveConversationId={(id) => {
                setActiveConversationId(id);
                setShowGroupInfo(false);
                if (window.innerWidth < 768) setIsSidebarOpen(false);
              }}
              onNewConversation={handleNewConversation}
              onConversationUpdate={handleConversationUpdate}
            />
          ) : activeView === "workspace" ? (
            <ChannelSidebar selectedWorkspaceId={selectedWorkspaceId} />
          ) : null}
        </div>

        {/* Main content */}
        <div className="flex-1 w-full h-full min-w-0 z-10">
          {activeView === "feed" ? (
            <FeedView />
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

      {/* ═══ Mobile Bottom Navigation Bar ═══ */}
      <nav className="md:hidden h-14 shrink-0 glass-panel border-t border-white/[0.06] flex items-center justify-around px-2 relative z-50">
        {/* Home Tab */}
        <Link
          href="/"
          className="flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200 text-ivory/30 active:text-accent"
        >
          <Home size={20} />
          <span className="text-[9px] font-bold font-mono uppercase tracking-wider">
            Home
          </span>
        </Link>

        {/* Chats Tab */}
        <button
          onClick={() => {
            setActiveView("home");
            setShowMobileWsPicker(false);
            setIsSidebarOpen(true);
          }}
          className={`flex flex-col items-center justify-center gap-0.5 px-4 py-1 rounded-xl transition-all duration-200 ${
            activeView === "home" ? "text-accent" : "text-ivory/30"
          }`}
        >
          <MessageCircle size={20} />
          <span className="text-[9px] font-bold font-mono uppercase tracking-wider">
            Chats
          </span>
          {activeView === "home" && (
            <div className="absolute -top-px left-1/2 -translate-x-[calc(50%+3.3rem)] w-8 h-0.5 bg-accent rounded-b-full shadow-[0_0_8px_rgba(0,211,187,0.5)]" />
          )}
        </button>

        {/* Feed Tab */}
        <button
          onClick={() => {
            setActiveView("feed");
            setSelectedWorkspaceId(null);
            setShowMobileWsPicker(false);
            if (window.innerWidth < 768) setIsSidebarOpen(false);
          }}
          className={`flex flex-col items-center justify-center gap-0.5 px-4 py-1 rounded-xl transition-all duration-200 ${
            activeView === "feed" ? "text-accent" : "text-ivory/30"
          }`}
        >
          <Compass size={20} />
          <span className="text-[9px] font-bold font-mono uppercase tracking-wider">
            Feed
          </span>
          {activeView === "feed" && (
            <div className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-accent rounded-b-full shadow-[0_0_8px_rgba(0,211,187,0.5)]" />
          )}
        </button>

        {/* Workspaces Tab */}
        <div className="relative" ref={mobileWsPickerRef}>
          <button
            onClick={() => setShowMobileWsPicker((v) => !v)}
            className={`flex flex-col items-center justify-center gap-0.5 px-4 py-1 rounded-xl transition-all duration-200 ${
              activeView === "workspace" ? "text-accent" : "text-ivory/30"
            }`}
          >
            <Layers size={20} />
            <span className="text-[9px] font-bold font-mono uppercase tracking-wider">
              Spaces
            </span>
            {activeView === "workspace" && (
              <div className="absolute -top-px left-1/2 -translate-x-[calc(50%-3.3rem)] w-8 h-0.5 bg-accent rounded-b-full shadow-[0_0_8px_rgba(0,211,187,0.5)]" />
            )}
          </button>

          {/* Workspace Picker Popover */}
          {showMobileWsPicker && (
            <div className="absolute bottom-full right-0 mb-3 w-52 glass-card rounded-2xl border border-white/[0.08] shadow-[0_-12px_40px_rgba(0,0,0,0.5)] overflow-hidden animate-in slide-in-from-bottom-2 duration-200">
              <div className="p-2 border-b border-white/[0.06]">
                <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-ivory/25 px-2 py-1">
                  Workspaces
                </p>
              </div>
              <div className="p-1.5 flex flex-col gap-0.5">
                {workspaces.map((ws) => {
                  const isActive =
                    activeView === "workspace" && selectedWorkspaceId === ws.id;
                  return (
                    <button
                      key={ws.id}
                      onClick={() => {
                        setActiveView("workspace");
                        setSelectedWorkspaceId(ws.id);
                        setShowMobileWsPicker(false);
                        setIsSidebarOpen(true);
                      }}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 ${
                        isActive
                          ? "bg-accent/10 ring-1 ring-accent/20"
                          : "hover:bg-white/[0.04] active:bg-white/[0.08]"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-display font-bold text-white/80 transition-all ${
                          isActive ? "shadow-lg" : ""
                        }`}
                        style={{
                          background: isActive
                            ? ws.color + "40"
                            : ws.color + "25",
                          border:
                            "1px solid " + ws.color + (isActive ? "60" : "30"),
                        }}
                      >
                        {ws.name[0]}
                      </div>
                      <span
                        className={`text-sm font-display font-semibold truncate ${
                          isActive ? "text-accent" : "text-ivory/60"
                        }`}
                      >
                        {ws.name}
                      </span>
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_6px_rgba(0,211,187,0.6)]" />
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="p-1.5 border-t border-white/[0.06]">
                <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-ivory/25 hover:text-accent hover:bg-accent/5 transition-all duration-150">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center border border-dashed border-white/10 hover:border-accent/30 transition-colors">
                    <Plus size={16} />
                  </div>
                  <span className="text-sm font-display font-semibold">
                    Create Workspace
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}
