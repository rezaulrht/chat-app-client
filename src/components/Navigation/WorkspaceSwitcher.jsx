"use client";
import React from "react";
import Image from "next/image";
import {
  MessageSquare,
  Add,
  Explore,
  SportsEsports,
  Music,
} from "lucide-react";

export default function WorkspaceSwitcher() {
  return (
    <nav className="w-18 flex-none flex flex-col items-center py-4 gap-4 bg-[#0b1219] border-r border-white/5 z-20 h-full overflow-y-auto scrollbar-hide">
      {/* Home / DMs Button */}
      <div className="relative group cursor-pointer flex justify-center w-full">
        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary to-blue-600 flex items-center justify-center text-white shadow-lg shadow-primary/20 transition-transform hover:scale-105">
          <MessageSquare size={24} className="fill-current text-white" />
        </div>
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
          Direct Messages
        </div>
      </div>

      {/* Separator */}
      <div className="w-8 h-0.5 bg-white/10 rounded-full my-1"></div>

      {/* Example Server 1 */}
      <div className="relative group cursor-pointer flex w-full justify-center">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full hidden group-hover:block transition-all"></div>
        <div className="w-12 h-12 rounded-[24px] group-hover:rounded-xl bg-surface-dark hover:bg-primary transition-all duration-300 flex items-center justify-center overflow-hidden border border-white/5 group-hover:border-transparent relative">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTgYn5VGCU4KyKv_q_U61RovQLy3qDwsLkZ1OJFgZLVutDwrRv4662fi-MA5cga_4pjFWJUsK4WEVTnh-N39teeJY5haCxiLggMV1BNJvrQMotgwyKUPN4bOgGgRnGyr4XftTj50ev7d_90583AYaz95LIe6mreaz-61xfwSesvrjOmm1j-1zoisEwrB5f3WFUiQjqiyunt5JMgCFfI9zZwM5MLmn7eIARSB3Z_UQXBCRo4fBbetP148A4PvC-ZhZCYQ1zyQkT2TM"
            alt="Dev Community"
            fill
            className="object-cover opacity-80 group-hover:opacity-100"
            unoptimized
          />
        </div>
        <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
          Dev Community
        </div>
      </div>

      {/* Example Server 2 (Active) */}
      <div className="relative group cursor-pointer flex w-full justify-center">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full block transition-all"></div>
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-primary/10">
          <span className="font-bold text-lg">U</span>
        </div>
        <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
          University
        </div>
      </div>

      {/* Example Server 3 */}
      <div className="relative group cursor-pointer flex w-full justify-center">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full hidden group-hover:block transition-all"></div>
        <div className="w-12 h-12 rounded-[24px] group-hover:rounded-xl bg-surface-dark hover:bg-green-600 transition-all duration-300 flex items-center justify-center text-emerald-400 group-hover:text-white border border-white/5">
          <SportsEsports size={24} />
        </div>
        <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
          Gaming Lounge
        </div>
      </div>

      {/* Example Server 4 */}
      <div className="relative group cursor-pointer flex w-full justify-center">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full hidden group-hover:block transition-all"></div>
        <div className="w-12 h-12 rounded-[24px] group-hover:rounded-xl bg-surface-dark hover:bg-purple-600 transition-all duration-300 flex items-center justify-center text-purple-400 group-hover:text-white border border-white/5">
          <Music size={24} />
        </div>
        <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
          Music Jam
        </div>
      </div>

      <div className="flex-1"></div>

      {/* Add Server */}
      <div className="relative group cursor-pointer flex w-full justify-center">
        <div className="w-12 h-12 rounded-[24px] group-hover:rounded-xl bg-surface-dark hover:bg-green-500 text-green-500 hover:text-white transition-all duration-300 flex items-center justify-center border border-white/5">
          <Add size={24} />
        </div>
        <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
          Add Server
        </div>
      </div>

      {/* Explore Servers */}
      <div className="relative group cursor-pointer flex w-full justify-center">
        <div className="w-12 h-12 rounded-[24px] group-hover:rounded-xl bg-surface-dark hover:bg-primary text-slate-500 hover:text-white transition-all duration-300 flex items-center justify-center border border-white/5">
          <Explore size={24} />
        </div>
        <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
          Explore Servers
        </div>
      </div>
    </nav>
  );
}
