"use client";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import WorkspaceSidebar from "@/components/ChatDashboard/WorkspaceSidebar";
import ChannelSidebar from "@/components/ChatDashboard/ChannelSidebar";

export default function ModulePage() {
  const { id, moduleId } = useParams();
  const router = useRouter();

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen w-full bg-obsidian overflow-hidden">
        <WorkspaceSidebar />

        <div className="flex flex-1 min-h-0">
          {/* Module Sidebar — activeModuleId highlights current module */}
          <div className="hidden md:flex w-64 shrink-0 border-r border-white/6">
            <ChannelSidebar
              selectedWorkspaceId={id}
              activeModuleId={moduleId}
              onBack={() => router.push("/app/workspace")}
            />
          </div>

          {/* Module Chat Area — TODO [Member 6]: Replace with real component */}
          {/* <ModuleChatWindow moduleId={moduleId} workspaceId={id} /> */}
          <div className="flex-1 flex items-center justify-center text-ivory/20">
            <p className="font-mono text-xs">module: {moduleId}</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
