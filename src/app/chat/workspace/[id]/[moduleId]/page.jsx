"use client";

import { useParams } from "next/navigation";
import { Hash } from "lucide-react";

export default function ModuleChatPage() {
  const { id, moduleId } = useParams();

  return (
    <div className="flex flex-col h-full bg-[#080b0f]">
      {/* Module Header */}
      <div className="h-12 px-4 flex items-center gap-2 border-b border-white/5 shrink-0">
        <Hash size={20} className="text-slate-500" />
        <h2 className="text-white font-semibold text-sm truncate">
          Module Chat
        </h2>
      </div>

      {/* Placeholder content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mx-auto mb-4">
            <Hash size={24} className="text-slate-600" />
          </div>
          <p className="text-slate-500 text-sm">
            Module chat will be available here
          </p>
          <p className="text-slate-700 text-xs mt-1">
            Member 6 will implement the full chat experience
          </p>
        </div>
      </div>
    </div>
  );
}
