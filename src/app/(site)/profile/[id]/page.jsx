"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Calendar,
  Mail,
  Globe,
  Github,
  Chrome,
  ArrowLeft,
  FileText,
  MessageSquare,
  UserPlus,
  UserCheck,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import useAuth from "@/hooks/useAuth";
import useFeed from "@/hooks/useFeed";
import ReputationBadge, { getLevel } from "@/components/Feed/ReputationBadge";
import PostCard from "@/components/Feed/PostCard";
import TagChip from "@/components/Feed/TagChip";

const TABS = [
  { id: "posts", label: "Posts", icon: FileText },
  { id: "answers", label: "Answers", icon: MessageSquare },
];

function formatJoined(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function StatPill({ value, label }) {
  return (
    <div className="flex flex-col items-center px-4 py-2">
      <span className="font-display font-bold text-ivory text-lg leading-tight">
        {value}
      </span>
      <span className="text-[10px] font-mono text-ivory/25 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

function PublicProfilePage() {
  const params = useParams();
  const profileId = params?.id;
  const { user: me } = useAuth();
  const { getUserProfile, getUserPosts, followUser } = useFeed();

  const [activeTab, setActiveTab] = useState("posts");
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [postsPage, setPostsPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(false);

  // ── Load profile ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!profileId) return;
    let cancelled = false;

    // Reset stale state before loading new profile
    setProfile(null);
    setFollowing(false);
    setPosts([]);
    setPostsPage(1);
    setHasMorePosts(false);

    const load = async () => {
      setLoadingProfile(true);
      try {
        const data = await getUserProfile(profileId);
        if (!cancelled) {
          setProfile(data);
          setFollowing(data.isFollowing);
        }
      } catch {
        if (!cancelled) toast.error("Could not load profile");
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [profileId, getUserProfile]);

  // ── Load posts ─────────────────────────────────────────────────────────────
  const loadPosts = useCallback(
    async (page = 1) => {
      if (!profileId) return;
      setLoadingPosts(true);
      try {
        const data = await getUserPosts(profileId, page);
        if (page === 1) {
          setPosts(data.posts || []);
        } else {
          setPosts((prev) => [...prev, ...(data.posts || [])]);
        }
        setHasMorePosts(data.hasMore ?? false);
      } catch {
        // silently fail — posts section shows empty state
      } finally {
        setLoadingPosts(false);
      }
    },
    [profileId, getUserPosts],
  );

  useEffect(() => {
    if (activeTab === "posts") {
      setPostsPage(1);
      loadPosts(1);
    }
  }, [activeTab, loadPosts]);

  // ── Follow toggle ──────────────────────────────────────────────────────────
  const handleFollow = async () => {
    if (followLoading) return;
    setFollowLoading(true);
    const prev = following;

    // Optimistic
    setFollowing(!prev);
    setProfile((p) =>
      p
        ? {
            ...p,
            followersCount: (p.followersCount ?? 0) + (prev ? -1 : 1),
            isFollowing: !prev,
          }
        : p,
    );

    try {
      await followUser(profileId);
    } catch {
      setFollowing(prev);
      setProfile((p) =>
        p
          ? {
              ...p,
              followersCount: (p.followersCount ?? 0) + (prev ? 1 : -1),
              isFollowing: prev,
            }
          : p,
      );
      toast.error("Could not update follow status");
    } finally {
      setFollowLoading(false);
    }
  };

  // ── Loading / error states ─────────────────────────────────────────────────
  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-obsidian pt-20 flex items-center justify-center">
        <Loader2 size={32} className="text-accent/40 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-obsidian pt-20 flex items-center justify-center">
        <p className="text-ivory/30 font-mono text-sm">Profile not found.</p>
      </div>
    );
  }

  const isOwnProfile =
    profile.isOwnProfile || profile._id?.toString() === (me?._id ?? me?.id);
  const level = getLevel(profile.reputation);

  const ProviderIcon =
    profile.provider === "google"
      ? Chrome
      : profile.provider === "github"
        ? Github
        : Mail;

  return (
    <div className="min-h-screen bg-obsidian pt-20 pb-16">
      {/* Back link */}
      <div className="max-w-4xl mx-auto px-4 mb-6">
        <Link
          href="/app/feed"
          className="inline-flex items-center gap-1.5 text-[12px] font-mono text-ivory/30 hover:text-ivory/70 transition-colors"
        >
          <ArrowLeft size={13} /> Back to feed
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4 flex flex-col gap-6">
        {/* ── Hero card ── */}
        <div className="glass-card rounded-3xl p-6 flex flex-col sm:flex-row gap-5">
          {/* Avatar */}
          <div className="shrink-0">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/[0.06] ring-2 ring-white/[0.12] shadow-xl">
              {profile.avatar ? (
                <Image
                  src={profile.avatar}
                  alt={profile.name}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-ivory/30 font-display font-bold text-3xl">
                  {profile.name?.[0] ?? "?"}
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h1 className="font-display font-bold text-ivory text-xl leading-tight">
                  {profile.name}
                </h1>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <ReputationBadge
                    reputation={profile.reputation}
                    showLabel
                    showPoints
                  />
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-ivory/30">
                    <ProviderIcon size={10} />
                    {profile.provider === "github"
                      ? "GitHub"
                      : profile.provider === "google"
                        ? "Google"
                        : "Email"}
                  </span>
                </div>
              </div>

              {/* Follow / Edit */}
              {!isOwnProfile ? (
                <button
                  type="button"
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-mono font-bold transition-all duration-200 disabled:opacity-50 ${
                    following
                      ? "bg-accent/12 ring-1 ring-accent/25 text-accent hover:bg-accent/20"
                      : "bg-white/[0.06] ring-1 ring-white/[0.10] text-ivory/60 hover:text-ivory hover:bg-white/[0.10]"
                  }`}
                >
                  {followLoading ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : following ? (
                    <UserCheck size={13} />
                  ) : (
                    <UserPlus size={13} />
                  )}
                  {following ? "Following" : "Follow"}
                </button>
              ) : (
                <Link
                  href="/profile"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-mono font-bold bg-white/[0.06] ring-1 ring-white/[0.10] text-ivory/60 hover:text-ivory hover:bg-white/[0.10] transition-all"
                >
                  Edit Profile
                </Link>
              )}
            </div>

            {profile.bio && (
              <p className="text-[13px] text-ivory/60 font-sans leading-relaxed">
                {profile.bio}
              </p>
            )}

            <div className="flex items-center gap-4 flex-wrap text-[11px] font-mono text-ivory/30">
              {profile.createdAt && (
                <span className="flex items-center gap-1">
                  <Calendar size={11} /> Joined{" "}
                  {formatJoined(profile.createdAt)}
                </span>
              )}
            </div>

            {(profile.followedTags?.length ?? 0) > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {profile.followedTags.map((tag) => (
                  <TagChip key={tag} tag={tag} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="glass-card rounded-2xl flex items-center divide-x divide-white/[0.06]">
          <StatPill value={profile.postCount ?? 0} label="Posts" />
          <StatPill value={profile.followersCount ?? 0} label="Followers" />
          <StatPill value={profile.followingCount ?? 0} label="Following" />
          <StatPill value={profile.reputation ?? 0} label="Rep" />
        </div>

        {/* ── Tabs ── */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="flex border-b border-white/[0.06] px-4 pt-2">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-mono font-bold uppercase tracking-wider border-b-2 transition-all duration-150 ${
                  activeTab === id
                    ? "border-accent text-accent"
                    : "border-transparent text-ivory/30 hover:text-ivory/60"
                }`}
              >
                <Icon size={12} /> {label}
              </button>
            ))}
          </div>

          <div className="p-4 flex flex-col gap-3">
            {/* Posts tab */}
            {activeTab === "posts" && (
              <>
                {loadingPosts && posts.length === 0 ? (
                  <div className="flex justify-center py-10">
                    <Loader2
                      size={24}
                      className="text-accent/40 animate-spin"
                    />
                  </div>
                ) : posts.length === 0 ? (
                  <p className="text-center text-[12px] font-mono text-ivory/20 py-10">
                    No posts yet.
                  </p>
                ) : (
                  <>
                    {posts.map((post) => (
                      <PostCard
                        key={post._id}
                        post={post}
                        currentUserId={me?._id ?? me?.id ?? ""}
                      />
                    ))}
                    {hasMorePosts && (
                      <button
                        onClick={async () => {
                          const next = postsPage + 1;
                          await loadPosts(next);
                          setPostsPage(next);
                        }}
                        disabled={loadingPosts}
                        className="w-full py-2 text-[12px] font-mono text-ivory/30 hover:text-ivory/60 transition-colors flex items-center justify-center gap-2"
                      >
                        {loadingPosts ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          "Load more"
                        )}
                      </button>
                    )}
                  </>
                )}
              </>
            )}

            {/* Answers tab */}
            {activeTab === "answers" && (
              <p className="text-center text-[12px] font-mono text-ivory/20 py-10">
                Accepted answers coming soon.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PublicProfilePageWrapper() {
  return (
    <ProtectedRoute>
      <PublicProfilePage />
    </ProtectedRoute>
  );
}
