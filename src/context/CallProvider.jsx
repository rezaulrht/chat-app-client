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
    setActiveCall(callData);
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
    if (incomingCall) {
      setActiveCall(incomingCall);
      setIncomingCall(null);
      setIsMinimized(false);
    }
  }, [incomingCall]);

  const declineCall = useCallback(() => setIncomingCall(null), []);
  const minimizeCall = useCallback(() => setIsMinimized(true), []);
  const maximizeCall = useCallback(() => setIsMinimized(false), []);

  // Register call socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleIncoming = (data) => {
      if (!activeCall) setIncomingCall(data);
    };

    const handleEnded = () => {
      setActiveCall(null);
      setIncomingCall(null);
      setIsMinimized(false);
    };

    socket.on("call:incoming", handleIncoming);
    socket.on("call:ended", handleEnded);

    return () => {
      socket.off("call:incoming", handleIncoming);
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
