"use client";
import { useEffect } from "react";
import useWordSpy from "@/hooks/useWordSpy";
import useWordSpyStore from "@/stores/wordSpyStore";
import WordSpyLobby from "./WordSpyLobby";
import WordSpyWordReveal from "./WordSpyWordReveal";
import WordSpyHintPhase from "./WordSpyHintPhase";
import WordSpyVotePhase from "./WordSpyVotePhase";
import WordSpyReveal from "./WordSpyReveal";
import WordSpyResults from "./WordSpyResults";

const WordSpyGame = ({ moduleId, workspaceId }) => {
  const { joinGame, startGame, submitHint, submitVote, nextRound, endGame } = useWordSpy();
  // Get reactive state directly from store (not from useWordSpy return)
  const phase = useWordSpyStore((s) => s.phase);
  const reset = useWordSpyStore((s) => s.reset);

  useEffect(() => {
    joinGame(moduleId, workspaceId);
  }, [moduleId, workspaceId]);

  const handlePlayAgain = () => {
    reset();
    joinGame(moduleId, workspaceId);
  };

  if (!phase || phase === "lobby") return <WordSpyLobby onStart={startGame} />;
  if (phase === "word_assign") return (
    <div className="flex items-center justify-center h-full">
      <p className="text-white/40 text-sm animate-pulse">Generating words...</p>
    </div>
  );
  if (phase === "word_reveal") return <WordSpyWordReveal />;
  if (phase === "hint") return <WordSpyHintPhase onSubmitHint={submitHint} />;
  if (phase === "vote") return <WordSpyVotePhase onSubmitVote={submitVote} />;
  if (phase === "reveal") return <WordSpyReveal onNextRound={nextRound} onEndGame={endGame} />;
  if (phase === "results") return <WordSpyResults onPlayAgain={handlePlayAgain} />;
  return null;
};

export default WordSpyGame;
