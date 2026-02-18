"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, ShieldAlert } from "lucide-react";

export default function LoginErrorPage() {
  return (
    <div className="min-h-screen bg-[#05050A] font-sans text-white flex items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-175 h-125 bg-red-500/10 rounded-full blur-[120px] opacity-30 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[64px_64px] mask-[radial-gradient(ellipse_at_center,black_50%,transparent_100%)] pointer-events-none" />
      </div>

      <main className="relative z-10 w-full max-w-md px-6 py-12">
        <div className="glass-panel rounded-2xl p-8 sm:p-10 shadow-2xl border border-white/10 text-center">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 ring-1 ring-red-500/20">
            <ShieldAlert className="w-10 h-10 text-red-500" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white mb-3">
            Authentication FAILED
          </h1>
          <p className="text-sm text-slate-400 mb-8 leading-relaxed">
            We couldn&apos;t complete your login. This usually happens if the
            authorization was cancelled or if there was a problem with the
            provider.
          </p>

          <div className="space-y-4">
            <Link
              href="/login"
              className="w-full py-3.5 rounded-lg text-sm font-bold text-background-dark bg-[#13c8ec] hover:bg-[#13c8ec]/90 transition-all shadow-lg shadow-[#13c8ec]/20 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>

            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              Secure & Private.
            </p>
          </div>
        </div>

        <div className="text-center mt-10 opacity-40">
          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">
            © 2026 ConvoX. Let&apos;s get you back.
          </p>
        </div>
      </main>
    </div>
  );
}
