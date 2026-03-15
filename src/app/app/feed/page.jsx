"use client";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import WorkspaceSidebar from "@/components/ChatDashboard/WorkspaceSidebar";
import MobileBottomNav from "@/components/ChatDashboard/MobileBottomNav";
import FeedView from "@/components/Feed/FeedView";
import FeedSidebar from "@/components/Feed/FeedSidebar";
import { FeedProvider } from "@/context/FeedProvider";
import useFeed from "@/hooks/useFeed";

function ConnectedLeftSidebar({ onTagFilter }) {
  const { userStats, followedTags } = useFeed();
  return (
    <FeedSidebar
      side="left"
      userStats={userStats}
      followedTags={followedTags}
      onTagFilter={onTagFilter}
    />
  );
}

export default function FeedPage() {
  return (
    <ProtectedRoute>
      <FeedProvider>
        <div className="flex h-screen w-full bg-obsidian overflow-hidden">
          {/* App nav tabs */}
          <div className="hidden xl:flex flex-col shrink-0 h-full w-[320px] border-r border-white/[0.06]">
            <WorkspaceSidebar />
            <div className="flex-1 min-h-0 overflow-hidden border-t border-white/[0.04]">
              <ConnectedLeftSidebar onTagFilter={() => {}} />
            </div>
          </div>

          {/* Feed — handles its own three-column layout */}
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col pb-[72px] xl:pb-0">
            <FeedView />
          </div>

          <MobileBottomNav />
        </div>
      </FeedProvider>
    </ProtectedRoute>
  );
}
