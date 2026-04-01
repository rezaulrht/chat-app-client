"use client";

import { useState, useEffect, useContext } from "react";
import { SocketContext } from "@/context/SocketContext";
import {
  ArrowLeft,
  Share2,
  MoreHorizontal,
  Eye,
  MessageSquare,
  Pin,
  Pencil,
  Trash2,
  BookOpen,
  Code2,
  HelpCircle,
  Lightbulb,
  Zap,
  Link2,
  BarChart2,
} from "lucide-react";
import UserCard from "./UserCard";
import QABadge from "./QABadge";
import ReactionBar from "./ReactionBar";
import TagChip from "./TagChip";
import SnippetBlock from "./SnippetBlock";
import MarkdownText from "./MarkdownText";
import PollCard from "./PollCard";
import CommentSection from "./CommentSection";
import { formatDistanceToNow } from "date-fns";

const TYPE_META = {
  post: { icon: BookOpen, label: "Post", color: "text-ivory/40" },
  snippet: { icon: Code2, label: "Snippet", color: "text-amber-400/70" },
  question: { icon: HelpCircle, label: "Question", color: "text-blue-400/70" },
  til: { icon: Lightbulb, label: "TIL", color: "text-emerald-400/70" },
  showcase: { icon: Zap, label: "Showcase", color: "text-accent/80" },
  poll: { icon: BarChart2, label: "Poll", color: "text-purple-400/70" },
  resource: { icon: Link2, label: "Resource", color: "text-cyan/80" },
};

function timeAgo(date) {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return "";
  }
}

function questionStatus(post) {
  if (post.acceptedAnswer || post.acceptedComment) return "resolved";
  if ((post.commentCount ?? post.commentsCount ?? 0) > 0) return "answered";
  return "open";
}

/**
 * PostDetail — full post view with comments below.
 *
 * @param {object}   post
 * @param {object[]} comments       - flat comment list
 * @param {string}   currentUserId
 * @param {Function} onBack         - navigate back to feed list
 * @param {string}   backLabel
 * @param {Function} onReact
 * @param {Function} onShare
 * @param {Function} onTagClick
 * @param {Function} onEdit
 * @param {Function} onDelete
 * @param {Function} onAddComment
 * @param {Function} onReactComment
 * @param {Function} onAcceptAnswer
 * @param {Function} onVotePoll
 * @param {Function} onEditComment
 * @param {Function} onDeleteComment
 */
