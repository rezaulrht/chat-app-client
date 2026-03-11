"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import WorkspaceSidebar from "@/components/ChatDashboard/WorkspaceSidebar";
import ChannelSidebar from "@/components/ChatDashboard/ChannelSidebar";
import WorkspaceSettingsPanel from "@/components/workspace/WorkspaceSettingsPanel";

export default function ModulePage() {
  const { id, moduleId } = useParams();
  const router = useRouter();
  const [showSettings, setShowSettings] = useState(false);

  // Local state to highlight "Spaces" tab and prevent navigation issues
  const [activeView, setActiveView] = useState("workspace");
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(id);

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen w-full bg-obsidian overflow-hidden">
        <WorkspaceSidebar
          activeView={activeView}
          setActiveView={setActiveView}
          selectedWorkspaceId={selectedWorkspaceId}
          setSelectedWorkspaceId={setSelectedWorkspaceId}
        />

        <div className="flex flex-1 min-h-0 relative">
          {/* Channel / Module Sidebar */}
          <div className="hidden md:flex w-64 shrink-0 border-r border-white/[0.06]">
            <ChannelSidebar
              selectedWorkspaceId={id}
              activeModuleId={moduleId}
              onBack={() => router.push("/app/workspace")}
              onSettingsOpen={() => setShowSettings(true)}
              // onCreateModule wired by Member 6
            />
          </div>

          {/* Main Chat Area (Member 6 will replace this) */}
          <div className="flex-1 flex items-center justify-center">
            <p className="text-ivory/20 text-sm font-display">
              Module chat will appear here
            </p>
          </div>

          {/* Workspace Settings Panel */}
          {showSettings && (
            <WorkspaceSettingsPanel
              workspaceId={id}
              onClose={() => setShowSettings(false)}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
