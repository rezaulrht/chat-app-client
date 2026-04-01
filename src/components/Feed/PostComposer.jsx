"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import useAuth from "@/hooks/useAuth";
import MarkdownText from "./MarkdownText";
import {
  X,
  Plus,
  Minus,
  FileText,
  Code2,
  HelpCircle,
  Lightbulb,
  Sparkles,
  BarChart3,
  Link2,
  Tag,
  Lock,
  Globe,
  ImagePlus,
  Upload,
  Loader2,
  Wand2,
  Undo2,
} from "lucide-react";

const POST_TYPES = [
  {
    value: "post",
    label: "Post",
    icon: FileText,
    heading: "Create New Post",
    sub: "Share your ideas with the community.",
    publishCta: "Publish Post",
  },
  {
    value: "snippet",
    label: "Snippet",
    icon: Code2,
    heading: "Create Code Snippet",
    sub: "Share optimized logic with syntax-highlighted code.",
    publishCta: "Publish Snippet",
  },
  {
    value: "question",
    label: "Question",
    icon: HelpCircle,
    heading: "Ask a Question",
    sub: "Get help from the community.",
    publishCta: "Publish Question",
  },
  {
    value: "til",
    label: "TIL",
    icon: Lightbulb,
    heading: "Create TIL",
    sub: "Share something you learned today.",
    publishCta: "Publish TIL",
  },
  {
    value: "showcase",
    label: "Showcase",
    icon: Sparkles,
    heading: "Create Showcase",
    sub: "Highlight your project and stack.",
    publishCta: "Publish Showcase",
  },
  {
    value: "poll",
    label: "Poll",
    icon: BarChart3,
    heading: "Create Poll",
    sub: "Collect quick opinions from the community.",
    publishCta: "Publish Poll",
  },
  {
    value: "resource",
    label: "Resource",
    icon: Link2,
    heading: "Create Resource",
    sub: "Share useful links and references.",
    publishCta: "Publish Resource",
  },
];

const CODE_LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "go",
  "rust",
  "java",
  "csharp",
  "php",
  "bash",
  "sql",
  "json",
  "yaml",
];

const POLL_DURATIONS = ["1 Day", "3 Days", "7 Days", "14 Days"];
const RESOURCE_CATEGORIES = [
  "Documentation",
  "Article",
  "Video",
  "Tool",
  "Repository",
  "Design",
];
const DEFAULT_TAGS = ["learning", "productivity"];

function FieldLabel({ children }) {
  return (
    <p className="text-[11px] font-mono font-bold uppercase tracking-[0.12em] text-ivory/28 mb-2">
      {children}
    </p>
  );
}

function TagInput({ tags, onChange }) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const next = input.trim().toLowerCase().replace(/\s+/g, "-");
    if (!next || tags.includes(next) || tags.length >= 5) return;
    onChange([...tags, next]);
    setInput("");
  };

  const removeTag = (tag) => onChange(tags.filter((t) => t !== tag));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-accent/12 border border-accent/20 px-2 py-0.5 text-[11px] font-mono font-semibold text-accent"
          >
            #{tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-accent/60 hover:text-accent"
            >
              ×
            </button>
          </span>
        ))}

        {tags.length < 5 && (
          <div className="inline-flex items-center gap-1 rounded-lg bg-white/[0.04] border border-white/[0.08] px-2 py-1">
            <Tag size={11} className="text-ivory/30" />
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
              className="w-24 bg-transparent text-[12px] font-mono text-ivory/70 placeholder:text-ivory/20 outline-none"
            />
            <button
              type="button"
              onClick={addTag}
              className="text-accent/60 hover:text-accent"
            >
              <Plus size={12} />
            </button>
          </div>
        )}
      </div>
      <p className="text-[10px] font-mono text-ivory/22">
        {tags.length}/5 tags
      </p>
    </div>
  );
}

