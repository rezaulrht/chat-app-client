"use client";
import { useCallback, useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import FeedView from "@/components/Feed/FeedView";
import FeedSidebar from "@/components/Feed/FeedSidebar";
import { FeedProvider } from "@/context/FeedProvider";
import useFeed from "@/hooks/useFeed";
import AppSidebar from "@/components/app-shell/AppSidebar";
import { useAppShell } from "@/components/app-shell/AppShellContext";

function ConnectedLeftSidebar({ onTagFilter, collapsed }) {
  const { userStats, followedTags } = useFeed();
  return (
    <FeedSidebar
      side="left"
      collapsed={collapsed}
      userStats={userStats}
      followedTags={followedTags}
      onTagFilter={onTagFilter}
    />
  );
}

function FeedPageInner() {
  const { setFilters, setPage } = useFeed();
  const { isSidebarOpen, setIsSidebarOpen } = useAppShell();
  const [feedType, setFeedType] = useState("all");

  const handleTagFilter = useCallback(
    (tag) => {
      if (!tag) return;
      setFilters((prev) => {
        const tags = prev.tags ?? [];
        if (tags.includes(tag)) return prev;
        return { ...prev, tags: [...tags, tag] };
      });
      setPage(1);
    },
    [setFilters, setPage],
  );

  return (
    <div className="flex h-full w-full bg-obsidian overflow-hidden">
      {/* Desktop/tablet: tags sidebar */}
      <AppSidebar
        label="Tags & Topics"
        style={{ "--sidebar-width": "320px" }}
        storeKey="feed"
      >
        <ConnectedLeftSidebar onTagFilter={handleTagFilter} />
      </AppSidebar>

      {/* Mobile: slide-in tags sidebar */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-50"
          onClick={() => setIsSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="absolute left-0 top-12 bottom-16 w-72 bg-deep border-r border-accent/[0.12] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="h-px"
              style={{
                background:
                  "linear-gradient(90deg, rgba(0,211,187,0.5), rgba(162,139,250,0.3), transparent)",
              }}
            />
            <div className="flex-1 min-h-0 overflow-hidden">
              <ConnectedLeftSidebar
                onTagFilter={(tag) => {
                  handleTagFilter(tag);
                  setIsSidebarOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main content column: filter chips (mobile) + feed */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">

        {/* Feed */}
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          {/* TODO: wire feedType into FeedView filter logic — currently FeedView ignores this prop */}
          <FeedView feedType={feedType} />
        </div>
      </div>
    </div>
  );
}

export default function FeedPage() {
  return (
    <ProtectedRoute>
      <FeedProvider>
        <FeedPageInner />
      </FeedProvider>
    </ProtectedRoute>
  );
}
