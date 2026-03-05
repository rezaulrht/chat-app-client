"use client";
import React from "react";
import Image from "next/image";
import { Hash, ChevronDown, Plus } from "lucide-react";
import useAuth from "@/hooks/useAuth";

export default function ChannelSidebar({ selectedWorkspaceId }) {
  const { user: currentUser } = useAuth();

  // Placeholder categories and channels for the workspace
  const categories = [
    {
      name: "General",
      channels: ["support", "color-roles", "perks"],
    },
    {
      name: "Community",
      channels: ["introductions", "chat", "selfies"],
    },
  ];

  return (
    <aside className="w-60 bg-[#0f1318] border-r border-white/5 flex flex-col shrink-0 h-full overflow-hidden">
      {/* Workspace Header */}
      <div className="h-12 px-4 flex items-center justify-between shadow-sm border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors group">
        <h2 className="text-white font-bold text-[15px] truncate">
          Workspace Name
        </h2>
        <ChevronDown
          size={18}
          className="text-slate-500 group-hover:text-white"
        />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide py-3 px-2 custom-scrollbar">
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category.name}>
              <div className="flex items-center justify-between px-2 mb-1 group cursor-pointer">
                <div className="flex items-center gap-1 text-slate-500 uppercase text-[11px] font-bold hover:text-slate-300 transition-colors">
                  <span className="text-[8px] transform rotate-90 inline-block">
                    ▼
                  </span>
                  {category.name}
                </div>
                <Plus
                  size={14}
                  className="text-slate-500 hover:text-teal-normal opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="space-y-0.5">
                {category.channels.map((channel) => (
                  <div
                    key={channel}
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 cursor-pointer group transition-all"
                  >
                    <Hash
                      size={20}
                      className="text-slate-600 group-hover:text-teal-normal transition-colors"
                    />
                    <span className="text-[14px] font-medium leading-none">
                      {channel}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
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
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-[3px] border-[#0f1318] bg-teal-normal"></div>
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
  );
}
