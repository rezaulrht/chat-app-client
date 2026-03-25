"use client";
import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: 50,   max: 50,   suffix: "ms",  label: "Avg. Latency",   color: "#00d3bb" },
  { value: 10,   max: 10,   suffix: "K+",  label: "Active Users",   color: "#34d399" },
  { value: 99.9, max: 100,  suffix: "%",   label: "Uptime SLA",     color: "#a78bfa" },
  { value: 24,   max: 24,   suffix: "/7",  label: "Global Support", color: "#fb923c" },
];

/* SVG ring with GSAP-driven strokeDashoffset + counter */
function RingCard({ value, max, suffix, label, color, started }) {
  const pathRef    = useRef(null);
  const numberRef  = useRef(null);
  const R    = 52;
  const CIRC = 2 * Math.PI * R;

  useEffect(() => {
    if (!started) return;
    const obj = { v: 0, progress: 0 };

    gsap.to(obj, {
      v:        value,
      progress: value / max,
      duration: 2,
      ease: "power2.out",
      onUpdate() {
        /* Number */
        if (numberRef.current) {
          numberRef.current.textContent =
            Number.isInteger(value)
              ? Math.floor(obj.v)
              : obj.v.toFixed(1);
        }
        /* SVG ring */
        if (pathRef.current) {
          pathRef.current.style.strokeDashoffset =
            String(CIRC * (1 - obj.progress));
        }
      },
    });
  }, [started, value, max, CIRC]);

  return (
    <div
      className="stat-card rounded-3xl border border-white/[0.05] p-8 flex flex-col items-center gap-4 group hover:-translate-y-1 transition-transform duration-300"
      style={{ background: "#12121a" }}
    >
      {/* Ring */}
      <div className="relative">
        <svg width="130" height="130" viewBox="0 0 130 130" style={{ transform: "rotate(-90deg)" }}>
          {/* Track */}
          <circle cx="65" cy="65" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
          {/* Progress */}
          <circle
            ref={pathRef}
            cx="65" cy="65" r={R}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC}
            style={{ filter: `drop-shadow(0 0 6px ${color}66)` }}
          />
        </svg>
        {/* Centre number */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-bold tabular-nums" style={{ fontSize: 28, color, lineHeight: 1 }}>
            <span ref={numberRef}>0</span>
            <span style={{ fontSize: 16 }}>{suffix}</span>
          </span>
        </div>
      </div>

      <p className="text-ivory/40 text-xs font-mono uppercase tracking-widest font-bold text-center">{label}</p>

      {/* Hover underline */}
      <div
        className="h-px w-6 rounded-full opacity-0 group-hover:opacity-100 group-hover:w-10 transition-all duration-500"
        style={{ background: color + "70" }}
      />
    </div>
  );
}

export default function Analytics() {
  const sectionRef = useRef(null);
  const headRef    = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* Heading animation */
      gsap.fromTo(headRef.current,
        { opacity: 0, y: 36 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 78%" } });

      /* Cards stagger in */
      gsap.fromTo(".stat-card",
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current, start: "top 75%", once: true,
            onEnter: () => setStarted(true),
          } });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="bg-obsidian py-24 md:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div ref={headRef} className="text-center mb-16" style={{ opacity: 0 }}>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-[-0.02em] text-ivory mb-4">
            Powerful{" "}
            <span className="font-serif italic text-accent">analytics & insights</span>
          </h2>
          <p className="text-ivory/40 text-base md:text-lg font-light leading-relaxed max-w-2xl mx-auto">
            Understand how your team communicates, track engagement, and make better decisions with real-time data.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <RingCard key={i} {...stat} started={started} />
          ))}
        </div>
      </div>
    </section>
  );
}
