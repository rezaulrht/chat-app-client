"use client";

import { useEffect, useState } from "react";
import { Edit3 } from "lucide-react";
import toast from "react-hot-toast";
import PostCard from "./PostCard";
import PostDetail from "./PostDetail";
import PostComposer from "./PostComposer";
import ShareModal from "./ShareModal";
import FeedSidebar from "./FeedSidebar";
import useFeed from "@/hooks/useFeed";

// ── Tab definitions ───────────────────────────────────────────────────────────
const TABS = [
  { id: "latest", label: "Latest" },
  { id: "trending", label: "Trending" },
  { id: "top", label: "Top" },
  { id: "following", label: "Following" },
  { id: "qa", label: "Q&A" },
];

function getUserIdFromToken() {
  if (typeof window === "undefined") return "";

  const token = localStorage.getItem("token");
  if (!token) return "";

  try {
    const payload = token.split(".")[1];
    if (!payload) return "";
    const decoded = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    );
    return decoded?.id || "";
  } catch {
    return "";
  }
}

function getApiErrorMessage(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback;
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyFeed() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3 text-center px-8">
      <div className="w-12 h-12 rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06] flex items-center justify-center text-xl">
        💬
      </div>
      <p className="font-display font-bold text-ivory/50 text-sm">
        Nothing here yet
      </p>
      <p className="text-[12px] font-mono text-ivory/25">
        Be the first to post something!
      </p>
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function PostSkeleton() {
  return (
    <div className="px-5 py-5 border-b border-white/[0.05] flex flex-col gap-3 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-white/[0.06]" />
        <div className="h-3 w-24 rounded-full bg-white/[0.06]" />
        <div className="h-3 w-16 rounded-full bg-white/[0.04] ml-2" />
      </div>
      <div className="h-4 w-3/4 rounded-full bg-white/[0.06]" />
      <div className="space-y-2">
        <div className="h-3 w-full rounded-full bg-white/[0.04]" />
        <div className="h-3 w-5/6 rounded-full bg-white/[0.04]" />
      </div>
    </div>
  );
}

// ── Main FeedView ─────────────────────────────────────────────────────────────
export default function FeedView() {
  const {
    posts,
    activeTab,
    setActiveTab,
    setPage,
    loading,
    fetchPosts,
    composerOpen,
    setComposerOpen,
    createPost,
    editPost,
    deletePost,
  } = useFeed();

  const [activePost, setActivePost] = useState(null); // PostDetail view
  const [sharePost, setSharePost] = useState(null); // ShareModal target
  const [editTarget, setEditTarget] = useState(null);
  const [currentUserId, setCurrentUserId] = useState("");

  const displayPosts = posts;

  useEffect(() => {
    setCurrentUserId(getUserIdFromToken());
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setPage(1);
  };

  const closeComposer = () => {
    setComposerOpen(false);
    setEditTarget(null);
  };

  const handleCreatePost = async (payload) => {
    try {
      await createPost(payload);
      toast.success("Post created");
      closeComposer();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to create post"));
    }
  };

  const handleEditPost = (post) => {
    setEditTarget(post);
    setComposerOpen(true);
  };

  const handleUpdatePost = async (id, payload) => {
    try {
      const updated = await editPost(id, payload);
      if (activePost?._id === id) {
        setActivePost(updated);
      }
      toast.success("Post updated");
      closeComposer();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to update post"));
    }
  };

  const handleDeletePost = async (id) => {
    try {
      await deletePost(id);
      if (activePost?._id === id) {
        setActivePost(null);
      }
      if (editTarget?._id === id) {
        closeComposer();
      }
      toast.success("Post deleted");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete post"));
    }
  };

  return (
    <div className="flex h-full bg-obsidian overflow-hidden">
      {/* ── Centre column ── */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden border-r border-white/[0.06]">
        {/* Feed header */}
        <div className="shrink-0 flex items-center justify-between px-6 pt-5 pb-3">
          <h1 className="font-display font-bold text-ivory text-[22px] tracking-tight">
            Community Feed
          </h1>
          <button
            type="button"
            onClick={() => {
              setEditTarget(null);
              setComposerOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-obsidian font-display font-bold text-[13px] hover:bg-accent/85 active:scale-95 transition-all duration-150"
          >
            <Edit3 size={14} />
            New Post
          </button>
        </div>

        {/* Tab bar */}
        <div className="shrink-0 flex items-end border-b border-white/[0.05] px-4 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`shrink-0 whitespace-nowrap px-4 py-2.5 text-[13px] font-display font-semibold border-b-2 transition-all duration-150 -mb-px ${
                activeTab === tab.id
                  ? "border-accent text-ivory"
                  : "border-transparent text-ivory/40 hover:text-ivory/70"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Post list or PostDetail */}
        <div className="flex-1 overflow-y-auto scrollbar-hide pb-[88px] xl:pb-0">
          {activePost ? (
            <PostDetail
              post={activePost}
              comments={[]}
              currentUserId={currentUserId}
              onBack={() => setActivePost(null)}
              onReact={() => {}}
              onShare={(p) => setSharePost(p)}
              onTagClick={() => {}}
            />
          ) : loading ? (
            <div className="flex flex-col">
              {Array.from({ length: 4 }).map((_, i) => (
                <PostSkeleton key={i} />
              ))}
            </div>
          ) : displayPosts.length === 0 ? (
            <EmptyFeed />
          ) : (
            <div className="flex flex-col">
              {displayPosts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  currentUserId={currentUserId}
                  onOpen={setActivePost}
                  onReact={() => {}}
                  onShare={setSharePost}
                  onTagClick={() => {}}
                  onEdit={handleEditPost}
                  onDelete={handleDeletePost}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Right sidebar ── */}
      <div className="hidden lg:block w-[220px] shrink-0">
        <FeedSidebar side="right" onTagFilter={() => {}} />
      </div>

      {/* ── Modals ── */}
      <PostComposer
        open={composerOpen}
        editPost={editTarget}
        onClose={closeComposer}
        onSubmit={handleCreatePost}
        onEdit={handleUpdatePost}
      />
      <ShareModal
        post={sharePost}
        open={!!sharePost}
        onClose={() => setSharePost(null)}
      />
    </div>
  );
}
