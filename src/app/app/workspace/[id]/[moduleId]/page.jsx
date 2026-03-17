"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import WorkspaceSidebar from "@/components/ChatDashboard/WorkspaceSidebar";
import ChannelSidebar from "@/components/ChatDashboard/ChannelSidebar";
import WorkspaceSettingsModal from "@/components/workspace/WorkspaceSettingsModal";
import MemberListPanel from "@/components/workspace/MemberListPanel";
import { ModuleProvider } from "@/context/ModuleProvider";
import ModuleChatWindow from "@/components/workspace/ModuleChatWindow";
import CreateModuleModal from "@/components/workspace/CreateModuleModal";

export default function ModulePage() {
  const { id, moduleId } = useParams();
  const router = useRouter();
  const [showSettings, setShowSettings] = useState(false);
  const [showMembers, setShowMembers] = useState(true);

  useEffect(() => {
    // Close on mobile screens by default
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setShowMembers(false);
    }
  }, []);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showCreateModule, setShowCreateModule] = useState(false);
  const [createModuleCategory, setCreateModuleCategory] = useState("General");

  const [activeView, setActiveView] = useState("workspace");
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(id);

  return (
    <ProtectedRoute>
      <div className="flex h-screen w-full bg-obsidian overflow-hidden">
        {/* ── Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setIsSidebarOpen(false)} />
        )}
        
        {/* ── Left sidebar (nav + channels) */}
        <div className={`${isSidebarOpen ? 'flex absolute inset-y-0 left-0 z-50 bg-obsidian' : 'hidden'} md:static md:flex flex-col shrink-0 h-full w-72 overflow-hidden border-r border-white/6`}>
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

        {/* ── Main content */}
        <div className="flex-1 min-w-0 flex flex-col h-full">
          <ModuleProvider moduleId={moduleId} workspaceId={id}>
            <ModuleChatWindow
              moduleId={moduleId}
              workspaceId={id}
              onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
              onToggleMembers={() => setShowMembers((v) => !v)}
              showMembers={showMembers}
            />
          </ModuleProvider>
        </div>

        {/* ── Right member panel (desktop slide-out) */}
        {showMembers && (
          <div className="hidden md:block">
            <MemberListPanel
              workspaceId={id}
              onClose={() => setShowMembers(false)}
              onSettingsOpen={() => setShowSettings(true)}
            />
          </div>
        )}

        {/* ── Mobile member panel overlay */}
        {showMembers && (
          <div className="md:hidden fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowMembers(false)} />
            <div className="relative w-64 h-full">
              <MemberListPanel
                workspaceId={id}
                onClose={() => setShowMembers(false)}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Settings modal (full-screen overlay) */}
      {showSettings && (
        <WorkspaceSettingsModal
          workspaceId={id}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* ── Create Module Modal */}
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
