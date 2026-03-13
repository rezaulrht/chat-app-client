"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { UserPlus, UserCheck, MessageCircle } from "lucide-react";
import ReputationBadge from "./ReputationBadge";

/**
 * UserCard — compact author info card.
 * Used inline in PostCard (hover) and standalone in sidebars.
 *
 * @param {object}  user          - { _id, name, avatar, reputation, bio }
 * @param {boolean} following     - whether the current viewer follows this user
 * @param {boolean} isCurrentUser - hide follow button for own card
 * @param {"inline"|"panel"} variant
 */
export default function UserCard({
  user = {},
  following = false,
  isCurrentUser = false,
  variant = "inline",
}) {
  const [followed, setFollowed] = useState(following);

  // Design-only toggle — TODO wire to followUser()
  const handleFollow = (e) => {
    e.preventDefault();
    setFollowed((f) => !f);
  };

  if (variant === "panel") {
    return (
      <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.04] ring-1 ring-white/[0.07]">
        <Link href={`/profile/${user._id}`} className="shrink-0">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/[0.06] ring-1 ring-white/[0.08]">
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt={user.name}
                width={40}
                height={40}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-ivory/40 font-display font-bold text-sm">
                {user.name?.[0] ?? "?"}
              </div>
            )}
          </div>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <Link
              href={`/profile/${user._id}`}
              className="font-display font-bold text-ivory text-sm hover:text-accent transition-colors truncate"
            >
              {user.name ?? "Unknown"}
            </Link>
            <ReputationBadge reputation={user.reputation ?? 0} size="sm" />
          </div>
          {user.bio && (
            <p className="text-[11px] text-ivory/40 mt-0.5 line-clamp-1">
              {user.bio}
            </p>
          )}
          {!isCurrentUser && (
            <button
              onClick={handleFollow}
              className={`mt-2 flex items-center gap-1 text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg transition-all duration-200 ${
                followed
                  ? "text-accent/70 bg-accent/8 hover:bg-accent/12"
                  : "text-ivory/40 bg-white/[0.05] hover:text-accent hover:bg-accent/8"
              }`}
            >
              {followed ? <UserCheck size={11} /> : <UserPlus size={11} />}
              {followed ? "Following" : "Follow"}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Inline variant — compact row (used in post headers)
  return (
    <Link
      href={`/profile/${user._id}`}
      className="group flex items-center gap-2 min-w-0"
    >
      <div className="w-7 h-7 shrink-0 rounded-lg overflow-hidden bg-white/[0.06] ring-1 ring-white/[0.08]">
        {user.avatar ? (
          <Image
            src={user.avatar}
            alt={user.name}
            width={28}
            height={28}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ivory/40 font-display font-bold text-[11px]">
            {user.name?.[0] ?? "?"}
          </div>
        )}
      </div>
      <span className="text-[13px] font-display font-semibold text-ivory/80 group-hover:text-accent transition-colors truncate">
        {user.name ?? "Unknown"}
      </span>
      <ReputationBadge reputation={user.reputation ?? 0} size="sm" />
    </Link>
  );
}
