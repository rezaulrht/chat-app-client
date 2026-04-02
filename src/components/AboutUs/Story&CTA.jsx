"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ACCENT = "var(--color-accent)";
const DEEP = "var(--color-slate-surface)";

const StoryAndCTA = () => {
  const storyRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* Story: image slides from left, text from right */
      gsap.fromTo(
        storyRef.current?.querySelector(".story-img"),
        { opacity: 0, x: -60, rotateY: -8 },
        {
          opacity: 1, x: 0, rotateY: 0, duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: storyRef.current, start: "top 76%" },
        }
      );
      gsap.fromTo(
        storyRef.current?.querySelectorAll(".story-text-el"),
        { opacity: 0, x: 40 },
        {
          opacity: 1, x: 0, duration: 0.75, stagger: 0.1, ease: "power3.out",
          scrollTrigger: { trigger: storyRef.current, start: "top 74%" },
        }
      );

      /* Stats count-up feel — just fade in */
      gsap.fromTo(
        storyRef.current?.querySelectorAll(".stat-item"),
        { opacity: 0, y: 18 },
        {
          opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power3.out",
          scrollTrigger: { trigger: storyRef.current, start: "top 60%" },
        }
      );

      /* CTA block scale-up with glow */
      gsap.fromTo(
        ctaRef.current,
        { opacity: 0, y: 40, scale: 0.97 },
        {
          opacity: 1, y: 0, scale: 1, duration: 0.85, ease: "power3.out",
          scrollTrigger: { trigger: ctaRef.current, start: "top 80%" },
        }
      );
      gsap.fromTo(
        ctaRef.current?.querySelectorAll(".cta-el"),
        { opacity: 0, y: 20 },
        {
          opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power3.out",
          scrollTrigger: { trigger: ctaRef.current, start: "top 75%" },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="bg-obsidian text-ivory py-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Our Story */}
        <section ref={storyRef} className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-32">
          <div className="story-img relative" style={{ perspective: "800px" }}>
            <div
              className="rounded-3xl overflow-hidden border border-white/[0.06]"
              style={{ boxShadow: "0 32px 64px rgba(0,0,0,0.4)" }}
            >
              <img src="/team-working.png" alt="ConvoX Team" className="w-full h-auto" />
            </div>
            <div
              className="absolute -bottom-6 -right-6 hidden sm:flex p-4 rounded-2xl items-center gap-4 page-card"
              style={{ boxShadow: "0 16px 32px rgba(0,0,0,0.4)" }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--color-accent) 13%, transparent)" }}>
                <span className="text-xl">🌍</span>
              </div>
              <div>
                <p className="text-[10px] text-ivory/30 uppercase font-bold tracking-widest font-mono">Global Users</p>
                <p className="text-xl font-display font-bold text-ivory">2.4M+</p>
              </div>
            </div>
          </div>

          <div>
            <span className="story-text-el text-[10px] uppercase tracking-[0.3em] font-bold font-mono mb-4 block" style={{ color: ACCENT }}>
              Our Story
            </span>
            <h2 className="story-text-el font-display text-4xl md:text-5xl font-bold mb-8 leading-tight tracking-[-0.02em] text-ivory">
              From a side-project to a <br />
              <span className="font-serif italic text-accent">global standard.</span>
            </h2>

            <div className="story-text-el space-y-6 text-ivory/40 leading-relaxed font-light">
              <p>
                ConvoX started in a small apartment in 2026. We were frustrated
                by the tools available — clunky, slow, and overly complex. We
                wanted something that moved as fast as our ideas did.
              </p>
              <p>
                What began as a lightweight dev tool for internal use quickly
                caught the attention of our peers. They wanted the same speed,
                the same focus, and the same reliability.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 sm:gap-8 mt-12 pt-8 border-t border-white/[0.05]">
              {[
                { value: "2026", label: "Founded" },
                { value: "50+", label: "Team Members" },
                { value: "99.9%", label: "Uptime" },
              ].map((stat, i) => (
                <div key={i} className="stat-item">
                  <p className="text-xl sm:text-2xl font-display font-bold text-ivory">{stat.value}</p>
                  <p className="text-[10px] text-ivory/30 uppercase tracking-widest mt-1 font-mono font-bold">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section
          ref={ctaRef}
          className="relative rounded-[2.5rem] overflow-hidden page-card"
        >
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--color-accent) 8%, transparent), transparent 70%)" }}
          />
          <div className="relative z-10 py-20 px-8 text-center">
            <h2 className="cta-el font-display text-4xl md:text-5xl font-bold mb-6 tracking-[-0.02em] text-ivory">
              Ready to sync your <span className="font-serif italic text-accent">team?</span>
            </h2>
            <p className="cta-el text-ivory/40 max-w-xl mx-auto mb-10 text-lg font-light leading-relaxed">
              Join over 2 million professionals who communicate with clarity and
              speed. Start your 14-day free trial today.
            </p>
            <div className="cta-el flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="btn-cta-primary px-8 py-4 rounded-xl font-display font-bold text-sm">
                Get Started for Free
              </button>
              <button className="btn-cta-glass px-8 py-4 rounded-xl font-display font-bold text-sm">
                View Pricing
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default StoryAndCTA;
