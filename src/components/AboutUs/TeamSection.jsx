"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ACCENT = "#00d3bb";
const DEEP   = "#12121a";

const team = [
  {
    name: "Marcus Chen",
    role: "FOUNDER & CEO",
    bio: "Former infrastructure lead at several tech giants. Passionate about system architecture and distributed computing.",
    image: "/marcus.jpg",
  },
  {
    name: "Elena Rodriguez",
    role: "HEAD OF PRODUCT DESIGN",
    bio: "Award-winning UX designer focused on creating intuitive interfaces for complex communication workflows.",
    image: "/elena.jpg",
  },
  {
    name: "David Park",
    role: "CHIEF TECHNOLOGY OFFICER",
    bio: "Specialist in real-time networking and end-to-end encryption protocols. Obsessed with low latency.",
    image: "/david.jpg",
  },
];

const TeamSection = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* Heading fade in */
      gsap.fromTo(
        sectionRef.current?.querySelector(".team-head"),
        { opacity: 0, y: 28, filter: "blur(5px)" },
        {
          opacity: 1, y: 0, filter: "blur(0px)", duration: 0.75, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 78%" },
        }
      );

      /* Cards stagger slide up */
      gsap.fromTo(
        sectionRef.current?.querySelectorAll(".team-card"),
        { opacity: 0, y: 55, scale: 0.95 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.8, stagger: 0.15, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 72%" },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="bg-obsidian text-ivory py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="team-head text-center mb-20">
          <h2 className="font-display text-4xl md:text-6xl font-bold mb-6 tracking-[-0.02em]">
            The minds behind <span className="font-serif italic text-accent">ConvoX</span>
          </h2>
          <p className="text-ivory/40 max-w-2xl mx-auto text-lg leading-relaxed font-light">
            We are a globally distributed team of designers, engineers, and visionaries obsessed with the future of work.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {team.map((member, index) => (
            <div key={index} className="team-card group">
              <div className="relative aspect-square overflow-hidden rounded-3xl mb-8 border border-white/[0.05]" style={{ background: DEEP }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover transition-all duration-700 ease-in-out scale-110 group-hover:scale-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              <div className="space-y-2">
                <h3 className="font-display text-2xl font-bold tracking-[-0.01em] text-ivory group-hover:text-accent transition-colors">
                  {member.name}
                </h3>
                <p className="text-xs font-bold uppercase tracking-widest font-mono" style={{ color: ACCENT }}>
                  {member.role}
                </p>
                <p className="text-ivory/40 text-sm leading-relaxed pt-2 font-light">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
