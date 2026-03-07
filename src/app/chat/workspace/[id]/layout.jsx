"use client";

import { useParams } from "next/navigation";

export default function WorkspaceLayout({ children }) {
  const { id } = useParams();

  return (
    <div className="flex h-full w-full">
      {/* ModuleSidebar placeholder — Member 6 will provide the real component */}
      <aside className="w-60 bg-[#0f1318] border-r border-white/5 flex flex-col shrink-0 h-full overflow-hidden">
        {/* Workspace Header */}
        <div className="h-12 px-4 flex items-center justify-between shadow-sm border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors group">
          <h2 className="text-white font-bold text-[15px] truncate">
            Workspace
          </h2>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-slate-500 group-hover:text-white transition-colors"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>

        {/* Module list placeholder */}
        <div className="flex-1 overflow-y-auto scrollbar-hide py-4 px-3">
          <p className="text-slate-600 text-xs text-center mt-8">
            Modules will appear here
          </p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 h-full">{children}</div>
    </div>
  );
}
