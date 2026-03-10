"use client";
import { useRouter } from "next/navigation";
import { Plus, Layers, Loader2 } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import WorkspaceSidebar from "@/components/ChatDashboard/WorkspaceSidebar";
import CreateWorkspaceModal from "@/components/workspace/CreateWorkspaceModal";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useState } from "react";

export default function WorkspaceListPage() {
  const router = useRouter();
  const { workspaces, loadingWorkspaces } = useWorkspace();
  const [activeView, setActiveView] = useState("workspace");
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(null);

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen w-full bg-obsidian overflow-hidden">
         <WorkspaceSidebar
             activeView={activeView}
                 setActiveView={setActiveView}
                 selectedWorkspaceId={selectedWorkspaceId}
                 setSelectedWorkspaceId={setSelectedWorkspaceId}
               /> 

        <div className="flex flex-1 min-h-0">
          {/* Workspace List Panel */}
          <div className="w-80 shrink-0 glass-panel border-r border-white/[0.06] flex flex-col">
            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-ivory/25">
                Your Workspaces
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {loadingWorkspaces ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={20} className="text-accent/40 animate-spin" />
                </div>
              ) : (
                workspaces.map((ws) => (
                  <button
                    key={ws._id}
                    onClick={() => router.push(`/app/workspace/${ws._id}`)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/[0.04] active:bg-white/[0.08] transition-all duration-150 group"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-display font-bold text-white/80 transition-all group-hover:shadow-lg bg-accent/10 border border-accent/20"
                    >
                      {ws.avatar ? (
                        <img src={ws.avatar} alt={ws.name} className="w-full h-full rounded-xl object-cover" />
                      ) : (
                        ws.name[0].toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-ivory/70 text-sm font-display font-semibold truncate group-hover:text-ivory transition-colors">
                        {ws.name}
                      </p>
                      <p className="text-ivory/15 text-[10px] font-mono mt-0.5">
                        {ws.memberCount ?? ws.members?.length ?? 0} members
                      </p>
                    </div>
                  </button>
                ))
              )}

              {/* Create Workspace */}
              <CreateWorkspaceModal />
            </div>
          </div>

          {/* Right empty state */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-3">
              <Layers size={40} className="mx-auto text-ivory/10" />
              <p className="font-display text-sm text-ivory/20">
                Select a workspace to get started
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
