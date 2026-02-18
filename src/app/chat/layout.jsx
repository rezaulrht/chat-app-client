"use client";

import React from "react";
import { SocketProvider } from "@/context/SocketProvider";

export default function ChatLayout({ children }) {
  return (
    <SocketProvider>
      <div className="h-screen w-full bg-background-dark overflow-hidden flex flex-col">
        {children}
      </div>
    </SocketProvider>
  );
}
