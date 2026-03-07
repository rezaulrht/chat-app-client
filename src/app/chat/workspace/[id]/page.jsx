"use client";

import { useParams } from "next/navigation";
import { Hash, Settings, Users } from "lucide-react";

export default function WorkspaceHomePage() {
  const { id } = useParams();

  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#080b0f] text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-teal-normal/10 border border-teal-normal/20 flex items-center justify-center mb-6">
        <Hash size={28} className="text-teal-normal" />
      </div>

      <h1 className="text-2xl font-bold text-white mb-2">
        Welcome to your workspace
      </h1>
      <p className="text-slate-500 text-sm max-w-md mb-8">
        Select a module from the sidebar to start chatting, or explore workspace
        settings.
      </p>

      <div className="flex gap-3">
        <button className="flex items-center gap-2 px-4 py-2.5 bg-surface-dark border border-white/5 rounded-xl text-slate-400 hover:text-white hover:border-white/10 transition-all text-sm">
          <Users size={16} />
          Members
        </button>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-surface-dark border border-white/5 rounded-xl text-slate-400 hover:text-white hover:border-white/10 transition-all text-sm">
          <Settings size={16} />
          Settings
        </button>
      </div>
    </div>
  );
}
