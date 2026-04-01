"use client";
import { useState, useEffect } from "react";

/**
 * Countdown progress bar. Renders nothing if phaseEndsAt is null/undefined.
 */
const WordSpyTimer = ({ phaseEndsAt, totalDurationMs }) => {
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    if (!phaseEndsAt || !totalDurationMs) { setRemaining(null); return; }

    const tick = () => {
      const ms = new Date(phaseEndsAt).getTime() - Date.now();
      setRemaining(Math.max(0, ms));
    };
    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [phaseEndsAt, totalDurationMs]);

  if (remaining === null || !phaseEndsAt) return null;

  const pct = Math.min(100, (remaining / totalDurationMs) * 100);
  const seconds = Math.ceil(remaining / 1000);
  const isUrgent = pct < 20;

  return (
    <div className="w-full flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-250 ${isUrgent ? "bg-red-500" : "bg-accent"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-xs font-mono tabular-nums ${isUrgent ? "text-red-400" : "text-ivory/50"}`}>
        {seconds}s
      </span>
    </div>
  );
};

export default WordSpyTimer;
