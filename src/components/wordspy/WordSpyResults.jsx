"use client";
import { Trophy } from "lucide-react";
import useWordSpyStore from "@/stores/wordSpyStore";
import useAuth from "@/hooks/useAuth";

const WordSpyResults = ({ onPlayAgain, onDisband }) => {
  const { revealData, players, hostId } = useWordSpyStore();
  const { user } = useAuth();
  const myId = String(user?._id || user?.id || "");
  const isHost = myId === String(hostId);

  const scores = revealData?.scores
    ?? players.map((p) => ({ userId: p.userId, displayName: p.displayName, score: p.score }));
  const sorted = [...scores].sort((a, b) => b.score - a.score);
  const winner = sorted[0];

  return (
    <div className="flex flex-col items-center h-full p-6 gap-6 overflow-y-auto">
      <div className="text-center">
        <p className="text-yellow-400 text-xs uppercase tracking-widest mb-2">Game Over</p>
        <Trophy size={40} className="mx-auto text-yellow-400 mb-2" />
        <h2 className="text-ivory font-black text-2xl">{winner?.displayName} wins!</h2>
        <p className="text-ivory/40 text-sm">{winner?.score} points</p>
      </div>
      <div className="w-full max-w-sm space-y-3">
        {sorted.map((s, i) => (
          <div key={String(s.userId)} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-ivory/30 font-mono text-sm w-5">#{i + 1}</span>
            <span className="text-ivory text-sm flex-1">{s.displayName}</span>
            <span className="text-accent font-mono font-bold">{s.score}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <button onClick={onPlayAgain}
          className="px-8 py-3 bg-accent hover:bg-accent/80 text-obsidian font-semibold rounded-xl">
          Play Again
        </button>
        {isHost && (
          <button onClick={onDisband}
            className="px-6 py-3 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-white/40 hover:text-red-400 font-medium rounded-xl text-sm transition-colors">
            Disband
          </button>
        )}
      </div>
    </div>
  );
};

export default WordSpyResults;
