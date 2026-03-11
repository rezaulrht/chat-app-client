"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import FeedView from "@/components/ChatDashboard/FeedView";
import WorkspaceSidebar from "@/components/ChatDashboard/WorkspaceSidebar";
import { useState } from "react";

export default function FeedPage() {
  const [activeView, setActiveView] = useState("feed");
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(null);
  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen w-full bg-obsidian overflow-hidden">
        <WorkspaceSidebar
          activeView={activeView}
          setActiveView={setActiveView}
          selectedWorkspaceId={selectedWorkspaceId}
          setSelectedWorkspaceId={setSelectedWorkspaceId}
        />
        <div className="flex-1 min-h-0 overflow-hidden">
          <FeedView />
        </div>
      </div>
    </ProtectedRoute>
  );
}
