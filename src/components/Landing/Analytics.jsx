"use client";
import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ACCENT = "#00d3bb";
const DEEP = "#12121a";

const stats = [
  { value: 50, suffix: "ms", label: "Avg. Latency", color: ACCENT },
  { value: 10, suffix: "K+", label: "Active Users", color: "#34d399" },
  { value: 99.9, suffix: "%", label: "Uptime SLA", color: "#a78bfa" },
  { value: 24, suffix: "/7", label: "Global Support", color: "#fb923c" },
];

function AnimatedCounter({ target, suffix, color, started }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!started) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(interval);
      } else {
        setCount(
          Number.isInteger(target)
            ? Math.floor(current)
            : parseFloat(current.toFixed(1)),
        );
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [started, target]);

  return (
    <span
      className="font-display text-4xl md:text-5xl font-bold tabular-nums"
      style={{ color }}
    >
      {count}
      {suffix}
    </span>
  );
}

export default function Analytics() {
  const sectionRef = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 75%",
        onEnter: () => setStarted(true),
        once: true,
      });
      gsap.fromTo(
        ".stat-card",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
        },
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="bg-obsidian py-24 md:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-[-0.02em] text-ivory mb-4">
            Powerful{" "}
            <span className="font-serif italic text-accent">
              analytics & insights
            </span>
          </h2>
          <p className="text-ivory/40 text-base md:text-lg font-light leading-relaxed max-w-2xl mx-auto">
            Understand how your team communicates, track engagement, and make
            better decisions with real-time data.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="stat-card rounded-3xl border border-white/[0.05] p-6 sm:p-8 text-center group hover:-translate-y-1 transition-transform duration-300"
              style={{ background: DEEP }}
            >
              <AnimatedCounter
                target={stat.value}
                suffix={stat.suffix}
                color={stat.color}
                started={started}
              />
              <p className="text-ivory/40 text-xs font-mono uppercase tracking-widest mt-3 font-bold">
                {stat.label}
              </p>
              <div
                className="mt-4 mx-auto h-[1px] w-8 rounded-full opacity-0 group-hover:opacity-100 group-hover:w-12 transition-all duration-500"
                style={{ background: stat.color + "60" }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
