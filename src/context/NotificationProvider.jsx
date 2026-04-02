"use client";

import { useState, useCallback, useContext, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { SocketContext } from "./SocketContext";
import { NotificationContext } from "./NotificationContext";
import api from "@/app/api/Axios";
import useAuth from "@/hooks/useAuth";

function formatToastMessage(notif) {
  const actors = notif.actors || [];
  let a = "Someone";
  if (actors.length === 1) a = actors[0].name;
  else if (actors.length === 2) a = `${actors[0].name} and ${actors[1].name}`;
  else if (actors.length > 2)
    a = `${actors[0].name}, ${actors[1].name} and ${notif.actorCount - 2} others`;

  const map = {
    chat_message: `New message from ${a}`,
    chat_mention: `${a} mentioned you in a chat`,
    call_missed: `Missed call from ${a}`,
    feed_reaction: `${a} reacted to your post`,
    feed_comment: `${a} commented on your post`,
    feed_follow: `${a} followed you`,
    feed_answer_accepted: `Your answer was accepted`,
    workspace_mention: `${a} mentioned you in #${notif.data?.moduleName || "a channel"}`,
  };
  return map[notif.type] || "New notification";
}

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [prefs, setPrefs] = useState({});
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const socketCtx = useContext(SocketContext);
  const socket = socketCtx?.socket ?? null;

  // User-specific cache key to prevent cross-user leakage
  const PREFS_CACHE_KEY = user ? `notification_prefs_${user._id || user.id}` : "notification_prefs_guest";
  const PREFS_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  // Clear cache on logout
  useEffect(() => {
    if (!user) {
      try {
        const keys = Object.keys(localStorage).filter(k => k.startsWith("notification_prefs_"));
        keys.forEach(k => localStorage.removeItem(k));
      } catch {}
    }
  }, [user]);

  // Load cached prefs from localStorage when user changes
  useEffect(() => {
    if (!user) {
      setPrefs({});
      return;
    }
    try {
      const cached = localStorage.getItem(PREFS_CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < PREFS_CACHE_TTL) {
          setPrefs(data);
        }
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }, [user, PREFS_CACHE_KEY]);

  // Cache prefs to localStorage when they change
  useEffect(() => {
    if (Object.keys(prefs).length > 0 && user) {
      try {
        localStorage.setItem(
          PREFS_CACHE_KEY,
          JSON.stringify({ data: prefs, timestamp: Date.now() })
        );
      } catch (e) {
        // Ignore localStorage errors
      }
    }
  }, [prefs, user, PREFS_CACHE_KEY]);

  // Track which conversation the user is currently viewing so we can
  // suppress toast for chat_message notifications from that conversation.
  const [activeConversationId, setActiveConversationId] = useState(null);
  const activeConvRef = useRef(null);
  useEffect(() => {
    activeConvRef.current = activeConversationId;
  }, [activeConversationId]);

  // Track muted conversation IDs so we can suppress their toasts
  const [mutedConversationIds, setMutedConversationIds] = useState(new Set());
  const mutedConvRef = useRef(new Set());
  useEffect(() => {
    mutedConvRef.current = mutedConversationIds;
  }, [mutedConversationIds]);

  const socketCtx = useContext(SocketContext);
  const socket = socketCtx?.socket ?? null;
  const { user } = useAuth();

  // Per-type toast icon (emoji) to match the icon badges in the dropdown

  const fetchNotifications = useCallback(
    async (page = 1) => {
      if (!user) return;
      setLoading(true);
      try {
        const res = await api.get(`/api/notifications?page=${page}&limit=20`);
        const {
          notifications: incoming,
          unreadCount: count,
          hasMore: more,
        } = res.data;
        if (page === 1) {
          setNotifications(incoming);
        } else {
          setNotifications((prev) => [...prev, ...incoming]);
        }
        setUnreadCount(count);
        setHasMore(more);
      } catch (err) {
        console.error(
          "fetchNotifications error:",
          err?.response?.data?.message || err.message,
        );
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  const fetchPrefs = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get("/api/notifications/prefs");
      setPrefs(res.data.prefs || {});
    } catch (err) {
      console.error(
        "fetchPrefs error:",
        err?.response?.data?.message || err.message,
      );
    }
  }, [user]);

  const markRead = useCallback(
    async (id) => {
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      try {
        await api.patch(`/api/notifications/${id}/read`);
      } catch (err) {
        console.error(
          "markRead error:",
          err?.response?.data?.message || err.message,
        );
        fetchNotifications(1);
      }
    },
    [fetchNotifications],
  );

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await api.patch("/api/notifications/read-all");
    } catch (err) {
      console.error(
        "markAllRead error:",
        err?.response?.data?.message || err.message,
      );
      fetchNotifications(1);
    }
  }, [fetchNotifications]);

  const deleteNotif = useCallback(
    async (id) => {
      setNotifications((prev) => {
        const target = prev.find((n) => n._id === id);
        if (target && !target.read) setUnreadCount((c) => Math.max(0, c - 1));
        return prev.filter((n) => n._id !== id);
      });
      try {
        await api.delete(`/api/notifications/${id}`);
      } catch (err) {
        console.error(
          "deleteNotif error:",
          err?.response?.data?.message || err.message,
        );
        fetchNotifications(1);
      }
    },
    [fetchNotifications],
  );

  const updatePrefs = useCallback(
    async (newPrefs) => {
      setPrefs((prev) => ({ ...prev, ...newPrefs }));
      try {
        await api.patch("/api/notifications/prefs", newPrefs);
      } catch (err) {
        console.error(
          "updatePrefs error:",
          err?.response?.data?.message || err.message,
        );
        fetchPrefs();
      }
    },
    [fetchPrefs],
  );

  const addIncoming = useCallback((notif) => {
    setNotifications((prev) => {
      // If it's an updated grouped notif, replace in place; otherwise prepend
      const idx = prev.findIndex((n) => n._id === notif._id);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = notif;
        return updated;
      }
      return [notif, ...prev];
    });
    setUnreadCount((prev) => prev + 1);
  }, []);

  // Fetch on mount when user is logged in
  useEffect(() => {
    if (user) {
      fetchNotifications(1);
      fetchPrefs();
    }
  }, [user, fetchNotifications, fetchPrefs]);

  // Socket listener for real-time notifications
  useEffect(() => {
    if (!socket) return;

    const handler = (notif) => {
      addIncoming(notif);

      // Suppress chat_message toast when the user is currently in that conversation
      // or when the conversation is muted
      const isChatNotif =
        notif.type === "chat_message" || notif.type === "chat_mention";
      const isSuppressed =
        isChatNotif &&
        (notif.data?.conversationId === activeConvRef.current ||
          mutedConvRef.current.has(notif.data?.conversationId));

      if (!isSuppressed) {
        const TOAST_ICON = {
          feed_follow: "👤",
          feed_reaction: "❤️",
          feed_comment: "💬",
          feed_answer_accepted: "✅",
          chat_message: "📩",
          chat_mention: "📣",
          call_missed: "📵",
          workspace_mention: "#️⃣",
        };
        toast(formatToastMessage(notif), {
          icon: TOAST_ICON[notif.type] || "🔔",
          duration: 4000,
        });
      }
    };

    socket.on("notification:new", handler);
    return () => socket.off("notification:new", handler);
  }, [socket, addIncoming]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        hasMore,
        prefs,
        loading,
        fetchNotifications,
        fetchPrefs,
        markRead,
        markAllRead,
        deleteNotif,
        updatePrefs,
        addIncoming,
        activeConversationId,
        setActiveConversationId,
        mutedConversationIds,
        setMutedConversationIds,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
