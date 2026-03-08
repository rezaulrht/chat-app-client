"use client";
import { useParams, useRouter } from "next/navigation";
import { Hash } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import WorkspaceSidebar from "@/components/ChatDashboard/WorkspaceSidebar";
import ChannelSidebar from "@/components/ChatDashboard/ChannelSidebar";

export default function WorkspacePage() {
  const { id } = useParams();
  const router = useRouter();

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen w-full bg-obsidian overflow-hidden">
        <WorkspaceSidebar />

        <div className="flex flex-1 min-h-0">
          {/* Module (channel) Sidebar — Member 5 will wire real data here */}
          <div className="hidden md:flex w-64 shrink-0 border-r border-white/[0.06]">
            <ChannelSidebar
              selectedWorkspaceId={id}
              onBack={() => router.push("/app/workspace")}
            />
          </div>

          {/* Main Content — TODO [Member 6]: Replace with <ModuleChatWindow workspaceId={id} /> */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-3">
              <Hash size={40} className="mx-auto text-ivory/10" />
              <p className="font-display text-sm text-ivory/20">
                Select a module to start chatting
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
