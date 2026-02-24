// src/components/ChatDashboard/SidebarChats.jsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Search, Edit3, X } from "lucide-react";
import api from "@/app/api/Axios";
import { useSocket } from "@/hooks/useSocket";
import CreateGroupModal from "../CreateGroupModal";

// Helper function to format last seen time - show actual timestamp
const formatLastSeen = (timestamp) => {
  if (!timestamp) return "";

  const date = new Date(timestamp);
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function Sidebar({
  conversations,
  activeConversationId,
  setActiveConversationId,
  onNewConversation,
}) {
  const { onlineUsers } = useSocket() || {};

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
      <aside className="w-80 bg-[#15191C] border-r border-slate-800/50 flex flex-col shrink-0 h-full">
        <div className="p-5 flex justify-between items-center">
          <img
            src="https://i.ibb.co/PG0X3Tbf/Convo-X-logo.png"
            alt="ConvoX Logo"
            className="h-6 w-auto"
          />
          {/* Pencil icon opens the new-chat modal */}
          <Edit3
            size={18}
            className="text-slate-400 cursor-pointer hover:text-teal-400 transition-colors"
            onClick={() => setModalOpen(true)}
          />
        </div>

        {/* Filter existing conversations */}
        <div className="px-5 mb-6 flex justify-between items-center gap-8">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              size={16}
            />
            <input
              type="text"
              value={filterTerm}
              onChange={(e) => setFilterTerm(e.target.value)}
              className="w-full bg-[#0B0E11] rounded-xl py-2 pl-10 pr-4 text-sm outline-none border border-transparent focus:border-teal-500/50 text-white"
              placeholder="Filter conversations..."
            />
          </div>

          <CreateGroupModal />
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto px-3 space-y-2">
          {searchedConversations.map((conv) => {
            const isUserOnline = onlineUsers?.get(
              conv.participant?._id,
            )?.online;
            return (
              <div
                key={conv._id}
                onClick={() => setActiveConversationId(conv._id)}
                className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-150 ${
                  activeConversationId === conv._id
                    ? "bg-teal-900/30 border-l-4 border-teal-500 shadow-sm"
                    : "hover:bg-slate-800/50"
                }`}
              >
                <div className="relative">
                  <Image
                    src={
                      conv.participant?.avatar ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.participant?.name}`
                    }
                    width={48}
                    height={48}
                    className="rounded-xl"
                    alt={conv.participant?.name || "avatar"}
                    unoptimized
                  />
                  {/* Online/Offline indicator - always show */}
                  <div
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#15191C] ${
                      isUserOnline ? "bg-green-500" : "bg-slate-500"
                    }`}
                  ></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm truncate text-white">
                      {highlightMatch(conv.participant?.name || "", filterTerm)}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {conv.lastMessage?.timestamp
                        ? new Date(
                            conv.lastMessage.timestamp,
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">
                    {highlightMatch(
                      conv.lastMessage?.text || "No messages yet",
                      filterTerm,
                    )}
                  </p>
                </div>
              </div>
            );
          })}

          {searchedConversations.length === 0 && (
            <p className="text-center text-slate-600 text-xs mt-4">
              {conversations.length === 0
                ? "No conversations yet. Click ✏️ to start one."
                : "No conversations found"}
            </p>
          )}
        </div>
      </aside>

      {/* New Chat Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-[#15191C] rounded-2xl w-full max-w-sm mx-4 p-5 border border-slate-700/50 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white font-bold text-sm">New Conversation</h2>
              <X
                size={18}
                className="text-slate-400 cursor-pointer hover:text-white"
                onClick={() => setModalOpen(false)}
              />
            </div>

            {/* User search input */}
            <div className="relative mb-3">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                size={16}
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0B0E11] rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none border border-transparent focus:border-teal-500/50 text-white"
                placeholder="Search by name or email..."
              />
            </div>

            {/* Results */}
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {searching && (
                <p className="text-center text-slate-500 text-xs py-4">
                  Searching...
                </p>
              )}

              {!searching && searchQuery && searchResults.length === 0 && (
                <p className="text-center text-slate-600 text-xs py-4">
                  No users found
                </p>
              )}

              {searchResults.map((user) => (
                <div
                  key={user._id}
                  onClick={() => !startingChat && handleSelectUser(user)}
                  className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-slate-800/50 transition-all"
                >
                  <div className="relative">
                    <Image
                      src={
                        user.avatar ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`
                      }
                      width={36}
                      height={36}
                      className="rounded-xl"
                      alt={user.name || "avatar"}
                      unoptimized
                    />
                    {/* Online indicator */}
                    {onlineUsers?.get(user._id)?.online && (
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#15191C]"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">
                      {user.name}
                    </p>
                    <p
                      className={`text-xs ${
                        onlineUsers?.get(user._id)?.online
                          ? "text-green-500"
                          : "text-slate-500"
                      }`}
                    >
                      {onlineUsers?.get(user._id)?.online
                        ? "Online"
                        : `Last seen ${formatLastSeen(onlineUsers?.get(user._id)?.lastSeen)}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
