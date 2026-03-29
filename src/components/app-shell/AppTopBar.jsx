"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, ChevronLeft, User, LogOut, MessageCircle, Compass, Layers, Home } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { useAppShell } from "./AppShellContext";
import ThemeSwitcher from "@/components/shared/ThemeSwitcher";

const TABS = [
  { id: "landing",   label: "Home",      href: "/",              icon: Home },
  { id: "home",      label: "Chats",     href: "/app",           icon: MessageCircle },
  { id: "feed",      label: "Feed",      href: "/app/feed",      icon: Compass },
  { id: "workspace", label: "Workspace", href: "/app/workspace", icon: Layers },
];

function getActiveTab(pathname) {
  if (pathname.startsWith("/app/workspace") || pathname.startsWith("/app/discover")) return "workspace";
  if (pathname.startsWith("/app/feed")) return "feed";
  if (pathname.startsWith("/app")) return "home";
  return "landing";
}

export default function AppTopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { setIsSidebarOpen, backNav } = useAppShell();
  const activeTab = getActiveTab(pathname);
  const isFeed = pathname.startsWith("/app/feed");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  return (
    <header className="h-12 md:h-14 shrink-0 flex items-center px-4 gap-3 bg-deep/95 backdrop-blur-xl border-b border-white/[0.06] relative z-40">
      {/* Gradient bottom border — same as footer top border */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(0,211,187,0.5) 30%, rgba(162,139,250,0.3) 60%, rgba(0,211,187,0.4) 80%, transparent)",
        }}
      />

      {/* Mobile: back button (deep pages like module chat) OR hamburger */}
      {backNav ? (
        <button
          className="md:hidden flex items-center gap-1 text-ivory/60 hover:text-ivory transition-colors shrink-0"
          onClick={() => router.push(backNav.href)}
          aria-label="Go back"
        >
          <ChevronLeft size={18} />
          <span className="text-[12px] font-display font-semibold truncate max-w-[120px]">{backNav.label}</span>
        </button>
      ) : (
        <button
          className="md:hidden w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-ivory/50 hover:text-ivory hover:bg-white/[0.07] transition-all shrink-0"
          onClick={() => setIsSidebarOpen((v) => !v)}
          aria-label="Toggle sidebar"
        >
          <Menu size={15} />
        </button>
      )}

      {/* Logo + tagline */}
      <Link href="/" className="flex items-center gap-2 group shrink-0">
        <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-accent/10 border border-accent/25 shadow-[0_0_12px_rgba(0,211,187,0.08)] group-hover:bg-accent/15 transition-all">
          <Image src="/favicon.png" width={16} height={16} alt="ConvoX" />
        </div>
        <p className="hidden sm:block text-[13px] font-display font-bold text-ivory/90 leading-none">ConvoX</p>
      </Link>

      {/* Nav pills — centered absolutely (desktop/tablet only) */}
      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-0.5 p-1 rounded-xl bg-white/[0.03] border border-white/[0.04]">
        {TABS.map(({ id, label, href, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <Link
              key={id}
              href={href}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[11px] font-display font-bold tracking-wide transition-all duration-200 ${
                isActive
                  ? "bg-accent/10 border border-accent/[0.18] text-accent"
                  : "text-ivory/30 hover:text-ivory/60 hover:bg-white/[0.04]"
              }`}
            >
              <Icon size={12} />
              {label}
            </Link>
          );
        })}
      </div>

      <div className="flex-1" />

      {/* Feed: compose button — mobile only (desktop has compose in the Feed sidebar) */}
      {isFeed && (
        <Link
          href="/app/feed?compose=1"
          className="md:hidden w-8 h-8 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent/70 hover:text-accent hover:bg-accent/15 transition-all text-lg font-light shrink-0"
          aria-label="New post"
        >
          +
        </Link>
      )}

      <ThemeSwitcher />

      {/* Profile button + dropdown */}
      {mounted && user && (
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="relative w-8 h-8 rounded-xl overflow-hidden ring-1 ring-white/[0.08] hover:ring-accent/40 transition-all"
            aria-label="Profile menu"
          >
            <Image
              src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name || "user"}`}
              width={32}
              height={32}
              className="w-full h-full object-cover"
              alt="avatar"
              unoptimized
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-deep bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.4)]" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 glass-card rounded-2xl border border-white/[0.08] shadow-[0_16px_48px_rgba(0,0,0,0.4)] overflow-hidden z-50">
              {/* User info */}
              <div className="px-4 py-3 border-b border-white/[0.06]">
                <p className="text-ivory text-[13px] font-display font-bold truncate">{user.name}</p>
                <p className="text-ivory/30 text-[11px] font-mono truncate mt-0.5">{user.email}</p>
              </div>
              {/* Actions */}
              <div className="p-1.5 flex flex-col gap-0.5">
                <Link
                  href="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-ivory/70 hover:text-ivory hover:bg-white/[0.05] transition-all text-[13px] font-display font-semibold"
                >
                  <User size={14} className="text-ivory/40" />
                  My Profile
                </Link>
                <button
                  onClick={() => { setDropdownOpen(false); logout(); }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-ivory/70 hover:text-red-400 hover:bg-red-500/[0.08] transition-all text-[13px] font-display font-semibold w-full text-left"
                >
                  <LogOut size={14} className="text-ivory/40 group-hover:text-red-400" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
