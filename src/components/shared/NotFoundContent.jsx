"use client";

import React from "react";
import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFoundContent() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-obsidian via-deep to-obsidian flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated gradient background effect */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-1/2 left-1/2 w-96 h-96 bg-accent/15 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md text-center space-y-8">
        {/* 404 Text with gradient */}
        <div className="space-y-2">
          <div className="text-[120px] md:text-[160px] font-display font-black leading-none">
            <span className="bg-gradient-to-r from-accent via-accent/80 to-accent/60 text-transparent bg-clip-text animate-pulse">
              404
            </span>
          </div>
          <div className="h-1 w-24 mx-auto bg-gradient-to-r from-accent/40 to-transparent rounded-full"></div>
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-ivory">
            This place went silent
          </h1>
          <p className="text-ivory/50 text-sm md:text-base leading-relaxed">
            The space you are looking for has vanished into the void.
          </p>
        </div>

        {/* Glass card with suggestions */}
        <div className="glass-card rounded-2xl border border-white/[0.08] p-6 space-y-4 backdrop-blur-md bg-white/[0.03]">
          <p className="text-[11px] font-mono uppercase tracking-widest text-ivory/30 font-semibold">
            What you can do
          </p>
          <ul className="space-y-2 text-left text-sm text-ivory/60">
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">-</span>
              <span>Check the URL and try again</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">-</span>
              <span>Return to your workspace or home</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">-</span>
              <span>Contact support if something seems wrong</span>
            </li>
          </ul>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 justify-center flex-wrap pt-4">
          <Link
            href="/app/workspace"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent/20 to-accent/10 border border-accent/30 text-accent text-sm font-mono hover:from-accent/30 hover:to-accent/20 hover:border-accent/50 transition-all duration-200"
          >
            <Home size={14} />
            Workspace Home
          </Link>
        </div>

        {/* Footer text */}
        <p className="text-[10px] font-mono text-ivory/20 pt-4">
          Error Code: 404 Not Found
        </p>
      </div>

      {/* Floating accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent"></div>
    </div>
  );
}
