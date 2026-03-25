"use client";

import React, { useState, useEffect } from "react";
import { PhoneOff, Maximize2, Mic, MicOff } from "lucide-react";
import { useCall } from "@/hooks/useCall";
import { useSocket } from "@/hooks/useSocket";

export default function FloatingCallBar() {
  const { activeCall, endCall, maximizeCall, isMinimized } = useCall();
  const { socket } = useSocket();
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!activeCall) return;
    const interval = setInterval(() => setDuration((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [activeCall]);

  if (!activeCall || !isMinimized || activeCall.isVoiceChannel) return null;

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEndCall = () => {
    socket?.emit("call:ended", { callId: activeCall.callId });
    endCall();
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-slate-surface shadow-2xl rounded-full px-4 py-3 flex items-center gap-4 z-50">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-sm font-medium">
          {activeCall.callType === "video" ? "Video" : "Audio"} Call
        </span>
        <span className="text-sm text-gray-400 font-mono">{formatDuration(duration)}</span>
      </div>

      <div className="h-6 w-px bg-slate-700" />

      <div className="flex gap-2">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`p-2 rounded-full transition ${isMuted ? "bg-red-500" : "hover:bg-slate-700"}`}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <button
          onClick={maximizeCall}
          className="p-2 hover:bg-slate-700 rounded-full transition"
          title="Maximize"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        <button
          onClick={handleEndCall}
          className="p-2 bg-red-500 hover:bg-red-600 rounded-full transition"
          title="End call"
        >
          <PhoneOff className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
