"use client";

import React from "react";

export default function ChatLayout({ children }) {
  return (
    <div className="h-screen w-full bg-obsidian overflow-hidden flex flex-col">
      {children}
    </div>
  );
}
