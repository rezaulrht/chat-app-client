"use client";

import { useState, useCallback } from "react";
import { CallContext } from "./CallContext";

export const CallProvider = ({ children }) => {
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
