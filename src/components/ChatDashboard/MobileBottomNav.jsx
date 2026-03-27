"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, MessageCircle, Layers, User } from "lucide-react";

const NAV_ITEMS = [
  { id: "feed", label: "Feed", href: "/app/feed", icon: Compass },
  { id: "chats", label: "Chats", href: "/app", icon: MessageCircle },
  { id: "spaces", label: "Spaces", href: "/app/workspace", icon: Layers },
  { id: "profile", label: "Profile", href: "/app/profile", icon: User },
];

function getActiveId(pathname) {
  if (pathname.startsWith("/app/feed")) return "feed";
  if (pathname.startsWith("/app/workspace")) return "spaces";
  if (pathname.startsWith("/app/profile")) return "profile";
  if (pathname.startsWith("/app")) return "chats";
  return "";
}

export default function MobileBottomNav() {
  const pathname = usePathname();
  const activeId = getActiveId(pathname);

  return (
    <nav className="xl:hidden shrink-0 bg-obsidian/95 backdrop-blur-lg supports-[backdrop-filter]:bg-obsidian/80 relative">
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(0,211,187,0.4), rgba(162,139,250,0.25), rgba(0,211,187,0.35), transparent)",
        }}
      />
      <div className="mx-auto grid max-w-screen-sm grid-cols-4 px-2 pt-2 pb-3">
        {NAV_ITEMS.map(({ id, label, href, icon: Icon }) => {
          const isActive = activeId === id;

          return (
            <Link
              key={id}
              href={href}
              className="flex flex-col items-center justify-center gap-1 py-1.5"
            >
              <Icon
                size={18}
                className={
                  isActive
                    ? "text-accent"
                    : "text-ivory/45 group-hover:text-ivory/70"
                }
              />
              <span
                className={`text-[10px] font-mono font-bold uppercase tracking-[0.12em] ${
                  isActive ? "text-accent" : "text-ivory/45"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
