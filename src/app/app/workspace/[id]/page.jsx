"use client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Hash } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ChannelSidebar from "@/components/ChatDashboard/ChannelSidebar";
import WorkspaceSettingsModal from "@/components/workspace/WorkspaceSettingsModal";
import CreateModuleModal from "@/components/workspace/CreateModuleModal";
import AppSidebar from "@/components/app-shell/AppSidebar";
import WorkspaceAvatarStrip from "@/components/app-shell/WorkspaceAvatarStrip";

export default function WorkspacePage() {
  const { id } = useParams();
  const router = useRouter();
  const [showSettings, setShowSettings] = useState(false);
  const [showCreateModule, setShowCreateModule] = useState(false);
  const [createModuleCategory, setCreateModuleCategory] = useState("General");

  return (
    <ProtectedRoute>
      <div className="flex h-full w-full bg-obsidian overflow-hidden">
        {/* Desktop/tablet: sidebar with module list */}
        <AppSidebar label="Modules" className="w-80">
          <ChannelSidebar
            selectedWorkspaceId={id}
            onBack={() => router.push("/app/workspace")}
            onSettingsOpen={() => setShowSettings(true)}
            onCreateModule={(cat) => {
              setCreateModuleCategory(cat || "General");
              setShowCreateModule(true);
            }}
          />
        </AppSidebar>

        {/* Mobile: always-visible workspace avatar strip */}
        <WorkspaceAvatarStrip activeWorkspaceId={id} />

        {/* Desktop: empty state (hidden on mobile since WorkspaceAvatarStrip fills the space) */}
        <div className="hidden md:flex flex-1 flex-col min-h-0 relative">
          <div className="flex-1 flex items-center justify-center h-full">
            <div className="text-center space-y-3">
              <Hash size={40} className="mx-auto text-ivory/10" />
              <p className="font-display text-sm text-ivory/20">
                Select a module to start chatting
              </p>
            </div>
          </div>

          {showSettings && (
            <WorkspaceSettingsModal
              workspaceId={id}
              onClose={() => setShowSettings(false)}
            />
          )}
        </div>
      </div>

      {showCreateModule && (
        <CreateModuleModal
          workspaceId={id}
          defaultCategory={createModuleCategory}
          onClose={() => setShowCreateModule(false)}
        />
      )}
    </ProtectedRoute>
  );
}
