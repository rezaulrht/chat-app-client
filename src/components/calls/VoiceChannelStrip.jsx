"use client";

import React, { useState, useEffect } from "react";
import { Volume2 } from "lucide-react";
import { useSocket } from "@/hooks/useSocket";
import { useCall } from "@/hooks/useCall";

export default function VoiceChannelStrip({ module, workspaceId }) {
  const [participants, setParticipants] = useState(module.activeParticipants || []);
  const [isJoined, setIsJoined] = useState(false);
  const { socket } = useSocket();
  const { startCall, endCall } = useCall();

  useEffect(() => {
    if (!socket) return;

    const handleParticipants = (data) => {
      if (data.moduleId === module._id) setParticipants(data.participants);
    };

    socket.on("voice_channel:participants", handleParticipants);
    return () => socket.off("voice_channel:participants", handleParticipants);
  }, [socket, module._id]);

  const handleJoin = () => {
    socket?.emit("voice_channel:join", { moduleId: module._id, workspaceId });
    startCall({
      callId: null,
      roomName: `workspace-${workspaceId}-module-${module._id}`,
      callType: "audio",
      isVoiceChannel: true,
      moduleId: module._id,
      moduleName: module.name,
      workspaceId,
    });
    setIsJoined(true);
  };

  const handleLeave = () => {
    socket?.emit("voice_channel:leave", { moduleId: module._id, workspaceId });
    endCall();
    setIsJoined(false);
  };

  return (
    <div className="px-2 py-1">
      <div className="flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-surface group cursor-pointer">
        <Volume2 className="w-4 h-4 text-gray-400" />
        <span className="flex-1 text-sm text-gray-300">{module.name}</span>
        <button
          onClick={isJoined ? handleLeave : handleJoin}
          className={`text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition ${
            isJoined ? "bg-red-500/20 text-red-400" : "bg-accent/20 text-accent"
          }`}
        >
          {isJoined ? "Leave" : "Join"}
        </button>
      </div>

      {participants.length > 0 && (
        <div className="ml-6 mt-1 space-y-0.5">
          {participants.map((p) => (
            <div key={p.userId} className="flex items-center gap-1.5 text-xs text-gray-400 py-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span>{p.userId}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
