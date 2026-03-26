"use client";
import React from "react";
import Image from "next/image";
import { LogOut } from "lucide-react";
import useAuth from "@/hooks/useAuth";

export default function AppSidebar({ label, children, className = "" }) {
  const { user, logout } = useAuth();

  return (
    <div
      className={`hidden md:flex flex-col shrink-0 h-full border-r border-white/[0.06] bg-deep overflow-hidden ${className}`}
      style={{ width: "var(--sidebar-width, 320px)" }}
    >
      {/* Section label */}
      {label && (
        <div className="px-4 py-3 border-b border-white/[0.04] shrink-0">
          <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-ivory/20">
            {label}
          </p>
        </div>
      )}

      {/* Content slot */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {children}
      </div>

      {/* User bar */}
      {user && (
        <div className="h-14 mx-2 mb-2 glass-card rounded-xl px-3 flex items-center gap-2.5 group/user shrink-0 ring-1 ring-white/[0.04]">
          <div className="relative shrink-0">
            <div className="w-8 h-8 rounded-xl overflow-hidden ring-1 ring-white/[0.06]">
              <Image
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                width={32}
                height={32}
                className="w-full h-full object-cover"
                alt="avatar"
                unoptimized
              />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-deep bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.4)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-ivory text-[13px] font-display font-bold truncate leading-tight">
              {user.name?.split(" ")[0]}
            </p>
            <p className="text-ivory/20 text-[10px] truncate leading-tight flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-lg hover:bg-red-500/10 text-ivory/30 hover:text-red-400 transition-all opacity-0 group-hover/user:opacity-100"
            title="Logout"
          >
            <LogOut size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
