"use client";
import React, { useEffect, useRef } from "react";
import { Zap, Layers, Shield } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ACCENT   = "var(--color-accent)";
const DEEP     = "var(--color-slate-surface)";

const values = [
  {
    title: "Speed",
    description:
      "Sub-millisecond latency for instant global messaging. We believe latency is the enemy of creativity and momentum.",
    icon: <Zap className="w-6 h-6" style={{ color: ACCENT }} />,
    color: ACCENT,
  },
  {
    title: "Simplicity",
    description:
      "An interface that disappears, letting your work take center stage. We strip away the noise so you can focus on what matters.",
    icon: <Layers className="w-6 h-6" style={{ color: "#a78bfa" }} />,
    color: "#a78bfa",
  },
  {
    title: "Security",
    description:
      "Enterprise-grade end-to-end encryption by default. Your data belongs to you, and we keep it that way through rigorous standards.",
    icon: <Shield className="w-6 h-6" style={{ color: "#34d399" }} />,
    color: "#34d399",
  },
];

const AboutSection = () => {
  const heroRef   = useRef(null);
  const valuesRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* Hero elements stagger in */
      gsap.fromTo(
        heroRef.current?.querySelectorAll(".hero-el"),
        { opacity: 0, y: 32, filter: "blur(6px)" },
        {
          opacity: 1, y: 0, filter: "blur(0px)",
          duration: 0.75, stagger: 0.12, ease: "power3.out",
          delay: 0.1,
        }
      );

      /* Values heading */
      gsap.fromTo(
        valuesRef.current?.querySelector(".values-head"),
        { opacity: 0, y: 24 },
        {
          opacity: 1, y: 0, duration: 0.7, ease: "power3.out",
          scrollTrigger: { trigger: valuesRef.current, start: "top 78%" },
        }
      );

      /* Value cards fly up with stagger */
      gsap.fromTo(
        valuesRef.current?.querySelectorAll(".value-card"),
        { opacity: 0, y: 50, scale: 0.94 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.75, stagger: 0.13, ease: "power3.out",
          scrollTrigger: { trigger: valuesRef.current, start: "top 72%" },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="bg-obsidian text-ivory overflow-hidden">
      {/* Hero */}
      <section ref={heroRef} className="relative py-32 px-6 flex flex-col items-center text-center">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-0"
          style={{ background: "radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--color-accent) 8%, transparent), transparent 70%)" }}
        />
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-[120px] -z-0" style={{ background: "color-mix(in srgb, var(--color-accent) 6%, transparent)" }} />

        <div className="relative z-10 max-w-4xl">
          <div className="hero-el inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.03] mb-8">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: ACCENT }} />
            <span className="text-[10px] uppercase tracking-widest font-bold font-mono" style={{ color: ACCENT }}>
              Our Mission
            </span>
          </div>

          <h1 className="hero-el font-display text-3xl sm:text-5xl md:text-7xl font-bold tracking-[-0.02em] mb-8 leading-[1.1] text-ivory">
            Built by builders, <br />
            <span className="font-serif italic text-accent">for builders.</span>
          </h1>

          <p className="hero-el text-ivory/40 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-light">
            We empower global collaboration through seamless, real-time
            communication that feels as natural as being in the same room.
          </p>
        </div>
      </section>

      {/* Values */}
      <section ref={valuesRef} className="relative py-24 px-6">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px"
          style={{ background: "linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-accent) 25%, transparent), transparent)" }}
        />

        <div className="relative max-w-6xl mx-auto">
          <div className="values-head mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4 tracking-[-0.02em] text-ivory">
                Our Core Values
              </h2>
              <p className="text-ivory/30 max-w-md text-lg font-light">
                The principles that guide every line of code we write and
                every feature we ship to power ConvoX.
              </p>
            </div>
            <div
              className="hidden md:block h-px flex-1 ml-12 mb-4"
              style={{ background: "linear-gradient(90deg, color-mix(in srgb, var(--color-accent) 25%, transparent), transparent)" }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
              className="value-card relative rounded-3xl p-8 group overflow-hidden transition-all duration-500 hover:border-white/[0.1] page-card"
              >
                <div
                  className="absolute -inset-1 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition duration-700"
                  style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${value.color} 8%, transparent), transparent)` }}
                />
                <div className="relative z-10">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-all duration-500 group-hover:scale-110"
                    style={{ background: `color-mix(in srgb, ${value.color} 7%, transparent)`, border: `1px solid color-mix(in srgb, ${value.color} 15%, transparent)` }}
                  >
                    {value.icon}
                  </div>
                  <h3 className="font-display text-2xl font-bold mb-4 text-ivory group-hover:text-accent transition-colors duration-300">
                    {value.title}
                  </h3>
                  <p className="text-ivory/40 leading-relaxed text-base group-hover:text-ivory/50 transition-colors duration-300">
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutSection;
