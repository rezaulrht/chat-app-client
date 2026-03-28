import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { X, Search, Loader2 } from "lucide-react";
import api from "@/app/api/Axios";
import toast from "react-hot-toast";
import FileAttachmentDisplay from "@/components/shared/FileAttachmentDisplay";
import { useWorkspace } from "@/hooks/useWorkspace";

export default function ModuleSearchPanel({ moduleId, workspace, onJumpToMessage, onClose }) {
  const { membersCache, fetchWorkspaceMembers } = useWorkspace();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const wsId = workspace?.id || workspace?._id;
    if (wsId) fetchWorkspaceMembers(wsId);
  }, [workspace, fetchWorkspaceMembers]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const searchTimeoutRef = useRef(null);

  const fetchSearchResults = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const res = await api.get(
        `/api/workspaces/${workspace?.id || workspace?._id}/modules/${moduleId}/search`,
        {
          params: { q: searchQuery },
        },
      );
      setResults(res.data.messages || []);
    } catch (err) {
      console.error("Failed to search messages:", err);
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setQuery(val);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchSearchResults(val);
    }, 500); // 500ms debounce
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      fetchSearchResults(query);
    }
  };

  const renderMessageText = (
    textArg = "",
    mentionsArg = [],
    mentionData = [],
  ) => {
    if (!textArg) return null;
    if (!mentionsArg || mentionsArg.length === 0) return textArg;

    let elements = [textArg];

    const wsId = workspace?.id || workspace?._id;
    // The `members` variable from `membersCache` is not directly used in the `processedMentions` mapping below,
    // as the instruction explicitly uses `workspace?.members`.
    // However, `membersCache` is still fetched and might be used elsewhere or for other purposes.
    const members = membersCache?.[wsId] || [];

    const processedMentions = mentionsArg
      .map((mentionItem) => {
        const userId =
          typeof mentionItem === "object"
            ? mentionItem._id || mentionItem.id
            : mentionItem;
        const smuggled = (mentionData || []).find(
          (d) => String(d.id || d._id) === String(userId),
        );
        const memberName =
          (typeof mentionItem === "object" ? mentionItem.name : null) ||
          smuggled?.name ||
          member?.user?.name;
        const avatar =
          (typeof mentionItem === "object" ? mentionItem.avatar : null) ||
          smuggled?.avatar ||
          member?.user?.avatar;

        return { userId, memberName, member, avatar };
      })
      .filter((m) => m.memberName)
      .sort((a, b) => b.memberName.length - a.memberName.length);

    processedMentions.forEach(({ userId, memberName, member }) => {
      if (memberName) {
        const nameStr = `@${memberName}`;
        elements = elements.flatMap((el) => {
          if (typeof el !== "string") return [el];
          const parts = el.split(nameStr);
          const result = [];
          parts.forEach((part, i) => {
            result.push(part);
            if (i < parts.length - 1) {
              result.push(
                <span
                  key={`${userId}-${i}`}
                  className="inline-flex items-center gap-1 bg-[#5865f2]/20 text-white font-semibold px-1 py-0.5 mx-px rounded shadow-sm border border-[#5865f2]/30"
                >
                  <Image
                    src={
                      mention.avatar ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${memberName}`
                    }
                    alt=""
                    width={14}
                    height={14}
                    className="w-3.5 h-3.5 rounded-full object-cover shrink-0"
                    unoptimized
                  />
                  {nameStr}
                </span>,
              );
            }
          });
          return result;
        });
      }
    });

    return elements;
  };

  const formatTime = (isoString) => {
    const d = new Date(isoString);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  return (
    <div className="w-80 h-full bg-deep border-l border-white/5 flex flex-col z-30 absolute right-0 top-0 shadow-2xl animate-in slide-in-from-right-8 duration-200">
      {/* Header */}
      <div className="h-14 px-4 border-b border-white/5 flex items-center justify-between shrink-0 bg-obsidian/50 backdrop-blur-md">
        <h3 className="text-sm font-bold text-ivory">Search</h3>
        <button
          onClick={onClose}
          className="p-1.5 text-ivory/40 hover:text-ivory hover:bg-white/5 rounded-lg transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-white/5">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/40"
          />
          <input
            type="text"
            value={query}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            placeholder="Search in module..."
            autoFocus
            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-ivory placeholder:text-ivory/30 focus:outline-none focus:border-accent/50 focus:bg-white/10 transition-all"
          />
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto w-full scrollbar-hide flex flex-col p-4 gap-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 text-ivory/30 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-xs">Searching...</span>
          </div>
        ) : !hasSearched ? (
          <div className="text-xs text-ivory/40 text-center py-10">
            Type to search for messages.
          </div>
        ) : results.length === 0 ? (
          <div className="text-xs text-ivory/40 text-center py-10">
            No results found for "{query}".
          </div>
        ) : (
          results.map((msg) => (
            <div
              key={msg._id}
              className="flex gap-3 group bg-slate-surface border border-white/5 rounded-2xl p-3 hover:border-accent/30 transition-colors cursor-pointer"
              onClick={() => onJumpToMessage && onJumpToMessage(msg._id)}
            >
              <Image
                src={
                  msg.sender?.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender?.name}`
                }
                alt={msg.sender?.name || "User"}
                width={28}
                height={28}
                className="w-7 h-7 rounded-full object-cover shrink-0 select-none"
                unoptimized
              />
              <div className="min-w-0 flex-1 relative">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-[13px] font-bold text-ivory/90 truncate">
                    {msg.sender?.name}
                  </span>
                  <span className="text-[9px] font-mono text-ivory/30">
                    {formatTime(msg.createdAt)}
                  </span>
                </div>

                <div className="text-[12px] leading-relaxed text-ivory/80 whitespace-pre-wrap wrap-break-word">
                  {renderMessageText(msg.text, msg.mentions, msg.mentionData)}
                </div>
                {msg.attachments?.length > 0 && (
                  <div className="mt-2">
                    <FileAttachmentDisplay attachments={msg.attachments} />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
