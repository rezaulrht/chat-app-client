"use client";

// Reputation levels & icons — keep in sync with server LEVELS in feed.controller.js
const LEVELS = [
  {
    label: "Newcomer",
    min: 0,
    max: 49,
    icon: "🌱",
    color: "text-emerald-400/80",
    ring: "ring-emerald-400/20",
  },
  {
    label: "Contributor",
    min: 50,
    max: 199,
    icon: "⚡",
    color: "text-blue-400/80",
    ring: "ring-blue-400/20",
  },
  {
    label: "Expert",
    min: 200,
    max: 499,
    icon: "🔥",
    color: "text-purple-400/80",
    ring: "ring-purple-400/20",
  },
  {
    label: "Legend",
    min: 500,
    max: Infinity,
    icon: "🏆",
    color: "text-amber-400/80",
    ring: "ring-amber-400/20",
  },
];

export function getLevel(reputation = 0) {
  return (
    LEVELS.find((l) => reputation >= l.min && reputation <= l.max) ?? LEVELS[0]
  );
}

/**
 * ReputationBadge
 * @param {number}  reputation
 * @param {"sm"|"md"|"lg"} size
 * @param {boolean} showLabel   - show level label text
 * @param {boolean} showPoints  - show numeric points
 */
export default function ReputationBadge({
  reputation = 0,
  size = "md",
  showLabel = false,
  showPoints = false,
}) {
  const level = getLevel(reputation);

  const iconSize =
    size === "sm" ? "text-[10px]" : size === "lg" ? "text-base" : "text-xs";
  const textSize =
    size === "sm"
      ? "text-[9px]"
      : size === "lg"
        ? "text-[11px]"
        : "text-[10px]";
  const padSize =
    size === "sm"
      ? "px-1.5 py-0.5"
      : size === "lg"
        ? "px-2.5 py-1"
        : "px-2 py-0.5";

  return (
    <span
      className={`inline-flex items-center gap-1 ${padSize} rounded-full ring-1 ${level.ring} bg-white/[0.04] ${level.color} font-mono font-bold uppercase tracking-wider ${textSize}`}
      title={`${level.label} — ${reputation} pts`}
    >
      <span className={iconSize}>{level.icon}</span>
      {showLabel && <span>{level.label}</span>}
      {showPoints && <span>{reputation} pts</span>}
    </span>
  );
}
