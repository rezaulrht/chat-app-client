import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { X, Send, Smile, Paperclip } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { useModule } from "@/hooks/useModule";
import { useWorkspace } from "@/hooks/useWorkspace";
import api from "@/app/api/Axios";
import EmojiPicker from "emoji-picker-react";
import toast from "react-hot-toast";
import FileAttachmentDisplay from "@/components/shared/FileAttachmentDisplay";

// EMOJI_MAP for quick autocomplete
const EMOJI_MAP = {
  ":smile:": "😄",
  ":laughing:": "😆",
  ":blush:": "😊",
  ":smiley:": "😃",
  ":relaxed:": "☺️",
  ":smirk:": "😏",
  ":heart_eyes:": "😍",
  ":kissing_heart:": "😘",
  ":kissing_closed_eyes:": "😚",
  ":flushed:": "😳",
  ":relieved:": "😌",
  ":satisfied:": "😆",
  ":grin:": "😁",
  ":wink:": "😉",
  ":stuck_out_tongue_winking_eye:": "😜",
  ":stuck_out_tongue_closed_eyes:": "😝",
  ":grinning:": "😀",
  ":kissing:": "😗",
  ":kissing_smiling_eyes:": "😙",
  ":stuck_out_tongue:": "😛",
  ":sleeping:": "😴",
  ":worried:": "😟",
  ":frowning:": "😦",
  ":anguished:": "😧",
  ":open_mouth:": "😮",
  ":grimacing:": "😬",
  ":confused:": "😕",
  ":hushed:": "😯",
  ":expressionless:": "😑",
  ":unamused:": "😒",
  ":sweat_smile:": "😅",
  ":sweat:": "😓",
  ":disappointed_relieved:": "😥",
  ":weary:": "😩",
  ":pensive:": "😔",
  ":disappointed:": "😞",
  ":confounded:": "😖",
  ":fearful:": "😨",
  ":cold_sweat:": "😰",
  ":persevere:": "😣",
  ":cry:": "😢",
  ":sob:": "😭",
  ":joy:": "😂",
  ":astonished:": "😲",
  ":scream:": "😱",
  ":tired_face:": "😫",
  ":angry:": "😠",
  ":rage:": "😡",
  ":triumph:": "😤",
  ":sleepy:": "😪",
  ":yum:": "😋",
  ":mask:": "😷",
  ":sunglasses:": "😎",
  ":dizzy_face:": "😵",
  ":imp:": "👿",
  ":smiling_imp:": "😈",
  ":neutral_face:": "😐",
  ":no_mouth:": "😶",
  ":innocent:": "😇",
  ":alien:": "👽",
  ":upside_down:": "🙃",
  ":thumbsup:": "👍",
  ":thumbsdown:": "👎",
  ":ok_hand:": "👌",
  ":punch:": "👊",
  ":fist:": "✊",
  ":v:": "✌️",
  ":raised_hand:": "✋",
  ":pray:": "🙏",
  ":clap:": "👏",
  ":muscle:": "💪",
  ":heart:": "❤️",
};

