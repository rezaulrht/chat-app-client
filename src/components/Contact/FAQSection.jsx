"use client";

import React, { useState, useRef } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect } from "react";

gsap.registerPlugin(ScrollTrigger);

const ACCENT = "#00d3bb";
const DEEP = "#12121a";

const faqs = [
  {
    q: "What support channels are available?",
    a: "We offer email support, live chat during business hours, and a comprehensive help center with guides and tutorials. Enterprise plans include priority support with a dedicated account manager.",
  },
  {
    q: "How quickly can I expect a response?",
    a: "Free-tier users typically receive a response within 24 hours. Pro users within 4 hours. Enterprise customers receive priority support with an average response time under 1 hour.",
  },
  {
    q: "Can I request a feature or integration?",
    a: "Absolutely! We love community feedback. You can submit feature requests through our public roadmap board or contact us directly. Many of our recent updates were inspired by user suggestions.",
  },
  {
    q: "Do you offer onboarding assistance?",
    a: "Yes — all paid plans include a guided onboarding session. For Enterprise customers, we provide a full white-glove migration and setup service tailored to your team's workflow.",
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(cardsRef.current.filter(Boolean), {
        y: 30,
        opacity: 0,
        stagger: 0.1,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="bg-obsidian py-24 px-6 border-t border-white/[0.04]">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] rounded-full px-4 py-1.5 mb-6">
            <HelpCircle className="w-3.5 h-3.5" style={{ color: ACCENT }} />
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-ivory/40">Support FAQ</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-ivory tracking-[-0.02em]">
            Before you <span className="font-serif italic text-accent">reach out</span>
          </h2>
          <p className="text-ivory/30 mt-4 text-base max-w-lg mx-auto leading-relaxed">
            Quick answers to the most common support questions.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                ref={(el) => (cardsRef.current[i] = el)}
                className="border border-white/[0.06] rounded-2xl overflow-hidden transition-colors"
                style={{ background: isOpen ? DEEP : "transparent" }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                >
                  <span className="font-display font-bold text-ivory/80 text-sm">{faq.q}</span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-4 h-4 text-ivory/30" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-6 text-ivory/40 text-sm leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
