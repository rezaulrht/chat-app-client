"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  FileText,
  Tag,
  User,
  TrendingUp,
  Trophy,
  UserPlus,
  UserCheck,
} from "lucide-react";

// ── Mock data used in design phase ───────────────────────────────────────────
const MOCK_TRENDING_TAGS = [
  { tag: "nextjs15", count: "2.4k posts", sub: "Trending worldwide" },
  { tag: "ai_agents", count: "890 posts", sub: "Trending in Tech" },
  { tag: "rust_lang", count: "652 posts", sub: "Trending in Dev" },
];

const MOCK_TOP_CONTRIBUTORS = [
  { _id: "u1", name: "sarah_codes", points: "12k points", avatar: null },
  { _id: "u2", name: "mike_dev", points: "8.4k points", avatar: null },
  { _id: "u3", name: "elena_p", points: "6.4k points", avatar: null },
];

function ContributorRow({ contributor }) {
  const [following, setFollowing] = useState(false);
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-full overflow-hidden bg-accent/10 ring-1 ring-white/[0.1] shrink-0 flex items-center justify-center font-display font-bold text-[13px] text-ivory/60">
        {contributor.avatar ? (
          <Image
            src={contributor.avatar}
            alt={contributor.name}
            width={36}
            height={36}
            className="object-cover w-full h-full"
          />
        ) : (
          contributor.name[0]?.toUpperCase()
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-display font-bold text-ivory truncate">
          {contributor.name}
        </p>
        <p className="text-[10px] font-mono text-ivory/30">
          {contributor.points}
        </p>
      </div>
      <button
        type="button"
        onClick={() => setFollowing((f) => !f)}
        className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-150 shrink-0 ${
          following
            ? "border-accent/40 bg-accent/15 text-accent"
            : "border-white/[0.12] bg-white/[0.04] text-ivory/40 hover:border-accent/40 hover:text-accent hover:bg-accent/10"
        }`}
      >
        {following ? <UserCheck size={12} /> : <UserPlus size={12} />}
      </button>
    </div>
  );
}
export default function FeedSidebar({
  side = "left",
  userStats = {},
  followedTags = [],
  onTagFilter,
}) {
  if (side === "left") {
    const rep = userStats.reputation ?? 0;
    const repLabel = rep >= 1000 ? `${(rep / 1000).toFixed(1)}k` : String(rep);
    return (
      <aside className="w-full h-full flex flex-col overflow-y-auto scrollbar-hide">
        {/* ── User card ── */}
        <div className="flex flex-col items-center gap-3 px-5 pt-6 pb-5 border-b border-white/[0.06]">
          <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-accent/30 bg-deep shrink-0">
            <Image
              src={
                userStats.avatar
                  ? userStats.avatar
                  : `https://api.dicebear.com/7.x/avataaars/svg?seed=${userStats.name || "user"}`
              }
              alt="avatar"
              width={64}
              height={64}
              unoptimized
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-center">
            <p className="font-display font-bold text-ivory text-[15px] leading-tight">
              {userStats.name || "You"}
            </p>
            <span className="inline-block mt-1.5 text-[10px] font-mono font-bold text-accent bg-accent/10 border border-accent/20 px-2.5 py-0.5 rounded-full">
              REP: {repLabel}
            </span>
          </div>
          {/* Stats row */}
          <div className="flex items-center justify-around w-full pt-3 border-t border-white/[0.06]">
            {[
              { label: "FANS", value: userStats.followersCount ?? 0 },
              { label: "FOLLOWING", value: userStats.followingCount ?? 0 },
              { label: "POSTS", value: userStats.postCount ?? 0 },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col items-center gap-0.5">
                <span className="font-display font-bold text-ivory text-[15px] leading-tight">
                  {value}
                </span>
                <span className="text-[8px] font-mono text-ivory/30 uppercase tracking-[0.12em]">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex flex-col gap-0.5 px-3 py-3 border-b border-white/[0.06]">
          {[
            { href: "/profile?tab=posts", icon: FileText, label: "My Posts" },
            {
              href: "/app/feed?view=following",
              icon: Tag,
              label: "Following Tags",
            },
            { href: "/profile", icon: User, label: "My Profile" },
          ].map(({ href, icon: Icon, label }) => (
            <Link
              key={label}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors duration-150 group"
            >
              <Icon
                size={15}
                className="text-accent/60 group-hover:text-accent transition-colors shrink-0"
              />
              <span className="text-[13px] font-display font-semibold text-ivory/60 group-hover:text-ivory/90 transition-colors">
                {label}
              </span>
            </Link>
          ))}
        </nav>

        {/* ── Followed tags ── */}
        <div className="px-4 py-4">
          <p className="text-[9px] font-mono font-bold uppercase tracking-[0.16em] text-ivory/25 mb-3">
            Followed Tags
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(followedTags.length > 0
              ? followedTags
              : ["react", "nodejs", "typescript", "webdev"]
            ).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onTagFilter?.(tag)}
                className="text-[11px] font-mono text-ivory/50 bg-white/[0.05] hover:bg-accent/10 hover:text-accent border border-white/[0.08] hover:border-accent/25 px-2.5 py-1 rounded-lg transition-all duration-150"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </aside>
    );
  }

  // ── Right sidebar ─────────────────────────────────────────────────────────
  return (
    <aside className="w-full h-full flex flex-col overflow-y-auto scrollbar-hide">
      {/* ── Trending Now ── */}
      <div className="px-4 pt-5 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={14} className="text-accent" />
          <h3 className="font-display font-bold text-ivory text-[14px]">
            Trending Now
          </h3>
        </div>
        <div className="flex flex-col gap-3.5">
          {MOCK_TRENDING_TAGS.map(({ tag, count, sub }) => (
            <button
              key={tag}
              type="button"
              onClick={() => onTagFilter?.(tag)}
              className="flex flex-col items-start hover:opacity-80 transition-opacity text-left gap-0.5"
            >
              <span className="text-[13px] font-display font-bold text-ivory">
                #{tag}
              </span>
              <span className="text-[10px] font-mono text-ivory/35">
                {count}
              </span>
              <span className="text-[9px] font-mono text-ivory/20">{sub}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          className="mt-4 w-full py-2 text-[11px] font-mono font-semibold text-ivory/35 hover:text-accent border border-white/[0.07] hover:border-accent/25 rounded-xl transition-all duration-150"
        >
          Show More
        </button>
      </div>

      {/* ── Top Contributors ── */}
      <div className="px-4 py-5">
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={14} className="text-amber-400/80" />
          <h3 className="font-display font-bold text-ivory text-[14px]">
            Top Contributors
          </h3>
        </div>
        <div className="flex flex-col gap-3.5">
          {MOCK_TOP_CONTRIBUTORS.map((c) => (
            <ContributorRow key={c._id} contributor={c} />
          ))}
        </div>
      </div>
    </aside>
  );
}
