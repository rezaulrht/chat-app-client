"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Tag,
  User,
  TrendingUp,
  Trophy,
  UserPlus,
  UserCheck,
  HelpCircle,
  Code2,
  Lightbulb,
  BookOpen,
  Star,
  BarChart2,
  Hash,
} from "lucide-react";
import useFeed from "@/hooks/useFeed";

// ── Post type browse ──────────────────────────────────────────────────────────
const POST_TYPES = [
  { type: "question", icon: HelpCircle, label: "Q&A", color: "text-blue-400" },
  { type: "snippet", icon: Code2, label: "Snippets", color: "text-purple-400" },
  { type: "til", icon: Lightbulb, label: "TIL", color: "text-yellow-400" },
  { type: "showcase", icon: Star, label: "Showcase", color: "text-pink-400" },
  {
    type: "resource",
    icon: BookOpen,
    label: "Resources",
    color: "text-emerald-400",
  },
  { type: "poll", icon: BarChart2, label: "Polls", color: "text-orange-400" },
];

// ── ContributorRow ────────────────────────────────────────────────────────────
function ContributorRow({ contributor }) {
  const { followUser, followingSet } = useFeed();
  const isFollowing = followingSet?.has(contributor._id);

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
          contributor.name?.[0]?.toUpperCase()
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-display font-bold text-ivory truncate">
          {contributor.name}
        </p>
        <p className="text-[10px] font-mono text-ivory/30">
          {contributor.reputation >= 1000
            ? `${(contributor.reputation / 1000).toFixed(1)}k pts`
            : `${contributor.reputation ?? 0} pts`}
        </p>
      </div>
      <button
        type="button"
        onClick={() => followUser(contributor._id)}
        className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-150 shrink-0 ${
          isFollowing
            ? "border-accent/40 bg-accent/15 text-accent"
            : "border-white/[0.12] bg-white/[0.04] text-ivory/40 hover:border-accent/40 hover:text-accent hover:bg-accent/10"
        }`}
      >
        {isFollowing ? <UserCheck size={12} /> : <UserPlus size={12} />}
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
  const { followTag, getTopContributors, setFilters, setPage } = useFeed();

  // ── Right sidebar state ───────────────────────────────────────────────────
  const [trendingTags, setTrendingTags] = useState([]);
  const [topContributors, setTopContributors] = useState([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);

  const fetchRightSidebarData = useCallback(async () => {
    if (side !== "right") return;
    setLoadingTags(true);
    try {
      const [tags, contributors] = await Promise.all([
        fetch("/api/feed/tags/trending")
          .then((r) => r.json())
          .catch(() => []),
        getTopContributors().catch(() => []),
      ]);
      setTrendingTags(Array.isArray(tags) ? tags : []);
      setTopContributors(Array.isArray(contributors) ? contributors : []);
    } catch {
      // silently fail — sidebar is non-critical
    } finally {
      setLoadingTags(false);
    }
  }, [side, getTopContributors]);

  useEffect(() => {
    fetchRightSidebarData();
  }, [fetchRightSidebarData]);

  // ── Left sidebar ──────────────────────────────────────────────────────────
  if (side === "left") {
    const rep = userStats.reputation ?? 0;
    const repLabel = rep >= 1000 ? `${(rep / 1000).toFixed(1)}k` : String(rep);
    return (
      <aside className="w-full h-full flex flex-col overflow-y-auto scrollbar-hide">
        {/* User card */}
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
          <div className="flex gap-4 w-full justify-center">
            {[
              { label: "POSTS", value: userStats.postCount ?? 0 },
              { label: "FANS", value: userStats.followersCount ?? 0 },
              { label: "FOLLOWING", value: userStats.followingCount ?? 0 },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-[14px] font-display font-bold text-ivory">
                  {value}
                </p>
                <p className="text-[9px] font-mono text-ivory/30">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div className="px-4 py-4 border-b border-white/[0.06]">
          {[
            { icon: FileText, label: "My Posts", href: "/app/feed?view=my" },
            { icon: User, label: "Profile", href: "/app/feed?view=following" },
            { icon: Tag, label: "My Tags", href: "/app/feed?view=following" },
          ].map(({ icon: Icon, label, href }) => (
            <Link
              key={label}
              href={href}
              className="flex items-center gap-2.5 py-2 text-[13px] font-display font-medium text-ivory/50 hover:text-ivory transition-colors"
            >
              <Icon size={14} className="text-ivory/30" />
              {label}
            </Link>
          ))}
        </div>

        {/* Followed tags */}
        {followedTags.length > 0 && (
          <div className="px-4 py-4">
            <p className="text-[10px] font-mono font-bold text-ivory/25 uppercase tracking-widest mb-3">
              Followed Tags
            </p>
            <div className="flex flex-wrap gap-1.5">
              {followedTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onTagFilter?.(tag)}
                  className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 transition-colors"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>
    );
  }

  // ── Right sidebar ─────────────────────────────────────────────────────────
  const visibleTags = showAllTags ? trendingTags : trendingTags.slice(0, 5);

  return (
    <aside className="w-full h-full flex flex-col overflow-y-auto scrollbar-hide">
      {/* Trending tags */}
      <div className="px-4 pt-5 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={14} className="text-accent" />
          <h3 className="font-display font-bold text-ivory text-[14px]">
            Trending Now
          </h3>
        </div>

        {loadingTags ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-3 w-24 bg-white/[0.06] rounded mb-1" />
                <div className="h-2 w-16 bg-white/[0.04] rounded" />
              </div>
            ))}
          </div>
        ) : trendingTags.length === 0 ? (
          <p className="text-[11px] font-mono text-ivory/20">
            No trending tags yet
          </p>
        ) : (
          <div className="flex flex-col gap-3.5">
            {visibleTags.map(({ tag, posts, score }) => (
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
                  {posts} post{posts !== 1 ? "s" : ""}
                </span>
              </button>
            ))}
          </div>
        )}

        {trendingTags.length > 5 && (
          <button
            type="button"
            onClick={() => setShowAllTags((v) => !v)}
            className="mt-4 w-full py-2 text-[11px] font-mono font-semibold text-ivory/35 hover:text-accent border border-white/[0.07] hover:border-accent/25 rounded-xl transition-all duration-150"
          >
            {showAllTags ? "Show Less" : "Show More"}
          </button>
        )}
      </div>

      {/* Top Contributors */}
      <div className="px-4 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={14} className="text-amber-400/80" />
          <h3 className="font-display font-bold text-ivory text-[14px]">
            Top Contributors
          </h3>
        </div>
        {topContributors.length === 0 ? (
          <p className="text-[11px] font-mono text-ivory/20">
            No contributors yet
          </p>
        ) : (
          <div className="flex flex-col gap-3.5">
            {topContributors.slice(0, 5).map((c) => (
              <ContributorRow key={c._id} contributor={c} />
            ))}
          </div>
        )}
      </div>

      {/* Browse by Type */}
      <div className="px-4 py-5">
        <div className="flex items-center gap-2 mb-4">
          <Hash size={14} className="text-ivory/40" />
          <h3 className="font-display font-bold text-ivory text-[14px]">
            Browse by Type
          </h3>
        </div>
        <div className="flex flex-col gap-1">
          {POST_TYPES.map(({ type, icon: Icon, label, color }) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                setFilters?.((p) => ({ ...p, type }));
                setPage?.(1);
              }}
              className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/[0.04] transition-all group text-left"
            >
              <Icon
                size={13}
                className={`${color} opacity-60 group-hover:opacity-100 transition-opacity shrink-0`}
              />
              <span className="text-[12px] font-display font-medium text-ivory/40 group-hover:text-ivory/80 transition-colors">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
