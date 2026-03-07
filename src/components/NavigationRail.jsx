"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Compass } from "lucide-react";

export default function NavigationRail({ onNavigate }) {
  const pathname = usePathname();

  // Determine active state from URL
  const isHome = pathname === "/chat" || pathname === "/chat/";
  const isFeed = pathname === "/chat/feed";
  const activeWorkspaceId = pathname.startsWith("/chat/workspace/")
    ? pathname.split("/")[3]
    : null;

  // Hardcoded workspaces — will be swapped with useWorkspace() hook on Day 6 (Member 5)
  const workspaces = [
    {
      id: "ws1",
      name: "Modernize",
      icon: "https://api.dicebear.com/7.x/initials/svg?seed=M&backgroundColor=5865f2",
    },
    {
      id: "ws2",
      name: "Dev Team",
      icon: "https://api.dicebear.com/7.x/initials/svg?seed=D&backgroundColor=3ba55c",
    },
  ];

  return (
    <aside className="w-18 bg-background-dark py-3 flex flex-col items-center gap-2 shrink-0 h-full overflow-hidden border-r border-white/5">
      {/* Home / DM Button */}
      <Link
        href="/chat"
        onClick={onNavigate}
        className="relative group cursor-pointer mb-2"
      >
        <div
          className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 bg-white rounded-r-full transition-all duration-200 ${
            isHome ? "h-8" : "h-0 group-hover:h-5"
          }`}
        />
        <div
          className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-200 shadow-lg ${
            isHome
              ? "bg-white/10 text-white"
              : "bg-white/5 text-teal-normal hover:bg-teal-normal hover:text-white rounded-3xl hover:rounded-2xl"
          }`}
        >
          <Image src="/favicon.png" width={28} height={28} alt="ConvoX" />
        </div>

        {/* Tooltip */}
        <div className="absolute left-16 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-black text-white text-sm font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-x-2 group-hover:translate-x-0 z-50 whitespace-nowrap shadow-xl border border-white/10">
          Direct Messages
        </div>
      </Link>

      {/* Feed Button */}
      <Link
        href="/chat/feed"
        onClick={onNavigate}
        className="relative group cursor-pointer mb-2"
      >
        <div
          className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 bg-white rounded-r-full transition-all duration-200 ${
            isFeed ? "h-8" : "h-0 group-hover:h-5"
          }`}
        />
        <div
          className={`w-12 h-12 flex items-center justify-center transition-all duration-200 shadow-sm ${
            isFeed
              ? "bg-white/10 text-white rounded-2xl"
              : "bg-white/5 text-teal-normal hover:bg-teal-normal hover:text-white rounded-3xl hover:rounded-2xl"
          }`}
        >
          <Compass size={24} />
        </div>

        {/* Tooltip */}
        <div className="absolute left-16 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-black text-white text-sm font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-x-2 group-hover:translate-x-0 z-50 whitespace-nowrap shadow-xl border border-white/10">
          Global Feed
        </div>
      </Link>

      {/* Divider */}
      <div className="w-8 h-0.5 bg-white/5 rounded-full mb-2" />

      {/* Workspace List */}
      <div className="flex-1 w-full flex flex-col items-center gap-2 overflow-y-auto scrollbar-hide px-2">
        {workspaces.map((ws) => (
          <Link
            key={ws.id}
            href={`/chat/workspace/${ws.id}`}
            onClick={onNavigate}
            className="relative group cursor-pointer"
          >
            <div
              className={`absolute -left-2 top-1/2 -translate-y-1/2 w-1 bg-white rounded-r-full transition-all duration-200 ${
                activeWorkspaceId === ws.id ? "h-8" : "h-0 group-hover:h-5"
              }`}
            />
            <div
              className={`w-12 h-12 flex items-center justify-center text-lg font-bold transition-all duration-200 shadow-md ${
                activeWorkspaceId === ws.id
                  ? "bg-white/10 text-white rounded-2xl"
                  : "bg-surface-dark/50 text-slate-400 rounded-3xl hover:rounded-2xl border border-white/5"
              }`}
            >
              {ws.name[0]}
            </div>

            {/* Tooltip */}
            <div className="absolute left-16 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-black text-white text-sm font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-x-2 group-hover:translate-x-0 z-50 whitespace-nowrap shadow-xl border border-white/10">
              {ws.name}
            </div>
          </Link>
        ))}

        {/* Add Workspace Button */}
        <div className="relative group cursor-pointer">
          <div className="w-12 h-12 flex items-center justify-center bg-surface-dark text-teal-normal/50 hover:bg-teal-normal hover:text-white rounded-2xl transition-all duration-200 mt-1 shadow-md border border-white/5">
            <Plus size={24} />
          </div>

          {/* Tooltip */}
          <div className="absolute left-16 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-black text-white text-sm font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-x-2 group-hover:translate-x-0 z-50 whitespace-nowrap shadow-xl border border-white/10">
            Add a Workspace
          </div>
        </div>
      </div>

      <div className="flex-1" />
    </aside>
  );
}
