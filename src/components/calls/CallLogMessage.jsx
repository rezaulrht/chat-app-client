"use client";

import React from "react";
import { Phone, Video, PhoneMissed } from "lucide-react";

export default function CallLogMessage({ callLog, isMe }) {
  const { callType, duration, status } = callLog;

  const formatDuration = (seconds) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getIcon = () => {
    if (status === "missed" || status === "declined") return <PhoneMissed className="w-4 h-4" />;
    return callType === "video" ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />;
  };

  const getMessage = () => {
    if (status === "missed") return isMe ? "Missed call" : "You missed a call";
    if (status === "declined") return isMe ? "Call declined" : "You declined the call";
    return `${callType === "video" ? "Video" : "Audio"} call${duration ? ` · ${formatDuration(duration)}` : ""}`;
  };

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
        status === "ended" ? "bg-slate-surface text-gray-300" : "bg-red-500/10 text-red-400"
      }`}
    >
      {getIcon()}
      <span>{getMessage()}</span>
    </div>
  );
}
