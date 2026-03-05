"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1], delay },
});

export default function HeroSection() {
  return (
    <section className="relative w-full min-h-[90vh] bg-[#05050A] text-white overflow-hidden flex flex-col items-center justify-center font-sans selection:bg-cyan-500/30 py-20">
      {/* --- Background Effects --- */}
      <div className="absolute inset-0 z-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.5, scale: 1 }}
          transition={{ duration: 1.8, ease: "easeOut" }}
          className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-175 h-125 bg-cyan-600/15 rounded-full blur-[140px] pointer-events-none"
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[64px_64px] mask-[radial-gradient(ellipse_at_center,black_40%,transparent_100%)] pointer-events-none" />
      </div>

      {/* --- Main Content --- */}
      <div className="relative z-10 px-6 max-w-4xl mx-auto text-center flex flex-col items-center">
        {/* Badge */}
        <motion.div
          {...fadeUp(0.1)}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-semibold tracking-widest uppercase text-slate-300 mb-10"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          Now in Public Beta
        </motion.div>

        {/* Heading */}
        <motion.h1
          {...fadeUp(0.22)}
          className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-white mb-6 leading-[1.05]"
        >
          The Ultimate Ecosystem <br />
          <span className="text-cyan-400">for Students &amp; Developers</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          {...fadeUp(0.38)}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Code, Collaborate, and Connect in one place. The digital home for the
          next generation of builders.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.52 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/register"
            className="px-8 py-4 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-xl transition-all duration-200 shadow-[0_10px_40px_-10px_rgba(34,211,238,0.5)] hover:shadow-[0_20px_60px_-15px_rgba(34,211,238,0.6)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 text-base"
          >
            Get Started for Free
          </Link>
          <Link
            href="#demo"
            className="px-8 py-4 bg-[#1a1a2e] hover:bg-[#1f1f35] text-white font-bold rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 text-base"
          >
            View Demo
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