function MarkdownPanel({ value, onChange, placeholder }) {
  const [tab, setTab] = useState("write");

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
      <div className="flex items-center gap-4 px-4 pt-3 border-b border-white/[0.06]">
        {[
          { id: "write", label: "Write" },
          { id: "preview", label: "Preview" },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`pb-2 text-[12px] font-mono font-bold uppercase tracking-[0.12em] border-b-2 transition-colors ${
              tab === item.id
                ? "border-accent text-accent"
                : "border-transparent text-ivory/30 hover:text-ivory/55"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "write" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={10}
          placeholder={placeholder}
          className="w-full bg-transparent px-4 py-3 text-[14px] text-ivory/80 placeholder:text-ivory/22 outline-none resize-y"
        />
      ) : (
        <div className="min-h-[220px] px-4 py-3">
          {value?.trim() ? (
            <MarkdownText className="text-[14px] text-ivory/75 [&_p]:leading-relaxed">
              {value}
            </MarkdownText>
          ) : (
            <span className="text-[13px] font-mono text-ivory/22">
              Nothing to preview yet...
            </span>
          )}
        </div>
      )}

      <div className="px-4 py-2 border-t border-white/[0.06] text-right text-[10px] font-mono text-ivory/22">
        Markdown supported
      </div>
    </div>
  );
}

export default function PostComposer({
  open,
  onClose,
  onSubmit,
  onEdit,
  editPost,
}) {
  const { user } = useAuth();
  const [type, setType] = useState("post");
  const [tags, setTags] = useState(DEFAULT_TAGS);
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [isSuggestingTags, setIsSuggestingTags] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [prePolishSnapshot, setPrePolishSnapshot] = useState(null);
  const [isPrivate, setIsPrivate] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [snippetTitle, setSnippetTitle] = useState("");
  const [snippetLanguage, setSnippetLanguage] = useState("typescript");
  const [snippetFilename, setSnippetFilename] = useState("snippet.ts");
  const [snippetCode, setSnippetCode] = useState("");

  const [showcaseTitle, setShowcaseTitle] = useState("");
  const [showcaseUrl, setShowcaseUrl] = useState("");
  const [showcaseDescription, setShowcaseDescription] = useState("");
  const [showcaseThumbnail, setShowcaseThumbnail] = useState("");

  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", "", ""]);
  const [pollDuration, setPollDuration] = useState("7 Days");
  const [pollVisibility, setPollVisibility] = useState("Public");

  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");
  const [resourceCategory, setResourceCategory] = useState("Documentation");
  const [resourceDescription, setResourceDescription] = useState("");

  const activeType = useMemo(
    () => POST_TYPES.find((item) => item.value === type) ?? POST_TYPES[0],
    [type],
  );

  const isEditing = Boolean(editPost?._id);

  const resetForm = () => {
    setType("post");
    setTags(DEFAULT_TAGS);
    setSuggestedTags([]);
    setIsSuggestingTags(false);
    setIsPolishing(false);
    setPrePolishSnapshot(null);
    setIsPrivate(false);

    setTitle("");
    setContent("");

    setSnippetTitle("");
    setSnippetLanguage("typescript");
    setSnippetFilename("snippet.ts");
    setSnippetCode("");

    setShowcaseTitle("");
    setShowcaseUrl("");
    setShowcaseDescription("");
    setShowcaseThumbnail("");

    setPollQuestion("");
    setPollOptions(["", "", ""]);
    setPollDuration("7 Days");
    setPollVisibility("Public");

    setResourceTitle("");
    setResourceUrl("");
    setResourceCategory("Documentation");
    setResourceDescription("");
  };

  useEffect(() => {
    if (!open) return;

    if (!editPost) {
      resetForm();
      return;
    }

    setType(editPost.type || "post");
    setTags(Array.isArray(editPost.tags) ? editPost.tags.slice(0, 5) : []);
    setIsPrivate(Boolean(editPost.isPrivate));

    setTitle(editPost.title || "");
    setContent(editPost.content || "");

    const firstCodeBlock = editPost.codeBlocks?.[0] || {};
    setSnippetTitle(editPost.title || "");
    setSnippetLanguage(firstCodeBlock.language || "typescript");
    setSnippetFilename(firstCodeBlock.filename || "snippet.ts");
    setSnippetCode(firstCodeBlock.code || "");

    setShowcaseTitle(editPost.title || "");
    setShowcaseUrl(editPost.linkPreview?.url || "");
    setShowcaseDescription(
      editPost.content || editPost.linkPreview?.description || "",
    );
    setShowcaseThumbnail(editPost.screenshots?.[0] || "");

    setPollQuestion(editPost.poll?.question || "");
    const nextPollOptions = (editPost.poll?.options || [])
      .map((option) =>
        typeof option === "string" ? option : option?.text || "",
      )
      .filter(Boolean);
    setPollOptions(
      nextPollOptions.length >= 2 ? nextPollOptions : ["", "", ""],
    );
    setPollDuration(editPost.poll?.duration || "7 Days");
    setPollVisibility(editPost.poll?.visibility || "Public");

    setResourceTitle(editPost.title || "");
    setResourceUrl(editPost.linkPreview?.url || "");
    setResourceCategory(
      editPost.resourceCategory ||
        editPost.linkPreview?.category ||
        "Documentation",
    );
    setResourceDescription(
      editPost.content || editPost.linkPreview?.description || "",
    );
  }, [open, editPost]);

  if (!open) return null;

  const getContentForSuggestions = () => {
    switch (type) {
      case "snippet":
        return snippetCode || content;
      case "showcase":
        return showcaseDescription;
      case "poll":
        return pollQuestion;
      case "resource":
        return resourceDescription;
      default:
        return content;
    }
  };

  const getTitleForSuggestions = () => {
    switch (type) {
      case "snippet":
        return snippetTitle;
      case "showcase":
        return showcaseTitle;
      case "resource":
        return resourceTitle;
      default:
        return title;
    }
  };

  const handleSuggestTags = async () => {
    if (isSuggestingTags) return;
    setIsSuggestingTags(true);
    setSuggestedTags([]);

    try {
      const res = await fetch("/api/ai-tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: getTitleForSuggestions(),
          content: getContentForSuggestions(),
          type,
          existingTags: tags,
        }),
      });

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();
      const incoming = (data.tags || [])
        .filter((t) => !tags.includes(t) && t.length <= 20)
        .slice(0, 5 - tags.length);
      setSuggestedTags(incoming);
    } catch {
      setSuggestedTags([]);
    } finally {
      setIsSuggestingTags(false);
    }
  };

  const acceptSuggestedTag = (tag) => {
    if (tags.length >= 5 || tags.includes(tag)) return;
    setTags([...tags, tag]);
    setSuggestedTags((prev) => prev.filter((t) => t !== tag));
  };

  const dismissSuggestedTag = (tag) => {
    setSuggestedTags((prev) => prev.filter((t) => t !== tag));
  };

  const POLISHABLE_TYPES = ["post", "question", "til"];
  const canPolish =
    POLISHABLE_TYPES.includes(type) && content.trim().length >= 20;

  const handlePolish = async () => {
    if (isPolishing || !canPolish) return;
    setIsPolishing(true);

    setPrePolishSnapshot({ title, content });

    try {
      const res = await fetch("/api/ai-polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content: content.slice(0, 3000),
          type,
        }),
      });

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();
      if (data.title) setTitle(data.title);
      if (data.content) setContent(data.content);
    } catch {
      setPrePolishSnapshot(null);
    } finally {
      setIsPolishing(false);
    }
  };

  const handleUndoPolish = () => {
    if (!prePolishSnapshot) return;
    setTitle(prePolishSnapshot.title);
    setContent(prePolishSnapshot.content);
    setPrePolishSnapshot(null);
  };

  const updatePollOption = (index, value) => {
    const next = [...pollOptions];
    next[index] = value;
    setPollOptions(next);
  };

  const removePollOption = (index) => {
    if (pollOptions.length <= 2) return;
    setPollOptions(pollOptions.filter((_, i) => i !== index));
  };

  const addPollOption = () => {
    if (pollOptions.length >= 6) return;
    setPollOptions([...pollOptions, ""]);
  };

  const buildPayload = () => {
    const base = {
      type,
      tags,
      isPrivate,
    };

    if (type === "post") {
      return {
        ...base,
        title,
        content,
      };
    }

    if (type === "question") {
      return {
        ...base,
        title,
        content,
      };
    }

    if (type === "til") {
      return {
        ...base,
        content,
      };
    }

    if (type === "snippet") {
      return {
        ...base,
        title: snippetTitle,
        content,
        codeBlocks: [
          {
            filename: snippetFilename || "snippet.ts",
            language: snippetLanguage,
            code: snippetCode,
          },
        ],
      };
    }

    if (type === "showcase") {
      return {
        ...base,
        title: showcaseTitle,
        content: showcaseDescription,
        linkPreview: {
          url: showcaseUrl,
          title: showcaseTitle,
          description: showcaseDescription,
        },
        screenshots: showcaseThumbnail ? [showcaseThumbnail] : [],
      };
    }

    if (type === "poll") {
      return {
        ...base,
        poll: {
          question: pollQuestion,
          options: pollOptions
            .map((option) => option.trim())
            .filter(Boolean)
            .map((text) => ({ text, votes: [] })),
          multiSelect: false,
          duration: pollDuration,
          visibility: pollVisibility,
        },
      };
    }

    return {
      ...base,
      title: resourceTitle,
      content: resourceDescription,
      resourceCategory,
      linkPreview: {
        url: resourceUrl,
        title: resourceTitle,
        description: resourceDescription,
      },
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = buildPayload();

    if (isEditing && editPost?._id) {
      await onEdit?.(editPost._id, payload);
      return;
    }

    await onSubmit?.(payload);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm p-0 md:p-6 flex items-center justify-center">
      <div className="h-full md:h-[92vh] w-full md:max-w-5xl mx-auto bg-[#0e0e17] rounded-none md:rounded-3xl overflow-hidden flex flex-col md:flex-row border border-white/[0.08] shadow-2xl">
        {/* Left selector panel */}
        <aside className="w-full md:w-[260px] md:shrink-0 border-b md:border-b-0 md:border-r border-white/[0.07] bg-white/[0.01] flex flex-col md:min-h-0 md:overflow-y-auto">
          <div className="px-5 pt-4 pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl overflow-hidden border border-white/10">
                <Image src="/favicon.png" alt="ConvoX" width={32} height={32} className="w-full h-full object-cover" unoptimized />
              </div>
              <div>
                <p className="font-display font-bold text-ivory text-[20px] leading-tight">
                  ConvoX
                </p>
                <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-accent/70">
                  Create Post
                </p>
              </div>
            </div>
          </div>

          <div className="md:flex-1 overflow-x-auto md:overflow-y-auto scrollbar-hide px-3 py-3">
            <div className="flex md:flex-col gap-2 min-w-max md:min-w-0">
              {POST_TYPES.map(({ value, label, icon: Icon }) => {
                const active = value === type;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      if (isEditing) return;
                      setType(value);
                    }}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all duration-150 border whitespace-nowrap ${
                      active
                        ? "bg-accent/12 border-accent/30 text-accent"
                        : "bg-transparent border-transparent text-ivory/45 hover:text-ivory/70 hover:bg-white/[0.04]"
                    }`}
                    disabled={isEditing}
                  >
                    <Icon size={15} />
                    <span className="text-[13px] font-display font-semibold">
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3 px-5 py-4 border-t border-white/[0.06]">
            <div className="w-9 h-9 rounded-full bg-white/[0.08] border border-white/[0.12] overflow-hidden flex items-center justify-center">
              {user?.avatar ? (
                <Image src={user.avatar} alt={user?.name || "User"} width={36} height={36} className="w-full h-full object-cover" unoptimized />
              ) : (
                <span className="text-[12px] font-bold text-ivory/60">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </span>
              )}
            </div>
            <div>
              <p className="text-[13px] font-display font-bold text-ivory">
                {user?.name || "Your Post"}
              </p>
              <p className="text-[11px] font-mono text-ivory/30">Posting publicly</p>
            </div>
          </div>
        </aside>

        {/* Main form */}
        <section className="flex-1 min-h-0 flex flex-col">
          <header className="px-5 md:px-7 py-4 border-b border-white/[0.07] flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display font-bold text-ivory text-2xl md:text-[30px] leading-tight">
                {isEditing ? "Edit Post" : activeType.heading}
              </h2>
              <p className="text-[13px] font-sans text-ivory/42 mt-1">
                {isEditing
                  ? "Update your content and save changes."
                  : activeType.sub}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-ivory/35 hover:text-ivory hover:bg-white/[0.06] transition-colors"
            >
              <X size={17} />
            </button>
          </header>

          <form
            id="post-composer-form"
            onSubmit={handleSubmit}
            className="flex-1 min-h-0 overflow-y-auto scrollbar-hide px-5 md:px-7 py-5 space-y-5"
          >
            {type === "post" && (
              <>
                <div>
                  <FieldLabel>Title</FieldLabel>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a catchy title..."
                    required
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[15px] font-display font-semibold text-ivory placeholder:text-ivory/20 outline-none focus:border-accent/30"
                  />
                </div>

                <div>
                  <FieldLabel>Body</FieldLabel>
                  <MarkdownPanel
                    value={content}
                    onChange={setContent}
                    placeholder="Write your post in markdown..."
                  />
                </div>

                {/* AI Polish */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handlePolish}
                    disabled={!canPolish || isPolishing}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-accent/20 bg-accent/[0.06] text-[11px] font-mono font-semibold text-accent/80 hover:text-accent hover:bg-accent/[0.12] hover:border-accent/35 transition-all duration-150 disabled:opacity-35 disabled:cursor-not-allowed"
                  >
                    {isPolishing ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Sparkles size={12} />
                    )}
                    {isPolishing ? "Polishing..." : "✨ Polish"}
                  </button>
                  {prePolishSnapshot && !isPolishing && (
                    <button
                      type="button"
                      onClick={handleUndoPolish}
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-ivory/40 hover:text-ivory/70 transition-colors"
                    >
                      <Undo2 size={11} />
                      Undo polish
                    </button>
                  )}
                </div>
              </>
            )}

            {type === "snippet" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <FieldLabel>Snippet Title</FieldLabel>
                    <input
                      value={snippetTitle}
                      onChange={(e) => setSnippetTitle(e.target.value)}
                      placeholder="e.g. Binary Search Tree Implementation"
                      required
                      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[14px] text-ivory/85 placeholder:text-ivory/20 outline-none focus:border-accent/30"
                    />
                  </div>
                  <div>
                    <FieldLabel>Language</FieldLabel>
                    <select
                      value={snippetLanguage}
                      onChange={(e) => setSnippetLanguage(e.target.value)}
                      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-3 text-[14px] text-ivory/80 outline-none"
                    >
                      {CODE_LANGUAGES.map((language) => (
                        <option
                          key={language}
                          value={language}
                          className="bg-deep text-ivory"
                        >
                          {language}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <FieldLabel>Source Code</FieldLabel>
                  <div className="rounded-2xl border border-white/[0.08] bg-deep overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06] bg-white/[0.02]">
                      <input
                        value={snippetFilename}
                        onChange={(e) => setSnippetFilename(e.target.value)}
                        placeholder="snippet.ts"
                        className="bg-transparent text-[12px] font-mono text-ivory/60 placeholder:text-ivory/20 outline-none"
                      />
                      <p className="text-[10px] font-mono text-ivory/28 uppercase tracking-[0.12em]">
                        Read-only lines: 0
                      </p>
                    </div>
                    <textarea
                      value={snippetCode}
                      onChange={(e) => setSnippetCode(e.target.value)}
                      rows={11}
                      required
                      placeholder="// Paste or type your code here..."
                      className="w-full bg-transparent px-4 py-3 font-mono text-[13px] leading-6 text-ivory/75 placeholder:text-ivory/18 outline-none resize-y"
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel>Notes (optional)</FieldLabel>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={3}
                    placeholder="Explain what this snippet does..."
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[14px] text-ivory/80 placeholder:text-ivory/20 outline-none resize-y"
                  />
                </div>
              </>
            )}

            {type === "question" && (
              <>
                <div>
                  <FieldLabel>Question Title</FieldLabel>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Describe the issue clearly..."
                    required
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[15px] font-display font-semibold text-ivory placeholder:text-ivory/20 outline-none focus:border-accent/30"
                  />
                </div>

                <div>
                  <FieldLabel>Details</FieldLabel>
                  <MarkdownPanel
                    value={content}
                    onChange={setContent}
                    placeholder="What have you tried? Include context, expected behavior, and actual behavior..."
                  />
                </div>

                {/* AI Polish */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handlePolish}
                    disabled={!canPolish || isPolishing}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-accent/20 bg-accent/[0.06] text-[11px] font-mono font-semibold text-accent/80 hover:text-accent hover:bg-accent/[0.12] hover:border-accent/35 transition-all duration-150 disabled:opacity-35 disabled:cursor-not-allowed"
                  >
                    {isPolishing ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Sparkles size={12} />
                    )}
                    {isPolishing ? "Polishing..." : "✨ Polish"}
                  </button>
                  {prePolishSnapshot && !isPolishing && (
                    <button
                      type="button"
                      onClick={handleUndoPolish}
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-ivory/40 hover:text-ivory/70 transition-colors"
                    >
                      <Undo2 size={11} />
                      Undo polish
                    </button>
                  )}
                </div>
              </>
            )}

            {type === "til" && (
              <>
                <div>
                  <FieldLabel>What did you learn today?</FieldLabel>
                  <MarkdownPanel
                    value={content}
                    onChange={setContent}
                    placeholder="Share your new learning in a concise way..."
                  />
                </div>

                {/* AI Polish */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handlePolish}
                    disabled={!canPolish || isPolishing}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-accent/20 bg-accent/[0.06] text-[11px] font-mono font-semibold text-accent/80 hover:text-accent hover:bg-accent/[0.12] hover:border-accent/35 transition-all duration-150 disabled:opacity-35 disabled:cursor-not-allowed"
                  >
                    {isPolishing ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Sparkles size={12} />
                    )}
                    {isPolishing ? "Polishing..." : "✨ Polish"}
                  </button>
                  {prePolishSnapshot && !isPolishing && (
                    <button
                      type="button"
                      onClick={handleUndoPolish}
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-ivory/40 hover:text-ivory/70 transition-colors"
                    >
                      <Undo2 size={11} />
                      Undo polish
                    </button>
                  )}
                </div>
              </>
            )}

            {type === "showcase" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>Project Title</FieldLabel>
                    <input
                      value={showcaseTitle}
                      onChange={(e) => setShowcaseTitle(e.target.value)}
                      placeholder="e.g. My Awesome Dashboard"
                      required
                      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[14px] text-ivory/85 placeholder:text-ivory/20 outline-none focus:border-accent/30"
                    />
                  </div>
                  <div>
                    <FieldLabel>Live URL</FieldLabel>
                    <input
                      type="url"
                      value={showcaseUrl}
                      onChange={(e) => setShowcaseUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[14px] text-ivory/85 placeholder:text-ivory/20 outline-none focus:border-accent/30"
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel>Project Description</FieldLabel>
                  <textarea
                    value={showcaseDescription}
                    onChange={(e) => setShowcaseDescription(e.target.value)}
                    rows={5}
                    placeholder="Tell us what you built, why you built it, and the stack used..."
                    className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[14px] text-ivory/80 placeholder:text-ivory/20 outline-none resize-y"
                  />
                </div>

                <div>
                  <FieldLabel>Project Thumbnail</FieldLabel>
                  <div className="rounded-2xl border border-dashed border-white/[0.14] bg-white/[0.02] p-8 text-center space-y-3">
                    <div className="w-14 h-14 rounded-full mx-auto bg-accent/12 border border-accent/25 flex items-center justify-center text-accent">
                      <Upload size={20} />
                    </div>
                    <p className="font-display font-bold text-ivory/80 text-lg leading-tight">
                      Drop your image here
                    </p>
                    <p className="text-[12px] font-sans text-ivory/32">
                      Supports JPG, PNG up to 10MB (16:9 recommended)
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <ImagePlus size={14} className="text-ivory/35" />
                      <input
                        value={showcaseThumbnail}
                        onChange={(e) => setShowcaseThumbnail(e.target.value)}
                        placeholder="Paste image URL for now (design stub)"
                        className="w-full max-w-sm rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 py-2 text-[12px] text-ivory/70 placeholder:text-ivory/20 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {type === "poll" && (
              <>
                <div>
                  <FieldLabel>Question</FieldLabel>
                  <input
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    placeholder="What's on your mind?"
                    required
                    className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[15px] text-ivory/85 placeholder:text-ivory/20 outline-none focus:border-accent/30"
                  />
                </div>

                <div>
                  <FieldLabel>Poll Options</FieldLabel>
                  <div className="space-y-2">
                    {pollOptions.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          value={option}
                          onChange={(e) =>
                            updatePollOption(index, e.target.value)
                          }
                          placeholder={`Option ${index + 1}`}
                          className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-[14px] text-ivory/85 placeholder:text-ivory/20 outline-none"
                        />
                        {pollOptions.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removePollOption(index)}
                            className="w-8 h-8 rounded-lg border border-white/[0.08] bg-white/[0.03] text-ivory/35 hover:text-red-400/70"
                          >
                            <Minus size={14} className="mx-auto" />
                          </button>
                        )}
                      </div>
                    ))}

                    {pollOptions.length < 6 && (
                      <button
                        type="button"
                        onClick={addPollOption}
                        className="inline-flex items-center gap-1 text-[12px] font-mono text-accent/80 hover:text-accent"
                      >
                        <Plus size={12} /> Add another option
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>Duration</FieldLabel>
                    <select
                      value={pollDuration}
                      onChange={(e) => setPollDuration(e.target.value)}
                      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-[14px] text-ivory/80 outline-none"
                    >
                      {POLL_DURATIONS.map((duration) => (
                        <option
                          key={duration}
                          value={duration}
                          className="bg-deep text-ivory"
                        >
                          {duration}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <FieldLabel>Visibility</FieldLabel>
                    <select
                      value={pollVisibility}
                      onChange={(e) => setPollVisibility(e.target.value)}
                      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-[14px] text-ivory/80 outline-none"
                    >
                      {["Public", "Followers", "Private"].map((scope) => (
                        <option
                          key={scope}
                          value={scope}
                          className="bg-deep text-ivory"
                        >
                          {scope}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            {type === "resource" && (
              <>
                <div>
                  <FieldLabel>Resource Title</FieldLabel>
                  <input
                    value={resourceTitle}
                    onChange={(e) => setResourceTitle(e.target.value)}
                    placeholder="What's the name of this resource?"
                    required
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[14px] text-ivory/85 placeholder:text-ivory/20 outline-none focus:border-accent/30"
                  />
                </div>

                <div>
                  <FieldLabel>Resource URL</FieldLabel>
                  <input
                    type="url"
                    value={resourceUrl}
                    onChange={(e) => setResourceUrl(e.target.value)}
                    placeholder="https://example.com/resource"
                    required
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[14px] font-mono text-ivory/75 placeholder:text-ivory/20 outline-none focus:border-accent/30"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>Category</FieldLabel>
                    <select
                      value={resourceCategory}
                      onChange={(e) => setResourceCategory(e.target.value)}
                      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-[14px] text-ivory/80 outline-none"
                    >
                      {RESOURCE_CATEGORIES.map((category) => (
                        <option
                          key={category}
                          value={category}
                          className="bg-deep text-ivory"
                        >
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <FieldLabel>Tags</FieldLabel>
                    <TagInput tags={tags} onChange={setTags} />

                    {/* AI Suggest Tags (resource section) */}
                    {5 - tags.length > 0 && (
                      <div className="mt-2.5 space-y-2">
                        <button
                          type="button"
                          onClick={handleSuggestTags}
                          disabled={isSuggestingTags}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-accent/20 bg-accent/[0.06] text-[11px] font-mono font-semibold text-accent/80 hover:text-accent hover:bg-accent/[0.12] hover:border-accent/35 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {isSuggestingTags ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Wand2 size={12} />
                          )}
                          {isSuggestingTags ? "Suggesting..." : "Suggest Tags"}
                        </button>

                        {suggestedTags.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-mono text-ivory/25 mr-1">
                              Suggestions:
                            </span>
                            {suggestedTags.map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => acceptSuggestedTag(tag)}
                                disabled={tags.length >= 5}
                                className="group inline-flex items-center gap-1 rounded-full border border-accent/15 bg-accent/[0.06] px-2.5 py-0.5 text-[11px] font-mono font-semibold text-accent/70 hover:bg-accent/15 hover:text-accent hover:border-accent/30 transition-all duration-150 disabled:opacity-30"
                              >
                                <Plus
                                  size={10}
                                  className="opacity-50 group-hover:opacity-100"
                                />
                                #{tag}
                                <span
                                  role="button"
                                  tabIndex={0}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    dismissSuggestedTag(tag);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.stopPropagation();
                                      dismissSuggestedTag(tag);
                                    }
                                  }}
                                  className="ml-0.5 text-ivory/25 hover:text-red-400/70 transition-colors"
                                >
                                  ×
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <FieldLabel>Description</FieldLabel>
                  <textarea
                    value={resourceDescription}
                    onChange={(e) => setResourceDescription(e.target.value)}
                    rows={5}
                    placeholder="Briefly describe why this resource is valuable..."
                    className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[14px] text-ivory/80 placeholder:text-ivory/20 outline-none resize-y"
                  />
                </div>
              </>
            )}

            {type !== "resource" && (
              <div>
                <FieldLabel>Tags</FieldLabel>
                <TagInput tags={tags} onChange={setTags} />

                {/* AI Suggest Tags */}
                {5 - tags.length > 0 && (
                  <div className="mt-2.5 space-y-2">
                    <button
                      type="button"
                      onClick={handleSuggestTags}
                      disabled={isSuggestingTags}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-accent/20 bg-accent/[0.06] text-[11px] font-mono font-semibold text-accent/80 hover:text-accent hover:bg-accent/[0.12] hover:border-accent/35 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isSuggestingTags ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Wand2 size={12} />
                      )}
                      {isSuggestingTags ? "Suggesting..." : "Suggest Tags"}
                    </button>

                    {suggestedTags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-mono text-ivory/25 mr-1">
                          Suggestions:
                        </span>
                        {suggestedTags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => acceptSuggestedTag(tag)}
                            disabled={tags.length >= 5}
                            className="group inline-flex items-center gap-1 rounded-full border border-accent/15 bg-accent/[0.06] px-2.5 py-0.5 text-[11px] font-mono font-semibold text-accent/70 hover:bg-accent/15 hover:text-accent hover:border-accent/30 transition-all duration-150 disabled:opacity-30"
                          >
                            <Plus
                              size={10}
                              className="opacity-50 group-hover:opacity-100"
                            />
                            #{tag}
                            <span
                              role="button"
                              tabIndex={0}
                              onClick={(e) => {
                                e.stopPropagation();
                                dismissSuggestedTag(tag);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.stopPropagation();
                                  dismissSuggestedTag(tag);
                                }
                              }}
                              className="ml-0.5 text-ivory/25 hover:text-red-400/70 transition-colors"
                            >
                              ×
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[13px] font-display font-semibold text-ivory/80">
                  Make Private
                </p>
                <p className="text-[11px] text-ivory/30">
                  Only invited collaborators can view this post.
                </p>
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer shrink-0">
                {isPrivate ? (
                  <Lock size={14} className="text-accent" />
                ) : (
                  <Globe size={14} className="text-ivory/35" />
                )}
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="accent-accent"
                />
              </label>
            </div>
          </form>

          <footer className="px-5 md:px-7 py-4 border-t border-white/[0.07] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-[12px] font-mono font-bold uppercase tracking-[0.12em] text-ivory/38 hover:text-ivory/70 transition-colors"
            >
              Discard
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="px-4 py-2 rounded-xl border border-white/[0.12] text-[12px] font-mono font-bold text-ivory/70 hover:bg-white/[0.04] transition-colors"
              >
                Save Draft
              </button>
              <button
                type="submit"
                form="post-composer-form"
                className="px-5 py-2 rounded-xl bg-accent text-obsidian text-[12px] font-mono font-bold uppercase tracking-[0.1em] hover:bg-accent/85 transition-colors"
              >
                {isEditing ? "Save Changes" : activeType.publishCta}
              </button>
            </div>
          </footer>
        </section>
      </div>
    </div>
  );
}
