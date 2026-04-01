"use client";

import React, { useState, useEffect } from "react";
import { Volume2, Mic, MicOff } from "lucide-react";
import Image from "next/image";
import { useSocket } from "@/hooks/useSocket";
import { useCall } from "@/hooks/useCall";
import { useLiveKit } from "@/hooks/useLiveKit";
import useAuth from "@/hooks/useAuth";

export default function VoiceChannelStrip({ module, workspaceId }) {
  const [participants, setParticipants] = useState(
    module.activeParticipants || [],
  );
  const { socket } = useSocket();
  const { activeCall, startCall, endCall } = useCall();
  const { activeSpeakers, disconnect } = useLiveKit();
  const { user } = useAuth();

  const isJoined =
    activeCall?.isVoiceChannel && activeCall?.moduleId === module._id;

  useEffect(() => {
    if (!socket) return;
    const handleParticipants = (data) => {
      if (data.moduleId?.toString() === module._id?.toString())
        setParticipants(data.participants);
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
  };

  const handleLeave = () => {
    socket?.emit("voice_channel:leave", { moduleId: module._id, workspaceId });
    disconnect();
    endCall();
  };

  return (
    <div className="px-2 py-1">
      {/* Channel row */}
      <div
        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg group cursor-pointer transition-all ${isJoined ? "bg-accent/10" : "hover:bg-white/[0.04]"
          }`}
      >
        <Volume2
          className={`w-4 h-4 shrink-0 ${isJoined ? "text-accent" : "text-gray-400"}`}
        />
        <span
          className={`flex-1 text-sm truncate ${isJoined ? "text-accent font-medium" : "text-ivory/70"}`}
        >
          {module.name}
        </span>

        {/* Participant count badge */}
        {participants.length > 0 && (
          <span className="text-[10px] text-gray-500 font-mono">
            {participants.length}
          </span>
        )}

        <button
          onClick={isJoined ? handleLeave : handleJoin}
          className={`text-[11px] font-bold px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-all ${isJoined
              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
              : "bg-accent/20 text-accent hover:bg-accent/30"
            }`}
        >
          {isJoined ? "Leave" : "Join"}
        </button>
      </div>

      {/* Participant list */}
      {participants.length > 0 && (
        <div className="ml-5 mt-0.5 space-y-px">
          {participants.map((p) => {
            const identity = p.userId?._id?.toString() || p.userId?.toString();
            const name = p.userId?.name || identity;
            const avatar = p.userId?.avatar || "";
            const isSpeaking = activeSpeakers?.has(identity);
            const isMe = identity === user?._id;

            return (
              <div
                key={p.userId?._id || p.userId}
                className="flex items-center gap-2 px-1 py-0.5 rounded"
              >
                {/* Avatar */}
                <div
                  className={`w-5 h-5 rounded-full overflow-hidden shrink-0 transition-all ${isSpeaking
                      ? "ring-2 ring-green-400"
                      : "ring-1 ring-white/10"
                    }`}
                >
                  {avatar ? (
                    <Image
                      src={avatar}
                      alt={name}
                      width={20}
                      height={20}
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-accent/30 flex items-center justify-center text-[9px] font-bold text-ivory">
                      {name?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>

                <span className="text-[11px] text-gray-400 truncate flex-1">
                  {isMe ? `${name} (you)` : name}
                </span>

                {/* Speaking bars */}
                {isSpeaking && (
                  <span className="flex gap-px items-end h-3 shrink-0">
                    <span
                      className="w-0.5 bg-green-400 rounded-full animate-[soundbar_0.6s_ease-in-out_infinite]"
                      style={{ height: "40%", animationDelay: "0ms" }}
                    />
                    <span
                      className="w-0.5 bg-green-400 rounded-full animate-[soundbar_0.6s_ease-in-out_infinite]"
                      style={{ height: "100%", animationDelay: "100ms" }}
                    />
                    <span
                      className="w-0.5 bg-green-400 rounded-full animate-[soundbar_0.6s_ease-in-out_infinite]"
                      style={{ height: "60%", animationDelay: "200ms" }}
                    />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
