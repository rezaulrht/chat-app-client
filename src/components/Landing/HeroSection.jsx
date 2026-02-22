import React from "react";
import Link from "next/link";
import { ArrowRight, User } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative w-full min-h-[90vh] bg-[#05050A] text-white overflow-hidden flex flex-col items-center justify-center font-sans selection:bg-blue-500/30 py-12">
      {/* --- 1. Background Effects (Static) --- */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-175 h-125 bg-blue-600/20 rounded-full blur-[120px] opacity-40 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[64px_64px] mask-[radial-gradient(ellipse_at_center,black_50%,transparent_100%)] pointer-events-none" />
      </div>

      {/* --- 2. Decorative Background Bubbles (Static) --- */}
      <div className="absolute left-[5%] lg:left-[10%] top-[20%] z-0 hidden lg:block pointer-events-none opacity-30 blur-[1px]">
        <div className="bg-slate-900/40 border border-white/5 p-4 rounded-2xl rounded-bl-none shadow-2xl flex items-center gap-4 w-64 transform -rotate-6">
          <div className="w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center">
            <User className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="h-2 w-3/4 bg-slate-700/50 rounded-full" />
            <div className="h-2 w-1/2 bg-slate-700/50 rounded-full" />
          </div>
        </div>
      </div>
      <div className="absolute right-[5%] lg:right-[12%] bottom-[30%] z-0 hidden lg:block pointer-events-none opacity-30 blur-[1px]">
        <div className="bg-blue-900/10 border border-blue-500/10 p-4 rounded-2xl rounded-br-none shadow-2xl flex items-center gap-4 w-64 transform rotate-3">
          <div className="space-y-2 flex-1 flex flex-col items-end">
            <div className="h-2 w-3/4 bg-blue-400/10 rounded-full" />
            <div className="h-2 w-1/2 bg-blue-400/10 rounded-full" />
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-900/50 flex items-center justify-center">
            <User className="w-5 h-5 text-blue-400" />
          </div>
        </div>
      </div>

      {/* --- 3. Main Content --- */}
      <div className="relative z-10 px-6 max-w-5xl mx-auto text-center mt-10">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-white mb-8 leading-[1.05]">
          Connect instantly <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-[#13c8ec] via-white to-[#13c8ec]">
            Anywhere.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Stay connected in real time with{" "}
          <span className="text-white font-semibold"> ConvoX </span>. From
          one-to-one chats to team collaborations, everything is simple, fast,
          and distraction-free.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/register"
            className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-[0_10px_40px_-10px_rgba(37,99,235,0.5)] hover:shadow-[0_20px_60px_-15px_rgba(37,99,235,0.6)] hover:-translate-y-1 active:translate-y-0 active:scale-95 text-center"
          >
            <div className="flex items-center justify-center gap-2 text-lg">
              Get Started for Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20 pointer-events-none" />
          </Link>
        </div>

        {/* --- Central Chat Interface Preview --- */}
        <div className="relative w-full max-w-lg mx-auto">
          <div className="relative bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col gap-6 text-left">
            {/* Header Dots */}
            <div className="flex gap-2 mb-2 opacity-50">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
            </div>

            {/* Message 1: Incoming (Left) */}
            <div className="flex items-start gap-3">
              {/* Icon Avatar */}
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-indigo-300" />
              </div>
              <div className="bg-slate-800 border border-white/5 px-4 py-3 rounded-2xl rounded-tl-none text-slate-200 shadow-sm">
                Hey! Did you see the update?
              </div>
            </div>

            {/* Message 2: Outgoing (Right) */}
            <div className="flex items-start gap-3 justify-end">
              <div className="bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-3 rounded-2xl rounded-tr-none text-white shadow-lg shadow-blue-500/20">
                Just saw it. It&apos;s incredibly fast!
              </div>
              {/* Icon Avatar */}
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-blue-300" />
              </div>
            </div>

            {/* Message 3: Typing (Left) */}
            <div className="flex items-center gap-3">
              {/* Icon Avatar */}
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-indigo-300" />
              </div>
              <div className="bg-slate-800 border border-white/5 px-4 py-3 rounded-2xl rounded-tl-none text-slate-400 text-sm italic">
                Typing...
              </div>
            </div>
          </div>

          {/* Static Glow behind the chat card */}
          <div className="absolute -inset-1 bg-linear-to-r from-blue-500 to-indigo-500 rounded-3xl blur opacity-20 -z-10" />
        </div>
      </div>
    </section>
  );
}
