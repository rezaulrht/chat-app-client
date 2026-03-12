"use client";
import React, { useEffect, useState } from "react";
import {
  Compass,
  Wrench,
  Sparkles,
  ArrowLeft,
  Clock,
  Rss,
  Zap,
} from "lucide-react";
import Link from "next/link";

const features = [
  { icon: Rss, label: "Workspace posts & announcements" },
  { icon: Sparkles, label: "Trending topics across teams" },
  { icon: Zap, label: "Real-time reactions & comments" },
];

// Animated floating orbs component
function Orb({ className }) {
  return (
    <div
      className={`absolute rounded-full pointer-events-none ${className}`}
    />
  );
}

// Animated progress bar
function PulseBar({ delay = 0 }) {
  return (
    <div className="h-px w-full bg-white/5 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-transparent via-accent to-transparent rounded-full animate-[shimmer_2.5s_ease-in-out_infinite]"
        style={{ animationDelay: `${delay}ms` }}
      />
    </div>
  );
}

export default function FeedView() {
  const [dots, setDots] = useState("...");
  const [tick, setTick] = useState(0);

  // Animated ellipsis
  useEffect(() => {
    const id = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "." : d + "."));
      setTick((t) => t + 1);
    }, 600);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="flex-1 min-w-0 flex flex-col bg-obsidian relative h-full overflow-hidden">
      {/* ── Ambient background glows ── */}
      <Orb className="top-[-10%] left-[-5%] w-[500px] h-[500px] bg-accent/4 blur-[140px]" />
      <Orb className="bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-accent/3 blur-[120px]" />
      <Orb className="top-[40%] left-[55%] w-[300px] h-[300px] bg-cyan/3 blur-[100px]" />

      {/* ── Subtle grid overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* ── Header (matches app style) ── */}
      <header className="h-17 border-b border-white/6 flex justify-between items-center px-5 glass-panel shrink-0 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shadow-[0_0_16px_rgba(0,211,187,0.08)]">
            <Compass className="text-accent" size={18} />
          </div>
          <div>
            <h2 className="font-display font-bold text-ivory text-sm leading-tight">
              Global Feed
            </h2>
            <p className="text-[10px] font-mono text-ivory/20 uppercase tracking-[0.12em]">
              All workspaces
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-[10px] font-mono text-amber-400/60 uppercase tracking-[0.15em]">
            Maintenance
          </span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-30" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/10 to-transparent" />
      </header>

      {/* ── Main content ── */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-12 relative z-10">
        <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-8">

          {/* ── Main card ── */}
          <div className="w-full relative overflow-hidden glass-card rounded-3xl p-10 flex flex-col items-center text-center gap-6">
            {/* Card glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-accent/6 blur-[80px] rounded-full pointer-events-none" />

            {/* Icon badge */}
            <div className="relative z-10 flex items-center justify-center">
              <div className="absolute w-24 h-24 bg-accent/10 rounded-full blur-2xl animate-pulse" />
              <div className="relative w-20 h-20 rounded-3xl bg-accent/8 border border-accent/20 flex items-center justify-center shadow-[0_0_40px_rgba(0,211,187,0.1)] ring-4 ring-accent/5">
                <Wrench
                  size={34}
                  className="text-accent"
                  strokeWidth={1.5}
                />
              </div>
            </div>

            {/* Label */}
            <div className="relative z-10 flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent/60 flex items-center gap-2">
                <span className="inline-block w-4 h-px bg-accent/30" />
                Under Construction
                <span className="inline-block w-4 h-px bg-accent/30" />
              </span>
            </div>

            {/* Headline */}
            <div className="relative z-10 space-y-3">
              <h1 className="font-serif italic text-4xl text-ivory/90 leading-tight">
                Something great is{" "}
                <span className="text-accent">coming{dots}</span>
              </h1>
              <p className="text-ivory/35 text-[14px] leading-relaxed max-w-sm mx-auto">
                The Global Feed is being crafted to bring your team's pulse in
                one beautiful, real-time stream. Check back soon.
              </p>
            </div>

            {/* Progress animation */}
            <div className="relative z-10 w-full flex flex-col gap-2.5 mt-2">
              <PulseBar delay={0} />
              <PulseBar delay={400} />
              <PulseBar delay={800} />
            </div>

            {/* Coming soon features */}
            <div className="relative z-10 w-full border-t border-white/5 pt-6 flex flex-col gap-3">
              <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-ivory/20 mb-1">
                What&apos;s coming
              </p>
              {features.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.025] border border-white/5 hover:border-accent/15 hover:bg-accent/5 transition-all duration-300 group"
                >
                  <div className="w-7 h-7 rounded-lg bg-accent/8 border border-accent/15 flex items-center justify-center shrink-0 group-hover:border-accent/30 transition-colors duration-300">
                    <Icon size={13} className="text-accent/70 group-hover:text-accent transition-colors duration-300" />
                  </div>
                  <span className="text-[13px] text-ivory/40 group-hover:text-ivory/60 transition-colors duration-300 font-display">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Status chip ── */}
          <div className="flex items-center gap-3 px-5 py-2.5 rounded-full glass-card border border-amber-400/10 bg-amber-400/5">
            <Clock size={12} className="text-amber-400/60" />
            <span className="text-[11px] font-mono text-amber-400/50">
              Expected · Soon™
            </span>
          </div>

          {/* ── Back link ── */}
          <Link
            href="/app"
            className="flex items-center gap-2 text-[12px] font-mono text-ivory/20 hover:text-accent transition-colors duration-200 group"
          >
            <ArrowLeft
              size={13}
              className="group-hover:-translate-x-1 transition-transform duration-200"
            />
            Back to Chats
          </Link>
        </div>
      </div>

      {/* ── Shimmer keyframe ── */}
      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          60%  { transform: translateX(100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </main>
  );
}
