"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { MessageCircle, Compass, Layers, Globe } from "lucide-react";

export default function WorkspaceSidebar({
  activeView,
  setActiveView,
  selectedWorkspaceId,
  setSelectedWorkspaceId,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const tabs = [
    { id: "home", label: "Chats", icon: MessageCircle, href: "/app" },
    { id: "feed", label: "Feed", icon: Compass, href: "/app/feed" },
    { id: "workspace", label: "Spaces", icon: Layers, href: "/app/workspace" },
    { id: "discover", label: "Discover", icon: Globe, href: "/app/discover" },
  ];

  const activeId = pathname.startsWith("/app/workspace")
    ? "workspace"
    : pathname.startsWith("/app/discover")
      ? "discover"
      : pathname.startsWith("/app/feed")
        ? "feed"
        : "home";

  return (
    <div className="h-14 shrink-0 px-3 flex items-center gap-2 border-b border-white/6 bg-white/1.5">
      {/* ConvoX Logo → Landing */}
      <Link href="/" className="shrink-0 group">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/4 group-hover:bg-accent/10 transition-all duration-300 ring-1 ring-white/6 group-hover:ring-accent/20">
          <Image src="/favicon.png" width={22} height={22} alt="ConvoX" />
        </div>
      </Link>

      <div className="flex-1 min-w-0 flex items-center justify-start">
        <div className="flex w-full items-center gap-0.5 p-1 rounded-xl bg-white/3 ring-1 ring-white/4">
          {tabs.map((tab) => {
            const isActive = activeId === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  // Update highlighting if possible (avoids error)
                  if (typeof setActiveView === "function") {
                    setActiveView(tab.id);
                  }

                  // Handle navigation
                  if (tab.id === "home") {
                    router.push("/app");
                  } else if (tab.id === "feed") {
                    router.push("/app/feed");
                  } else if (tab.id === "discover") {
                    router.push("/app/discover");
                  } else if (tab.id === "workspace") {
                    if (activeView === "workspace" && selectedWorkspaceId) {
                      if (typeof setSelectedWorkspaceId === "function") {
                        setSelectedWorkspaceId(null);
                      }
                    } else {
                      router.push("/app/workspace");
                    }
                  }

                  // Reset workspace selection for non-workspace tabs
                  if (
                    tab.id !== "workspace" &&
                    typeof setSelectedWorkspaceId === "function"
                  ) {
                    setSelectedWorkspaceId(null);
                  }
                }}
                className={`flex-1 min-w-0 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-display font-bold tracking-wide transition-all duration-200 ${
                  isActive
                    ? "bg-accent/12 text-accent shadow-[0_0_12px_rgba(0,211,187,0.06)]"
                    : "text-ivory/25 hover:text-ivory/50 hover:bg-white/4"
                }`}
              >
                <Icon size={13} strokeWidth={isActive ? 2.5 : 2} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
