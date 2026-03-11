"use client";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import WorkspaceSidebar from "@/components/ChatDashboard/WorkspaceSidebar";
import FeedView from "@/components/ChatDashboard/FeedView";

export default function FeedPage() {
  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen w-full bg-obsidian overflow-hidden">
        <WorkspaceSidebar />
        <div className="flex-1 min-h-0 overflow-hidden">
          <FeedView />
        </div>
      </div>
    </ProtectedRoute>
  );
}
