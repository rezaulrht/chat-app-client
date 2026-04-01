import { useState, useEffect, useCallback } from "react";
import api from "@/app/api/Axios";
import {
  connectRoom,
  disconnectRoom,
  getRoom,
  getParticipants,
  getActiveSpeakers,
  onRoomStateChange,
} from "@/lib/livekitRoom";

export const useLiveKit = () => {
  const [room, setRoom] = useState(getRoom());
  const [participants, setParticipants] = useState(getParticipants());
  const [isConnected, setIsConnected] = useState(!!getRoom());
  const [activeSpeakers, setActiveSpeakers] = useState(
    () => new Set(getActiveSpeakers()),
  );

  useEffect(() => {
    const unsub = onRoomStateChange(() => {
      const r = getRoom();
      setRoom(r);
      setIsConnected(!!r);
      setParticipants(getParticipants());
      setActiveSpeakers(new Set(getActiveSpeakers()));
    });
    return unsub;
  }, []);

  // Safety net: poll while connected so any missed LiveKit events still update the UI
  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(() => {
      const r = getRoom();
      if (r) {
        setParticipants(getParticipants());
      } else {
        // Room disappeared without a Disconnected event — sync state
        setIsConnected(false);
        setParticipants([]);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [isConnected]);

  const connect = useCallback(async (roomName, callType = "audio") => {
    if (!roomName) return;
    const { data } = await api.post("/api/calls/token", { roomName });
    await connectRoom(data.url, data.token, callType);
  }, []);

  const disconnect = useCallback(async () => {
    await disconnectRoom();
  }, []);

  return {
    room,
    isConnected,
    participants,
    activeSpeakers,
    connect,
    disconnect,
  };
};
