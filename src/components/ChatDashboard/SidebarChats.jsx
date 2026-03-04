// src/components/ChatDashboard/SidebarChats.jsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Search,
  Edit3,
  X,
  Plus,
  Mic,
  Headphones,
  Settings,
  LayoutGrid,
  Users,
} from "lucide-react";
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
  activeView = "home",
  setActiveView,
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
  const [groupModalOpen, setGroupModalOpen] = useState(false);
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
    } else {
      // Re-run search logic or filter local results if necessary
      // for now, searchConversations backend handles it, but we need to re-trigger if conversations change
      // but let's keep it simple: if filtering, let the filterTerm effector handle it.
      // If we want local filter while typing fast:
      const filtered = conversations.filter(
        (c) =>
          c.participant?.name
            ?.toLowerCase()
            .includes(filterTerm.toLowerCase()) ||
          c.lastMessage?.text?.toLowerCase().includes(filterTerm.toLowerCase()),
      );
      setSearchedConversations(filtered);
    }
  }, [conversations, filterTerm]);

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
      <aside className="w-60 bg-surface-dark flex flex-col shrink-0 h-full overflow-hidden border-r border-white/5">
        {/* Search Header */}
        <div className="h-12 px-3 flex items-center justify-between shadow-sm border-b border-white/5 bg-surface-dark/50 backdrop-blur-sm">
          <div className="relative flex-1 group">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-normal transition-colors"
            />
            <input
              type="text"
              placeholder="Search or start a conversation"
              className="w-full bg-background-dark text-[12px] py-1.5 pl-8 pr-2 rounded-md outline-none border border-transparent focus:border-teal-normal/30 transition-all placeholder:text-slate-600"
              value={filterTerm}
              onChange={(e) => setFilterTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Navigation Section */}
        <div className="px-2 pt-2">
          <button
            onClick={() => setActiveView("feed")}
            className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-all duration-200 group ${activeView === "feed" ? "bg-teal-normal/10 text-teal-normal font-bold" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
            title="Activity Feed"
          >
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
              <LayoutGrid size={18} />
            </div>
            <span className="text-[14px]">Feed</span>
          </button>
        </div>

        <div className="w-full h-px bg-white/5 my-2 mx-auto max-w-[90%]"></div>

        {/* Main Conversation List */}
        <div className="flex-1 overflow-y-auto scrollbar-hide py-1 px-2 custom-scrollbar">
          <div className="flex items-center justify-between px-2 mb-2 group">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Direct Messages
            </span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setGroupModalOpen(true)}
                className="p-1 hover:bg-white/5 rounded text-slate-500 hover:text-teal-normal transition-all"
                title="Create Group Chat"
              >
                <Users size={14} />
              </button>
              <button
                onClick={() => setModalOpen(true)}
                className="p-1 hover:bg-white/5 rounded text-slate-500 hover:text-teal-normal transition-all"
                title="Start New Chat"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div className="space-y-0.5">
            {searchedConversations.length > 0 ? (
              searchedConversations.map((conv) => {
                const part = conv.participant;
                const isOnline = onlineUsers?.get(part?._id)?.online;
                const isActive = activeConversationId === conv._id;

                return (
                  <div
                    key={conv._id}
                    onClick={() => setActiveConversationId(conv._id)}
                    className={`flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer transition-all duration-200 group relative ${
                      isActive
                        ? "bg-teal-normal/10 text-teal-normal shadow-sm"
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div
                        className={`w-8 h-8 rounded-full overflow-hidden border ${isActive ? "border-teal-normal/30" : "border-white/5"}`}
                      >
                        <Image
                          src={
                            part?.avatar ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${part?.name}`
                          }
                          width={32}
                          height={32}
                          className="rounded-full"
                          alt={part?.name || "avatar"}
                          unoptimized
                        />
                      </div>
                      {isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-[3px] border-surface-dark bg-teal-normal"></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <span
                          className={`text-[14px] font-semibold truncate ${isActive ? "text-teal-normal" : "text-slate-300"}`}
                        >
                          {part?.name}
                        </span>
                        {conv.lastMessage?.createdAt && (
                          <span className="text-[10px] text-slate-600 font-medium">
                            {formatConvTimestamp(conv.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-[12px] text-slate-500 truncate leading-tight">
                          {conv.lastMessage
                            ? conv.lastMessage.text
                            : "No messages yet"}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="ml-1 bg-teal-normal text-black text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full shrink-0 shadow-lg shadow-teal-normal/20">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3">
                  <Search size={20} className="text-slate-700" />
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  {filterTerm
                    ? "No conversations match your search"
                    : "Start a conversation to get chatting"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Simplified User Status Bar */}
        <div className="h-14 bg-background-dark/80 px-3 flex items-center gap-2 border-t border-white/5">
          <div className="relative shrink-0 cursor-pointer group">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 group-hover:border-teal-normal/50 transition-colors">
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
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-[3px] border-background-dark/80 bg-teal-normal"></div>
          </div>
          <div className="flex-1 min-w-0 cursor-pointer group">
            <p className="text-white text-[13px] font-bold truncate leading-tight group-hover:text-teal-normal transition-colors">
              {currentUser?.name?.split(" ")[0]}
            </p>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-normal"></div>
              <p className="text-slate-500 text-[10px] font-medium truncate leading-tight uppercase tracking-tighter">
                Online
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* New Chat Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-surface-dark rounded-3xl w-full max-w-sm mx-4 p-5 border border-white/8 shadow-2xl shadow-black/50"
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
                className="w-7 h-7 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all font-medium"
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
                  <p className="text-slate-500 text-xs font-medium">
                    Searching...
                  </p>
                </div>
              )}

              {!searching && searchQuery && searchResults.length === 0 && (
                <p className="text-center text-slate-600 text-xs py-6 font-medium">
                  No users found
                </p>
              )}

              {searchResults.map((user_res) => (
                <div
                  key={user_res._id}
                  onClick={() => handleSelectUser(user_res)}
                  className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer hover:bg-teal-normal/8 border border-transparent hover:border-teal-normal/15 transition-all"
                >
                  <div className="relative shrink-0">
                    <Image
                      src={
                        user_res.avatar ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${user_res.name}`
                      }
                      width={38}
                      height={38}
                      className="rounded-full"
                      alt={user_res.name || "avatar"}
                      unoptimized
                    />
                    {onlineUsers?.get(user_res._id)?.online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-teal-normal rounded-full border-2 border-surface-dark"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 text-sm font-semibold truncate leading-none">
                      {user_res.name}
                    </p>
                    <p
                      className={`text-[11px] mt-1 ${onlineUsers?.get(user_res._id)?.online ? "text-teal-normal" : "text-slate-600"}`}
                    >
                      {onlineUsers?.get(user_res._id)?.online
                        ? "● Online"
                        : `Last seen ${formatLastSeen(onlineUsers?.get(user_res._id)?.lastSeen)}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Group Modal Integration */}
      <CreateGroupModal
        isOpen={groupModalOpen}
        onClose={() => setGroupModalOpen(false)}
        onGroupCreated={(newGroup) => {
          onNewConversation(newGroup);
          setGroupModalOpen(false);
        }}
      />
    </>
  );
}
