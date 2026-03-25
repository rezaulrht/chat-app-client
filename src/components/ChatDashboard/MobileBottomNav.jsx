"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, MessageCircle, Layers, User } from "lucide-react";

const NAV_ITEMS = [
  { id: "feed", label: "Feed", href: "/app/feed", icon: Compass },
  { id: "chats", label: "Chats", href: "/app", icon: MessageCircle },
  { id: "spaces", label: "Spaces", href: "/app/workspace", icon: Layers },
  { id: "profile", label: "Profile", href: "/profile", icon: User },
];

function getActiveId(pathname) {
  if (pathname.startsWith("/app/feed")) return "feed";
  if (pathname.startsWith("/app/workspace")) return "spaces";
  if (pathname.startsWith("/profile")) return "profile";
  if (pathname.startsWith("/app")) return "chats";
  return "";
}

export default function MobileBottomNav() {
  const pathname = usePathname();
  const activeId = getActiveId(pathname);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 xl:hidden border-t border-white/[0.08] bg-obsidian/95 backdrop-blur-lg supports-[backdrop-filter]:bg-obsidian/80">
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
