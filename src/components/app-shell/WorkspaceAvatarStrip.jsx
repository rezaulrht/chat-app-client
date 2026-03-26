"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useAppShell } from "./AppShellContext";
import CreateWorkspaceModal from "@/components/workspace/CreateWorkspaceModal";

export default function WorkspaceAvatarStrip({ activeWorkspaceId, modules = [], loadingModules = false }) {
  const router = useRouter();
  const { workspaces, loadingWorkspaces } = useWorkspace();
  const { setIsSidebarOpen } = useAppShell();

  return (
    <div className="md:hidden flex flex-col h-full bg-deep">
      {/* Gradient top border */}
      <div
        className="h-px shrink-0"
        style={{
          background: "linear-gradient(90deg, rgba(0,211,187,0.5), rgba(162,139,250,0.3), rgba(0,211,187,0.4), transparent)",
        }}
      />

      {/* Avatar strip */}
      <div className="h-16 flex items-center gap-3 px-3 border-b border-white/[0.04] overflow-x-auto shrink-0 scrollbar-none">
        {loadingWorkspaces ? (
          <Loader2 size={16} className="text-accent/40 animate-spin mx-auto" />
        ) : (
          <>
            {workspaces.map((ws) => {
              const isActive = ws._id === activeWorkspaceId;
              return (
                <button
                  key={ws._id}
                  onClick={() => router.push(`/app/workspace/${ws._id}`)}
                  className="flex flex-col items-center gap-1 shrink-0 group"
                  aria-label={ws.name}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-display font-bold transition-all ${
                      isActive
                        ? "bg-accent/15 border-2 border-accent/50 text-accent shadow-[0_0_12px_rgba(0,211,187,0.15)]"
                        : "bg-white/[0.07] border border-white/[0.08] text-ivory/50 group-hover:bg-white/[0.1]"
                    }`}
                  >
                    {ws.avatar ? (
                      <img src={ws.avatar} alt={ws.name} className="w-full h-full rounded-xl object-cover" />
                    ) : (
                      (ws.name?.[0] ?? "?").toUpperCase()
                    )}
                  </div>
                  {isActive && (
                    <div className="w-4 h-0.5 rounded-full bg-accent/70" />
                  )}
                </button>
              );
            })}

            {/* Create workspace */}
            <div className="shrink-0">
              <CreateWorkspaceModal trigger={
                <button className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/[0.03] border border-dashed border-white/[0.1] text-ivory/30 hover:text-accent hover:border-accent/30 transition-all">
                  <Plus size={16} />
                </button>
              } />
            </div>
          </>
        )}
      </div>

      {/* Module list for active workspace */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {!activeWorkspaceId ? (
          <p className="text-ivory/20 text-xs font-display text-center mt-8">
            Select a workspace above
          </p>
        ) : loadingModules ? (
          <div className="flex justify-center py-8">
            <Loader2 size={16} className="text-accent/40 animate-spin" />
          </div>
        ) : modules.length === 0 ? (
          <p className="text-ivory/20 text-xs font-display text-center mt-8">
            No modules yet
          </p>
        ) : (
          modules.map((mod) => (
            <button
              key={mod._id}
              onClick={() => {
                router.push(`/app/workspace/${activeWorkspaceId}/${mod._id}`);
                setIsSidebarOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.05] transition-all group text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-white/[0.07] border border-white/[0.07] flex items-center justify-center shrink-0">
                <span className="text-[10px] font-mono text-ivory/40">#</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-ivory/70 text-sm font-display font-semibold truncate group-hover:text-ivory transition-colors">
                  {mod.name}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
