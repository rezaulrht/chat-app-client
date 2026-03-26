"use client";
import { useRouter } from "next/navigation";
import { Layers, Loader2, Compass } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppSidebar from "@/components/app-shell/AppSidebar";
import WorkspaceAvatarStrip from "@/components/app-shell/WorkspaceAvatarStrip";
import CreateWorkspaceModal from "@/components/workspace/CreateWorkspaceModal";
import { useWorkspace } from "@/hooks/useWorkspace";

export default function WorkspaceListPage() {
  const router = useRouter();
  const { workspaces, loadingWorkspaces } = useWorkspace();

  return (
    <ProtectedRoute>
      <div className="flex h-full w-full bg-obsidian overflow-hidden">
        {/* Desktop/tablet: sidebar */}
        <AppSidebar label="Your Workspaces">
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 h-full">
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
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-display font-bold text-white/80 transition-all group-hover:shadow-lg bg-accent/10 border border-accent/20">
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
            <CreateWorkspaceModal />
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
                <p className="text-ivory/15 text-[10px] font-mono mt-0.5 whitespace-nowrap">Find new communities</p>
              </div>
            </button>
          </div>
        </AppSidebar>

        {/* Mobile: always-visible avatar strip */}
        <WorkspaceAvatarStrip activeWorkspaceId={null} />

        {/* Desktop: empty state */}
        <div className="hidden md:flex flex-1 items-center justify-center">
          <div className="text-center space-y-3">
            <Layers size={40} className="mx-auto text-ivory/10" />
            <p className="font-display text-sm text-ivory/20">Select a workspace to get started</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
