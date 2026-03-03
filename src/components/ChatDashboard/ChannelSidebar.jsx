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
    <aside className="w-60 bg-[#2b2d31] flex flex-col shrink-0 h-full overflow-hidden">
      {/* Workspace Header */}
      <div className="h-12 px-4 flex items-center justify-between shadow-sm border-b border-[#1e1f22] hover:bg-[#35373c] cursor-pointer transition-colors group">
        <h2 className="text-white font-bold text-[15px] truncate">
          Workspace Name
        </h2>
        <ChevronDown
          size={18}
          className="text-[#949ba4] group-hover:text-white"
        />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide py-3 px-2">
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category.name}>
              <div className="flex items-center justify-between px-2 mb-1 group cursor-pointer">
                <div className="flex items-center gap-1 text-[#949ba4] uppercase text-[11px] font-bold hover:text-white transition-colors">
                  <span className="text-[8px] transform rotate-90 inline-block">
                    ▼
                  </span>
                  {category.name}
                </div>
                <Plus
                  size={14}
                  className="text-[#949ba4] hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="space-y-0.5">
                {category.channels.map((channel) => (
                  <div
                    key={channel}
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-sm hover:bg-[#35373c] text-[#949ba4] hover:text-[#dbdee1] cursor-pointer group"
                  >
                    <Hash
                      size={20}
                      className="text-[#80848e] group-hover:text-[#dbdee1]"
                    />
                    <span className="text-[15px] font-medium leading-none">
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
  );
}
