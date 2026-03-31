"use client";
import React, { useEffect, useRef } from "react";
import {
  Mail, MapPin, Send, AtSign, Camera, Rss, HelpCircle, ArrowRight,
} from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ACCENT = "var(--color-accent)";
const DEEP   = "var(--color-slate-surface)";

const ContactPage = () => {
  const headerRef = useRef(null);
  const formRef   = useRef(null);
  const sideRef   = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* Header stagger blur-fade */
      gsap.fromTo(
        headerRef.current?.querySelectorAll(".head-el"),
        { opacity: 0, y: 30, filter: "blur(6px)" },
        {
          opacity: 1, y: 0, filter: "blur(0px)",
          duration: 0.75, stagger: 0.12, ease: "power3.out", delay: 0.1,
        }
      );

      /* Form slides from left */
      gsap.fromTo(
        formRef.current,
        { opacity: 0, x: -50 },
        {
          opacity: 1, x: 0, duration: 0.85, ease: "power3.out",
          scrollTrigger: { trigger: formRef.current, start: "top 78%" },
        }
      );

      /* Sidebar cards stagger from right */
      gsap.fromTo(
        sideRef.current?.querySelectorAll(".side-card"),
        { opacity: 0, x: 50 },
        {
          opacity: 1, x: 0, duration: 0.75, stagger: 0.15, ease: "power3.out",
          scrollTrigger: { trigger: sideRef.current, start: "top 78%" },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="bg-obsidian text-ivory py-24 px-6 relative overflow-hidden min-h-screen">
      {/* Background glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] blur-[150px] -z-10"
        style={{ background: "color-mix(in srgb, var(--color-accent) 3%, transparent)" }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-16">
          <h1 className="head-el font-display text-3xl sm:text-5xl md:text-6xl font-bold mb-6 tracking-[-0.02em] text-ivory">
            Get in <span className="font-serif italic text-accent">touch</span>
          </h1>
          <p className="head-el text-ivory/40 max-w-2xl mx-auto text-lg leading-relaxed font-light">
            Have a question about our features or pricing? Need a custom
            solution for your enterprise? We&apos;re here to help you sync up.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Form */}
          <div
            ref={formRef}
            className="lg:col-span-7 border border-white/[0.06] p-5 sm:p-8 md:p-12 rounded-2xl sm:rounded-[2rem] relative"
            style={{ background: DEEP }}
          >
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  type="text"
                  placeholder="First Name"
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-5 py-4 focus:border-accent/50 focus:outline-none transition-all placeholder:text-ivory/20 text-sm text-ivory"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-5 py-4 focus:border-accent/50 focus:outline-none transition-all placeholder:text-ivory/20 text-sm text-ivory"
                />
              </div>

              <input
                type="email"
                placeholder="Work Email"
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-5 py-4 focus:border-accent/50 focus:outline-none transition-all placeholder:text-ivory/20 text-sm text-ivory"
              />

              <div className="relative">
                <select className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-5 py-4 appearance-none focus:border-accent/50 focus:outline-none text-ivory/40 text-sm">
                  <option>Select a topic...</option>
                  <option>Sales Inquiry</option>
                  <option>Technical Support</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-ivory/30 text-xs">&#9660;</div>
              </div>

              <textarea
                rows="5"
                placeholder="How can we help?"
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-5 py-4 focus:border-accent/50 focus:outline-none transition-all placeholder:text-ivory/20 text-sm text-ivory"
              />

              <button className="btn-cta-primary w-full py-4 rounded-xl font-display font-bold flex items-center justify-center gap-2 text-sm">
                Send Message <Send className="w-4 h-4" />
              </button>

              <p className="text-center text-[10px] text-ivory/20 mt-4 font-mono">
                By sending this message, you agree to our{" "}
                <span className="text-accent cursor-pointer hover:underline">Privacy Policy</span>.
              </p>
            </form>
          </div>

          {/* Right Side */}
          <div ref={sideRef} className="lg:col-span-5 space-y-8">
            {/* Contact Info */}
            <div className="side-card border border-white/[0.06] p-8 rounded-[2rem]" style={{ background: DEEP }}>
              <h3 className="font-display text-xl font-bold mb-8 text-ivory">Contact Information</h3>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "color-mix(in srgb, var(--color-accent) 8%, transparent)" }}>
                    <Mail className="w-5 h-5" style={{ color: ACCENT }} />
                  </div>
                  <div>
                    <p className="text-xs text-ivory/30 uppercase tracking-widest font-bold mb-1 font-mono">Email Us</p>
                    <p className="font-semibold text-ivory/80">hello@convox.com</p>
                    <p className="text-[11px] text-ivory/30 mt-1">We typically reply within 2 hours.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#a78bfa15" }}>
                    <MapPin className="w-5 h-5" style={{ color: "#a78bfa" }} />
                  </div>
                  <div>
                    <p className="text-xs text-ivory/30 uppercase tracking-widest font-bold mb-1 font-mono">Office</p>
                    <p className="font-semibold text-ivory/80">1200 Innovation Blvd</p>
                    <p className="text-[11px] text-ivory/30 mt-1">Suite 404, San Francisco, CA 94107</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-white/[0.04]">
                <p className="text-[10px] text-ivory/20 uppercase tracking-[0.3em] font-bold mb-6 font-mono">Follow Updates</p>
                <div className="flex gap-3">
                  {[AtSign, Camera, Rss].map((Icon, i) => (
                    <button
                      key={i}
                      className="w-10 h-10 bg-white/[0.03] rounded-full flex items-center justify-center hover:bg-white/[0.06] transition-colors border border-white/[0.05]"
                    >
                      <Icon className="w-4 h-4 text-ivory/40" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Common Questions */}
            <div className="side-card border border-white/[0.06] p-8 rounded-[2rem]" style={{ background: DEEP }}>
              <div className="flex items-center gap-2 mb-8">
                <HelpCircle className="w-5 h-5" style={{ color: ACCENT }} />
                <h3 className="font-display text-xl font-bold text-ivory">Common Questions</h3>
              </div>
              <ul className="space-y-4 text-sm text-ivory/40">
                {[
                  "How does the free trial work?",
                  "Can I migrate from Slack?",
                  "Is there an on-premise version?",
                ].map((q, i) => (
                  <li
                    key={i}
                    className="cursor-pointer hover:text-ivory transition-colors flex items-center justify-between group"
                  >
                    {q}
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </li>
                ))}
              </ul>
              <button
                className="mt-8 text-xs font-bold font-mono hover:text-ivory/80 transition-colors"
                style={{ color: ACCENT }}
              >
                Visit Help Center &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
