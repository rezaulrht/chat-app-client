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
    <div className="bg-[#0a0a0a] text-white font-sans">
      {/* Hero Section */}
      <section className="relative py-24 px-6 flex flex-col items-center text-center overflow-hidden">
        {/* Subtle radial gradient background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(29,78,216,0.15),transparent_70%)]" />

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

      {/* Values Section */}
      <section className="bg-black py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Core Values</h2>
            <p className="text-gray-500 max-w-md">
              The principles that guide every line of code we write and every
              feature we ship.
            </p>
            <div className="h-[1px] bg-gray-800 w-full mt-8" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-[#111111] border border-gray-800 p-8 rounded-2xl hover:border-gray-700 transition-colors group"
              >
                <div className="w-12 h-12 bg-blue-900/20 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{value.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutSection;
