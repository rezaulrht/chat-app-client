"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

// ── Language label badge colours ──────────────────────────────────────────
const LANG_COLORS = {
  javascript: "text-amber-400/80  bg-amber-400/8  ring-amber-400/15",
  typescript: "text-blue-400/80   bg-blue-400/8   ring-blue-400/15",
  python: "text-emerald-400/80 bg-emerald-400/8 ring-emerald-400/15",
  rust: "text-orange-400/80 bg-orange-400/8 ring-orange-400/15",
  go: "text-cyan/80       bg-cyan/8       ring-cyan/15",
  css: "text-pink-400/80   bg-pink-400/8   ring-pink-400/15",
  html: "text-red-400/80    bg-red-400/8    ring-red-400/15",
  bash: "text-ivory/50      bg-white/[0.04] ring-white/[0.08]",
};
const langStyle = (lang = "") =>
  LANG_COLORS[lang.toLowerCase()] ??
  "text-ivory/40 bg-white/[0.04] ring-white/[0.07]";

/**
 * SnippetBlock — multi-file tabbed code viewer with syntax highlight + copy.
 *
 * @param {Array}   files  - [{ filename, language, code }]
 */
export default function SnippetBlock({ files = [] }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  if (files.length === 0) return null;

  const current = files[activeIdx];

  const handleCopy = () => {
    navigator.clipboard.writeText(current.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="rounded-2xl overflow-hidden ring-1 ring-white/[0.07] bg-deep font-mono text-sm">
      {/* ── Tab bar ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-0 border-b border-white/[0.06] bg-white/[0.02] overflow-x-auto scrollbar-hide">
        {files.map((f, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActiveIdx(i)}
            className={`shrink-0 flex items-center gap-1.5 px-4 py-2.5 text-[11px] font-mono transition-all duration-150 border-b-2 ${
              i === activeIdx
                ? "border-accent text-ivory bg-white/[0.04]"
                : "border-transparent text-ivory/30 hover:text-ivory/60 hover:bg-white/[0.03]"
            }`}
          >
            {/* Language badge */}
            <span
              className={`px-1.5 py-0 rounded text-[9px] font-bold uppercase tracking-wider ring-1 ${langStyle(f.language)}`}
            >
              {f.language ?? "txt"}
            </span>
            {f.filename}
          </button>
        ))}

        {/* Copy button pushed to the right */}
        <div className="ml-auto px-3 py-1.5 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            className={`flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-1 rounded-lg transition-all duration-150 ${
              copied
                ? "text-accent bg-accent/10"
                : "text-ivory/25 hover:text-ivory/60 bg-white/[0.04] hover:bg-white/[0.07]"
            }`}
          >
            {copied ? <Check size={11} /> : <Copy size={11} />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* ── Code area ────────────────────────────────────────────────── */}
      <div className="overflow-x-auto max-h-80">
        <table className="w-full text-[12px] leading-5">
          <tbody>
            {(current.code ?? "").split("\n").map((line, i) => (
              <tr key={i} className="group hover:bg-white/[0.02]">
                <td className="select-none text-ivory/15 text-right pr-4 pl-4 w-10 shrink-0 align-top pt-0.5">
                  {i + 1}
                </td>
                <td className="text-ivory/80 pr-6 align-top pt-0.5 whitespace-pre">
                  {/* TODO: replace with react-syntax-highlighter token rendering */}
                  {line || "\u00a0"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
