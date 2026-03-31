"use client";
import { useState, useEffect, useCallback } from "react";
import { useSocket } from "@/hooks/useSocket";
import useAuth from "@/hooks/useAuth";

const STORAGE_KEY = (convId) => `dmprefs_${convId}`;

/**
 * Reactively reads DM customisation preferences from the conversation object,
 * and falls back to localStorage for 'muted' state.
 * Emits 'conversation:customise' socket events to backend for global sync.
 */
export function useDmPrefs(conversation) {
  const { socket } = useSocket() || {};
  const { user } = useAuth() || {};

  const convId = conversation?._id;

  // Local state for 'muted'
  const loadMuted = useCallback(() => {
    if (!convId) return false;
    try {
      const raw = localStorage.getItem(STORAGE_KEY(convId));
      return raw ? JSON.parse(raw).muted : false;
    } catch {
      return false;
    }
  }, [convId]);

  const [muted, setMuted] = useState(loadMuted);

  useEffect(() => {
    setMuted(loadMuted());
  }, [loadMuted]);

  // Derived customisations from the backend object
  const customisation = conversation?.customisation || {};
  const nicknames = customisation.nicknames || {};

  const otherParticipant = conversation?.type === "dm" 
    ? conversation.participants?.find((p) => String(p._id) !== String(user?._id))
    : null;

  const prefs = {
    color: customisation.color || "#00d3bb",
    emoji: customisation.emoji || "👍",
    nickname: (otherParticipant && nicknames[otherParticipant._id]) ? nicknames[otherParticipant._id] : "",
    muted,
  };

  const update = useCallback(
    (key, value, targetUserIdOverride = null) => {
      if (!convId) return;

      if (key === "muted") {
        try {
          setMuted(value);
          require("@/app/api/Axios").default.patch(`/api/chat/conversations/${convId}/mute`, { muted: value }).catch(() => {});
        } catch {}
        return;
      }

      // Sync color, emoji, and nickname to backend
      if (!socket) return;

      let targetUserId = targetUserIdOverride;
      if (!targetUserId && key === "nickname" && otherParticipant) {
        targetUserId = otherParticipant._id;
      }

      socket.emit("conversation:customise", {
        conversationId: convId,
        type: key,
        value,
        targetUserId,
      });
    },
    [convId, socket, otherParticipant]
  );

  return { prefs, update };
}
