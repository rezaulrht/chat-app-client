"use client";

import { useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { SocketContext } from "./SocketContext";
import api from "@/app/api/Axios";

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Map());
  const [typingUsers, setTypingUsers] = useState(new Map());

  // Function to fetch last seen times for multiple users
  const fetchLastSeenTimes = useCallback(async (userIds) => {
    if (!userIds || userIds.length === 0) return;

    try {
      const res = await api.post("/api/chat/last-seen", { userIds });

      setOnlineUsers((prev) => {
        const updated = new Map(prev);
        Object.entries(res.data).forEach(([userId, status]) => {
          // status is an object with { online: boolean, lastSeen: timestamp|null }
          if (status.online) {
            updated.set(userId, { online: true, lastSeen: null });
          } else {
            updated.set(userId, { online: false, lastSeen: status.lastSeen });
          }
        });
        return updated;
      });
    } catch (err) {
      console.error("Failed to batch fetch presence status:", err);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) return;

    // Connect to server with JWT in the auth handshake
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL, {
      auth: { token },
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      setSocket(newSocket);
      setIsConnected(true);
    });

    newSocket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
      setIsConnected(false);
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    // --- Handle presence updates (user comes online/goes offline) ---
    newSocket.on("presence:update", async ({ userId, online }) => {
      if (online) {
        // User came online
        setOnlineUsers((prev) => {
          const updated = new Map(prev);
          updated.set(userId, { online: true, lastSeen: null });
          return updated;
        });
      } else {
        // User went offline - immediately mark as offline
        setOnlineUsers((prev) => {
          const updated = new Map(prev);
          updated.set(userId, { online: false, lastSeen: Date.now() }); // Use current time as fallback
          return updated;
        });

        // Fetch last seen time for offline users
        try {
          const res = await api.get(`/api/chat/last-seen/${userId}`);

          if (res.data && res.data.lastSeen) {
            setOnlineUsers((prev) => {
              const updated = new Map(prev);
              if (updated.has(userId)) {
                updated.set(userId, {
                  online: false,
                  lastSeen: res.data.lastSeen,
                });
              }
              return updated;
            });
          } else {
            console.warn(
              `No lastSeen data received for ${userId}, using fallback`,
            );
          }
        } catch (err) {
          console.error(`Failed to fetch last seen for ${userId}:`, err);
          // Keep the fallback time that was already set
        }
      }
    });

    // --- Handle typing indicator updates ---
    // typingUsers: Map<conversationId, Set<userId>>
    // Supports multiple simultaneous typers in group conversations.
    newSocket.on("typing:update", ({ conversationId, userId, isTyping }) => {
      if (!conversationId || !userId) return;
      setTypingUsers((prev) => {
        const updated = new Map(prev);
        const current = new Set(updated.get(conversationId) || []);
        if (isTyping) {
          current.add(userId);
        } else {
          current.delete(userId);
        }
        if (current.size === 0) {
          updated.delete(conversationId);
        } else {
          updated.set(conversationId, current);
        }
        return updated;
      });
    });

    // --- Handle status message updates ---
    newSocket.on("user:status:updated", ({ userId, statusMessage }) => {
      // Update the user's status in membersCache via a custom event
      // The WorkspaceProvider will listen for this
      window.dispatchEvent(new CustomEvent("user:status:updated", {
        detail: { userId, statusMessage }
      }));
    });

    // --- Periodic presence ping to keep user online ---
    const presenceInterval = setInterval(() => {
      if (newSocket.connected) {
        newSocket.emit("presence:ping");
      }
    }, 25000); // Every 25 seconds

    // Cleanup on unmount
    return () => {
      clearInterval(presenceInterval);
      newSocket.disconnect();
      setSocket(null);
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        onlineUsers,
        fetchLastSeenTimes,
        typingUsers,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
