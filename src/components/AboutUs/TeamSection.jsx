/* eslint-disable @next/next/no-img-element */
import React from "react";

const TeamSection = () => {
  const team = [
    {
      name: "Marcus Chen",
      role: "FOUNDER & CEO",
      bio: "Former infrastructure lead at several tech giants. Passionate about system architecture and distributed computing.",
      image: "/marcus.jpg", // Replace with your actual image paths
    },
    {
      name: "Elena Rodriguez",
      role: "HEAD OF PRODUCT DESIGN",
      bio: "Award-winning UX designer focused on creating intuitive interfaces for complex communication workflows.",
      image: "/elena.jpg",
    },
    {
      name: "David Park",
      role: "CHIEF TECHNOLOGY OFFICER",
      bio: "Specialist in real-time networking and end-to-end encryption protocols. Obsessed with low latency.",
      image: "/david.jpg",
    },
  ];

  return (
    <section className="bg-[#0a0a0a] text-white py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
            The Minds Behind <span className="text-white">ConvoX</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            We are a globally distributed team of designers, engineers, and
            visionaries obsessed with the future of work.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {team.map((member, index) => (
            <div key={index} className="group">
              {/* Image Container */}
              <div className="relative aspect-square overflow-hidden rounded-[2rem] mb-8 bg-[#1a1a1a]">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover transition-all duration-700 ease-in-out scale-110 group-hover:scale-100"
                />
                {/* Subtle overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              {/* Text Content */}
              <div className="space-y-2">
                <h3 className="text-2xl font-bold tracking-tight group-hover:text-blue-400 transition-colors">
                  {member.name}
                </h3>
                <p className="text-blue-500 text-xs font-bold uppercase tracking-widest">
                  {member.role}
                </p>
                <p className="text-gray-500 text-sm leading-relaxed pt-2">
                  {member.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
