"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import {
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
  ChevronRight,
  Zap,
  FileText,
  User2,
  Users2,
  Tag,
  Filter,
  X,
  Clock,
} from "lucide-react";
import useFeed from "@/hooks/useFeed";
import api from "@/app/api/Axios";
import { getLevel } from "@/components/Feed/ReputationBadge";

// ── Constants ─────────────────────────────────────────────────────────────────

const POST_TYPES = [
  {
    type: "question",
    icon: HelpCircle,
    label: "Q&A",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
  },
  {
    type: "snippet",
    icon: Code2,
    label: "Snippets",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    border: "border-purple-400/20",
  },
  {
    type: "til",
    icon: Lightbulb,
    label: "TIL",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/20",
  },
  {
    type: "showcase",
    icon: Star,
    label: "Showcase",
    color: "text-pink-400",
    bg: "bg-pink-400/10",
    border: "border-pink-400/20",
  },
  {
    type: "resource",
    icon: BookOpen,
    label: "Resources",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
  },
  {
    type: "poll",
    icon: BarChart2,
    label: "Polls",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    border: "border-orange-400/20",
  },
];

const REP_LEVELS = [
  {
    label: "Newcomer",
    min: 0,
    max: 49,
    barColor: "bg-emerald-400",
    textColor: "text-emerald-400",
  },
  {
    label: "Contributor",
    min: 50,
    max: 199,
    barColor: "bg-blue-400",
    textColor: "text-blue-400",
  },
  {
    label: "Expert",
    min: 200,
    max: 499,
    barColor: "bg-purple-400",
    textColor: "text-purple-400",
  },
  {
    label: "Legend",
    min: 500,
    max: Infinity,
    barColor: "bg-amber-400",
    textColor: "text-amber-400",
  },
];

function getRepLevel(rep) {
  return REP_LEVELS.find((l) => rep >= l.min && rep <= l.max) ?? REP_LEVELS[0];
}

// ── Shared tiny components ────────────────────────────────────────────────────

function Divider() {
  return <div className="h-px bg-white/[0.05] mx-4 my-0" />;
}

function SectionLabel({ label, icon: Icon }) {
  return (
    <div className="flex items-center gap-2 px-4 mb-2.5">
      {Icon && <Icon size={11} className="text-ivory/20" />}
      <p className="text-[9px] font-mono font-bold uppercase tracking-[0.15em] text-ivory/20">
        {label}
      </p>
    </div>
  );
}

function NavRow({ icon: Icon, label, onClick, badge, active = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-2 transition-all group ${
        active
          ? "text-accent bg-accent/[0.06] border-r-2 border-accent"
          : "text-ivory/40 hover:text-ivory hover:bg-white/[0.03]"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <Icon
          size={13}
          className={`shrink-0 transition-colors ${active ? "text-accent" : "text-ivory/20 group-hover:text-accent"}`}
        />
        <span className="text-[13px] font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-1.5">
        {badge != null && badge > 0 && (
          <span className="text-[9px] font-mono font-bold bg-accent/15 text-accent px-1.5 py-0.5 rounded-full">
            {badge}
          </span>
        )}
        <ChevronRight
          size={11}
          className="opacity-0 group-hover:opacity-30 transition-opacity"
        />
      </div>
    </button>
  );
}

// ── Active filters indicator ──────────────────────────────────────────────────

function ActiveFilters({
  filters,
  activeTab,
  onClearType,
  onClearTag,
  onClearTab,
}) {
  const hasType = filters?.type && filters.type !== "all";
  const hasTags = filters?.tags?.length > 0;
  const hasTab = activeTab && activeTab !== "latest";

  if (!hasType && !hasTags && !hasTab) return null;

  return (
    <div className="px-4 py-2">
      <div className="flex items-center gap-1.5 mb-2">
        <Filter size={10} className="text-accent/60" />
        <span className="text-[9px] font-mono font-bold text-accent/60 uppercase tracking-wider">
          Active Filters
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {hasTab && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-mono">
            {activeTab}
            <button
              type="button"
              onClick={onClearTab}
              className="hover:text-white transition-colors"
            >
              <X size={9} />
            </button>
          </span>
        )}
        {hasType && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-400/10 border border-purple-400/20 text-purple-400 text-[10px] font-mono">
            {filters.type}
            <button
              type="button"
              onClick={onClearType}
              className="hover:text-white transition-colors"
            >
              <X size={9} />
            </button>
          </span>
        )}
        {hasTags &&
          filters.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-[10px] font-mono"
            >
              #{tag}
              <button
                type="button"
                onClick={() => onClearTag(tag)}
                className="hover:text-white transition-colors"
              >
                <X size={9} />
              </button>
            </span>
          ))}
      </div>
    </div>
  );
}

