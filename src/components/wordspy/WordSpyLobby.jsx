"use client";
import { useState } from "react";
import { Users, Crown, Wifi, WifiOff } from "lucide-react";
import WordSpyCategoryModal from "./WordSpyCategoryModal";
import useWordSpyStore from "@/stores/wordSpyStore";
import useAuth from "@/hooks/useAuth";

const WordSpyLobby = ({ onStart, onDisband }) => {
  const { players, hostId, error } = useWordSpyStore();
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const myId = String(user?._id || user?.id || "");
  const isHost = myId === String(hostId);
  const connectedCount = players.filter((p) => p.isConnected).length;
  const canStart = connectedCount >= 3;

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-ivory mb-1">Word Spy</h1>
        <p className="text-ivory/40 text-sm">Social deduction · AI-powered reveal</p>
      </div>
      <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users size={16} className="text-ivory/40" />
          <span className="text-ivory/60 text-sm">{connectedCount} / 8 players</span>
          {!canStart && <span className="text-ivory/30 text-xs ml-auto">Need {3 - connectedCount} more</span>}
        </div>
        <div className="space-y-2">
          {players.map((p) => (
            <div key={String(p.userId)} className="flex items-center gap-3">
              {p.avatar ? (
                <img src={p.avatar} alt={p.displayName} className="w-8 h-8 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs text-accent font-bold shrink-0">
                  {p.displayName?.[0]?.toUpperCase() || "?"}
                </div>
              )}
              <span className="text-ivory text-sm flex-1">{p.displayName}</span>
              {String(p.userId) === String(hostId) && <Crown size={14} className="text-yellow-400" />}
              {p.isConnected ? <Wifi size={12} className="text-green-400" /> : <WifiOff size={12} className="text-ivory/20" />}
            </div>
          ))}
        </div>
      </div>
      {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      {isHost ? (
        <div className="flex flex-col items-center gap-3 w-full max-w-sm">
          <button onClick={() => setShowModal(true)} disabled={!canStart}
            className="w-full px-8 py-3 bg-accent hover:bg-accent/80 disabled:opacity-40 disabled:cursor-not-allowed text-obsidian font-semibold rounded-xl transition-colors">
            {canStart ? "Start Game" : `Waiting for players (${connectedCount}/3)...`}
          </button>
          <button onClick={onDisband}
            className="w-full px-8 py-2.5 bg-white/5 hover:bg-red-500/15 border border-white/10 hover:border-red-500/40 text-ivory/40 hover:text-red-500 font-medium rounded-xl text-sm transition-all duration-200">
            Disband Room
          </button>
        </div>
      ) : (
        <p className="text-ivory/40 text-sm">Waiting for host to start...</p>
      )}
      {showModal && <WordSpyCategoryModal onStart={onStart} onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default WordSpyLobby;
