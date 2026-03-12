"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  MessageSquare,
  CheckCheck,
  Hash,
  ChevronRight,
  Calendar,
  Clock,
  Send,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const ACCENT = "#00d3bb";
const DEEP = "#12121a";
const SURFACE = "#1a1a2e";

/* ── Card 1: Message Pulse ────────────────────────────────────────────── */
function MessagePulseCard() {
  const msgs = [
    { from: "Alex", text: "Ready for launch? ", incoming: true },
    { from: "You", text: "Let's ship it!", incoming: false },
  ];
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleCount((c) => {
        if (c >= msgs.length) {
          setTimeout(() => setVisibleCount(0), 1800);
          return c;
        }
        return c + 1;
      });
    }, 1200);
    return () => clearInterval(interval);
  }, [msgs.length]);

  return (
    <div className="rounded-3xl border border-white/[0.05] p-8 flex flex-col h-full" style={{ background: DEEP }}>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: ACCENT + "18", border: "1px solid " + ACCENT + "30" }}>
          <MessageSquare size={18} style={{ color: ACCENT }} />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-ivory">Message Pulse</h3>
          <p className="text-ivory/30 text-xs font-mono">Real-time delivery</p>
        </div>
      </div>
      <p className="text-ivory/40 text-sm leading-relaxed mb-6">
        Sub-50ms message delivery with instant typing indicators and read receipts.
      </p>
      <div className="flex-1 rounded-2xl p-4 flex flex-col justify-end gap-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
        {msgs.slice(0, visibleCount).map((msg, i) => (
          <motion.div
            key={i + "-" + visibleCount}
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
            className={msg.incoming ? "self-start" : "self-end"}
          >
            <div
              className="px-3.5 py-2 rounded-2xl text-xs font-medium max-w-[180px]"
              style={{
                background: msg.incoming ? SURFACE : ACCENT,
                color: msg.incoming ? "#FAF8F5" : "#fff",
                borderRadius: msg.incoming ? "14px 14px 14px 4px" : "14px 14px 4px 14px",
                boxShadow: msg.incoming ? "none" : "0 4px 14px " + ACCENT + "33",
              }}
            >
              {msg.text}
            </div>
            {!msg.incoming && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-1 mt-1 justify-end"
              >
                <CheckCheck size={10} style={{ color: ACCENT }} />
                <span className="text-[9px] font-mono" style={{ color: ACCENT + "88" }}>Delivered</span>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ── Card 2: Workspace Navigator ──────────────────────────────────────── */
function WorkspaceCard() {
  const channels = [
    { name: "frontend-dev", active: true, unread: 3 },
    { name: "api-design", active: false, unread: 0 },
    { name: "deployments", active: false, unread: 1 },
  ];
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setExpanded((e) => !e), 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-3xl border border-white/[0.05] p-8 flex flex-col h-full" style={{ background: DEEP }}>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#5865f2" + "18", border: "1px solid #5865f2" + "30" }}>
          <Hash size={18} style={{ color: "#5865f2" }} />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-ivory">Workspace Navigator</h3>
          <p className="text-ivory/30 text-xs font-mono">Organized channels</p>
        </div>
      </div>
      <p className="text-ivory/40 text-sm leading-relaxed mb-6">
        Deep-focus collaboration in specialized workspaces with organized channel trees.
      </p>
      <div className="flex-1 rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
        <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-2 mb-3 text-xs font-mono text-ivory/50 hover:text-ivory/70 transition-colors">
          <ChevronRight size={12} className={"transition-transform duration-300 " + (expanded ? "rotate-90" : "")} />
          <span className="uppercase tracking-widest text-[9px] font-bold">Project Phoenix</span>
        </button>
        <motion.div animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }} transition={{ duration: 0.35, ease: "easeInOut" }} className="overflow-hidden">
          <div className="flex flex-col gap-1 pl-3">
            {channels.map((ch) => (
              <div key={ch.name} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs" style={{ background: ch.active ? ACCENT + "15" : "transparent", color: ch.active ? ACCENT : "rgba(250,248,245,0.4)" }}>
                <Hash size={12} />
                <span className="flex-1">{ch.name}</span>
                {ch.unread > 0 && (
                  <span className="w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center" style={{ background: ch.active ? ACCENT : "rgba(255,255,255,0.1)", color: ch.active ? "#fff" : "#FAF8F5" }}>
                    {ch.unread}
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ── Card 3: Schedule Protocol ────────────────────────────────────────── */
function ScheduleCard() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const [activeDay, setActiveDay] = useState(2);

  useEffect(() => {
    const interval = setInterval(() => setActiveDay((d) => (d + 1) % days.length), 2000);
    return () => clearInterval(interval);
  }, [days.length]);

  return (
    <div className="rounded-3xl border border-white/[0.05] p-8 flex flex-col h-full" style={{ background: DEEP }}>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#22c55e" + "18", border: "1px solid #22c55e" + "30" }}>
          <Calendar size={18} style={{ color: "#22c55e" }} />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-ivory">Schedule Protocol</h3>
          <p className="text-ivory/30 text-xs font-mono">Timed delivery</p>
        </div>
      </div>
      <p className="text-ivory/40 text-sm leading-relaxed mb-6">
        Schedule messages for the perfect moment. Never miss a timezone again.
      </p>
      <div className="flex-1 rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="flex gap-1 mb-4">
          {days.map((day, i) => (
            <motion.div
              key={day}
              animate={{ background: i === activeDay ? ACCENT + "22" : "rgba(255,255,255,0.03)", borderColor: i === activeDay ? ACCENT + "44" : "rgba(255,255,255,0.05)" }}
              className="flex-1 py-2 rounded-lg border text-center"
            >
              <span className="text-[9px] font-mono font-bold uppercase" style={{ color: i === activeDay ? ACCENT : "rgba(250,248,245,0.3)" }}>{day}</span>
            </motion.div>
          ))}
        </div>
        <div className="space-y-2">
          {[{ time: "09:00", msg: "Stand-up reminder", icon: Clock }, { time: "14:30", msg: "Deploy notification", icon: Send }].map((item, i) => (
            <motion.div
              key={i}
              animate={{ opacity: i === 0 || activeDay > 1 ? 1 : 0.3 }}
              className="flex items-center gap-3 px-3 py-2 rounded-xl"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <item.icon size={12} style={{ color: "#22c55e", flexShrink: 0 }} />
              <span className="text-xs text-ivory/50 font-mono">{item.time}</span>
              <span className="text-xs text-ivory/70 flex-1">{item.msg}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Main Section ─────────────────────────────────────────────────────── */
export default function Features() {
  const sectionRef = useRef(null);
  const cardsRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = cardsRef.current?.children;
      if (!cards) return;
      gsap.fromTo(
        cards,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <section id="features" ref={sectionRef} className="bg-obsidian py-24 md:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-[-0.02em] text-ivory mb-4">
            Everything your team <span className="font-serif italic text-accent">needs</span>
          </h2>
          <p className="text-ivory/40 text-base md:text-lg font-light leading-relaxed max-w-2xl mx-auto">
            Three pillars of modern communication — real-time messaging, organized workspaces, and intelligent scheduling.
          </p>
        </div>
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MessagePulseCard />
          <WorkspaceCard />
          <ScheduleCard />
        </div>
      </div>
    </section>
  );
}
