"use client";
import { useState } from "react";
import { Send, Check } from "lucide-react";
import WordSpyTimer from "./WordSpyTimer";
import useWordSpyStore from "@/stores/wordSpyStore";

const WordSpyHintPhase = ({ onSubmitHint }) => {
  const { players, phaseEndsAt, hintProgress, error } = useWordSpyStore();
  const [hint, setHint] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [localError, setLocalError] = useState("");

  const wordCount = hint.trim().split(/\s+/).filter(Boolean).length;
  const isValid = wordCount >= 4 && wordCount <= 20;

  const handleSubmit = () => {
    if (!isValid) return setLocalError("Hint must be 4–20 words");
    onSubmitHint(hint.trim());
    setSubmitted(true);
    setLocalError("");
  };

  return (
    <div className="flex flex-col h-full p-6 gap-4">
      <WordSpyTimer phaseEndsAt={phaseEndsAt} totalDurationMs={60000} />
      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold">Write your hint</h2>
        <span className="text-white/40 text-xs">{hintProgress.submitted}/{hintProgress.total} submitted</span>
      </div>
      <p className="text-white/40 text-sm">
        Prove you know your word without giving it away. Minimum 4 words.
      </p>
      {!submitted ? (
        <div className="flex flex-col gap-2">
          <textarea value={hint} onChange={(e) => { setHint(e.target.value); setLocalError(""); }}
            placeholder="e.g. 'It grows in tropical climates and is very sweet'"
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/20 focus:outline-none focus:border-accent text-sm resize-none"
          />
          <div className="flex items-center justify-between">
            <span className={`text-xs ${wordCount > 0 && !isValid ? "text-red-400" : "text-white/30"}`}>
              {wordCount} / 20 words
            </span>
            <button onClick={handleSubmit} disabled={!isValid}
              className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/80 disabled:opacity-40 text-obsidian rounded-lg text-sm font-medium transition-colors">
              <Send size={14} /> Submit
            </button>
          </div>
          {localError && <p className="text-red-400 text-sm">{localError}</p>}
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
          <Check size={18} className="text-green-400" />
          <p className="text-green-300 text-sm">Hint submitted — waiting for others...</p>
        </div>
      )}
      <div className="mt-auto">
        <p className="text-white/30 text-xs mb-2">Players</p>
        <div className="space-y-1.5">
          {players.filter((p) => p.isConnected).map((p) => (
            <div key={String(p.userId)} className="flex items-center gap-2">
              {p.avatar ? (
                <img src={p.avatar} alt={p.displayName} className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-xs text-accent flex-shrink-0">
                  {p.displayName?.[0]?.toUpperCase()}
                </div>
              )}
              <span className="text-white/60 text-sm">{p.displayName}</span>
            </div>
          ))}
        </div>
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
};

export default WordSpyHintPhase;
