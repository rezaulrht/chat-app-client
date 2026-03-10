"use client";
import { SocketProvider } from "@/context/SocketProvider";
import { WorkspaceProvider } from "@/context/WorkspaceProvider";

export default function AppLayout({ children }) {
  return (
    <SocketProvider>
      <WorkspaceProvider>{children}</WorkspaceProvider>
    </SocketProvider>
  );
}
