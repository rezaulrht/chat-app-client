"use client";

import React, { useState } from "react";
import Image from "next/image";
import { CheckCheck, Eye } from "lucide-react";
import { getGroupInitials, getGroupAvatarColor } from "@/utils/groupAvatar";

export default function ReadReceipts({
  message,
  totalParticipants,
  isOwnMessage,
}) {
  const [showDetails, setShowDetails] = useState(false);

  if (!isOwnMessage) return null;

  const readBy = message.readBy || [];
  const readCount = readBy.length;
  const unreadCount = totalParticipants - 1 - readCount; // -1 for sender
  const readPercentage =
    totalParticipants > 1
      ? Math.round((readCount / (totalParticipants - 1)) * 100)
      : 0;

  // Show first 3 readers for avatar stack
  const visibleReaders = readBy.slice(0, 3);
  const remainingCount = readCount - 3;

  if (readCount === 0) {
    return (
      <div className="flex items-center gap-1 text-[9px] text-ivory/20">
        <CheckCheck size={11} className="opacity-40" />
        <span className="opacity-60">Sent</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowDetails(!showDetails);
        }}
        className="group flex items-center gap-1.5 hover:scale-105 transition-all duration-200"
      >
        {/* Avatar Stack */}
        <div className="flex items-center -space-x-2">
          {visibleReaders.map((receipt, idx) => {
            const userData =
              typeof receipt.user === "object"
                ? receipt.user
                : { _id: receipt.user, name: "Unknown", avatar: null };

            return (
              <div
                key={userData._id}
                className="relative"
                style={{ zIndex: 10 - idx }}
              >
                {userData.avatar ? (
                  <Image
                    src={userData.avatar}
                    width={16}
                    height={16}
                    className="rounded-full ring-2 ring-obsidian group-hover:ring-accent/30 transition-all"
                    alt={userData.name || "User"}
                    unoptimized
                  />
                ) : (
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold ring-2 ring-obsidian group-hover:ring-accent/30 transition-all"
                    style={{
                      background: getGroupAvatarColor(userData.name || "?").bg,
                      color: getGroupAvatarColor(userData.name || "?").text,
                    }}
                  >
                    {getGroupInitials(userData.name || "?")[0]}
                  </div>
                )}
              </div>
            );
          })}

          {/* Remaining count badge */}
          {remainingCount > 0 && (
            <div className="w-4 h-4 rounded-full bg-accent/20 border-2 border-obsidian flex items-center justify-center">
              <span className="text-[7px] font-bold text-accent">
                +{remainingCount}
              </span>
            </div>
          )}
        </div>

        {/* Read count badge with gradient */}
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-accent/10 to-accent/20 border border-accent/30 group-hover:border-accent/50 transition-all">
          <Eye size={9} className="text-accent" />
          <span className="text-[9px] font-bold text-accent">{readCount}</span>
        </div>

        {/* Percentage indicator */}
        {totalParticipants > 2 && (
          <span className="text-[8px] text-ivory/30 font-medium">
            {readPercentage}%
          </span>
        )}
      </button>

      {showDetails && (
        <>
          {/* Backdrop with blur */}
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setShowDetails(false)}
          />

          {/* Glassmorphism Popup */}
          <div className="absolute bottom-full right-0 mb-2 w-72 bg-slate-900/95 backdrop-blur-xl border border-accent/20 rounded-2xl shadow-2xl shadow-accent/10 overflow-hidden z-50 animate-in slide-in-from-bottom-2 duration-300">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-accent/10 to-accent/5 px-4 py-3 border-b border-accent/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                    <Eye size={14} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-ivory">
                      Read by {readCount}
                    </p>
                    <p className="text-[10px] text-ivory/40">
                      {readPercentage}% of group
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDetails(false);
                  }}
                  className="w-6 h-6 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-ivory/40 hover:text-ivory/80 transition-all"
                >
                  ✕
                </button>
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent to-accent/60 rounded-full transition-all duration-500"
                  style={{ width: `${readPercentage}%` }}
                />
              </div>
            </div>

            {/* Reader list */}
            <div className="p-3 space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
              {readBy.map((receipt, idx) => {
                const userData =
                  typeof receipt.user === "object"
                    ? receipt.user
                    : { _id: receipt.user, name: "Unknown", avatar: null };

                return (
                  <div
                    key={userData._id}
                    className="group flex items-center gap-3 p-2 rounded-xl bg-white/0 hover:bg-white/5 transition-all duration-200 animate-in slide-in-from-left"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    {/* Avatar with ring */}
                    <div className="relative">
                      {userData.avatar ? (
                        <Image
                          src={userData.avatar}
                          width={32}
                          height={32}
                          className="rounded-full ring-2 ring-accent/20 group-hover:ring-accent/40 transition-all"
                          alt={userData.name || "User"}
                          unoptimized
                        />
                      ) : (
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold ring-2 ring-accent/20 group-hover:ring-accent/40 transition-all"
                          style={{
                            background: getGroupAvatarColor(
                              userData.name || "?",
                            ).bg,
                            color: getGroupAvatarColor(userData.name || "?")
                              .text,
                          }}
                        >
                          {getGroupInitials(userData.name || "?")}
                        </div>
                      )}
                      {/* Online indicator (optional) */}
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900" />
                    </div>

                    {/* User info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ivory truncate">
                        {userData.name || "Unknown"}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-ivory/40">
                        <CheckCheck size={10} className="text-accent/60" />
                        <span>
                          {new Date(receipt.readAt).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Read badge */}
                    <div className="px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20">
                      <span className="text-[9px] font-bold text-accent">
                        ✓ Seen
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer - Unread count */}
            {unreadCount > 0 && (
              <div className="px-4 py-3 bg-white/5 border-t border-white/5">
                <div className="flex items-center gap-2 text-[11px]">
                  <div className="flex -space-x-1.5">
                    {Array.from({ length: Math.min(unreadCount, 3) }).map(
                      (_, i) => (
                        <div
                          key={i}
                          className="w-5 h-5 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center"
                        >
                          <span className="text-[8px] text-ivory/30">?</span>
                        </div>
                      ),
                    )}
                  </div>
                  <span className="text-ivory/40">
                    {unreadCount} not read yet
                  </span>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
