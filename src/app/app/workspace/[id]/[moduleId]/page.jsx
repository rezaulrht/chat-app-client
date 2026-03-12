"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import WorkspaceSidebar from "@/components/ChatDashboard/WorkspaceSidebar";
import ChannelSidebar from "@/components/ChatDashboard/ChannelSidebar";
import WorkspaceSettingsPanel from "@/components/workspace/WorkspaceSettingsPanel";
import { ModuleProvider } from "@/context/ModuleProvider";
import ModuleChatWindow from "@/components/workspace/ModuleChatWindow";
import CreateModuleModal from "@/components/workspace/CreateModuleModal";

export default function ModulePage() {
  const { id, moduleId } = useParams();
  const router = useRouter();
  const [showSettings, setShowSettings] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showCreateModule, setShowCreateModule] = useState(false);
  const [createModuleCategory, setCreateModuleCategory] = useState("General");

  // Local state to highlight "Spaces" tab and prevent navigation issues
  const [activeView, setActiveView] = useState("workspace");
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(id);

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
            <ChannelSidebar
              selectedWorkspaceId={id}
              activeModuleId={moduleId}
              onBack={() => router.push("/app/workspace")}
              onSettingsOpen={() => setShowSettings(true)}
              onCreateModule={(cat) => {
                setCreateModuleCategory(cat || "General");
                setShowCreateModule(true);
              }}
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0 relative">
          {/* Main Chat Area */}
          <div className="flex-1 min-w-0 h-full">
            <ModuleProvider moduleId={moduleId} workspaceId={id}>
              <ModuleChatWindow
                moduleId={moduleId}
                workspaceId={id}
                onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
              />
            </ModuleProvider>
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

      {/* Create Module Modal */}
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
