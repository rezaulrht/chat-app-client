// src/components/ChatDashboard/SidebarChats.jsx
"use client";
import React, { useState } from "react";
import { Search, Edit3 } from "lucide-react";

export default function Sidebar({ chats, activeChatId, setActiveChatId }) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter chats based on search input
  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <aside className="w-80 bg-[#15191C] border-r border-slate-800/50 flex flex-col shrink-0 h-full">
      <div className="p-5 flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">ConvoX</h1>
        <Edit3 size={18} className="text-slate-400 cursor-pointer" />
      </div>

      {/* Search Input */}
      <div className="px-5 mb-6">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            size={16}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0B0E11] rounded-xl py-2 pl-10 pr-4 text-sm outline-none border border-transparent focus:border-teal-500/50 text-white"
            placeholder="Search messages..."
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 space-y-2">
        {filteredChats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => setActiveChatId(chat.id)}
            className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
              activeChatId === chat.id
                ? "bg-[#1C2227] border-l-4 border-teal-400"
                : "hover:bg-slate-800/30"
            }`}
          >
            <img
              src={chat.avatar}
              className="w-12 h-12 rounded-xl"
              alt={chat.name}
            />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-sm truncate text-white">
                  {chat.name}
                </span>
                <span className="text-[10px] text-slate-500">{chat.time}</span>
              </div>
              <p className="text-xs text-slate-500 truncate">{chat.lastMsg}</p>
            </div>
          </div>
        ))}
        {filteredChats.length === 0 && (
          <p className="text-center text-slate-600 text-xs mt-4">
            No conversations found
          </p>
        )}
      </div>
    </aside>
  );
}
