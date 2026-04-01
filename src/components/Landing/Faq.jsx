"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronDown } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const DEEP = "var(--color-slate-surface)";

const faqs = [
  {
    question: "What makes ConvoX different from Slack or Discord?",
    answer: "ConvoX is built from the ground up for speed — sub-50ms message delivery, instant typing indicators, scheduled messages, and full message edit/delete control. We've stripped away the bloat to give you a clean, fast, and focused communication experience tailored for modern teams.",
  },
  {
    question: "How does real-time messaging work in ConvoX?",
    answer: "ConvoX uses WebSocket connections via Socket.IO for persistent, bidirectional communication. Messages, typing indicators, read receipts, and presence updates are all pushed instantly — no polling, no delays. Everything syncs in real-time across all connected clients.",
  },
  {
    question: "Can I schedule messages to send later?",
    answer: "Yes! ConvoX includes a built-in message scheduler. You can compose a message and pick the exact date and time for it to be sent — perfect for reaching teammates in different timezones or queuing up morning stand-up reminders.",
  },
  {
    question: "How do group chats and workspaces work?",
    answer: "You can create group conversations with custom names, avatars, and member management. Admins can add/remove members, and every group acts as a focused workspace. Organized channels keep discussions on-topic while threaded replies prevent noise.",
  },
  {
    question: "Is ConvoX open source? Can I self-host it?",
    answer: "ConvoX is built with Next.js, Node.js, MongoDB, and Socket.IO. The codebase is designed to be transparent and developer-friendly. You can review the architecture, contribute, or deploy your own instance with full control over your data and infrastructure.",
  },
  {
    question: "What about security and data privacy?",
    answer: "All messages are encrypted in transit via TLS. Authentication is handled through secure session management with Passport.js, and passwords are hashed with bcrypt. We use Redis for session caching and rate limiting to prevent abuse. Your data stays yours.",
  },
];

export default function Faq() {
  const sectionRef = useRef(null);
  const [openIndex, setOpenIndex] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".faq-item",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="bg-obsidian py-24 md:py-32 px-6 border-t border-white/[0.03]">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-[-0.02em] text-ivory mb-4">
            Frequently asked <span className="font-serif italic text-accent">questions</span>
          </h2>
          <p className="text-ivory/40 text-base md:text-lg font-light leading-relaxed">
            Everything you need to know about ConvoX
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`faq-item rounded-2xl overflow-hidden transition-colors duration-300 ${openIndex === index ? "glass-card" : "glass-panel"}`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                className="w-full flex items-center justify-between p-6 text-left outline-none group"
              >
                <span className="text-base font-display font-semibold text-ivory/80 group-hover:text-ivory transition-colors pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  size={18}
                  className="shrink-0 transition-transform duration-300 text-ivory/30"
                  style={{ transform: openIndex === index ? "rotate(180deg)" : "rotate(0deg)" }}
                />
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 text-ivory/40 text-sm leading-relaxed border-t border-white/[0.04] pt-4">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
