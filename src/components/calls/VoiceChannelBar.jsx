"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Mic, MicOff, PhoneOff, Volume2 } from "lucide-react";
import { useCall } from "@/hooks/useCall";
import { useLiveKit } from "@/hooks/useLiveKit";
import { useSocket } from "@/hooks/useSocket";
import useAuth from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { showSweetAlert } from "@/utils/sweetAlert";

function ParticipantAvatar({ name, avatar, size = 24, isSpeaking = false }) {
  const seed = encodeURIComponent(name || "user");
  const fallback = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
  const src = avatar || fallback;
  return (
    <div
      className={`rounded-full overflow-hidden shrink-0 transition-all ${isSpeaking ? "ring-2 ring-green-400" : "ring-1 ring-white/10"
        }`}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        width={size}
        height={size}
        alt={name || "user"}
        className="rounded-full object-cover"
        unoptimized
      />
    </div>
  );
}

export default function VoiceChannelBar() {
  const { activeCall, endCall } = useCall();
  const { socket } = useSocket();
  const { user } = useAuth();
  const [isMuted, setIsMuted] = useState(false);
  const {
    room,
    isConnected,
    participants,
    activeSpeakers,
    connect,
    disconnect,
  } = useLiveKit();
  const hasConnected = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const joinVoiceChannel = async () => {
      if (
        !activeCall?.isVoiceChannel ||
        !activeCall?.roomName ||
        hasConnected.current
      ) {
        return;
      }

      hasConnected.current = true;

      try {
        if (!navigator?.mediaDevices?.getUserMedia) {
          throw new Error("Microphone is not supported in this browser");
        }

        // Request mic access before LiveKit connect so denied permission is handled cleanly.
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        stream.getTracks().forEach((t) => t.stop());

        await connect(activeCall.roomName, "audio", { throwOnError: true });
      } catch (err) {
        if (cancelled) return;

        hasConnected.current = false;

        if (activeCall?.moduleId && activeCall?.workspaceId) {
          socket?.emit("voice_channel:leave", {
            moduleId: activeCall.moduleId,
            workspaceId: activeCall.workspaceId,
          });
        }

        endCall();
        disconnect();

        const denied =
          err?.name === "NotAllowedError" ||
          err?.name === "PermissionDeniedError";
        if (denied) {
          showSweetAlert({
            title: "Microphone Access Required",
            text: "Microphone permission was denied. Please allow microphone access in your browser settings to join voice channels.",
            icon: "error",
          });
        }
      }
    };

    joinVoiceChannel();

    if (!activeCall) {
      hasConnected.current = false;
    }

    return () => {
      cancelled = true;
    };
  }, [
    activeCall,
    activeCall?.roomName,
    activeCall?.isVoiceChannel,
    connect,
    socket,
    endCall,
    disconnect,
  ]);

  const handleDisconnect = () => {
    if (activeCall?.moduleId && activeCall?.workspaceId) {
      socket?.emit("voice_channel:leave", {
        moduleId: activeCall.moduleId,
        workspaceId: activeCall.workspaceId,
      });
    }
    hasConnected.current = false;
    endCall(); // close UI immediately
    disconnect(); // release mic in background
  };

  // Reset mute state whenever we join a new voice channel
  useEffect(() => {
    if (activeCall?.isVoiceChannel) {
      setIsMuted(false);
    }
  }, [activeCall?.roomName]);

  const toggleMute = async () => {
    const lp = room?.localParticipant;
    if (!lp) return;
    const nowMuted = !isMuted;
    try {
      await lp.setMicrophoneEnabled(!nowMuted);
      setIsMuted(nowMuted);
    } catch (err) {
      const denied =
        err?.name === "NotAllowedError" ||
        /permission denied/i.test(err?.message || "");
      toast.error(
        denied
          ? "Microphone permission denied. Please allow mic access."
          : "Unable to toggle microphone",
      );
    }
  };

  if (!activeCall?.isVoiceChannel) return null;

  const localIdentity = room?.localParticipant?.identity ?? "";

  const allParticipants = [
    {
      id: "local",
      name: user?.name || "You",
      avatar: user?.avatar || "",
      isLocal: true,
      identity: localIdentity,
    },
    ...participants.map((p) => {
      let avatar = "";
      try {
        avatar = JSON.parse(p.metadata || "{}").avatar || "";
      } catch { }
      return {
        id: p.sid,
        name: p.name || p.identity,
        avatar,
        isLocal: false,
        identity: p.identity,
      };
    }),
  ];

  return (
    <div className="mx-2 mb-1 rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
      {/* Status header */}
      <div className="px-3 pt-3 pb-2 border-b border-white/[0.04]">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">
            {isConnected ? "Voice Connected" : "Connecting..."}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Volume2 size={11} className="text-ivory/30" />
          <span className="text-[12px] font-display font-semibold text-ivory/70 truncate">
            {activeCall.moduleName || "Voice Channel"}
          </span>
        </div>
      </div>

      {/* Participants */}
      <div className="px-3 py-2 space-y-1.5 max-h-[140px] overflow-y-auto">
        {allParticipants.map((p) => {
          const isSpeaking = activeSpeakers?.has(p.identity);
          return (
            <div key={p.id} className="flex items-center gap-2">
              <ParticipantAvatar
                name={p.name}
                avatar={p.avatar}
                size={22}
                isSpeaking={isSpeaking}
              />
              <span className="text-[11px] font-mono text-ivory/60 truncate flex-1">
                {p.isLocal ? `${p.name} (you)` : p.name}
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
              {p.isLocal && isMuted && (
                <MicOff size={10} className="text-red-400 shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="px-3 py-2.5 border-t border-white/[0.04] flex items-center gap-2">
        <button
          onClick={toggleMute}
          title={isMuted ? "Unmute" : "Mute"}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all border ${isMuted
            ? "bg-red-500/15 border-red-500/30 text-red-400"
            : "bg-white/[0.04] border-white/[0.06] text-ivory/50 hover:text-ivory hover:bg-white/[0.08]"
            }`}
        >
          {isMuted ? <MicOff size={12} /> : <Mic size={12} />}
          {isMuted ? "Muted" : "Mic"}
        </button>

        <button
          onClick={handleDisconnect}
          title="Disconnect"
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 transition-all"
        >
          <PhoneOff size={12} />
        </button>
      </div>
    </div>
  );
}
