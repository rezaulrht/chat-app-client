"use client";

import { useState } from "react";
import {
  X,
  Plus,
  Minus,
  Code2,
  HelpCircle,
  Lightbulb,
  Zap,
  Link2,
  BarChart2,
  BookOpen,
  Tag,
  Paperclip,
  AlignLeft,
  Hash,
} from "lucide-react";

const POST_TYPES = [
  {
    value: "post",
    label: "Post",
    icon: BookOpen,
    desc: "Share thoughts or an update",
  },
  {
    value: "snippet",
    label: "Snippet",
    icon: Code2,
    desc: "Share reusable code with syntax highlight",
  },
  {
    value: "question",
    label: "Question",
    icon: HelpCircle,
    desc: "Ask the community for help",
  },
  {
    value: "til",
    label: "TIL",
    icon: Lightbulb,
    desc: "Today I Learned — a quick insight",
  },
  {
    value: "showcase",
    label: "Showcase",
    icon: Zap,
    desc: "Demo something you built",
  },
  {
    value: "poll",
    label: "Poll",
    icon: BarChart2,
    desc: "Get a quick vote from the community",
  },
  {
    value: "resource",
    label: "Resource",
    icon: Link2,
    desc: "Share a useful link",
  },
];

const LANG_OPTIONS = [
  "javascript",
  "typescript",
  "python",
  "rust",
  "go",
  "java",
  "css",
  "html",
  "bash",
  "sql",
  "json",
  "yaml",
  "markdown",
];

// ── Shared textarea ───────────────────────────────────────────────────────────
function MarkdownEditor({
  value,
  onChange,
  placeholder = "Write something… (markdown supported)",
  rows = 6,
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full bg-white/[0.04] ring-1 ring-white/[0.07] focus:ring-accent/30 rounded-xl px-4 py-3 text-[13px] text-ivory/80 placeholder:text-ivory/20 font-sans resize-y outline-none transition-all leading-relaxed"
    />
  );
}

// ── Code block editor (used for snippet type) ─────────────────────────────────
function CodeBlockEditor({ blocks, onChange }) {
  const addBlock = () =>
    onChange([
      ...blocks,
      { filename: "index.js", language: "javascript", code: "" },
    ]);
  const removeBlock = (i) => onChange(blocks.filter((_, idx) => idx !== i));
  const updateBlock = (i, key, val) => {
    const next = [...blocks];
    next[i] = { ...next[i], [key]: val };
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      {blocks.map((b, i) => (
        <div
          key={i}
          className="rounded-xl ring-1 ring-white/[0.07] bg-deep overflow-hidden"
        >
          {/* Block header */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.06] bg-white/[0.02]">
            <input
              value={b.filename}
              onChange={(e) => updateBlock(i, "filename", e.target.value)}
              className="flex-1 bg-transparent text-[12px] font-mono text-ivory/70 outline-none placeholder:text-ivory/20"
              placeholder="filename.js"
            />
            <select
              value={b.language}
              onChange={(e) => updateBlock(i, "language", e.target.value)}
              className="bg-white/[0.04] ring-1 ring-white/[0.07] text-ivory/50 text-[11px] font-mono rounded-lg px-2 py-1 outline-none"
            >
              {LANG_OPTIONS.map((l) => (
                <option key={l} value={l} className="bg-deep text-ivory">
                  {l}
                </option>
              ))}
            </select>
            {blocks.length > 1 && (
              <button
                type="button"
                onClick={() => removeBlock(i)}
                className="text-red-400/40 hover:text-red-400/80 transition-colors"
              >
                <Minus size={13} />
              </button>
            )}
          </div>

          {/* Code textarea */}
          <textarea
            value={b.code}
            onChange={(e) => updateBlock(i, "code", e.target.value)}
            placeholder="// paste your code here"
            rows={8}
            className="w-full bg-transparent font-mono text-[12px] text-ivory/70 px-4 py-3 resize-y outline-none placeholder:text-ivory/15 leading-5"
          />
        </div>
      ))}

      <button
        type="button"
        onClick={addBlock}
        className="flex items-center gap-1.5 text-[11px] font-mono text-accent/60 hover:text-accent transition-colors self-start"
      >
        <Plus size={12} /> Add file
      </button>
    </div>
  );
}

