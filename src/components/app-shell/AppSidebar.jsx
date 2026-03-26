"use client";
import React from "react";

export default function AppSidebar({ label, children, className = "", style = {} }) {
  return (
    <div
      className={`hidden md:flex flex-col shrink-0 h-full border-r border-white/[0.06] bg-deep overflow-hidden ${className}`}
      style={{ width: "var(--sidebar-width, 320px)", ...style }}
    >
      {/* Section label */}
      {label && (
        <div className="px-4 py-3 border-b border-white/[0.04] shrink-0">
          <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-ivory/20">
            {label}
          </p>
        </div>
      )}

      {/* Content slot */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
