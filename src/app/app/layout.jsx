"use client";
import { SocketProvider } from "@/context/SocketProvider";
import { AppShellProvider } from "@/components/app-shell/AppShellContext";
import AppTopBar from "@/components/app-shell/AppTopBar";

export default function AppLayout({ children }) {
  return (
    <AppShellProvider>
      <SocketProvider>
        <div className="flex flex-col h-screen overflow-hidden bg-obsidian">
          <AppTopBar />
          <div className="flex-1 min-h-0 overflow-hidden">
            {children}
          </div>
        </div>
      </SocketProvider>
    </AppShellProvider>
  );
}
