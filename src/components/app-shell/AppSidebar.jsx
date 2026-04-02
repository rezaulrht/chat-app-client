// chat-app-client/src/components/app-shell/AppSidebar.jsx
"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import useSidebarStore from "@/stores/sidebarStore";
import UserProfileCard from "@/components/profile/UserProfileCard";
import FullUserProfile from "@/components/profile/FullUserProfile";

const STORE_KEY_MAP = {
  chat: { flag: "chatCollapsed", toggle: "toggleChat", width: "chatSidebarWidth", setWidth: "setChatSidebarWidth" },
  feed: { flag: "feedCollapsed", toggle: "toggleFeed" },
  workspace: { flag: "workspaceCollapsed", toggle: "toggleWorkspace", width: "workspaceSidebarWidth", setWidth: "setWorkspaceSidebarWidth" },
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
  const [showUserCard, setShowUserCard] = useState(false);
  const [showFullProfile, setShowFullProfile] = useState(false);
  const userBarRef = useRef(null);
  const resizeRef = useRef(null);

  const collapsed =
    storeKey && STORE_KEY_MAP[storeKey]
      ? store[STORE_KEY_MAP[storeKey].flag]
      : false;

  const toggle =
    storeKey && STORE_KEY_MAP[storeKey]
      ? store[STORE_KEY_MAP[storeKey].toggle]
      : null;

  const sidebarWidth = storeKey && STORE_KEY_MAP[storeKey]?.width
    ? store[STORE_KEY_MAP[storeKey].width] || 320
    : 320;

  const setSidebarWidth = storeKey && STORE_KEY_MAP[storeKey]?.setWidth
    ? store[STORE_KEY_MAP[storeKey].setWidth]
    : null;

  const width = collapsed ? "56px" : `${sidebarWidth}px`;

  // Resize handle
  const handleResizeStart = useCallback((e) => {
    if (!setSidebarWidth || collapsed) return;
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const handleMouseMove = (e) => {
      const delta = e.clientX - startX;
      setSidebarWidth(startWidth + delta);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [setSidebarWidth, collapsed, sidebarWidth]);

  // Clear user card state when sidebar collapses
  useEffect(() => {
    if (collapsed) {
      setShowUserCard(false);
      setShowFullProfile(false);
    }
  }, [collapsed]);

  // Pass collapsed as a direct prop to the single child
  const child = React.Children.only(children);
  // Only inject collapsed into React components, not native DOM elements
  const childWithCollapsed =
    typeof child.type === "string"
      ? child
      : React.cloneElement(child, { collapsed });

  return (
    <div
      className={`hidden md:flex flex-col shrink-0 h-full bg-white/[0.02] backdrop-blur-xl overflow-hidden transition-[width] duration-300 ease-in-out relative ${className}`}
      style={{ width, ...style }}
    >
      {/* Resize handle */}
      {setSidebarWidth && !collapsed && (
        <div
          className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-accent/20 transition-colors z-50"
          onMouseDown={handleResizeStart}
        />
      )}

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
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pb-16 scrollbar-hide">{childWithCollapsed}</div>

      {/* User Status Bar — matches ChannelSidebar design */}
      {user && !collapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-deep border-t border-white/[0.04]">
          <button
            ref={userBarRef}
            type="button"
            onClick={() => setShowUserCard(!showUserCard)}
            className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/[0.04] transition-colors group"
          >
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-white/10">
                <Image
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                  alt=""
                  unoptimized
                />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-deep bg-emerald-400" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[12px] font-semibold text-ivory/90 truncate">{user.name}</p>
              <p className="text-[10px] text-ivory/40 truncate">
                {user.statusMessage || "Online"}
              </p>
            </div>
            <LogOut size={14} className="text-ivory/20 group-hover:text-ivory/50 transition-colors" />
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
                priority
              />
            </div>
          </Link>
        </div>
      )}
      {showUserCard && !collapsed && (
        <UserProfileCard 
           anchorRef={userBarRef} 
           onClose={() => setShowUserCard(false)} 
           onOpenFullProfile={() => {
             setShowUserCard(false);
             setShowFullProfile(true);
           }}
        />
      )}
      {showFullProfile && createPortal(
        <FullUserProfile 
          user={user}
          isOwnProfile={true}
          onClose={() => setShowFullProfile(false)} 
        />,
        document.body
      )}
    </div>
  );
}
