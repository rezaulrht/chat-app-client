"use client";

import { useState, useCallback, useEffect } from "react";
import { CallContext } from "./CallContext";
import { useSocket } from "@/hooks/useSocket";

export const CallProvider = ({ children }) => {
  const { socket } = useSocket() || {};
  const [activeCall, setActiveCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const startCall = useCallback((callData) => {
    // Voice channels connect immediately; regular calls wait for acceptance
    setActiveCall({ ...callData, pending: callData.isVoiceChannel ? false : true });
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
    [activeCall]
  );

  const acceptCall = useCallback(() => {
    console.log("[CallProvider] acceptCall, incomingCall:", incomingCall);
    if (incomingCall) {
      // Emit accepted to server so initiator gets notified and both connect simultaneously
      socket?.emit("call:accepted", { callId: incomingCall.callId });
      setActiveCall(incomingCall); // callee connects immediately (pending=false since it came from call:incoming)
      setIncomingCall(null);
      setIsMinimized(false);
    }
  }, [incomingCall, socket]);

  const declineCall = useCallback(() => setIncomingCall(null), []);
  const minimizeCall = useCallback(() => setIsMinimized(true), []);
  const maximizeCall = useCallback(() => setIsMinimized(false), []);

  // Register call socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleIncoming = (data) => {
      console.log("[CallProvider] call:incoming received", data);
      if (!activeCall) setIncomingCall(data);
    };

    const handleAccepted = ({ callId, roomName, callType }) => {
      // Callee accepted — caller can now connect to LiveKit
      setActiveCall((prev) =>
        prev?.callId === callId ? { ...prev, roomName, callType, pending: false } : prev
      );
    };

    const handleEnded = () => {
      setActiveCall(null);
      setIncomingCall(null);
      setIsMinimized(false);
    };

    socket.on("call:incoming", handleIncoming);
    socket.on("call:accepted", handleAccepted);
    socket.on("call:ended", handleEnded);

    return () => {
      socket.off("call:incoming", handleIncoming);
      socket.off("call:accepted", handleAccepted);
      socket.off("call:ended", handleEnded);
    };
  }, [socket, activeCall]);

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
