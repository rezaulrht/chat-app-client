"use client";

import { ChevronDown, SlidersHorizontal } from "lucide-react";
import TagChip from "./TagChip";

const POST_TYPES = [
  { value: "all", label: "All Types" },
  { value: "post", label: "Post" },
  { value: "snippet", label: "Snippet" },
  { value: "question", label: "Question" },
  { value: "til", label: "TIL" },
  { value: "showcase", label: "Showcase" },
  { value: "poll", label: "Poll" },
  { value: "resource", label: "Resource" },
];

const SORT_OPTIONS = [
  { value: "latest", label: "Latest" },
  { value: "trending", label: "Trending" },
  { value: "top", label: "Top" },
];

/**
 * FeedFilters — type dropdown + active tag chips + sort selector.
 *
 * @param {object}   filters       - { type, tags: string[], sort }
 * @param {Function} onFiltersChange - (partial) => void
 */
export default function FeedFilters({
  filters = { type: "all", tags: [], sort: "latest" },
  onFiltersChange,
}) {
  const handleType = (e) => onFiltersChange?.({ type: e.target.value });
  const handleSort = (e) => onFiltersChange?.({ sort: e.target.value });
  const removeTag = (tag) =>
    onFiltersChange?.({ tags: filters.tags.filter((t) => t !== tag) });

  const hasFilters = filters.type !== "all" || filters.tags.length > 0;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SlidersHorizontal size={13} className="text-ivory/30 shrink-0" />

      {/* Type filter */}
      <div className="relative">
        <select
          value={filters.type}
          onChange={handleType}
          className="appearance-none bg-white/[0.04] ring-1 ring-white/[0.07] text-ivory/60 text-[11px] font-mono rounded-lg pl-2.5 pr-6 py-1 focus:outline-none focus:ring-accent/30 hover:bg-white/[0.07] transition-colors cursor-pointer"
        >
          {POST_TYPES.map((t) => (
            <option
              key={t.value}
              value={t.value}
              className="bg-deep text-ivory"
            >
              {t.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={10}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 text-ivory/30 pointer-events-none"
        />
      </div>

      {/* Sort */}
      <div className="relative">
        <select
          value={filters.sort}
          onChange={handleSort}
          className="appearance-none bg-white/[0.04] ring-1 ring-white/[0.07] text-ivory/60 text-[11px] font-mono rounded-lg pl-2.5 pr-6 py-1 focus:outline-none focus:ring-accent/30 hover:bg-white/[0.07] transition-colors cursor-pointer"
        >
          {SORT_OPTIONS.map((s) => (
            <option
              key={s.value}
              value={s.value}
              className="bg-deep text-ivory"
            >
              {s.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={10}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 text-ivory/30 pointer-events-none"
        />
      </div>

      {/* Active tag chips */}
      {filters.tags.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => removeTag(tag)}
          className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/12 ring-1 ring-accent/25 text-accent text-[11px] font-mono font-semibold hover:bg-accent/18 transition-colors"
          title={`Remove #${tag} filter`}
        >
          <span className="opacity-60">#</span>
          {tag}
          <span className="text-accent/50 ml-0.5">×</span>
        </button>
      ))}

      {/* Clear all */}
      {hasFilters && (
        <button
          type="button"
          onClick={() =>
            onFiltersChange?.({ type: "all", tags: [], sort: "latest" })
          }
          className="text-[10px] font-mono text-ivory/25 hover:text-ivory/50 transition-colors uppercase tracking-wider"
        >
          clear
        </button>
      )}
    </div>
  );
}
