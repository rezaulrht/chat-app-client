import React from "react";
import { MessageSquare, Layers, Rss } from "lucide-react";

const features = [
  {
    icon: <Layers className="w-8 h-8 text-[#13c8ec]" />,
    title: "Workspaces & Modules",
    description:
      "Deep-focus collaboration. Organize your hackathon, class study group, or dev team with dedicated workspaces and nested modules.",
    colSpan: "md:col-span-2 lg:col-span-2",
  },
  {
    icon: <Rss className="w-8 h-8 text-purple-400" />,
    title: "The Social Feed",
    description:
      "Share your mind, your code, and your journey. A developer-focused feed for snippets, achievements, and tech discussions.",
    colSpan: "md:col-span-2 lg:col-span-1",
  },
  {
    icon: <MessageSquare className="w-8 h-8 text-blue-400" />,
    title: "Unified Chat",
    description:
      "Never lose a conversation. Enjoy seamless direct messaging and simple group chats integrated directly into your workflow.",
    colSpan: "md:col-span-2 lg:col-span-3",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="relative w-full py-10 bg-[#05050A] text-white overflow-hidden font-sans selection:bg-[#13c8ec]/30"
    >
      {/* --- Background Effects --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-200 h-150 bg-[#13c8ec]/10 rounded-full blur-[120px] opacity-30" />
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
            A unified platform blending deep-focus workspaces, a developer-centric social feed, and instant messaging into one seamless experience.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group p-8 bg-[#0F1117]/80 backdrop-blur-sm border border-white/5 hover:border-[#13c8ec]/30 rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#13c8ec]/10 flex flex-col h-full ${feature.colSpan}`}
            >
              {/* Icon Box */}
              <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#13c8ec]/10 transition-colors border border-white/5">
                {feature.icon}
              </div>

              <h3 className="text-2xl font-semibold mb-4 text-white group-hover:text-[#13c8ec] transition-colors">
                {feature.title}
              </h3>

              <p className="text-slate-400 text-base leading-relaxed flex-1">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