export default function PostDetail({
  post = {},
  comments = [],
  currentUserId = "",
  onBack,
  backLabel = "Back to feed",
  onReact,
  onShare,
  onTagClick,
  onEdit,
  onDelete,
  onAddComment,
  onReactComment,
  onAcceptAnswer,
  onVotePoll,
  onEditComment,
  onDeleteComment,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const socketCtx = useContext(SocketContext);
  const socket = socketCtx?.socket ?? null;

  useEffect(() => {
    if (!socket || !post._id) return;
    socket.emit("feed:post:join", post._id);
    return () => socket.emit("feed:post:leave", post._id);
  }, [socket, post._id]);

  const typeMeta = TYPE_META[post.type] ?? TYPE_META.post;
  const TypeIcon = typeMeta.icon;
  const isOwn = post.author?._id === currentUserId;
  const effectiveCommentCount = post.commentCount ?? post.commentsCount ?? 0;
  const acceptedAnswerId = post.acceptedAnswer ?? post.acceptedComment ?? null;

  return (
    <div className="flex flex-col gap-0 h-full overflow-y-auto scrollbar-hide">
      {/* ── Sticky header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-5 py-3 border-b border-white/[0.06] glass-panel shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-[12px] font-mono text-ivory/40 hover:text-ivory transition-colors"
        >
          <ArrowLeft size={13} /> {backLabel}
        </button>

        <div className="flex items-center gap-3">
          {/* Views */}
          <span className="flex items-center gap-1 text-[11px] font-mono text-ivory/20">
            <Eye size={11} /> {post.views ?? 0}
          </span>

          {/* Share */}
          <button
            type="button"
            onClick={() => onShare?.(post)}
            className="flex items-center gap-1 text-[11px] font-mono text-ivory/30 hover:text-accent/70 transition-colors"
          >
            <Share2 size={13} />
          </button>

          {/* Overflow menu */}
          {isOwn && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-ivory/20 hover:text-ivory/60 hover:bg-white/[0.06] transition-all"
              >
                <MoreHorizontal size={14} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-8 z-20 w-36 rounded-xl glass-card ring-1 ring-white/[0.08] py-1 shadow-xl">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit?.(post);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-ivory/60 hover:text-ivory hover:bg-white/[0.05]"
                  >
                    <Pencil size={12} /> Edit
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete?.(post._id);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-red-400/70 hover:text-red-400 hover:bg-red-400/5"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* ── Post body ─────────────────────────────────────────────────── */}
      <article className="px-5 py-6 flex flex-col gap-5 max-w-3xl mx-auto w-full">
        {/* Type badge */}
        <span
          className={`flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider self-start ${typeMeta.color}`}
        >
          <TypeIcon size={13} /> {typeMeta.label}
        </span>

        {/* Q&A status */}
        {post.type === "question" && <QABadge status={questionStatus(post)} />}

        {/* Title */}
        {post.title && (
          <h1 className="font-display font-bold text-ivory text-2xl leading-tight">
            {post.title}
          </h1>
        )}

        {/* Author + metadata row */}
        <div className="flex items-center gap-3 flex-wrap">
          <UserCard user={post.author} variant="inline" />
          <span className="text-ivory/15 text-xs">·</span>
          <span className="text-[11px] font-mono text-ivory/25">
            {timeAgo(post.createdAt)}
          </span>
          {post.isPinned && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-amber-400/60 uppercase tracking-wider">
              <Pin size={9} /> Pinned
            </span>
          )}
        </div>

        {/* Full content (markdown) */}
        {post.content && post.type !== "poll" && (
          <MarkdownText className="text-ivory/75 leading-relaxed">
            {post.content}
          </MarkdownText>
        )}

        {/* Code snippet — all files */}
        {post.type === "snippet" && (post.codeBlocks?.length ?? 0) > 0 && (
          <SnippetBlock files={post.codeBlocks} />
        )}

        {/* Poll */}
        {post.type === "poll" && post.poll && (
          <PollCard
            poll={post.poll}
            currentUserId={currentUserId}
            onVote={(i) => onVotePoll?.(post._id, i)}
          />
        )}

        {/* Resource link preview */}
        {post.type === "resource" && post.linkPreview && (
          <a
            href={post.linkPreview.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex gap-3 p-4 rounded-xl ring-1 ring-white/[0.07] bg-white/[0.03] hover:bg-white/[0.05] transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {post.linkPreview.image && (
              <img
                src={post.linkPreview.image}
                alt={post.linkPreview.title}
                className="w-20 h-20 rounded-lg object-cover shrink-0 bg-white/[0.04]"
              />
            )}
            <div className="min-w-0">
              <p className="font-display font-semibold text-ivory/80 text-sm">
                {post.linkPreview.title}
              </p>
              <p className="text-[12px] text-ivory/40 mt-1 line-clamp-2">
                {post.linkPreview.description}
              </p>
              <p className="text-[11px] font-mono text-accent/60 mt-1.5 truncate">
                {post.linkPreview.url}
              </p>
            </div>
          </a>
        )}

        {/* Tags */}
        {(post.tags?.length ?? 0) > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {post.tags.map((tag) => (
              <TagChip key={tag} tag={tag} onClick={() => onTagClick?.(tag)} />
            ))}
          </div>
        )}

        {/* Reactions */}
        <div className="flex items-center gap-4 py-3 border-y border-white/[0.05]">
          <ReactionBar
            reactions={post.reactions ?? {}}
            currentUserId={currentUserId}
            onReact={(emoji) => onReact?.(post._id, emoji)}
          />
          <span className="flex items-center gap-1.5 text-[12px] font-mono text-ivory/25 ml-auto">
            <MessageSquare size={12} /> {effectiveCommentCount} comment
            {effectiveCommentCount !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Comments */}
        <CommentSection
          comments={comments}
          currentUserId={currentUserId}
          isQuestionPost={post.type === "question" && isOwn}
          acceptedAnswerId={acceptedAnswerId}
          onAddComment={(payload) => onAddComment?.(post._id, payload)}
          onReact={(commentId, emoji) =>
            onReactComment?.(post._id, commentId, emoji)
          }
          onAccept={(commentId) => onAcceptAnswer?.(post._id, commentId)}
          onEdit={(commentId, content) =>
            onEditComment?.(post._id, commentId, content)
          }
          onDelete={(commentId) => onDeleteComment?.(post._id, commentId)}
        />
      </article>
    </div>
  );
}
