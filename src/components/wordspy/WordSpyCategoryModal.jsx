"use client";
import { useState } from "react";
import { X } from "lucide-react";

const WordSpyCategoryModal = ({ onStart, onClose }) => {
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [maxRounds, setMaxRounds] = useState(3);
  const [error, setError] = useState("");

  const handleStart = () => {
    if (!category.trim()) return setError("Please enter a category");
    if (category.length > 100) return setError("Category must be under 100 characters");
    if (!/^[a-zA-Z0-9\s.,!?'"-]+$/.test(category)) {
      return setError("Category can only contain letters, numbers, and common punctuation");
    }
    onStart(category.trim(), difficulty, maxRounds);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 md:p-4">
      <div className="bg-slate-surface border border-white/10 rounded-2xl p-4 md:p-6 w-full max-w-sm md:max-w-md">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-white font-semibold text-lg">Set Up Round</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-white/60 text-sm block mb-1">Category</label>
            <input
              value={category}
              onChange={(e) => { setCategory(e.target.value); setError(""); }}
              placeholder='e.g. "Fruits", "US Presidents", "90s Bollywood songs"'
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-accent text-sm"
              maxLength={100}
            />
          </div>
          <div>
            <label className="text-white/60 text-sm block mb-2">Difficulty</label>
            <div className="flex gap-2">
              {["easy", "medium", "hard"].map((d) => (
                <button key={d} onClick={() => setDifficulty(d)}
                  className={`flex-1 py-2 rounded-lg text-sm capitalize font-medium transition-colors ${difficulty === d ? "bg-accent text-obsidian" : "bg-white/5 text-white/50 hover:bg-white/10"
                    }`}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-white/60 text-sm block mb-1">Rounds</label>
            <div className="flex items-center gap-3">
              <button onClick={() => setMaxRounds((r) => Math.max(1, r - 1))}
                className="w-8 h-8 rounded-lg bg-white/5 text-white hover:bg-white/10 flex items-center justify-center">−</button>
              <span className="text-white font-mono w-6 text-center">{maxRounds}</span>
              <button onClick={() => setMaxRounds((r) => Math.min(10, r + 1))}
                className="w-8 h-8 rounded-lg bg-white/5 text-white hover:bg-white/10 flex items-center justify-center">+</button>
            </div>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button onClick={handleStart}
            className="w-full py-3 bg-accent hover:bg-accent/80 text-obsidian font-semibold rounded-xl transition-colors">
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default WordSpyCategoryModal;
