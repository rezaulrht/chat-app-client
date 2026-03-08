"use client";
import React, { useState } from "react";
import Image from "next/image";
import {
  Compass,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  TrendingUp,
  Sparkles,
  ArrowUp,
} from "lucide-react";

const mockPosts = [
  {
    id: 1,
    author: {
      name: "Sarah Chen",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      role: "Product Lead",
    },
    workspace: "Design Systems",
    time: "2h ago",
    content:
      "Just shipped the new component library v3.0! Includes 40+ new components with full dark mode support and accessibility improvements across the board.",
    likes: 24,
    comments: 8,
    tag: "Announcement",
    tagColor: "#00d3bb",
  },
  {
    id: 2,
    author: {
      name: "Marcus Rivera",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
      role: "Engineering",
    },
    workspace: "Backend Team",
    time: "4h ago",
    content:
      "Performance update: API response times are now averaging 48ms across all endpoints. WebSocket reconnection has been optimized to < 200ms.",
    likes: 31,
    comments: 12,
    tag: "Performance",
    tagColor: "#22c55e",
  },
  {
    id: 3,
    author: {
      name: "Elena Volkov",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena",
      role: "Community",
    },
    workspace: "General",
    time: "6h ago",
    content:
      "Reminder: Team retrospective is happening this Friday at 3pm. Please fill out the feedback form beforehand so we can make the most of our time together.",
    likes: 15,
    comments: 4,
    tag: "Event",
    tagColor: "#a78bfa",
  },
  {
    id: 4,
    author: {
      name: "David Kim",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
      role: "DevOps",
    },
    workspace: "Infrastructure",
    time: "1d ago",
    content:
      "Deployed the new Redis cluster configuration. Message delivery is now 3x faster with the new pub/sub architecture. Monitoring looks healthy across all regions.",
    likes: 42,
    comments: 16,
    tag: "Deploy",
    tagColor: "#f59e0b",
  },
];

const trendingTopics = [
  { name: "Component Library v3", posts: 24 },
  { name: "Q2 Roadmap", posts: 18 },
  { name: "WebSocket Optimization", posts: 12 },
  { name: "Dark Mode", posts: 9 },
];

export default function FeedView() {
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [savedPosts, setSavedPosts] = useState(new Set());

  const toggleLike = (id) => {
    setLikedPosts((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSave = (id) => {
    setSavedPosts((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <main className="flex-1 min-w-0 flex flex-col bg-obsidian relative h-full">
      {/* Header */}
      <header className="h-17 border-b border-white/[0.06] flex justify-between items-center px-5 glass-panel shrink-0 relative">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shadow-[0_0_16px_rgba(0,211,187,0.08)]">
              <Compass className="text-accent" size={18} />
            </div>
            <div>
              <h2 className="font-display font-bold text-ivory text-sm leading-tight">
                Global Feed
              </h2>
              <p className="text-[10px] font-mono text-ivory/20 uppercase tracking-[0.12em]">
                All workspaces
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] font-mono text-ivory/20 uppercase tracking-[0.15em]">
            Live
          </span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/10 to-transparent" />
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-5">
          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl glass-card p-8 mb-2">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[100px] rounded-full pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-accent" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-accent/70">
                  What’s happening
                </span>
              </div>
              <h2 className="font-serif italic text-3xl text-ivory/90 mb-2">
                Stay in the loop.
              </h2>
              <p className="text-ivory/30 text-sm max-w-md leading-relaxed">
                Updates, announcements, and highlights from across all your
                workspaces in one cinematic feed.
              </p>
            </div>
          </div>

          {/* Trending Topics */}
          <div className="flex items-center gap-3">
            <TrendingUp size={14} className="text-accent/60 shrink-0" />
            <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
              {trendingTopics.map((topic) => (
                <button
                  key={topic.name}
                  className="shrink-0 px-3.5 py-1.5 rounded-full glass-card text-ivory/40 text-[11px] font-medium hover:text-ivory hover:border-accent/30 hover:shadow-[0_0_12px_rgba(0,211,187,0.08)] transition-all duration-300"
                >
                  {topic.name}
                  <span className="text-ivory/15 ml-1.5 font-mono text-[10px]">
                    {topic.posts}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Posts */}
          {mockPosts.map((post) => {
            const isLiked = likedPosts.has(post.id);
            const isSaved = savedPosts.has(post.id);
            return (
              <article
                key={post.id}
                className="glass-card rounded-2xl p-5 transition-all duration-300 hover:shadow-[0_8px_40px_rgba(0,0,0,0.15)] hover:border-white/[0.12] group/post"
              >
                {/* Post Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden ring-1 ring-white/[0.06] group-hover/post:ring-accent/20 transition-all duration-300">
                      <Image
                        src={post.author.avatar}
                        width={40}
                        height={40}
                        alt={post.author.name}
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-ivory font-display font-bold text-sm">
                          {post.author.name}
                        </span>
                        <span className="text-ivory/15 text-[10px] font-mono">
                          {post.author.role}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-ivory/25 text-[11px]">
                          {post.workspace}
                        </span>
                        <span className="text-ivory/10">·</span>
                        <span className="text-ivory/20 text-[11px] font-mono">
                          {post.time}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span
                    className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg"
                    style={{
                      color: post.tagColor,
                      borderWidth: 1,
                      borderColor: post.tagColor + "25",
                      background: post.tagColor + "10",
                      boxShadow: "0 0 12px " + post.tagColor + "08",
                    }}
                  >
                    {post.tag}
                  </span>
                </div>

                {/* Post Content */}
                <p className="text-ivory/55 text-[13.5px] leading-relaxed mb-5">
                  {post.content}
                </p>

                {/* Post Actions */}
                <div className="flex items-center justify-between pt-3.5 border-t border-white/[0.04]">
                  <div className="flex items-center gap-5">
                    <button
                      onClick={() => toggleLike(post.id)}
                      className={
                        "flex items-center gap-1.5 text-xs transition-all duration-200 " +
                        (isLiked
                          ? "text-rose-400"
                          : "text-ivory/20 hover:text-rose-400")
                      }
                    >
                      <Heart
                        size={14}
                        className={isLiked ? "fill-rose-400" : ""}
                      />
                      <span className="font-mono">
                        {post.likes + (isLiked ? 1 : 0)}
                      </span>
                    </button>
                    <button className="flex items-center gap-1.5 text-ivory/20 hover:text-accent transition-all duration-200 text-xs">
                      <MessageCircle size={14} />
                      <span className="font-mono">{post.comments}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-ivory/20 hover:text-accent transition-all duration-200 text-xs">
                      <Share2 size={14} />
                    </button>
                  </div>
                  <button
                    onClick={() => toggleSave(post.id)}
                    className={
                      "transition-all duration-200 " +
                      (isSaved
                        ? "text-accent"
                        : "text-ivory/15 hover:text-accent")
                    }
                  >
                    <Bookmark
                      size={14}
                      className={isSaved ? "fill-accent" : ""}
                    />
                  </button>
                </div>
              </article>
            );
          })}

          {/* End Indicator */}
          <div className="flex flex-col items-center py-10 gap-3">
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <p className="font-serif italic text-ivory/15 text-sm">
              You’re all caught up
            </p>
            <button className="flex items-center gap-1.5 text-[11px] font-mono text-accent/40 hover:text-accent transition-colors">
              <ArrowUp size={12} /> Back to top
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
