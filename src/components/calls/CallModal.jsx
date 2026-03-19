"use client";

import React, { useEffect, useState } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Minimize2 } from "lucide-react";
import { useCall } from "@/hooks/useCall";
import { useLiveKit } from "@/hooks/useLiveKit";
import { useSocket } from "@/hooks/useSocket";
import useAuth from "@/hooks/useAuth";

export default function CallModal() {
  const { activeCall, endCall, minimizeCall, isMinimized } = useCall();
  const { socket } = useSocket();
  const { user } = useAuth();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(activeCall?.callType === "audio");

  const { room, isConnected, connect, disconnect, participants } = useLiveKit(
    activeCall?.roomName,
    user?._id
  );

  useEffect(() => {
    if (activeCall && !isConnected) connect();
  }, [activeCall, isConnected, connect]);

  const handleEndCall = async () => {
    socket?.emit("call:ended", { callId: activeCall.callId });
    await disconnect();
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

  if (!activeCall || isMinimized) return null;

  return (
    <div className="fixed inset-0 bg-obsidian z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-slate-surface">
        <h2 className="text-lg font-semibold">
          {activeCall.callType === "video" ? "Video" : "Audio"} Call
        </h2>
        <button onClick={minimizeCall} className="p-2 hover:bg-slate-700 rounded">
          <Minimize2 className="w-5 h-5" />
        </button>
      </div>

      {/* Participants Area */}
      <div className="flex-1 relative bg-deep">
        <div
          className={`absolute inset-0 p-4 ${
            participants.length > 1 ? "grid grid-cols-2 gap-2" : "flex items-center justify-center"
          }`}
        >
          {participants.length === 0 ? (
            <div className="text-gray-400">
              <p>Waiting for others to join...</p>
            </div>
          ) : (
            participants.slice(0, 9).map((participant) => (
              <div
                key={participant.sid}
                className="relative bg-slate-700 rounded-lg overflow-hidden flex items-center justify-center min-h-32"
              >
                <div className="w-20 h-20 rounded-full bg-slate-600 flex items-center justify-center text-3xl font-bold text-ivory">
                  {participant.identity?.[0]?.toUpperCase()}
                </div>
                <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs">
                  {participant.identity}
                </div>
              </div>
            ))
          )}

          {participants.length > 9 && (
            <div className="absolute top-4 right-4 bg-black/70 px-3 py-1 rounded text-sm">
              +{participants.length - 9} more
            </div>
          )}
        </div>

        {/* Local indicator (PiP) */}
        <div className="absolute bottom-4 right-4 w-48 h-36 bg-slate-800 rounded-lg overflow-hidden shadow-lg flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-accent/30 flex items-center justify-center text-2xl font-bold text-ivory">
            {user?.name?.[0]?.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-slate-surface p-6 flex justify-center gap-4">
        <button
          onClick={toggleMute}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition ${
            isMuted ? "bg-red-500 hover:bg-red-600" : "bg-slate-700 hover:bg-slate-600"
          }`}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        {activeCall.callType === "video" && (
          <button
            onClick={toggleVideo}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition ${
              isVideoOff ? "bg-red-500 hover:bg-red-600" : "bg-slate-700 hover:bg-slate-600"
            }`}
          >
            {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
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
