"use client";
import WordSpyTimer from "./WordSpyTimer";
import useWordSpyStore from "@/stores/wordSpyStore";

const WordSpyWordReveal = () => {
  const { myWord, phaseEndsAt } = useWordSpyStore();
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 p-6">
      <WordSpyTimer phaseEndsAt={phaseEndsAt} totalDurationMs={8000} />
      <div className="text-center">
        <p className="text-white/40 text-sm uppercase tracking-widest mb-4">Your word is</p>
        <div className="text-5xl font-black text-white tracking-tight">{myWord || "—"}</div>
        <p className="text-white/30 text-sm mt-4">Memorize it. Don't share it.</p>
      </div>
      <p className="text-white/20 text-xs">Writing hints begins shortly...</p>
    </div>
  );
};

export default WordSpyWordReveal;
