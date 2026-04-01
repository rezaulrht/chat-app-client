"use client";
import { AppShellProvider } from "@/components/app-shell/AppShellContext";
import AppTopBar from "@/components/app-shell/AppTopBar";
import MobileBottomNav from "@/components/ChatDashboard/MobileBottomNav";

export default function AppLayout({ children }) {
  return (
    <AppShellProvider>
      <div className="flex flex-col h-screen overflow-hidden bg-obsidian">
        <AppTopBar />
        <div className="flex-1 min-h-0 overflow-hidden">{children}</div>
        <MobileBottomNav />
      </div>
    </AppShellProvider>
  );
}
