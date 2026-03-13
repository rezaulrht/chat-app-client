"use client";

import { useState } from "react";
import { Edit3 } from "lucide-react";
import PostCard from "./PostCard";
import PostDetail from "./PostDetail";
import PostComposer from "./PostComposer";
import ShareModal from "./ShareModal";
import FeedSidebar from "./FeedSidebar";

// ── Tab definitions ───────────────────────────────────────────────────────────
const TABS = [
  { id: "latest", label: "Latest" },
  { id: "trending", label: "Trending" },
  { id: "top", label: "Top" },
  { id: "following", label: "Following" },
  { id: "qa", label: "Q&A" },
];

// ── Design-phase mock posts ───────────────────────────────────────────────────
const MOCK_POSTS = [
  {
    _id: "p1",
    type: "question",
    isPinned: true,
    title: "Handling WebSocket reconnection in high-latency environments?",
    content:
      "Been having issues with Socket.io drops on mobile networks. What's the best exponential backoff strategy for auto-reconnects without flooding the server?",
    author: {
      _id: "dev_mira",
      name: "dev_mira",
      avatar: null,
      reputation: 2100,
    },
    tags: ["websockets", "socket-io"],
    reactions: {},
    commentCount: 24,
    views: 891,
    isResolved: false,
    acceptedAnswer: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    _id: "p2",
    type: "snippet",
    title: null,
    content: "Cleanest way to handle window resizing with a custom hook. 🪟",
    author: {
      _id: "josh_stack",
      name: "josh_stack",
      avatar: null,
      reputation: 1420,
    },
    tags: ["react"],
    reactions: {
      "🔥": Array.from({ length: 12 }, (_, i) => `u${i + 1}`),
      "✏️": Array.from({ length: 5 }, (_, i) => `u${i + 1}`),
    },
    commentCount: 0,
    views: 224,
    isPinned: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    codeBlocks: [
      {
        filename: "useWindowSize.js",
        language: "javascript",
        code: 'function useWindowSize() {\n  const [size, setSize] = useState([window.innerWidth, window.innerHeight]);\n  useEffect(() => {\n    const handleResize = () => setSize([window.innerWidth, window.innerHeight]);\n    window.addEventListener("resize", handleResize);\n    return () => window.removeEventListener("resize", handleResize);\n  }, []);\n  return size;\n}',
      },
    ],
  },
  {
    _id: "p3",
    type: "til",
    title: null,
    content:
      "Did you know `aspect-ratio` CSS property now has 94%+ global support? Say goodbye to the padding-bottom hack for responsive containers!",
    author: {
      _id: "css_wizard",
      name: "css_wizard",
      avatar: null,
      reputation: 890,
    },
    tags: ["css", "webdev"],
    reactions: { "👍": Array.from({ length: 142 }, (_, i) => `u${i + 1}`) },
    commentCount: 18,
    views: 402,
    isPinned: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    _id: "p4",
    type: "poll",
    title: null,
    content: null,
    author: {
      _id: "poll_master",
      name: "poll_master",
      avatar: null,
      reputation: 340,
    },
    tags: ["statemanagement"],
    reactions: {},
    commentCount: 0,
    views: 1842,
    isPinned: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    poll: {
      question:
        "What's your preferred state management for mid-sized apps in 2024?",
      options: [
        {
          text: "Zustand",
          votes: Array.from({ length: 47 }, (_, i) => `u${i + 1}`),
        },
        {
          text: "Redux Toolkit",
          votes: Array.from({ length: 31 }, (_, i) => `u${i + 1}`),
        },
        {
          text: "Jotai",
          votes: Array.from({ length: 22 }, (_, i) => `u${i + 1}`),
        },
      ],
      multiSelect: false,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
    },
  },
  {
    _id: "p5",
    type: "showcase",
    title: `Just finished the beta for "SketchSync" — a collaborative real-time whiteboard for dev teams. Built with Next.js and Liveblocks.`,
    content: null,
    author: {
      _id: "pixel_perfect",
      name: "pixel_perfect",
      avatar: null,
      reputation: 2840,
    },
    tags: ["showcase", "nextjs"],
    reactions: {
      "😍": Array.from({ length: 84 }, (_, i) => `u${i + 1}`),
      "💡": Array.from({ length: 12 }, (_, i) => `u${i + 1}`),
    },
    commentCount: 0,
    views: 523,
    isPinned: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    linkPreview: {
      url: "https://sketchsync.io",
      title: "sketchsync.io",
      description: "The most intuitive canvas for remote pair programming...",
      image: null,
    },
    screenshots: [
      "https://placehold.co/400x260/1a1a2e/00d3bb?text=SketchSync",
      "https://placehold.co/400x260/12121a/13c8ec?text=Whiteboard",
      "https://placehold.co/400x260/1a1a2e/9b59b6?text=Collab",
    ],
  },
];

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyFeed() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3 text-center px-8">
      <div className="w-12 h-12 rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06] flex items-center justify-center text-xl">
        💬
      </div>
      <p className="font-display font-bold text-ivory/50 text-sm">
        Nothing here yet
      </p>
      <p className="text-[12px] font-mono text-ivory/25">
        Be the first to post something!
      </p>
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function PostSkeleton() {
  return (
    <div className="px-5 py-5 border-b border-white/[0.05] flex flex-col gap-3 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-white/[0.06]" />
        <div className="h-3 w-24 rounded-full bg-white/[0.06]" />
        <div className="h-3 w-16 rounded-full bg-white/[0.04] ml-2" />
      </div>
      <div className="h-4 w-3/4 rounded-full bg-white/[0.06]" />
      <div className="space-y-2">
        <div className="h-3 w-full rounded-full bg-white/[0.04]" />
        <div className="h-3 w-5/6 rounded-full bg-white/[0.04]" />
      </div>
    </div>
  );
}

