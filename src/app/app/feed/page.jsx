"use client";
import { useCallback, useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import FeedView from "@/components/Feed/FeedView";
import FeedSidebar from "@/components/Feed/FeedSidebar";
import { FeedProvider } from "@/context/FeedProvider";
import useFeed from "@/hooks/useFeed";
import AppSidebar from "@/components/app-shell/AppSidebar";
import { useAppShell } from "@/components/app-shell/AppShellContext";

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
      <AppSidebar label="Tags & Topics" style={{ "--sidebar-width": "320px" }}>
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
            <div className="h-px" style={{ background: "linear-gradient(90deg, rgba(0,211,187,0.5), rgba(162,139,250,0.3), transparent)" }} />
            <div className="flex-1 min-h-0 overflow-hidden">
              <ConnectedLeftSidebar onTagFilter={(tag) => { handleTagFilter(tag); setIsSidebarOpen(false); }} />
            </div>
          </div>
        </div>
      )}

      {/* Main content column: filter chips (mobile) + feed */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {/* Mobile: post-type filter chips pinned below top bar */}
        <div className="md:hidden flex items-center gap-2 px-4 py-2 overflow-x-auto scrollbar-none border-b border-white/[0.04] shrink-0 bg-obsidian">
          {[
            { value: "all",       label: "All" },
            { value: "question",  label: "Questions" },
            { value: "poll",      label: "Polls" },
            { value: "snippet",   label: "Snippets" },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFeedType(value)}
              className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-display font-bold border transition-all ${
                feedType === value
                  ? "bg-accent/10 border-accent/30 text-accent"
                  : "border-white/[0.08] text-ivory/40 hover:text-ivory/70 hover:border-white/[0.14] bg-white/[0.03]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

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
