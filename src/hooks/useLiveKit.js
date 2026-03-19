import { useState, useEffect, useCallback } from "react";
import api from "@/app/api/Axios";
import { connectRoom, disconnectRoom, getRoom, getParticipants, onRoomStateChange } from "@/lib/livekitRoom";

export const useLiveKit = () => {
  const [room, setRoom] = useState(getRoom());
  const [participants, setParticipants] = useState(getParticipants());
  const [isConnected, setIsConnected] = useState(!!getRoom());

  useEffect(() => {
    const unsub = onRoomStateChange(() => {
      const r = getRoom();
      setRoom(r);
      setIsConnected(!!r);
      setParticipants(getParticipants());
    });
    return unsub;
  }, []);

  const connect = useCallback(async (roomName, callType = "audio") => {
    if (!roomName) return;
    const { data } = await api.post("/api/calls/token", { roomName });
    await connectRoom(data.url, data.token, callType);
  }, []);

  const disconnect = useCallback(async () => {
    await disconnectRoom();
  }, []);

  return { room, isConnected, participants, connect, disconnect };
};
