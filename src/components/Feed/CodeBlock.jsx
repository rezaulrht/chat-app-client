"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";

const LANG_LABELS = {
  js: "javascript",
  ts: "typescript",
  jsx: "jsx",
  tsx: "tsx",
  py: "python",
  sh: "bash",
  bash: "bash",
  shell: "bash",
  zsh: "bash",
  md: "markdown",
  yml: "yaml",
  yaml: "yaml",
};

function normalizeLanguage(lang = "") {
  const l = lang.toLowerCase();
  return LANG_LABELS[l] ?? (l || "text");
}

/**
 * CodeBlock — VS Code-style syntax-highlighted code block.
 *
 * @param {string}  language  - Language identifier (e.g. "javascript")
 * @param {string}  filename  - Optional filename shown in the header
 * @param {boolean} showLines - Show line numbers (default true)
 * @param {*}       children  - Code string
 */
export default function CodeBlock({
  language = "text",
  filename,
  showLines = true,
  children,
}) {
  const [copied, setCopied] = useState(false);
  const lang = normalizeLanguage(language);
  const code = String(children ?? "").replace(/\n$/, "");

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="not-prose rounded-xl overflow-hidden ring-1 ring-white/[0.1] my-3 text-[12px] group/codeblock">
      {/* ── Header bar ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1a1a1a] border-b border-white/[0.07]">
        <div className="flex items-center gap-2">
          {/* Traffic-light dots */}
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
          </div>
          {filename && (
            <span className="font-mono text-[11px] text-ivory/40 ml-2">
              {filename}
            </span>
          )}
          {!filename && lang !== "text" && (
            <span className="font-mono text-[11px] text-ivory/30 ml-2 uppercase tracking-wider">
              {lang}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className={`flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded-md transition-all duration-150 ${
            copied
              ? "text-accent bg-accent/10"
              : "text-ivory/25 hover:text-ivory/60 hover:bg-white/[0.06]"
          }`}
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* ── Code area ──────────────────────────────────────────────────── */}
      <SyntaxHighlighter
        language={lang}
        style={vscDarkPlus}
        showLineNumbers={showLines}
        wrapLines
        customStyle={{
          margin: 0,
          borderRadius: 0,
          fontSize: "12px",
          lineHeight: "1.6",
          background: "#1E1E1E",
          padding: "14px 0",
          maxHeight: "380px",
          overflowY: "auto",
        }}
        lineNumberStyle={{
          minWidth: "3em",
          paddingRight: "1.5em",
          color: "rgba(255,255,255,0.18)",
          userSelect: "none",
          fontStyle: "normal",
        }}
        codeTagProps={{
          style: {
            fontFamily: "var(--font-mono, 'IBM Plex Mono', monospace)",
            // Hard-reset: prevent any parent [&_code]: selectors from bleeding in
            background: "transparent",
            border: "none",
            padding: 0,
            borderRadius: 0,
          },
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
