"use client";
import React from "react";
import Image from "next/image";
import { X, FileText, Image as ImageIcon, Download } from "lucide-react";

export default function RightSidebar() {
  return (
    <aside className="w-64 bg-background-dark border-l border-white/5 flex-none hidden lg:flex flex-col">
      {/* Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-white/5">
        <h3 className="font-bold text-white text-base">Details</h3>
        <button className="text-text-secondary-dark hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        {/* Shared Files Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-text-secondary-dark uppercase">
              Shared Files
            </h4>
            <span className="text-[10px] text-primary hover:underline cursor-pointer">
              View All
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {/* File 1 */}
            <div className="flex items-center gap-3 p-2 rounded bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
              <div className="w-8 h-8 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center flex-none">
                <FileText size={18} />
              </div>
              <div className="overflow-hidden">
                <div className="text-sm text-white truncate font-medium group-hover:text-primary transition-colors">
                  Auth_Spec_v2.pdf
                </div>
                <div className="text-[10px] text-text-secondary-dark">
                  2.4 MB • Today
                </div>
              </div>
              <Download
                size={18}
                className="text-text-secondary-dark ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>

            {/* File 2 */}
            <div className="flex items-center gap-3 p-2 rounded bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
              <div className="w-8 h-8 rounded bg-yellow-500/20 text-yellow-400 flex items-center justify-center flex-none">
                <ImageIcon size={18} />
              </div>
              <div className="overflow-hidden">
                <div className="text-sm text-white truncate font-medium group-hover:text-primary transition-colors">
                  Mockup_Design.png
                </div>
                <div className="text-[10px] text-text-secondary-dark">
                  1.8 MB • Yesterday
                </div>
              </div>
              <Download
                size={18}
                className="text-text-secondary-dark ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
          </div>
        </div>

        {/* Members Section */}
        <div>
          <div className="flex items-center justify-between mb-2 mt-4">
            <h4 className="text-xs font-bold text-text-secondary-dark uppercase">
              Online — 4
            </h4>
          </div>

          {/* Role: Admin */}
          <div className="flex items-center gap-3 py-2 px-1 rounded hover:bg-white/5 cursor-pointer group mb-1">
            <div className="relative w-8 h-8 flex-none">
              <div className="w-8 h-8 rounded-full bg-slate-700"></div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-background-dark rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-red-400 group-hover:text-red-300 truncate">
                AdminUser
              </div>
              <div className="text-[10px] text-text-secondary-dark truncate">
                Playing VS Code
              </div>
            </div>
          </div>

          {/* Role: Moderators */}
          <div className="flex items-center gap-3 py-2 px-1 rounded hover:bg-white/5 cursor-pointer group mb-1">
            <div className="relative w-8 h-8 flex-none">
              <div className="w-8 h-8 rounded-full bg-slate-700"></div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-background-dark rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-purple-400 group-hover:text-purple-300 truncate">
                Sarah Jenkins
              </div>
              <div className="text-[10px] text-text-secondary-dark truncate">
                Listening to Spotify
              </div>
            </div>
          </div>

          {/* Role: Students */}
          <div className="flex items-center gap-3 py-2 px-1 rounded hover:bg-white/5 cursor-pointer group mb-1">
            <div className="relative w-8 h-8 flex-none">
              <div className="w-8 h-8 rounded-full bg-slate-700"></div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-background-dark rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-white group-hover:text-primary truncate">
                Alex Chen
              </div>
              <div className="text-[10px] text-text-secondary-dark truncate">
                Idle
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-2 mt-6">
            <h4 className="text-xs font-bold text-text-secondary-dark uppercase">
              Offline — 12
            </h4>
          </div>

          <div className="flex items-center gap-3 py-2 px-1 rounded hover:bg-white/5 cursor-pointer group opacity-50 mb-1">
            <div className="relative w-8 h-8 flex-none">
              <div className="w-8 h-8 rounded-full bg-slate-700 grayscale"></div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-background-dark rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-gray-500 rounded-full border border-background-dark"></div>
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-white group-hover:text-primary truncate">
                Jessica Lee
              </div>
              <div className="text-[10px] text-text-secondary-dark truncate">
                Offline
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
