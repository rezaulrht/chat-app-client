"use client";
import { useState } from "react";
import useWordSpyStore from "@/stores/wordSpyStore";
import useAuth from "@/hooks/useAuth";

const WordSpyReveal = ({ onNextRound, onEndGame }) => {
  const { revealData, hostId, round, maxRounds } = useWordSpyStore();
  const { user } = useAuth();
  const [revealed, setRevealed] = useState(false);

  const myId = String(user?._id || user?.id || "");
  const isHost = myId === String(hostId);

  if (!revealData) return (
    <div className="flex items-center justify-center h-full">
      <p className="text-white/40 text-sm animate-pulse">Loading reveal...</p>
    </div>
  );

  const { aiReveal, impostorId, impostorName, realWord, impostorWord, correct, scores } = revealData;
  const isImpostor = myId === String(impostorId);

  // Four distinct outcome messages based on role + result
  const outcomeConfig = (() => {
    if (isImpostor && !correct) return {
      text: "Masterful deception — you fooled them all!",
      color: "text-green-400",
      border: "border-green-500/30 bg-green-500/10",
    };
    if (isImpostor && correct) return {
      text: "Busted! They saw right through you.",
      color: "text-red-400",
      border: "border-red-500/30 bg-red-500/10",
    };
    if (!isImpostor && correct) return {
      text: "Sharp eyes — the crowd caught the spy!",
      color: "text-green-400",
      border: "border-green-500/30 bg-green-500/10",
    };
    return {
      text: "The impostor fooled everyone. Better luck next round!",
      color: "text-red-400",
      border: "border-red-500/30 bg-red-500/10",
    };
  })();

  return (
    <div className="flex flex-col h-full p-6 gap-5 overflow-y-auto">
      <div className="text-center">
        <p className="text-accent text-xs uppercase tracking-widest mb-1">Round {round} Reveal</p>
        <h2 className="text-white font-bold text-xl">The Verdict</h2>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
        {aiReveal}
      </div>
      {!revealed ? (
        <button onClick={() => setRevealed(true)}
          className="w-full py-3 bg-accent hover:bg-accent/80 text-obsidian font-semibold rounded-xl">
          Reveal the Impostor
        </button>
      ) : (
        <div className={`p-4 rounded-2xl border text-center ${outcomeConfig.border}`}>
          <p className="text-white/50 text-xs mb-1">The impostor was</p>
          <p className="text-2xl font-black text-white">{impostorName}</p>
          <p className="text-white/40 text-sm mt-1">
            Their word: <span className="text-white font-medium">{impostorWord}</span>
            {" · "}Real word: <span className="text-white font-medium">{realWord}</span>
          </p>
          <p className={`mt-3 text-sm font-semibold ${outcomeConfig.color}`}>
            {outcomeConfig.text}
          </p>
        </div>
      )}
      <div>
        <p className="text-white/40 text-xs mb-2">Scores this session</p>
        <div className="space-y-2">
          {[...scores].sort((a, b) => b.score - a.score).map((s) => (
            <div key={String(s.userId)} className="flex items-center gap-3">
              <span className="text-white/70 text-sm flex-1">{s.displayName}</span>
              <span className="text-accent font-mono text-sm">{s.score} pts</span>
            </div>
          ))}
        </div>
      </div>
      {isHost && (
        <div className="flex gap-3 mt-auto">
          {round < maxRounds && (
            <button onClick={onNextRound}
              className="flex-1 py-2.5 bg-accent hover:bg-accent/80 text-obsidian font-semibold rounded-xl text-sm">
              Next Round ({round}/{maxRounds})
            </button>
          )}
          <button onClick={onEndGame}
            className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 font-semibold rounded-xl text-sm border border-white/10">
            End Game
          </button>
        </div>
      )}
    </div>
  );
};

export default WordSpyReveal;
