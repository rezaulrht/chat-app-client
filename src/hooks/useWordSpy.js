"use client";
import { useEffect, useContext } from "react";
import { SocketContext } from "@/context/SocketContext";
import useWordSpyStore from "@/stores/wordSpyStore";
import toast from "react-hot-toast";

/**
 * Registers all wordspy:* socket listeners and returns action emitters.
 * For reactive state, use useWordSpyStore() directly in components.
 */
const useWordSpy = () => {
  const { socket } = useContext(SocketContext);
  const {
    setGameState, setPhase, setMyWord,
    setHintProgress, setHints, setRevealData, setError, reset,
  } = useWordSpyStore();

  useEffect(() => {
    if (!socket) return;

    const onRoomUpdate = (state) => setGameState(state);
    const onPhaseChange = ({ phase, phaseEndsAt }) => setPhase(phase, phaseEndsAt);
    const onWordPrivate = ({ word }) => setMyWord(word);
    const onHintProgress = ({ submitted, total }) => setHintProgress(submitted, total);
    const onHintsReveal = ({ hints }) => setHints(hints);
    const onReveal = (data) => setRevealData(data);
    const onError = ({ message }) => setError(message);
    const onDisbanded = ({ message }) => {
      reset();
      toast(message, { icon: "🚪" });
    };

    socket.on("wordspy:room:update", onRoomUpdate);
    socket.on("wordspy:phase:change", onPhaseChange);
    socket.on("wordspy:word:private", onWordPrivate);
    socket.on("wordspy:hint:progress", onHintProgress);
    socket.on("wordspy:hints:reveal", onHintsReveal);
    socket.on("wordspy:reveal", onReveal);
    socket.on("wordspy:error", onError);
    socket.on("wordspy:disbanded", onDisbanded);

    return () => {
      socket.off("wordspy:room:update", onRoomUpdate);
      socket.off("wordspy:phase:change", onPhaseChange);
      socket.off("wordspy:word:private", onWordPrivate);
      socket.off("wordspy:hint:progress", onHintProgress);
      socket.off("wordspy:hints:reveal", onHintsReveal);
      socket.off("wordspy:reveal", onReveal);
      socket.off("wordspy:error", onError);
      socket.off("wordspy:disbanded", onDisbanded);
    };
  }, [socket]);

  // Action emitters — these do NOT return state, call useWordSpyStore() for that
  const joinGame = (moduleId, workspaceId) =>
    socket?.emit("wordspy:join", { moduleId, workspaceId });

  const startGame = (moduleId, category, difficulty, maxRounds) =>
    socket?.emit("wordspy:start", { moduleId, category, difficulty, maxRounds });

  const submitHint = (hint) =>
    socket?.emit("wordspy:hint:submit", { hint });

  const submitVote = (targetUserId) =>
    socket?.emit("wordspy:vote:submit", { targetUserId });

  const nextRound = () => socket?.emit("wordspy:next:round", {});

  const endGame = () => socket?.emit("wordspy:end:game", {});

  const disbandRoom = () => socket?.emit("wordspy:disband", {});

  return { joinGame, startGame, submitHint, submitVote, nextRound, endGame, disbandRoom };
};

export default useWordSpy;
