import React from "react";
import { Zap, Layers, Shield } from "lucide-react";

const AboutSection = () => {
  const values = [
    {
      title: "Speed",
      description:
        "Sub-millisecond latency for instant global messaging. We believe latency is the enemy of creativity and momentum.",
      icon: <Zap className="w-6 h-6 text-blue-400" />,
    },
    {
      title: "Simplicity",
      description:
        "An interface that disappears, letting your work take center stage. We strip away the noise so you can focus on what matters.",
      icon: <Layers className="w-6 h-6 text-blue-400" />,
    },
    {
      title: "Security",
      description:
        "Enterprise-grade end-to-end encryption by default. Your data belongs to you, and we keep it that way through rigorous standards.",
      icon: <Shield className="w-6 h-6 text-blue-400" />,
    },
  ];

  return (
    <div className="bg-[#050505] text-white font-sans overflow-hidden">
      {/* Hero Section with Enhanced Blue Glow */}
      <section className="relative py-32 px-6 flex flex-col items-center text-center">
        {/* Primary Blue Atmospheric Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_0%,_rgba(29,78,216,0.2),transparent_70%)] -z-0" />

        {/* Secondary Side Glows */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full -z-0" />
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-cyan-600/10 blur-[100px] rounded-full -z-0" />

        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 mb-8">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest font-bold text-blue-400">
              Our Mission
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
            Connecting teams at the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-blue-300 to-blue-600">
              speed of thought.
            </span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            We empower global collaboration through seamless, real-time
            communication that feels as natural as being in the same room.
          </p>
        </div>
      </section>

      {/* Values Section with Glass-morphism cards */}
      <section className="relative py-24 px-6 bg-[#080808]">
        {/* Subtle Section Divider Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Core Values</h2>
            <p className="text-gray-500 max-w-md">
              The principles that guide every line of code we write and every
              feature we ship.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="relative bg-[#111111]/40 backdrop-blur-sm border border-white/5 p-8 rounded-3xl hover:border-blue-500/30 transition-all duration-300 group overflow-hidden"
              >
                {/* Individual Card Glow on Hover */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl blur opacity-0 group-hover:opacity-10 transition duration-500" />

                <div className="relative z-10">
                  <div className="w-14 h-14 bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20 group-hover:scale-110 group-hover:bg-blue-600/20 transition-all duration-300">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-4 group-hover:text-blue-300 transition-colors">
                    {value.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed text-sm">
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutSection;
