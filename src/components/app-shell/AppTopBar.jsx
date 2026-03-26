"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, ChevronLeft } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { useAppShell } from "./AppShellContext";

const TABS = [
  { id: "home",      label: "Chats",  href: "/app" },
  { id: "feed",      label: "Feed",   href: "/app/feed" },
  { id: "workspace", label: "Spaces", href: "/app/workspace" },
];

function getActiveTab(pathname) {
  if (pathname.startsWith("/app/workspace") || pathname.startsWith("/app/discover")) return "workspace";
  if (pathname.startsWith("/app/feed")) return "feed";
  return "home";
}

export default function AppTopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { setIsSidebarOpen, backNav } = useAppShell();
  const activeTab = getActiveTab(pathname);
  const isFeed = pathname.startsWith("/app/feed");

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
        <div className="hidden sm:block">
          <p className="text-[13px] font-display font-bold text-ivory/90 leading-none">ConvoX</p>
          <p className="text-[9px] font-serif italic text-accent/45 leading-none mt-0.5">Precision.</p>
        </div>
      </Link>

      {/* Divider — desktop only */}
      <div className="hidden md:block w-px h-4 bg-white/[0.07] shrink-0" />

      {/* Nav pills — desktop/tablet only */}
      <div className="hidden md:flex items-center gap-0.5 p-1 rounded-xl bg-white/[0.03] border border-white/[0.04]">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => router.push(tab.href)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-display font-bold tracking-wide transition-all duration-200 ${
                isActive
                  ? "bg-accent/10 border border-accent/18 text-accent"
                  : "text-ivory/30 hover:text-ivory/60 hover:bg-white/[0.04]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1" />

      {/* Go to site — desktop only */}
      <Link
        href="/"
        className="hidden lg:flex items-center px-3 py-1.5 rounded-lg text-[11px] font-display font-bold text-accent/60 hover:text-accent bg-accent/[0.06] border border-accent/[0.12] hover:bg-accent/[0.1] transition-all"
      >
        Go to site
      </Link>

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

      {/* Avatar */}
      {user && (
        <Link
          href="/profile"
          className="relative shrink-0 group/avatar"
          title="My Profile"
        >
          <div className="w-7 h-7 rounded-xl overflow-hidden ring-1 ring-white/[0.08] group-hover/avatar:ring-accent/40 transition-all">
            <Image
              src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name || "user"}`}
              width={28}
              height={28}
              className="w-full h-full object-cover"
              alt="avatar"
              unoptimized
            />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-deep bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.4)]" />
        </Link>
      )}
    </header>
  );
}
