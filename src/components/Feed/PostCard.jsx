"use client";

import { useState } from "react";
import Image from "next/image";
import {
  MessageSquare,
  Share2,
  Bookmark,
  MoreHorizontal,
  Pin,
  Pencil,
  Trash2,
  ExternalLink,
} from "lucide-react";
import SnippetBlock from "./SnippetBlock";
import MarkdownText from "./MarkdownText";
import { formatDistanceToNow } from "date-fns";

// ── Helpers ─────────────────────────────────────────────────────────────────
function timeAgo(date) {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return "";
  }
}

function getPostReactions(post) {
  return post?.reactions ?? {};
}

function getReactionTotal(reactions) {
  return Object.values(reactions ?? {}).reduce((sum, value) => {
    if (Array.isArray(value)) return sum + value.length;
    if (typeof value === "number") return sum + value;
    return sum;
  }, 0);
}

// ── Reusable sub-components ──────────────────────────────────────────────────
function AvatarCircle({ user, size = 32 }) {
  return (
    <div
      style={{ width: size, height: size, minWidth: size }}
      className="rounded-full overflow-hidden bg-accent/10 ring-1 ring-white/[0.1] flex items-center justify-center font-display font-bold text-ivory/55 shrink-0"
    >
      {user?.avatar ? (
        <Image
          src={user.avatar}
          alt={user.name ?? ""}
          width={size}
          height={size}
          className="object-cover w-full h-full"
        />
      ) : (
        <span style={{ fontSize: size * 0.38 }}>
          {user?.name?.[0]?.toUpperCase() ?? "?"}
        </span>
      )}
    </div>
  );
}

