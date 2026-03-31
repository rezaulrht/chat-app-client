"use client";
import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Layers, Users, MessageCircle, Calendar } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const BEATS = [
  {
    step: "01",
    icon: Layers,
    color: "#00d3bb",
    title: "Create Your Space",
    body: "Spin up a workspace in seconds. Organise channels by project, team, or topic — exactly how your mind works.",
    mockLabel: "New Workspace",
    mockDetail: "Project Phoenix • 4 channels",
  },
  {
    step: "02",
    icon: Users,
    color: "#a78bfa",
    title: "Invite Your Team",
    body: "Add teammates with a single link. Granular roles and permissions mean everyone sees exactly what they should.",
    mockLabel: "Team Members",
    mockDetail: "Alex · Sarah · Jordan + 12 more",
  },
  {
    step: "03",
    icon: MessageCircle,
    color: "#34d399",
    title: "Communicate Instantly",
    body: "Sub-50ms delivery, typing indicators, reactions, and threaded replies — the fastest chat experience on the planet.",
    mockLabel: "Live Message",
    mockDetail: "\"Ready to ship? Let's go! 🚀\"",
  },
  {
    step: "04",
    icon: Calendar,
    color: "#fb923c",
    title: "Stay Organised",
    body: "Schedule messages, set reminders, and let AI summarise long threads. Never lose context again.",
    mockLabel: "Scheduled",
    mockDetail: "Stand-up · 09:00 every weekday",
  },
];

/* The animated ConvoX micro-mockup shown on the left */
function Mockup({ active }) {
  const beat = BEATS[active];
  const Icon = beat.icon;

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Glow ring */}
      <div
        className="absolute inset-0 rounded-3xl transition-all duration-700"
        style={{ boxShadow: `0 0 80px 20px ${beat.color}18`, borderRadius: "1.5rem" }}
      />

      {/* Card */}
      <div
        className="relative rounded-3xl border p-8 transition-colors duration-700"
        style={{ background: "var(--color-slate-surface)", border: `1px solid ${beat.color}22` }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500"
            style={{ background: beat.color + "18", border: `1px solid ${beat.color}30` }}
          >
            <Icon size={22} style={{ color: beat.color }} />
          </div>
          <div>
            <p className="font-display font-bold text-ivory text-lg leading-tight">{beat.mockLabel}</p>
            <p className="text-ivory/35 text-xs font-mono mt-0.5">{beat.mockDetail}</p>
          </div>
        </div>

        {/* Fake UI rows */}
        <div className="space-y-3">
          {[80, 60, 90, 45].map((w, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg shrink-0 transition-colors duration-700"
                style={{ background: i === 0 ? beat.color + "30" : "rgba(255,255,255,0.04)" }} />
              <div
                className="h-2 rounded-full transition-all duration-700"
                style={{
                  width: `${w}%`,
                  background: i === 0
                    ? `linear-gradient(90deg,${beat.color}60,${beat.color}20)`
                    : "rgba(255,255,255,0.06)",
                }}
              />
            </div>
          ))}
        </div>

        {/* Step indicator */}
        <div className="flex gap-2 mt-8">
          {BEATS.map((_, i) => (
            <div
              key={i}
              className="h-0.5 rounded-full transition-all duration-500"
              style={{
                flex: i === active ? 3 : 1,
                background: i === active ? beat.color : "rgba(255,255,255,0.1)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function StickyStory() {
  const sectionRef = useRef(null);
  const [active, setActive]   = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      BEATS.forEach((_, i) => {
        ScrollTrigger.create({
          trigger: `.beat-${i}`,
          start: "top 60%",
          end: "bottom 40%",
          onEnter:      () => setActive(i),
          onEnterBack:  () => setActive(i),
        });
      });

      /* Animate each beat's text in */
      gsap.utils.toArray(".beat-text").forEach((el) => {
        gsap.fromTo(el,
          { opacity: 0, x: 40 },
          { opacity: 1, x: 0, duration: 0.75, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 72%", once: true } });
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-obsidian px-6"
    >
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 w-full h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg,transparent,rgba(0,211,187,0.3),transparent)" }} />

      <div className="max-w-6xl mx-auto">
        {/* Section intro — centered */}
        <div className="text-center py-24 md:py-32">
          <p className="text-xs font-mono tracking-[0.3em] uppercase text-ivory/30 mb-4">How it works</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-[-0.02em] text-ivory mb-4">
            From idea to{" "}
            <span className="font-serif italic text-accent">conversation</span>
          </h2>
          <p className="text-ivory/40 text-base md:text-lg font-light max-w-2xl mx-auto leading-relaxed">
            Four simple steps. One seamless experience. The most natural way to keep your team in sync.
          </p>
        </div>

        {/* Sticky left + scrolling right */}
        <div className="flex gap-12 lg:gap-20 pb-32">

          {/* LEFT — sticky mockup */}
          <div className="hidden lg:block w-1/2 shrink-0">
            <div className="sticky top-[calc(50vh-220px)]">
              <Mockup active={active} />
            </div>
          </div>

          {/* RIGHT — scrolling beats */}
          <div className="w-full lg:w-1/2 flex flex-col">
            {BEATS.map((beat, i) => {
              const Icon = beat.icon;
              return (
                <div
                  key={i}
                  className={`beat-${i} min-h-[70vh] flex flex-col justify-center`}
                >
                  <div className="beat-text">
                    <div className="flex items-center gap-4 mb-6">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: beat.color + "18", border: `1px solid ${beat.color}28` }}
                      >
                        <Icon size={18} style={{ color: beat.color }} />
                      </div>
                      <span className="font-mono text-[11px] font-bold tracking-[0.2em] uppercase"
                        style={{ color: beat.color + "80" }}>
                        Step {beat.step}
                      </span>
                    </div>

                    <h3 className="font-display text-3xl md:text-4xl font-bold text-ivory tracking-tight mb-4">
                      {beat.title}
                    </h3>
                    <p className="text-ivory/45 text-base md:text-lg leading-relaxed font-light max-w-md">
                      {beat.body}
                    </p>

                    {/* Mobile mockup preview */}
                    <div className="lg:hidden mt-8">
                      <Mockup active={i} />
                    </div>

                    <div className="mt-8 h-px w-12 rounded-full"
                      style={{ background: `linear-gradient(90deg,${beat.color}50,transparent)` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
