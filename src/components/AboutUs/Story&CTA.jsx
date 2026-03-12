/* eslint-disable @next/next/no-img-element */
import React from "react";

const ACCENT = "#00d3bb";
const DEEP = "#12121a";

const StoryAndCTA = () => {
  return (
    <div className="bg-obsidian text-ivory py-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Our Story */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
          <div className="relative">
            <div
              className="rounded-3xl overflow-hidden border border-white/[0.06]"
              style={{ boxShadow: "0 32px 64px rgba(0,0,0,0.4)" }}
            >
              <img
                src="/team-working.png"
                alt="ConvoX Team"
                className="w-full h-auto"
              />
            </div>
            <div
              className="absolute -bottom-6 -right-6 hidden sm:flex border border-white/[0.08] p-4 rounded-2xl items-center gap-4"
              style={{
                background: DEEP,
                boxShadow: "0 16px 32px rgba(0,0,0,0.4)",
              }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: ACCENT + "20" }}
              >
                <span className="text-xl"></span>
              </div>
              <div>
                <p className="text-[10px] text-ivory/30 uppercase font-bold tracking-widest font-mono">
                  Global Users
                </p>
                <p className="text-xl font-display font-bold text-ivory">
                  2.4M+
                </p>
              </div>
            </div>
          </div>

          <div>
            <span
              className="text-[10px] uppercase tracking-[0.3em] font-bold font-mono mb-4 block"
              style={{ color: ACCENT }}
            >
              Our Story
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-8 leading-tight tracking-[-0.02em] text-ivory">
              From a side-project to a <br />{" "}
              <span className="font-serif italic text-accent">
                global standard.
              </span>
            </h2>

            <div className="space-y-6 text-ivory/40 leading-relaxed font-light">
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
                <div key={i}>
                  <p className="text-xl sm:text-2xl font-display font-bold text-ivory">
                    {stat.value}
                  </p>
                  <p className="text-[10px] text-ivory/30 uppercase tracking-widest mt-1 font-mono font-bold">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section
          className="relative rounded-[2.5rem] overflow-hidden border border-white/[0.06]"
          style={{ background: DEEP }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 0%, " +
                ACCENT +
                "15, transparent 70%)",
            }}
          />
          <div className="relative z-10 py-20 px-8 text-center">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 tracking-[-0.02em] text-ivory">
              Ready to sync your{" "}
              <span className="font-serif italic text-accent">team?</span>
            </h2>
            <p className="text-ivory/40 max-w-xl mx-auto mb-10 text-lg font-light leading-relaxed">
              Join over 2 million professionals who communicate with clarity and
              speed. Start your 14-day free trial today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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
