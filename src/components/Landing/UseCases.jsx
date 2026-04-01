"use client";
import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Code, GraduationCap, Users, Briefcase } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const ACCENT = "#00d3bb";

const cases = [
  {
    icon: Code,
    color: "#60a5fa",
    title: "Dev Squads",
    description: "Ship code faster by coordinating deployments and discussing PRs in a dedicated, distraction-free environment.",
  },
  {
    icon: GraduationCap,
    color: "#34d399",
    title: "Student Groups",
    description: "Organize project rooms, share resources, and keep everyone on the same page for your next big assignment.",
  },
  {
    icon: Users,
    color: "#a78bfa",
    title: "Communities",
    description: "Build vibrant hubs for your hobbies or interests with unlimited group members and powerful admin controls.",
  },
  {
    icon: Briefcase,
    color: "#fb923c",
    title: "Startups",
    description: "Keep your small team agile with instant messaging that scales as your business grows — without the high costs.",
  },
];

export default function UseCases() {
  const sectionRef = useRef(null);
  const cardsRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = cardsRef.current?.children;
      if (!cards) return;
      gsap.fromTo(
        cards,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-obsidian py-24 md:py-32 px-6 overflow-hidden">
      {/* Accent glow */}
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none" style={{ background: ACCENT + "08" }} />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-[-0.02em] text-ivory mb-4">
            Built for every <span className="font-serif italic text-accent">scenario</span>
          </h2>
          <p className="text-ivory/40 text-base md:text-lg font-light max-w-xl leading-relaxed">
            From professional collaboration to casual group hangouts, ConvoX adapts to how you work and play.
          </p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cases.map((useCase, index) => {
            const Icon = useCase.icon;
            return (
              <motion.div
                key={index}
                whileHover={{ y: -6, borderColor: useCase.color + "40" }}
                transition={{ duration: 0.3 }}
                className="group p-8 rounded-3xl transition-all duration-300 glass-card"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: useCase.color + "15", border: "1px solid " + useCase.color + "25" }}
                >
                  <Icon size={20} style={{ color: useCase.color }} />
                </div>
                <h3 className="font-display text-xl font-bold text-ivory mb-3 group-hover:text-accent transition-colors">
                  {useCase.title}
                </h3>
                <p className="text-ivory/40 text-sm leading-relaxed">
                  {useCase.description}
                </p>
                {/* Hover gradient line */}
                <div className="mt-6 h-[1px] w-0 group-hover:w-full transition-all duration-500 rounded-full" style={{ background: "linear-gradient(90deg, " + useCase.color + "60, transparent)" }} />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
