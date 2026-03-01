// src/components/ChatDashboard/SidebarChats.jsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Search, Edit3, X } from "lucide-react";
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
}) {
  const { onlineUsers } = useSocket() || {};
  const { user: currentUser } = useAuth();

  // --- Conversation filter (local, client-side) ---
  const [filterTerm, setFilterTerm] = useState("");
  const [searchedConversations, setSearchedConversations] =
    useState(conversations);

  // --- New chat modal state ---
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [startingChat, setStartingChat] = useState(false);
  const searchInputRef = useRef(null);

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
      <aside className="w-64 bg-background-dark border-r border-white/5 flex flex-col shrink-0 hidden md:flex h-full">
        {/* Workspace Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group">
          <div className="flex items-center gap-2">
            <Link href="/">
              <span className="font-bold text-base truncate text-white">
                ConvoX Dashboard
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-1">
            <CreateGroupModal />
            <button
              onClick={() => setModalOpen(true)}
              className="text-text-secondary-dark group-hover:text-white transition-colors p-1"
            >
              <Edit3 size={16} />
            </button>
          </div>
        </div>

        {/* Search / Filter */}
        <div className="px-4 py-3">
          <div className="relative group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors"
              size={15}
            />
            <input
              type="text"
              value={filterTerm}
              onChange={(e) => setFilterTerm(e.target.value)}
              className="w-full bg-[#0b1117] rounded py-2 pl-9 pr-4 text-xs outline-none border border-transparent focus:border-primary/50 text-white placeholder:text-text-secondary-dark focus:ring-1 focus:ring-primary transition-all shadow-inner"
              placeholder="Filter DMs..."
            />
          </div>
        </div>

        {/* Scrollable list of DMs / Channels */}
        <div className="flex-1 overflow-y-auto pt-1 pb-3 custom-scrollbar">
          {/* Section: Active Now */}
          {activeNowUsers.length > 0 && (
            <div className="mb-4">
              <div className="px-4 flex items-center justify-between text-[11px] font-bold text-text-secondary-dark uppercase mb-2">
                <span>Active Now</span>
                <span className="bg-white/5 px-1.5 rounded text-[10px]">
                  {activeNowUsers.length}
                </span>
              </div>
              <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
                {activeNowUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full border border-white/10 group-hover:border-primary/50 overflow-hidden transition-colors">
                        <Image
                          src={
                            user.avatar ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`
                          }
                          width={40}
                          height={40}
                          className="object-cover"
                          alt="avatar"
                          unoptimized
                        />
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background-dark"></span>
                    </div>
                    <span className="text-[10px] text-text-secondary-dark group-hover:text-white truncate max-w-[44px] text-center leading-tight transition-colors">
                      {user._id === currentUser?._id
                        ? "You"
                        : user.name?.split(" ")[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Direct Messages */}
          <div className="mb-4">
            <div className="px-3 flex items-center gap-1 text-[11px] font-bold text-text-secondary-dark uppercase hover:text-white cursor-pointer mb-1 transition-colors">
              <span className="material-symbols-outlined text-[14px]">
                expand_more
              </span>
              <span>Direct Messages</span>
            </div>
            <div className="flex flex-col gap-[2px]">
              {searchedConversations.map((conv) => {
                const isActive = activeConversationId === conv._id;
                const isUserOnline = onlineUsers?.get(
                  conv.participant?._id,
                )?.online;
                return (
                  <div
                    key={conv._id}
                    onClick={() => setActiveConversationId(conv._id)}
                    className={`mx-2 px-2 py-2 rounded flex items-center gap-2 cursor-pointer transition-colors group relative ${
                      isActive
                        ? "bg-primary/10 text-white"
                        : "hover:bg-white/5 text-text-secondary-dark hover:text-white"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r"></div>
                    )}

                    <div className="relative shrink-0">
                      <Image
                        src={
                          conv.participant?.avatar ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.participant?.name}`
                        }
                        width={28}
                        height={28}
                        className="rounded-full overflow-hidden"
                        alt="avatar"
                        unoptimized
                      />
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background-dark ${isUserOnline ? "bg-green-500" : "bg-slate-600"}`}
                      ></div>
                    </div>

                    <div className="flex-1 min-w-0 pr-1">
                      <div
                        className={`text-[13px] truncate ${isActive ? "font-bold text-white" : "font-medium"}`}
                      >
                        {highlightMatch(
                          conv.participant?.name || "",
                          filterTerm,
                        )}
                      </div>
                      <div className="text-[10px] text-text-secondary-dark truncate mt-0.5">
                        {highlightMatch(
                          conv.lastMessage?.text || "No messages yet",
                          filterTerm,
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {searchedConversations.length === 0 && (
                <div className="text-[11px] text-text-secondary-dark text-center py-4 bg-white/[0.02] rounded mx-2 border border-white/5 mt-2">
                  No matches found
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Controls Panel (Bottom) */}
        <div className="bg-[#0b1117] p-2 flex items-center gap-2 border-t border-white/5">
          <div className="relative group cursor-pointer hover:opacity-80 transition-opacity">
            <Image
              src={
                currentUser?.avatar ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name || "User"}`
              }
              width={32}
              height={32}
              className="rounded-full overflow-hidden"
              alt="User avatar"
              unoptimized
            />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#0b1117] rounded-full"></div>
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="text-[13px] font-bold truncate text-white">
              {currentUser?.name || "CurrentUser"}
            </div>
            <div className="text-[10px] text-text-secondary-dark truncate hover:underline cursor-pointer">
              Online
            </div>
          </div>
          <button className="p-1 rounded hover:bg-white/10 text-text-secondary-dark hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[18px]">mic</span>
          </button>
          <button className="p-1 rounded hover:bg-white/10 text-text-secondary-dark hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[18px]">
              headset
            </span>
          </button>
          <button className="p-1 rounded hover:bg-white/10 text-text-secondary-dark hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[18px]">
              settings
            </span>
          </button>
        </div>
      </aside>

      {/* New Chat Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-surface-dark rounded-xl w-full max-w-sm mx-4 p-5 border border-white/10 shadow-2xl shadow-black/50"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-white font-bold text-sm">
                  New Conversation
                </h2>
                <p className="text-text-secondary-dark text-xs mt-0.5">
                  Find someone to chat with
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-7 h-7 rounded hover:bg-white/10 flex items-center justify-center transition-all text-text-secondary-dark hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* User search input */}
            <div className="relative mb-3">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary-dark"
                size={16}
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0b1117] rounded-lg py-2.5 pl-10 pr-4 text-sm outline-none border border-white/5 focus:border-primary text-white placeholder:text-text-secondary-dark transition-all"
                placeholder="Search by name or email..."
              />
            </div>

            {/* Results */}
            <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar">
              {searching && (
                <div className="flex items-center justify-center gap-2 py-6">
                  <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                  <p className="text-text-secondary-dark text-xs">
                    Searching...
                  </p>
                </div>
              )}

              {!searching && searchQuery && searchResults.length === 0 && (
                <p className="text-center text-text-secondary-dark text-xs py-6">
                  No users found
                </p>
              )}

              {searchResults.map((user) => (
                <div
                  key={user._id}
                  onClick={() => !startingChat && handleSelectUser(user)}
                  className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-primary/20 border border-transparent transition-all group"
                >
                  <div className="relative shrink-0">
                    <Image
                      src={
                        user.avatar ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`
                      }
                      width={36}
                      height={36}
                      className="rounded-full"
                      alt={user.name || "avatar"}
                      unoptimized
                    />
                    {onlineUsers?.get(user._id)?.online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-surface-dark"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate group-hover:text-primary transition-colors">
                      {user.name}
                    </p>
                    <p
                      className={`text-xs ${onlineUsers?.get(user._id)?.online ? "text-green-500" : "text-text-secondary-dark"}`}
                    >
                      {onlineUsers?.get(user._id)?.online
                        ? "● Online"
                        : `Last seen ${formatLastSeen(onlineUsers?.get(user._id)?.lastSeen)}`}
                    </p>
                  </div>
                  {startingChat && (
                    <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0"></div>
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
