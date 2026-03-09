"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ModuleContext } from "./ModuleContext";
import { useSocket } from "@/hooks/useSocket";
import useAuth from "@/hooks/useAuth";

// ── Days 1-3: mock service ────────────────────────────────────────────────
// Day 4 swap: delete this import, uncomment the real service below
import { getModuleMessages, sendModuleMessage } from "@/utils/mockModuleApi";

// ── Day 4: real service (uncomment) ──────────────────────────────────────
// import api from "@/app/api/Axios";
// const getModuleMessages = ({ workspaceId, moduleId, page }) =>
//   api.get(`/api/workspaces/${workspaceId}/modules/${moduleId}/messages?page=${page}`).then(r => r.data);
// const sendModuleMessage = (payload) =>
//   api.post(`/api/workspaces/${payload.workspaceId}/modules/${payload.moduleId}/messages`, payload).then(r => r.data);
// ─────────────────────────────────────────────────────────────────────────

export function ModuleProvider({ children, moduleId, workspaceId }) {
  const { socket } = useSocket() || {};
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [reactions, setReactions] = useState({});
  const [typingUsers, setTypingUsers] = useState([]); // [{ _id, name }]

  const typingTimers = useRef({});
  const seenInitRef = useRef(null);

  // ── Fetch messages ───────────────────────────────────────────────────────
  const fetchMessages = useCallback(
    async (p = 1) => {
      if (!moduleId || !workspaceId) return;
      setLoading(true);
      try {
        const data = await getModuleMessages({
          workspaceId,
          moduleId,
          page: p,
        });
        const msgs = data.messages || [];

        // Build reactions map from loaded messages
        const rxns = {};
        msgs.forEach((msg) => {
          if (msg.reactions && Object.keys(msg.reactions).length > 0) {
            rxns[msg._id] = msg.reactions;
          }
        });

        if (p === 1) {
          setMessages(msgs);
          setReactions(rxns);
        } else {
          // Prepend older messages (load more)
          setMessages((prev) => [...msgs, ...prev]);
          setReactions((prev) => ({ ...rxns, ...prev }));
        }
        setHasMore(data.hasMore || false);
        setPage(p);
      } catch (err) {
        console.error("Failed to fetch module messages:", err);
      } finally {
        setLoading(false);
      }
    },
    [moduleId, workspaceId],
  );

  // Fetch on mount / when module changes
  useEffect(() => {
    setMessages([]);
    setReactions({});
    setTypingUsers([]);
    setPage(1);
    seenInitRef.current = null;
    fetchMessages(1);
  }, [moduleId, fetchMessages]);

  // ── Socket: join/leave module room ───────────────────────────────────────
  useEffect(() => {
    if (!socket || !moduleId) return;
    socket.emit("module:join", { moduleId, workspaceId });
    return () => socket.emit("module:leave", { moduleId, workspaceId });
  }, [socket, moduleId, workspaceId]);

  // ── Socket: mark seen on initial load ───────────────────────────────────
  useEffect(() => {
    if (!socket || !user || !moduleId || loading) return;
    if (seenInitRef.current === moduleId) return;

    const lastMsg = [...messages]
      .reverse()
      .find(
        (m) =>
          m.sender?._id !== user._id &&
          !m.readBy?.some?.((r) => r.user === user._id),
      );
    if (lastMsg) {
      socket.emit("module:seen", {
        moduleId,
        workspaceId,
        lastSeenMessageId: lastMsg._id,
      });
    }
    seenInitRef.current = moduleId;
  }, [socket, user, moduleId, workspaceId, loading, messages]);

  // ── Socket: live event listeners ─────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const onNewMessage = (msg) => {
      if (msg.moduleId !== moduleId) return;

      setMessages((prev) => {
        // Replace optimistic placeholder if tempId matches
        const optimisticIdx = prev.findIndex((m) => m._id === msg.tempId);
        if (optimisticIdx !== -1) {
          const updated = [...prev];
          updated[optimisticIdx] = msg;
          return updated;
        }
        // Deduplicate by _id
        if (prev.find((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });

      // Auto-mark seen if we're viewing this module
      if (msg.sender?._id !== user?._id && socket) {
        socket.emit("module:seen", {
          moduleId,
          workspaceId,
          lastSeenMessageId: msg._id,
        });
      }
    };

    const onReacted = ({ messageId, moduleId: mid, reactions: rxns }) => {
      if (mid !== moduleId) return;
      setReactions((prev) => ({ ...prev, [messageId]: rxns }));
    };

    const onEdited = (updatedMsg) => {
      if (updatedMsg.moduleId !== moduleId) return;
      setMessages((prev) =>
        prev.map((m) =>
          m._id === updatedMsg._id ? { ...m, ...updatedMsg } : m,
        ),
      );
    };

    const onDeleted = ({ messageId, moduleId: mid, forEveryone }) => {
      if (mid !== moduleId) return;
      if (forEveryone) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === messageId ? { ...m, isDeleted: true } : m,
          ),
        );
      } else {
        // "Delete for me" — remove from local list only
        setMessages((prev) => prev.filter((m) => m._id !== messageId));
      }
    };

    const onTypingStart = ({ userId, userName, moduleId: mid }) => {
      if (mid !== moduleId || userId === user?._id) return;
      setTypingUsers((prev) => {
        if (prev.find((u) => u._id === userId)) return prev;
        return [...prev, { _id: userId, name: userName }];
      });
      // Auto-clear after 4 seconds in case stop event is missed
      clearTimeout(typingTimers.current[userId]);
      typingTimers.current[userId] = setTimeout(() => {
        setTypingUsers((prev) => prev.filter((u) => u._id !== userId));
      }, 4000);
    };

    const onTypingStop = ({ userId, moduleId: mid }) => {
      if (mid !== moduleId) return;
      clearTimeout(typingTimers.current[userId]);
      delete typingTimers.current[userId];
      setTypingUsers((prev) => prev.filter((u) => u._id !== userId));
    };

    socket.on("module:message:new", onNewMessage);
    socket.on("module:message:reacted", onReacted);
    socket.on("module:message:edited", onEdited);
    socket.on("module:message:deleted", onDeleted);
    socket.on("module:typing:start", onTypingStart);
    socket.on("module:typing:stop", onTypingStop);

    return () => {
      socket.off("module:message:new", onNewMessage);
      socket.off("module:message:reacted", onReacted);
      socket.off("module:message:edited", onEdited);
      socket.off("module:message:deleted", onDeleted);
      socket.off("module:typing:start", onTypingStart);
      socket.off("module:typing:stop", onTypingStop);

      // Clean up all typing timers for this module
      Object.values(typingTimers.current).forEach(clearTimeout);
      typingTimers.current = {};
    };
  }, [socket, moduleId, workspaceId, user?._id]);

  // ── Actions exposed to consumers ─────────────────────────────────────────
  const sendMessage = useCallback(
    ({ text, gifUrl, replyTo }) => {
      if (!socket || !moduleId) return;

      const tempId = `temp-${Date.now()}`;
      const optimistic = {
        _id: tempId,
        moduleId,
        workspaceId,
        sender: { _id: user?._id, name: user?.name, avatar: user?.avatar },
        text: text || null,
        gifUrl: gifUrl || null,
        replyTo: replyTo || null,
        createdAt: new Date().toISOString(),
        reactions: {},
        isDeleted: false,
        isEdited: false,
        isOptimistic: true,
        tempId,
      };
      setMessages((prev) => [...prev, optimistic]);

      socket.emit("module:message:send", {
        moduleId,
        workspaceId,
        text,
        gifUrl,
        replyTo: replyTo?._id || null,
        tempId,
      });

      // Stop typing indicator
      socket.emit("module:typing:stop", { moduleId, workspaceId });
    },
    [socket, moduleId, workspaceId, user],
  );

  const sendTyping = useCallback(
    (isTyping) => {
      if (!socket || !moduleId) return;
      socket.emit(isTyping ? "module:typing:start" : "module:typing:stop", {
        moduleId,
        workspaceId,
      });
    },
    [socket, moduleId, workspaceId],
  );

  const reactToMessage = useCallback(
    (messageId, emoji) => {
      if (!socket) return;
      socket.emit("module:message:react", {
        moduleId,
        workspaceId,
        messageId,
        emoji,
      });
    },
    [socket, moduleId, workspaceId],
  );

  const editMessage = useCallback(
    (messageId, newText) => {
      if (!socket) return;
      socket.emit("module:message:edit", {
        moduleId,
        workspaceId,
        messageId,
        newText,
      });
    },
    [socket, moduleId, workspaceId],
  );

  const deleteMessage = useCallback(
    (messageId, forEveryone = false) => {
      if (!socket) return;
      socket.emit("module:message:delete", {
        moduleId,
        workspaceId,
        messageId,
        forEveryone,
      });
    },
    [socket, moduleId, workspaceId],
  );

  const loadMore = useCallback(() => {
    if (hasMore && !loading) fetchMessages(page + 1);
  }, [hasMore, loading, fetchMessages, page]);

  const value = {
    messages,
    loading,
    hasMore,
    loadMore,
    reactions,
    typingUsers,
    sendMessage,
    sendTyping,
    reactToMessage,
    editMessage,
    deleteMessage,
  };

  return (
    <ModuleContext.Provider value={value}>{children}</ModuleContext.Provider>
  );
}
