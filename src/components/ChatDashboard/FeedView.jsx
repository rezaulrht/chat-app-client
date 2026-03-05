"use client";
import React from "react";
import { Compass } from "lucide-react";

export default function FeedView({ toggleSidebar }) {
  return (
    <main className="flex-1 min-w-0 flex flex-col bg-[#080b0f] relative h-full">
      <header className="h-17 border-b border-white/5 flex justify-between items-center px-5 bg-[#0a0e13]/80 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="md:hidden w-8 h-8 rounded-xl bg-white/4 flex items-center justify-center text-slate-500 hover:text-white transition-colors"
          >
            <Compass size={18} />
          </button>
          <div className="flex items-center gap-2">
            <Compass className="text-teal-normal" size={20} />
            <h2 className="font-bold text-slate-100 text-sm leading-tight">
              Global Feed
            </h2>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col items-center justify-center gap-3 scrollbar-hide">
        <div className="w-16 h-16 rounded-3xl bg-teal-normal/10 border border-teal-normal/20 flex items-center justify-center">
          <Compass size={32} className="text-teal-normal" />
        </div>
        <div className="text-center">
          <h3 className="text-slate-200 text-lg font-bold mb-1">
            Global Feed is under construction
          </h3>
          <p className="text-slate-500 text-sm max-w-sm">
            Check back later to see updates from all across your workspaces and
            communities.
          </p>
        </div>
      </div>
    </main>
  );
}
