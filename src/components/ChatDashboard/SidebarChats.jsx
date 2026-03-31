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
import UserProfileModal from "@/components/profile/UserProfileModal";

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
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  if (isSameDay(date, yesterday)) {
    return "Yesterday";
  }

  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: "short" });
  }

  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString([], { day: "numeric", month: "short" });
  }

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
  collapsed = false,
}) {
  const { onlineUsers, socket } = useSocket() || {};
  const { user: currentUser } = useAuth();

  const [filterTerm, setFilterTerm] = useState("");
  const [searchedConversations, setSearchedConversations] =
    useState(conversations);
  const [showArchived, setShowArchived] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
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

  // Debounced user search
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

  // Derive currently-online contacts from DM conversations only
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

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const res = await api.get(
          `/api/chat/search-conversations?q=${encodeURIComponent(filterTerm)}`,
          { signal: controller.signal },
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
  }, [conversations]);

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
          className="bg-accent/30 text-accent rounded px-0.5 font-medium"
        >
          {part}
        </span>
      ) : (
        part
      ),
    );
  };

  // ── Collapsed render: avatar strip ────────────────────────────────────────
  if (collapsed) {
    const visible = sortedConversations.slice(0, 18);
    return (
      <aside className="w-full flex flex-col items-center min-h-0 overflow-y-auto scrollbar-hide pt-1 gap-1 pb-4">
        {visible.map((conv) => {
          const isActive = activeConversationId === conv._id;
          const isGroup = conv.type === "group";
          const hasUnread = conv.unreadCount > 0 && !conv.isMuted;
          const isUserOnline =
            !isGroup && onlineUsers?.get(conv.participant?._id)?.online;
          const groupColor = isGroup ? getGroupAvatarColor(conv.name) : null;
          const groupInitials = isGroup ? getGroupInitials(conv.name) : null;

          return (
            <div
              key={conv._id}
              className="relative shrink-0 cursor-pointer"
              title={isGroup ? conv.name : conv.participant?.name}
              onClick={() => setActiveConversationId(conv._id)}
            >
              {/* Active pip */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent rounded-r-full -ml-1 shadow-[0_0_8px_rgba(0,211,187,0.4)]" />
              )}

              {/* Avatar */}
              {isGroup ? (
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-display font-bold text-[10px] ring-1 transition-all ${
                    isActive
                      ? "ring-accent/40"
                      : "ring-white/[0.06] hover:ring-accent/20"
                  }`}
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
                      className="w-full h-full object-cover rounded-xl"
                      alt={conv.name}
                      unoptimized
                    />
                  ) : (
                    groupInitials
                  )}
                </div>
              ) : (
                <div className="relative">
                  <div
                    className={`w-8 h-8 rounded-xl overflow-hidden ring-1 transition-all ${
                      isActive
                        ? "ring-accent/40"
                        : "ring-white/[0.06] hover:ring-accent/20"
                    }`}
                  >
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
                  {/* Online dot */}
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-deep ${
                      isUserOnline
                        ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.4)]"
                        : "bg-ivory/10"
                    }`}
                  />
                </div>
              )}

              {/* Unread dot */}
              {hasUnread && (
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-accent border-2 border-deep shadow-[0_0_6px_rgba(0,211,187,0.4)]" />
              )}
            </div>
          );
        })}
      </aside>
    );
  }

  // ── Expanded render (existing code below unchanged) ─────────────────────
  return (
    <>
      <aside className="w-full md:w-full sm:w-80 bg-deep/90 md:bg-transparent backdrop-blur-3xl md:backdrop-blur-none flex flex-col shrink-0 flex-1 min-h-0 overflow-hidden shadow-[12px_0_40px_rgba(0,0,0,0.4)] md:shadow-none">
        {/* ── Search Header ── */}
        <div className="h-14 px-3 flex items-center justify-between border-b border-white/[0.06] shrink-0 relative">
          <div className="relative flex-1 group">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/20 group-focus-within:text-accent transition-colors duration-200"
            />
            <input
              type="text"
              placeholder="Find or start a conversation"
              className="w-full glass-card rounded-xl text-[12px] py-2 pl-9 pr-3 outline-none focus:ring-1 focus:ring-accent/30 transition-all placeholder:text-ivory/15 text-ivory/80"
              value={filterTerm}
              onChange={(e) => setFilterTerm(e.target.value)}
            />
          </div>
          {/* Gradient bottom line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/8 to-transparent" />
        </div>

        {/* ── Scrollable Content ── */}
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide flex flex-col pt-3">
          {/* Active Now section */}
          {activeNowUsers.length > 0 && (
            <div className="px-4 mb-5">
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className="w-0.5 h-3 rounded-full bg-accent/30" />
                <p className="text-[10px] font-mono font-bold tracking-[0.15em] text-ivory/25 uppercase">
                  Active Now
                </p>
              </div>
              <div className="flex gap-3 overflow-x-auto py-1 px-1 scrollbar-hide">
                {activeNowUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex flex-col items-center gap-1.5 shrink-0"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full ring-2 ring-accent/25 ring-offset-2 ring-offset-obsidian overflow-hidden shadow-[0_0_12px_rgba(0,211,187,0.1)]">
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
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-obsidian shadow-[0_0_6px_rgba(52,211,153,0.4)]" />
                    </div>
                    <span className="text-[10px] text-ivory/25 truncate max-w-10 text-center leading-tight font-mono">
                      {user._id === currentUser?._id
                        ? "You"
                        : user.name?.split(" ")[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Section label ── */}
          <div className="px-5 mb-1.5 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-0.5 h-3 rounded-full bg-accent/30" />
              <p className="text-[10px] font-mono font-bold tracking-[0.15em] text-ivory/25 uppercase">
                Direct Messages
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowArchived(!showArchived)}
                className={
                  "w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 " +
                  (showArchived
                    ? "bg-accent/15 text-accent shadow-[0_0_8px_rgba(0,211,187,0.15)]"
                    : "text-ivory/20 hover:bg-white/[0.06] hover:text-ivory/40")
                }
                title={showArchived ? "Show All DMs" : "Show Archived DMs"}
              >
                <Archive size={12} />
              </button>
              <CreateGroupModal onGroupCreated={onNewConversation} />
              <button
                onClick={() => setModalOpen(true)}
                className="w-6 h-6 rounded-lg text-ivory/20 hover:bg-white/[0.06] hover:text-ivory/40 flex items-center justify-center transition-all duration-200"
                title="New Chat"
              >
                <Edit3 size={12} />
              </button>
            </div>
          </div>

          {/* ── Conversation list ── */}
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

              // DM last-message preview with smart labels for media
              const dmPreview = (() => {
                const lm = conv.lastMessage;
                if (!lm) return "No messages yet";
                const isMe = lm.sender?._id
                  ? lm.sender._id.toString() === currentUser?._id
                  : lm.sender?.toString() === currentUser?._id;
                const prefix = isMe ? "You" : null;
                let label;
                if (lm.callLog) {
                  const cl = lm.callLog;
                  if (cl.status === "missed") label = "Missed call";
                  else if (cl.status === "declined") label = "Call declined";
                  else {
                    const dur = cl.duration
                      ? " · " +
                        Math.floor(cl.duration / 60) +
                        "m " +
                        (cl.duration % 60) +
                        "s"
                      : "";
                    label =
                      (cl.callType === "video" ? "Video" : "Audio") +
                      " call" +
                      dur;
                  }
                } else if (lm.gifUrl) {
                  label = "sent a GIF";
                } else if (lm.attachments?.length > 0) {
                  const att = lm.attachments[0];
                  if (att.resourceType === "image") label = "sent an image";
                  else if (att.resourceType === "video") label = "sent a video";
                  else label = "sent a file";
                } else {
                  return lm.text || "No messages yet";
                }
                return prefix ? `${prefix} ${label}` : label;
              })();

              return (
                <div key={conv._id} className="relative group px-1">
                  <div
                    onClick={() => setActiveConversationId(conv._id)}
                    className={
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] relative " +
                      (isActive
                        ? "bg-white/[0.06] text-ivory ring-1 ring-white/[0.06]"
                        : "text-ivory/40 hover:bg-white/[0.03] hover:text-ivory/70")
                    }
                  >
                    {/* Active Indicator Pip */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent rounded-r-full -ml-1 shadow-[0_0_8px_rgba(0,211,187,0.4)]" />
                    )}

                    {/* Avatar */}
                    <div className="relative shrink-0">
                      {isGroup ? (
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-bold text-[11px] overflow-hidden"
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
                              width={36}
                              height={36}
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
                          <div className="w-9 h-9 rounded-xl overflow-hidden">
                            <Image
                              src={
                                conv.participant?.avatar ||
                                `https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.participant?.name}`
                              }
                              width={36}
                              height={36}
                              alt={conv.participant?.name || "avatar"}
                              unoptimized
                            />
                          </div>
                          <div
                            className={
                              "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-deep " +
                              (isUserOnline
                                ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.4)]"
                                : "bg-ivory/10")
                            }
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
                              className="text-accent/60 shrink-0"
                            />
                          )}
                          <span
                            className={
                              "text-[13px] font-display font-semibold truncate " +
                              (isActive || hasUnread
                                ? "text-ivory"
                                : "text-ivory/40")
                            }
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
                              className="text-ivory/15 shrink-0"
                            />
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-ivory/15 ml-2 shrink-0">
                          {formatConvTimestamp(conv.lastMessage?.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <p
                          className={
                            "text-[11px] truncate leading-tight flex-1 " +
                            (hasUnread
                              ? "text-ivory/70 font-semibold"
                              : "text-ivory/25")
                          }
                        >
                          {isGroup ? groupPreview : dmPreview}
                        </p>
                        {hasUnread && !conv.isMuted && (
                          <div className="w-[18px] h-[18px] rounded-full bg-accent flex items-center justify-center shadow-[0_0_8px_rgba(0,211,187,0.3)] shrink-0">
                            <span className="text-[9px] font-mono font-black text-obsidian">
                              {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* More Menu */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const rect = e.currentTarget.getBoundingClientRect();
                        setMenuPos({ x: rect.left - 160, y: rect.bottom + 5 });
                        setContextMenu(
                          contextMenu === conv._id ? null : conv._id,
                        );
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-white/[0.06]"
                    >
                      <MoreVertical size={14} className="text-ivory/30" />
                    </button>
                  </div>

                  {/* Context Menu - Portaled */}
                  {contextMenu === conv._id &&
                    typeof document !== "undefined" &&
                    createPortal(
                      <div
                        ref={contextMenuRef}
                        className="fixed bg-[#13131c] border border-white/10 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.6)] z-50 py-1.5 min-w-[180px] animate-in fade-in zoom-in duration-150"
                        style={{ top: menuPos.y, left: menuPos.x }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={(e) => handleTogglePin(e, conv._id)}
                          className="w-full px-4 py-2 text-left text-[11px] text-ivory/50 hover:bg-accent/10 hover:text-accent flex items-center gap-2.5 transition-colors font-display font-medium"
                        >
                          <Pin size={12} /> {conv.isPinned ? "Unpin" : "Pin"}
                        </button>
                        <button
                          onClick={(e) => handleToggleMute(e, conv._id)}
                          className="w-full px-4 py-2 text-left text-[11px] text-ivory/50 hover:bg-accent/10 hover:text-accent flex items-center gap-2.5 transition-colors font-display font-medium"
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
                          className="w-full px-4 py-2 text-left text-[11px] text-ivory/50 hover:bg-accent/10 hover:text-accent flex items-center gap-2.5 transition-colors font-display font-medium"
                        >
                          <Archive size={12} />{" "}
                          {conv.isArchived ? "Unarchive" : "Archive"}
                        </button>
                        {conv.type === "group" && (
                          <>
                            <div className="mx-3 my-1 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
                            <button
                              onClick={(e) => handleLeaveGroup(e, conv._id)}
                              className="w-full px-4 py-2 text-left text-[11px] text-red-400/70 hover:bg-red-500/10 hover:text-red-400 flex items-center gap-2.5 transition-colors font-display font-medium"
                            >
                              <LogOut size={12} /> Leave Group
                            </button>
                          </>
                        )}
                      </div>,
                      document.body,
                    )}
                </div>
              );
            })}

            {sortedConversations.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-accent/5 blur-[40px] rounded-full" />
                  <div className="relative w-14 h-14 glass-card rounded-2xl flex items-center justify-center">
                    <Search size={22} className="text-ivory/10" />
                  </div>
                </div>
                <p className="text-sm text-ivory/15 font-serif italic leading-relaxed">
                  {filterTerm
                    ? "No matching conversations"
                    : "Start a new conversation"}
                </p>
                <p className="text-[10px] text-ivory/8 font-mono mt-1">
                  {filterTerm
                    ? "Try a different search query"
                    : "Click the edit icon above"}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── New Chat Modal ── */}
      {modalOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setModalOpen(false)}
          >
            <div
              className="glass-card rounded-3xl w-full max-w-sm overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.5)] ring-1 ring-white/[0.08] animate-in fade-in zoom-in duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex justify-between items-center px-5 py-4 border-b border-white/[0.06] relative">
                <div>
                  <h2 className="text-ivory font-display font-bold text-sm">
                    New Conversation
                  </h2>
                  <p className="text-ivory/15 text-[10px] mt-0.5 font-mono">
                    Find someone to chat with
                  </p>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="w-7 h-7 rounded-xl bg-white/[0.04] flex items-center justify-center hover:bg-white/[0.08] transition-all"
                >
                  <X size={14} className="text-ivory/30" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/10 to-transparent" />
              </div>

              <div className="p-5">
                {/* User search input */}
                <div className="relative mb-3">
                  <Search
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ivory/15"
                    size={14}
                  />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full glass-card rounded-2xl py-3 pl-10 pr-4 text-sm outline-none focus:ring-1 focus:ring-accent/30 text-ivory/80 placeholder:text-ivory/15 transition-all"
                    placeholder="Search by name or email..."
                  />
                </div>

                {/* Results */}
                <div className="space-y-0.5 max-h-60 overflow-y-auto scrollbar-hide">
                  {searching && (
                    <div className="flex items-center justify-center gap-2 py-6">
                      <div className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                      <p className="text-ivory/25 text-xs font-mono">
                        Searching...
                      </p>
                    </div>
                  )}

                  {!searching && searchQuery && searchResults.length === 0 && (
                    <p className="text-center text-ivory/15 text-xs py-6 font-mono">
                      No users found
                    </p>
                  )}

                  {searchResults.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => !startingChat && handleSelectUser(user)}
                      className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer hover:bg-white/[0.04] hover:ring-1 hover:ring-accent/10 transition-all duration-200"
                    >
                      <div className="relative shrink-0">
                        <Image
                          src={
                            user.avatar ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`
                          }
                          width={38}
                          height={38}
                          className="rounded-xl"
                          alt={user.name || "avatar"}
                          unoptimized
                        />
                        {onlineUsers?.get(user._id)?.online && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-deep shadow-[0_0_6px_rgba(52,211,153,0.4)]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-ivory/80 text-sm font-display font-semibold truncate">
                          {user.name}
                        </p>
                        <p
                          className={
                            "text-xs font-mono " +
                            (onlineUsers?.get(user._id)?.online
                              ? "text-emerald-400"
                              : "text-ivory/15")
                          }
                        >
                          {onlineUsers?.get(user._id)?.online
                            ? "Online"
                            : `Last seen ${formatLastSeen(onlineUsers?.get(user._id)?.lastSeen)}`}
                        </p>
                      </div>
                      {startingChat && (
                        <div className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* ── User Profile Modal ── */}
      {showProfile && (
        <UserProfileModal onClose={() => setShowProfile(false)} />
      )}
    </>
  );
}
