"use client";
import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";

export default function HeroSection() {
  const sectionRef = useRef(null);
  const badgeRef = useRef(null);
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);
  const subtitleRef = useRef(null);
  const buttonsRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        badgeRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.7 },
      )
        .fromTo(
          line1Ref.current,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.7 },
          "-=0.45",
        )
        .fromTo(
          line2Ref.current,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.7 },
          "-=0.45",
        )
        .fromTo(
          subtitleRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.35",
        )
        .fromTo(
          buttonsRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.3",
        );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-[100dvh] overflow-hidden flex items-end justify-start selection:bg-accent/30"
    >
      {/* Background Image with heavy gradient overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920&q=80"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/85 to-obsidian/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian/60 to-transparent" />
      </div>

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 z-[1] bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_at_30%_80%,black_30%,transparent_80%)] pointer-events-none" />

      {/* Content — pushed to bottom-left third */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-16 pb-24 md:pb-32 pt-40">
        <div className="max-w-3xl">
          {/* Badge */}
          <div ref={badgeRef} className="opacity-0 mb-8">
            <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] text-[11px] font-semibold tracking-[0.15em] uppercase text-ivory/70">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              Now in Public Beta
            </span>
          </div>

          {/* Heading Line 1 — Bold Sans */}
          <h1
            ref={line1Ref}
            className="opacity-0 font-display text-3xl sm:text-4xl md:text-7xl lg:text-8xl font-bold tracking-[-0.02em] text-ivory leading-[1.05] mb-2"
          >
            Collaboration meets
          </h1>

          {/* Heading Line 2 — Massive Serif Italic, cyan */}
          <p
            ref={line2Ref}
            className="opacity-0 font-serif italic text-4xl sm:text-5xl md:text-8xl lg:text-9xl text-accent leading-[1.05] mb-8"
          >
            Precision.
          </p>

          {/* Subtitle */}
          <p
            ref={subtitleRef}
            className="opacity-0 text-base md:text-lg text-ivory/50 max-w-lg leading-relaxed mb-10 font-light"
          >
            Real-time messaging, workspaces, and smart scheduling — built for
            students, developers, and teams who move fast.
          </p>

          {/* Buttons */}
          <div
            ref={buttonsRef}
            className="opacity-0 flex flex-col sm:flex-row items-start gap-4"
          >
            <Link
              href="/register"
              className="btn-magnetic inline-flex items-center justify-center px-8 py-4 bg-accent text-obsidian font-bold rounded-xl text-[15px] shadow-[0_12px_40px_-8px_rgba(0,211,187,0.4)] hover:shadow-[0_20px_60px_-12px_rgba(0,211,187,0.5)]"
            >
              Get Started for Free
            </Link>
            <Link
              href="#demo"
              className="btn-cta-glass inline-flex items-center justify-center px-8 py-4 font-bold rounded-xl text-[15px]"
            >
              View Demo
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-obsidian to-transparent z-[2] pointer-events-none" />
    </section>
  );
}
