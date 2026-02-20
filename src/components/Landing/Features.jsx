"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  Activity,
  CheckCheck,
  Reply,
  Search,
  CalendarClock,
  Users,
} from "lucide-react";

const features = [
  {
    icon: <MessageSquare className="w-6 h-6 text-blue-400" />,
    title: "One-to-One Chat",
    description:
      "Secure, private direct messaging with end-to-end encryption for total privacy.",
  },
  {
    icon: <Activity className="w-6 h-6 text-green-400" />,
    title: "Live Status",
    description:
      "Real-time online/offline indicators and 'last seen' timestamps so you know who's around.",
  },
  {
    icon: <CheckCheck className="w-6 h-6 text-blue-400" />,
    title: "Read Receipts",
    description:
      "Know exactly when your message has been delivered and seen with double-tick indicators.",
  },
  {
    icon: <Reply className="w-6 h-6 text-purple-400" />,
    title: "Threaded Replies",
    description:
      "Keep conversations organized by replying directly to specific messages in context.",
  },
  {
    icon: <Search className="w-6 h-6 text-slate-400" />,
    title: "Smart Search",
    description:
      "Instantly filter through message history, media, or find specific people in seconds.",
  },
  {
    icon: <CalendarClock className="w-6 h-6 text-orange-400" />,
    title: "Schedule Messages",
    description:
      "Draft messages now and schedule them to be sent automatically at a later time.",
  },
  {
    icon: <Users className="w-6 h-6 text-teal-400" />,
    title: "Group Chats",
    description:
      "Create groups for teams or friends with admin controls and unlimited members.",
  },
];

export default function Features() {
  const [showAll, setShowAll] = useState(false);

  // Logic: Show 7 items initially, or all 11 if expanded
  const visibleFeatures = showAll ? features : features.slice(0, 7);

  return (
    <section
      id="features"
      className="relative w-full py-10 bg-[#05050A] text-white overflow-hidden font-sans selection:bg-blue-500/30"
    >
      {/* --- Background Effects --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-200 h-150 bg-blue-600/10 rounded-full blur-[120px] opacity-30" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[64px_64px] mask-[radial-gradient(ellipse_at_center,black_50%,transparent_100%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-white">
            Everything you need to{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#13c8ec] via-[#13c8ec]/70 to-[#13c8ec]">
              connect.
            </span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Powerful features built for modern communication. Fast, reliable,
            and packed with tools to keep you in sync.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {visibleFeatures.map((feature, index) => (
            <div
              key={index}
              className="group p-6 bg-[#0F1117]/80 backdrop-blur-sm border border-white/5 hover:border-blue-500/30 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-900/10 flex flex-col h-full"
            >
              {/* Icon Box */}
              <div className="w-12 h-12 bg-slate-800/50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-500/10 transition-colors border border-white/5">
                {feature.icon}
              </div>

              <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-blue-400 transition-colors">
                {feature.title}
              </h3>

              <p className="text-slate-400 text-sm leading-relaxed flex-1">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
