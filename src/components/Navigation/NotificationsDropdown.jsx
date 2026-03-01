"use client";
import React, { useState } from "react";
import Image from "next/image";
import {
  Settings,
  CheckCircle2,
  AtSign,
  MessageCircle,
  AlertTriangle,
  Heart,
  UserPlus,
} from "lucide-react";

export default function NotificationsDropdown({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("all");

  if (!isOpen) return null;

  return (
    <div className="absolute top-full right-0 mt-4 w-105 bg-[#1e293b]/70 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50 flex flex-col animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right">
      {/* Header & Tabs */}
      <div className="flex flex-col border-b border-white/5 bg-[#111418]/90">
        <div className="flex items-center justify-between px-5 py-4">
          <h3 className="text-white font-bold text-lg">Notifications</h3>
          <div className="flex items-center gap-2">
            <button
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
              title="Settings"
            >
              <Settings size={20} />
            </button>
            <button
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
              title="Mark all as read"
            >
              <CheckCircle2 size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-5 gap-6">
          <button
            onClick={() => setActiveTab("all")}
            className={`pb-3 border-b-2 text-sm font-medium transition-colors ${activeTab === "all" ? "border-primary text-white" : "border-transparent text-slate-400 hover:text-slate-200"}`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab("unread")}
            className={`pb-3 border-b-2 text-sm font-medium transition-colors relative ${activeTab === "unread" ? "border-primary text-white" : "border-transparent text-slate-400 hover:text-slate-200"}`}
          >
            Unread
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold">
              3
            </span>
          </button>
          <button
            onClick={() => setActiveTab("mentions")}
            className={`pb-3 border-b-2 text-sm font-medium transition-colors ${activeTab === "mentions" ? "border-primary text-white" : "border-transparent text-slate-400 hover:text-slate-200"}`}
          >
            Mentions
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="flex flex-col max-h-[500px] overflow-y-auto scrollbar-hide bg-[#111418]/80">
        {/* Mention Notification (Highlighted) */}
        <div className="group flex gap-4 p-4 border-l-4 border-l-purple-500 bg-purple-500/5 hover:bg-purple-500/10 transition-colors cursor-pointer relative border-b border-white/5">
          <div className="shrink-0 relative">
            <div
              className="w-10 h-10 rounded-full bg-slate-700 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBrlc6KejjxUAjxHiWaxkdQ7xPOzIoXa_1Q4luHSM7HVrVeSRHJwN3BWjnbHY_F4bKISxm01IXrldhOXVkWUEgKsLJ-QsT9i4eB3lMYjcV67KLqyIIOyNvEBzQLAFgrVMq5hrQjdCRD3YyzKH1UjpmnYgWumA7_QWvEB1xo2Q6d1wwJF5R9hs-NItDholifS36Nj_edLllcooWYsiYypvt3e84pyrPUl18toY_cGg-SxLyOzvAdC5U6VOAqlTpFSsdhU56jKjSX3qg')",
              }}
            ></div>
            <div className="absolute -bottom-1 -right-1 bg-[#111418] rounded-full p-0.5">
              <div className="bg-purple-500 rounded-full w-4 h-4 flex items-center justify-center">
                <AtSign size={10} className="text-white" />
              </div>
            </div>
          </div>
          <div className="flex flex-col flex-1 gap-1">
            <div className="flex justify-between items-start w-full">
              <p className="text-sm text-slate-200 font-medium leading-tight">
                <span className="text-white font-bold">Sarah Chen</span>{" "}
                mentioned you in{" "}
                <span className="text-purple-400 font-medium">
                  React Optimization
                </span>
              </p>
              <span className="text-xs text-slate-500 whitespace-nowrap ml-2">
                2m ago
              </span>
            </div>
            <p className="text-sm text-slate-400 line-clamp-2 mt-1">
              "Can you take a look at the rendering logic in the new component?
              I think we might have a leak."
            </p>

            <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="px-3 py-1 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-medium transition-colors">
                Reply
              </button>
              <button className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-colors">
                Mark as read
              </button>
            </div>
          </div>
          {/* Unread Dot */}
          <div className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full"></div>
        </div>

        {/* Comment Notification */}
        <div className="group flex gap-4 p-4 hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5">
          <div className="shrink-0 relative">
            <div
              className="w-10 h-10 rounded-full bg-slate-700 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC7umexvRNtIDRg6anwacoZCpn1vp5XkjuJ6RWYC8a3YiXdGJBqfHoxQRSRp1LzPTdLkJ_jJ1pZuuk_2DB8DgYiuqTKJ-q1TRFHTdFraHZ7k2e3kKLMgI-bKJGdtq-_PL_UAj1XTn8uuuSBuSQcazjRC5LKBnNMMzAZ1CUbbbVIgx8B6MxiGQ7o0Yyfu9qfk2M-z5UPjTDpl3phWkZzXrb_Z9Fb_JUESb-1rUhlyQIjD3sPdRxOSVtEQ-hvjP5sEZ6eiANbPZZMTVk')",
              }}
            ></div>
            <div className="absolute -bottom-1 -right-1 bg-[#111418] rounded-full p-0.5">
              <div className="bg-blue-500 rounded-full w-4 h-4 flex items-center justify-center">
                <MessageCircle size={10} className="text-white fill-white" />
              </div>
            </div>
          </div>
          <div className="flex flex-col flex-1 gap-1">
            <div className="flex justify-between items-start w-full">
              <p className="text-sm text-slate-200 leading-tight">
                <span className="text-white font-bold">Alex Rivera</span>{" "}
                commented on your PR{" "}
                <span className="text-blue-400 font-medium">Quantum UI</span>
              </p>
              <span className="text-xs text-slate-500 whitespace-nowrap ml-2">
                15m ago
              </span>
            </div>
            <p className="text-sm text-slate-400 line-clamp-1 italic mt-1">
              "Looks good, but check the variable naming convention."
            </p>
          </div>
          <div className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full"></div>
        </div>

        {/* System Notification */}
        <div className="group flex gap-4 p-4 hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5">
          <div className="shrink-0 relative">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/10">
              <AlertTriangle size={20} className="text-orange-400" />
            </div>
          </div>
          <div className="flex flex-col flex-1 gap-1">
            <div className="flex justify-between items-start w-full">
              <p className="text-sm text-slate-200 font-medium">
                System Update Scheduled
              </p>
              <span className="text-xs text-slate-500 whitespace-nowrap ml-2">
                1h ago
              </span>
            </div>
            <p className="text-sm text-slate-400 line-clamp-2 mt-1">
              ConvoX will be down for maintenance on Saturday at 2 AM UTC for
              database migration.
            </p>
          </div>
          <div className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full"></div>
        </div>

        {/* Like Notification */}
        <div className="group flex gap-4 p-4 hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5 bg-[#111418]/60">
          <div className="shrink-0 relative">
            <div
              className="w-10 h-10 rounded-full bg-slate-700 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAbJmdDdANqSsa7DFzhGQLYZX3MPr13OcSIWatcOpzn0NX5TMNJv_7Zgu8PtEcuHkfLwEVPUM_88F8s6LzBQln32eJjDClqTqQMcou1WeWZ2-zu6yDP2suJ2BjvRgVQt0idtaeRitWo-wSQfbaYFgL3PECB73zmAMlDjOw3Fb4XDJJ7yzL3VPN5cZcw4a9IrwnNc0XKMLmXQmNMC-8gE7-3wUV2LxPsqjwmATKGohlL-_5jCrt5Id5nPFX-WIEeEDyi1HuuPkk4A-4')",
              }}
            ></div>
            <div className="absolute -bottom-1 -right-1 bg-[#111418] rounded-full p-0.5">
              <div className="bg-red-500 rounded-full w-4 h-4 flex items-center justify-center">
                <Heart size={10} className="text-white fill-white" />
              </div>
            </div>
          </div>
          <div className="flex flex-col flex-1 gap-1">
            <div className="flex justify-between items-start w-full">
              <p className="text-sm text-slate-400">
                <span className="text-slate-200 font-bold">Marcus Johnson</span>{" "}
                liked your post
              </p>
              <span className="text-xs text-slate-600 whitespace-nowrap ml-2">
                3h ago
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg bg-white/5 border border-white/5">
              <div className="w-1 bg-slate-500 h-full min-h-[1.5rem] rounded-full"></div>
              <p className="text-xs text-slate-400 line-clamp-1">
                "Why I switched from VS Code to Neovim in 2024..."
              </p>
            </div>
          </div>
        </div>

        {/* Follow Notification */}
        <div className="group flex gap-4 p-4 hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5 bg-[#111418]/60">
          <div className="shrink-0 relative">
            <div
              className="w-10 h-10 rounded-full bg-slate-700 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC3omO1guy9lsqoUZegM1Zxnpas_rjM_z-H59Lfaz0PrOheuBhDlv6P6tIMhNSmqH5vLx9J0MwScPQSH6ri-0vEtqWd3fRiTspQKUK5i_BzPxwhISvYQev8Q4ExY5T6eEonz6tRT_nqraNM7ndbtCG8qG0YXkDHb6WYr-ivas4UGzeIRjDMzxoUvfhBR2sOyLLasIS0qTxXLOR2j0xVJh7B5tvMZ8ZAWsEqUwwTAycVM1Juy9Ou09PoT5_1RvxaVgSjdiHH5u8YREY')",
              }}
            ></div>
            <div className="absolute -bottom-1 -right-1 bg-[#111418] rounded-full p-0.5">
              <div className="bg-green-500 rounded-full w-4 h-4 flex items-center justify-center">
                <UserPlus size={10} className="text-white" />
              </div>
            </div>
          </div>
          <div className="flex flex-col flex-1 gap-1">
            <div className="flex justify-between items-start w-full">
              <p className="text-sm text-slate-400">
                <span className="text-slate-200 font-bold">Emily Davis</span>{" "}
                started following you
              </p>
              <span className="text-xs text-slate-600 whitespace-nowrap ml-2">
                5h ago
              </span>
            </div>
            <button className="mt-2 w-fit px-3 py-1.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition-colors">
              Follow back
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#111418] border-t border-white/5 p-2 text-center">
        <button className="block w-full py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors">
          View all notifications
        </button>
      </div>
    </div>
  );
}
