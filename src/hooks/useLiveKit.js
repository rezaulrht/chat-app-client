import { useState, useEffect, useCallback } from "react";
import { Room, RoomEvent } from "livekit-client";
import api from "@/app/api/Axios";

export const useLiveKit = (roomName, identity) => {
  const [room, setRoom] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [participants, setParticipants] = useState([]);

  const connect = useCallback(async () => {
    if (!roomName || !identity) return;

    try {
      const { data } = await api.post("/calls/token", { roomName });

      const newRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
      });

      newRoom.on(RoomEvent.Connected, () => setIsConnected(true));
      newRoom.on(RoomEvent.Disconnected, () => setIsConnected(false));
      newRoom.on(RoomEvent.ParticipantConnected, (p) =>
        setParticipants((prev) => [...prev, p])
      );
      newRoom.on(RoomEvent.ParticipantDisconnected, (p) =>
        setParticipants((prev) => prev.filter((x) => x.sid !== p.sid))
      );

      await newRoom.connect(data.url, data.token);
      setRoom(newRoom);
    } catch (err) {
      console.error("Failed to connect to LiveKit:", err);
      setError(err.message);
    }
  }, [roomName, identity]);

  const disconnect = useCallback(async () => {
    if (room) {
      await room.disconnect();
      setRoom(null);
      setIsConnected(false);
      setParticipants([]);
    }
  }, [room]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return { room, isConnected, error, participants, connect, disconnect };
};
