"use client";
import React from "react";
import { motion } from "framer-motion";
import { MessageSquare, Check, Send, Hash, Plus } from "lucide-react";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 36 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay },
});

/* ── Mini Chat Mockup ─────────────────────────────────────────────────── */
function ChatMockup() {
  return (
    <div className="w-full rounded-2xl overflow-hidden border border-white/8 bg-[#0d1117] shadow-xl flex h-52">
      {/* Sidebar */}
      <div className="w-44 bg-[#0a0d12] border-r border-white/5 flex flex-col">
        {/* Search */}
        <div className="px-3 pt-3 pb-2">
          <div className="flex items-center gap-1.5 bg-[#161b22] rounded-lg px-2.5 py-1.5">
            <svg
              className="w-3 h-3 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" strokeWidth="2" />
              <path d="m21 21-4.35-4.35" strokeWidth="2" />
            </svg>
            <span className="text-slate-500 text-[10px]">Search</span>
          </div>
        </div>
        {/* Conversations */}
        <div className="flex-1 overflow-hidden">
          {/* Alex Rivera – active */}
          <div className="flex items-center gap-2 px-3 py-2 bg-[#13c8ec]/10 border-l-2 border-[#13c8ec]">
            <div className="relative shrink-0">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-[9px] font-bold text-white">
                AR
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border border-[#0a0d12]" />
            </div>
            <div className="min-w-0">
              <p className="text-white text-[10px] font-semibold truncate">
                Alex Rivera
              </p>
              <p className="text-[#13c8ec] text-[9px] truncate">
                The teal looks great…
              </p>
            </div>
          </div>
          {/* Jordan Smith */}
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-slate-600 shrink-0 flex items-center justify-center text-[9px] font-bold text-slate-300">
              JS
            </div>
            <p className="text-slate-400 text-[10px] truncate">Jordan Smith</p>
          </div>
        </div>
      </div>

      {/* Chat window */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5 bg-[#0d1117]">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-white text-xs font-semibold">Alex Rivera</span>
          <span className="ml-auto text-slate-500">
            <svg
              className="w-3.5 h-3.5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </span>
        </div>

        {/* Messages */}
        <div className="flex-1 flex flex-col justify-end gap-2 px-4 py-3">
          {/* Incoming */}
          <div className="flex items-end gap-1.5 max-w-[80%]">
            <div className="bg-[#161b22] rounded-2xl rounded-bl-sm px-3 py-1.5">
              <p className="text-slate-200 text-[11px]">
                Hey! Love the new components.
              </p>
            </div>
          </div>
          {/* Outgoing */}
          <div className="flex items-end justify-end gap-1.5 max-w-[80%] self-end">
            <div className="bg-[#13c8ec] rounded-2xl rounded-br-sm px-3 py-1.5">
              <p className="text-[#05050A] text-[11px] font-medium">
                Thanks! Let&apos;s ship it by EOD. 🚀
              </p>
            </div>
          </div>
        </div>

        {/* Input */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 bg-[#161b22] rounded-xl px-3 py-2 border border-white/5">
            <span className="text-slate-500 text-[10px] flex-1">
              Type a message...
            </span>
            <div className="w-5 h-5 rounded-lg bg-[#13c8ec] flex items-center justify-center">
              <Send className="w-2.5 h-2.5 text-[#05050A]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Workspace / Channel Mockup ───────────────────────────────────────── */
function WorkspaceMockup() {
  const channels = [
    { name: "frontend-dev", active: true },
    { name: "api-design", active: false },
    { name: "deployments", active: false },
  ];
  return (
    <div className="w-full rounded-2xl overflow-hidden border border-white/8 bg-[#0d1117] shadow-xl mt-5">
      {/* Workspace header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
        <div className="w-9 h-9 rounded-xl bg-[#13c8ec]/20 border border-[#13c8ec]/30 flex items-center justify-center">
          <svg
            className="w-4 h-4 text-[#13c8ec]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth="2" />
            <rect x="14" y="3" width="7" height="7" rx="1" strokeWidth="2" />
            <rect x="3" y="14" width="7" height="7" rx="1" strokeWidth="2" />
            <rect x="14" y="14" width="7" height="7" rx="1" strokeWidth="2" />
          </svg>
        </div>
        <span className="text-slate-300 text-xs font-semibold tracking-widest uppercase">
          Project Phoenix
        </span>
      </div>

      {/* Channels */}
      <div className="px-4 py-3 flex flex-col gap-1">
        {channels.map((ch) => (
          <div
            key={ch.name}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              ch.active
                ? "bg-[#13c8ec]/15 text-[#13c8ec]"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Hash className="w-3.5 h-3.5 shrink-0" />
            <span className="text-sm">{ch.name}</span>
          </div>
        ))}
      </div>

      {/* Add button */}
      <div className="px-4 pb-4">
        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/10 text-slate-500 hover:text-white hover:border-white/25 cursor-pointer transition-colors">
          <Plus className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

/* ── Social Feed Mockup ───────────────────────────────────────────────── */
function FeedMockup() {
  return (
    <div className="w-full rounded-2xl border border-white/8 bg-[#0d1117] shadow-xl mt-5 p-4">
      {/* Post header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
          sc
        </div>
        <div>
          <p className="text-white text-sm font-semibold">sarah_codes</p>
          <p className="text-slate-500 text-xs">2 hours ago</p>
        </div>
      </div>

      {/* Code snippet */}
      <div className="bg-[#161b22] rounded-xl p-3 font-mono text-xs mb-3 border border-white/5">
        <p>
          <span className="text-blue-400">const</span>{" "}
          <span className="text-yellow-300">hub</span>{" "}
          <span className="text-white">= () =&gt; {"{"}</span>
        </p>
        <p className="pl-4">
          <span className="text-blue-400">return</span>{" "}
          <span className="text-green-400">&apos;Ready to build!&apos;</span>
          <span className="text-white">;</span>
        </p>
        <p>
          <span className="text-white">{"}"}</span>
        </p>
      </div>

      {/* Reactions */}
      <div className="flex items-center gap-4 text-slate-400 text-xs">
        <span className="flex items-center gap-1.5 text-[#13c8ec]">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              strokeWidth="2"
            />
          </svg>
          <span>124</span>
        </span>
        <span className="flex items-center gap-1.5">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
              strokeWidth="2"
            />
          </svg>
          <span>18</span>
        </span>
      </div>
    </div>
  );
}

/* ── Main Features Section ────────────────────────────────────────────── */
export default function Features() {
  return (
    <section
      id="features"
      className="relative w-full py-20 bg-[#05050A] text-white overflow-hidden font-sans selection:bg-[#13c8ec]/30"
    >
      {/* Background glow */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#13c8ec]/8 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 flex flex-col gap-6">
        {/* ── Row 1: Unified Chat (text left, mockup right) ── */}
        <motion.div
          {...fadeUp(0)}
          className="grid md:grid-cols-2 gap-0 bg-[#0d1117] border border-white/7 rounded-3xl overflow-hidden"
        >
          {/* Left – text */}
          <div className="flex flex-col justify-center px-10 py-10">
            <div className="w-12 h-12 rounded-2xl bg-[#13c8ec]/15 border border-[#13c8ec]/25 flex items-center justify-center mb-6">
              <MessageSquare className="w-5 h-5 text-[#13c8ec]" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Never lose a conversation
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xs">
              Sleek real-time messaging integrated directly with your
              development workflow. DM mentors or chat with teammates instantly.
            </p>
            <ul className="flex flex-col gap-2.5">
              {["Real-time code snippet sharing", "Voice & Video huddles"].map(
                (item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2.5 text-slate-300 text-sm"
                  >
                    <span className="w-5 h-5 rounded-full border border-[#13c8ec]/50 bg-[#13c8ec]/10 flex items-center justify-center shrink-0">
                      <Check
                        className="w-3 h-3 text-[#13c8ec]"
                        strokeWidth={2.5}
                      />
                    </span>
                    {item}
                  </li>
                ),
              )}
            </ul>
          </div>

          {/* Right – chat mockup */}
          <div className="flex items-center justify-center px-6 py-8 bg-[#090c11]">
            <div className="w-full max-w-sm">
              <ChatMockup />
            </div>
          </div>
        </motion.div>

        {/* ── Row 2: Two cards side by side ── */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Workspaces card */}
          <motion.div
            {...fadeUp(0.12)}
            className="bg-[#0d1117] border border-white/7 rounded-3xl px-8 py-8 flex flex-col"
          >
            <h3 className="text-2xl font-bold text-white mb-2">
              Deep-focus collaboration
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Everything your team needs, organized in specialized workspaces.
            </p>
            <WorkspaceMockup />
          </motion.div>

          {/* Feed card */}
          <motion.div
            {...fadeUp(0.22)}
            className="bg-[#0d1117] border border-white/7 rounded-3xl px-8 py-8 flex flex-col"
          >
            <h3 className="text-2xl font-bold text-white mb-2">
              Share your mind
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your journey, your code, your growth.
            </p>
            <FeedMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
