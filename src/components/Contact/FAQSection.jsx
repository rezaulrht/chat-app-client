"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQAccordion = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: "What are your support hours?",
      answer:
        "Our primary support team is available Monday through Friday, 8:00 AM to 6:00 PM Pacific Standard Time. For enterprise customers, we offer 24/7 emergency support channels.",
    },
    {
      question: "Can I request a custom demo for my team?",
      answer:
        "Absolutely! We offer personalized walk-throughs for teams looking to scale. Please reach out via our contact form to schedule a session with our product experts.",
    },
    {
      question: "Do you offer pricing for non-profits?",
      answer:
        "Yes! We are proud to offer discounted pricing for qualified non-profit organizations. Please contact our sales team for more details on how to apply.",
    },
  ];

  return (
    /* Background: Set to a very dark navy/black base */
    <div className="bg-[#050505] text-white py-24 px-6 font-sans relative overflow-hidden min-h-screen">
      {/* The Glow Effect: Large blurred radial gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-blue-600/10 blur-[150px] -z-0" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            Common Questions
          </h1>
          <p className="text-gray-400 text-lg">
            Quick answers to questions you might have.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-white/10 bg-[#0f0f0f]/80 backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-300 hover:border-white/20"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                className="w-full flex items-center justify-between p-6 md:p-8 text-left outline-none"
              >
                <span className="text-lg font-semibold tracking-tight">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  openIndex === index
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-6 md:px-8 pb-8 text-gray-400 leading-relaxed border-t border-white/5 pt-4">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQAccordion;
