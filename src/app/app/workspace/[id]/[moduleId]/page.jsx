"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ChannelSidebar from "@/components/ChatDashboard/ChannelSidebar";
import WorkspaceStrip from "@/components/workspace/WorkspaceStrip";
import WorkspaceSettingsModal from "@/components/workspace/WorkspaceSettingsModal";
import MemberListPanel from "@/components/workspace/MemberListPanel";
import { ModuleProvider } from "@/context/ModuleProvider";
import ModuleChatWindow from "@/components/workspace/ModuleChatWindow";
import CreateModuleModal from "@/components/workspace/CreateModuleModal";
import ModuleSettingsModal from "@/components/workspace/ModuleSettingsModal";
import MobileWorkspaceSidebar from "@/components/app-shell/MobileWorkspaceSidebar";
import { useAppShell } from "@/components/app-shell/AppShellContext";
import useSidebarStore from "@/stores/sidebarStore";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

export default function ModulePage() {
  const MIN_SIDEBAR_WIDTH = 240;
  const MAX_SIDEBAR_WIDTH = 420;
  const DEFAULT_SIDEBAR_WIDTH = 280;

  const { id, moduleId } = useParams();
  const router = useRouter();
  const { isSidebarOpen, setIsSidebarOpen } = useAppShell();
  const { workspaceCollapsed, toggleWorkspace } = useSidebarStore();
  const sidebarRef = useRef(null);

  const [showSettings, setShowSettings] = useState(false);
  const [showMembers, setShowMembers] = useState(true);
  const [showCreateModule, setShowCreateModule] = useState(false);
  const [createModuleCategory, setCreateModuleCategory] = useState("General");
  const [activeSettingsModuleId, setActiveSettingsModuleId] = useState(null);
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);

  const startResize = useCallback((e) => {
    e.preventDefault();

    const onMove = (moveEvent) => {
      if (!sidebarRef.current) return;

      const container = sidebarRef.current.parentElement;
      const parentWidth = container?.clientWidth || window.innerWidth;
      const workspaceStripWidth = 56;
      const maxAllowed = Math.min(
        MAX_SIDEBAR_WIDTH,
        Math.max(MIN_SIDEBAR_WIDTH, parentWidth - workspaceStripWidth - 300),
      );
      const next = Math.min(
        maxAllowed,
        Math.max(MIN_SIDEBAR_WIDTH, moveEvent.clientX - workspaceStripWidth),
      );

      setSidebarWidth(next);
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setShowMembers(false);
    }
  }, []);

  return (
    <ProtectedRoute>
      <div className="flex h-full w-full bg-obsidian overflow-hidden relative">

        {/* ── Desktop: WorkspaceStrip (always visible) + collapsible ChannelSidebar */}
        <WorkspaceStrip />

        {/* Collapsible channel sidebar column */}
        <div
          ref={sidebarRef}
          className="hidden md:flex flex-col shrink-0 h-full border-r border-white/6 bg-deep overflow-hidden transition-[width] duration-300 ease-in-out relative"
          style={{ width: workspaceCollapsed ? "0px" : `${sidebarWidth}px` }}
        >
          {/* Toggle button pinned at top of channel sidebar */}
          <button
            onClick={toggleWorkspace}
            className="absolute top-2 right-2 z-10 p-1.5 rounded-lg text-ivory/25 hover:text-ivory/60 hover:bg-white/6 transition-all"
            title="Collapse sidebar"
          >
            <PanelLeftClose size={14} />
          </button>

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
            collapsed={workspaceCollapsed}
          />
          {!workspaceCollapsed && (
            <button
              type="button"
              onMouseDown={startResize}
              className="hidden md:block absolute top-0 right-0 h-full w-1.5 cursor-col-resize bg-transparent hover:bg-accent/20 transition-colors"
              aria-label="Resize workspace sidebar"
              title="Drag to resize"
            />
          )}
        </div>

        {/* Expand button — only visible when sidebar is collapsed */}
        {workspaceCollapsed && (
          <button
            onClick={toggleWorkspace}
            className="hidden md:flex absolute left-14 top-2 z-20 p-1.5 rounded-lg text-ivory/25 hover:text-ivory/60 hover:bg-white/6 transition-all bg-deep border border-white/6"
            title="Expand sidebar"
          >
            <PanelLeftOpen size={14} />
          </button>
        )}

        {/* ── Mobile: slide-in overlay */}
        {isSidebarOpen && (
          <div
            className="md:hidden fixed inset-0 z-50"
            onClick={() => setIsSidebarOpen(false)}
          >
            <div className="absolute inset-0 bg-black/60" />
            <div
              className="absolute left-0 top-0 bottom-0 w-72 glass-panel border-r border-white/[0.08] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <MobileWorkspaceSidebar
                activeWorkspaceId={id}
                activeModuleId={moduleId}
                onClose={() => setIsSidebarOpen(false)}
                onSettingsOpen={() => {
                  setShowSettings(true);
                  setIsSidebarOpen(false);
                }}
                onCreateModule={(cat) => {
                  setCreateModuleCategory(cat || "General");
                  setShowCreateModule(true);
                  setIsSidebarOpen(false);
                }}
                onModuleSettingsOpen={(modId) => {
                  setActiveSettingsModuleId(modId);
                  setIsSidebarOpen(false);
                }}
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

        {/* ── Right member panel (desktop) */}
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
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowMembers(false)}
            />
            <div className="relative w-64 h-full">
              <MemberListPanel
                workspaceId={id}
                onClose={() => setShowMembers(false)}
              />
            </div>
          </div>
        )}
      </div>

      {showSettings && (
        <WorkspaceSettingsModal
          workspaceId={id}
          onClose={() => setShowSettings(false)}
        />
      )}
      {showCreateModule && (
        <CreateModuleModal
          workspaceId={id}
          defaultCategory={createModuleCategory}
          onClose={() => setShowCreateModule(false)}
        />
      )}
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
