"use client";
import { useState, useEffect, useCallback } from "react";
import { useSocket } from "@/hooks/useSocket";
import useAuth from "@/hooks/useAuth";
import api from "@/app/api/Axios";

const STORAGE_KEY = (convId) => `dmprefs_${convId}`;

/**
 * Reactively reads DM customisation preferences from the conversation object.
 * Mute state is sourced from the server (conversation.isMuted) and synced to
 * localStorage as a fallback. Emits 'conversation:customise' socket events to
 * backend for color/emoji/nickname changes.
 */
export function useDmPrefs(conversation) {
  const { socket } = useSocket() || {};
  const { user } = useAuth() || {};

  const convId = conversation?._id;

  // Mute: prefer server value (isMuted) — set by the API
  const serverMuted = !!conversation?.isMuted;

  const loadLocalMuted = useCallback(() => {
    if (!convId) return false;
    try {
      const raw = localStorage.getItem(STORAGE_KEY(convId));
      return raw ? JSON.parse(raw).muted : false;
    } catch {
      return false;
    }
  }, [convId]);

  // Initialise from server value; fall back to localStorage if not yet hydrated
  const [muted, setMuted] = useState(() => serverMuted || loadLocalMuted());

  // Keep in sync whenever the conversation object changes (e.g. after fetch / socket update)
  useEffect(() => {
    setMuted(serverMuted);
  }, [serverMuted]);

  // Derived customisations from the backend object
  const customisation = conversation?.customisation || {};
  const nicknames = customisation.nicknames || {};

  // Support both DM shapes: participant (singular) or participants array
  const otherParticipant =
    conversation?.type === "dm"
      ? conversation.participant ||
        conversation.participants?.find(
          (p) => String(p._id) !== String(user?._id),
        )
      : null;

  const prefs = {
    color: customisation.color || "#00d3bb",
    emoji: customisation.emoji || "👍",
    nickname:
      otherParticipant && nicknames[otherParticipant._id]
        ? nicknames[otherParticipant._id]
        : "",
    muted,
  };

  const update = useCallback(
    (key, value, targetUserIdOverride = null) => {
      if (!convId) return;

      if (key === "muted") {
        // Optimistic update
        const previousMuted = muted;
        setMuted(value);
        try {
          localStorage.setItem(
            STORAGE_KEY(convId),
            JSON.stringify({ muted: value }),
          );
        } catch {}
        // Sync to server — roll back on failure
        try {
          api
            .patch(`/api/chat/conversations/${convId}/mute`, {
              muted: value,
            })
            .catch(() => {
              // Server rejected — revert optimistic update
              setMuted(previousMuted);
              try {
                localStorage.setItem(
                  STORAGE_KEY(convId),
                  JSON.stringify({ muted: previousMuted }),
                );
              } catch {}
            });
        } catch {
          setMuted(previousMuted);
        }
        return;
      }

      // Sync color, emoji, and nickname to backend via socket
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
    [convId, socket, otherParticipant],
  );

  return { prefs, update };
}
