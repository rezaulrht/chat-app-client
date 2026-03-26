"use client";
import { SocketProvider } from "@/context/SocketProvider";
import { AppShellProvider } from "@/components/app-shell/AppShellContext";
import AppTopBar from "@/components/app-shell/AppTopBar";
import MobileBottomNav from "@/components/ChatDashboard/MobileBottomNav";

export default function AppLayout({ children }) {
  return (
    <AppShellProvider>
      <SocketProvider>
        <div className="flex flex-col h-screen overflow-hidden bg-obsidian">
          <AppTopBar />
          <div className="flex-1 min-h-0 overflow-hidden pb-16 xl:pb-0">
            {children}
          </div>
          <MobileBottomNav />
        </div>
      </SocketProvider>
    </AppShellProvider>
  );
}
