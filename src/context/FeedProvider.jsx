"use client";

import { useState, useCallback } from "react";
import { FeedContext } from "./FeedContext";

// ── Stub / mock data used during design phase ────────────────────────────────
const MOCK_USER_STATS = {
  reputation: 142,
  level: "Contributor",
  levelIcon: "🔵",
  postCount: 12,
  followersCount: 8,
  followingCount: 5,
};

const MOCK_FOLLOWED_TAGS = ["react", "nextjs", "node"];

export function FeedProvider({ children }) {
  // ── Feed state ─────────────────────────────────────────────────────────────
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("latest"); // latest | trending | top | following | qa
  const [filters, setFilters] = useState({
    type: "all",
    tags: [],
    sort: "latest",
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null); // post detail view
  const [shareTarget, setShareTarget] = useState(null); // post being shared

  // ── Stub API actions (TODO: wire to real API) ──────────────────────────────
  const fetchPosts = useCallback(async () => {
    // TODO: GET /api/feed/posts?tab=&page=&type=&tags=&sort=
  }, [activeTab, filters, page]);

  const createPost = useCallback(async (payload) => {
    // TODO: POST /api/feed/posts
  }, []);

  const editPost = useCallback(async (id, payload) => {
    // TODO: PATCH /api/feed/posts/:id
  }, []);

  const deletePost = useCallback(async (id) => {
    // TODO: DELETE /api/feed/posts/:id
  }, []);

  const reactToPost = useCallback(async (id, emoji) => {
    // TODO: POST /api/feed/posts/:id/react { emoji }
  }, []);

  const voteOnPoll = useCallback(async (postId, optionIndex) => {
    // TODO: POST /api/feed/posts/:id/vote { optionIndex }
  }, []);

  const acceptAnswer = useCallback(async (postId, commentId) => {
    // TODO: POST /api/feed/posts/:id/accept/:commentId
  }, []);

  const fetchComments = useCallback(async (postId) => {
    // TODO: GET /api/feed/posts/:id/comments
  }, []);

  const addComment = useCallback(async (postId, payload) => {
    // TODO: POST /api/feed/posts/:id/comments
  }, []);

  const reactToComment = useCallback(async (postId, commentId, emoji) => {
    // TODO: POST /api/feed/posts/:id/comments/:commentId/react
  }, []);

  const followUser = useCallback(async (userId) => {
    // TODO: POST /api/feed/users/:id/follow
  }, []);

  const followTag = useCallback(async (tag) => {
    // TODO: POST /api/feed/tags/follow { tag }
  }, []);

  const searchPosts = useCallback(async (query, opts) => {
    // TODO: GET /api/feed/search?q=&type=&tags=&sort=
  }, []);

  // ── Context value ──────────────────────────────────────────────────────────
  const value = {
    // State
    posts,
    activeTab,
    setActiveTab,
    filters,
    setFilters,
    page,
    setPage,
    hasMore,
    loading,
    composerOpen,
    setComposerOpen,
    selectedPost,
    setSelectedPost,
    shareTarget,
    setShareTarget,
    // Stats (will come from user object after API wired)
    userStats: MOCK_USER_STATS,
    followedTags: MOCK_FOLLOWED_TAGS,
    // Actions
    fetchPosts,
    createPost,
    editPost,
    deletePost,
    reactToPost,
    voteOnPoll,
    acceptAnswer,
    fetchComments,
    addComment,
    reactToComment,
    followUser,
    followTag,
    searchPosts,
  };

  return <FeedContext.Provider value={value}>{children}</FeedContext.Provider>;
}
