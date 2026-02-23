// src/components/ChatDashboard/SidebarChats.jsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Search, Edit3, X } from "lucide-react";
import api from "@/app/api/Axios";
import { useSocket } from "@/hooks/useSocket";
import CreateGroupModal from "../CreateGroupModal";
import useAuth from "@/hooks/useAuth";

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
  const { user: currentUser } = useAuth();

  // --- Conversation filter (local, client-side) ---
  const [filterTerm, setFilterTerm] = useState("");

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

  // Client-side filter on existing conversations
  const filteredConversations = conversations.filter((c) =>
    c.participant?.name?.toLowerCase().includes(filterTerm.toLowerCase()),
  );

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
        <div className="px-5 mb-4 flex justify-between items-center gap-8">
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

          <CreateGroupModal/>
        </div>

        {/* Active Now section */}
        {activeNowUsers.length > 0 && (
          <div className="px-5 mb-4">
            <p className="text-[10px] font-semibold tracking-widest text-slate-500 uppercase mb-3">
              Active Now
            </p>
            <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide">
              {activeNowUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex flex-col items-center gap-1 shrink-0"
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full ring-2 ring-teal-400 ring-offset-2 ring-offset-[#15191C] overflow-hidden">
                      <Image
                        src={
                          user.avatar ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`
                        }
                        width={48}
                        height={48}
                        className="object-cover"
                        alt={user.name || "avatar"}
                        unoptimized
                      />
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#15191C]"></span>
                  </div>
                  <span className="text-[10px] text-slate-400 truncate max-w-[52px] text-center">
                    {user._id === currentUser?._id
                      ? "You"
                      : user.name?.split(" ")[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto px-3 space-y-2">
          {filteredConversations.map((conv) => {
            const isUserOnline = onlineUsers?.get(
              conv.participant?._id,
            )?.online;
            return (
              <div
                key={conv._id}
                onClick={() => setActiveConversationId(conv._id)}
                className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                  activeConversationId === conv._id
                    ? "bg-[#1C2227] border-l-4 border-teal-400"
                    : "hover:bg-slate-800/30"
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
                      {conv.participant?.name}
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
                    {conv.lastMessage?.text || "No messages yet"}
                  </p>
                </div>
              </div>
            );
          })}

          {filteredConversations.length === 0 && (
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
