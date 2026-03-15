"use client";

import { useState } from "react";
import { Users } from "lucide-react";

/**
 * PollCard — interactive poll with animated vote bars.
 *
 * @param {object} poll - { question, options: [{ text, votes: [] }], multiSelect, expiresAt }
 * @param {string} currentUserId
 * @param {Function} onVote - (optionIndex) => void
 */
export default function PollCard({ poll, currentUserId = "", onVote }) {
  const [selectedIdxs, setSelectedIdxs] = useState(() => {
    if (!poll?.options) return [];
    return poll.options.reduce((acc, opt, i) => {
      if ((opt.votes ?? []).includes(currentUserId)) acc.push(i);
      return acc;
    }, []);
  });

  if (!poll) return null;

  const isExpired = poll.expiresAt && new Date(poll.expiresAt) < new Date();
  const totalVotes = poll.options.reduce(
    (s, o) => s + (o.votes?.length ?? 0),
    0,
  );
  const hasVoted = selectedIdxs.length > 0;

  const handleSelect = (idx) => {
    if (isExpired) return;
    if (poll.multiSelect) {
      setSelectedIdxs((prev) =>
        prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
      );
    } else {
      setSelectedIdxs([idx]);
    }
    onVote?.(idx);
  };

  return (
    <div className="rounded-2xl p-4 ring-1 ring-white/[0.07] bg-white/[0.03] flex flex-col gap-3">
      {/* Question */}
      <p className="text-[13px] font-display font-semibold text-ivory/80">
        {poll.question}
      </p>

      {/* Options */}
      <div className="flex flex-col gap-2">
        {poll.options.map((opt, i) => {
          const count = opt.votes?.length ?? 0;
          const pct =
            totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
          const chosen = selectedIdxs.includes(i);

          return (
            <button
              key={i}
              type="button"
              disabled={isExpired && !hasVoted}
              onClick={() => handleSelect(i)}
              className={`relative text-left w-full rounded-xl overflow-hidden transition-all duration-150 group ${
                chosen
                  ? "ring-1 ring-accent/40"
                  : "ring-1 ring-white/[0.06] hover:ring-white/[0.12]"
              }`}
            >
              {/* Progress fill */}
              {(hasVoted || isExpired) && (
                <div
                  className={`absolute inset-y-0 left-0 rounded-xl transition-all duration-500 ${
                    chosen ? "bg-accent/15" : "bg-white/[0.04]"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              )}

              <div className="relative flex items-center justify-between px-3 py-2.5">
                <div className="flex items-center gap-2">
                  {/* Checkbox / radio indicator */}
                  <span
                    className={`shrink-0 flex items-center justify-center w-4 h-4 rounded-full ring-1 transition-all ${
                      chosen
                        ? "bg-accent/20 ring-accent/50 text-accent"
                        : "bg-white/[0.04] ring-white/[0.10] text-transparent"
                    }`}
                  >
                    {chosen && (
                      <span className="w-2 h-2 rounded-full bg-accent" />
                    )}
                  </span>
                  <span className="text-[13px] text-ivory/80 font-sans">
                    {opt.text}
                  </span>
                </div>

                {(hasVoted || isExpired) && (
                  <span className="text-[12px] font-mono font-bold text-ivory/40 shrink-0 ml-2">
                    {pct}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-[10px] font-mono text-ivory/25">
        <span className="flex items-center gap-1">
          <Users size={10} />
          {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
        </span>
        {isExpired ? (
          <span className="text-red-400/50 uppercase tracking-wider">
            Ended
          </span>
        ) : poll.expiresAt ? (
          <span>
            Ends{" "}
            {new Date(poll.expiresAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        ) : null}
      </div>
    </div>
  );
}