export default function ThreadPanel({ moduleId, workspaceId, parentMessage, onClose, workspace }) {
  const { user } = useAuth();
  const { messages, sendMessage, sendTyping } = useModule();
  const { membersCache, fetchWorkspaceMembers } = useWorkspace?.() || {};

  const memberList = membersCache?.[workspaceId] ?? workspace?.members ?? [];

  useEffect(() => {
    if (workspaceId) fetchWorkspaceMembers?.(workspaceId);
  }, [workspaceId, fetchWorkspaceMembers]);

  const [localReplies, setLocalReplies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [text, setText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  const bottomRef = useRef(null);

  // Auto-scroll inside thread
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localReplies, messages]);

  // Close emoji picker on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmojiPicker]);

  // Fetch historical replies
  useEffect(() => {
    const fetchReplies = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/workspaces/${workspaceId}/modules/${moduleId}/messages/${parentMessage._id}/thread`);
        setLocalReplies(res.data.replies || []);
      } catch (err) {
        console.error("Failed to fetch thread replies:", err);
        toast.error("Failed to load thread");
      } finally {
        setLoading(false);
      }
    };

    fetchReplies();
  }, [moduleId, parentMessage._id]);

  // Combine fetched historical replies + real-time ones from ModuleProvider context
  const allReplies = React.useMemo(() => {
    const map = new Map();
    localReplies.forEach((m) => map.set(m._id, m));

    // Also grab any real-time messages that reply to this parent
    messages.forEach((m) => {
      if ((m.replyTo?._id || m.replyTo) === parentMessage._id) {
        map.set(m._id, m);
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
  }, [localReplies, messages, parentMessage._id]);

  // Handle Input Changes to trigger Emoji / Mention Autocomplete
  const handleTextChange = (e) => {
    let val = e.target.value;
    const lastWord = val.split(" ").pop();
    if (EMOJI_MAP[lastWord]) val = val.replace(lastWord, EMOJI_MAP[lastWord]);
    setText(val);

    // 1. Check for emoji autocomplete
    const emojiMatch = val.match(/:([a-zA-Z0-9_]*)$/);
    if (emojiMatch) {
      const q = emojiMatch[1].toLowerCase();
      const filtered = Object.entries(EMOJI_MAP)
        .filter(([code]) => {
          const name = code.slice(1, -1);
          return name.startsWith(q) || name.split("_").some((w) => w.startsWith(q));
        })
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([code, emoji]) => ({ type: "emoji", key: code, value: emoji }))
        .slice(0, 8);
      setSuggestions(filtered);
      setSuggestionIndex(0);
      return;
    }

    // 2. Check for @mentions
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@([a-zA-Z0-9_\s]*)$/);

    if (mentionMatch) {
      const query = mentionMatch[1].toLowerCase();
      const availableMembers = membersCache?.[workspaceId] || [];
      const filtered = availableMembers
        .filter(
          (m) =>
            m.user &&
            m.user._id.toString() !== user?._id?.toString() &&
            m.user.name.toLowerCase().startsWith(query) &&
            !text.toLowerCase().includes(`@${m.user.name.toLowerCase()}`)
        )
        .map((m) => ({ type: "mention", key: m.user._id, value: m.user.name, user: m.user }))
        .slice(0, 10);

      if (filtered.length > 0) {
        setSuggestions(filtered);
        setSuggestionIndex(0);
        return;
      }
    }

    setSuggestions([]);
  };

  const insertSuggestion = (suggestion) => {
    setText((prev) => {
      if (suggestion.type === "emoji") {
        const match = prev.match(/:[a-zA-Z0-9_]*$/);
        if (!match) return prev + suggestion.value;
        return prev.slice(0, match.index) + suggestion.value;
      } else if (suggestion.type === "mention") {
        const match = prev.match(/@[a-zA-Z0-9_\s]*$/);
        if (!match) return prev + `@${suggestion.value} `;
        return prev.slice(0, match.index) + `@${suggestion.value} `;
      }
      return prev;
    });
    setSuggestions([]);
  };

  const handleKeyDown = (e) => {
    if (suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSuggestionIndex((p) => (p + 1) % suggestions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSuggestionIndex((p) => (p - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        insertSuggestion(suggestions[suggestionIndex]);
      } else if (e.key === "Escape") {
        setSuggestions([]);
      }
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    // Extract mentions
    const mentionIds = memberList
      ?.filter((m) => m.user && text.includes(`@${m.user.name}`))
      .map((m) => m.user._id) || [];

    // Use ModuleProvider API to send message 
    // It will optimistic update in context, which flows down to allReplies.
    sendMessage({ text: text.trim(), replyTo: parentMessage, attachments: [], mentions: mentionIds });
    setText("");
    setSuggestions([]);
  };

  const renderMessageText = (textArg = "", mentionsArg = [], mentionData = []) => {
    if (!textArg) return null;
    if (!mentionsArg || mentionsArg.length === 0) return textArg;

    let elements = [textArg];

    const members = membersCache?.[workspaceId] || [];

    const processedMentions = mentionsArg.map(mentionItem => {
      const userId = typeof mentionItem === "object" ? (mentionItem._id || mentionItem.id) : mentionItem;
      const member = workspace?.members?.find((m) => {
        const mUserId = m.user?._id || m.user?.id || m.user;
        return String(mUserId) === String(userId);
      });
      const smuggled = (mentionData || []).find(d => String(d.id || d._id) === String(userId));
      const memberName = (typeof mentionItem === "object" ? mentionItem.name : null) || smuggled?.name || member?.user?.name;
      const avatar = (typeof mentionItem === "object" ? mentionItem.avatar : null) || smuggled?.avatar || member?.user?.avatar;

      return { userId, memberName, member, avatar };
    }).filter(m => m.memberName).sort((a, b) => b.memberName.length - a.memberName.length);

    processedMentions.forEach(({ userId, memberName, member, avatar }) => {
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
                <span key={`${userId}-${i}`} className="inline-flex items-center gap-1 bg-[#5865f2]/20 text-white font-semibold px-1 py-0.5 mx-px rounded shadow-sm border border-[#5865f2]/30">
                  <Image
                    src={avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${memberName}`}
                    alt=""
                    width={14}
                    height={14}
                    className="w-3.5 h-3.5 rounded-full object-cover shrink-0"
                    unoptimized
                  />
                  {nameStr}
                </span>
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
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-80 h-full bg-deep border-l border-white/5 flex flex-col z-30 absolute right-0 top-0 shadow-2xl animate-in slide-in-from-right-8 duration-200">
      {/* Header */}
      <div className="h-14 px-4 border-b border-white/5 flex items-center justify-between shrink-0 bg-obsidian/50 backdrop-blur-md">
        <h3 className="text-sm font-bold text-ivory">Thread</h3>
        <button
          onClick={onClose}
          className="p-1.5 text-ivory/40 hover:text-ivory hover:bg-white/5 rounded-lg transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto w-full scrollbar-hide flex flex-col p-4 gap-4">
        {/* Parent Message Card */}
        <div className="flex gap-3">
          <Image
            src={parentMessage.sender?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${parentMessage.sender?.name}`}
            alt={parentMessage.sender?.name || "User"}
            width={32}
            height={32}
            className="w-8 h-8 rounded-full object-cover shrink-0 select-none"
            priority
            unoptimized
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-[13px] font-bold text-ivory/90 truncate">
                {parentMessage.sender?.name}
              </span>
              <span className="text-[10px] font-mono text-ivory/30">
                {formatTime(parentMessage.createdAt)}
              </span>
            </div>
            <p className="text-[13px] text-ivory/80 leading-relaxed whitespace-pre-wrap break-words">
              {renderMessageText(parentMessage.text, parentMessage.mentions, parentMessage.mentionData)}
            </p>
            {parentMessage.attachments?.length > 0 && (
              <FileAttachmentDisplay attachments={parentMessage.attachments} />
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 my-2">
          <div className="text-[10px] font-mono font-bold text-ivory/30 uppercase tracking-wider whitespace-nowrap">
            {allReplies.length} {allReplies.length === 1 ? "Reply" : "Replies"}
          </div>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        {/* Thread Replies */}
        {loading ? (
          <div className="text-xs text-ivory/40 text-center py-4">Loading replies...</div>
        ) : (
          allReplies.map((msg) => (
            <div key={msg._id} className="flex gap-3 group">
              <Image
                src={msg.sender?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender?.name}`}
                alt={msg.sender?.name || "User"}
                width={28}
                height={28}
                className="w-7 h-7 rounded-full object-cover shrink-0 select-none"
                unoptimized
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className="text-xs font-bold text-ivory/90 truncate">
                    {msg.sender?.name}
                  </span>
                  <span className="text-[9px] font-mono text-ivory/30">
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
                <div className={`text-xs leading-relaxed text-ivory/80 whitespace-pre-wrap wrap-break-word ${msg.isOptimistic ? "opacity-60" : ""}`}>
                  {renderMessageText(msg.text, msg.mentions, msg.mentionData)}
                </div>
                {msg.attachments?.length > 0 && (
                  <FileAttachmentDisplay attachments={msg.attachments} />
                )}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} className="h-1" />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/5 bg-obsidian relative">
        {/* Auto-complete suggestions */}
        {suggestions.length > 0 && (
          <div className="absolute bottom-full left-3 bg-deep/95 backdrop-blur-md border border-white/6 rounded-xl p-1 shadow-2xl z-50 min-w-48 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
            {suggestions.map((suggestion, i) => (
              <div
                key={suggestion.key}
                onClick={() => insertSuggestion(suggestion)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${i === suggestionIndex
                  ? "bg-accent/20 text-accent"
                  : "hover:bg-white/6 text-ivory/60 hover:text-ivory"
                  }`}
              >
                {suggestion.type === "emoji" ? (
                  <>
                    <span className="text-lg leading-none">{suggestion.value}</span>
                    <span className="text-xs font-mono">{suggestion.key}</span>
                  </>
                ) : (
                  <>
                    <img
                      src={suggestion.user.avatar || "/avatar.png"}
                      alt={suggestion.value}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span className="text-sm font-medium">{suggestion.value}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div ref={emojiPickerRef} className="absolute bottom-20 right-3 z-50 shadow-2xl">
            <EmojiPicker
              onEmojiClick={(data) => {
                setText((p) => p + data.emoji);
                setShowEmojiPicker(false);
              }}
              theme="dark"
              emojiStyle="native"
              width={300}
              height={350}
            />
          </div>
        )}

        <form onSubmit={handleSend} className="bg-slate-surface border border-white/5 rounded-xl flex items-end p-1 md:p-1.5 focus-within:border-accent/40 transition-colors">
          <textarea
            className="flex-1 bg-transparent min-w-0 resize-none outline-none text-[11px] md:text-xs text-ivory/90 px-1.5 md:px-2 py-1.5 placeholder:text-ivory/20 scrollbar-hide max-h-24"
            placeholder="Reply to thread..."
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            rows={1}
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 96) + "px";
            }}
          />
          <div className="flex items-center gap-1 pb-0.5 pr-0.5 md:pr-1">
            <button
              type="button"
              onClick={() => setShowEmojiPicker((v) => !v)}
              className="p-1 md:p-1.5 text-ivory/30 hover:text-ivory/60 transition-colors rounded-lg shrink-0"
            >
              <Smile size={16} />
            </button>
            <button
              type="submit"
              disabled={!text.trim()}
              className="p-1 md:p-1.5 bg-accent hover:bg-accent/90 text-black rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <Send size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
