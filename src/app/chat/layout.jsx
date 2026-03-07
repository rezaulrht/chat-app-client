"use client";

import { useState } from "react";
import { SocketProvider } from "@/context/SocketProvider";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import NavigationRail from "@/components/NavigationRail";

export default function ChatLayout({ children }) {
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <SocketProvider>
      <ProtectedRoute>
        <div className="flex h-screen w-full bg-[#080b0f] overflow-hidden font-sans relative">
          {/* Mobile backdrop */}
          {isNavOpen && (
            <div
              className="md:hidden fixed inset-0 bg-black/60 z-30 transition-opacity"
              onClick={() => setIsNavOpen(false)}
            />
          )}

          {/* Navigation Rail */}
          <div
            className={`absolute md:relative z-40 h-full transition-transform duration-300 md:translate-x-0 ${
              isNavOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            }`}
          >
            <NavigationRail onNavigate={() => setIsNavOpen(false)} />
          </div>

          {/* Main content area */}
          <div className="flex-1 min-w-0 h-full">{children}</div>
        </div>
      </ProtectedRoute>
    </SocketProvider>
  );
}
