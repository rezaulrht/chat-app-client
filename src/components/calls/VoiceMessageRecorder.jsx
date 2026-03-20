"use client";

import React, { useState, useEffect } from "react";
import { Mic, X, Send, Loader2 } from "lucide-react";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import api from "@/app/api/Axios";
import toast from "react-hot-toast";

export default function VoiceMessageRecorder({ onSend }) {
  const [uploading, setUploading] = useState(false);
  const { isRecording, duration, audioBlob, startRecording, stopRecording, cancelRecording } =
    useVoiceRecorder();

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSend = async () => {
    if (!audioBlob) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "voice-message.webm");

      const { data } = await api.post("/api/calls/voice-message", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onSend({
        url: data.url,
        publicId: data.publicId,
        resourceType: data.resourceType,
        format: data.format,
        name: data.name,
        size: data.size,
      });

      cancelRecording();
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to send voice message");
    } finally {
      setUploading(false);
    }
  };

  if (isRecording) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 rounded-lg">
        <div className="flex items-center gap-2 flex-1">
          <Mic className="w-5 h-5 text-red-500 animate-pulse" />
          <span className="text-sm font-mono text-red-500">{formatDuration(duration)}</span>
          <div className="flex-1 h-1 bg-red-500/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 transition-all"
              style={{ width: `${(duration / 120) * 100}%` }}
            />
          </div>
        </div>
        <button onClick={cancelRecording} className="p-1 hover:bg-slate-700 rounded" title="Cancel">
          <X className="w-5 h-5" />
        </button>
        <button
          onClick={stopRecording}
          className="p-1 bg-accent hover:bg-accent/80 rounded"
          title="Stop & Preview"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    );
  }

  if (audioBlob) {
    return (
      <AudioBlobPreview audioBlob={audioBlob} uploading={uploading} onCancel={cancelRecording} onSend={handleSend} />
    );
  }

  return (
    <button
      onClick={startRecording}
      className="p-2 hover:bg-slate-surface rounded-lg transition"
      title="Record voice message"
    >
      <Mic className="w-5 h-5" />
    </button>
  );
}

function AudioBlobPreview({ audioBlob, uploading, onCancel, onSend }) {
  const [objectUrl, setObjectUrl] = useState(null);

  useEffect(() => {
    const url = URL.createObjectURL(audioBlob);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [audioBlob]);

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-slate-surface rounded-lg">
      <audio src={objectUrl} controls className="flex-1" />
      <button
        onClick={onCancel}
        className="p-1 hover:bg-slate-700 rounded"
        disabled={uploading}
      >
        <X className="w-5 h-5" />
      </button>
      <button
        onClick={onSend}
        className="p-1 bg-accent hover:bg-accent/80 rounded disabled:opacity-50"
        disabled={uploading}
      >
        {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
      </button>
    </div>
  );
}