// ── Poll editor ───────────────────────────────────────────────────────────────
function PollEditor({ poll, onChange }) {
  const setQuestion = (q) => onChange({ ...poll, question: q });
  const setOptions = (opts) => onChange({ ...poll, options: opts });
  const setMulti = (v) => onChange({ ...poll, multiSelect: v });
  const setExpiry = (v) => onChange({ ...poll, expiresAt: v });

  const addOption = () =>
    setOptions([...(poll.options ?? []), { text: "", votes: [] }]);
  const removeOption = (i) =>
    setOptions(poll.options.filter((_, idx) => idx !== i));
  const updateOption = (i, val) => {
    const next = [...poll.options];
    next[i] = { ...next[i], text: val };
    setOptions(next);
  };

  return (
    <div className="flex flex-col gap-3">
      <input
        value={poll.question ?? ""}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Poll question…"
        className="w-full bg-white/[0.04] ring-1 ring-white/[0.07] focus:ring-accent/30 rounded-xl px-4 py-2.5 text-[13px] text-ivory/80 placeholder:text-ivory/20 font-sans outline-none transition-all"
      />
      <div className="flex flex-col gap-2">
        {(poll.options ?? []).map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="shrink-0 w-5 h-5 rounded-full ring-1 ring-white/[0.10] flex items-center justify-center text-[10px] text-ivory/25 font-mono">
              {i + 1}
            </span>
            <input
              value={opt.text}
              onChange={(e) => updateOption(i, e.target.value)}
              placeholder={`Option ${i + 1}`}
              className="flex-1 bg-white/[0.04] ring-1 ring-white/[0.07] focus:ring-accent/30 rounded-lg px-3 py-2 text-[13px] text-ivory/80 placeholder:text-ivory/20 outline-none transition-all"
            />
            {(poll.options ?? []).length > 2 && (
              <button
                type="button"
                onClick={() => removeOption(i)}
                className="text-red-400/40 hover:text-red-400/80 transition-colors shrink-0"
              >
                <Minus size={13} />
              </button>
            )}
          </div>
        ))}
        {(poll.options ?? []).length < 6 && (
          <button
            type="button"
            onClick={addOption}
            className="flex items-center gap-1.5 text-[11px] font-mono text-accent/60 hover:text-accent transition-colors self-start mt-1"
          >
            <Plus size={12} /> Add option
          </button>
        )}
      </div>

      <div className="flex items-center gap-4 pt-1">
        <label className="flex items-center gap-2 text-[12px] font-mono text-ivory/50 cursor-pointer">
          <input
            type="checkbox"
            checked={poll.multiSelect ?? false}
            onChange={(e) => setMulti(e.target.checked)}
            className="accent-accent rounded"
          />
          Multi-select
        </label>
        <label className="flex items-center gap-2 text-[12px] font-mono text-ivory/50">
          Expires
          <input
            type="datetime-local"
            value={poll.expiresAt ?? ""}
            onChange={(e) => setExpiry(e.target.value)}
            className="bg-white/[0.04] ring-1 ring-white/[0.07] rounded-lg px-2 py-1 text-[11px] text-ivory/60 outline-none"
          />
        </label>
      </div>
    </div>
  );
}

// ── Tag input ─────────────────────────────────────────────────────────────────
function TagInput({ tags, onChange }) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const tag = input.trim().toLowerCase().replace(/\s+/g, "-");
    if (!tag || tags.includes(tag) || tags.length >= 5) return;
    onChange([...tags, tag]);
    setInput("");
  };

  const removeTag = (t) => onChange(tags.filter((x) => x !== t));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 flex-wrap">
        {tags.map((t) => (
          <span
            key={t}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/12 ring-1 ring-accent/25 text-accent text-[11px] font-mono font-semibold"
          >
            <span className="opacity-60">#</span>
            {t}
            <button
              type="button"
              onClick={() => removeTag(t)}
              className="text-accent/50 hover:text-accent ml-0.5"
            >
              ×
            </button>
          </span>
        ))}
        {tags.length < 5 && (
          <div className="flex items-center gap-1 bg-white/[0.04] ring-1 ring-white/[0.07] rounded-lg pl-2 pr-1 py-0.5">
            <Hash size={11} className="text-ivory/25" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="add tag"
              className="bg-transparent text-[12px] font-mono text-ivory/70 placeholder:text-ivory/20 outline-none w-20"
            />
            <button
              type="button"
              onClick={addTag}
              className="text-accent/40 hover:text-accent transition-colors p-0.5"
            >
              <Plus size={11} />
            </button>
          </div>
        )}
      </div>
      <p className="text-[10px] font-mono text-ivory/20">
        {tags.length}/5 tags · press Enter or comma to add
      </p>
    </div>
  );
}

