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
      <aside className="w-60 bg-[#2b2d31] flex flex-col shrink-0 h-full overflow-hidden">
        {/* Header - Search Button */}
        <div className="h-12 px-2 flex items-center shadow-sm border-b border-[#1e1f22]">
          <button
            onClick={() => setModalOpen(true)}
            className="w-full h-7 bg-[#1e1f22] rounded text-[#949ba4] text-[13px] px-2 text-left hover:bg-[#1e1f22]/80 transition-all font-medium"
          >
            Find or start a conversation
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide py-3 px-2">
          <div className="space-y-0.5">
            {/* Top Navigation Items */}
            <button className="w-full flex items-center gap-3 px-2 py-2 rounded-sm text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1] transition-colors group">
              <div className="w-8 h-8 flex items-center justify-center">
                <span className="text-xl">✨</span>
              </div>
              <span className="text-[15px] font-medium">Feed</span>
            </button>

            <div className="mt-4 mb-1 px-2">
              <p className="text-[11px] font-bold text-[#949ba4] uppercase tracking-wide flex justify-between items-center group">
                Direct Messages
                <Plus
                  size={14}
                  className="cursor-pointer hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setModalOpen(true)}
                />
              </p>
            </div>

            {/* DM List */}
            {searchedConversations.map((conv) => {
              const isActive = activeConversationId === conv._id;
              const isUserOnline = onlineUsers?.get(
                conv.participant?._id,
              )?.online;
              return (
                <div
                  key={conv._id}
                  onClick={() => setActiveConversationId(conv._id)}
                  className={`flex items-center gap-3 px-2 py-1.5 rounded-sm cursor-pointer transition-all duration-75 group ${
                    isActive
                      ? "bg-[#404249] text-white"
                      : "hover:bg-[#35373c] text-[#949ba4] hover:text-[#dbdee1]"
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      <Image
                        src={
                          conv.participant?.avatar ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.participant?.name}`
                        }
                        width={32}
                        height={32}
                        className="rounded-full"
                        alt={conv.participant?.name || "avatar"}
                        unoptimized
                      />
                    </div>
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-[3px] border-[#2b2d31] group-hover:border-[#35373c] ${isActive ? "border-[#404249]" : ""} ${isUserOnline ? "bg-[#23a559]" : "bg-[#80848e]"}`}
                    ></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span
                        className={`text-[15px] truncate font-medium ${isActive ? "text-white" : "text-[#949ba4] group-hover:text-[#dbdee1]"}`}
                      >
                        {conv.participant?.name || "Deleted User"}
                      </span>
                    </div>
                  </div>
                  {isActive && (
                    <X
                      size={14}
                      className="text-[#949ba4] hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Logic to "close" DM would go here
                      }}
                    />
                  )}
                </div>
              );
            })}

            {searchedConversations.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center">
                  <Search size={16} className="text-[#949ba4]" />
                </div>
                <p className="text-[#949ba4] text-xs text-center">
                  {conversations.length === 0
                    ? "No conversations yet.\nStart one above!"
                    : "No matches found"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Simplified User Status Bar */}
        <div className="h-13 bg-[#232428] px-2 flex items-center gap-2">
          <div className="relative shrink-0 cursor-pointer">
            <div className="w-8 h-8 rounded-full overflow-hidden">
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
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-[3px] border-[#232428] bg-[#23a559]"></div>
          </div>
          <div className="flex-1 min-w-0 cursor-pointer">
            <p className="text-white text-[13px] font-bold truncate leading-tight">
              {currentUser?.name?.split(" ")[0]}
            </p>
            <p className="text-[#949ba4] text-[11px] truncate leading-tight">
              Online
            </p>
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
                  onClick={() => !startingChat && handleSelectUser(user_res)}
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
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#0f1318]"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 text-sm font-semibold truncate leading-none">
                      {user_res.name}
                    </p>
                    <p
                      className={`text-[11px] mt-1 ${onlineUsers?.get(user_res._id)?.online ? "text-green-400" : "text-slate-600"}`}
                    >
                      {onlineUsers?.get(user_res._id)?.online
                        ? "● Online"
                        : `Last seen ${formatLastSeen(onlineUsers?.get(user_res._id)?.lastSeen)}`}
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
