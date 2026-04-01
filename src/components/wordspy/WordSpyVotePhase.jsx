"use client";
import { useState } from "react";
import WordSpyTimer from "./WordSpyTimer";
import useWordSpyStore from "@/stores/wordSpyStore";
import useAuth from "@/hooks/useAuth";

const WordSpyVotePhase = ({ onSubmitVote }) => {
  const { players, hints, phaseEndsAt } = useWordSpyStore();
  const { user } = useAuth();
  const [voted, setVoted] = useState(null);
  const [voteCount, setVoteCount] = useState({ submitted: 0, total: 0 });

  // voteCount is updated via the parent passing it down, or via direct store subscription
  // Use the store for the total from connected players
  const connected = players.filter((p) => p.isConnected);
  const myId = String(user?._id || user?.id || "");

  const handleVote = (targetUserId) => {
    if (String(targetUserId) === myId) return;
    setVoted(String(targetUserId));
    onSubmitVote(String(targetUserId));
  };

  return (
    <div className="flex flex-col h-full p-6 gap-4">
      <WordSpyTimer phaseEndsAt={phaseEndsAt} totalDurationMs={45000} />
      <h2 className="text-ivory font-semibold">Who is the impostor?</h2>
      <div className="flex-1 overflow-y-auto space-y-3">
        <p className="text-ivory/40 text-xs uppercase tracking-widest">Hints</p>
        {hints.map((h) => (
          <div key={String(h.userId)} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-ivory/50 text-xs mb-1">{h.displayName}</p>
            <p className="text-ivory text-sm">{h.hint}</p>
          </div>
        ))}
        <p className="text-ivory/40 text-xs uppercase tracking-widest mt-4">Vote</p>
        {connected.filter((p) => String(p.userId) !== myId).map((p) => (
          <button key={String(p.userId)} onClick={() => handleVote(p.userId)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${voted === String(p.userId)
                ? "border-accent bg-accent/10 text-ivory"
                : "border-white/10 bg-white/5 text-ivory/70 hover:border-white/20 hover:bg-white/10"
              }`}>
            {p.avatar ? (
              <img src={p.avatar} alt={p.displayName} className="w-8 h-8 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs text-accent shrink-0">
                {p.displayName?.[0]?.toUpperCase()}
              </div>
            )}
            <span className="text-sm font-medium">{p.displayName}</span>
            {voted === String(p.userId) && <span className="ml-auto text-accent text-xs">Your vote</span>}
          </button>
        ))}
      </div>
    </div>
  );
};

export default WordSpyVotePhase;
