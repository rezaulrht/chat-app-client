"use client";

/**
 * QABadge — status indicator for question-type posts
 * status: "open" | "answered" | "resolved"
 */
const CONFIG = {
  open: {
    label: "Open",
    dot: "bg-amber-400",
    text: "text-amber-400/90",
    ring: "ring-amber-400/20",
  },
  answered: {
    label: "Answered",
    dot: "bg-blue-400",
    text: "text-blue-400/90",
    ring: "ring-blue-400/20",
  },
  resolved: {
    label: "Resolved",
    dot: "bg-emerald-400",
    text: "text-emerald-400/90",
    ring: "ring-emerald-400/20",
  },
};

export default function QABadge({ status = "open", className = "" }) {
  const cfg = CONFIG[status] ?? CONFIG.open;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ring-1 ${cfg.ring} bg-white/[0.04] ${cfg.text} text-[10px] font-mono font-bold uppercase tracking-wider ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
