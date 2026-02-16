"use client";

import React from "react";
import {
  Github,
  Slack,
  MessageCircle,
  Share2,
  Database,
  Globe,
} from "lucide-react";

const integrations = [
  {
    icon: <Github className="w-6 h-6 text-white" />,
    name: "GitHub",
    status: "Native",
    description:
      "Receive real-time PR notifications and commit updates directly in your chat rooms.",
  },
  {
    icon: <Slack className="w-6 h-6 text-[#4A154B]" />,
    name: "Slack",
    status: "Bridge",
    description:
      "Sync channels across platforms to keep your workspace communication unified.",
  },
  {
    icon: <MessageCircle className="w-6 h-6 text-[#5865F2]" />,
    name: "Discord",
    status: "Hook",
    description:
      "Connect community servers and automate announcements with simple webhooks.",
  },
  {
    icon: <Database className="w-6 h-6 text-blue-400" />,
    name: "Webhooks",
    status: "Custom",
    description:
      "Build custom integrations for any service using our robust, developer-friendly API.",
  },
];

export default function Integrations() {
  return (
    <section className="relative w-full py-10 bg-[#05050A] text-white overflow-hidden font-sans selection:bg-blue-500/30 border-t border-white/5">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/20 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
            <Share2 className="w-3 h-3" /> Ecosystem
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6">
            Connected to your <span className="text-blue-500">workflow.</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            ConvoX doesn’t live in a vacuum. Connect with the tools you already
            use and turn your workflow into a seamless productivity hub.
          </p>
        </div>

        {/* Integration Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {integrations.map((app, index) => (
            <div
              key={index}
              className="group p-8 bg-[#0F1117] border border-white/5 rounded-3xl hover:border-blue-500/30 transition-all duration-300 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-slate-800 transition-colors border border-white/5">
                {app.icon}
              </div>
              <div className="mb-2">
                <span className="text-[10px] font-bold uppercase tracking-tighter text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">
                  {app.status}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-200">
                {app.name}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {app.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
