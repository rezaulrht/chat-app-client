"use client";

import { useState } from "react";
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
  MapPin,
} from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import useAuth from "@/hooks/useAuth";
import ReputationBadge, { getLevel } from "@/components/Feed/ReputationBadge";
import PostCard from "@/components/Feed/PostCard";
import TagChip from "@/components/Feed/TagChip";

// ── Design-phase mock profile ─────────────────────────────────────────────────
const MOCK_PROFILE = {
  _id: "u1",
  name: "Alex Kim",
  avatar: null,
  bio: "Full-stack dev obsessed with DX and performance. Building cool things with TypeScript, Rust, and WebAssembly.",
  location: "Seoul, South Korea",
  website: "https://alexkim.dev",
  provider: "github",
  reputation: 820,
  following: ["u2", "u3"],
  followers: ["u2", "u3", "u4", "u5", "u6"],
  followedTags: ["typescript", "rust", "webassembly"],
  createdAt: "2024-01-15T00:00:00.000Z",
};

const MOCK_POSTS = [
  {
    _id: "p1",
    type: "showcase",
    title:
      "Built a real-time collaborative whiteboard with WebRTC + Canvas API",
    content:
      "Spent the last 3 weekends on this. P2P signalling via a small Socket.io relay, all drawing state sync'd via CRDT-lite.",
    author: MOCK_PROFILE,
    tags: ["webrtc", "canvas", "showcase"],
    reactions: { "🔥": ["u2", "u3", "u4", "u5"], "🚀": ["u6"] },
    commentCount: 11,
    views: 312,
    isPinned: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    _id: "p2",
    type: "question",
    title: "What's the best way to manage global state in Next.js 14?",
    content: "I've been juggling between Zustand, Jotai, and the Context API.",
    author: MOCK_PROFILE,
    tags: ["nextjs", "react", "state"],
    reactions: { "🔥": ["u2", "u3"], "💡": ["u4"] },
    commentCount: 7,
    views: 142,
    isPinned: false,
    isResolved: false,
    acceptedAnswer: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 37).toISOString(),
  },
];

const MOCK_ACCEPTED_ANSWERS = [
  {
    _id: "c1",
    post: { title: "How do I debounce inputs in React?" },
    content:
      "Use `useCallback` + a `useEffect` with `setTimeout` — or just reach for `use-debounce` from npm for convenience.",
    reactions: { "👏": ["u2", "u3"] },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

// ── Page tabs ─────────────────────────────────────────────────────────────────
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

// ── Stat pill ─────────────────────────────────────────────────────────────────
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

// ── Main Page ─────────────────────────────────────────────────────────────────
function PublicProfilePage() {
  const params = useParams();
  const { user: me } = useAuth();
  const [activeTab, setActiveTab] = useState("posts");
  const [following, setFollowing] = useState(false); // TODO: derive from me.following.includes(params.id)

  // Design-phase: always show mock profile
  const profile = MOCK_PROFILE;
  const isOwnProfile = profile._id === me?._id;
  const level = getLevel(profile.reputation);

  const ProviderIcon =
    profile.provider === "google"
      ? Chrome
      : profile.provider === "github"
        ? Github
        : Mail;

  return (
    <div className="min-h-screen bg-obsidian pt-20 pb-16">
      {/* ── Back link ── */}
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

              {/* Follow button */}
              {!isOwnProfile && (
                <button
                  type="button"
                  onClick={() => setFollowing((f) => !f)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-mono font-bold transition-all duration-200 ${
                    following
                      ? "bg-accent/12 ring-1 ring-accent/25 text-accent hover:bg-accent/20"
                      : "bg-white/[0.06] ring-1 ring-white/[0.10] text-ivory/60 hover:text-ivory hover:bg-white/[0.10]"
                  }`}
                >
                  {following ? <UserCheck size={13} /> : <UserPlus size={13} />}
                  {following ? "Following" : "Follow"}
                </button>
              )}

              {isOwnProfile && (
                <Link
                  href="/profile"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-mono font-bold bg-white/[0.06] ring-1 ring-white/[0.10] text-ivory/60 hover:text-ivory hover:bg-white/[0.10] transition-all"
                >
                  Edit Profile
                </Link>
              )}
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-[13px] text-ivory/60 font-sans leading-relaxed">
                {profile.bio}
              </p>
            )}

            {/* Meta row */}
            <div className="flex items-center gap-4 flex-wrap text-[11px] font-mono text-ivory/30">
              {profile.location && (
                <span className="flex items-center gap-1">
                  <MapPin size={11} /> {profile.location}
                </span>
              )}
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-accent/70 transition-colors"
                >
                  <Globe size={11} />{" "}
                  {profile.website.replace(/^https?:\/\//, "")}
                </a>
              )}
              {profile.createdAt && (
                <span className="flex items-center gap-1">
                  <Calendar size={11} /> Joined{" "}
                  {formatJoined(profile.createdAt)}
                </span>
              )}
            </div>

            {/* Followed tags */}
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
          <StatPill value={MOCK_POSTS.length} label="Posts" />
          <StatPill value={profile.followers?.length ?? 0} label="Followers" />
          <StatPill value={profile.following?.length ?? 0} label="Following" />
          <StatPill value={MOCK_ACCEPTED_ANSWERS.length} label="Answers" />
          <StatPill value={profile.reputation} label="Rep" />
        </div>

        {/* ── Tabs + content ── */}
        <div className="glass-card rounded-2xl overflow-hidden">
          {/* Tab bar */}
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

          {/* Tab content */}
          <div className="p-4 flex flex-col gap-3">
            {activeTab === "posts" && (
              <>
                {MOCK_POSTS.length === 0 ? (
                  <p className="text-center text-[12px] font-mono text-ivory/20 py-10">
                    No posts yet.
                  </p>
                ) : (
                  MOCK_POSTS.map((post) => (
                    <PostCard
                      key={post._id}
                      post={post}
                      currentUserId={me?._id ?? ""}
                    />
                  ))
                )}
              </>
            )}

            {activeTab === "answers" && (
              <>
                {MOCK_ACCEPTED_ANSWERS.length === 0 ? (
                  <p className="text-center text-[12px] font-mono text-ivory/20 py-10">
                    No accepted answers yet.
                  </p>
                ) : (
                  MOCK_ACCEPTED_ANSWERS.map((ans) => (
                    <div
                      key={ans._id}
                      className="glass-card rounded-xl p-4 flex flex-col gap-2"
                    >
                      <p className="text-[10px] font-mono text-emerald-400/60 uppercase tracking-wider">
                        ✓ Accepted Answer
                      </p>
                      {ans.post?.title && (
                        <p className="text-[12px] font-mono text-ivory/30 italic">
                          On: {ans.post.title}
                        </p>
                      )}
                      <p className="text-[13px] text-ivory/70 font-sans leading-relaxed">
                        {ans.content}
                      </p>
                    </div>
                  ))
                )}
              </>
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
