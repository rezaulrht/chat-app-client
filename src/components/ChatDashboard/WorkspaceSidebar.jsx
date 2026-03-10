"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Compass, Layers } from "lucide-react";
import { useRouter } from "next/navigation";

export default function WorkspaceSidebar({
  activeView,
  setActiveView,
  selectedWorkspaceId,
  setSelectedWorkspaceId,
}) {
  const router = useRouter();
  const tabs = [
    { id: "home", label: "Chats", icon: MessageCircle },
    { id: "feed", label: "Feed", icon: Compass },
    { id: "workspace", label: "Spaces", icon: Layers },
  ];

  return (
    <div className="h-14 shrink-0 px-3 flex items-center gap-3 border-b border-white/[0.06] bg-white/[0.015]">
      <Link href="/" className="shrink-0 group">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/[0.04] group-hover:bg-accent/10 transition-all duration-300 ring-1 ring-white/[0.06] group-hover:ring-accent/20">
          <Image src="/favicon.png" width={22} height={22} alt="ConvoX" />
        </div>
      </Link>

      <div className="flex-1 flex items-center justify-center">
        <div className="inline-flex items-center gap-0.5 p-1 rounded-xl bg-white/[0.03] ring-1 ring-white/[0.04]">
          {tabs.map((tab) => {
            const isActive = activeView === tab.id;
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
                    router.push("/chat");
                  } else if (tab.id === "feed") {
                    router.push("/feed");
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-display font-bold tracking-wide transition-all duration-200 ${
                  isActive
                    ? "bg-accent/12 text-accent shadow-[0_0_12px_rgba(0,211,187,0.06)]"
                    : "text-ivory/25 hover:text-ivory/50 hover:bg-white/[0.04]"
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
