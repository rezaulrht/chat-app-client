"use client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Hash } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import WorkspaceSidebar from "@/components/ChatDashboard/WorkspaceSidebar";
import ChannelSidebar from "@/components/ChatDashboard/ChannelSidebar";
import WorkspaceSettingsPanel from "@/components/workspace/WorkspaceSettingsPanel";
import CreateModuleModal from "@/components/workspace/CreateModuleModal";

export default function WorkspacePage() {
  const { id } = useParams();
  const router = useRouter();
  const [showSettings, setShowSettings] = useState(false);
  const [showCreateModule, setShowCreateModule] = useState(false);
  const [createModuleCategory, setCreateModuleCategory] = useState("General");

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen w-full bg-obsidian overflow-hidden">
        <WorkspaceSidebar />

        <div className="flex flex-1 min-h-0 relative">
          {/* Module Sidebar */}
          <div className="hidden md:flex w-64 shrink-0 border-r border-white/[0.06]">
            <ChannelSidebar
              selectedWorkspaceId={id}
              onBack={() => router.push("/app/workspace")}
              onSettingsOpen={() => setShowSettings(true)}
              onCreateModule={(cat) => {
                setCreateModuleCategory(cat || "General");
                setShowCreateModule(true);
              }}
            />
          </div>

          {/* Main Content — no module selected */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-3">
              <Hash size={40} className="mx-auto text-ivory/10" />
              <p className="font-display text-sm text-ivory/20">
                Select a module to start chatting
              </p>
            </div>
          </div>

          {/* Settings Panel */}
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
