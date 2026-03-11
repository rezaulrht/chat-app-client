"use client";
import React from "react";
import Image from "next/image";
import {
  Hash,
  ChevronDown,
  ChevronLeft,
  Plus,
  Volume2,
  Lock,
  Settings,
} from "lucide-react";
import useAuth from "@/hooks/useAuth";

export default function ChannelSidebar({
  selectedWorkspaceId,
  onBack,
  activeModuleId,
}) {
  const { user: currentUser } = useAuth();

  const categories = [
    {
      name: "Information",
      channels: [
        { name: "announcements", icon: "hash", locked: true },
        { name: "rules", icon: "hash", locked: true },
        { name: "resources", icon: "hash" },
      ],
    },
    {
      name: "General",
      channels: [
        { name: "chat", icon: "hash", active: true },
        { name: "introductions", icon: "hash" },
        { name: "off-topic", icon: "hash" },
      ],
    },
    {
      name: "Development",
      channels: [
        { name: "frontend", icon: "hash" },
        { name: "backend", icon: "hash" },
        { name: "devops", icon: "hash" },
      ],
    },
    {
      name: "Voice",
      channels: [
        { name: "General Voice", icon: "voice" },
        { name: "Pair Programming", icon: "voice" },
      ],
    },
  ];

  return (
    <aside className="w-full glass-panel flex flex-col shrink-0 flex-1 min-h-0 overflow-hidden">
      {/* Workspace Header */}
      <div className="h-13 px-4 flex items-center justify-between border-b border-white/6 hover:bg-white/3 cursor-pointer transition-all duration-300 group relative">
        <div className="flex items-center gap-2 min-w-0">
          {onBack && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBack();
              }}
              className="hidden md:flex w-7 h-7 rounded-lg items-center justify-center text-ivory/20 hover:text-accent hover:bg-white/6 transition-all duration-200 -ml-1 shrink-0"
            >
              <ChevronLeft size={16} />
            </button>
          )}
          <h2 className="text-ivory font-display font-bold text-[15px] truncate">
            Workspace
          </h2>
        </div>
        <ChevronDown
          size={16}
          className="text-ivory/20 group-hover:text-ivory/60 transition-colors duration-300"
        />
        <div className="absolute bottom-0 left-4 right-4 h-px bg-linear-to-r from-transparent via-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Channel List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide py-4 px-2">
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category.name}>
              {/* Category Header */}
              <div className="flex items-center justify-between px-2 mb-1.5 group/cat cursor-pointer">
                <div className="flex items-center gap-1.5">
                  <span className="w-0.5 h-3 rounded-full bg-accent/30" />
                  <span className="text-[10px] font-mono font-bold tracking-[0.15em] uppercase text-ivory/25 group-hover/cat:text-ivory/40 transition-colors duration-200">
                    {category.name}
                  </span>
                </div>
                <Plus
                  size={13}
                  className="text-ivory/15 hover:text-accent opacity-0 group-hover/cat:opacity-100 transition-all duration-200"
                />
              </div>

              {/* Channels */}
              <div className="space-y-px">
                {category.channels.map((channel) => (
                  <div
                    key={channel.name}
                    className={
                      "flex items-center gap-2.5 px-2 py-1.75 rounded-xl cursor-pointer group/ch transition-all duration-200 relative " +
                      ((
                        activeModuleId
                          ? channel._id === activeModuleId
                          : channel.active
                      )
                        ? "bg-white/6 text-ivory backdrop-blur-sm"
                        : "hover:bg-white/3 text-ivory/30 hover:text-ivory/60")
                    }
                  >
                    {/* Active Indicator Pip */}
                    {(activeModuleId
                      ? channel._id === activeModuleId
                      : channel.active) && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.75 h-4 bg-accent rounded-r-full shadow-[0_0_6px_rgba(0,211,187,0.4)]" />
                    )}

                    {channel.icon === "voice" ? (
                      <Volume2
                        size={16}
                        className={
                          (
                            activeModuleId
                              ? channel._id === activeModuleId
                              : channel.active
                          )
                            ? "text-accent shrink-0"
                            : "text-ivory/15 group-hover/ch:text-accent/60 transition-colors duration-200 shrink-0"
                        }
                      />
                    ) : (
                      <Hash
                        size={16}
                        className={
                          (
                            activeModuleId
                              ? channel._id === activeModuleId
                              : channel.active
                          )
                            ? "text-accent shrink-0"
                            : "text-ivory/15 group-hover/ch:text-accent/60 transition-colors duration-200 shrink-0"
                        }
                      />
                    )}
                    <span className="text-[13px] font-medium leading-none flex-1 truncate">
                      {channel.name}
                    </span>
                    {channel.locked && (
                      <Lock size={11} className="text-ivory/15 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Status Bar */}
      <div className="mx-2 mb-2 p-2.5 glass-card rounded-2xl flex items-center gap-2.5">
        <div className="relative shrink-0 cursor-pointer group/av">
          <div className="w-8 h-8 rounded-xl overflow-hidden ring-1 ring-white/6 group-hover/av:ring-accent/40 transition-all duration-300">
            <Image
              src={
                currentUser?.avatar ||
                "https://api.dicebear.com/7.x/avataaars/svg?seed=" +
                  (currentUser?.name || "user")
              }
              width={32}
              height={32}
              className="rounded-xl"
              alt="avatar"
              unoptimized
            />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-deep bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.4)]" />
        </div>
        <div className="flex-1 min-w-0 cursor-pointer group/u">
          <p className="text-ivory text-[13px] font-display font-bold truncate leading-tight group-hover/u:text-accent transition-colors duration-200">
            {currentUser?.name?.split(" ")[0]}
          </p>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-ivory/20 text-[9px] font-mono font-medium uppercase tracking-[0.15em]">
              Online
            </p>
          </div>
        </div>
        <button className="w-7 h-7 rounded-lg flex items-center justify-center text-ivory/15 hover:text-ivory/40 hover:bg-white/4 transition-all duration-200">
          <Settings size={14} />
        </button>
      </div>
    </aside>
  );
}
