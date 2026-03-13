"use client";

import { useState } from "react";
import {
  Send,
  CornerDownRight,
  CheckCircle2,
  MoreHorizontal,
  Trash2,
  Pencil,
} from "lucide-react";
import ReactionBar from "./ReactionBar";
import UserCard from "./UserCard";
import { formatDistanceToNow } from "date-fns";

function timeAgo(date) {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return "";
  }
}

// ── Single comment ────────────────────────────────────────────────────────────
function CommentItem({
  comment,
  currentUserId,
  isQuestionAuthor,
  isAccepted,
  replies = [],
  onReply,
  onReact,
  onAccept,
  onDelete,
  onEdit,
  depth = 0,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isOwn = comment.author?._id === currentUserId;

  return (
    <div
      className={`flex gap-3 ${depth > 0 ? "ml-8 border-l border-white/[0.05] pl-4" : ""}`}
    >
      {/* Avatar stub */}
      <div className="shrink-0 mt-1 w-7 h-7 rounded-lg overflow-hidden bg-white/[0.06] ring-1 ring-white/[0.08] flex items-center justify-center text-ivory/40 font-display font-bold text-[11px]">
        {comment.author?.avatar ? (
          <img
            src={comment.author.avatar}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          (comment.author?.name?.[0] ?? "?")
        )}
      </div>

      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <UserCard user={comment.author} variant="inline" />
            <span className="text-[10px] font-mono text-ivory/20">
              {timeAgo(comment.createdAt)}
            </span>
            {isAccepted && (
              <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400/70 uppercase tracking-wider">
                <CheckCircle2 size={10} /> Accepted answer
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Accept button (visible to question author, not if already resolved) */}
            {isQuestionAuthor && !isAccepted && depth === 0 && (
              <button
                type="button"
                onClick={() => onAccept?.(comment._id)}
                className="text-[10px] font-mono text-ivory/25 hover:text-emerald-400 transition-colors px-1.5 py-0.5 rounded-md hover:bg-emerald-400/8"
                title="Mark as accepted answer"
              >
                ✓ Accept
              </button>
            )}

            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="w-6 h-6 flex items-center justify-center rounded-md text-ivory/20 hover:text-ivory/50 hover:bg-white/[0.06] transition-all"
              >
                <MoreHorizontal size={12} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-7 z-20 w-32 rounded-xl glass-card ring-1 ring-white/[0.08] py-1 shadow-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onReply?.(comment);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-ivory/60 hover:text-ivory hover:bg-white/[0.05]"
                  >
                    <CornerDownRight size={11} /> Reply
                  </button>
                  {isOwn && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          onEdit?.(comment);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-ivory/60 hover:text-ivory hover:bg-white/[0.05]"
                      >
                        <Pencil size={11} /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          onDelete?.(comment._id);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-red-400/70 hover:text-red-400 hover:bg-red-400/5"
                      >
                        <Trash2 size={11} /> Delete
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="mt-1.5 text-[13px] text-ivory/70 leading-relaxed font-sans">
          {
            comment.isDeleted ? (
              <span className="italic text-ivory/25">[deleted]</span>
            ) : (
              comment.content
            ) /* TODO: render as markdown */
          }
        </div>

        {/* Reactions */}
        {!comment.isDeleted && (
          <div className="mt-2">
            <ReactionBar
              reactions={comment.reactions ?? {}}
              currentUserId={currentUserId}
              onReact={(emoji) => onReact?.(comment._id, emoji)}
              variant="comment"
            />
          </div>
        )}

        {/* Nested replies */}
        {replies.length > 0 && (
          <div className="mt-3 flex flex-col gap-3">
            {replies.map((r) => (
              <CommentItem
                key={r._id}
                comment={r}
                currentUserId={currentUserId}
                isQuestionAuthor={false}
                isAccepted={false}
                onReply={onReply}
                onReact={onReact}
                onDelete={onDelete}
                onEdit={onEdit}
                depth={1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * CommentSection — threaded comment list + composer.
 *
 * @param {object[]} comments        - flat list (replyTo populated)
 * @param {string}   currentUserId
 * @param {boolean}  isQuestionPost
 * @param {string}   acceptedAnswerId
 * @param {Function} onAddComment
 * @param {Function} onReact
 * @param {Function} onAccept
 * @param {Function} onDelete
 * @param {Function} onEdit
 */
export default function CommentSection({
  comments = [],
  currentUserId = "",
  isQuestionPost = false,
  acceptedAnswerId = null,
  onAddComment,
  onReact,
  onAccept,
  onDelete,
  onEdit,
}) {
  const [replyTarget, setReplyTarget] = useState(null);
  const [text, setText] = useState("");

  // Separate top-level vs replies
  const tops = comments.filter((c) => !c.replyTo && !c.isDeleted);
  const getReplies = (parentId) =>
    comments.filter((c) => c.replyTo === parentId);

  // Sort: accepted answer first, then by time
  const sorted = [...tops].sort((a, b) => {
    if (a._id === acceptedAnswerId) return -1;
    if (b._id === acceptedAnswerId) return 1;
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAddComment?.({ content: text, replyTo: replyTarget?._id ?? null });
    setText("");
    setReplyTarget(null);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Count */}
      <h4 className="text-[12px] font-mono font-bold text-ivory/30 uppercase tracking-[0.12em]">
        {comments.filter((c) => !c.isDeleted).length} Comment
        {comments.length !== 1 ? "s" : ""}
      </h4>

      {/* Comment composer */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        {replyTarget && (
          <div className="flex items-center gap-2 text-[11px] font-mono text-ivory/30">
            <CornerDownRight size={11} />
            Replying to{" "}
            <span className="text-accent/70">{replyTarget.author?.name}</span>
            <button
              type="button"
              onClick={() => setReplyTarget(null)}
              className="text-ivory/20 hover:text-ivory/50 ml-1"
            >
              ×
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              replyTarget
                ? "Write a reply…"
                : "Add a comment… (markdown supported)"
            }
            rows={2}
            className="flex-1 bg-white/[0.04] ring-1 ring-white/[0.07] focus:ring-accent/30 rounded-xl px-3 py-2 text-[13px] text-ivory/80 placeholder:text-ivory/20 font-sans resize-none outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="h-fit mt-auto flex items-center justify-center w-9 h-9 rounded-xl bg-accent/15 ring-1 ring-accent/30 text-accent hover:bg-accent/25 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
          >
            <Send size={14} />
          </button>
        </div>
      </form>

      {/* Comment list */}
      {sorted.length === 0 ? (
        <p className="text-center text-[12px] font-mono text-ivory/20 py-6">
          No comments yet. Be the first!
        </p>
      ) : (
        <div className="flex flex-col gap-5">
          {sorted.map((c) => (
            <CommentItem
              key={c._id}
              comment={c}
              currentUserId={currentUserId}
              isQuestionAuthor={isQuestionPost}
              isAccepted={c._id === acceptedAnswerId}
              replies={getReplies(c._id)}
              onReply={setReplyTarget}
              onReact={onReact}
              onAccept={onAccept}
              onDelete={onDelete}
              onEdit={onEdit}
              depth={0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
