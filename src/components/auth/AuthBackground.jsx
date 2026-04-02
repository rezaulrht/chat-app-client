"use client";

import React from "react";
import { motion } from "framer-motion";

export default function AuthBackground({ variant = "primary" }) {
  const orbColor =
    variant === "error"
      ? "bg-red-500/10"
      : variant === "blue"
        ? "bg-blue-600/20"
        : "bg-primary/20";

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Breathing Orb */}
      <motion.div
        className={`absolute top-[-20%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] ${orbColor} rounded-full blur-[120px]`}
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[64px_64px] mask-[radial-gradient(ellipse_at_center,black_50%,transparent_100%)]" />
    </div>
  );
}
