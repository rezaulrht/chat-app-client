// src/components/ChatDashboard/SidebarChats.jsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Search, Edit3, X, Pin, Archive, Bell, BellOff, MoreVertical } from "lucide-react";
import Link from "next/link";
import api from "@/app/api/Axios";
import { useSocket } from "@/hooks/useSocket";
import CreateGroupModal from "../CreateGroupModal";
import useAuth from "@/hooks/useAuth";
import { formatLastSeen } from "@/utils/formatLastSeen";

// Smart relative/absolute timestamp for sidebar conversation list
const formatConvTimestamp = (timestamp) => {
  if (!timestamp) return "";

  const date = new Date(timestamp);
  const now = new Date();

  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isSameDay(date, now)) {
    // Today → time
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  if (isSameDay(date, yesterday)) {
    // Yesterday
    return "Yesterday";
  }

  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (diffDays < 7) {
    // Within past 7 days → day name abbreviated
    return date.toLocaleDateString([], { weekday: "short" });
  }

  if (date.getFullYear() === now.getFullYear()) {
    // Same year, older than 7 days → day + month
    return date.toLocaleDateString([], { day: "numeric", month: "short" });
  }

  // Different year → day + month + year
  return date.toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function Sidebar({
  conversations,
  activeConversationId,
  setActiveConversationId,
  onNewConversation,
  onConversationUpdate,
}) {
  const { onlineUsers } = useSocket() || {};
  const { user: currentUser } = useAuth();

  // --- Conversation filter (local, client-side) ---
  const [filterTerm, setFilterTerm] = useState("");
  const [searchedConversations, setSearchedConversations] =
    useState(conversations);
  const [showArchived, setShowArchived] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);

  // --- New chat modal state ---
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [startingChat, setStartingChat] = useState(false);
  const searchInputRef = useRef(null);
  const contextMenuRef = useRef(null);

  // Close context menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
        setContextMenu(null);
      }
    };
    if (contextMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [contextMenu]);

  // Focus search input when modal opens
  useEffect(() => {
    if (modalOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [modalOpen]);

  // Debounced user search — fires 400ms after user stops typing
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get(
          `/api/chat/users?q=${encodeURIComponent(searchQuery)}`,
        );
        setSearchResults(res.data);
      } catch (err) {
        console.error("User search failed:", err);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Start or open a conversation with a selected user
  const handleSelectUser = async (user) => {
    setStartingChat(true);
    try {
      const res = await api.post("/api/chat/conversations", {
        participantId: user._id,
      });
      onNewConversation(res.data);
      setModalOpen(false);
    } catch (err) {
      console.error("Failed to start conversation:", err);
    } finally {
      setStartingChat(false);
    }
  };

  // Derive currently-online contacts from the conversations list
  // Prepend the logged-in user first (they are always online when viewing the app)
  const onlineParticipants = conversations
    .filter((c) => c.participant && onlineUsers?.get(c.participant._id)?.online)
    .map((c) => c.participant);

  const activeNowUsers = currentUser
    ? [
      currentUser,
      ...onlineParticipants.filter((u) => u._id !== currentUser._id),
    ]
    : onlineParticipants;

  useEffect(() => {
    if (!filterTerm.trim()) {
      setSearchedConversations(conversations);
      return;
    }

    const controller = new AbortController(); // ✅ create abort controller

    const timer = setTimeout(async () => {
      try {
        const res = await api.get(
          `/api/chat/search-conversations?q=${encodeURIComponent(filterTerm)}`,
          { signal: controller.signal }, // ✅ pass signal to axios
        );
        setSearchedConversations(res.data);
      } catch (err) {
        if (err.name === "CanceledError" || err.code === "ERR_CANCELED") return;
        console.error("Search failed:", err);
        setSearchedConversations(conversations);
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [filterTerm]);

  // Keep searchedConversations in sync when not searching
  useEffect(() => {
    if (!filterTerm.trim()) {
      setSearchedConversations(conversations);
    }
  }, [conversations]); // only syncs when not actively filtering

  // Handle pin/unpin
  const handleTogglePin = async (e, conversationId) => {
    e.stopPropagation();
    try {
      await api.patch(`/api/chat/conversations/${conversationId}/pin`);
      if (onConversationUpdate) {
        const res = await api.get("/api/chat/conversations");
        onConversationUpdate(res.data);
      }
    } catch (err) {
      console.error("Failed to toggle pin:", err);
    }
    setContextMenu(null);
  };

  // Handle archive/unarchive
  const handleToggleArchive = async (e, conversationId) => {
    e.stopPropagation();
    try {
      await api.patch(`/api/chat/conversations/${conversationId}/archive`);
      if (onConversationUpdate) {
        const res = await api.get("/api/chat/conversations");
        onConversationUpdate(res.data);
      }
    } catch (err) {
      console.error("Failed to toggle archive:", err);
    }
    setContextMenu(null);
  };

  // Handle mute/unmute
  const handleToggleMute = async (e, conversationId) => {
    e.stopPropagation();
    try {
      await api.patch(`/api/chat/conversations/${conversationId}/mute`);
      if (onConversationUpdate) {
        const res = await api.get("/api/chat/conversations");
        onConversationUpdate(res.data);
      }
    } catch (err) {
      console.error("Failed to toggle mute:", err);
    }
    setContextMenu(null);
  };


  const highlightMatch = (text, query) => {
    if (!query || !text) return text || "No messages yet";

    const regex = new RegExp(`(${query})`, "gi");
    const parts = String(text).split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span
          key={index}
          className="bg-teal-600/40 text-teal-200 rounded px-0.5 font-medium"
        >
          {part}
        </span>
      ) : (
        part
      ),
    );
  };

  return (
    <>
      <aside className="w-80 bg-[#0f1318] border-r border-white/5 flex flex-col shrink-0 h-full">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 flex justify-between items-center border-b border-white/5">
          <div className="flex items-center gap-2">
            <Link href="/">
              <img
                src="https://i.ibb.co/PG0X3Tbf/Convo-X-logo.png"
                alt="ConvoX Logo"
                className="h-6 w-auto cursor-pointer"
              />
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <CreateGroupModal />
            <button
              onClick={() => setModalOpen(true)}
              className="w-8 h-8 rounded-xl bg-teal-normal/10 border border-teal-normal/20 flex items-center justify-center hover:bg-teal-normal/20 transition-all group"
            >
              <Edit3
                size={15}
                className="text-teal-normal group-hover:scale-110 transition-transform"
              />
            </button>
          </div>
        </div>

        {/* Search / Filter */}
        <div className="px-4 py-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
              size={15}
            />
            <input
              type="text"
              value={filterTerm}
              onChange={(e) => setFilterTerm(e.target.value)}
              className="w-full bg-white/5 rounded-xl py-2.5 pl-9 pr-4 text-xs outline-none border border-white/5 focus:border-teal-normal/40 focus:bg-white/8 text-slate-300 placeholder:text-slate-600 transition-all"
              placeholder="Search conversations..."
            />
          </div>
        </div>

        {/* Active Now section */}
        {activeNowUsers.length > 0 && (
          <div className="px-4 mb-3">
            <p className="text-[9px] font-bold tracking-[0.15em] text-teal-dark uppercase mb-3">
              Active Now
            </p>
            <div className="flex gap-3 overflow-x-auto py-2 px-1 scrollbar-hide">
              {activeNowUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex flex-col items-center gap-1.5 shrink-0"
                >
                  <div className="relative">
                    <div className="w-11 h-11 rounded-full ring-2 ring-teal-normal/70 ring-offset-1 ring-offset-[#0f1318] overflow-hidden">
                      <Image
                        src={
                          user.avatar ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`
                        }
                        width={44}
                        height={44}
                        className="object-cover"
                        alt={user.name || "avatar"}
                        unoptimized
                      />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#0f1318]"></span>
                  </div>
                  <span className="text-[9px] text-slate-500 truncate max-w-11 text-center leading-tight">
                    {user._id === currentUser?._id
                      ? "You"
                      : user.name?.split(" ")[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section label */}
        <div className="px-4 mb-2 flex justify-between items-center">
          <p className="text-[9px] font-bold tracking-[0.15em] text-slate-600 uppercase">
            Messages
          </p>
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="text-[9px] text-teal-normal hover:text-teal-light transition-colors"
          >
            {showArchived ? "Show All" : "Show Archived"}
          </button>
        </div>

        {/* Conversation list */}
        <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-3 space-y-0.5 scrollbar-hide">
          {sortedConversations.map((conv) => {
            const isActive = activeConversationId === conv._id;
            const isUserOnline = onlineUsers?.get(
              conv.participant?._id,
            )?.online;
            const hasUnread = conv.unreadCount > 0;

            return (
              <div
                key={conv._id}
                className="relative group"
              >
                <div
                  onClick={() => setActiveConversationId(conv._id)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-2xl cursor-pointer transition-all duration-150 ${isActive
                    ? "bg-teal-normal/10 border border-teal-normal/20"
                    : "hover:bg-white/4 border border-transparent"
                    }`}
                >
                  <div className="relative shrink-0">
                    <div
                      className={`rounded-full overflow-hidden ${isActive ? "ring-2 ring-teal-normal/50 ring-offset-1 ring-offset-[#0f1318]" : ""}`}
                    >
                      <Image
                        src={
                          conv.participant?.avatar ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.participant?.name}`
                        }
                        width={44}
                        height={44}
                        className="rounded-full"
                        alt={conv.participant?.name || "avatar"}
                        unoptimized
                      />
                    </div>
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0f1318] ${isUserOnline ? "bg-green-400" : "bg-slate-600"}`}
                    ></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center gap-2">
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        {conv.isPinned && (
                          <Pin size={12} className="text-teal-normal shrink-0" />
                        )}
                        <span className="font-semibold text-sm truncate text-white">
                          {highlightMatch(conv.participant?.name || "", filterTerm)}
                        </span>
                        {conv.isMuted && (
                          <BellOff size={12} className="text-slate-600 shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[9px] text-slate-600">
                          {formatConvTimestamp(conv.lastMessage?.timestamp)}
                        </span>
                        {hasUnread && !conv.isMuted && (
                          <div className="min-w-4.5 h-4.5 px-1 rounded-full bg-teal-normal flex items-center justify-center">
                            <span className="text-[9px] font-bold text-white">
                              {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className={`text-xs ${hasUnread && !conv.isMuted ? "text-white font-medium" : "text-slate-500"} truncate`}>
                      {hasUnread && !conv.isMuted
                        ? conv.unreadCount === 1
                          ? "1 new message"
                          : `${conv.unreadCount} new messages`
                        : highlightMatch(
                          conv.lastMessage?.text || "No messages yet",
                          filterTerm,
                        )}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setContextMenu(contextMenu === conv._id ? null : conv._id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 w-6 h-6 rounded-lg hover:bg-white/10 flex items-center justify-center"
                  >
                    <MoreVertical size={14} className="text-slate-400" />
                  </button>
                </div>

                {/* Context Menu */}
                {contextMenu === conv._id && (
                  <div
                    ref={contextMenuRef}
                    className="absolute right-3 top-14 bg-[#1a1f26] border border-white/10 rounded-xl shadow-2xl z-10 py-1 min-w-40"
                  >
                    <button
                      onClick={(e) => handleTogglePin(e, conv._id)}
                      className="w-full px-4 py-2 text-left text-xs text-slate-300 hover:bg-white/5 flex items-center gap-2"
                    >
                      <Pin size={14} />
                      {conv.isPinned ? "Unpin" : "Pin"}
                    </button>
                    <button
                      onClick={(e) => handleToggleMute(e, conv._id)}
                      className="w-full px-4 py-2 text-left text-xs text-slate-300 hover:bg-white/5 flex items-center gap-2"
                    >
                      {conv.isMuted ? <Bell size={14} /> : <BellOff size={14} />}
                      {conv.isMuted ? "Unmute" : "Mute"}
                    </button>
                    <button
                      onClick={(e) => handleToggleArchive(e, conv._id)}
                      className="w-full px-4 py-2 text-left text-xs text-slate-300 hover:bg-white/5 flex items-center gap-2"
                    >
                      <Archive size={14} />
                      {conv.isArchived ? "Unarchive" : "Archive"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {sortedConversations.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <div className="w-10 h-10 rounded-2xl bg-teal-normal/10 flex items-center justify-center">
                {showArchived ? (
                  <Archive size={16} className="text-teal-dark" />
                ) : (
                  <Search size={16} className="text-teal-dark" />
                )}
              </div>
              <p className="text-slate-600 text-xs text-center">
                {showArchived
                  ? "No archived conversations"
                  : conversations.length === 0
                    ? "No conversations yet.\nClick the edit icon to start one."
                    : "No conversations found"}
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* New Chat Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-[#0f1318] rounded-3xl w-full max-w-sm mx-4 p-5 border border-white/8 shadow-2xl shadow-black/50"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-white font-bold text-sm">
                  New Conversation
                </h2>
                <p className="text-slate-600 text-xs mt-0.5">
                  Find someone to chat with
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-7 h-7 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all"
              >
                <X size={14} className="text-slate-400" />
              </button>
            </div>

            {/* User search input */}
            <div className="relative mb-3">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                size={15}
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 rounded-2xl py-3 pl-10 pr-4 text-sm outline-none border border-white/5 focus:border-teal-normal/40 text-slate-200 placeholder:text-slate-600 transition-all"
                placeholder="Search by name or email..."
              />
            </div>

            {/* Results */}
            <div className="space-y-1 max-h-60 overflow-y-auto scrollbar-hide">
              {searching && (
                <div className="flex items-center justify-center gap-2 py-6">
                  <div className="w-4 h-4 rounded-full border-2 border-teal-normal border-t-transparent animate-spin"></div>
                  <p className="text-slate-500 text-xs">Searching...</p>
                </div>
              )}

              {!searching && searchQuery && searchResults.length === 0 && (
                <p className="text-center text-slate-600 text-xs py-6">
                  No users found
                </p>
              )}

              {searchResults.map((user) => (
                <div
                  key={user._id}
                  onClick={() => !startingChat && handleSelectUser(user)}
                  className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer hover:bg-teal-normal/8 border border-transparent hover:border-teal-normal/15 transition-all"
                >
                  <div className="relative shrink-0">
                    <Image
                      src={
                        user.avatar ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`
                      }
                      width={38}
                      height={38}
                      className="rounded-full"
                      alt={user.name || "avatar"}
                      unoptimized
                    />
                    {onlineUsers?.get(user._id)?.online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#0f1318]"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 text-sm font-semibold truncate">
                      {user.name}
                    </p>
                    <p
                      className={`text-xs ${onlineUsers?.get(user._id)?.online ? "text-green-400" : "text-slate-600"}`}
                    >
                      {onlineUsers?.get(user._id)?.online
                        ? "● Online"
                        : `Last seen ${formatLastSeen(onlineUsers?.get(user._id)?.lastSeen)}`}
                    </p>
                  </div>
                  {startingChat && (
                    <div className="w-4 h-4 rounded-full border-2 border-teal-normal border-t-transparent animate-spin shrink-0"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
