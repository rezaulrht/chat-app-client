"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Edit3, Search, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import PostCard from "./PostCard";
import PostDetail from "./PostDetail";
import PostComposer from "./PostComposer";
import ShareModal from "./ShareModal";
import FeedSidebar from "./FeedSidebar";
import useFeed from "@/hooks/useFeed";
import api from "@/app/api/Axios";

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

function DeletePostModal({ post, open, deleting, onClose, onConfirm }) {
  if (!open || !post) return null;

  const preview = post.title ?? post.content?.slice(0, 120) ?? "Untitled post";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-xs md:max-w-sm glass-card rounded-3xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-4 md:px-5 py-3 md:py-4 border-b border-white/[0.06]">
          <h2 className="font-display font-bold text-ivory text-sm">
            Delete Post
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="w-7 h-7 flex items-center justify-center rounded-xl text-ivory/30 hover:text-ivory hover:bg-white/[0.08] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <X size={14} />
          </button>
        </div>

        <div className="px-4 md:px-5 py-3 md:py-4 flex flex-col gap-3">
          <div className="flex items-center gap-3 text-red-400/85">
            <div className="w-10 h-10 rounded-2xl bg-red-400/10 ring-1 ring-red-400/20 flex items-center justify-center">
              <Trash2 size={16} />
            </div>
            <div>
              <p className="font-display font-semibold text-ivory text-[14px]">
                This action cannot be undone
              </p>
              <p className="text-[12px] font-mono text-ivory/35">
                The post and its comments will be removed.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl ring-1 ring-white/[0.07] bg-white/[0.03] flex flex-col gap-1">
            <p className="text-[10px] font-mono text-ivory/30 uppercase tracking-wider">
              {post.type}
            </p>
            <p className="text-[13px] font-display font-semibold text-ivory/80 line-clamp-3">
              {preview}
            </p>
            <p className="text-[10px] font-mono text-accent/50">
              by {post.author?.name ?? "Unknown"}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-4 md:px-5 py-3 md:py-4 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 rounded-xl text-[12px] font-mono text-ivory/45 hover:text-ivory/70 hover:bg-white/[0.06] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-mono font-bold bg-red-400/12 ring-1 ring-red-400/25 text-red-400 hover:bg-red-400/18 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 size={12} /> {deleting ? "Deleting..." : "Delete post"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main FeedView ─────────────────────────────────────────────────────────────
export default function FeedView() {
  const {
    posts,
    commentsByPost,
    activeTab,
    setActiveTab,
    hasMore,
    setPage,
    loading,
    fetchPosts,
    composerOpen,
    setComposerOpen,
    createPost,
    editPost,
    deletePost,
    reactToPost,
    searchPosts,
    filters,
    setFilters,
    voteOnPoll,
    acceptAnswer,
    fetchComments,
    addComment,
    reactToComment,
    editComment,
    deleteComment,
    userStats,
    followedTags,
    socket,
    pendingPostCount,
    flushPendingPosts,
  } = useFeed();

  const [activePost, setActivePost] = useState(null); // PostDetail view
  const [sharePost, setSharePost] = useState(null); // ShareModal target
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null); // null = not searching
  const [searchLoading, setSearchLoading] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [currentUserId, setCurrentUserId] = useState("");
  const [mobileRightOpen, setMobileRightOpen] = useState(false);

  const searchParams = useSearchParams();
  const searchTimerRef = useRef(null);

  // Auto-open a post when ?post=<id> is in the URL (e.g. from a shared chat link)
  useEffect(() => {
    const postId = searchParams?.get("post");
    if (!postId) return;

    let cancelled = false;

    const openPost = async () => {
      // 1. Try local posts array first (fast path)
      const found = posts?.find((p) => p._id === postId);
      if (found) {
        if (!cancelled) setActivePost(found);
        return;
      }

      // 2. Fetch from backend if not loaded yet (e.g. older post, different page)
      try {
        const res = await api.get(`/api/feed/posts/${postId}`);
        if (!cancelled && res.data) setActivePost(res.data);
      } catch (err) {
        console.error("FeedView: failed to fetch shared post", err);
      }
    };

    openPost();
    return () => {
      cancelled = true;
    };
  }, [searchParams, posts]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const loadMoreRef = useRef(null);

  const displayPosts = searchResults !== null ? searchResults : posts;
  const isInitialLoading =
    loading && posts.length === 0 && searchResults === null;
  const isLazyLoading = loading && displayPosts.length > 0;

  useEffect(() => {
    setCurrentUserId(getUserIdFromToken());
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    if (!activePost?._id) return;
    const postId = activePost._id;
    socket?.emit("feed:post:join", postId);
    (async () => {
      try {
        await fetchComments(postId);
      } catch (error) {
        console.error("Failed to fetch comments:", error);
      }
    })();
    return () => {
      socket?.emit("feed:post:leave", postId);
    };
  }, [activePost?._id, fetchComments, socket]);

  // When a post the user has open gets edited by someone else, update it live
  useEffect(() => {
    if (!socket || !activePost?._id) return;
    const handler = ({ post }) => {
      if (!post?._id) return;
      if (String(post._id) === String(activePost._id)) {
        setActivePost((prev) => (prev ? { ...prev, ...post } : prev));
      }
    };
    socket.on("feed:post:updated", handler);
    return () => socket.off("feed:post:updated", handler);
  }, [socket, activePost?._id]);

  useEffect(() => {
    const node = loadMoreRef.current;

    if (!node || activePost || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || loading) return;
        setPage((prev) => prev + 1);
      },
      {
        root: null,
        rootMargin: "320px 0px",
        threshold: 0.1,
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [activePost, hasMore, loading, setPage]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setPage(1);
    setSearchQuery("");
    setSearchResults(null);
  };

  const handleTagFilter = (tag) => {
    if (!tag) return;
    setSearchQuery("");
    setSearchResults(null);
    setFilters((prev) => {
      const tags = prev.tags ?? [];
      if (tags.includes(tag)) return prev;
      return { ...prev, tags: [...tags, tag] };
    });
    setPage(1);
  };

  const handleSearch = (q) => {
    setSearchQuery(q);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (!q.trim()) {
      setSearchResults(null);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    searchTimerRef.current = setTimeout(async () => {
      try {
        const results = await searchPosts(q, {
          type: filters.type,
          sort: filters.sort,
        });
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
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
    setIsDeletingPost(true);
    try {
      await deletePost(id);
      if (activePost?._id === id) {
        setActivePost(null);
      }
      if (editTarget?._id === id) {
        closeComposer();
      }
      setDeleteTarget(null);
      toast.success("Post deleted");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete post"));
    } finally {
      setIsDeletingPost(false);
    }
  };

  const requestDeletePost = (postOrId) => {
    const targetId = typeof postOrId === "string" ? postOrId : postOrId?._id;
    if (!targetId) return;

    const targetPost =
      typeof postOrId === "object" && postOrId?._id
        ? postOrId
        : posts.find((post) => post._id === targetId) ||
          (activePost?._id === targetId ? activePost : null) ||
          (editTarget?._id === targetId ? editTarget : null);

    if (!targetPost) return;
    setDeleteTarget(targetPost);
  };

  const handleVotePoll = async (postId, optionIndex) => {
    try {
      const data = await voteOnPoll(postId, optionIndex);
      setActivePost((prev) => {
        if (!prev || prev._id !== postId) return prev;
        return { ...prev, poll: data.poll };
      });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to vote on poll"));
    }
  };

  const handleAddComment = async (postId, payload) => {
    try {
      await addComment(postId, payload);
      setActivePost((prev) => {
        if (!prev || prev._id !== postId) return prev;
        const nextCount = (prev.commentCount ?? prev.commentsCount ?? 0) + 1;
        return { ...prev, commentCount: nextCount, commentsCount: nextCount };
      });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to add comment"));
    }
  };

  const handleReactComment = async (postId, commentId, emoji) => {
    try {
      await reactToComment(postId, commentId, emoji);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to react to comment"));
    }
  };

  const handleEditComment = async (postId, commentId, content) => {
    try {
      await editComment(postId, commentId, content);
      toast.success("Comment updated");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to update comment"));
      throw error;
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      const data = await deleteComment(postId, commentId);
      setActivePost((prev) => {
        if (!prev || prev._id !== postId) return prev;
        const nextCount =
          typeof data?.commentsCount === "number"
            ? Math.max(0, data.commentsCount)
            : Math.max(
                0,
                (prev.commentCount ?? prev.commentsCount ?? 0) -
                  (data?.removedCount ?? 1),
              );
        const acceptedId = prev.acceptedAnswer ?? prev.acceptedComment ?? null;

        return {
          ...prev,
          commentCount: nextCount,
          commentsCount: nextCount,
          acceptedAnswer:
            String(acceptedId) === String(commentId)
              ? null
              : prev.acceptedAnswer,
          acceptedComment:
            String(acceptedId) === String(commentId)
              ? null
              : prev.acceptedComment,
          status:
            String(acceptedId) === String(commentId) ? "open" : prev.status,
        };
      });
      toast.success("Comment deleted");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete comment"));
      throw error;
    }
  };

  const handleAcceptAnswer = async (postId, commentId) => {
    try {
      const data = await acceptAnswer(postId, commentId);
      setActivePost((prev) => {
        if (!prev || prev._id !== postId) return prev;
        const acceptedCommentId =
          typeof data.acceptedComment === "string"
            ? data.acceptedComment
            : (data.acceptedComment?._id ?? null);
        return {
          ...prev,
          acceptedAnswer: acceptedCommentId,
          acceptedComment: acceptedCommentId,
          status: data.status,
        };
      });
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Failed to update accepted answer"),
      );
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

        {/* Search bar */}
        <div className="shrink-0 px-4 pb-3">
          <div className="relative flex items-center">
            <Search
              size={14}
              className="absolute left-3 text-ivory/30 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search posts..."
              className="w-full bg-white/[0.04] ring-1 ring-white/[0.07] focus:ring-accent/30 rounded-xl pl-9 pr-8 py-2 text-[13px] text-ivory/80 placeholder:text-ivory/20 outline-none transition-all font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults(null);
                }}
                className="absolute right-3 text-ivory/30 hover:text-ivory/60 transition-colors"
              >
                <X size={13} />
              </button>
            )}
          </div>
          {filters.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {filters.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[11px] font-mono"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        tags: prev.tags.filter((t) => t !== tag),
                      }))
                    }
                    className="hover:text-white transition-colors"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
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

        {/* New posts banner */}
        {pendingPostCount > 0 && !activePost && !searchQuery && (
          <button
            type="button"
            onClick={flushPendingPosts}
            className="shrink-0 mx-4 my-2 flex items-center justify-center gap-2 py-2 rounded-xl bg-accent/10 border border-accent/20 text-accent text-[12px] font-mono font-bold hover:bg-accent/15 active:scale-[0.98] transition-all"
          >
            <span className="text-[14px]">↑</span>
            {pendingPostCount === 1 ? "1 new post" : `${pendingPostCount} new posts`} — click to load
          </button>
        )}

        {/* Post list or PostDetail */}
        <div className="flex-1 overflow-y-auto scrollbar-hide pb-[88px] xl:pb-0">
          {activePost ? (
            <PostDetail
              post={activePost}
              comments={commentsByPost[activePost._id] || []}
              currentUserId={currentUserId}
              onBack={() => setActivePost(null)}
              onReact={(postId, emoji) => reactToPost(postId, emoji)}
              onShare={(p) => setSharePost(p)}
              onTagClick={(tag) => handleTagFilter(tag)}
              onEdit={handleEditPost}
              onDelete={requestDeletePost}
              onVotePoll={handleVotePoll}
              onAddComment={handleAddComment}
              onReactComment={handleReactComment}
              onAcceptAnswer={handleAcceptAnswer}
              onEditComment={handleEditComment}
              onDeleteComment={handleDeleteComment}
            />
          ) : isInitialLoading ? (
            <div className="flex flex-col">
              {Array.from({ length: 4 }).map((_, i) => (
                <PostSkeleton key={i} />
              ))}
            </div>
          ) : searchLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
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
                  onReact={(postId, emoji) => reactToPost(postId, emoji)}
                  onShare={setSharePost}
                  onTagClick={(tag) => handleTagFilter(tag)}
                  onEdit={handleEditPost}
                  onDelete={requestDeletePost}
                />
              ))}
              {hasMore && (
                <div
                  ref={loadMoreRef}
                  className="px-5 py-6 flex justify-center"
                  aria-hidden="true"
                >
                  {isLazyLoading ? (
                    <div className="flex items-center gap-2 text-[12px] font-mono text-ivory/45">
                      <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                      Loading more posts...
                    </div>
                  ) : (
                    <div className="h-6" />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Right sidebar (desktop) ── */}
      <div className="hidden lg:block w-[220px] shrink-0">
        <FeedSidebar side="right" onTagFilter={handleTagFilter} />
      </div>

      {/* ── Mobile: floating Explore button ── */}
      <button
        type="button"
        onClick={() => setMobileRightOpen(true)}
        className="lg:hidden fixed bottom-20 right-4 z-40 flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-accent text-obsidian font-display font-bold text-[12px] shadow-lg shadow-accent/20 active:scale-95 transition-all"
      >
        <span className="text-[14px]">📊</span>
        Explore
      </button>

      {/* ── Mobile: right sidebar drawer ── */}
      {mobileRightOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50"
          onClick={() => setMobileRightOpen(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="absolute right-0 top-0 bottom-0 w-72 bg-deep border-l border-accent/[0.12] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] shrink-0">
              <span className="font-display font-bold text-ivory text-[14px]">
                Explore
              </span>
              <button
                type="button"
                onClick={() => setMobileRightOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-xl text-ivory/40 hover:text-ivory hover:bg-white/[0.08] transition-all"
              >
                <X size={14} />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto">
              <FeedSidebar
                side="right"
                onTagFilter={(tag) => {
                  handleTagFilter(tag);
                  setMobileRightOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

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
      <DeletePostModal
        post={deleteTarget}
        open={!!deleteTarget}
        deleting={isDeletingPost}
        onClose={() => {
          if (isDeletingPost) return;
          setDeleteTarget(null);
        }}
        onConfirm={() => {
          if (!deleteTarget?._id || isDeletingPost) return;
          handleDeletePost(deleteTarget._id);
        }}
      />
    </div>
  );
}
