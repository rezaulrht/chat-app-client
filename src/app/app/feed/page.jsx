"use client";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import WorkspaceSidebar from "@/components/ChatDashboard/WorkspaceSidebar";
import MobileBottomNav from "@/components/ChatDashboard/MobileBottomNav";
import FeedView from "@/components/Feed/FeedView";
import FeedSidebar from "@/components/Feed/FeedSidebar";
import { FeedProvider } from "@/context/FeedProvider";

export default function FeedPage() {
  return (
    <ProtectedRoute>
      <FeedProvider>
        <div className="flex h-screen w-full bg-obsidian overflow-hidden">
          {/* App nav tabs */}
          <div className="hidden xl:flex flex-col shrink-0 h-full w-[320px] border-r border-white/[0.06]">
            <WorkspaceSidebar />
            <div className="flex-1 min-h-0 overflow-hidden border-t border-white/[0.04]">
              <FeedSidebar
                side="left"
                userStats={{
                  name: "Alex Rivera",
                  reputation: 2500,
                  followersCount: "1.2k",
                  followingCount: "850",
                  postCount: "42",
                }}
                followedTags={["react", "nodejs", "typescript", "webdev"]}
                onTagFilter={() => {}}
              />
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
