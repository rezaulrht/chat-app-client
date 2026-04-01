"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { useWorkspace } from "@/hooks/useWorkspace";
import ChannelSidebar from "@/components/ChatDashboard/ChannelSidebar";
import CreateWorkspaceModal from "@/components/workspace/CreateWorkspaceModal";

export default function MobileWorkspaceSidebar({
  activeWorkspaceId,
  activeModuleId,
  onSettingsOpen,
  onModuleSettingsOpen,
  onCreateModule,
  onClose,
}) {
  const router = useRouter();
  const { workspaces, loadingWorkspaces } = useWorkspace();

  return (
    <div className="md:hidden flex flex-col h-full min-h-0 overflow-hidden glass-panel border-r border-white/[0.08]">
      {/* Gradient top border */}
      <div
        className="h-px shrink-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,211,187,0.5), rgba(162,139,250,0.3), rgba(0,211,187,0.4), transparent)",
        }}
      />

      {/* Horizontal workspace avatars */}
      <div className="flex items-start gap-2.5 px-3 py-2.5 border-b border-white/[0.04] overflow-x-auto shrink-0 scrollbar-none">
        {loadingWorkspaces ? (
          <Loader2 size={16} className="text-accent/40 animate-spin mx-auto" />
        ) : (
          <>
            {workspaces.map((ws) => {
              const isActive = ws._id === activeWorkspaceId;
              return (
                <button
                  key={ws._id}
                  onClick={() => {
                    router.push(`/app/workspace/${ws._id}`);
                    onClose?.();
                  }}
                  className="flex flex-col items-center gap-1 shrink-0 group justify-start"
                  aria-label={ws.name}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-display font-bold transition-all ${isActive
                        ? "bg-accent/15 border-2 border-accent/50 text-accent shadow-[0_0_12px_rgba(0,211,187,0.15)]"
                        : "bg-white/[0.07] border border-white/[0.08] text-ivory/50 group-hover:bg-white/[0.1]"
                      }`}
                  >
                    {ws.avatar ? (
                      <img
                        src={ws.avatar}
                        alt={ws.name}
                        className="w-full h-full rounded-xl object-cover"
                      />
                    ) : (
                      (ws.name?.[0] ?? "?").toUpperCase()
                    )}
                  </div>
                  <span
                    className={`text-[9px] font-mono font-bold text-center max-w-[44px] leading-tight ${isActive ? "text-accent" : "text-ivory/30"
                      }`}
                  >
                    {ws.name?.split(" ").map((word, i, arr) => (
                      <React.Fragment key={i}>
                        {word}
                        {i < arr.length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </span>
                </button>
              );
            })}

            <div className="shrink-0">
              <CreateWorkspaceModal
                trigger={
                  <button className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/[0.03] border border-dashed border-white/[0.1] text-ivory/30 hover:text-accent hover:border-accent/30 transition-all">
                    <Plus size={14} />
                  </button>
                }
              />
            </div>
          </>
        )}
      </div>

      {/* Channel sidebar fills remaining space */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeWorkspaceId ? (
          <ChannelSidebar
            selectedWorkspaceId={activeWorkspaceId}
            activeModuleId={activeModuleId}
            onBack={() => {
              router.push("/app/workspace");
              onClose?.();
            }}
            onSettingsOpen={onSettingsOpen}
            onCreateModule={onCreateModule}
            onModuleSettingsOpen={onModuleSettingsOpen}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-ivory/20 text-xs font-display text-center px-4">
              Select a workspace above
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
