"use client";

import { useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { SocketContext } from "./SocketContext";
import api from "@/app/api/Axios";

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Map());

  // Function to fetch last seen times for multiple users
  const fetchLastSeenTimes = useCallback(async (userIds) => {
    if (!userIds || userIds.length === 0) return;

    try {
      console.log("Batch fetching presence status for users:", userIds);
      const res = await api.post("/api/chat/last-seen", { userIds });
      console.log("Batch presence response:", res.data);

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
      console.log("Online users updated with batch data");
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
      console.log("✅ Socket connected:", newSocket.id);
      setSocket(newSocket);
      setIsConnected(true);
    });

    newSocket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
      setIsConnected(false);
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setIsConnected(false);
    });

    // --- Handle presence updates (user comes online/goes offline) ---
    newSocket.on("presence:update", async ({ userId, online }) => {
      console.log(`Presence update: User ${userId} is ${online ? "online" : "offline"}`);

      if (online) {
        // User came online
        setOnlineUsers((prev) => {
          const updated = new Map(prev);
          updated.set(userId, { online: true, lastSeen: null });
          return updated;
        });
        console.log(`User ${userId} is now ONLINE`);
      } else {
        // User went offline - immediately mark as offline
        setOnlineUsers((prev) => {
          const updated = new Map(prev);
          updated.set(userId, { online: false, lastSeen: Date.now() }); // Use current time as fallback
          return updated;
        });
        console.log(`User ${userId} marked as OFFLINE immediately`);

        // Fetch last seen time for offline users
        try {
          console.log(`Fetching last seen for user ${userId}...`);
          const res = await api.get(`/api/chat/last-seen/${userId}`);
          console.log(`API response for ${userId}:`, res.data);

          if (res.data && res.data.lastSeen) {
            setOnlineUsers((prev) => {
              const updated = new Map(prev);
              if (updated.has(userId)) {
                updated.set(userId, {
                  online: false,
                  lastSeen: res.data.lastSeen
                });
              }
              return updated;
            });
            console.log(`Last seen for ${userId}: ${new Date(res.data.lastSeen).toLocaleString()}`);
          } else {
            console.warn(`No lastSeen data received for ${userId}, using fallback`);
          }
        } catch (err) {
          console.error(`Failed to fetch last seen for ${userId}:`, err);
          // Keep the fallback time that was already set
        }
      }
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
    <SocketContext.Provider value={{ socket, isConnected, onlineUsers, fetchLastSeenTimes }}>
      {children}
    </SocketContext.Provider>
  );
};