function SimpleReactions({ reactions = {}, currentUserId, onReact }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {Object.entries(reactions).map(([emoji, users]) => {
        const usersList = Array.isArray(users) ? users : [];
        const count = Array.isArray(users) ? users.length : Number(users) || 0;

        return count > 0 ? (
          <button
            key={emoji}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onReact?.(emoji);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-mono border transition-all duration-150 ${
              usersList.includes(currentUserId)
                ? "bg-accent/10 border-accent/25 text-accent"
                : "bg-white/[0.04] border-white/[0.08] text-ivory/45 hover:bg-white/[0.07] hover:text-ivory/70"
            }`}
          >
            {emoji} {count}
          </button>
        ) : null;
      })}
    </div>
  );
}

function OverflowMenu({ isOwn, onShare, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-7 h-7 flex items-center justify-center rounded-lg text-ivory/20 hover:text-ivory/60 hover:bg-white/[0.06] transition-all"
      >
        <MoreHorizontal size={14} />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-20 w-36 rounded-xl bg-deep border border-white/[0.1] py-1 shadow-xl shadow-black/30">
          <button
            onClick={() => {
              setOpen(false);
              onShare?.();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-ivory/60 hover:text-ivory hover:bg-white/[0.05] transition-colors"
          >
            <Share2 size={12} /> Share
          </button>
          {isOwn && (
            <>
              <button
                onClick={() => {
                  setOpen(false);
                  onEdit?.();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-ivory/60 hover:text-ivory hover:bg-white/[0.05] transition-colors"
              >
                <Pencil size={12} /> Edit
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  const confirmed = window.confirm("Delete this post?");
                  if (!confirmed) return;
                  onDelete?.();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-red-400/70 hover:text-red-400 hover:bg-red-400/5 transition-colors"
              >
                <Trash2 size={12} /> Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function PostCard({
  post = {},
  currentUserId = "",
  onOpen,
  onReact,
  onShare,
  onTagClick,
  onEdit,
  onDelete,
}) {
  const authorId =
    typeof post.author?._id === "string"
      ? post.author._id
      : post.author?._id?.toString?.() || "";
  const isOwn = authorId === currentUserId || authorId === "me";
  const commentCount = post.commentCount ?? post.commentsCount ?? 0;
  const reactions = getPostReactions(post);

  // ── Base style for all feed items ──
  const base =
    "relative cursor-pointer hover:bg-white/[0.02] transition-colors duration-150 border-b border-white/[0.06]";

  // ────────────────── QUESTION ─────────────────────────────────────────────
  if (post.type === "question") {
    return (
      <article
        className={`${base} ${
          post.isPinned
            ? "pl-4 pr-5 py-5 border-l-[3px] border-l-accent"
            : "px-5 py-5"
        }`}
        onClick={() => onOpen?.(post)}
      >
        {post.isPinned && (
          <div className="flex items-center gap-1.5 mb-3">
            <Pin size={10} className="text-accent/60" />
            <span className="text-[10px] font-mono font-bold text-accent/60 uppercase tracking-[0.14em]">
              Pinned Question
            </span>
          </div>
        )}
        <h3 className="font-display font-bold text-ivory text-[17px] leading-snug mb-2">
          {post.title}
        </h3>
        <MarkdownText className="text-[13px] text-ivory/50 leading-relaxed mb-4 font-sans [&_p]:my-0 [&_strong]:text-ivory/80 [&_em]:text-ivory/75">
          {post.content}
        </MarkdownText>
        <div
          className="flex items-center gap-3 flex-wrap"
          onClick={(e) => e.stopPropagation()}
        >
          <AvatarCircle user={post.author} size={24} />
          <span className="text-[12px] font-mono text-ivory/30">
            asked by <span className="text-ivory/55">{post.author?.name}</span>
            {" · "}
            {timeAgo(post.createdAt)}
          </span>
          <div className="ml-auto flex items-center gap-2.5">
            <OverflowMenu
              isOwn={isOwn}
              onShare={() => onShare?.(post)}
              onEdit={() => onEdit?.(post)}
              onDelete={() => onDelete?.(post._id)}
            />
            <button
              onClick={() => onOpen?.(post)}
              className="flex items-center gap-1 text-[12px] font-mono text-ivory/30 hover:text-ivory/50 transition-colors"
            >
              <MessageSquare size={12} /> {commentCount}
            </button>
            <button
              onClick={() => onOpen?.(post)}
              className="px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/25 text-accent text-[12px] font-mono font-bold hover:bg-accent/20 transition-colors"
            >
              Answer
            </button>
          </div>
        </div>
      </article>
    );
  }

  // ────────────────── SNIPPET ──────────────────────────────────────────────
  if (post.type === "snippet") {
    return (
      <article className={`${base} px-5 py-5`} onClick={() => onOpen?.(post)}>
        <div className="flex items-center gap-2.5 mb-3">
          <AvatarCircle user={post.author} size={32} />
          <div className="flex-1 min-w-0">
            <span className="font-display font-bold text-ivory/85 text-[13px]">
              {post.author?.name}
            </span>
            <span className="text-[12px] font-mono text-ivory/30">
              {" · Shared a snippet in "}
              <span className="text-accent/65">#{post.tags?.[0]}</span>
              {" · "}
              {timeAgo(post.createdAt)}
            </span>
          </div>
          <OverflowMenu
            isOwn={isOwn}
            onShare={() => onShare?.(post)}
            onEdit={() => onEdit?.(post)}
            onDelete={() => onDelete?.(post._id)}
          />
        </div>
        {post.content && (
          <MarkdownText className="text-[13px] text-ivory/60 mb-3 font-sans [&_p]:my-0 [&_strong]:text-ivory/85 [&_em]:text-ivory/75">
            {post.content}
          </MarkdownText>
        )}
        {(post.codeBlocks?.length ?? 0) > 0 && (
          <div onClick={(e) => e.stopPropagation()}>
            <SnippetBlock files={post.codeBlocks.slice(0, 1)} />
          </div>
        )}
        <div className="mt-3" onClick={(e) => e.stopPropagation()}>
          <SimpleReactions
            reactions={reactions}
            currentUserId={currentUserId}
            onReact={(emoji) => onReact?.(post._id, emoji)}
          />
        </div>
      </article>
    );
  }

  // ────────────────── TIL ──────────────────────────────────────────────────
  if (post.type === "til") {
    const totalReactions = getReactionTotal(reactions);
    return (
      <article className={`${base} px-5 py-5`} onClick={() => onOpen?.(post)}>
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="text-[10px] font-mono font-bold text-ivory/30 uppercase tracking-[0.16em] bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 rounded">
            TIL
          </span>
          <OverflowMenu
            isOwn={isOwn}
            onShare={() => onShare?.(post)}
            onEdit={() => onEdit?.(post)}
            onDelete={() => onDelete?.(post._id)}
          />
        </div>
        <MarkdownText className="text-[14px] text-ivory/75 leading-relaxed mb-4 font-sans [&_p]:my-0 [&_strong]:text-ivory/85 [&_em]:text-ivory/80">
          {post.content}
        </MarkdownText>
        <div
          className="flex items-center gap-4"
          onClick={(e) => e.stopPropagation()}
        >
          <button className="flex items-center gap-1.5 text-[12px] font-mono text-ivory/35 hover:text-ivory/60 transition-colors">
            👍 {totalReactions}
          </button>
          <button
            onClick={() => onOpen?.(post)}
            className="flex items-center gap-1.5 text-[12px] font-mono text-ivory/35 hover:text-ivory/60 transition-colors"
          >
            <MessageSquare size={12} /> {commentCount}
          </button>
          <button className="flex items-center gap-1.5 text-[12px] font-mono text-ivory/35 hover:text-ivory/60 transition-colors">
            <Bookmark size={12} /> Save
          </button>
        </div>
      </article>
    );
  }

  // ────────────────── POLL ─────────────────────────────────────────────────
  if (post.type === "poll" && post.poll) {
    const totalVotes = post.poll.options.reduce(
      (sum, o) => sum + (o.votes?.length ?? 0),
      0,
    );
    const POLL_COLORS = [
      "bg-accent",
      "bg-blue-400",
      "bg-purple-400",
      "bg-amber-400",
    ];
    const pollEndDate = post.poll.expiresAt ?? post.poll.endsAt;
    const daysLeft = pollEndDate
      ? Math.max(0, Math.ceil((new Date(pollEndDate) - Date.now()) / 86400000))
      : null;
    return (
      <article className={`${base} px-5 py-5`} onClick={() => onOpen?.(post)}>
        <div className="mb-4 flex items-start justify-between gap-2">
          <h3 className="font-display font-bold text-ivory text-[15px] leading-snug">
            {post.poll.question}
          </h3>
          <OverflowMenu
            isOwn={isOwn}
            onShare={() => onShare?.(post)}
            onEdit={() => onEdit?.(post)}
            onDelete={() => onDelete?.(post._id)}
          />
        </div>
        <div className="flex flex-col gap-2.5 mb-3">
          {post.poll.options.map((option, i) => {
            const optionVotes = Array.isArray(option.votes)
              ? option.votes.length
              : 0;
            const pct =
              totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0;
            return (
              <div key={i} className="flex items-center gap-3">
                <div className="relative flex-1 h-9 rounded-lg overflow-hidden bg-white/[0.04] border border-white/[0.07]">
                  <div
                    className={`absolute left-0 top-0 h-full ${POLL_COLORS[i % POLL_COLORS.length]} opacity-25 transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-display font-semibold text-ivory/80">
                    {option.text}
                  </span>
                </div>
                <span className="text-[13px] font-mono font-bold text-ivory/50 w-9 text-right shrink-0">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-[11px] font-mono text-ivory/25 uppercase tracking-wider">
          {totalVotes.toLocaleString()} votes
          {daysLeft !== null ? ` · ${daysLeft} days left` : ""}
        </p>
      </article>
    );
  }

  // ────────────────── SHOWCASE ─────────────────────────────────────────────
  if (post.type === "showcase") {
    return (
      <article className={`${base} px-5 py-5`} onClick={() => onOpen?.(post)}>
        <div className="flex items-center gap-2.5 mb-3">
          <AvatarCircle user={post.author} size={32} />
          <div className="flex-1 min-w-0">
            <span className="font-display font-bold text-ivory/85 text-[13px]">
              {post.author?.name}
            </span>
            <span className="text-[12px] font-mono text-ivory/30">
              {" · Showcase · "}
              {timeAgo(post.createdAt)}
            </span>
          </div>
          <OverflowMenu
            isOwn={isOwn}
            onShare={() => onShare?.(post)}
            onEdit={() => onEdit?.(post)}
            onDelete={() => onDelete?.(post._id)}
          />
        </div>
        {post.title && (
          <p className="text-[14px] text-ivory/75 leading-relaxed mb-3 font-sans">
            {post.title}
          </p>
        )}
        {post.screenshots?.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-3">
            {post.screenshots.slice(0, 3).map((src, i) => (
              <div
                key={i}
                className="aspect-[4/3] rounded-xl overflow-hidden bg-white/[0.04] border border-white/[0.08]"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={src}
                  alt={`Screenshot ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
        {post.linkPreview && (
          <a
            href={post.linkPreview.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.07] mb-3"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={13} className="text-ivory/25 shrink-0" />
            <div className="min-w-0">
              <p className="text-[13px] font-mono font-bold text-ivory/60 truncate">
                {post.linkPreview.title ?? post.linkPreview.url}
              </p>
              {post.linkPreview.description && (
                <p className="text-[11px] text-ivory/30 truncate mt-0.5">
                  {post.linkPreview.description}
                </p>
              )}
            </div>
          </a>
        )}
        <div onClick={(e) => e.stopPropagation()}>
          <SimpleReactions
            reactions={post.reactions}
            currentUserId={currentUserId}
            onReact={(emoji) => onReact?.(post._id, emoji)}
          />
        </div>
      </article>
    );
  }

  // ────────────────── ARTICLE / RESOURCE / default ─────────────────────────
  return (
    <article className={`${base} px-5 py-5`} onClick={() => onOpen?.(post)}>
      <div className="flex items-center gap-2.5 mb-3">
        <AvatarCircle user={post.author} size={32} />
        <div className="flex-1 min-w-0">
          <span className="font-display font-bold text-ivory/85 text-[13px]">
            {post.author?.name}
          </span>
          <span className="text-[12px] font-mono text-ivory/30">
            {" · "}
            {timeAgo(post.createdAt)}
          </span>
        </div>
        <OverflowMenu
          isOwn={isOwn}
          onShare={() => onShare?.(post)}
          onEdit={() => onEdit?.(post)}
          onDelete={() => onDelete?.(post._id)}
        />
      </div>
      {post.title && (
        <h3 className="font-display font-bold text-ivory text-[15px] leading-snug mb-2">
          {post.title}
        </h3>
      )}
      {post.content && (
        <MarkdownText className="text-[13px] text-ivory/55 leading-relaxed mb-3 font-sans [&_p]:my-0 [&_strong]:text-ivory/80 [&_em]:text-ivory/75">
          {post.content}
        </MarkdownText>
      )}
      {post.type === "resource" && post.linkPreview && (
        <a
          href={post.linkPreview.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.07] mb-3"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-display font-semibold text-ivory/70 truncate">
              {post.linkPreview.title}
            </p>
            <p className="text-[11px] text-ivory/35 mt-0.5 line-clamp-2">
              {post.linkPreview.description}
            </p>
            <p className="text-[10px] font-mono text-accent/50 mt-1 truncate">
              {post.linkPreview.url}
            </p>
          </div>
        </a>
      )}
      <div
        className="flex items-center gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <SimpleReactions
          reactions={reactions}
          currentUserId={currentUserId}
          onReact={(emoji) => onReact?.(post._id, emoji)}
        />
        <button
          onClick={() => onOpen?.(post)}
          className="ml-auto flex items-center gap-1 text-[12px] font-mono text-ivory/30 hover:text-ivory/50 transition-colors"
        >
          <MessageSquare size={12} /> {commentCount}
        </button>
        <button
          onClick={() => onShare?.(post)}
          className="flex items-center gap-1 text-[12px] font-mono text-ivory/30 hover:text-accent/60 transition-colors"
        >
          <Share2 size={12} />
        </button>
      </div>
    </article>
  );
}
