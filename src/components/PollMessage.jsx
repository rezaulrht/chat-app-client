"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/app/api/Axios";
import { getGroupInitials, getGroupAvatarColor } from "@/utils/groupAvatar";
import useAuth from "@/hooks/useAuth";

export default function PollMessage({ message }) {
  const { user } = useAuth();
  const { poll } = message;

  const [localPoll, setLocalPoll] = useState(poll);
  const [voting, setVoting] = useState(false);

  // ✅ Track optimistic update state to prevent external updates from overwriting
  const optimisticPendingRef = useRef(false);

  // ──────────────────────────────────────────────────────────
  // Update local state when prop changes (but not during optimistic update)
  // ──────────────────────────────────────────────────────────

  useEffect(() => {
    // ✅ Only update if we're not in the middle of an optimistic update
    if (!optimisticPendingRef.current) {
      setLocalPoll(poll);
    }
  }, [poll]);

  // ──────────────────────────────────────────────────────────
  // Check if poll is expired
  // ──────────────────────────────────────────────────────────

  const isExpired = localPoll.expiresAt
    ? new Date(localPoll.expiresAt) <= new Date()
    : false;

  // ──────────────────────────────────────────────────────────
  // Calculate total votes
  // ──────────────────────────────────────────────────────────

  const totalVotes = localPoll.options.reduce(
    (sum, opt) => sum + (opt.votes?.length || 0),
    0,
  );

  // ──────────────────────────────────────────────────────────
  // Check if current user has voted
  // ──────────────────────────────────────────────────────────

  const userVotes = localPoll.options
    .filter((opt) =>
      opt.votes?.some((v) => v._id === user?._id || v === user?._id),
    )
    .map((opt) => opt.id);

  // ──────────────────────────────────────────────────────────
  // Handle vote with true optimistic updates and rollback on error
  // ──────────────────────────────────────────────────────────

  const handleVote = async (optionId) => {
    if (isExpired) {
      toast.error("This poll has expired");
      return;
    }

    if (voting) return;

    setVoting(true);
    optimisticPendingRef.current = true; // ✅ Mark optimistic update in progress

    // ✅ Save previous state for rollback on error
    const previousPoll = JSON.parse(JSON.stringify(localPoll));

    try {
      // ✅ OPTIMISTIC UPDATE - Apply changes immediately before API call
      const updatedPoll = JSON.parse(JSON.stringify(localPoll));
      const option = updatedPoll.options.find((opt) => opt.id === optionId);

      if (option) {
        const hasVoted = option.votes.some((v) => (v._id || v) === user?._id);

        if (hasVoted) {
          // Remove vote
          option.votes = option.votes.filter((v) => (v._id || v) !== user?._id);
        } else {
          // Add vote
          if (!updatedPoll.allowMultiple) {
            // Single choice - remove from other options
            updatedPoll.options.forEach((opt) => {
              opt.votes = opt.votes.filter((v) => (v._id || v) !== user?._id);
            });
          }
          // Add user to this option's votes
          option.votes.push(user._id);
        }

        // Apply optimistic update immediately
        setLocalPoll(updatedPoll);
      }

      // Make API call
      const res = await api.post(`/api/chat/messages/${message._id}/vote`, {
        optionId,
      });

      // ✅ Merge server response (confirms or corrects optimistic update)
      setLocalPoll(res.data.poll);
    } catch (err) {
      console.error("Vote error:", err);

      // ✅ ROLLBACK - Restore previous state on error
      setLocalPoll(previousPoll);
      toast.error(err.response?.data?.message || "Failed to vote");
    } finally {
      setVoting(false);
      optimisticPendingRef.current = false; // ✅ Clear optimistic flag
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* ──────────────────────────────────────────────── */}
      {/* Poll Header */}
      {/* ──────────────────────────────────────────────── */}

      <div className="flex items-start gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
          <span className="text-base">📊</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-ivory text-sm leading-tight">
            {localPoll.question}
          </h3>
          {isExpired && (
            <p className="text-[10px] text-red-400 mt-1">🔒 Poll expired</p>
          )}
        </div>
      </div>

      {/* ──────────────────────────────────────────────── */}
      {/* Poll Options */}
      {/* ──────────────────────────────────────────────── */}

      <div className="space-y-2">
        {localPoll.options.map((option) => {
          const voteCount = option.votes?.length || 0;
          const percentage =
            totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

          const isVoted = userVotes.includes(option.id);

          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={isExpired || voting}
              className={`w-full relative rounded-xl border transition-all ${
                isExpired || voting
                  ? "cursor-not-allowed opacity-60"
                  : "cursor-pointer hover:border-accent/40"
              } ${
                isVoted
                  ? "border-accent/40 bg-accent/5"
                  : "border-white/10 bg-white/5 hover:bg-white/10"
              }`}
            >
              {/* Progress Bar Background */}
              <div
                className="absolute inset-0 rounded-xl bg-accent/10 transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />

              {/* Option Content */}
              <div className="relative px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Checkbox/Radio indicator */}
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                      isVoted
                        ? "border-accent bg-accent"
                        : "border-white/30 bg-transparent"
                    }`}
                  >
                    {isVoted && <Check size={14} className="text-black" />}
                  </div>

                  {/* Option Text */}
                  <span className="text-sm font-medium text-ivory">
                    {option.text}
                  </span>
                </div>

                {/* Vote Count & Percentage */}
                <div className="flex items-center gap-2">
                  {totalVotes > 0 && (
                    <span className="text-xs font-bold text-ivory/60">
                      {percentage}%
                    </span>
                  )}
                  <span className="text-xs text-ivory/40">
                    {voteCount} {voteCount === 1 ? "vote" : "votes"}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ──────────────────────────────────────────────── */}
      {/* Poll Footer */}
      {/* ──────────────────────────────────────────────── */}

      <div className="mt-3 flex items-center justify-between text-[10px] text-ivory/30">
        <span>
          {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
          {localPoll.allowMultiple && " • Multiple choice"}
        </span>
        {localPoll.expiresAt && !isExpired && (
          <span>
            Expires {new Date(localPoll.expiresAt).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* ──────────────────────────────────────────────── */}
      {/* Show Voters (with defensive handling for string IDs) */}
      {/* ──────────────────────────────────────────────── */}

      {totalVotes > 0 && (
        <details className="mt-3 group">
          <summary className="text-xs text-accent cursor-pointer hover:text-accent/80 transition-colors list-none">
            <span className="group-open:hidden">Show who voted →</span>
            <span className="hidden group-open:inline">Hide voters ↑</span>
          </summary>

          <div className="mt-2 space-y-2 pl-2 border-l-2 border-accent/20">
            {localPoll.options.map((option) => {
              if (!option.votes || option.votes.length === 0) return null;

              return (
                <div key={option.id} className="text-xs">
                  <p className="font-bold text-ivory/80 mb-1">{option.text}:</p>
                  <div className="flex flex-wrap gap-1">
                    {option.votes.map((voter) => {
                      // ✅ Defensively handle voter as either string ID or object
                      const isString = typeof voter === "string";
                      const voterId = isString ? voter : voter._id;
                      const displayName = isString
                        ? "Anonymous"
                        : voter.name || "Anonymous";
                      const avatar = isString ? null : voter.avatar;

                      return (
                        <div
                          key={voterId}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 border border-white/10"
                        >
                          {avatar ? (
                            <Image
                              src={avatar}
                              width={16}
                              height={16}
                              className="rounded-full"
                              alt={displayName}
                              unoptimized
                            />
                          ) : (
                            <div
                              className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold"
                              style={{
                                background: getGroupAvatarColor(
                                  displayName === "Anonymous"
                                    ? "?"
                                    : displayName,
                                ).bg,
                                color: getGroupAvatarColor(
                                  displayName === "Anonymous"
                                    ? "?"
                                    : displayName,
                                ).text,
                              }}
                            >
                              {getGroupInitials(
                                displayName === "Anonymous" ? "?" : displayName,
                              )}
                            </div>
                          )}
                          <span className="text-ivory/60">{displayName}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </details>
      )}
    </div>
  );
}
