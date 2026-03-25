"use client";
import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Zap, ShieldCheck, TrendingUp, Check, X } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const ACCENT = "#00d3bb";
const DEEP = "#12121a";

const differentiators = [
  {
    icon: Zap,
    color: ACCENT,
    title: "Built for Speed",
    description:
      "Experience sub-50ms message delivery and instant typing indicators without the lag.",
  },
  {
    icon: ShieldCheck,
    color: "#a78bfa",
    title: "Complete Message Control",
    description:
      "Schedule messages for later or edit/delete with zero restrictions on history.",
  },
  {
    icon: TrendingUp,
    color: "#34d399",
    title: "Threaded Productivity",
    description:
      "Keep noisy group chats organized with deep threaded context and easy search.",
  },
];

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
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".edge-card-wrap",
        { x: -40, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 70%" },
        },
      );
      gsap.fromTo(
        ".edge-table",
        { x: 40, opacity: 0, scale: 0.96 },
        {
          x: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 70%" },
        },
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-obsidian py-24 md:py-32 px-6 overflow-hidden"
    >
      {/* Top gradient line */}
      <div
        className="absolute top-0 left-0 w-full h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, " +
            ACCENT +
            "40, transparent)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="font-display text-3xl sm:text-4xl md:text-6xl font-bold tracking-[-0.02em] text-ivory mb-6">
            Better than{" "}
            <span className="font-serif italic text-accent">
              traditional chat
            </span>
          </h2>
          <p className="text-ivory/40 text-lg max-w-2xl mx-auto font-light leading-relaxed">
            Traditional platforms are bloated and slow. We've refined the
            essential messaging experience for the speed of modern teams.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Left: Differentiators */}
          <div
            className="edge-card-wrap rounded-3xl border border-white/[0.06] p-8 flex flex-col justify-between gap-6"
            style={{ background: DEEP }}
          >
            <h3 className="font-display text-xl font-bold text-ivory">
              Why We&apos;re Different
            </h3>
            <div className="flex flex-col gap-5 flex-1">
              {differentiators.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={i}
                    whileHover={{ borderColor: item.color + "40" }}
                    className="edge-card flex gap-4 p-5 rounded-2xl border border-white/[0.05] group transition-colors"
                    style={{ background: "rgba(255,255,255,0.02)" }}
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110"
                      style={{
                        background: item.color + "15",
                        border: "1px solid " + item.color + "25",
                      }}
                    >
                      <Icon size={19} style={{ color: item.color }} />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-base text-ivory mb-1">
                        {item.title}
                      </h4>
                      <p className="text-ivory/40 text-sm leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right: Comparison Table */}
          <div
            className="edge-table rounded-3xl p-4 sm:p-8 border border-white/[0.07] relative overflow-hidden"
            style={{
              background: DEEP,
              boxShadow: "0 32px 64px rgba(0,0,0,0.4)",
            }}
          >
            <div className="absolute -top-10 -right-10 opacity-[0.03] pointer-events-none">
              <Zap size={192} />
            </div>

            <h3 className="font-display text-xl font-bold text-ivory mb-8">
              Compare Experience
            </h3>

            <div className="space-y-0 relative z-10 overflow-x-auto -mx-2 px-2">
              <div className="flex items-center pb-4 border-b border-white/[0.05] font-mono text-[10px] uppercase tracking-widest font-bold">
                <div className="flex-1 text-ivory/30">Feature</div>
                <div className="w-20 shrink-0 text-center" style={{ color: ACCENT }}>ConvoX</div>
                <div className="w-16 shrink-0 text-center text-ivory/30">Others</div>
              </div>

              {comparison.map((row, i) => (
                <div
                  key={i}
                  className="flex items-center py-4 border-b border-white/[0.03] last:border-0"
                >
                  <div className="flex-1 min-w-0 text-xs sm:text-sm font-medium text-ivory/60 pr-3">
                    {row.feature}
                  </div>
                  <div className="w-20 shrink-0 flex justify-center">
                    {typeof row.convoX === "boolean" ? (
                      <Check size={18} style={{ color: ACCENT }} />
                    ) : (
                      <span className="text-sm font-bold font-mono" style={{ color: ACCENT }}>
                        {row.convoX}
                      </span>
                    )}
                  </div>
                  <div className="w-16 shrink-0 flex justify-center">
                    {typeof row.traditional === "boolean" ? (
                      row.traditional ? (
                        <Check size={18} className="text-ivory/20" />
                      ) : (
                        <X size={18} className="text-ivory/10" />
                      )
                    ) : (
                      <span className="text-sm text-ivory/30">
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