// ── Main PostComposer modal ───────────────────────────────────────────────────
export default function PostComposer({ open, onClose, onSubmit }) {
  const [type, setType] = useState("post");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [codeBlocks, setCodeBlocks] = useState([
    { filename: "index.js", language: "javascript", code: "" },
  ]);
  const [poll, setPoll] = useState({
    question: "",
    options: [
      { text: "", votes: [] },
      { text: "", votes: [] },
    ],
    multiSelect: false,
    expiresAt: "",
  });
  const [resourceUrl, setResourceUrl] = useState("");
  const [tags, setTags] = useState([]);

  if (!open) return null;

  const needsTitle = ["question", "showcase", "resource"].includes(type);
  const showContent = ["post", "question", "til", "showcase"].includes(type);
  const showSnippet = type === "snippet";
  const showPoll = type === "poll";
  const showResource = type === "resource";

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: call onSubmit with assembled payload
    const payload = {
      type,
      title: needsTitle ? title : undefined,
      content: showContent ? content : undefined,
      codeBlocks: showSnippet ? codeBlocks : undefined,
      poll: showPoll ? poll : undefined,
      linkPreview: showResource ? { url: resourceUrl } : undefined,
      tags,
    };
    onSubmit?.(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col glass-card rounded-3xl overflow-hidden shadow-2xl">
        {/* ── Modal header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] shrink-0">
          <h2 className="font-display font-bold text-ivory text-base">
            Create Post
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-ivory/30 hover:text-ivory hover:bg-white/[0.08] transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Post type selector ── */}
        <div className="px-6 pt-4 pb-0 shrink-0">
          <div className="grid grid-cols-7 gap-1">
            {POST_TYPES.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setType(value)}
                title={label}
                className={`flex flex-col items-center gap-1 px-1 py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all duration-150 ${
                  type === value
                    ? "bg-accent/15 ring-1 ring-accent/30 text-accent"
                    : "text-ivory/30 hover:text-ivory/60 hover:bg-white/[0.05]"
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
          <p className="mt-2 mb-3 text-[11px] font-mono text-ivory/25">
            {POST_TYPES.find((t) => t.value === type)?.desc}
          </p>
        </div>

        {/* ── Scrollable form body ── */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 pb-6 flex flex-col gap-4 scrollbar-hide"
        >
          {/* Title */}
          {needsTitle && (
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder={
                type === "question"
                  ? "What's your question?"
                  : type === "showcase"
                    ? "Project name / title"
                    : "Resource title"
              }
              className="w-full bg-white/[0.04] ring-1 ring-white/[0.07] focus:ring-accent/30 rounded-xl px-4 py-2.5 text-[14px] font-display font-semibold text-ivory placeholder:text-ivory/20 outline-none transition-all"
            />
          )}

          {/* Markdown editor */}
          {showContent && (
            <MarkdownEditor
              value={content}
              onChange={setContent}
              placeholder={
                type === "til"
                  ? "What did you learn today?"
                  : type === "question"
                    ? "Describe your problem…"
                    : type === "showcase"
                      ? "Tell us about what you built…"
                      : "What's on your mind?"
              }
            />
          )}

          {/* Snippet code blocks */}
          {showSnippet && (
            <CodeBlockEditor blocks={codeBlocks} onChange={setCodeBlocks} />
          )}

          {/* Poll builder */}
          {showPoll && <PollEditor poll={poll} onChange={setPoll} />}

          {/* Resource URL */}
          {showResource && (
            <div className="flex flex-col gap-2">
              <input
                type="url"
                value={resourceUrl}
                onChange={(e) => setResourceUrl(e.target.value)}
                required
                placeholder="https://..."
                className="w-full bg-white/[0.04] ring-1 ring-white/[0.07] focus:ring-accent/30 rounded-xl px-4 py-2.5 text-[13px] font-mono text-ivory/80 placeholder:text-ivory/20 outline-none transition-all"
              />
              {/* TODO: fetch link preview on blur */}
              <p className="text-[10px] font-mono text-ivory/20">
                Paste a URL — preview will be fetched automatically
              </p>
            </div>
          )}

          {/* Tags */}
          <div>
            <p className="text-[10px] font-mono font-bold text-ivory/30 uppercase tracking-[0.12em] mb-1.5 flex items-center gap-1.5">
              <Tag size={10} /> Tags
            </p>
            <TagInput tags={tags} onChange={setTags} />
          </div>

          {/* Attachment hint */}
          <button
            type="button"
            className="flex items-center gap-1.5 text-[11px] font-mono text-ivory/25 hover:text-ivory/50 transition-colors self-start"
          >
            <Paperclip size={12} /> Attach files (TODO)
          </button>
        </form>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.06] shrink-0">
          <p className="text-[10px] font-mono text-ivory/20">
            Markdown supported · max 10,000 chars
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-[12px] font-mono font-bold text-ivory/40 hover:text-ivory hover:bg-white/[0.06] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="post-composer-form"
              onClick={handleSubmit}
              className="px-5 py-2 rounded-xl text-[12px] font-mono font-bold bg-accent/15 ring-1 ring-accent/30 text-accent hover:bg-accent/25 transition-all duration-150"
            >
              Publish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
