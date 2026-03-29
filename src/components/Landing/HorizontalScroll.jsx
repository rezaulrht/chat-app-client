"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Zap, Shield, Globe, Cpu, ArrowRight } from "lucide-react";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

const SLIDES = [
  {
    num: "01", icon: Zap, color: "#00d3bb",
    tag: "Sub-50ms delivery",
    title: "Lightning Fast",
    body: "Messages arrive before you finish typing. Our distributed edge network eliminates perceived latency across the globe — every single time.",
  },
  {
    num: "02", icon: Shield, color: "#a78bfa",
    tag: "End-to-end encrypted",
    title: "Fort Knox Security",
    body: "Military-grade encryption on every message, file, and call. Your conversations stay yours — always, without compromise.",
  },
  {
    num: "03", icon: Globe, color: "#34d399",
    tag: "12 regions worldwide",
    title: "Globally Distributed",
    body: "Edge nodes on every continent. Whether you're in Tokyo or Toronto, your team communicates at the speed of light.",
  },
  {
    num: "04", icon: Cpu, color: "#fb923c",
    tag: "Smart assistance built-in",
    title: "AI-Augmented",
    body: "Intelligent auto-replies, meeting summaries, and smart scheduling — AI that amplifies your team without replacing it.",
  },
];

export default function HorizontalScroll() {
  const wrapperRef = useRef(null);
  const trackRef   = useRef(null);
  const headRef    = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const wrapper = wrapperRef.current;
      const track   = trackRef.current;
      if (!wrapper || !track) return;

      const getTotalWidth = () => track.scrollWidth - wrapper.offsetWidth;

      /* Horizontal scroll pinned to viewport */
      gsap.to(track, {
        x: () => -getTotalWidth(),
        ease: "none",
        scrollTrigger: {
          trigger: wrapper,
          pin: true,
          anticipatePin: 1,
          scrub: 1.2,
          start: "top top",
          end: () => `+=${getTotalWidth()}`,
          invalidateOnRefresh: true,
        },
      });

      /* Heading fade-in on approach */
      gsap.fromTo(headRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: wrapper, start: "top 85%" } });

      /* Individual card parallax within track */
      gsap.utils.toArray(".hcard").forEach((card, i) => {
        gsap.fromTo(card,
          { y: 50, opacity: 0 },
          { y: 0,  opacity: 1, duration: 0.7, ease: "power3.out",
            scrollTrigger: { trigger: wrapper, start: "top 80%", once: true },
            delay: i * 0.08 });
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={wrapperRef}
      className="relative bg-obsidian overflow-hidden"
      style={{ height: "100vh" }}
    >
      {/* Ambient glow strip */}
      <div className="absolute top-0 left-0 w-full h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg,transparent,rgba(0,211,187,0.4),transparent)" }} />

      {/* Static heading (stays while track moves) */}
      <div ref={headRef} className="absolute top-0 left-0 right-0 z-10 pt-12 px-12 md:px-24 pointer-events-none" style={{ opacity: 0 }}>
        <p className="text-xs font-mono tracking-[0.3em] uppercase text-ivory/30 mb-3">Why ConvoX</p>
        <h2 className="font-display text-3xl md:text-5xl font-bold tracking-[-0.02em] text-ivory">
          Built different,{" "}
          <span className="font-serif italic text-accent">by design</span>
        </h2>
      </div>

      {/* Scrolling track */}
      <div
        ref={trackRef}
        className="flex items-center gap-6 h-full will-change-transform"
        style={{ width: "max-content", paddingLeft: "clamp(3rem, 10vw, 6rem)", paddingRight: "clamp(3rem, 10vw, 6rem)", paddingTop: "8rem" }}
      >
        {SLIDES.map(({ num, icon: Icon, color, tag, title, body }, i) => (
          <div
            key={i}
            className="hcard shrink-0 rounded-3xl border border-white/[0.06] p-10 flex flex-col justify-between"
            style={{
              width: "clamp(300px,36vw,460px)",
              height: "clamp(340px,52vh,490px)",
              background: "linear-gradient(145deg, var(--color-slate-surface) 0%, var(--color-obsidian) 100%)",
              boxShadow: `0 24px 60px rgba(0,0,0,0.45),inset 0 1px 0 rgba(255,255,255,0.05)`,
            }}
          >
            <div>
              <div className="flex items-start justify-between mb-10">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: color + "18", border: "1px solid " + color + "28" }}>
                  <Icon size={24} style={{ color }} />
                </div>
                <span className="font-mono text-[11px] font-bold tracking-widest" style={{ color: color + "55" }}>{num}</span>
              </div>
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-3" style={{ color }}>{tag}</p>
              <h3 className="font-display text-3xl md:text-4xl font-bold text-ivory tracking-tight mb-4">{title}</h3>
              <p className="text-ivory/38 text-sm leading-relaxed font-light">{body}</p>
            </div>
            {/* Accent bar */}
            <div className="h-px rounded-full mt-8" style={{ background: `linear-gradient(90deg,${color}45,transparent)` }} />
          </div>
        ))}

        {/* CTA card */}
        <div
          className="hcard shrink-0 rounded-3xl p-10 flex flex-col items-center justify-center text-center gap-6"
          style={{
            width: "clamp(260px,28vw,380px)",
            height: "clamp(340px,52vh,490px)",
            background: "linear-gradient(145deg,rgba(0,211,187,0.08),rgba(0,211,187,0.02))",
            border: "1px solid rgba(0,211,187,0.14)",
          }}
        >
          <div className="w-14 h-14 rounded-full border border-accent/25 bg-accent/10 flex items-center justify-center">
            <ArrowRight size={20} className="text-accent" />
          </div>
          <div>
            <h3 className="font-display text-2xl font-bold text-ivory mb-2">Ready to start?</h3>
            <p className="text-ivory/40 text-sm">Join thousands of teams already using ConvoX.</p>
          </div>
          <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-obsidian font-bold rounded-xl text-sm">
            Get Started Free
          </Link>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 right-12 z-10 flex items-center gap-3 pointer-events-none opacity-40">
        <span className="text-[9px] font-mono tracking-[0.25em] uppercase text-ivory/50">drag to explore</span>
        <div className="w-8 h-px bg-accent/60" />
        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
      </div>
    </section>
  );
}
