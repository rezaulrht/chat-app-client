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
      <div className="flex flex-col h-screen w-full bg-obsidian overflow-hidden">
        <WorkspaceSidebar
          activeView={activeView}
          setActiveView={setActiveView}
          selectedWorkspaceId={selectedWorkspaceId}
          setSelectedWorkspaceId={setSelectedWorkspaceId}
        />

        <div className="flex flex-1 min-h-0 relative">
          {/* Mobile sidebar overlay */}
          {isSidebarOpen && (
            <div className="absolute inset-0 z-40 flex md:hidden">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setIsSidebarOpen(false)}
              />
              <div className="relative z-50 w-64 shrink-0 bg-obsidian border-r border-white/[0.06]">
                <ChannelSidebar
                  selectedWorkspaceId={id}
                  activeModuleId={moduleId}
                  onBack={() => router.push("/app/workspace")}
                  onSettingsOpen={() => {
                    setIsSidebarOpen(false);
                    setShowSettings(true);
                  }}
                  onCreateModule={(cat) => {
                    setCreateModuleCategory(cat || "General");
                    setIsSidebarOpen(false);
                    setShowCreateModule(true);
                  }}
                />
              </div>
            </div>
          )}

          {/* Channel / Module Sidebar — desktop */}
          <div className="hidden md:flex w-64 shrink-0 border-r border-white/[0.06]">
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

          {/* Main Chat Area */}
          <div className="flex-1 min-w-0">
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
