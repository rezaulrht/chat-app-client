"use client";

import React from "react";
import { SocketProvider } from "@/context/SocketProvider";
import WorkspaceSwitcher from "@/components/Navigation/WorkspaceSwitcher";

export default function ChatLayout({ children }) {
  return (
    <SocketProvider>
      <div className="h-screen w-full bg-background-dark overflow-hidden flex flex-row">
        <WorkspaceSwitcher />
        <div className="flex-1 flex flex-col min-w-0">{children}</div>
      </div>
    </SocketProvider>
  );
}
