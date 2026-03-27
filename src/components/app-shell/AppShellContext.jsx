"use client";
import { createContext, useContext, useState } from "react";

const AppShellContext = createContext(null);

export function AppShellProvider({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // backNav: { label: string, href: string } | null
  // Set by deep pages (e.g. module chat) to show a back button in AppTopBar on mobile
  const [backNav, setBackNav] = useState(null);
  return (
    <AppShellContext.Provider value={{ isSidebarOpen, setIsSidebarOpen, backNav, setBackNav }}>
      {children}
    </AppShellContext.Provider>
  );
}

export function useAppShell() {
  const ctx = useContext(AppShellContext);
  if (!ctx) throw new Error("useAppShell must be used inside AppShellProvider");
  return ctx;
}
