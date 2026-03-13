"use client";

import { useState, useCallback } from "react";
import { FeedContext } from "./FeedContext";
import api from "@/app/api/Axios";

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

  const normalizePost = useCallback((post) => {
    if (!post || typeof post !== "object") return post;
    if (post.id && !post._id) {
      return { ...post, _id: post.id };
    }
    return post;
  }, []);

  const mergePosts = useCallback(
    (existing, incoming) => {
      const map = new Map();

      for (const post of existing) {
        const normalized = normalizePost(post);
        if (normalized?._id) {
          map.set(normalized._id, normalized);
        }
      }

      for (const post of incoming) {
        const normalized = normalizePost(post);
        if (normalized?._id) {
          map.set(normalized._id, normalized);
        }
      }

      return Array.from(map.values());
    },
    [normalizePost],
  );

  // ── Feed API actions ────────────────────────────────────────────────────────
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/feed/posts", {
        params: {
          tab: activeTab,
          page,
          type: filters.type,
          tags: filters.tags?.join(",") || undefined,
          sort: filters.sort,
        },
      });

      const nextPosts = Array.isArray(response.data?.posts)
        ? response.data.posts.map(normalizePost)
        : [];

      if (page > 1) {
        setPosts((prev) => mergePosts(prev, nextPosts));
      } else {
        setPosts(nextPosts);
      }

      if (typeof response.data?.hasMore === "boolean") {
        setHasMore(response.data.hasMore);
      } else {
        setHasMore(nextPosts.length > 0);
      }
    } catch (error) {
      console.error(
        "fetchPosts error:",
        error?.response?.data?.message || error.message,
      );
      if (page === 1) {
        setPosts([]);
      }
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [activeTab, filters, page, mergePosts, normalizePost]);

  const createPost = useCallback(
    async (payload) => {
      const tempId = `temp-${Date.now()}`;
      const optimisticPost = {
        _id: tempId,
        ...payload,
        author: {
          _id: "me",
          name: "You",
          avatar: "",
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        commentsCount: 0,
        reactionsCount: {},
      };

      setPosts((prev) => [optimisticPost, ...prev]);

      try {
        const response = await api.post("/api/feed/posts", payload);
        const created = normalizePost(response.data);

        setPosts((prev) =>
          prev.map((post) => (post._id === tempId ? created : post)),
        );

        return created;
      } catch (error) {
        setPosts((prev) => prev.filter((post) => post._id !== tempId));
        console.error(
          "createPost error:",
          error?.response?.data?.message || error.message,
        );
        throw error;
      }
    },
    [normalizePost],
  );

  const editPost = useCallback(
    async (id, payload) => {
      let previousPost = null;

      setPosts((prev) =>
        prev.map((post) => {
          if (post._id !== id) return post;
          previousPost = post;
          return {
            ...post,
            ...payload,
            updatedAt: new Date().toISOString(),
          };
        }),
      );

      try {
        const response = await api.patch(`/api/feed/posts/${id}`, payload);
        const updated = normalizePost(response.data);

        setPosts((prev) =>
          prev.map((post) => (post._id === id ? updated : post)),
        );

        return updated;
      } catch (error) {
        if (previousPost) {
          setPosts((prev) =>
            prev.map((post) => (post._id === id ? previousPost : post)),
          );
        }
        console.error(
          "editPost error:",
          error?.response?.data?.message || error.message,
        );
        throw error;
      }
    },
    [normalizePost],
  );

  const deletePost = useCallback(async (id) => {
    let deletedPost = null;

    setPosts((prev) => {
      const next = [];
      for (const post of prev) {
        if (post._id === id) {
          deletedPost = post;
        } else {
          next.push(post);
        }
      }
      return next;
    });

    try {
      await api.delete(`/api/feed/posts/${id}`);
      return true;
    } catch (error) {
      if (deletedPost) {
        setPosts((prev) => [deletedPost, ...prev]);
      }
      console.error(
        "deletePost error:",
        error?.response?.data?.message || error.message,
      );
      throw error;
    }
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
