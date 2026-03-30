"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Minimize2,
  Phone,
} from "lucide-react";
import { useCall } from "@/hooks/useCall";
import { useLiveKit } from "@/hooks/useLiveKit";
import { useSocket } from "@/hooks/useSocket";
import useAuth from "@/hooks/useAuth";

export default function CallModal() {
  const { activeCall, endCall, minimizeCall, isMinimized } = useCall();
  const { socket } = useSocket();
  const { user } = useAuth();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  useEffect(() => {
    setIsVideoOff(activeCall?.callType === "audio");
  }, [activeCall?.callType]);

  const { room, isConnected, connect, disconnect, participants } = useLiveKit();

  const hasConnected = useRef(false);
  useEffect(() => {
    if (activeCall?.roomName && !activeCall.pending && !hasConnected.current) {
      hasConnected.current = true;
      connect(activeCall.roomName, activeCall.callType);
    }
    if (!activeCall) {
      hasConnected.current = false;
    }
  }, [activeCall?.roomName, activeCall?.pending, connect]);

  const handleEndCall = async () => {
    socket?.emit("call:ended", { callId: activeCall.callId });
    await disconnect();
    hasConnected.current = false;
    endCall();
  };

  const localParticipant = room?.localParticipant;

  const toggleMute = () => {
    localParticipant?.setMicrophoneEnabled(isMuted);
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    if (activeCall?.callType === "video") {
      localParticipant?.setCameraEnabled(isVideoOff);
      setIsVideoOff(!isVideoOff);
    }
  };

  if (!activeCall || isMinimized || activeCall.isVoiceChannel) return null;

  // Always include local user as first tile, then remote participants
  const allTiles = [
    { id: "local", name: user?.name, isLocal: true },
    ...participants.map((p) => ({
      id: p.sid,
      name: p.name || p.identity,
      isLocal: false,
    })),
  ];

  const gridClass =
    allTiles.length === 1
      ? "flex items-center justify-center"
      : allTiles.length <= 4
        ? "grid grid-cols-2 gap-2"
        : "grid grid-cols-3 gap-2";

  return (
    <div className="fixed inset-0 bg-obsidian z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-slate-surface">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">
            {activeCall.callType === "video" ? "Video" : "Audio"} Call
          </h2>
          {activeCall.pending ? (
            <span className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Calling...
            </span>
          ) : isConnected ? (
            <span className="flex items-center gap-1.5 text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              Connected
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-gray-400 bg-white/5 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse" />
              Connecting...
            </span>
          )}
        </div>
        <button
          onClick={minimizeCall}
          className="p-2 hover:bg-slate-700 rounded"
        >
          <Minimize2 className="w-5 h-5" />
        </button>
      </div>

      {/* Participants Area */}
      <div className="flex-1 relative bg-deep overflow-hidden">
        {/* Pending/ringing — waiting for callee to pick up */}
        {activeCall.pending ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center text-4xl font-bold text-ivory animate-pulse">
              {activeCall.initiator?.name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <p className="text-gray-300 text-lg font-medium">
              {activeCall.initiator?.name ?? "Calling..."}
            </p>
            <p className="text-gray-500 text-sm flex items-center gap-2">
              <Phone className="w-4 h-4 animate-bounce" />
              Waiting for them to answer...
            </p>
          </div>
        ) : (
          /* Connected — show all participant tiles including yourself */
          <div className={`absolute inset-0 p-4 ${gridClass}`}>
            {allTiles.slice(0, 9).map((tile) => (
              <div
                key={tile.id}
                className="relative bg-slate-700 rounded-lg overflow-hidden flex items-center justify-center min-h-32"
              >
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-ivory ${
                    tile.isLocal ? "bg-accent/30" : "bg-slate-600"
                  }`}
                >
                  {tile.name?.[0]?.toUpperCase()}
                </div>
                <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs">
                  {tile.name}
                  {tile.isLocal && (
                    <span className="ml-1 text-accent/70">(You)</span>
                  )}
                </div>
                {tile.isLocal && isMuted && (
                  <div className="absolute top-2 right-2 bg-red-500/80 rounded-full p-1">
                    <MicOff className="w-3 h-3" />
                  </div>
                )}
              </div>
            ))}

            {allTiles.length > 9 && (
              <div className="absolute top-4 right-4 bg-black/70 px-3 py-1 rounded text-sm">
                +{allTiles.length - 9} more
              </div>
            )}

            {/* Subtle banner when you're connected but alone */}
            {participants.length === 0 && isConnected && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-gray-400 text-xs px-4 py-2 rounded-full">
                Waiting for others to join...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-slate-surface p-6 flex justify-center gap-4">
        <button
          onClick={toggleMute}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition ${
            isMuted
              ? "bg-red-500 hover:bg-red-600"
              : "bg-slate-700 hover:bg-slate-600"
          }`}
        >
          {isMuted ? (
            <MicOff className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </button>

        {activeCall.callType === "video" && (
          <button
            onClick={toggleVideo}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition ${
              isVideoOff
                ? "bg-red-500 hover:bg-red-600"
                : "bg-slate-700 hover:bg-slate-600"
            }`}
          >
            {isVideoOff ? (
              <VideoOff className="w-6 h-6" />
            ) : (
              <Video className="w-6 h-6" />
            )}
          </button>
        )}

        <button
          onClick={handleEndCall}
          className="w-14 h-14 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
