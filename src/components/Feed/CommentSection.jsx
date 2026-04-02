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
import { formatDistanceToNow } from "date-fns";

function timeAgo(date) {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return "";
  }
}

function CommentAvatar({ author }) {
  return (
    <div className="mt-0.5 h-8 w-8 shrink-0 overflow-hidden rounded-full bg-white/6 ring-1 ring-white/8">
      {author?.avatar ? (
        <img
          referrerPolicy="no-referrer"
          src={author.avatar}
          alt={author?.name || "Comment author"}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-display text-xs font-bold text-ivory/45">
          {author?.name?.[0] ?? "?"}
        </div>
      )}
    </div>
  );
}

function MinimalDeleteModal({ open, onCancel, onConfirm }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4">
      <div className="w-full max-w-xs rounded-2xl bg-deep/95 p-4 ring-1 ring-white/12 shadow-2xl">
        <p className="text-[13px] font-display font-semibold text-ivory/90">
          Delete this comment?
        </p>
        <p className="mt-1 text-[11px] font-mono text-ivory/40">
          This action cannot be undone.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-3 py-1.5 text-[11px] font-semibold text-ivory/45 transition-colors hover:bg-white/6 hover:text-ivory/70"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-red-400/12 px-3 py-1.5 text-[11px] font-semibold text-red-400 ring-1 ring-red-400/25 transition-colors hover:bg-red-400/18"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
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
  const [isEditing, setIsEditing] = useState(false);
  const [draftText, setDraftText] = useState(comment.content || "");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const authorId =
    comment.author?._id?.toString?.() || String(comment.author?._id || "");
  const isOwn = authorId && String(currentUserId || "") === authorId;
  const commentTime = timeAgo(comment.createdAt);

  const handleSaveEdit = async () => {
    const next = draftText.trim();
    if (!next || next === String(comment.content || "").trim()) {
      setIsEditing(false);
      return;
    }

    try {
      await onEdit?.(comment._id, next);
      setIsEditing(false);
    } catch {
      // Parent handler already surfaces toast errors.
    }
  };

  return (
    <>
      <div className={`flex gap-2.5 ${depth > 0 ? "ml-10" : ""}`}>
        <CommentAvatar author={comment.author} />

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1 rounded-[18px] bg-white/6 px-3 py-2.5 ring-1 ring-white/8">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="truncate font-display text-[13px] font-semibold text-ivory/88">
                  {comment.author?.name ?? "Unknown"}
                </span>
                {isAccepted && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wide text-emerald-300/80">
                    <CheckCircle2 size={10} /> Accepted
                  </span>
                )}
              </div>

              <div className="mt-1.5 text-[13px] leading-relaxed text-ivory/72">
                {comment.isDeleted ? (
                  <span className="italic text-ivory/25">[deleted]</span>
                ) : isEditing ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                      value={draftText}
                      onChange={(e) => setDraftText(e.target.value)}
                      rows={3}
                      className="w-full rounded-2xl bg-white/4 px-3 py-2 text-[13px] text-ivory/80 placeholder:text-ivory/20 outline-none ring-1 ring-white/7 transition-all focus:ring-accent/30 resize-none font-sans"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSaveEdit}
                        className="rounded-lg bg-accent/15 px-2.5 py-1 text-[11px] font-semibold text-accent ring-1 ring-accent/30 transition-all hover:bg-accent/25"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDraftText(comment.content || "");
                          setIsEditing(false);
                        }}
                        className="rounded-lg px-2.5 py-1 text-[11px] font-semibold text-ivory/40 transition-all hover:bg-white/6 hover:text-ivory/70"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  comment.content
                )}
              </div>
            </div>

            <div className="relative shrink-0 pt-1">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-ivory/22 transition-all hover:bg-white/6 hover:text-ivory/55"
              >
                <MoreHorizontal size={14} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-8 z-20 w-32 rounded-xl glass-card py-1 shadow-xl ring-1 ring-white/8">
                  {!comment.replyTo && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onReply?.(comment);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-[11px] text-ivory/60 hover:bg-white/5 hover:text-ivory"
                    >
                      <CornerDownRight size={11} /> Reply
                    </button>
                  )}
                  {isOwn && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          setDraftText(comment.content || "");
                          setIsEditing(true);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-[11px] text-ivory/60 hover:bg-white/5 hover:text-ivory"
                      >
                        <Pencil size={11} /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          setConfirmDeleteOpen(true);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-[11px] text-red-400/70 hover:bg-red-400/5 hover:text-red-400"
                      >
                        <Trash2 size={11} /> Delete
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 pl-2 text-[11px] font-semibold text-ivory/34">
            {!comment.replyTo && (
              <button
                type="button"
                onClick={() => onReply?.(comment)}
                className="transition-colors hover:text-ivory/62"
                disabled={isEditing}
              >
                Reply
              </button>
            )}
            {isQuestionAuthor && !isAccepted && depth === 0 && (
              <button
                type="button"
                onClick={() => onAccept?.(comment._id)}
                className="transition-colors hover:text-emerald-300/80"
                title="Mark as accepted answer"
              >
                Accept answer
              </button>
            )}
            <span className="font-mono text-ivory/24">{commentTime}</span>
          </div>

          {!comment.isDeleted && (
            <div className="mt-2 pl-2">
              <ReactionBar
                reactions={comment.reactions ?? {}}
                currentUserId={currentUserId}
                onReact={(emoji) => onReact?.(comment._id, emoji)}
                variant="comment"
              />
            </div>
          )}

          {replies.length > 0 && (
            <div className="mt-3 flex flex-col gap-3 pl-2">
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

      <MinimalDeleteModal
        open={confirmDeleteOpen}
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={() => {
          setConfirmDeleteOpen(false);
          onDelete?.(comment._id?.toString?.() || String(comment._id));
        }}
      />
    </>
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
  const tops = comments.filter((c) => !c.replyTo);
  const getReplies = (parentId) =>
    comments.filter((c) => c.replyTo === parentId);

  // Sort: accepted answer first, then by time
  const sorted = [...tops].sort((a, b) => {
    if (a._id === acceptedAnswerId) return -1;
    if (b._id === acceptedAnswerId) return 1;
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await onAddComment?.({
        content: text,
        replyTo: replyTarget?._id ?? null,
      });
      setText("");
      setReplyTarget(null);
    } catch (error) {
      // Error is handled by parent; draft remains for retry
      throw error;
    }
  };

  const visibleCommentCount = comments.filter((c) => !c.isDeleted).length;

  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-[12px] font-mono font-bold uppercase tracking-[0.12em] text-ivory/30">
        {visibleCommentCount} Comment
        {visibleCommentCount !== 1 ? "s" : ""}
      </h4>

      <form
        onSubmit={handleSubmit}
        className="flex gap-3 rounded-2xl bg-white/4 px-3 py-3 ring-1 ring-white/7"
      >
        <CommentAvatar
          author={{
            name: currentUserId ? "You" : "?",
          }}
        />
        <div className="flex-1">
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
          <div className="mt-2 flex gap-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={replyTarget ? "Write a reply…" : "Add a comment…"}
              rows={2}
              className="flex-1 rounded-2xl bg-white/4 px-3 py-2 text-[13px] text-ivory/80 placeholder:text-ivory/20 outline-none ring-1 ring-white/7 transition-all focus:ring-accent/30 resize-none font-sans"
            />
            <button
              type="submit"
              disabled={!text.trim()}
              className="mt-auto flex h-9 w-9 items-center justify-center rounded-full bg-accent/15 text-accent ring-1 ring-accent/30 transition-all duration-150 hover:bg-accent/25 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </form>

      {sorted.length === 0 ? (
        <p className="text-center text-[12px] font-mono text-ivory/20 py-6">
          No comments yet. Be the first!
        </p>
      ) : (
        <div className="flex flex-col gap-4">
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
