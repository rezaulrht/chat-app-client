"use client";

import { useState, useCallback, useContext, useEffect } from "react";
import { SocketContext } from "./SocketContext";
import { FeedContext } from "./FeedContext";
import api from "@/app/api/Axios";
import useAuth from "@/hooks/useAuth";

export function FeedProvider({ children }) {
  // ── Feed state ─────────────────────────────────────────────────────────────
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("latest");
  const [filters, setFilters] = useState({
    type: "all",
    tags: [],
    sort: "latest",
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [shareTarget, setShareTarget] = useState(null);
  const { user: authUser } = useAuth();

  const [userStats, setUserStats] = useState(() => ({
    reputation: 0,
    level: "Newcomer",
    badge: "🟢",
    postCount: 0,
    followersCount: 0,
    followingCount: 0,
    followedTags: [],
    name: "",
    avatar: "",
    _id: "",
  }));

  // ── Social state ───────────────────────────────────────────────────────────
  const [followingSet, setFollowingSet] = useState(new Set());
  const [profileCache, setProfileCache] = useState({});

  const socketCtx = useContext(SocketContext);
  const socket = socketCtx?.socket ?? null;

  const normalizePost = useCallback((post) => {
    if (!post || typeof post !== "object") return post;
    if (post.id && !post._id) return { ...post, _id: post.id };
    return post;
  }, []);

  const mergePosts = useCallback(
    (existing, incoming) => {
      const map = new Map();
      for (const post of existing) {
        const n = normalizePost(post);
        if (n?._id) map.set(n._id, n);
      }
      for (const post of incoming) {
        const n = normalizePost(post);
        if (n?._id) map.set(n._id, n);
      }
      return Array.from(map.values());
    },
    [normalizePost],
  );

  // ── Feed API ────────────────────────────────────────────────────────────────

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
      if (page === 1) setPosts([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [activeTab, filters, page, mergePosts, normalizePost]);

  const fetchMyStats = useCallback(async () => {
    try {
      const userId = (() => {
        const token = localStorage.getItem("token");
        if (!token) return null;
        const b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(atob(b64));
        return payload.id ?? payload._id ?? null;
      })();
      if (!userId) return;
      const res = await api.get(`/api/feed/users/${userId}/profile`);
      setUserStats({
        reputation: res.data.reputation ?? 0,
        postCount: res.data.postCount ?? 0,
        level: res.data.level ?? "Newcomer",
        badge: res.data.badge ?? "🟢",
        followersCount: res.data.followersCount ?? 0,
        followingCount: res.data.followingCount ?? 0,
        followedTags: res.data.followedTags ?? [],
        name: res.data.name ?? authUser?.name ?? "",
        avatar: res.data.avatar ?? authUser?.avatar ?? "",
        _id: res.data._id ?? userId,
      });
    } catch (error) {
      // silently fail — stats not critical
    }
  }, []);

  useEffect(() => {
    fetchMyStats();
  }, [fetchMyStats]);

  useEffect(() => {
    if (!socket) return;
    const handleReacted = ({ postId, reactions, reactionCount }) => {
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, reactions, reactionCount } : p,
        ),
      );
    };
    socket.on("feed:post:reacted", handleReacted);
    return () => socket.off("feed:post:reacted", handleReacted);
  }, [socket]);

  const createPost = useCallback(
    async (payload) => {
      const tempId = `temp-${Date.now()}`;
      const optimisticPost = {
        _id: tempId,
        ...payload,
        author: { _id: "me", name: "You", avatar: "" },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        commentsCount: 0,
        reactions: {},
        reactionCount: 0,
      };
      setPosts((prev) => [optimisticPost, ...prev]);
      try {
        const response = await api.post("/api/feed/posts", payload);
        const created = normalizePost(response.data);
        setPosts((prev) => prev.map((p) => (p._id === tempId ? created : p)));
        return created;
      } catch (error) {
        setPosts((prev) => prev.filter((p) => p._id !== tempId));
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
          return { ...post, ...payload, updatedAt: new Date().toISOString() };
        }),
      );
      try {
        const response = await api.patch(`/api/feed/posts/${id}`, payload);
        const updated = normalizePost(response.data);
        setPosts((prev) => prev.map((p) => (p._id === id ? updated : p)));
        return updated;
      } catch (error) {
        if (previousPost) {
          setPosts((prev) =>
            prev.map((p) => (p._id === id ? previousPost : p)),
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
        if (post._id === id) deletedPost = post;
        else next.push(post);
      }
      return next;
    });
    try {
      await api.delete(`/api/feed/posts/${id}`);
      return true;
    } catch (error) {
      if (deletedPost) setPosts((prev) => [deletedPost, ...prev]);
      console.error(
        "deletePost error:",
        error?.response?.data?.message || error.message,
      );
      throw error;
    }
  }, []);

  const reactToPost = useCallback(
    async (id, emoji) => {
      let snapshot = null;
      const currentUserId = (() => {
        try {
          const token = localStorage.getItem("token");
          if (!token) return null;
          const b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
          const payload = JSON.parse(atob(b64));
          return payload.id ?? payload._id ?? null;
        } catch {
          return null;
        }
      })();

      setPosts((prev) =>
        prev.map((p) => {
          if (p._id !== id) return p;
          snapshot = p;
          const existing = Array.isArray(p.reactions?.[emoji])
            ? p.reactions[emoji]
            : [];
          const alreadyReacted =
            currentUserId && existing.includes(currentUserId);
          const updated = alreadyReacted
            ? existing.filter((uid) => uid !== currentUserId)
            : currentUserId
              ? [...existing, currentUserId]
              : existing;
          return {
            ...p,
            reactions: { ...(p.reactions ?? {}), [emoji]: updated },
            reactionCount: Math.max(
              0,
              (p.reactionCount ?? 0) + (alreadyReacted ? -1 : 1),
            ),
          };
        }),
      );

      try {
        const response = await api.post(`/api/feed/posts/${id}/react`, {
          emoji,
        });
        setPosts((prev) =>
          prev.map((p) =>
            p._id === id
              ? {
                  ...p,
                  reactions: response.data.reactions,
                  reactionCount: response.data.reactionCount,
                }
              : p,
          ),
        );
        await fetchMyStats();
      } catch (error) {
        if (snapshot)
          setPosts((prev) => prev.map((p) => (p._id === id ? snapshot : p)));
        console.error(
          "reactToPost error:",
          error?.response?.data?.message || error.message,
        );
      }
    },
    [fetchMyStats],
  );

  const voteOnPoll = useCallback(async () => {
    /* TODO */
  }, []);
  const acceptAnswer = useCallback(async () => {
    /* TODO */
  }, []);
  const fetchComments = useCallback(async () => {
    /* TODO */
  }, []);
  const addComment = useCallback(async () => {
    /* TODO */
  }, []);
  const reactToComment = useCallback(async () => {
    /* TODO */
  }, []);
  const followTag = useCallback(async () => {
    /* TODO */
  }, []);
  const searchPosts = useCallback(async () => {
    /* TODO */
  }, []);

  // ── Social actions ─────────────────────────────────────────────────────────

  const followUser = useCallback(
    async (userId) => {
      const wasFollowing = followingSet.has(userId);

      // Optimistic update
      setFollowingSet((prev) => {
        const next = new Set(prev);
        wasFollowing ? next.delete(userId) : next.add(userId);
        return next;
      });
      setProfileCache((prev) => {
        if (!prev[userId]) return prev;
        return {
          ...prev,
          [userId]: {
            ...prev[userId],
            followersCount:
              (prev[userId].followersCount ?? 0) + (wasFollowing ? -1 : 1),
            isFollowing: !wasFollowing,
          },
        };
      });

      try {
        const res = await api.post(`/api/feed/users/${userId}/follow`);
        return res.data;
      } catch (error) {
        // Revert on error
        setFollowingSet((prev) => {
          const next = new Set(prev);
          wasFollowing ? next.add(userId) : next.delete(userId);
          return next;
        });
        setProfileCache((prev) => {
          if (!prev[userId]) return prev;
          return {
            ...prev,
            [userId]: {
              ...prev[userId],
              followersCount:
                (prev[userId].followersCount ?? 0) + (wasFollowing ? 1 : -1),
              isFollowing: wasFollowing,
            },
          };
        });
        console.error(
          "followUser error:",
          error?.response?.data?.message || error.message,
        );
        throw error;
      }
    },
    [followingSet],
  );

  const getUserProfile = useCallback(
    async (userId) => {
      if (profileCache[userId]) return profileCache[userId];
      try {
        const res = await api.get(`/api/feed/users/${userId}/profile`);
        const profile = res.data;
        setProfileCache((prev) => ({ ...prev, [userId]: profile }));
        if (profile.isFollowing) {
          setFollowingSet((prev) => new Set([...prev, userId]));
        }
        return profile;
      } catch (error) {
        console.error(
          "getUserProfile error:",
          error?.response?.data?.message || error.message,
        );
        throw error;
      }
    },
    [profileCache],
  );

  const getUserPosts = useCallback(async (userId, page = 1, limit = 20) => {
    try {
      const res = await api.get(`/api/feed/users/${userId}/posts`, {
        params: { page, limit },
      });
      return res.data;
    } catch (error) {
      console.error(
        "getUserPosts error:",
        error?.response?.data?.message || error.message,
      );
      throw error;
    }
  }, []);

  const getTopContributors = useCallback(async () => {
    try {
      const res = await api.get("/api/feed/users/top-contributors");
      return res.data;
    } catch (error) {
      console.error(
        "getTopContributors error:",
        error?.response?.data?.message || error.message,
      );
      throw error;
    }
  }, []);

  // ── Context value ──────────────────────────────────────────────────────────
  const value = {
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
    userStats,
    followedTags: userStats.followedTags ?? [],
    fetchMyStats,
    // Social state
    followingSet,
    profileCache,
    // Feed actions
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
    followTag,
    searchPosts,
    // Social actions
    followUser,
    getUserProfile,
    getUserPosts,
    getTopContributors,
  };

  return <FeedContext.Provider value={value}>{children}</FeedContext.Provider>;
}
