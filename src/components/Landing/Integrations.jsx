"use client";
import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Github, Slack, MessageCircle, Database, Share2 } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const ACCENT = "var(--color-accent)";
const DEEP = "var(--color-slate-surface)";

const integrations = [
  {
    icon: Github,
    name: "GitHub",
    status: "Native",
    color: "#e6edf3",
    description: "Receive real-time PR notifications and commit updates directly in your chat rooms.",
  },
  {
    icon: Slack,
    name: "Slack",
    status: "Bridge",
    color: "#4A154B",
    description: "Sync channels across platforms to keep your workspace communication unified.",
  },
  {
    icon: MessageCircle,
    name: "Discord",
    status: "Hook",
    color: "#5865F2",
    description: "Connect community servers and automate announcements with simple webhooks.",
  },
  {
    icon: Database,
    name: "Webhooks",
    status: "Custom",
    color: "#60a5fa",
    description: "Build custom integrations for any service using our robust, developer-friendly API.",
  },
];

export default function Integrations() {
  const sectionRef = useRef(null);
  const cardsRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = cardsRef.current?.children;
      if (!cards) return;
      gsap.fromTo(
        cards,
        { y: 40, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-obsidian py-10 md:py-16 px-6 overflow-hidden border-t border-white/[0.03]">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none" style={{ background: "color-mix(in srgb, var(--color-accent) 4%, transparent)" }} />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.03] text-xs font-mono font-bold uppercase tracking-widest mb-6" style={{ color: ACCENT }}>
            <Share2 size={12} /> Ecosystem
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-[-0.02em] text-ivory mb-6">
            Connected to your <span className="font-serif italic text-accent">workflow</span>
          </h2>
          <p className="text-ivory/40 text-base md:text-lg font-light max-w-2xl mx-auto leading-relaxed">
            ConvoX doesn&apos;t live in a vacuum. Connect with the tools you already use and turn your workflow into a seamless productivity hub.
          </p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {integrations.map((app, index) => {
            const Icon = app.icon;
            return (
              <motion.div
                key={index}
                whileHover={{ y: -6, borderColor: "rgba(255,255,255,0.12)" }}
                className="group p-8 rounded-3xl border border-white/[0.05] flex flex-col items-center text-center transition-all duration-300"
                style={{ background: DEEP }}
              >
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 border border-white/[0.05]" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <Icon size={24} style={{ color: app.color }} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded mb-3 font-mono" style={{ color: "var(--color-accent)", background: "color-mix(in srgb, var(--color-accent) 7%, transparent)" }}>
                  {app.status}
                </span>
                <h3 className="font-display text-xl font-bold text-ivory mb-3">{app.name}</h3>
                <p className="text-ivory/40 text-sm leading-relaxed">{app.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
