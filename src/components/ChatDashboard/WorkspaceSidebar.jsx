"use client";
import React from "react";
import Image from "next/image";
import { Plus, Download, Compass } from "lucide-react";

export default function WorkspaceSidebar({
  activeView,
  setActiveView,
  selectedWorkspaceId,
  setSelectedWorkspaceId,
}) {
  // Placeholder workspaces for design purposes
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
      <div
        onClick={() => setActiveView("home")}
        className="relative group cursor-pointer mb-2"
      >
        <div
          className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 bg-white rounded-r-full transition-all duration-200 ${activeView === "home" ? "h-8" : "h-0 group-hover:h-5"}`}
        ></div>
        <div
          className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-200 shadow-lg ${activeView === "home" ? "bg-white/10 text-white" : "bg-white/5 text-teal-normal hover:bg-teal-normal hover:text-white rounded-3xl hover:rounded-2xl"}`}
        >
          <Image
            src="/favicon.png"
            width={28}
            height={28}
            alt="ConvoX"
            className=""
          />
        </div>
      </div>

      {/* Feed Button */}
      <div
        onClick={() => {
          setActiveView("feed");
          setSelectedWorkspaceId(null);
        }}
        className="relative group cursor-pointer mb-2"
      >
        <div
          className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 bg-white rounded-r-full transition-all duration-200 ${activeView === "feed" ? "h-8" : "h-0 group-hover:h-5"}`}
        ></div>
        <div
          className={`w-12 h-12 flex items-center justify-center transition-all duration-200 shadow-sm ${activeView === "feed" ? "bg-white/10 text-white rounded-2xl" : "bg-white/5 text-teal-normal hover:bg-teal-normal hover:text-white rounded-3xl hover:rounded-2xl"}`}
        >
          <Compass size={24} />
        </div>

        {/* Tooltip on hover */}
        <div className="absolute left-16 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-black text-white text-sm font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-x-2 group-hover:translate-x-0 z-50 whitespace-nowrap shadow-xl border border-white/10">
          Global Feed
        </div>
      </div>

      <div className="w-8 h-0.5 bg-white/5 rounded-full mb-2"></div>

      {/* Workspace List (Mockup) */}
      <div className="flex-1 w-full flex flex-col items-center gap-2 overflow-y-auto scrollbar-hide px-2">
        {workspaces.map((ws) => (
          <div
            key={ws.id}
            onClick={() => {
              setActiveView("workspace");
              setSelectedWorkspaceId(ws.id);
            }}
            className="relative group cursor-pointer"
          >
            <div
              className={`absolute -left-2 top-1/2 -translate-y-1/2 w-1 bg-white rounded-r-full transition-all duration-200 ${
                activeView === "workspace" && selectedWorkspaceId === ws.id
                  ? "h-8"
                  : "h-0 group-hover:h-5"
              }`}
            ></div>
            <div
              className={`w-12 h-12 flex items-center justify-center text-lg font-bold transition-all duration-200 shadow-md ${
                activeView === "workspace" && selectedWorkspaceId === ws.id
                  ? "bg-white/10 text-white rounded-2xl"
                  : "bg-surface-dark/50 text-slate-400 rounded-3xl hover:rounded-2xl border border-white/5"
              }`}
            >
              {ws.name[0]}
            </div>

            {/* Tooltip on hover */}
            <div className="absolute left-16 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-black text-white text-sm font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-x-2 group-hover:translate-x-0 z-50 whitespace-nowrap shadow-xl border border-white/10">
              {ws.name}
            </div>
          </div>
        ))}

        {/* Add Workspace Button */}
        <div className="relative group cursor-pointer">
          <div className="w-12 h-12 flex items-center justify-center bg-surface-dark text-teal-normal/50 hover:bg-teal-normal hover:text-white rounded-2xl transition-all duration-200 mt-1 shadow-md border border-white/5">
            <Plus size={24} />
          </div>
        </div>
      </div>

      <div className="flex-1" />
    </aside>
  );
}
