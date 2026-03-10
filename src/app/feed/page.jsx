"use client";

import FeedView from "@/components/ChatDashboard/FeedView";
import WorkspaceSidebar from "@/components/ChatDashboard/WorkspaceSidebar";
import { useState } from "react";

export default function FeedPage() {
    const [activeView, setActiveView] = useState("feed");
    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(null);
  return (
    <div className="">
      <WorkspaceSidebar
      activeView={activeView}
          setActiveView={setActiveView}
          selectedWorkspaceId={selectedWorkspaceId}
          setSelectedWorkspaceId={setSelectedWorkspaceId}
        /> 
      <FeedView />
    </div>
  );
}
