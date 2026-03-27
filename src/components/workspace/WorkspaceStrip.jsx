// chat-app-client/src/components/workspace/WorkspaceStrip.jsx
"use client";
import React from "react";
import Image from "next/image";
import { Plus } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useWorkspace } from "@/hooks/useWorkspace";
import useSidebarStore from "@/stores/sidebarStore";
import CreateWorkspaceModal from "@/components/workspace/CreateWorkspaceModal";

export default function WorkspaceStrip() {
  const { workspaces } = useWorkspace();
  const { workspaceCollapsed, toggleWorkspace } = useSidebarStore();
  const router = useRouter();
  const params = useParams();
  const activeWorkspaceId = params?.id;

  const handleWorkspaceClick = (ws) => {
    if (ws._id === activeWorkspaceId) return; // already here

    if (workspaceCollapsed) {
      // Expand sidebar first, then navigate — user picks channel
      toggleWorkspace(); // sets workspaceCollapsed = false
    }
    // Navigate to workspace root — auto-redirect in the page will pick first module
    router.push(`/app/workspace/${ws._id}`);
  };

  return (
    <div className="hidden md:flex flex-col items-center w-14 shrink-0 h-full bg-deep border-r border-white/[0.06] py-3 gap-1.5 overflow-y-auto scrollbar-hide">
      {(workspaces ?? []).map((ws) => {
        const isActive = ws._id === activeWorkspaceId;
        const initial = ws.name?.[0]?.toUpperCase() ?? "?";

        return (
          <div key={ws._id} className="relative flex items-center shrink-0">
            {/* Active pip */}
            {isActive && (
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
            )}

            <button
              title={ws.name}
              onClick={() => handleWorkspaceClick(ws)}
              className={`w-10 h-10 flex items-center justify-center font-display font-bold text-[13px] text-white overflow-hidden transition-all duration-150 ${
                isActive
                  ? "rounded-[12px]"
                  : "rounded-full hover:rounded-[12px]"
              }`}
              style={
                ws.avatar
                  ? {}
                  : {
                      background: `hsl(${(ws.name?.charCodeAt(0) ?? 65) * 137 % 360}deg 55% 40%)`,
                    }
              }
            >
              {ws.avatar ? (
                <Image
                  src={ws.avatar}
                  width={40}
                  height={40}
                  alt={ws.name}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                initial
              )}
            </button>
          </div>
        );
      })}

      {/* Divider */}
      <div className="w-8 h-px bg-white/[0.08] shrink-0 my-1" />

      {/* Create workspace button — uses trigger pattern to open modal */}
      <CreateWorkspaceModal
        trigger={
          <div
            title="Create workspace"
            className="w-10 h-10 rounded-full hover:rounded-[12px] flex items-center justify-center bg-white/[0.05] hover:bg-accent/15 text-accent/60 hover:text-accent transition-all duration-150 shrink-0 cursor-pointer"
          >
            <Plus size={18} />
          </div>
        }
      />
    </div>
  );
}
