"use client";
import React from "react";
import { motion } from "framer-motion";

const cards = [
  {
    color: "text-blue-400",
    hover: "hover:border-blue-500/50",
    emoji: "�",
    title: "Chat Analytics",
    desc: "Message volume, peak hours, most active users, average response time — all in one place.",
  },
  {
    color: "text-purple-400",
    hover: "hover:border-purple-500/50",
    emoji: "�",
    title: "Team Activity Insights",
    desc: "See who's driving conversations, identify silent members, and track team collaboration patterns.",
  },
  {
    color: "text-green-400",
    hover: "hover:border-green-500/50",
    emoji: "�",
    title: "Performance Dashboard",
    desc: "Real-time overview of system health, active users, message throughput, and uptime metrics.",
  },
  {
    color: "text-orange-400",
    hover: "hover:border-orange-500/50",
    emoji: "�",
    title: "Engagement Reports",
    desc: "Weekly / monthly reports with trends, top channels, sentiment overview, and team pulse.",
  },
];

const Analytics = () => {
  return (
    <div className="py-16 md:py-24 bg-[#05050A] text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Powerful{" "}
            <span className="text-blue-500">Analytics &amp; Insights</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Understand how your team communicates, track engagement, and make
            better decisions with real-time data.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1],
                delay: i * 0.1,
              }}
              className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 ${card.hover} hover:-translate-y-1 transition-all duration-300 group`}
            >
              <div className={`${card.color} mb-4 text-2xl`}>{card.emoji}</div>
              <h3 className="text-xl font-semibold mb-3">{card.title}</h3>
              <p className="text-gray-400">{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
