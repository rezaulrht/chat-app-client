"use client";

import React from "react";
import { Code, GraduationCap, Users, Briefcase } from "lucide-react";

const cases = [
  {
    icon: <Code className="w-6 h-6 text-blue-400" />,
    title: "Dev Squads",
    description:
      "Ship code faster by coordinating deployments and discussing PRs in a dedicated, distraction-free environment.",
  },
  {
    icon: <GraduationCap className="w-6 h-6 text-green-400" />,
    title: "Student Groups",
    description:
      "Organize project rooms, share resources, and keep everyone on the same page for your next big assignment.",
  },
  {
    icon: <Users className="w-6 h-6 text-purple-400" />,
    title: "Communities",
    description:
      "Build vibrant hubs for your hobbies or interests with unlimited group members and powerful admin controls.",
  },
  {
    icon: <Briefcase className="w-6 h-6 text-orange-400" />,
    title: "Startups",
    description:
      "Keep your small team agile with instant messaging that scales as your business grows—without the high costs.",
  },
];

export default function UseCases() {
  return (
    <section className="relative w-full py-24 bg-[#05050A] text-white font-sans selection:bg-blue-500/30">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Built for every <span className="text-blue-500">scenario.</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl">
            From professional collaboration to casual group hangouts, ConvoX
            adapts to how you work and play.
          </p>
        </div>

        {/* Use Case Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cases.map((useCase, index) => (
            <div
              key={index}
              className="group p-8 bg-[#0F1117] border border-white/5 rounded-2xl hover:bg-white/[0.02] transition-all duration-300"
            >
              <div className="w-12 h-12 bg-slate-800/50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {useCase.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-200">
                {useCase.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {useCase.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
