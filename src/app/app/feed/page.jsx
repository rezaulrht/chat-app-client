"use client";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import WorkspaceSidebar from "@/components/ChatDashboard/WorkspaceSidebar";
import FeedView from "@/components/ChatDashboard/FeedView";

export default function FeedPage() {
  return (
    <ProtectedRoute>
      <div className="flex h-screen w-full bg-obsidian overflow-hidden">
        {/* Unified Sidebar Area */}
        <div className="hidden md:flex flex-col shrink-0 h-full w-80 overflow-hidden border-r border-white/6">
          <WorkspaceSidebar />
          <div className="flex-1 overflow-y-auto p-4">
             <div className="px-1 py-1">
                <div className="w-0.5 h-3 rounded-full bg-accent/30 mb-2" />
                <p className="text-[10px] font-mono font-bold tracking-[0.15em] text-ivory/25 uppercase">
                  Feed Controls
                </p>
             </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          <FeedView />
        </div>
      </div>
    </ProtectedRoute>
  );
}
