// src/components/ChatDashboard/SidebarChats.jsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  Search,
  Edit3,
  X,
  Pin,
  Archive,
  Bell,
  BellOff,
  MoreVertical,
  LogOut,
  Mic,
  Headphones,
  Settings,
} from "lucide-react";
import Link from "next/link";
import api from "@/app/api/Axios";
import { useSocket } from "@/hooks/useSocket";
import CreateGroupModal from "../CreateGroupModal";
import useAuth from "@/hooks/useAuth";
import { formatLastSeen } from "@/utils/formatLastSeen";
import { getGroupInitials, getGroupAvatarColor } from "@/utils/groupAvatar";
import {
  getOnlineCount,
  getGroupLastMessagePreview,
} from "@/utils/groupHelpers";
import toast from "react-hot-toast";

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
  const { onlineUsers, socket } = useSocket() || {};
  const { user: currentUser } = useAuth();

  // --- Sidebar UI state ---
  const [filterTerm, setFilterTerm] = useState("");
  const [searchedConversations, setSearchedConversations] =
    useState(conversations);
  const [showArchived, setShowArchived] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
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
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(e.target)
      ) {
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

  // Derive currently-online contacts from DM conversations only (groups excluded from Active Now)
  const onlineParticipants = conversations
    .filter(
      (c) =>
        c.type !== "group" &&
        c.participant &&
        onlineUsers?.get(c.participant._id)?.online,
    )
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

  //
  useEffect(() => {
    if (!socket) return;

    const handleMessageDeleted = (payload) => {
      console.log("Sidebar: message:deleted event RECEIVED!", payload);

      const { conversationId } = payload;

      setSearchedConversations((prev) =>
        prev.map((conv) =>
          conv._id === conversationId
            ? {
                ...conv,
                lastMessage: {
                  ...conv.lastMessage,
                  text: "This message was deleted",
                  isDeleted: true,
                },
                unreadCount: 0,
              }
            : conv,
        ),
      );
    };

    socket.on("message:deleted", handleMessageDeleted);

    return () => {
      socket.off("message:deleted", handleMessageDeleted);
    };
  }, [socket]);

  // Handle pin/unpin
  const handleTogglePin = async (e, conversationId) => {
    e.stopPropagation();
    try {
      await api.patch(`/api/chat/conversations/${conversationId}/pin`);
      // Optimistic update: toggle isPinned locally
      if (onConversationUpdate) {
        onConversationUpdate(
          conversations.map((c) =>
            c._id === conversationId ? { ...c, isPinned: !c.isPinned } : c,
          ),
        );
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
      // Optimistic update: toggle isArchived locally
      if (onConversationUpdate) {
        onConversationUpdate(
          conversations.map((c) =>
            c._id === conversationId ? { ...c, isArchived: !c.isArchived } : c,
          ),
        );
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
        onConversationUpdate(
          conversations.map((c) =>
            c._id === conversationId ? { ...c, isMuted: !c.isMuted } : c,
          ),
        );
      }
    } catch (err) {
      console.error("Failed to toggle mute:", err);
    }
    setContextMenu(null);
  };

  // Handle leave group
  const handleLeaveGroup = async (e, conversationId) => {
    e.stopPropagation();
    setContextMenu(null);
    try {
      await api.post(`/api/chat/conversations/${conversationId}/leave`);
      // Remove from local list; parent will handle socket cleanup too
      if (onConversationUpdate) {
        onConversationUpdate(
          conversations.filter((c) => c._id !== conversationId),
        );
      }
      toast.success("You left the group");
    } catch (err) {
      console.error("Failed to leave group:", err);
      toast.error(err.response?.data?.message || "Could not leave group");
    }
  };

  // Filter conversations based on archived status
  // (Conversations are already sorted in parent ChatDashboard component)
  const sortedConversations = showArchived
    ? searchedConversations.filter((c) => c.isArchived)
    : searchedConversations.filter((c) => !c.isArchived);

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
      <aside className="w-80 bg-[#0f1318] border-r border-white/5 flex flex-col shrink-0 h-full overflow-hidden">
        {/* Search Header */}
        <div className="h-14 px-3 flex items-center justify-between border-b border-white/5 bg-[#0f1318]/50 backdrop-blur-sm sticky top-0 z-20">
          <div className="relative flex-1 group">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-normal transition-colors"
            />
            <input
              type="text"
              placeholder="Find or start a conversation"
              className="w-full bg-[#080b0f] text-[12px] py-1.5 pl-8 pr-2 rounded-md outline-none border border-transparent focus:border-teal-normal/30 transition-all placeholder:text-slate-600 text-slate-200"
              value={filterTerm}
              onChange={(e) => setFilterTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide flex flex-col pt-3">
          {/* Active Now section */}
          {activeNowUsers.length > 0 && (
            <div className="px-4 mb-5">
              <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-3 px-1">
                Active Now
              </p>
              <div className="flex gap-3 overflow-x-auto py-1 px-1 scrollbar-hide">
                {activeNowUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex flex-col items-center gap-1.5 shrink-0"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full ring-1 ring-teal-normal/50 ring-offset-2 ring-offset-[#0f1318] overflow-hidden">
                        <Image
                          src={
                            user.avatar ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`
                          }
                          width={40}
                          height={40}
                          className="object-cover"
                          alt={user.name || "avatar"}
                          unoptimized
                        />
                      </div>
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0f1318]"></span>
                    </div>
                    <span className="text-[10px] text-slate-500 truncate max-w-10 text-center leading-tight">
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
          <div className="px-5 mb-1.5 flex justify-between items-center group/section">
            <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
              Direct Messages
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowArchived(!showArchived)}
                className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${
                  showArchived
                    ? "bg-teal-normal/20 text-teal-normal"
                    : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
                }`}
                title={showArchived ? "Show All DMs" : "Show Archived DMs"}
              >
                <Archive size={12} />
              </button>
              <CreateGroupModal onGroupCreated={onNewConversation} />
              <button
                onClick={() => setModalOpen(true)}
                className="w-6 h-6 rounded-md text-slate-500 hover:bg-white/5 hover:text-slate-300 flex items-center justify-center transition-all"
                title="New Chat"
              >
                <Edit3 size={12} />
              </button>
            </div>
          </div>

          {/* Conversation list */}
          <div className="px-2 space-y-0.5 pb-4">
            {sortedConversations.map((conv) => {
              const isActive = activeConversationId === conv._id;
              const isGroup = conv.type === "group";
              const hasUnread = conv.unreadCount > 0;
              const isUserOnline =
                !isGroup && onlineUsers?.get(conv.participant?._id)?.online;
              const groupInitials = isGroup
                ? getGroupInitials(conv.name)
                : null;
              const groupColor = isGroup
                ? getGroupAvatarColor(conv.name)
                : null;
              const onlineCount = isGroup
                ? getOnlineCount(conv, onlineUsers)
                : 0;
              const groupPreview = isGroup
                ? getGroupLastMessagePreview(conv.lastMessage, currentUser?._id)
                : null;

              return (
                <div key={conv._id} className="relative group px-1">
                  <div
                    onClick={() => setActiveConversationId(conv._id)}
                    className={`flex items-center gap-3 px-2 py-2 rounded-md cursor-pointer transition-all duration-150 relative ${
                      isActive
                        ? "bg-[#35373c]/50 text-white"
                        : "text-slate-400 hover:bg-[#35373c]/30 hover:text-slate-200"
                    }`}
                  >
                    {/* Active Indicator Pill */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full -ml-3" />
                    )}

                    {/* Avatar */}
                    <div className="relative shrink-0">
                      {isGroup ? (
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] overflow-hidden shadow-inner"
                          style={{
                            backgroundColor: conv.avatar
                              ? "transparent"
                              : groupColor.bg,
                            color: groupColor.text,
                          }}
                        >
                          {conv.avatar ? (
                            <Image
                              src={conv.avatar}
                              width={32}
                              height={32}
                              className="w-full h-full object-cover"
                              alt={conv.name}
                              unoptimized
                            />
                          ) : (
                            groupInitials
                          )}
                        </div>
                      ) : (
                        <>
                          <div className="w-8 h-8 rounded-full overflow-hidden shadow-inner">
                            <Image
                              src={
                                conv.participant?.avatar ||
                                `https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.participant?.name}`
                              }
                              width={32}
                              height={32}
                              alt={conv.participant?.name || "avatar"}
                              unoptimized
                            />
                          </div>
                          <div
                            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-[3px] border-[#0f1318] ${isUserOnline ? "bg-teal-normal" : "bg-slate-600"}`}
                          />
                        </>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          {conv.isPinned && (
                            <Pin
                              size={10}
                              className="text-teal-normal shrink-0"
                            />
                          )}
                          <span
                            className={`text-[13.5px] font-medium truncate ${isActive || hasUnread ? "text-white" : "text-slate-400"}`}
                          >
                            {isGroup
                              ? highlightMatch(conv.name || "", filterTerm)
                              : highlightMatch(
                                  conv.participant?.name || "",
                                  filterTerm,
                                )}
                          </span>
                          {conv.isMuted && (
                            <BellOff
                              size={10}
                              className="text-slate-600 shrink-0"
                            />
                          )}
                        </div>
                        {hasUnread && !conv.isMuted && (
                          <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/20">
                            <span className="text-[9px] font-black text-white">
                              {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                            </span>
                          </div>
                        )}
                      </div>
                      <p
                        className={`text-[11px] truncate leading-tight ${hasUnread ? "text-slate-200 font-semibold" : "text-slate-500"}`}
                      >
                        {isGroup
                          ? groupPreview
                          : conv.lastMessage?.text || "No messages yet"}
                      </p>
                    </div>

                    {/* More Menu */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Position relative to click
                        const rect = e.currentTarget.getBoundingClientRect();
                        setMenuPos({ x: rect.left - 160, y: rect.bottom + 5 });
                        setContextMenu(
                          contextMenu === conv._id ? null : conv._id,
                        );
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-white/10"
                    >
                      <MoreVertical size={14} className="text-slate-400" />
                    </button>
                  </div>

                  {/* Context Menu Hook - Portaled to avoid clipping */}
                  {contextMenu === conv._id &&
                    typeof document !== "undefined" &&
                    createPortal(
                      <div
                        ref={contextMenuRef}
                        className="fixed bg-[#1a1f26] border border-white/10 rounded-lg shadow-2xl z-50 py-1 min-w-40 animate-in fade-in zoom-in duration-150"
                        style={{ top: menuPos.y, left: menuPos.x }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={(e) => handleTogglePin(e, conv._id)}
                          className="w-full px-3 py-2 text-left text-[11px] text-slate-300 hover:bg-teal-normal hover:text-white flex items-center gap-2 transition-colors"
                        >
                          <Pin size={12} /> {conv.isPinned ? "Unpin" : "Pin"}
                        </button>
                        <button
                          onClick={(e) => handleToggleMute(e, conv._id)}
                          className="w-full px-3 py-2 text-left text-[11px] text-slate-300 hover:bg-teal-normal hover:text-white flex items-center gap-2 transition-colors"
                        >
                          {conv.isMuted ? (
                            <Bell size={12} />
                          ) : (
                            <BellOff size={12} />
                          )}{" "}
                          {conv.isMuted ? "Unmute" : "Mute"}
                        </button>
                        <button
                          onClick={(e) => handleToggleArchive(e, conv._id)}
                          className="w-full px-3 py-2 text-left text-[11px] text-slate-300 hover:bg-teal-normal hover:text-white flex items-center gap-2 transition-colors"
                        >
                          <Archive size={12} />{" "}
                          {conv.isArchived ? "Unarchive" : "Archive"}
                        </button>
                        {conv.type === "group" && (
                          <button
                            onClick={(e) => handleLeaveGroup(e, conv._id)}
                            className="w-full px-3 py-2 text-left text-[11px] text-red-400 hover:bg-red-500 hover:text-white flex items-center gap-2 transition-colors border-t border-white/5 mt-1"
                          >
                            <LogOut size={12} /> Leave Group
                          </button>
                        )}
                      </div>,
                      document.body,
                    )}
                </div>
              );
            })}

            {sortedConversations.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3">
                  <Search size={20} className="text-slate-700" />
                </div>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {filterTerm
                    ? "No matching conversations"
                    : "Find someone by clicking the edit icon to start chatting!"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* User Status Bar (Discord Style) */}
        <div className="h-14 bg-[#080b0f] px-2.5 flex items-center gap-2 group/user border-t border-white/2 shrink-0">
          <div className="relative shrink-0 cursor-pointer group/avatar">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-white/5 group-hover/avatar:border-teal-normal/50 transition-colors shadow-lg">
              <Image
                src={
                  currentUser?.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name}`
                }
                width={32}
                height={32}
                className="rounded-full"
                alt="avatar"
                unoptimized
              />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-[3px] border-[#080b0f] bg-teal-normal shadow-sm"></div>
          </div>

          <div className="flex-1 min-w-0 cursor-pointer overflow-hidden">
            <p className="text-white text-[13px] font-bold truncate leading-tight group-hover/user:text-teal-normal transition-colors">
              {currentUser?.name?.split(" ")[0]}
            </p>
            <p className="text-slate-500 text-[10px] truncate leading-tight flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-normal animate-pulse"></span>
              Online
            </p>
          </div>

          <div className="flex items-center gap-0.5 opacity-60 group-hover/user:opacity-100 transition-opacity">
            <button
              onClick={() => {
                window.location.href = "/";
              }}
              className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-all"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* New Chat Modal - Portaled to escape stacking context */}
      {modalOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setModalOpen(false)}
          >
            <div
              className="bg-[#0f1318] rounded-3xl w-full max-w-sm p-5 border border-white/8 shadow-2xl shadow-black/50 animate-in fade-in zoom-in duration-200"
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
          </div>,
          document.body,
        )}
    </>
  );
}
