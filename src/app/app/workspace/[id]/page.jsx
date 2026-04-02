// chat-app-client/src/app/app/workspace/[id]/page.jsx
"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import WorkspaceStrip from "@/components/workspace/WorkspaceStrip";
import ChannelSidebar from "@/components/ChatDashboard/ChannelSidebar";
import WorkspaceSettingsModal from "@/components/workspace/WorkspaceSettingsModal";
import CreateModuleModal from "@/components/workspace/CreateModuleModal";
import MobileWorkspaceSidebar from "@/components/app-shell/MobileWorkspaceSidebar";
import ModuleSettingsModal from "@/components/workspace/ModuleSettingsModal";
import useSidebarStore from "@/stores/sidebarStore";
import { useWorkspace } from "@/hooks/useWorkspace";
import { Loader2 } from "lucide-react";

export default function WorkspacePage() {
  const MIN_SIDEBAR_WIDTH = 188;
  const MAX_SIDEBAR_WIDTH = 420;

  const { id } = useParams();
  const router = useRouter();
  const { workspaceCollapsed } = useSidebarStore();
  const { modulesCache, loadingModules, fetchModules } = useWorkspace();
  const sidebarRef = useRef(null);

  const [showSettings, setShowSettings] = useState(false);
  const [showCreateModule, setShowCreateModule] = useState(false);
  const [createModuleCategory, setCreateModuleCategory] = useState("General");
  const [activeSettingsModuleId, setActiveSettingsModuleId] = useState(null);
  const [redirecting, setRedirecting] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(MIN_SIDEBAR_WIDTH);

  const startResize = useCallback((e) => {
    e.preventDefault();

    const onMove = (moveEvent) => {
      if (!sidebarRef.current) return;

      const container = sidebarRef.current.parentElement;
      const parentWidth = container?.clientWidth || window.innerWidth;
      const workspaceStripWidth = 56;
      const maxAllowed = Math.min(
        MAX_SIDEBAR_WIDTH,
        Math.max(MIN_SIDEBAR_WIDTH, parentWidth - workspaceStripWidth - 240),
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
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, []);

  // Auto-redirect to first available module
  useEffect(() => {
    if (!id) return;

    const cached = modulesCache?.[id];

    if (cached === undefined) {
      // Not in cache yet — kick off fetch (idempotent, guarded by fetchedWorkspaceIds ref)
      fetchModules(id);
      return;
    }

    // Cache is now populated (modules array, or empty array on API error)
    const sorted = cached
      .filter((m) => m.type !== "voice")
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

    if (sorted.length > 0) {
      router.replace(`/app/workspace/${id}/${sorted[0]._id}`);
    } else {
      // No text modules exist — show the "create a module" empty state
      setRedirecting(false);
    }
  }, [id, modulesCache, fetchModules, router]);

  // Safety net: if still stuck redirecting after 8s, fall through to empty state
  useEffect(() => {
    if (!redirecting) return;
    const t = setTimeout(() => setRedirecting(false), 8000);
    return () => clearTimeout(t);
  }, [redirecting]);

  if (redirecting) {
    return (
      <ProtectedRoute>
        <div className="flex h-full w-full bg-obsidian overflow-hidden items-center justify-center">
          <Loader2 size={24} className="text-accent/40 animate-spin" />
        </div>
      </ProtectedRoute>
    );
  }

  // No modules exist yet — show sidebar so user can create one
  return (
    <ProtectedRoute>
      <div className="flex h-full w-full bg-obsidian overflow-hidden">
        <WorkspaceStrip />
        <div
          ref={sidebarRef}
          className="hidden md:flex flex-col shrink-0 h-full border-r border-white/6 bg-deep overflow-hidden transition-[width] duration-300 ease-in-out relative"
          style={{ width: workspaceCollapsed ? "0px" : `${sidebarWidth}px` }}
        >
          <ChannelSidebar
            selectedWorkspaceId={id}
            onBack={() => router.push("/app/workspace")}
            onSettingsOpen={() => setShowSettings(true)}
            onCreateModule={(cat) => {
              setCreateModuleCategory(cat || "General");
              setShowCreateModule(true);
            }}
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

        <MobileWorkspaceSidebar
          activeWorkspaceId={id}
          onSettingsOpen={() => setShowSettings(true)}
          onModuleSettingsOpen={(modId) => setActiveSettingsModuleId(modId)}
          onCreateModule={(cat) => {
            setCreateModuleCategory(cat || "General");
            setShowCreateModule(true);
          }}
        />

        <div className="hidden md:flex flex-1 flex-col items-center justify-center h-full text-center space-y-3">
          <p className="font-display text-sm text-ivory/20">
            No modules yet — create one to get started
          </p>
        </div>
      </div>

      {showSettings && (
        <WorkspaceSettingsModal
          workspaceId={id}
          onClose={() => setShowSettings(false)}
        />
      )}
      {activeSettingsModuleId && (
        <ModuleSettingsModal
          moduleId={activeSettingsModuleId}
          workspaceId={id}
          onClose={() => setActiveSettingsModuleId(null)}
        />
      )}
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