// ── Main FeedView ─────────────────────────────────────────────────────────────
export default function FeedView() {
  const [activeTab, setActiveTab] = useState("latest");
  const [composerOpen, setComposerOpen] = useState(false);
  const [activePost, setActivePost] = useState(null); // PostDetail view
  const [sharePost, setSharePost] = useState(null); // ShareModal target

  // Design-phase: just show mock posts for all tabs
  const displayPosts = MOCK_POSTS;
  const loading = false;

  return (
    <div className="flex h-full bg-obsidian overflow-hidden">
      {/* ── Centre column ── */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden border-r border-white/[0.06]">
        {/* Feed header */}
        <div className="shrink-0 flex items-center justify-between px-6 pt-5 pb-3">
          <h1 className="font-display font-bold text-ivory text-[22px] tracking-tight">
            Community Feed
          </h1>
          <button
            type="button"
            onClick={() => setComposerOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-obsidian font-display font-bold text-[13px] hover:bg-accent/85 active:scale-95 transition-all duration-150"
          >
            <Edit3 size={14} />
            New Post
          </button>
        </div>

        {/* Tab bar */}
        <div className="shrink-0 flex items-end border-b border-white/[0.05] px-4">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-[13px] font-display font-semibold border-b-2 transition-all duration-150 -mb-px ${
                activeTab === tab.id
                  ? "border-accent text-ivory"
                  : "border-transparent text-ivory/40 hover:text-ivory/70"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Post list or PostDetail */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {activePost ? (
            <PostDetail
              post={activePost}
              comments={[]}
              currentUserId="u_me"
              onBack={() => setActivePost(null)}
              onReact={() => {}}
              onShare={(p) => setSharePost(p)}
              onTagClick={() => {}}
            />
          ) : loading ? (
            <div className="flex flex-col">
              {Array.from({ length: 4 }).map((_, i) => (
                <PostSkeleton key={i} />
              ))}
            </div>
          ) : displayPosts.length === 0 ? (
            <EmptyFeed />
          ) : (
            <div className="flex flex-col">
              {displayPosts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  currentUserId="u_me"
                  onOpen={setActivePost}
                  onReact={() => {}}
                  onShare={setSharePost}
                  onTagClick={() => {}}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Right sidebar ── */}
      <div className="hidden lg:block w-[220px] shrink-0">
        <FeedSidebar side="right" onTagFilter={() => {}} />
      </div>

      {/* ── Modals ── */}
      <PostComposer
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        onSubmit={() => setComposerOpen(false)}
      />
      <ShareModal
        post={sharePost}
        open={!!sharePost}
        onClose={() => setSharePost(null)}
      />
    </div>
  );
}
