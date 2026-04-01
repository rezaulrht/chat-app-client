"use client";
import { useState, useRef, useEffect } from "react";
import { Palette } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { THEMES } from "@/context/ThemeContext";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 border ${
          open
            ? "bg-accent/10 border-accent/30 text-accent"
            : "bg-white/[0.04] border-white/[0.08] text-ivory/50 hover:text-ivory hover:bg-white/[0.07]"
        }`}
        aria-label="Switch theme"
        title="Switch theme"
      >
        <Palette size={14} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 p-3 bg-slate-surface rounded-2xl border border-white/[0.08] shadow-[0_16px_48px_rgba(0,0,0,0.35)] z-[120] w-[188px]">
          <p className="text-[9px] font-mono uppercase tracking-[0.12em] text-ivory/30 mb-2 px-0.5">
            Appearance
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {THEMES.map((t) => {
              const active = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    setOpen(false);
                  }}
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border transition-all text-left group ${
                    active
                      ? "border-accent/40 bg-accent/[0.08]"
                      : "border-white/[0.06] hover:border-white/[0.14] hover:bg-white/[0.04]"
                  }`}
                >
                  {/* Swatch: surface bg + accent dot */}
                  <div
                    className="w-6 h-6 rounded-lg shrink-0 border border-black/[0.12] flex items-center justify-center"
                    style={{ background: t.surface }}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: t.accent }}
                    />
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-[10px] font-display font-semibold leading-tight truncate ${active ? "text-accent" : "text-ivory/60 group-hover:text-ivory/80"}`}
                    >
                      {t.label}
                    </p>
                    <p className="text-[9px] font-mono text-ivory/25 leading-tight">
                      {t.mode}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
