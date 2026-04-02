"use client";
import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "lenis/react";

gsap.registerPlugin(ScrollTrigger);

/* Split text into words; each word gets white-space:nowrap so characters
   within a word can never break across lines. Each character is individually
   animated by GSAP via [data-char]. Spaces between words are plain text. */
function SplitChars({ text }) {
  return text.split(" ").map((word, wi) => (
    <React.Fragment key={wi}>
      {wi > 0 && " "}
      <span style={{ whiteSpace: "nowrap", display: "inline-block" }}>
        {word.split("").map((char, ci) => (
          <span
            key={ci}
            data-char
            style={{ display: "inline-block", opacity: 0, willChange: "transform, opacity" }}
          >
            {char}
          </span>
        ))}
      </span>
    </React.Fragment>
  ));
}

export default function HeroSection() {
  const sectionRef  = useRef(null);
  const bgRef       = useRef(null);
  const gridRef     = useRef(null);
  const orbRef      = useRef(null);
  const canvasRef   = useRef(null);
  const contentRef  = useRef(null);
  const badgeRef    = useRef(null);
  const line1Ref    = useRef(null);
  const line2Ref    = useRef(null);
  const subtitleRef = useRef(null);
  const buttonsRef  = useRef(null);
  const velRef      = useRef(0);
  const rafRef      = useRef(null);
  const particles   = useRef([]);

  /* Track Lenis velocity for the particle system */
  useLenis(({ velocity }) => { velRef.current = velocity; });

  /* ── Canvas particle field ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = canvas.offsetWidth  * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const w = () => canvas.offsetWidth;
    const h = () => canvas.offsetHeight;

    particles.current = Array.from({ length: 100 }, () => ({
      x:     Math.random() * w(),
      y:     Math.random() * h(),
      vx:    (Math.random() - 0.5) * 0.28,
      vy:    (Math.random() - 0.5) * 0.28,
      r:     Math.random() * 1.4 + 0.3,
      alpha: Math.random() * 0.35 + 0.07,
    }));

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, w(), h());

      const vel   = Math.abs(velRef.current);
      const speed = 1 + vel * 0.09;
      const drift = vel * 0.03;

      particles.current.forEach((p) => {
        p.x += p.vx * speed;
        p.y += p.vy * speed - drift;
        if (p.x < 0) p.x = w(); if (p.x > w()) p.x = 0;
        if (p.y < 0) p.y = h(); if (p.y > h()) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,211,187,${Math.min(p.alpha * (1 + vel * 0.06), 0.75)})`;
        ctx.fill();
      });
    };
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  /* ── GSAP: parallax + entry animations ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      /* Multi-layer parallax scrubbed to scroll */
      gsap.to(bgRef.current, {
        yPercent: 35, ease: "none",
        scrollTrigger: { trigger: sectionRef.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(gridRef.current, {
        yPercent: 20, ease: "none",
        scrollTrigger: { trigger: sectionRef.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(orbRef.current, {
        y: 130, ease: "none",
        scrollTrigger: { trigger: sectionRef.current, start: "top top", end: "bottom top", scrub: true },
      });

      /* Hero content fades up and out as you scroll away */
      gsap.to(contentRef.current, {
        y: -90, opacity: 0, ease: "none",
        scrollTrigger: { trigger: sectionRef.current, start: "20% top", end: "70% top", scrub: true },
      });

      /* Entry timeline ─ character-split fly-in */
      const line1Chars = line1Ref.current?.querySelectorAll("[data-char]");
      const line2Chars = line2Ref.current?.querySelectorAll("[data-char]");

      const tl = gsap.timeline({ delay: 0.1, defaults: { ease: "power3.out" } });
      tl.fromTo(badgeRef.current,
        { opacity: 0, y: 30, filter: "blur(8px)" },
        { opacity: 1, y: 0,  filter: "blur(0px)", duration: 0.85 })
        .fromTo(line1Chars,
          { opacity: 0, y: 72, rotateX: -55, transformOrigin: "50% 100%" },
          { opacity: 1, y: 0,  rotateX: 0, duration: 0.7, stagger: 0.02 }, "-=0.5")
        .fromTo(line2Chars,
          { opacity: 0, y: 72, rotateX: -55, transformOrigin: "50% 100%" },
          { opacity: 1, y: 0,  rotateX: 0, duration: 0.7, stagger: 0.035 }, "-=0.6")
        .fromTo(subtitleRef.current,
          { opacity: 0, y: 26, filter: "blur(5px)" },
          { opacity: 1, y: 0,  filter: "blur(0px)", duration: 0.65 }, "-=0.4")
        .fromTo(buttonsRef.current,
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0,  duration: 0.6 }, "-=0.3");
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-[100dvh] overflow-hidden flex items-end justify-start selection:bg-accent/30"
    >
      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-[3] w-full h-full pointer-events-none"
        style={{ mixBlendMode: "screen" }}
      />

      {/* Glowing orbs (parallax) */}
      <div ref={orbRef} className="absolute pointer-events-none" style={{
        zIndex: 1, width: 720, height: 720, top: "-8%", right: "-18%", borderRadius: "50%",
        background: "radial-gradient(circle at 38% 38%, rgba(0,211,187,0.15) 0%, rgba(0,211,187,0.04) 45%, transparent 70%)",
        filter: "blur(70px)",
      }} />
      <div className="absolute pointer-events-none" style={{
        zIndex: 1, width: 480, height: 480, bottom: "8%", left: "-12%", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(19,200,236,0.09) 0%, transparent 70%)",
        filter: "blur(55px)",
      }} />

      {/* Background image (slowest layer) */}
      <div ref={bgRef} className="absolute inset-0 z-0 will-change-transform">
        <img
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920&q=80"
          alt=""
          className="w-full h-full object-cover scale-[1.18]"
        />
        <div className="absolute inset-0 hero-overlay-t" />
        <div className="absolute inset-0 hero-overlay-r" />
      </div>

      {/* Grid overlay (medium layer) */}
      <div ref={gridRef} className="absolute inset-0 z-[1] pointer-events-none will-change-transform" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px)",
        backgroundSize: "72px 72px",
        maskImage: "radial-gradient(ellipse at 30% 80%,black 30%,transparent 80%)",
      }} />

      {/* Text content (fastest layer) */}
      <div ref={contentRef} className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-16 pb-24 md:pb-32 pt-40">
        <div className="max-w-3xl">

          {/* Live badge */}
          <div ref={badgeRef} className="mb-8" style={{ opacity: 0 }}>
            <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] text-[11px] font-semibold tracking-[0.15em] uppercase text-ivory/70">
              <span className="w-2 h-2 rounded-full bg-accent" style={{ animation: "accentPulse 2s ease-in-out infinite" }} />
              Now in Public Beta
            </span>
          </div>

          {/* Line 1 — split characters */}
          <h1
            ref={line1Ref}
            className="font-display text-3xl sm:text-4xl md:text-7xl lg:text-8xl font-bold tracking-[-0.02em] text-ivory leading-[1.05] mb-2"
            style={{ perspective: "700px" }}
          >
            <SplitChars text="Collaboration meets" />
          </h1>

          {/* Line 2 — italic accent, split characters */}
          <p
            ref={line2Ref}
            className="font-serif italic text-4xl sm:text-5xl md:text-8xl lg:text-9xl text-accent leading-[1.05] mb-8"
            style={{ perspective: "700px" }}
          >
            <SplitChars text="Precision." />
          </p>

          <p ref={subtitleRef} className="text-base md:text-lg text-ivory/50 max-w-lg leading-relaxed mb-10 font-light" style={{ opacity: 0 }}>
            Real-time messaging, workspaces, and smart scheduling — built for
            students, developers, and teams who move fast.
          </p>

          <div ref={buttonsRef} className="flex flex-col sm:flex-row items-start gap-4" style={{ opacity: 0 }}>
            <Link href="/register" className="btn-magnetic inline-flex items-center justify-center px-8 py-4 bg-accent text-obsidian font-bold rounded-xl text-[15px] shadow-[0_12px_40px_-8px_rgba(0,211,187,0.4)] hover:shadow-[0_20px_60px_-12px_rgba(0,211,187,0.5)]">
              Get Started for Free
            </Link>
            <Link href="#demo" className="btn-cta-glass inline-flex items-center justify-center px-8 py-4 font-bold rounded-xl text-[15px]">
              View Demo
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-obsidian to-transparent z-[2] pointer-events-none" />
    </section>
  );
}
