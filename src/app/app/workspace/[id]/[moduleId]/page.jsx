"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ChannelSidebar from "@/components/ChatDashboard/ChannelSidebar";
import WorkspaceSettingsModal from "@/components/workspace/WorkspaceSettingsModal";
import MemberListPanel from "@/components/workspace/MemberListPanel";
import { ModuleProvider } from "@/context/ModuleProvider";
import ModuleChatWindow from "@/components/workspace/ModuleChatWindow";
import CreateModuleModal from "@/components/workspace/CreateModuleModal";
import ModuleSettingsModal from "@/components/workspace/ModuleSettingsModal";
import AppSidebar from "@/components/app-shell/AppSidebar";
import { useAppShell } from "@/components/app-shell/AppShellContext";

export default function ModulePage() {
  const { id, moduleId } = useParams();
  const router = useRouter();
  const { isSidebarOpen, setIsSidebarOpen, setBackNav } = useAppShell();
  const [showSettings, setShowSettings] = useState(false);
  const [showMembers, setShowMembers] = useState(true);

  useEffect(() => {
    // Close on mobile screens by default
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setShowMembers(false);
    }
  }, []);

  const [showCreateModule, setShowCreateModule] = useState(false);
  const [createModuleCategory, setCreateModuleCategory] = useState("General");
  const [activeSettingsModuleId, setActiveSettingsModuleId] = useState(null);

  // Set back navigation in AppTopBar on mobile (shows "‹ Modules" instead of hamburger)
  useEffect(() => {
    setBackNav({ label: "Modules", href: `/app/workspace/${id}` });
    return () => setBackNav(null); // clear on unmount
  }, [id, setBackNav]);

  return (
    <ProtectedRoute>
      <div className="flex h-full w-full bg-obsidian overflow-hidden">
        {/* Desktop sidebar */}
        <AppSidebar label="Modules" className="w-72">
          <ChannelSidebar
            selectedWorkspaceId={id}
            activeModuleId={moduleId}
            onBack={() => router.push("/app/workspace")}
            onSettingsOpen={() => setShowSettings(true)}
            onCreateModule={(cat) => {
              setCreateModuleCategory(cat || "General");
              setShowCreateModule(true);
            }}
            onModuleSettingsOpen={(modId) => setActiveSettingsModuleId(modId)}
          />
        </AppSidebar>

        {/* Mobile: slide-in overlay (opened by hamburger in ModuleChatWindow or AppTopBar) */}
        {isSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50" onClick={() => setIsSidebarOpen(false)}>
            <div className="absolute inset-0 bg-black/60" />
            <div
              className="absolute left-0 top-12 bottom-16 w-72 bg-deep border-r border-accent/[0.12] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-px shrink-0" style={{ background: "linear-gradient(90deg, rgba(0,211,187,0.5), rgba(162,139,250,0.3), transparent)" }} />
              <ChannelSidebar
                selectedWorkspaceId={id}
                activeModuleId={moduleId}
                onBack={() => { router.push("/app/workspace"); setIsSidebarOpen(false); }}
                onSettingsOpen={() => { setShowSettings(true); setIsSidebarOpen(false); }}
                onCreateModule={(cat) => {
                  setCreateModuleCategory(cat || "General");
                  setShowCreateModule(true);
                  setIsSidebarOpen(false);
                }}
                onModuleSettingsOpen={(modId) => { setActiveSettingsModuleId(modId); setIsSidebarOpen(false); }}
              />
            </div>
          </div>
        )}

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

      {/* ── Module Settings Modal */}
      {activeSettingsModuleId && (
        <ModuleSettingsModal
          workspaceId={id}
          moduleId={activeSettingsModuleId}
          onClose={() => setActiveSettingsModuleId(null)}
        />
      )}
    </ProtectedRoute>
  );
}
