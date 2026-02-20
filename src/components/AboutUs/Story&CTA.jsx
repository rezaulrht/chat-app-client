/* eslint-disable @next/next/no-img-element */
import React from "react";

const StoryAndCTA = () => {
  return (
    <div className="bg-[#050505] text-white font-sans py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Our Story Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
          {/* Image Side */}
          <div className="relative">
            <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <img
                src="/team-working.png"
                alt="ConvoX Team"
                className="w-full h-auto"
              />
            </div>
            {/* Floating Stats Badge */}
            <div className="absolute -bottom-6 -right-6 bg-[#111] border border-white/10 p-4 rounded-2xl shadow-xl flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-xl">🌐</span>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">
                  Global Users
                </p>
                <p className="text-xl font-bold">2.4M+</p>
              </div>
            </div>
          </div>

          {/* Text Side */}
          <div>
            <span className="text-blue-400 text-[10px] uppercase tracking-[0.3em] font-bold mb-4 block">
              Our Story
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
              From a side-project to a <br /> global standard.
            </h2>

            <div className="space-y-6 text-gray-400 leading-relaxed">
              <p>
                ConvoX started in a small apartment in 2026. We were frustrated
                by the tools available—clunky, slow, and overly complex. We
                wanted something that moved as fast as our ideas did.
              </p>
              <p>
                What began as a lightweight dev tool for internal use quickly
                caught the attention of our peers. They wanted the same speed,
                the same focus, and the same reliability.
              </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-white/5">
              <div>
                <p className="text-2xl font-bold">2026</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                  Founded
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold">50+</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                  Team Members
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold">99.9%</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                  Uptime
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Ready to Sync CTA Section */}
        <section className="relative rounded-[2.5rem] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-black border border-white/10 rounded-[2.5rem]" />
          <div className="relative z-10 py-20 px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to sync your team?
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-10 text-lg">
              Join over 2 million professionals who communicate with clarity and
              speed. Start your 14-day free trial today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                Get Started for Free
              </button>
              <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-xl font-bold transition-all">
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
