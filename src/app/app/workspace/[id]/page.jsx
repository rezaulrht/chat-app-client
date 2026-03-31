// chat-app-client/src/app/app/workspace/[id]/page.jsx
"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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
  const { id } = useParams();
  const router = useRouter();
  const { workspaceCollapsed } = useSidebarStore();
  const { modulesCache, fetchModules } = useWorkspace();

  const [showSettings, setShowSettings] = useState(false);
  const [showCreateModule, setShowCreateModule] = useState(false);
  const [createModuleCategory, setCreateModuleCategory] = useState("General");
  const [activeSettingsModuleId, setActiveSettingsModuleId] = useState(null);
  const [redirecting, setRedirecting] = useState(true);

  // Auto-redirect to first available module
  useEffect(() => {
    if (!id) return;

    const cached = modulesCache?.[id];

    if (cached === undefined) {
      // Not in cache yet — fetch it; when modulesCache updates this effect re-runs
      fetchModules(id);
      return;
    }

    const sorted = cached
      .filter((m) => m.type !== "voice")
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

    if (sorted.length > 0) {
      router.replace(`/app/workspace/${id}/${sorted[0]._id}`);
    } else {
      setRedirecting(false);
    }
  }, [id, modulesCache, fetchModules, router]);

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
        {/* Desktop: workspace strip + channel sidebar */}
        <WorkspaceStrip />
        <div
          className="hidden md:flex flex-col shrink-0 h-full border-r border-white/6 bg-deep overflow-hidden transition-[width] duration-300 ease-in-out"
          style={{ width: workspaceCollapsed ? "0px" : "188px" }}
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
        </div>

        {/* Mobile */}
        <MobileWorkspaceSidebar
          activeWorkspaceId={id}
          onSettingsOpen={() => setShowSettings(true)}
          onModuleSettingsOpen={(modId) => setActiveSettingsModuleId(modId)}
          onCreateModule={(cat) => {
            setCreateModuleCategory(cat || "General");
            setShowCreateModule(true);
          }}
        />

        {/* Empty state */}
        <div className="hidden md:flex flex-1 flex-col items-center justify-center h-full text-center space-y-3">
          <p className="font-display text-sm text-ivory/20">
            No modules yet — create one to get started
          </p>
        </div>
      </div>

      {showSettings && (
        <WorkspaceSettingsModal workspaceId={id} onClose={() => setShowSettings(false)} />
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