// ── LEFT SIDEBAR ──────────────────────────────────────────────────────────────

function LeftSidebar({ userStats, followedTags, onTagFilter, collapsed = false }) {
  const {
    setFilters,
    setPage,
    setActiveTab,
    activeTab,
    filters,
    getUserPosts,
    followUser,
    followingSet,
  } = useFeed();

  const [recentPosts, setRecentPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);

  const rep = userStats.reputation ?? 0;
  const level = getLevel(rep);

  // Fetch followers when panel opens
  useEffect(() => {
    if (!showFollowers || !userStats._id) return;
    setLoadingFollowers(true);
    api
      .get(`/api/feed/users/${userStats._id}/followers`)
      .then((res) =>
        setFollowers(
          Array.isArray(res.data?.followers) ? res.data.followers : [],
        ),
      )
      .catch(() => setFollowers([]))
      .finally(() => setLoadingFollowers(false));
  }, [showFollowers, userStats._id]);

  // Fetch user's 3 most recent posts for the sidebar preview
  useEffect(() => {
    if (!userStats._id) return;
    setLoadingPosts(true);
    getUserPosts(userStats._id, 1, 3)
      .then((data) =>
        setRecentPosts(Array.isArray(data?.posts) ? data.posts : []),
      )
      .catch(() => setRecentPosts([]))
      .finally(() => setLoadingPosts(false));
  }, [userStats._id, getUserPosts]);

  // My Posts — navigate to profile page posts tab

  const clearAllFilters = () => {
    setFilters?.({ type: "all", tags: [], sort: "latest" });
    setActiveTab?.("latest");
    setPage?.(1);
  };

  if (collapsed) {
    return (
      <aside className="w-full flex flex-col items-center min-h-0 overflow-y-auto scrollbar-hide pt-2 gap-1 pb-4">
        {/* User avatar */}
        <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-accent/20 shrink-0 mb-1">
          <Image
            src={
              userStats.avatar ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${userStats.name || "user"}`
            }
            alt="avatar"
            width={36}
            height={36}
            unoptimized
            className="w-full h-full object-cover"
          />
        </div>

        <div className="w-7 h-px bg-white/[0.06] shrink-0 my-1" />

        {/* My Profile */}
        <button
          type="button"
          title="My Profile"
          onClick={() => {
            if (userStats._id) window.location.href = `/profile/${userStats._id}`;
          }}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-ivory/30 hover:text-accent hover:bg-accent/10 transition-all"
        >
          <User2 size={15} />
        </button>

        {/* Followers */}
        <button
          type="button"
          title="Followers"
          onClick={() => setShowFollowers((v) => !v)}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-ivory/30 hover:text-accent hover:bg-accent/10 transition-all"
        >
          <Users2 size={15} />
        </button>

        {/* Following */}
        <button
          type="button"
          title="Following"
          onClick={() => {
            setActiveTab?.("following");
            setPage?.(1);
          }}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-ivory/30 hover:text-accent hover:bg-accent/10 transition-all"
        >
          <Zap size={15} />
        </button>

        <div className="w-7 h-px bg-white/[0.06] shrink-0 my-1" />

        {/* Recent Posts */}
        <button
          type="button"
          title="Recent Posts"
          onClick={() => {
            if (userStats._id) window.location.href = `/profile/${userStats._id}`;
          }}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-ivory/30 hover:text-accent hover:bg-accent/10 transition-all"
        >
          <FileText size={15} />
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-full h-full flex flex-col overflow-y-auto scrollbar-hide">
      {/* ── User card ── */}
      <div className="flex flex-col items-center gap-3 px-5 pt-6 pb-5 border-b border-white/[0.06]">
        <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-accent/30 bg-deep shrink-0">
          <Image
            src={
              userStats.avatar ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${userStats.name || "user"}`
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
            REP: {rep >= 1000 ? `${(rep / 1000).toFixed(1)}k` : rep}
          </span>
        </div>
        <div className="flex gap-6 w-full justify-center">
          {[
            { label: "POSTS", value: userStats.postCount ?? 0 },
            { label: "FANS", value: userStats.followersCount ?? 0 },
            { label: "FOLLOWING", value: userStats.followingCount ?? 0 },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-[14px] font-display font-bold text-ivory">
                {value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
              </p>
              <p className="text-[9px] font-mono text-ivory/30">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <Divider />

      {/* ── Active filters ── */}
      <ActiveFilters
        filters={filters}
        activeTab={activeTab}
        onClearType={() => {
          setActiveType(null);
          setFilters?.((p) => ({ ...p, type: "all" }));
          setPage?.(1);
        }}
        onClearTag={(tag) =>
          setFilters?.((p) => ({ ...p, tags: p.tags.filter((t) => t !== tag) }))
        }
        onClearTab={() => {
          setActiveTab?.("latest");
          setPage?.(1);
        }}
      />

      {/* ── Navigation ── */}
      <div className="py-1">
        <SectionLabel label="Menu" icon={User2} />
        <NavRow
          icon={User2}
          label="My Profile"
          onClick={() => {
            if (userStats._id)
              window.location.href = `/profile/${userStats._id}`;
          }}
        />
        <NavRow
          icon={Users2}
          label="Followers"
          badge={userStats.followersCount || null}
          onClick={() => setShowFollowers((v) => !v)}
        />
        <NavRow
          icon={Zap}
          label="Following"
          onClick={() => {
            setActiveTab?.("following");
            setPage?.(1);
          }}
        />
      </div>

      <Divider />

      {/* ── Recent Posts ── */}
      <Divider />
      <div className="py-3">
        <SectionLabel label="Recent Posts" icon={Clock} />
        {loadingPosts ? (
          <div className="px-4 space-y-2 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="w-3 h-3 rounded bg-white/[0.04] mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="h-2.5 w-full bg-white/[0.05] rounded mb-1" />
                  <div className="h-2 w-16 bg-white/[0.03] rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : recentPosts.length === 0 ? (
          <p className="px-4 text-[11px] font-mono text-ivory/15">
            No posts yet
          </p>
        ) : (
          <div className="flex flex-col px-2">
            {recentPosts.map((post) => (
              <button
                key={post._id}
                type="button"
                onClick={() => {
                  window.location.href = `/app/feed?post=${post._id}`;
                }}
                className="flex items-start gap-2.5 px-2 py-2 rounded-lg hover:bg-white/[0.04] transition-all group text-left"
              >
                <FileText
                  size={11}
                  className="text-ivory/20 group-hover:text-accent transition-colors shrink-0 mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-ivory/55 group-hover:text-ivory/80 transition-colors truncate leading-snug">
                    {post.title || post.content?.slice(0, 50) || "Untitled"}
                  </p>
                  <p className="text-[9px] font-mono text-ivory/20 mt-0.5">
                    {post.type} · {post.reactionCount ?? 0} ❤️
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Followers panel ── */}
      {showFollowers && (
        <>
          <Divider />
          <div className="py-3">
            <SectionLabel label="Followers" icon={Users2} />
            {loadingFollowers ? (
              <div className="px-4 space-y-3 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-white/[0.05]" />
                    <div className="flex-1">
                      <div className="h-2.5 w-24 bg-white/[0.06] rounded mb-1" />
                      <div className="h-2 w-14 bg-white/[0.04] rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : followers.length === 0 ? (
              <p className="px-4 text-[11px] font-mono text-ivory/15">
                No followers yet
              </p>
            ) : (
              <div className="flex flex-col px-2">
                {followers.map((f) => {
                  const isFollowing = followingSet?.has(f._id);
                  const repLevel = getRepLevel(f.reputation ?? 0);
                  return (
                    <div
                      key={f._id}
                      className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/[0.03] transition-all group"
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-accent/10 ring-1 ring-white/[0.08] shrink-0 flex items-center justify-center text-[11px] font-bold text-ivory/50">
                        {f.avatar ? (
                          <Image
                            src={f.avatar}
                            alt={f.name}
                            width={32}
                            height={32}
                            className="object-cover w-full h-full"
                            unoptimized
                          />
                        ) : (
                          f.name?.[0]?.toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-ivory truncate leading-tight">
                          {f.name}
                        </p>
                        <p
                          className={`text-[9px] font-mono ${repLevel.textColor}`}
                        >
                          {f.reputation >= 1000
                            ? `${(f.reputation / 1000).toFixed(1)}k`
                            : f.reputation}{" "}
                          pts
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => followUser?.(f._id)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all shrink-0 ${
                          isFollowing
                            ? "border-accent/40 bg-accent/15 text-accent"
                            : "border-white/[0.10] bg-white/[0.03] text-ivory/25 hover:border-accent/30 hover:text-accent hover:bg-accent/10"
                        }`}
                        title={isFollowing ? "Unfollow" : "Follow back"}
                      >
                        {isFollowing ? (
                          <UserCheck size={10} />
                        ) : (
                          <UserPlus size={10} />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      <div className="h-6" />
    </aside>
  );
}

// ── RIGHT SIDEBAR ─────────────────────────────────────────────────────────────

function RightSidebar({ onTagFilter }) {
  const { getTopContributors, setFilters, setPage, followUser, followingSet } =
    useFeed();

  const [trendingTags, setTrendingTags] = useState([]);
  const [topContributors, setTopContributors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [tags, contributors] = await Promise.all([
        api
          .get("/api/feed/tags/trending")
          .then((r) => r.data)
          .catch(() => []),
        getTopContributors().catch(() => []),
      ]);
      setTrendingTags(Array.isArray(tags) ? tags : []);
      setTopContributors(Array.isArray(contributors) ? contributors : []);
    } catch {
      /* non-critical */
    } finally {
      setLoading(false);
    }
  }, [getTopContributors]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const visibleTags = showAllTags ? trendingTags : trendingTags.slice(0, 5);

  return (
    <aside className="w-full h-full flex flex-col overflow-y-auto scrollbar-hide">
      {/* Leaderboard */}
      <div className="pt-5 pb-4">
        <div className="flex items-center justify-between px-4 mb-3">
          <div className="flex items-center gap-2">
            <Trophy size={13} className="text-amber-400" />
            <p className="text-[9px] font-mono font-bold uppercase tracking-[0.15em] text-ivory/25">
              Leaderboard
            </p>
          </div>
          {topContributors.length > 0 && (
            <span className="text-[9px] font-mono text-ivory/15 bg-white/[0.03] border border-white/[0.06] px-2 py-0.5 rounded-full">
              Top {Math.min(topContributors.length, 5)}
            </span>
          )}
        </div>

        {loading ? (
          <div className="animate-pulse space-y-3 px-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/[0.05]" />
                <div className="flex-1">
                  <div className="h-2.5 w-20 bg-white/[0.06] rounded mb-1.5" />
                  <div className="h-2 w-14 bg-white/[0.04] rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : topContributors.length === 0 ? (
          <div className="px-4 py-4 text-center">
            <p className="text-2xl mb-2">🏆</p>
            <p className="text-[11px] font-mono text-ivory/20">
              No contributors yet
            </p>
            <p className="text-[10px] font-mono text-ivory/12 mt-1">
              Post & react to earn points
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5 px-2">
            {topContributors.slice(0, 5).map((c, i) => {
              const levelInfo = getLevel(c.reputation ?? 0);
              const repLevel = getRepLevel(c.reputation ?? 0);
              const isFollowing = followingSet?.has(c._id);
              const medals = ["🥇", "🥈", "🥉"];
              const topRep = topContributors[0]?.reputation || 1;

              return (
                <div
                  key={c._id}
                  className={`flex items-center gap-2.5 px-2 py-2.5 rounded-xl border transition-all group ${
                    i === 0
                      ? "border-amber-400/15 bg-amber-400/[0.03] hover:bg-amber-400/[0.06]"
                      : "border-transparent hover:border-white/[0.05] hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="w-5 text-center shrink-0">
                    {i < 3 ? (
                      <span className="text-[14px] leading-none">
                        {medals[i]}
                      </span>
                    ) : (
                      <span className="text-[10px] font-black font-mono text-ivory/20">
                        {i + 1}
                      </span>
                    )}
                  </div>
                  <div
                    className={`w-8 h-8 rounded-lg overflow-hidden shrink-0 flex items-center justify-center text-[11px] font-bold text-ivory/50 bg-accent/10 ring-1 ${
                      i === 0 ? "ring-amber-400/25" : "ring-white/[0.07]"
                    }`}
                  >
                    {c.avatar ? (
                      <Image
                        src={c.avatar}
                        alt={c.name}
                        width={32}
                        height={32}
                        className="object-cover w-full h-full"
                        unoptimized
                      />
                    ) : (
                      c.name?.[0]?.toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-0.5">
                      <p className="text-[12px] font-bold text-ivory truncate leading-tight">
                        {c.name}
                      </p>
                      <span className="text-[10px] leading-none shrink-0">
                        {levelInfo.icon}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[9px] font-mono font-semibold ${repLevel.textColor}`}
                      >
                        {c.reputation >= 1000
                          ? `${(c.reputation / 1000).toFixed(1)}k`
                          : (c.reputation ?? 0)}{" "}
                        pts
                      </span>
                      {c.followersCount > 0 && (
                        <span className="text-[9px] font-mono text-ivory/15">
                          · {c.followersCount} fans
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 h-[2px] rounded-full bg-white/[0.05] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${repLevel.barColor} opacity-60`}
                        style={{
                          width: `${Math.min(((c.reputation ?? 0) / topRep) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => followUser(c._id)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all shrink-0 opacity-0 group-hover:opacity-100 ${
                      isFollowing
                        ? "border-accent/35 bg-accent/12 text-accent"
                        : "border-white/[0.10] bg-white/[0.03] text-ivory/30 hover:border-accent/30 hover:text-accent hover:bg-accent/10"
                    }`}
                    title={isFollowing ? "Unfollow" : "Follow"}
                  >
                    {isFollowing ? (
                      <UserCheck size={10} />
                    ) : (
                      <UserPlus size={10} />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Divider />

      {/* Trending tags */}
      <div className="py-4">
        <div className="flex items-center gap-2 px-4 mb-2.5">
          <TrendingUp size={12} className="text-accent" />
          <p className="text-[9px] font-mono font-bold uppercase tracking-[0.15em] text-ivory/25">
            Trending Now
          </p>
        </div>
        {loading ? (
          <div className="animate-pulse px-4 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-2 items-center">
                <div className="w-4 h-2 bg-white/[0.04] rounded" />
                <div className="h-2.5 w-20 bg-white/[0.05] rounded" />
              </div>
            ))}
          </div>
        ) : trendingTags.length === 0 ? (
          <p className="px-4 text-[11px] font-mono text-ivory/15">
            No trending tags yet
          </p>
        ) : (
          <>
            <div className="flex flex-col px-2">
              {visibleTags.map(({ tag, posts }, i) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onTagFilter?.(tag)}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition-all group text-left"
                >
                  <span
                    className={`text-[9px] font-mono font-bold w-4 text-right shrink-0 ${
                      i === 0
                        ? "text-accent/70"
                        : i === 1
                          ? "text-accent/40"
                          : "text-ivory/15"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <p className="flex-1 text-[12px] font-semibold text-ivory/65 group-hover:text-accent transition-colors truncate">
                    #{tag}
                  </p>
                  <span className="text-[9px] font-mono text-ivory/20 shrink-0">
                    {posts}
                  </span>
                </button>
              ))}
            </div>
            {trendingTags.length > 5 && (
              <button
                type="button"
                onClick={() => setShowAllTags((v) => !v)}
                className="mt-2 mx-4 block w-[calc(100%-2rem)] py-1.5 text-[10px] font-mono text-ivory/20 hover:text-accent border border-white/[0.05] hover:border-accent/15 rounded-xl transition-all"
              >
                {showAllTags ? "Show less" : `+${trendingTags.length - 5} more`}
              </button>
            )}
          </>
        )}
      </div>

      <Divider />

      {/* Browse by type */}
      <div className="py-4">
        <div className="flex items-center gap-2 px-4 mb-2.5">
          <Hash size={12} className="text-ivory/25" />
          <p className="text-[9px] font-mono font-bold uppercase tracking-[0.15em] text-ivory/25">
            Browse by Type
          </p>
        </div>
        <div className="flex flex-col px-2">
          {POST_TYPES.map(({ type, icon: Icon, label, color }) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                setFilters?.((p) => ({ ...p, type }));
                setPage?.(1);
              }}
              className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-white/[0.04] transition-all group text-left"
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  size={12}
                  className={`${color} opacity-55 group-hover:opacity-90 transition-opacity shrink-0`}
                />
                <span className="text-[12px] font-medium text-ivory/40 group-hover:text-ivory/70 transition-colors">
                  {label}
                </span>
              </div>
              <ChevronRight
                size={9}
                className="text-ivory/10 opacity-0 group-hover:opacity-60 transition-opacity"
              />
            </button>
          ))}
        </div>
      </div>

      <div className="h-6" />
    </aside>
  );
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────

export default function FeedSidebar({
  side = "left",
  userStats = {},
  followedTags = [],
  onTagFilter,
  collapsed = false,
}) {
  if (side === "left") {
    return (
      <LeftSidebar
        userStats={userStats}
        followedTags={followedTags}
        onTagFilter={onTagFilter}
        collapsed={collapsed}
      />
    );
  }
  return <RightSidebar onTagFilter={onTagFilter} />;
}
