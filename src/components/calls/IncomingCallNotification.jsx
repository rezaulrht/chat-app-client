"use client";

import React, { useEffect, useRef } from "react";
import { Phone, PhoneOff, Video } from "lucide-react";
import { useCall } from "@/hooks/useCall";
import Image from "next/image";

export default function IncomingCallNotification() {
  const { incomingCall, acceptCall, declineCall } = useCall();
  const audioRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!incomingCall) return;

    audioRef.current?.play().catch((err) => console.log("Ringtone play failed:", err));

    // Auto-dismiss after 30 seconds
    timeoutRef.current = setTimeout(() => {
      declineCall();
    }, 30000);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      clearTimeout(timeoutRef.current);
    };
  }, [incomingCall, declineCall]);

  if (!incomingCall) return null;

  const { initiator, callType } = incomingCall;

  const handleAccept = () => {
    audioRef.current?.pause();
    acceptCall();
  };

  const handleDecline = () => {
    audioRef.current?.pause();
    declineCall();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-slate-surface rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-700">
                {initiator.avatar ? (
                  <Image src={initiator.avatar} alt={initiator.name} width={96} height={96} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold">
                    {initiator.name?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-accent rounded-full flex items-center justify-center animate-pulse">
                {callType === "video" ? (
                  <Video className="w-4 h-4" />
                ) : (
                  <Phone className="w-4 h-4" />
                )}
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-xl font-semibold text-ivory">{initiator.name}</h3>
              <p className="text-sm text-gray-400">Incoming {callType} call...</p>
            </div>

            <div className="flex gap-4 mt-4">
              <button
                onClick={handleDecline}
                className="w-14 h-14 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
              <button
                onClick={handleAccept}
                className="w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition"
              >
                <Phone className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <audio ref={audioRef} src="/sounds/ringtone.mp3" loop autoPlay />
    </>
  );
}
