"use client";
import { useRouter } from "next/navigation";
import { Plus, Layers } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import WorkspaceSidebar from "@/components/ChatDashboard/WorkspaceSidebar";

export default function WorkspaceListPage() {
  const router = useRouter();

  // TODO [Member 5]: Remove mock data — replace with useWorkspace() hook
  const mockWorkspaces = [
    { id: "ws1", name: "Modernize", color: "#5865f2" },
    { id: "ws2", name: "Dev Team", color: "#3ba55c" },
    { id: "ws3", name: "Startup Hub", color: "#f59e0b" },
  ];

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen w-full bg-obsidian overflow-hidden">
        <WorkspaceSidebar />

        <div className="flex flex-1 min-h-0">
          {/* Workspace List Panel */}
          <div className="w-80 shrink-0 glass-panel border-r border-white/6 flex flex-col">
            <div className="px-4 py-3 border-b border-white/6">
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-ivory/25">
                Your Workspaces
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {mockWorkspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => router.push(`/app/workspace/${ws.id}`)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/4 active:bg-white/8 transition-all duration-150 group"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-display font-bold text-white/80 transition-all group-hover:shadow-lg"
                    style={{
                      background: ws.color + "20",
                      border: "1px solid " + ws.color + "30",
                    }}
                  >
                    {ws.name[0]}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-ivory/70 text-sm font-display font-semibold truncate group-hover:text-ivory transition-colors">
                      {ws.name}
                    </p>
                    <p className="text-ivory/15 text-[10px] font-mono mt-0.5">
                      Workspace
                    </p>
                  </div>
                </button>
              ))}

              {/* TODO [Member 5]: Wire to CreateWorkspaceModal */}
              <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-ivory/20 hover:text-accent hover:bg-accent/5 transition-all duration-150 mt-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-dashed border-white/10 hover:border-accent/30 transition-colors">
                  <Plus size={18} />
                </div>
                <span className="text-sm font-display font-semibold">
                  Create Workspace
                </span>
              </button>
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
