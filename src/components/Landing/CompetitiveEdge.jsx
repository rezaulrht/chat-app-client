"use client";

import React from "react";
import { Zap, ShieldCheck, TrendingUp, Check, X } from "lucide-react";

const comparison = [
  { feature: "One-to-One & Group Chat", convoX: true, traditional: true },
  {
    feature: "Real-time Read Receipts",
    convoX: "Instant",
    traditional: "Delayed",
  },
  { feature: "Threaded Context/Replies", convoX: true, traditional: "Limited" },
  { feature: "Advanced Message Scheduling", convoX: true, traditional: false },
  { feature: "Edit & Delete (Global)", convoX: true, traditional: "Timed" },
];

export default function CompetitiveEdge() {
  return (
    <section className="relative w-full py-24 bg-[#05050A] text-white font-sans selection:bg-blue-500/30">
      {/* Top Divider Line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-6">
            Better Than <span className="text-blue-500">Traditional Chat.</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Traditional platforms are bloated and slow. We’ve refined the
            essential messaging experience for the speed of modern teams.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side: Why We're Different */}
          <div className="space-y-8">
            <h3 className="text-2xl font-bold text-slate-100 mb-4">
              Why We’re Different
            </h3>

            <div className="flex gap-5 p-6 bg-[#0F1117] border border-white/5 rounded-2xl hover:border-blue-500/30 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/20 transition-colors">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1">Built for Speed</h4>
                <p className="text-slate-400 text-sm">
                  Experience sub-50ms message delivery and instant typing
                  indicators without the lag.
                </p>
              </div>
            </div>

            <div className="flex gap-5 p-6 bg-[#0F1117] border border-white/5 rounded-2xl hover:border-indigo-500/30 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-500/20 transition-colors">
                <ShieldCheck className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1">
                  Complete Message Control
                </h4>
                <p className="text-slate-400 text-sm">
                  Schedule messages for later or edit/delete with zero
                  restrictions on history.
                </p>
              </div>
            </div>

            <div className="flex gap-5 p-6 bg-[#0F1117] border border-white/5 rounded-2xl hover:border-purple-500/30 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-500/20 transition-colors">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1">
                  Threaded Productivity
                </h4>
                <p className="text-slate-400 text-sm">
                  Keep noisy group chats organized with deep threaded context
                  and easy search.
                </p>
              </div>
            </div>
          </div>

          {/* Right Side: Comparison Table */}
          <div className="bg-[#0F1117] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            {/* Subtle background decoration icon */}
            <div className="absolute -top-10 -right-10 p-4 opacity-5 pointer-events-none">
              <Zap className="w-48 h-48 text-blue-500" />
            </div>

            <h3 className="text-xl font-bold mb-8 relative z-10">
              Compare Experience
            </h3>

            <div className="space-y-6 relative z-10">
              {/* Table Head */}
              <div className="grid grid-cols-3 pb-4 border-b border-white/5 text-[10px] uppercase tracking-widest font-bold text-slate-500">
                <div>Feature</div>
                <div className="text-blue-500 text-center">ConvoX</div>
                <div className="text-center">Others</div>
              </div>

              {/* Table Rows based on your 11 features */}
              {comparison.map((row, i) => (
                <div
                  key={i}
                  className="grid grid-cols-3 py-3 items-center border-b border-white/[0.02] last:border-0"
                >
                  <div className="text-sm font-medium text-slate-300">
                    {row.feature}
                  </div>
                  <div className="text-center flex justify-center">
                    {typeof row.convoX === "boolean" ? (
                      <Check className="w-5 h-5 text-blue-500" />
                    ) : (
                      <span className="text-sm text-blue-400 font-bold">
                        {row.convoX}
                      </span>
                    )}
                  </div>
                  <div className="text-center flex justify-center">
                    {typeof row.traditional === "boolean" ? (
                      row.traditional ? (
                        <Check className="w-5 h-5 text-slate-600" />
                      ) : (
                        <X className="w-5 h-5 text-slate-700" />
                      )
                    ) : (
                      <span className="text-sm text-slate-500">
                        {row.traditional}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
