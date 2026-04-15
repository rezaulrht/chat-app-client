"use client";

import { useState, useCallback, useContext, useEffect, useRef } from "react";
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
  const [commentsByPost, setCommentsByPost] = useState({});
  const [pendingPostCount, setPendingPostCount] = useState(0);
  const [feedPostTick, setFeedPostTick] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
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
  const profileCacheRef = useRef({});

  // Keep ref in sync with state for stable reads inside callbacks
  useEffect(() => {
    profileCacheRef.current = profileCache;
  }, [profileCache]);

  const socketCtx = useContext(SocketContext);
  const socket = socketCtx?.socket ?? null;

  // Helper to normalize ID values: objects with _id, strings, or null
  const toId = useCallback((value) => {
    if (!value) return null;
    if (typeof value === "object" && value._id) return String(value._id);
    return String(value);
  }, []);

  const normalizePost = useCallback((post) => {
    if (!post || typeof post !== "object") return post;
    const acceptedCommentId =
      typeof post.acceptedComment === "object"
        ? (post.acceptedComment?._id ?? null)
        : (post.acceptedComment ?? null);
    const acceptedAnswerId =
      typeof post.acceptedAnswer === "object"
        ? (post.acceptedAnswer?._id ?? null)
        : (post.acceptedAnswer ?? null);
    const normalizedAcceptedId = acceptedCommentId ?? acceptedAnswerId ?? null;

    const next = {
      ...post,
      _id: post._id || post.id,
      acceptedComment: normalizedAcceptedId,
      acceptedAnswer: normalizedAcceptedId,
    };

    if (next.commentsCount != null && next.commentCount == null) {
      next.commentCount = next.commentsCount;
    }
    return next;
  }, []);

  const flattenComments = useCallback(
    (items) => {
      if (!Array.isArray(items)) return [];

      const flat = [];
      for (const item of items) {
        if (!item) continue;
        const rootParentId = toId(item.parentComment);
        const root = {
          ...item,
          replyTo: rootParentId,
        };
        flat.push(root);

        if (Array.isArray(item.replies)) {
          for (const reply of item.replies) {
            if (!reply) continue;
            const replyParentId = toId(reply.parentComment) || toId(item._id);
            flat.push({
              ...reply,
              replyTo: replyParentId,
            });
          }
        }
      }

      return flat;
    },
    [toId],
  );

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
  }, [activeTab, filters, page, mergePosts, normalizePost, refreshKey]);

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
  }, [authUser]);

  useEffect(() => {
    fetchMyStats();
  }, [fetchMyStats]);

  const flushPendingPosts = useCallback(() => {
    setPendingPostCount(0);
    setPage(1);
    setRefreshKey((k) => k + 1);
  }, []);

  // Tick that increments whenever any reputation change is broadcast.
  // RightSidebar watches this to know when to re-fetch the leaderboard.
  const [reputationTick, setReputationTick] = useState(0);

  useEffect(() => {
    if (!socket) return;
    const handleReacted = ({ postId, reactions, reactionCount }) => {
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, reactions, reactionCount } : p,
        ),
      );
    };

    // Real-time comment count updates
    const handleCommentCreated = ({ comment }) => {
      if (!comment?.post) return;
      const postId = String(comment.post);

      setCommentsByPost((prev) => {
        const existing = Array.isArray(prev[postId]) ? prev[postId] : [];
        // Skip if already inserted by addComment (same _id)
        if (existing.some((c) => String(c._id) === String(comment._id)))
          return prev;
        // Only here do we know it's a NEW comment from another user — also bump count
        setPosts((posts) =>
          posts.map((p) =>
            p._id === postId
              ? normalizePost({
                  ...p,
                  commentsCount: (p.commentsCount ?? p.commentCount ?? 0) + 1,
                })
              : p,
          ),
        );
        return {
          ...prev,
          [postId]: [
            ...existing,
            { ...comment, replyTo: toId(comment.parentComment) },
          ],
        };
      });
    };

    const handleCommentDeleted = ({ commentId, postId, commentsCount }) => {
      if (!postId) return;
      setPosts((prev) =>
        prev.map((p) =>
          p._id === String(postId)
            ? normalizePost({
                ...p,
                commentsCount:
                  typeof commentsCount === "number"
                    ? Math.max(0, commentsCount)
                    : Math.max(0, (p.commentsCount ?? p.commentCount ?? 0) - 1),
              })
            : p,
        ),
      );
      if (commentId) {
        setCommentsByPost((prev) => {
          const existing = Array.isArray(prev[String(postId)])
            ? prev[String(postId)]
            : [];
          return {
            ...prev,
            [String(postId)]: existing.filter(
              (c) => String(c._id) !== String(commentId),
            ),
          };
        });
      }
    };

    // When a new post is created by any user
    const handlePostCreated = () => {
      setPendingPostCount((c) => c + 1);
      setFeedPostTick((t) => t + 1);
    };

    // When a post is deleted
    const handlePostDeleted = ({ postId }) => {
      if (!postId) return;
      const postIdStr = String(postId);
      setPosts((prev) => prev.filter((p) => String(p._id) !== postIdStr));
      // Clear selected post if it was deleted
      setSelectedPost((prev) => (prev && String(prev._id) === postIdStr ? null : prev));
      // Clear cached comments for deleted post
      setCommentsByPost((prev) => {
        const updated = { ...prev };
        delete updated[postIdStr];
        return updated;
      });
      setFeedPostTick((t) => t + 1);
    };

    // When any user's reputation changes, refresh own stats and ping the
    // leaderboard sidebar to re-fetch via reputationTick.
    const handleReputationUpdated = ({ userId: changedId }) => {
      // Always bump the tick so the leaderboard refreshes
      setReputationTick((t) => t + 1);
      // If it's our own reputation, refresh the user stats card immediately
      const myId = (() => {
        try {
          const token = localStorage.getItem("token");
          if (!token) return null;
          const b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
          const p = JSON.parse(atob(b64));
          return p?.id ?? p?._id ?? null;
        } catch {
          return null;
        }
      })();
      if (myId && String(changedId) === String(myId)) {
        fetchMyStats();
      }
    };

    const handlePostUpdated = ({ post }) => {
      if (!post?._id) return;
      setPosts((prev) =>
        prev.map((p) => (String(p._id) === String(post._id) ? normalizePost({ ...p, ...post }) : p))
      );
    };

    const handlePostReactionUpdated = ({ postId, reactions, reactionCount }) => {
      if (!postId) return;
      setPosts((prev) =>
        prev.map((p) =>
          String(p._id) === String(postId) ? { ...p, reactions, reactionCount } : p
        )
      );
    };

    const handleCommentUpdated = ({ comment }) => {
      if (!comment?._id || !comment?.post) return;
      const postId = String(comment.post);
      setCommentsByPost((prev) => {
        const existing = Array.isArray(prev[postId]) ? prev[postId] : [];
        const updated = existing.map((c) =>
          String(c._id) === String(comment._id)
            ? { ...c, ...comment, replyTo: toId(comment.parentComment) }
            : c
        );
        return { ...prev, [postId]: updated };
      });
    };

    const handleCommentReacted = ({ commentId, postId, reactions, reactionCount }) => {
      if (!commentId || !postId) return;
      setCommentsByPost((prev) => {
        const existing = Array.isArray(prev[String(postId)]) ? prev[String(postId)] : [];
        const updated = existing.map((c) =>
          String(c._id) === String(commentId) ? { ...c, reactions, reactionCount } : c
        );
        return { ...prev, [String(postId)]: updated };
      });
    };

    const handleAnswerAccepted = ({ postId, commentId, status }) => {
      if (!postId) return;
      setPosts((prev) =>
        prev.map((p) =>
          String(p._id) === String(postId)
            ? normalizePost({
                ...p,
                acceptedComment: commentId,
                acceptedAnswer: commentId,
                status: status ?? "resolved",
              })
            : p
        )
      );
      setCommentsByPost((prev) => {
        const existing = Array.isArray(prev[String(postId)]) ? prev[String(postId)] : [];
        const updated = existing.map((c) => ({
          ...c,
          isAccepted: String(c._id) === String(commentId),
        }));
        return { ...prev, [String(postId)]: updated };
      });
    };

    const handlePollVoted = ({ postId, poll }) => {
      if (!postId || !poll) return;
      setPosts((prev) =>
        prev.map((p) =>
          String(p._id) === String(postId) ? normalizePost({ ...p, poll }) : p
        )
      );
    };

    const handleFollow = ({ followedUserId }) => {
      const myId = (() => {
        try {
          const token = localStorage.getItem("token");
          if (!token) return null;
          const b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
          const p = JSON.parse(atob(b64));
          return p?.id ?? p?._id ?? null;
        } catch {
          return null;
        }
      })();
      if (myId && String(followedUserId) === String(myId)) {
        setUserStats((prev) => ({
          ...prev,
          followersCount: (prev.followersCount ?? 0) + 1,
        }));
      }
    };

    socket.on("feed:post:created", handlePostCreated);
    socket.on("feed:post:deleted", handlePostDeleted);
    socket.on("feed:post:reacted", handleReacted);
    socket.on("feed:comment:created", handleCommentCreated);
    socket.on("feed:comment:deleted", handleCommentDeleted);
    socket.on("feed:reputation:updated", handleReputationUpdated);
    socket.on("feed:post:updated", handlePostUpdated);
    socket.on("feed:post:reaction-updated", handlePostReactionUpdated);
    socket.on("feed:comment:updated", handleCommentUpdated);
    socket.on("feed:comment:reacted", handleCommentReacted);
    socket.on("feed:answer:accepted", handleAnswerAccepted);
    socket.on("feed:poll:voted", handlePollVoted);
    socket.on("feed:follow", handleFollow);
    return () => {
      socket.off("feed:post:created", handlePostCreated);
      socket.off("feed:post:deleted", handlePostDeleted);
      socket.off("feed:post:reacted", handleReacted);
      socket.off("feed:comment:created", handleCommentCreated);
      socket.off("feed:comment:deleted", handleCommentDeleted);
      socket.off("feed:reputation:updated", handleReputationUpdated);
      socket.off("feed:post:updated", handlePostUpdated);
      socket.off("feed:post:reaction-updated", handlePostReactionUpdated);
      socket.off("feed:comment:updated", handleCommentUpdated);
      socket.off("feed:comment:reacted", handleCommentReacted);
      socket.off("feed:answer:accepted", handleAnswerAccepted);
      socket.off("feed:poll:voted", handlePollVoted);
      socket.off("feed:follow", handleFollow);
    };
  }, [socket, normalizePost, toId, fetchMyStats]);

  useEffect(() => {
    if (!socket) return;
    socket.emit("feed:global:join");
    return () => {
      socket.emit("feed:global:leave");
    };
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

  const voteOnPoll = useCallback(
    async (postId, optionIndex) => {
      const res = await api.post(`/api/feed/posts/${postId}/poll-vote`, {
        optionIndex,
      });

      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? normalizePost({ ...p, poll: res.data.poll }) : p,
        ),
      );

      return res.data;
    },
    [normalizePost],
  );

  const acceptAnswer = useCallback(
    async (postId, commentId) => {
      const res = await api.post(
        `/api/feed/posts/${postId}/accept/${commentId}`,
      );

      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? normalizePost({
                ...p,
                acceptedComment: res.data.acceptedComment,
                acceptedAnswer: res.data.acceptedComment,
                status: res.data.status,
              })
            : p,
        ),
      );

      setCommentsByPost((prev) => {
        const comments = Array.isArray(prev[postId]) ? prev[postId] : [];
        const updated = comments.map((c) => ({
          ...c,
          isAccepted: String(c._id) === String(res.data.acceptedComment),
        }));
        return { ...prev, [postId]: updated };
      });

      return res.data;
    },
    [normalizePost],
  );

  const fetchComments = useCallback(
    async (postId, page = 1, limit = 100) => {
      const res = await api.get("/api/feed/comments", {
        params: { postId, page, limit },
      });

      const flat = flattenComments(res.data?.comments || []);
      setCommentsByPost((prev) => ({ ...prev, [postId]: flat }));
      return flat;
    },
    [flattenComments],
  );

  const addComment = useCallback(
    async (postId, payload) => {
      const res = await api.post("/api/feed/comments", {
        postId,
        content: payload?.content,
        parentCommentId: payload?.replyTo || null,
      });

      const created = {
        ...res.data,
        replyTo: toId(res.data.parentComment),
      };

      setCommentsByPost((prev) => {
        const existing = Array.isArray(prev[postId]) ? prev[postId] : [];
        // Dedup: socket feed:comment:created may have already inserted this
        if (existing.some((c) => String(c._id) === String(created._id)))
          return prev;
        return { ...prev, [postId]: [...existing, created] };
      });

      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? normalizePost({
                ...p,
                commentsCount: (p.commentsCount ?? p.commentCount ?? 0) + 1,
              })
            : p,
        ),
      );

      return created;
    },
    [normalizePost, toId],
  );

  const reactToComment = useCallback(async (postId, commentId, emoji) => {
    const res = await api.post(`/api/feed/comments/${commentId}/react`, {
      emoji,
    });

    setCommentsByPost((prev) => {
      const existing = Array.isArray(prev[postId]) ? prev[postId] : [];
      const updated = existing.map((c) =>
        c._id === commentId
          ? {
              ...c,
              reactions: res.data.reactions,
              reactionCount: res.data.reactionCount,
            }
          : c,
      );
      return { ...prev, [postId]: updated };
    });

    return res.data;
  }, []);

  const editComment = useCallback(
    async (postId, commentId, content) => {
      const res = await api.patch(`/api/feed/comments/${commentId}`, {
        content,
      });

      setCommentsByPost((prev) => {
        const existing = Array.isArray(prev[postId]) ? prev[postId] : [];
        const updated = existing.map((c) =>
          c._id === commentId
            ? {
                ...c,
                ...res.data,
                replyTo: toId(res.data.parentComment),
              }
            : c,
        );
        return { ...prev, [postId]: updated };
      });

      return res.data;
    },
    [toId],
  );

  const deleteComment = useCallback(
    async (postId, commentId) => {
      const normalizedCommentId = String(commentId || "");
      if (!normalizedCommentId) {
        throw new Error("Invalid comment ID");
      }

      const existing = Array.isArray(commentsByPost[postId])
        ? commentsByPost[postId]
        : [];
      const removedIds = new Set([normalizedCommentId]);

      for (const comment of existing) {
        const parentId = comment.replyTo ?? comment.parentComment ?? null;
        if (String(parentId) === normalizedCommentId) {
          removedIds.add(String(comment._id));
        }
      }

      const removedCount = removedIds.size;

      const res = await api.delete(`/api/feed/comments/${normalizedCommentId}`);

      setCommentsByPost((prev) => {
        const current = Array.isArray(prev[postId]) ? prev[postId] : [];
        const updated = current.filter((c) => !removedIds.has(String(c._id)));
        return { ...prev, [postId]: updated };
      });

      const serverCommentsCount =
        typeof res.data?.commentsCount === "number"
          ? res.data.commentsCount
          : null;
      const deletedCount =
        typeof res.data?.deletedCount === "number"
          ? res.data.deletedCount
          : removedCount;

      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? (() => {
                const acceptedAnswerId =
                  p.acceptedAnswer == null ? null : String(p.acceptedAnswer);
                const acceptedCommentId =
                  p.acceptedComment == null ? null : String(p.acceptedComment);
                const isDeletedAccepted =
                  acceptedAnswerId === normalizedCommentId ||
                  acceptedCommentId === normalizedCommentId;

                const newPost = {
                  ...p,
                  commentsCount:
                    serverCommentsCount != null
                      ? Math.max(0, serverCommentsCount)
                      : Math.max(
                          0,
                          (p.commentsCount ?? p.commentCount ?? 0) -
                            deletedCount,
                        ),
                  acceptedAnswer: isDeletedAccepted ? null : p.acceptedAnswer,
                  acceptedComment: isDeletedAccepted ? null : p.acceptedComment,
                  status: isDeletedAccepted ? "open" : p.status,
                };

                return normalizePost(newPost);
              })()
            : p,
        ),
      );

      return {
        removedCount: deletedCount,
        commentsCount:
          serverCommentsCount != null
            ? Math.max(0, serverCommentsCount)
            : undefined,
      };
    },
    [commentsByPost, normalizePost],
  );

  const followTag = useCallback(
    async (tag) => {
      if (!tag) return;
      const isFollowing = (userStats.followedTags ?? []).includes(tag);
      // Optimistic update
      setUserStats((prev) => {
        const tags = prev.followedTags ?? [];
        return {
          ...prev,
          followedTags: isFollowing
            ? tags.filter((t) => t !== tag)
            : [...tags, tag],
        };
      });
      try {
        await api.post(`/api/feed/tags/${encodeURIComponent(tag)}/follow`);
      } catch (err) {
        // Revert on failure
        setUserStats((prev) => {
          const tags = prev.followedTags ?? [];
          return {
            ...prev,
            followedTags: isFollowing
              ? [...tags, tag]
              : tags.filter((t) => t !== tag),
          };
        });
        console.error("followTag error:", err.message);
      }
    },
    [userStats.followedTags],
  );
  const searchPosts = useCallback(
    async (q, { type, sort } = {}) => {
      if (!q?.trim()) return [];
      try {
        const res = await api.get("/api/feed/search", {
          params: {
            q: q.trim(),
            type: type && type !== "all" ? type : undefined,
            sort: sort || "latest",
          },
        });
        return Array.isArray(res.data?.posts)
          ? res.data.posts.map(normalizePost)
          : Array.isArray(res.data)
            ? res.data.map(normalizePost)
            : [];
      } catch (err) {
        console.error("searchPosts error:", err.message);
        return [];
      }
    },
    [normalizePost],
  );

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

      // Update own followingCount in sidebar
      setUserStats((prev) => ({
        ...prev,
        followingCount: Math.max(
          0,
          (prev.followingCount ?? 0) + (wasFollowing ? -1 : 1),
        ),
      }));

      try {
        const res = await api.post(`/api/feed/users/${userId}/follow`);
        await fetchMyStats();
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
        // Revert own followingCount
        setUserStats((prev) => ({
          ...prev,
          followingCount: Math.max(
            0,
            (prev.followingCount ?? 0) + (wasFollowing ? 1 : -1),
          ),
        }));
        console.error(
          "followUser error:",
          error?.response?.data?.message || error.message,
        );
        throw error;
      }
    },
    [followingSet, fetchMyStats],
  );

  const getUserProfile = useCallback(
    async (userId, { forceRefresh = false } = {}) => {
      // Use ref for stable cache reads — avoids recreating callback on every cache write
      if (!forceRefresh && profileCacheRef.current[userId]) {
        return profileCacheRef.current[userId];
      }
      try {
        const res = await api.get(`/api/feed/users/${userId}/profile`);
        const profile = res.data;
        profileCacheRef.current = {
          ...profileCacheRef.current,
          [userId]: profile,
        };
        setProfileCache((prev) => ({ ...prev, [userId]: profile }));
        // Sync followingSet for both true and false states
        setFollowingSet((prev) => {
          const next = new Set(prev);
          if (profile.isFollowing) next.add(userId);
          else next.delete(userId);
          return next;
        });
        return profile;
      } catch (error) {
        // On error, return cached version if available
        if (profileCacheRef.current[userId])
          return profileCacheRef.current[userId];
        console.error(
          "getUserProfile error:",
          error?.response?.data?.message || error.message,
        );
        throw error;
      }
    },
    [], // stable — reads cache via ref, not state
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
    commentsByPost,
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
    reputationTick,
    // Socket (for join/leave room in FeedView)
    socket,
    // Social state
    followingSet,
    profileCache,
    pendingPostCount,
    flushPendingPosts,
    feedPostTick,
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
    editComment,
    deleteComment,
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
