"use client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Hash } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import WorkspaceSidebar from "@/components/ChatDashboard/WorkspaceSidebar";
import ChannelSidebar from "@/components/ChatDashboard/ChannelSidebar";
import WorkspaceSettingsModal from "@/components/workspace/WorkspaceSettingsModal";
import CreateModuleModal from "@/components/workspace/CreateModuleModal";

export default function WorkspacePage() {
  const { id } = useParams();
  const router = useRouter();
  const [showSettings, setShowSettings] = useState(false);
  const [showCreateModule, setShowCreateModule] = useState(false);
  const [createModuleCategory, setCreateModuleCategory] = useState("General");

  return (
    <ProtectedRoute>
      <div className="flex h-screen w-full bg-obsidian overflow-hidden">
        {/* Unified Sidebar Area */}
        <div className="hidden md:flex flex-col shrink-0 h-full w-80 overflow-hidden border-r border-white/6">
          <WorkspaceSidebar 
            activeView="workspace"
            selectedWorkspaceId={id}
          />
          
          <div className="flex-1 flex flex-col min-h-0">
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
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0 relative">
          {/* Main Content — no module selected */}
          <div className="flex-1 flex items-center justify-center h-full">
            <div className="text-center space-y-3">
              <Hash size={40} className="mx-auto text-ivory/10" />
              <p className="font-display text-sm text-ivory/20">
                Select a module to start chatting
              </p>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <WorkspaceSettingsModal
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
