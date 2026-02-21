import React from "react";
import { Zap, Layers, Shield } from "lucide-react";
import NavBar from "../NavBar";

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
    <div>
       <NavBar/>

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

        <div className="relative px-6 bg-[#050505] overflow-hidden">
          {/* Atmospheric Background Glow for this specific section */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-4xl font-bold mb-4 tracking-tight">
                  Our Core Values
                </h2>
                <p className="text-gray-500 max-w-md text-lg">
                  The principles that guide every line of code we write and
                  every feature we ship to power ConvoX.
                </p>
              </div>
              {/* Decorative blue line */}
              <div className="hidden md:block h-[1px] flex-1 bg-gradient-to-r from-blue-500/50 to-transparent ml-12 mb-4" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="relative bg-[#0a0a0a]/60 backdrop-blur-md border border-white/5 p-8 rounded-3xl hover:border-blue-500/40 transition-all duration-500 group overflow-hidden"
                >
                  {/* Subtle inner glow that follows the mouse/hover */}
                  <div className="absolute -inset-px bg-gradient-to-b from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Main Card Glow */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition duration-700" />

                  <div className="relative z-10">
                    {/* Icon Container with Blue Glass effect */}
                    <div className="w-16 h-16 bg-blue-950/40 rounded-2xl flex items-center justify-center mb-8 border border-blue-500/30 group-hover:scale-110 group-hover:bg-blue-600/30 group-hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all duration-500">
                      {value.icon}
                    </div>

                    <h3 className="text-2xl font-bold mb-4 group-hover:text-blue-400 transition-colors duration-300">
                      {value.title}
                    </h3>

                    <p className="text-gray-400 leading-relaxed text-base group-hover:text-gray-300 transition-colors duration-300">
                      {value.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
    </div>
  );
};

export default AboutSection;
