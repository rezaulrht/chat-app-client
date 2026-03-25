import { create } from "zustand";

const PHASES = ["lobby", "word_assign", "word_reveal", "hint", "vote", "reveal", "results"];
const CLEAR_WORD_PHASES = ["hint", "vote", "reveal", "results"];

const useWordSpyStore = create((set) => ({
  // game metadata
  gameId: null,
  phase: null,
  phaseEndsAt: null,    // null for reveal and results phases
  round: null,
  maxRounds: null,
  hostId: null,
  category: null,

  // sanitized player list (no hint/vote fields)
  players: [],

  // private — this player's word only
  // never stored in localStorage; cleared on phase:change to hint or later
  myWord: null,

  // hint submission progress (from wordspy:hint:progress)
  hintProgress: { submitted: 0, total: 0 },

  // hints revealed at start of vote phase (from wordspy:hints:reveal)
  hints: [],

  // full reveal payload (from wordspy:reveal)
  revealData: null,

  // error message
  error: null,

  // ── actions ──────────────────────────────────────────────────────

  setGameState: (state) =>
    set({
      gameId: state._id ? String(state._id) : null,
      phase: state.phase,
      phaseEndsAt: state.phaseEndsAt ? new Date(state.phaseEndsAt) : null,
      round: state.round,
      maxRounds: state.maxRounds,
      hostId: state.hostId ? String(state.hostId) : null,
      category: state.category,
      players: state.players ?? [],
    }),

  setPhase: (phase, phaseEndsAt) =>
    set((s) => {
      const updates = {
        phase,
        phaseEndsAt: phaseEndsAt ? new Date(phaseEndsAt) : null,
      };
      // Clear myWord when entering hint phase or any later phase
      if (CLEAR_WORD_PHASES.includes(phase)) {
        updates.myWord = null;
      }
      return updates;
    }),

  setMyWord: (word) => set({ myWord: word }),
  clearMyWord: () => set({ myWord: null }),

  setHintProgress: (submitted, total) => set({ hintProgress: { submitted, total } }),

  setHints: (hints) => set({ hints }),

  setRevealData: (data) => set({ revealData: data }),

  setError: (message) => set({ error: message }),
  clearError: () => set({ error: null }),

  reset: () =>
    set({
      gameId: null, phase: null, phaseEndsAt: null,
      round: null, maxRounds: null, hostId: null, category: null,
      players: [], myWord: null, hintProgress: { submitted: 0, total: 0 },
      hints: [], revealData: null, error: null,
    }),
}));

export default useWordSpyStore;
