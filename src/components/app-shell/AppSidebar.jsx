// chat-app-client/src/components/app-shell/AppSidebar.jsx
"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import useSidebarStore from "@/stores/sidebarStore";

const STORE_KEY_MAP = {
  chat: { flag: "chatCollapsed", toggle: "toggleChat" },
  feed: { flag: "feedCollapsed", toggle: "toggleFeed" },
  workspace: { flag: "workspaceCollapsed", toggle: "toggleWorkspace" },
};

export default function AppSidebar({
  label,
  children,
  className = "",
  style = {},
  storeKey, // "chat" | "feed" | "workspace" | undefined
}) {
  const { user, logout } = useAuth();
  const store = useSidebarStore();

  const collapsed =
    storeKey && STORE_KEY_MAP[storeKey]
      ? store[STORE_KEY_MAP[storeKey].flag]
      : false;

  const toggle =
    storeKey && STORE_KEY_MAP[storeKey]
      ? store[STORE_KEY_MAP[storeKey].toggle]
      : null;

  const width = collapsed ? "56px" : "var(--sidebar-width, 320px)";

  // Pass collapsed as a direct prop to the single child
  const child = React.Children.only(children);
  const childWithCollapsed = React.cloneElement(child, { collapsed });

  return (
    <div
      className={`hidden md:flex flex-col shrink-0 h-full border-r border-white/[0.06] bg-deep overflow-hidden transition-[width] duration-300 ease-in-out ${className}`}
      style={{ width, ...style }}
    >
      {/* Toggle button — always visible when storeKey is set */}
      {toggle && (
        <div className="flex items-center justify-between px-3 pt-2 pb-1 shrink-0">
          {!collapsed && label && (
            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-ivory/20">
              {label}
            </p>
          )}
          <button
            onClick={toggle}
            className={`ml-auto p-1.5 rounded-lg text-ivory/25 hover:text-ivory/60 hover:bg-white/[0.06] transition-all ${collapsed ? "mx-auto" : ""}`}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen size={14} />
            ) : (
              <PanelLeftClose size={14} />
            )}
          </button>
        </div>
      )}

      {/* Section label (only when no storeKey toggle, original behaviour) */}
      {!toggle && label && (
        <div className="px-4 py-3 border-b border-white/[0.04] shrink-0">
          <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-ivory/20">
            {label}
          </p>
        </div>
      )}

      {/* Content slot */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {childWithCollapsed}
      </div>

      {/* User bar — hidden when collapsed */}
      {user && !collapsed && (
        <div className="h-14 mx-2 mb-2 glass-card rounded-xl px-3 flex items-center gap-2.5 group/user shrink-0 ring-1 ring-white/[0.04]">
          <Link href="/profile" className="relative shrink-0">
            <div className="w-8 h-8 rounded-xl overflow-hidden ring-1 ring-white/[0.06] group-hover/user:ring-accent/30 transition-all">
              <Image
                src={
                  user.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`
                }
                width={32}
                height={32}
                className="w-full h-full object-cover"
                alt={user.name ? `${user.name}'s avatar` : "avatar"}
                unoptimized
              />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-deep bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.4)]" />
          </Link>
          <Link href="/profile" className="flex-1 min-w-0">
            <p className="text-ivory text-[13px] font-display font-bold truncate leading-tight group-hover/user:text-accent transition-colors">
              {user.name?.split(" ")[0]}
            </p>
            <p className="text-ivory/20 text-[10px] truncate leading-tight flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </p>
          </Link>
          <button
            onClick={logout}
            className="p-1.5 rounded-lg hover:bg-red-500/10 text-ivory/30 hover:text-red-400 transition-all opacity-0 group-hover/user:opacity-100"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut size={14} />
          </button>
        </div>
      )}

      {/* User avatar only when collapsed */}
      {user && collapsed && (
        <div className="mb-2 flex justify-center shrink-0">
          <Link href="/profile">
            <div className="w-8 h-8 rounded-xl overflow-hidden ring-1 ring-white/[0.06] hover:ring-accent/30 transition-all">
              <Image
                src={
                  user.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`
                }
                width={32}
                height={32}
                className="w-full h-full object-cover"
                alt={user.name ? `${user.name}'s avatar` : "avatar"}
                unoptimized
              />
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
