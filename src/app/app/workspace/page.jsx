"use client";
import { useRouter } from "next/navigation";
import { Plus, Layers, Loader2, LogOut, Compass } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import WorkspaceSidebar from "@/components/ChatDashboard/WorkspaceSidebar";
import CreateWorkspaceModal from "@/components/workspace/CreateWorkspaceModal";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useState } from "react";

export default function WorkspaceListPage() {
  const router = useRouter();
  const { workspaces, loadingWorkspaces } = useWorkspace();
  const { user, logout } = useAuth();
  const [activeView, setActiveView] = useState("workspace");
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(null);

  return (
    <ProtectedRoute>
      <div className="flex h-screen w-full bg-obsidian overflow-hidden">
        {/* Unified Sidebar Area */}
        <div className="hidden md:flex flex-col shrink-0 h-full w-80 overflow-hidden border-r border-white/6">
          <WorkspaceSidebar
            activeView={activeView}
            setActiveView={setActiveView}
            selectedWorkspaceId={selectedWorkspaceId}
            setSelectedWorkspaceId={setSelectedWorkspaceId}
          />
          
          <div className="flex-1 flex flex-col min-h-0">
            <div className="px-4 py-3 border-b border-white/6 flex items-center justify-between">
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
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/4 active:bg-white/[0.08] transition-all duration-150 group"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-display font-bold text-white/80 transition-all group-hover:shadow-lg bg-accent/10 border border-accent/20">
                      {ws.avatar ? (
                        <img
                          src={ws.avatar}
                          alt={ws.name}
                          className="w-full h-full rounded-xl object-cover"
                        />
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

            {/* Discover Link */}
            <button
              onClick={() => router.push("/app/discover")}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-accent/10 transition-all duration-150 group border border-dashed border-white/10 hover:border-accent/30 mt-2"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-accent/5 transition-all group-hover:bg-accent/20 border border-accent/10">
                <Compass size={20} className="text-accent/60 group-hover:text-accent" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-ivory/70 text-sm font-display font-semibold group-hover:text-accent transition-colors">
                  Discover Workspaces
                </p>
                <p className="text-ivory/15 text-[10px] font-mono mt-0.5 whitespace-nowrap">
                  Find new communities
                </p>
              </div>
            </button>
          </div>

          {/* User Status Bar (bottom) */}
          <div className="h-14 glass-card mx-2 mb-2 rounded-xl px-3 flex items-center gap-2.5 group/user shrink-0 ring-1 ring-white/[0.04]">
            <div className="relative shrink-0 cursor-pointer group/avatar">
              <div className="w-8 h-8 rounded-xl overflow-hidden ring-1 ring-white/6 group-hover/avatar:ring-accent/30 transition-all duration-200 shadow-[0_0_12px_rgba(0,211,187,0.05)]">
                <img
                  src={
                    user?.avatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`
                  }
                  className="w-full h-full object-cover"
                  alt="avatar"
                />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-deep bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.4)]" />
            </div>

            <div className="flex-1 min-w-0 cursor-pointer overflow-hidden">
              <p className="text-ivory text-[13px] font-display font-bold truncate leading-tight group-hover/user:text-accent transition-colors duration-200">
                {user?.name?.split(" ")[0]}
              </p>
              <p className="text-ivory/20 text-[10px] truncate leading-tight flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_4px_rgba(52,211,153,0.4)]" />
                Online
              </p>
            </div>

            <div className="flex items-center gap-0.5 opacity-40 group-hover/user:opacity-80 transition-opacity">
              <button
                onClick={() => {
                  logout();
                }}
                className="p-1.5 rounded-lg hover:bg-red-500/10 text-ivory/40 hover:text-red-400 transition-all duration-200"
                title="Logout"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
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
    </ProtectedRoute>
  );
}
