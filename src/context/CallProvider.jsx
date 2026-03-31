"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { CallContext } from "./CallContext";
import { useSocket } from "@/hooks/useSocket";
import { disconnectRoom } from "@/lib/livekitRoom";

export const CallProvider = ({ children }) => {
  const { socket } = useSocket() || {};
  const [activeCall, setActiveCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const activeCallRef = useRef(activeCall);
  useEffect(() => {
    activeCallRef.current = activeCall;
  }, [activeCall]);

  const startCall = useCallback((callData) => {
    // Voice channels connect immediately; regular calls wait for acceptance
    setActiveCall({
      ...callData,
      pending: callData.isVoiceChannel ? false : true,
    });
    setIsMinimized(false);
  }, []);

  const endCall = useCallback(() => {
    setActiveCall(null);
    setIncomingCall(null);
    setIsMinimized(false);
  }, []);

  const receiveIncomingCall = useCallback(
    (callData) => {
      if (activeCall) return; // already in a call
      setIncomingCall(callData);
    },
    [activeCall],
  );

  const acceptCall = useCallback(() => {
    if (incomingCall) {
      socket?.emit("call:accepted", {
        callId: incomingCall.callId?.toString(),
      });
      setActiveCall({ ...incomingCall, pending: false });
      setIncomingCall(null);
      setIsMinimized(false);
    }
  }, [incomingCall, socket]);

  const declineCall = useCallback(() => {
    if (incomingCall) {
      socket?.emit("call:declined", {
        callId: incomingCall.callId?.toString(),
      });
    }
    setIncomingCall(null);
  }, [incomingCall, socket]);
  const minimizeCall = useCallback(() => setIsMinimized(true), []);
  const maximizeCall = useCallback(() => setIsMinimized(false), []);

  // Register call socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleIncoming = (data) => {
      if (!activeCallRef.current) setIncomingCall(data);
    };

    const handleAccepted = ({ callId, roomName, callType }) => {
      // Callee accepted — caller can now connect to LiveKit
      setActiveCall((prev) =>
        prev?.callId?.toString() === callId?.toString()
          ? { ...prev, roomName, callType, pending: false }
          : prev,
      );
    };

    const handleEnded = () => {
      disconnectRoom(); // release mic/camera on the receiving side too
      setActiveCall(null);
      setIncomingCall(null);
      setIsMinimized(false);
    };

    const handleDeclined = ({ callId }) => {
      if (activeCallRef.current?.callId?.toString() === callId?.toString()) {
        setActiveCall(null);
      }
    };

    socket.on("call:incoming", handleIncoming);
    socket.on("call:accepted", handleAccepted);
    socket.on("call:ended", handleEnded);
    socket.on("call:declined", handleDeclined);

    return () => {
      socket.off("call:incoming", handleIncoming);
      socket.off("call:accepted", handleAccepted);
      socket.off("call:ended", handleEnded);
      socket.off("call:declined", handleDeclined);
    };
  }, [socket]);

  return (
    <CallContext.Provider
      value={{
        activeCall,
        incomingCall,
        isMinimized,
        startCall,
        endCall,
        receiveIncomingCall,
        acceptCall,
        declineCall,
        minimizeCall,
        maximizeCall,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};
