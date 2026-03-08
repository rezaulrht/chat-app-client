"use client";

import { motion } from "framer-motion";

export default function AuthCard({
  children,
  className = "",
  accentLine = true,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`glass-panel rounded-2xl p-8 sm:p-10 shadow-2xl border border-white/10 relative overflow-hidden ${className}`}
    >
      {accentLine && (
        <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-primary to-transparent opacity-50" />
      )}
      {children}
    </motion.div>
  );
}
