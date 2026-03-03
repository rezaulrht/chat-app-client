"use client";
import React from "react";
import Image from "next/image";
import { Plus, Compass, Download } from "lucide-react";

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
    <aside className="w-[72px] bg-[#0e0f11] flex flex-col items-center py-3 shrink-0 h-full overflow-y-auto scrollbar-hide gap-2">
      {/* Home / DMs Button */}
      <div className="relative group mb-1">
        <div
          className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 bg-white rounded-r-full transition-all duration-200 ${
            activeView === "home" ? "h-8" : "h-0 group-hover:h-5"
          }`}
        />
        <button
          onClick={() => setActiveView("home")}
          className={`w-12 h-12 flex items-center justify-center transition-all duration-200 group-hover:rounded-2xl ${
            activeView === "home"
              ? "bg-teal-normal rounded-2xl text-white shadow-lg shadow-teal-normal/20"
              : "bg-[#313338] rounded-3xl text-[#dbdee1] hover:bg-teal-normal hover:text-white"
          }`}
        >
          <Image
            src="/favicon.png"
            alt="Home"
            width={28}
            height={28}
            className="rounded-sm"
          />
        </button>
      </div>

      <div className="w-8 h-[2px] bg-[#313338] rounded-full mx-auto my-1" />

      {/* Workspace List */}
      {workspaces.map((ws) => (
        <div key={ws.id} className="relative group">
          <div
            className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 bg-white rounded-r-full transition-all duration-200 ${
              selectedWorkspaceId === ws.id && activeView === "workspace"
                ? "h-8"
                : "h-0 group-hover:h-5"
            }`}
          />
          <button
            onClick={() => {
              setActiveView("workspace");
              setSelectedWorkspaceId(ws.id);
            }}
            className={`w-12 h-12 flex items-center justify-center transition-all duration-200 group-hover:rounded-2xl overflow-hidden ${
              selectedWorkspaceId === ws.id && activeView === "workspace"
                ? "rounded-2xl"
                : "bg-[#313338] rounded-3xl hover:rounded-2xl shadow-lg shadow-teal-normal/10"
            }`}
            title={ws.name}
          >
            <Image
              src={ws.icon}
              alt={ws.name}
              width={48}
              height={48}
              className="object-cover"
              unoptimized
            />
          </button>
        </div>
      ))}

      {/* Action Buttons */}
      <button className="w-12 h-12 rounded-3xl bg-[#313338] text-teal-normal flex items-center justify-center hover:bg-teal-normal hover:text-black hover:rounded-2xl transition-all duration-200 mt-1 shadow-sm">
        <Plus size={24} />
      </button>

      <div className="flex-1" />

      {/* Bottom Download Icon (Discord-like) */}
      <button className="w-12 h-12 rounded-3xl bg-[#313338] text-teal-normal flex items-center justify-center hover:bg-teal-normal hover:text-black hover:rounded-2xl transition-all duration-200 mb-2">
        <Download size={20} />
      </button>
    </aside>
  );
}
