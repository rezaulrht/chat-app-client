"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  Hash,
  Megaphone,
  Smile,
  Send,
  Reply,
  Pencil,
  Trash2,
  ChevronDown,
  Loader2,
  Menu,
  X,
  Plus,
  Users,
  CheckCheck,
  Clock,
  Calendar,
  Paperclip,
  MessageSquare,
  Pin,
  PinOff,
  Search,
  Gamepad2,
} from "lucide-react";
import WordSpyGame from "@/components/wordspy/WordSpyGame";
import useWordSpyStore from "@/stores/wordSpyStore";
import useWordSpy from "@/hooks/useWordSpy";
import useAuth from "@/hooks/useAuth";
import { useModule } from "@/hooks/useModule";
import { useWorkspace } from "@/hooks/useWorkspace";
import { EMOJI_MAP } from "@/utils/emojis";
import { getGroupInitials, getGroupAvatarColor } from "@/utils/groupAvatar";
import toast from "react-hot-toast";
import { useFileUpload } from "@/hooks/useFileUpload";
import FileAttachmentPreview from "@/components/shared/FileAttachmentPreview";
import FileAttachmentDisplay from "@/components/shared/FileAttachmentDisplay";
import VoiceMessageRecorder from "@/components/calls/VoiceMessageRecorder";
import ThreadPanel from "./ThreadPanel";
import PinnedMessagesPanel from "./PinnedMessagesPanel";
import ModuleSearchPanel from "./ModuleSearchPanel";
import "./Mention.css";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });
const GifPicker = dynamic(
  () =>
    import("gif-picker-react-klipy").then((m) => m.GifPicker || m.default || m),
  { ssr: false },
);

import {
  createScheduledMessage,
  listScheduledMessages,
  cancelScheduledMessage,
} from "@/utils/scheduleApi";

// Returns the current datetime as a string compatible with datetime-local <input min>
const formatLocalMin = () => {
  const now = new Date();
  now.setSeconds(0, 0);
  return now.toISOString().slice(0, 16);
};

const getDateLabel = (dateStr) => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const isSame = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (isSame(date, today)) return "Today";
  if (isSame(date, yesterday)) return "Yesterday";
  return date.toLocaleDateString([], {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const toDateKey = (d) => {
  const date = new Date(d);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

export default function ModuleChatWindow({
  moduleId,
  workspaceId,
  onToggleSidebar,
  onToggleMembers,
  showMembers,
}) {
  const { user } = useAuth();
  const { workspaces, modulesCache, membersCache, fetchWorkspaceMembers } =
    useWorkspace();
  const {
    messages,
    loading,
    hasMore,
    loadMore,
    reactions,
    typingUsers,
    sendMessage,
    sendTyping,
    reactToMessage,
    editMessage,
    deleteMessage,
    pinMessage,
  } = useModule();

  const wordSpyPhase = useWordSpyStore((s) => s.phase);
  const { joinGame } = useWordSpy();

  // All phases including results are game phases — the results screen is part of the game
  const GAME_PHASES = [
    "lobby",
    "word_assign",
    "word_reveal",
    "hint",
    "vote",
    "reveal",
    "results",
  ];
  const isGameActive = GAME_PHASES.includes(wordSpyPhase);

  const workspace = workspaces.find((w) => w._id === workspaceId);
  const modules = modulesCache[workspaceId] || [];
  const activeModule = modules.find((m) => m._id === moduleId);
  const isAnnouncement = activeModule?.type === "announcement";
  const isAdminOrOwner =
    workspace?.myRole === "owner" || workspace?.myRole === "admin";

  // ── Local UI state ────────────────────────────────────────────────────────
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [reactionPickerMsgId, setReactionPickerMsgId] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [longPressedMsgId, setLongPressedMsgId] = useState(null);

  // Panels
  const [activeThreadMessage, setActiveThreadMessage] = useState(null);
  const [showPinnedPanel, setShowPinnedPanel] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);

  // Scheduled messages
  const [scheduleDropdownOpen, setScheduleDropdownOpen] = useState(false);
  const [scheduleMode, setScheduleMode] = useState(false);
  const [sendAt, setSendAt] = useState("");
  const [showScheduledPanel, setShowScheduledPanel] = useState(false);
  const [scheduledItems, setScheduledItems] = useState([]);
  const [loadingScheduled, setLoadingScheduled] = useState(false);
  const [scheduling, setScheduling] = useState(false);

  // AI features
  const [aiReplies, setAiReplies] = useState([]);
  const [loadingAiReplies, setLoadingAiReplies] = useState(false);
  const [aiMenuOpen, setAiMenuOpen] = useState(false);
  const [tonePickerOpen, setTonePickerOpen] = useState(false);
  const [selectedTone, setSelectedTone] = useState("");
  const [customTone, setCustomTone] = useState("");
  const [loadingRewrite, setLoadingRewrite] = useState(false);
  const [rewritePreview, setRewritePreview] = useState(null);
  const [originalText, setOriginalText] = useState("");

  // Read Receipts Popover
  const [showSeenBy, setShowSeenBy] = useState(null); // stores msgId

  const bottomRef = useRef(null);

  // File upload
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const {
    files: stagedFiles,
    previews: filePreviews,
    progress: fileProgress,
    uploading: fileUploading,
    errors: fileErrors,
    selectFiles,
    uploadFiles,
    removeFile,
    reset: resetFiles,
  } = useFileUpload();
  const inputRef = useRef(null);
  const reactionPickerRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const gifPickerRef = useRef(null);
  const longPressTimer = useRef(null);
  const scheduleDropdownRef = useRef(null);
  const aiMenuRefDesktop = useRef(null);
  const aiMenuRefMobile = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Reset input state when module changes
  useEffect(() => {
    setText("");
    if (inputRef.current) inputRef.current.innerHTML = "";
    setReplyTo(null);
    setEditingId(null);
    setSuggestions([]);
    setReactionPickerMsgId(null);
    setShowEmojiPicker(false);
    setShowGifPicker(false);
    setShowVoiceRecorder(false);
    setShowSeenBy(null);
    resetFiles();
  }, [moduleId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch members if not present
  useEffect(() => {
    if (workspaceId) fetchWorkspaceMembers(workspaceId);
  }, [workspaceId, fetchWorkspaceMembers]);

  // Close pickers on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        reactionPickerRef.current &&
        !reactionPickerRef.current.contains(e.target)
      ) {
        setReactionPickerMsgId(null);
      }
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target)
      ) {
        setShowEmojiPicker(false);
      }
      if (gifPickerRef.current && !gifPickerRef.current.contains(e.target)) {
        setShowGifPicker(false);
      }
      if (longPressedMsgId) setLongPressedMsgId(null);

      // Close seen by popover
      if (showSeenBy) {
        // We'll attach a data-attribute to the popover to avoid closing when clicking inside it
        if (!e.target.closest("[data-seen-popover]")) {
          setShowSeenBy(null);
        }
      }
      // Close schedule dropdown on outside click
      const mobileTrigger = e.target.closest(".mobile-schedule-trigger");
      if (
        scheduleDropdownRef.current &&
        !scheduleDropdownRef.current.contains(e.target) &&
        !mobileTrigger
      ) {
        setScheduleDropdownOpen(false);
      }
      // Close AI menu on outside click
      if (
        aiMenuRefDesktop.current &&
        !aiMenuRefDesktop.current.contains(e.target) &&
        aiMenuRefMobile.current &&
        !aiMenuRefMobile.current.contains(e.target)
      ) {
        setAiMenuOpen(false);
      }
    };
    if (
      reactionPickerMsgId ||
      showEmojiPicker ||
      showGifPicker ||
      longPressedMsgId ||
      showSeenBy ||
      scheduleDropdownOpen ||
      aiMenuOpen
    ) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [
    reactionPickerMsgId,
    showEmojiPicker,
    showGifPicker,
    longPressedMsgId,
    showSeenBy,
    scheduleDropdownOpen,
    aiMenuOpen,
  ]);

  // ── Jump to message (from panels) ────────────────────────────────────────
  const handleJumpToMessage = useCallback((messageId) => {
    setShowPinnedPanel(false);
    setShowSearchPanel(false);
    setTimeout(() => {
      const el = document.querySelector(`[data-message-id="${messageId}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-1", "ring-accent/50");
        setTimeout(() => el.classList.remove("ring-1", "ring-accent/50"), 2000);
      }
    }, 50);
  }, []);

  // ── Long-press (mobile) ───────────────────────────────────────────────────
  const handleTouchStart = useCallback((msgId) => {
    longPressTimer.current = setTimeout(() => {
      setLongPressedMsgId(msgId);
      if (navigator.vibrate) navigator.vibrate(30);
    }, 500);
  }, []);

  const formatLocalMin = () => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  }, []);

  // ── Render Mentions ───────────────────────────────────────────────────────
  const renderMessageText = (text, mentions, mentionData = []) => {
    if (!text) return null;
    if (!mentions || mentions.length === 0) return text;

    const resolvedMentions = mentions
      .map((m) => {
        const id = typeof m === "object" ? m._id || m.id : m;
        const allMembers = membersCache?.[workspaceId] || [];
        const member =
          allMembers.find((mem) => {
            const mUserId = mem.user?._id || mem.user?.id || mem.user;
            return String(mUserId) === String(id);
          }) ||
          workspace?.members?.find((mem) => {
            const mUserId = mem.user?._id || mem.user?.id || mem.user;
            return String(mUserId) === String(id);
          });

        const smuggled = (mentionData || []).find(
          (d) => String(d.id || d._id) === String(id),
        );
        const name =
          (typeof m === "object" ? m.name : null) ||
          smuggled?.name ||
          member?.user?.name;
        const avatar =
          (typeof m === "object" ? m.avatar : null) ||
          smuggled?.avatar ||
          member?.user?.avatar;

        return {
          id,
          name,
          avatar,
          member,
        };
      })
      .filter((m) => m.name);

    if (resolvedMentions.length === 0) return text;

    const sorted = [...resolvedMentions].sort(
      (a, b) => b.name.length - a.name.length,
    );
    const regexSource = sorted
      .map((m) => `@${m.name.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}`)
      .join("|");
    const regex = new RegExp(`(${regexSource})`, "g");

    const parts = text.split(regex);

    return parts.map((part, i) => {
      if (part.startsWith("@")) {
        const mention = sorted.find((m) => `@${m.name}` === part);
        if (mention) {
          return (
            <span
              key={`${mention.id}-${i}`}
              className="inline-flex items-center gap-1 bg-[#5865f2]/20 text-white font-semibold px-1 py-0.5 mx-px rounded shadow-sm border border-[#5865f2]/30"
            >
              <Image
                src={
                  mention.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${mention.name}`
                }
                alt=""
                width={14}
                height={14}
                className="w-3.5 h-3.5 rounded-full object-cover shrink-0"
                unoptimized
              />
              {part}
            </span>
          );
        }
      }
      return part;
    });
  };

  const parseMessage = (el) => {
    if (!el) return { text: "", mentions: [] };
    const mentions = [];
    let text = "";

    const processNode = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.classList.contains("mention")) {
          mentions.push({
            id: node.dataset.id,
            name: node.textContent.replace(/^@/, ""),
            avatar: node.querySelector("img")?.src,
          });
          text += node.textContent;
        } else if (node.nodeName === "BR") {
          text += "\n";
        } else {
          node.childNodes.forEach(processNode);
          if (node.nodeName === "DIV" || node.nodeName === "P") {
            if (!text.endsWith("\n") && node.nextSibling) text += "\n";
          }
        }
      }
    };

    el.childNodes.forEach(processNode);
    return { text, mentions };
  };

  const insertMention = (suggestion) => {
    if (!inputRef.current) return;
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);

    const textNode = range.startContainer;
    if (textNode.nodeType !== Node.TEXT_NODE) return;

    const content = textNode.textContent;
    const offset = range.startOffset;
    const textBefore = content.slice(0, offset);
    const mentionMatch = textBefore.match(/@([a-zA-Z0-9_\s]*)$/);

    if (mentionMatch) {
      const start = mentionMatch.index;
      range.setStart(textNode, start);
      range.deleteContents();

      const span = document.createElement("span");
      span.className = "mention";
      span.contentEditable = "false";
      span.dataset.id = suggestion.user?._id || suggestion.key;

      const img = document.createElement("img");
      img.src =
        suggestion.user?.avatar ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${suggestion.value}`;
      img.alt = "";
      span.appendChild(img);

      const nameText = document.createTextNode(`@${suggestion.value}`);
      span.appendChild(nameText);

      range.insertNode(span);

      const space = document.createTextNode("\u00A0");
      span.after(space);

      range.setStartAfter(space);
      range.setEndAfter(space);
      selection.removeAllRanges();
      selection.addRange(range);

      const parsed = parseMessage(inputRef.current);
      setText(parsed.text);
      setSuggestions([]);
      sendTyping(parsed.text.trim().length > 0);
    }
  };

  // ── Text change + typing + emoji/mention autocomplete ─────────────────────
  const handleInput = (e) => {
    const el = e.currentTarget;
    const parsed = parseMessage(el);
    const val = parsed.text;
    setText(val);
    sendTyping(val.trim().length > 0);

    // Suggestion logic for contenteditable
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    const textNode = range.startContainer;
    if (textNode.nodeType !== Node.TEXT_NODE) {
      setSuggestions([]);
      return;
    }

    const content = textNode.textContent;
    const offset = range.startOffset;
    const textBeforeCursor = content.slice(0, offset);

    // 1. Check for emoji autocomplete (simplified for now, or use similar logic)
    const emojiMatch = textBeforeCursor.match(/:([a-zA-Z0-9_]*)$/);
    if (emojiMatch) {
      const q = emojiMatch[1].toLowerCase();
      const filtered = Object.entries(EMOJI_MAP)
        .filter(([code]) => {
          const name = code.slice(1, -1);
          return (
            name.startsWith(q) || name.split("_").some((w) => w.startsWith(q))
          );
        })
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([code, emoji]) => ({ type: "emoji", key: code, value: emoji }))
        .slice(0, 8);
      setSuggestions(filtered);
      setSuggestionIndex(0);
      return;
    }

    // 2. Check for @mentions
    const mentionMatch = textBeforeCursor.match(/@([a-zA-Z0-9_\s]*)$/);

    if (mentionMatch) {
      const query = mentionMatch[1].toLowerCase();
      const availableMembers = membersCache?.[workspaceId] || [];
      const currentMentions = parsed.mentions.map((m) =>
        typeof m === "object" ? m.id : m,
      );

      const filtered = availableMembers
        .filter(
          (m) =>
            m.user &&
            m.user._id.toString() !== user?._id?.toString() &&
            !currentMentions.includes(m.user._id.toString()) &&
            m.user.name.toLowerCase().startsWith(query),
        )
        .map((m) => ({
          type: "mention",
          key: m.user._id,
          value: m.user.name,
          user: m.user,
        }))
        .slice(0, 10);

      if (filtered.length > 0) {
        setSuggestions(filtered);
        setSuggestionIndex(0);
        return;
      }
    }

    setSuggestions([]);
  };

  const insertEmoji = (suggestion) => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    const textNode = range.startContainer;
    if (textNode.nodeType !== Node.TEXT_NODE) return;

    const content = textNode.textContent;
    const offset = range.startOffset;
    const textBefore = content.slice(0, offset);
    const emojiMatch = textBefore.match(/:[a-zA-Z0-9_]*$/);

    if (emojiMatch) {
      const start = emojiMatch.index;
      range.setStart(textNode, start);
      range.deleteContents();
      const emojiNode = document.createTextNode(suggestion.value);
      range.insertNode(emojiNode);
      range.setStartAfter(emojiNode);
      range.setEndAfter(emojiNode);
      selection.removeAllRanges();
      selection.addRange(range);

      const parsed = parseMessage(inputRef.current);
      setText(parsed.text);
      setSuggestions([]);
    }
  };

  const insertSuggestion = (suggestion) => {
    if (suggestion.type === "emoji") {
      insertEmoji(suggestion);
    } else if (suggestion.type === "mention") {
      insertMention(suggestion);
    }
  };

  const insertTextAtCursor = (textToInsert) => {
    if (!inputRef.current) return;
    inputRef.current.focus();
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    range.deleteContents();
    const textNode = document.createTextNode(textToInsert);
    range.insertNode(textNode);
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    selection.removeAllRanges();
    selection.addRange(range);

    const parsed = parseMessage(inputRef.current);
    setText(parsed.text);
    handleInput({ currentTarget: inputRef.current });
  };

  const renderInputHighlighter = (val) => {
    return null; // No longer needed with contenteditable
  };

  const handleKeyDown = (e) => {
    if (suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSuggestionIndex((p) => (p + 1) % suggestions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSuggestionIndex(
          (p) => (p - 1 + suggestions.length) % suggestions.length,
        );
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

  // ── Scheduled Messages ────────────────────────────────────────────────────
  const refreshScheduled = useCallback(async () => {
    if (!activeModule) return;
    setLoadingScheduled(true);
    try {
      const res = await listScheduledMessages({ moduleId: activeModule._id });
      setScheduledItems(res || []);
    } catch (err) {
      console.error("Failed to load scheduled messages", err);
    } finally {
      setLoadingScheduled(false);
    }
  }, [activeModule]);

  // Load scheduled messages when returning or when switching modules
  useEffect(() => {
    if (activeModule) {
      refreshScheduled();
      setShowScheduledPanel(false);
    }
  }, [activeModule?._id, refreshScheduled]);

  const onCancelScheduled = async (id) => {
    try {
      await cancelScheduledMessage({ scheduledId: id });
      refreshScheduled();
      toast.success("Scheduled message cancelled");
    } catch (err) {
      toast.error("Failed to cancel scheduled message");
    }
  };

  // ── Send ──────────────────────────────────────────────────────────────────
  const handleSend = async (e) => {
    e.preventDefault();
    const parsed = parseMessage(inputRef.current);
    const hasText = parsed.text.trim().length > 0;
    const hasFiles = stagedFiles.length > 0;
    if (!hasText && !hasFiles) return;
    if (fileUploading) return;
    if (isAnnouncement && !isAdminOrOwner) return;

    let attachments = [];
    if (hasFiles) {
      attachments = await uploadFiles();
      if (fileErrors.some((err) => err !== null)) {
        toast.error("Some files failed to upload. Remove them and try again.");
        return;
      }
    }

    const mentionIds = parsed.mentions.map((m) =>
      typeof m === "object" ? m.id : m,
    );
    sendMessage({
      text: parsed.text.trim(),
      replyTo,
      attachments,
      mentions: mentionIds,
    });
    setText("");
    if (inputRef.current) inputRef.current.innerHTML = "";
    setReplyTo(null);
    setSuggestions([]);
    sendTyping(false);
    resetFiles();
  };

  const scheduleMessage = async () => {
    if (!text.trim()) return;
    if (!sendAt) {
      toast.error("Please select a date and time");
      return;
    }

    const sendTime = new Date(sendAt).getTime();
    if (sendTime <= Date.now()) {
      return toast.error("Scheduled time must be in the future");
    }

    setScheduling(true);
    try {
      await createScheduledMessage({
        moduleId: activeModule._id,
        workspaceId: workspace?._id,
        content: text.trim(),
        sendAt: new Date(sendAt).toISOString(),
      });
      toast.success("✅ Message scheduled!");
      setText("");
      if (inputRef.current) inputRef.current.innerHTML = "";
      setSendAt("");
      refreshScheduled();
      setShowScheduledPanel(true);
      sendTyping(false);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to schedule message");
    } finally {
      sendTyping(false);
      setScheduling(false);
    }
  };

  // ── AI Features ───────────────────────────────────────────────────────────
  const fetchAiReplies = useCallback(
    async (messagesList) => {
      const visible = messagesList
        .filter((m) => !m.isDeleted && m.text?.trim())
        .slice(-12);

      if (visible.length === 0) return;

      const lastMsg = visible[visible.length - 1];

      setLoadingAiReplies(true);
      setAiReplies([]);

      try {
        const context = visible.map((m) => ({
          text: m.text,
          isMe: (m.sender?._id ?? m.sender) === user?._id,
        }));

        const res = await fetch("/api/ai-reply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: context,
            latestMessage: lastMsg.text,
          }),
        });

        const data = await res.json();
        if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
          setAiReplies(data.suggestions.slice(0, 3));
        }
      } catch (err) {
        console.error("[AI] fetchAiReplies error:", err);
      } finally {
        setLoadingAiReplies(false);
      }
    },
    [user?._id],
  );

  const handleAiButton = useCallback(() => {
    const visible = messages.filter((m) => !m.isDeleted && m.text?.trim());
    fetchAiReplies(visible);
  }, [messages, fetchAiReplies]);

  const activeTone = customTone.trim() || selectedTone;

  const handleRewrite = useCallback(async () => {
    if (!activeTone || !text.trim() || loadingRewrite) return;

    setOriginalText(text);
    setLoadingRewrite(true);
    setRewritePreview(null);

    try {
      const res = await fetch("/api/ai-rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.slice(0, 2000), tone: activeTone }),
      });
      const data = await res.json();
      if (data.rewrite?.trim()) {
        setRewritePreview(data.rewrite.trim());
      } else {
        toast.error("Failed to rewrite message");
      }
    } catch {
      toast.error("Failed to rewrite message");
    } finally {
      setLoadingRewrite(false);
    }
  }, [text, activeTone, loadingRewrite]);

  // ── GIF ───────────────────────────────────────────────────────────────────
  const handleGifClick = (gif) => {
    const gifUrl = gif.url || gif.previewUrl;
    sendMessage({ gifUrl });
    setShowGifPicker(false);
  };

  const handleVoiceSend = useCallback(
    (attachment) => {
      sendMessage({ attachments: [attachment], replyTo });
      setShowVoiceRecorder(false);
      setReplyTo(null);
      sendTyping(false);
    },
    [sendMessage, replyTo, sendTyping],
  );

  // ── Edit ──────────────────────────────────────────────────────────────────
  const handleEditSave = () => {
    if (!editedText.trim()) return;
    editMessage(editingId, editedText.trim());
    setEditingId(null);
    setEditedText("");
  };

  // ── Delete (always for everyone in modules) ───────────────────────────────
  const handleDelete = (msgId) => {
    deleteMessage(msgId, true);
  };

  // ── Word Spy game view ────────────────────────────────────────────────────
  if (isGameActive) {
    return (
      <div className="flex-1 flex flex-col h-full bg-obsidian">
        <WordSpyGame moduleId={moduleId} workspaceId={workspaceId} />
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!activeModule) {
    return (
      <div className="flex-1 bg-obsidian flex flex-col items-center justify-center gap-5 p-6">
        <div className="w-16 h-16 rounded-3xl bg-accent/10 border border-accent/20 flex items-center justify-center">
          <Hash size={28} className="text-accent/40" />
        </div>
        <div className="text-center space-y-1.5">
          <h2 className="text-ivory font-display font-bold">Select a module</h2>
          <p className="text-ivory/30 text-sm max-w-55">
            Choose a module from the sidebar to start chatting
          </p>
        </div>
        <button
          onClick={onToggleSidebar}
          className="md:hidden px-4 py-2.5 bg-accent/10 hover:bg-accent/20 border border-accent/20 rounded-xl text-accent text-sm font-bold transition-all"
        >
          Open Modules
        </button>
      </div>
    );
  }

  const ModuleIcon = isAnnouncement ? Megaphone : Hash;
  const canType = !isAnnouncement || isAdminOrOwner;

  return (
    <main
      className="flex-1 min-w-0 flex flex-col bg-obsidian relative h-full"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setIsDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        selectFiles(e.dataTransfer.files);
      }}
    >
      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-obsidian/80 border-2 border-dashed border-accent rounded-lg pointer-events-none">
          <p className="text-accent text-lg font-medium">Drop files here</p>
        </div>
      )}
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="h-14 border-b border-white/6 flex items-center justify-between px-4 bg-obsidian/80 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onToggleSidebar}
            className="md:hidden w-8 h-8 rounded-xl bg-white/4 flex items-center justify-center text-ivory/30 hover:text-ivory transition-colors"
          >
            <div className="relative w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0 ring-1 ring-white/6 overflow-hidden">
              <Menu size={18} />
            </div>
          </button>
          <ModuleIcon size={17} className="text-accent/60 shrink-0" />
          <div>
            <h2 className="text-ivory font-display font-bold text-[14px] leading-tight">
              {activeModule.name}
            </h2>
            <p className="text-ivory/25 text-[10px] font-mono">
              {workspace?.name}
              {isAnnouncement && " · Announcement"}
            </p>
          </div>
        </div>
        {/* Header Right Actions */}
        <div className="flex items-center gap-1.5">
          {/* Search toggle */}
          <button
            onClick={() => {
              setShowSearchPanel((p) => !p);
              setShowPinnedPanel(false);
              setActiveThreadMessage(null);
            }}
            title="Search in module"
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${showSearchPanel
                ? "bg-accent/15 text-accent"
                : "text-ivory/25 hover:text-ivory/60 hover:bg-white/6"
              }`}
          >
            <Search size={16} />
          </button>

          {/* Pinned Messages toggle */}
          <button
            onClick={() => {
              setShowPinnedPanel((p) => !p);
              setShowSearchPanel(false);
              setActiveThreadMessage(null); // Close thread if opening pins
            }}
            title="Pinned messages"
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${showPinnedPanel
                ? "bg-accent/15 text-accent"
                : "text-ivory/25 hover:text-ivory/60 hover:bg-white/6"
              }`}
          >
            <Pin size={16} />
          </button>

          {/* Members toggle */}
          <div className="flex items-center gap-1">
            {!isGameActive && (
              <button
                onClick={() => joinGame(moduleId, workspaceId)}
                className="p-2 rounded-lg text-ivory/35 hover:text-ivory/75 hover:bg-white/6 transition-colors"
                title="Play Word Spy"
              >
                <Gamepad2 size={18} />
              </button>
            )}
            <button
              onClick={onToggleMembers}
              title="Toggle member list"
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${showMembers
                  ? "bg-accent/15 text-accent"
                  : "text-ivory/25 hover:text-ivory/60 hover:bg-white/6"
                }`}
            >
              <Users size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Message List ──────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-5 flex flex-col gap-3 scrollbar-hide">
        {/* Load more button */}
        {hasMore && (
          <button
            onClick={loadMore}
            disabled={loading}
            className="self-center px-4 py-1.5 rounded-full text-[11px] font-mono text-ivory/30 hover:text-accent border border-white/6 hover:border-accent/30 transition-all flex items-center gap-1.5"
          >
            {loading ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <ChevronDown size={12} />
            )}
            Load earlier messages
          </button>
        )}

        {loading && messages.length === 0 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Loader2 size={16} className="text-accent/40 animate-spin" />
            <p className="text-ivory/20 text-xs font-mono">
              Loading messages...
            </p>
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 gap-3">
            <div className="w-12 h-12 rounded-3xl bg-accent/10 border border-accent/15 flex items-center justify-center">
              <ModuleIcon size={22} className="text-accent/40" />
            </div>
            <p className="text-ivory/20 text-xs font-mono">
              {isAnnouncement
                ? "No announcements yet."
                : "Be the first to say something!"}
            </p>
          </div>
        )}

        {/* Date-separated message list */}
        {(() => {
          let lastAnyMeIndex = -1;
          for (let i = messages.length - 1; i >= 0; i--) {
            const m = messages[i];
            const isMsgMe =
              m.sender?._id === user?._id || m.sender === user?._id;
            if (isMsgMe && !m.isOptimistic) {
              lastAnyMeIndex = i;
              break;
            }
          }

          return messages.map((msg, index) => {
            const isMe =
              msg.sender?._id === user?._id || msg.sender === user?._id;
            const isGif = !!msg.gifUrl;
            const currentKey = toDateKey(msg.createdAt);
            const prevKey =
              index > 0 ? toDateKey(messages[index - 1].createdAt) : null;
            const showDate = currentKey !== prevKey;

            // Read receipts logic
            const isLastMe = index === lastAnyMeIndex;
            // Filter out the sender themselves from the readBy list for count
            const uniqueReaders = (msg.readBy || []).filter(
              (r) => r.user && r.user._id !== user?._id,
            );
            // Hide if no one else read it yet
            const hasReaders = uniqueReaders.length > 0;

            return (
              <React.Fragment key={msg._id}>
                {showDate && (
                  <div className="flex items-center gap-3 my-2">
                    <div className="flex-1 h-px bg-white/5" />
                    <span className="text-[10px] font-mono text-ivory/20 px-3 py-1 rounded-full bg-white/4 border border-white/6 shrink-0">
                      {getDateLabel(msg.createdAt)}
                    </span>
                    <div className="flex-1 h-px bg-white/5" />
                  </div>
                )}

                <div
                  data-message-id={msg._id}
                  className="flex items-start gap-2.5 group"
                  onTouchStart={() => handleTouchStart(msg._id)}
                  onTouchEnd={handleTouchEnd}
                  onTouchMove={handleTouchEnd}
                >
                  {/* Sender avatar — always shown in modules */}
                  <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 mt-0.5 ring-1 ring-white/6">
                    <Image
                      src={
                        msg.sender?.avatar ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender?.name || "user"}`
                      }
                      width={32}
                      height={32}
                      className="rounded-xl"
                      alt={msg.sender?.name || ""}
                      unoptimized
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Sender name + timestamp */}
                    <div className="flex items-baseline gap-2 mb-1">
                      <span
                        className={`text-[13px] font-display font-bold leading-none ${isMe ? "text-accent/80" : "text-ivory/70"
                          }`}
                      >
                        {isMe ? "You" : msg.sender?.name || "Member"}
                      </span>
                      <span className="text-[10px] font-mono text-ivory/20">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {msg.isEdited && (
                        <span className="text-[9px] font-mono text-ivory/15">
                          (edited)
                        </span>
                      )}
                    </div>

                    {/* Message bubble */}
                    <div className="relative group/bubble">
                      {/* Action toolbar (hover / long-press) */}
                      {!msg.isOptimistic && !msg.isDeleted && (
                        <div
                          className={`absolute -top-7 left-0 items-center gap-0.5 bg-deep border border-white/6 rounded-lg p-0.5 shadow-xl z-30 ${longPressedMsgId === msg._id
                              ? "flex"
                              : "hidden group-hover/bubble:flex"
                            }`}
                        >
                          {/* Quick reactions */}
                          {["👍", "❤️", "😂", "😮", "😢"].map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                reactToMessage(msg._id, emoji);
                                setLongPressedMsgId(null);
                              }}
                              className={`p-1.5 rounded-md text-sm transition-all hover:bg-white/6 hover:scale-125 ${reactions[msg._id]?.[emoji]?.includes(user?._id)
                                  ? "bg-accent/20"
                                  : ""
                                }`}
                            >
                              {emoji}
                            </button>
                          ))}
                          <div className="w-px h-5 bg-white/6 mx-0.5" />
                          {/* Full emoji picker trigger */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setReactionPickerMsgId(
                                reactionPickerMsgId === msg._id
                                  ? null
                                  : msg._id,
                              );
                              setLongPressedMsgId(null);
                            }}
                            className="p-1.5 rounded-md text-ivory/40 hover:text-accent hover:bg-white/6 transition-all"
                            title="React"
                          >
                            <Smile size={14} />
                          </button>
                          {/* Thread Reply */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveThreadMessage(msg);
                              setLongPressedMsgId(null);
                            }}
                            className="p-1.5 rounded-md text-ivory/40 hover:text-accent hover:bg-white/6 transition-all"
                            title="Reply in thread"
                          >
                            <MessageSquare size={14} />
                          </button>
                          {/* Inline Reply */}
                          <button
                            type="button"
                            onClick={() => {
                              setReplyTo(msg);
                              setLongPressedMsgId(null);
                            }}
                            className="p-1.5 rounded-md text-ivory/40 hover:text-accent hover:bg-white/6 transition-all"
                            title="Quote reply"
                          >
                            <Reply size={14} />
                          </button>
                          {/* Edit / Delete (own messages only) */}
                          {isMe && (
                            <>
                              <div className="w-px h-5 bg-white/6 mx-0.5" />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingId(msg._id);
                                  setEditedText(msg.text || "");
                                  setLongPressedMsgId(null);
                                }}
                                className="p-1.5 rounded-md text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 transition-all"
                                title="Edit"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(msg._id);
                                  setLongPressedMsgId(null);
                                }}
                                className="p-1.5 rounded-md text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all"
                                title="Delete for everyone"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}

                          {/* Pin / Unpin (admin/owner only) */}
                          {isAdminOrOwner && (
                            <>
                              <div className="w-px h-5 bg-white/6 mx-0.5" />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  pinMessage(msg._id);
                                  setLongPressedMsgId(null);
                                }}
                                className={`p-1.5 rounded-md transition-all ${msg.isPinned ? "text-accent hover:text-accent hover:bg-white/6" : "text-ivory/40 hover:text-accent hover:bg-white/6"}`}
                                title={
                                  msg.isPinned ? "Unpin message" : "Pin message"
                                }
                              >
                                {msg.isPinned ? (
                                  <PinOff size={14} />
                                ) : (
                                  <Pin size={14} />
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      )}

                      {/* Full emoji reaction picker */}
                      {reactionPickerMsgId === msg._id && (
                        <div
                          ref={reactionPickerRef}
                          className="absolute top-6 left-0 z-40"
                        >
                          <EmojiPicker
                            onEmojiClick={(emojiData) => {
                              reactToMessage(msg._id, emojiData.emoji);
                              setReactionPickerMsgId(null);
                            }}
                            theme="dark"
                            height={340}
                            width={300}
                          />
                        </div>
                      )}

                      {/* Message content */}
                      {editingId === msg._id ? (
                        <div className="flex flex-col gap-2 bg-slate-surface rounded-2xl p-3 border border-accent/40 max-w-lg">
                          <span className="text-[10px] font-mono font-bold text-accent uppercase tracking-wider">
                            Editing
                          </span>
                          <textarea
                            className="w-full min-h-16 bg-deep text-ivory text-[13px] px-3 py-2 rounded-xl border border-white/8 focus:outline-none focus:border-accent resize-none scrollbar-hide"
                            value={editedText}
                            onChange={(e) => setEditedText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleEditSave();
                              }
                              if (e.key === "Escape") {
                                setEditingId(null);
                                setEditedText("");
                              }
                            }}
                            autoFocus
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => {
                                setEditingId(null);
                                setEditedText("");
                              }}
                              className="px-3 py-1.5 text-[11px] font-mono text-ivory/30 hover:text-ivory transition-colors rounded-lg hover:bg-white/4"
                            >
                              Cancel (Esc)
                            </button>
                            <button
                              onClick={handleEditSave}
                              className="px-3 py-1.5 text-[11px] font-mono text-accent bg-accent/10 hover:bg-accent/20 rounded-lg border border-accent/20 transition-all"
                            >
                              Save (Enter)
                            </button>
                          </div>
                        </div>
                      ) : msg.isDeleted ? (
                        <div className="flex items-center gap-2 p-2 px-3 bg-white/2 rounded-2xl border border-white/5 opacity-50 select-none w-fit">
                          <Trash2 className="w-3 h-3 text-ivory/30" />
                          <p className="italic text-ivory/40 text-[11px] font-mono leading-none">
                            Deleted
                          </p>
                        </div>
                      ) : isGif ? (
                        <div className="rounded-2xl overflow-hidden max-w-65">
                          <img
                            src={msg.gifUrl}
                            alt="gif"
                            className="w-full h-auto rounded-2xl"
                          />
                        </div>
                      ) : (
                        <div
                          className={`inline-block px-3.5 py-2.5 rounded-2xl rounded-tl-none text-[13px] leading-relaxed max-w-prose ${isMe
                              ? "bg-accent/15 text-ivory border border-accent/20"
                              : "bg-white/4 text-ivory/80 border border-white/6"
                            } ${msg.isOptimistic ? "opacity-60" : ""}`}
                        >
                          {msg.replyTo && (
                            <div className="mb-2 p-2 bg-black/20 rounded-lg border-l-2 border-accent/50 text-[11px] opacity-80 line-clamp-2">
                              <p className="font-bold mb-0.5 text-accent/70">
                                {msg.replyTo.sender?.name || "Member"}
                              </p>
                              {msg.replyTo.text || "Attachment"}
                            </div>
                          )}
                          {renderMessageText(
                            msg.text,
                            msg.mentions,
                            msg.mentionData,
                          )}
                          {msg.attachments?.length > 0 && (
                            <FileAttachmentDisplay
                              attachments={msg.attachments}
                            />
                          )}
                        </div>
                      )}

                      {/* Reply Count Indicator */}
                      {msg.replyCount > 0 && !msg.isDeleted && !editingId && (
                        <button
                          onClick={() => setActiveThreadMessage(msg)}
                          className="mt-1 flex items-center gap-1.5 px-2 py-1 rounded border border-transparent hover:border-accent/30 hover:bg-accent/10 text-[11px] font-bold text-accent/80 hover:text-accent transition-colors w-fit"
                        >
                          <MessageSquare size={12} />
                          {msg.replyCount}{" "}
                          {msg.replyCount === 1 ? "reply" : "replies"}
                          <span className="text-[9px] font-mono font-normal opacity-60 ml-0.5">
                            Last reply at{" "}
                            {new Date(msg.lastReplyAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </button>
                      )}

                      {/* Reaction pills */}
                      {reactions[msg._id] &&
                        Object.keys(reactions[msg._id]).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {Object.entries(reactions[msg._id])
                              .filter(([, users]) => users.length > 0)
                              .map(([emoji, users]) => (
                                <button
                                  key={emoji}
                                  onClick={() => reactToMessage(msg._id, emoji)}
                                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border transition-all ${users.some(
                                    (u) => String(u) === String(user?._id),
                                  )
                                      ? "bg-accent/20 border-accent/40 text-accent"
                                      : "bg-white/4 border-white/6 text-ivory/80 hover:bg-white/8"
                                    }`}
                                >
                                  <span className="text-[12px] leading-none">
                                    {emoji}
                                  </span>
                                  <span className="text-[9px] font-bold text-ivory/40">
                                    {users.length}
                                  </span>
                                </button>
                              ))}
                          </div>
                        )}

                      {/* Read Receipts (Shown only on the last message sent by the user) */}
                      {isMe && isLastMe && (
                        <div className="mt-1 relative flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (hasReaders) {
                                setShowSeenBy(
                                  showSeenBy === msg._id ? null : msg._id,
                                );
                              }
                            }}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold transition-all ${hasReaders
                                ? "bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 cursor-pointer"
                                : "bg-white/4 border border-white/5 text-ivory/30"
                              }`}
                          >
                            <CheckCheck
                              size={10}
                              className={
                                hasReaders ? "text-accent" : "text-ivory/30"
                              }
                            />
                            {hasReaders
                              ? `Seen by ${uniqueReaders.length}`
                              : "Sent"}
                          </button>

                          {/* Seen By Popover */}
                          {showSeenBy === msg._id && hasReaders && (
                            <div
                              data-seen-popover="true"
                              className="absolute z-50 top-full mt-1 left-0 w-48 bg-deep border border-white/10 rounded-xl shadow-2xl p-2 flex flex-col gap-1.5 max-h-48 overflow-y-auto scrollbar-hide"
                            >
                              <h4 className="text-[10px] font-mono font-bold text-ivory/40 px-1 uppercase tracking-wider mb-1">
                                Read by
                              </h4>
                              {uniqueReaders.map((r, i) => (
                                <div
                                  key={i}
                                  className="flex items-center justify-between px-1.5 py-1 rounded-lg hover:bg-white/4 min-w-0"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <Image
                                      src={
                                        r.user.avatar ||
                                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.user.name}`
                                      }
                                      width={16}
                                      height={16}
                                      alt=""
                                      className="rounded-full shrink-0"
                                      unoptimized
                                    />
                                    <span className="text-[11px] font-display font-medium text-ivory/80 truncate">
                                      {r.user.name}
                                    </span>
                                  </div>
                                  <span className="text-[9px] font-mono text-ivory/30 shrink-0 ml-2">
                                    {new Date(r.readAt).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          });
        })()}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 px-1">
            <div className="flex gap-0.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-accent/50 animate-bounce"
                  style={{ animationDelay: `${i * 120}ms` }}
                />
              ))}
            </div>
            <span className="text-[11px] font-mono text-ivory/25">
              {typingUsers.length === 1
                ? `${typingUsers[0].name} is typing...`
                : `${typingUsers.map((u) => u.name).join(", ")} are typing...`}
            </span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Reply Banner ──────────────────────────────────────────────────────── */}
      {replyTo && (
        <div className="mx-4 mb-1 px-3 py-2 bg-white/3 border border-white/6 rounded-xl flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-mono text-accent/70 font-bold mb-0.5">
              Replying to {replyTo.sender?.name || "Member"}
            </p>
            <p className="text-ivory/30 text-[11px] truncate">{replyTo.text}</p>
          </div>
          <button
            onClick={() => setReplyTo(null)}
            className="w-6 h-6 rounded-lg flex items-center justify-center text-ivory/20 hover:text-ivory/50 hover:bg-white/6 shrink-0 transition-all"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* ── Input Area ────────────────────────────────────────────────────────── */}
      {canType ? (
        <form
          onSubmit={handleSend}
          className="p-3 md:p-4 relative z-20 bg-obsidian/80 backdrop-blur-sm border-t border-white/5"
        >
          {/* Auto-complete suggestions */}
          {suggestions.length > 0 && (
            <div className="absolute bottom-full left-2 sm:left-10 bg-deep/95 backdrop-blur-md border border-white/6 rounded-xl p-1 shadow-2xl z-50 min-w-48 max-w-[calc(100vw-2rem)] mb-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
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
                      <span className="text-lg leading-none">
                        {suggestion.value}
                      </span>
                      <span className="text-xs font-mono">
                        {suggestion.key}
                      </span>
                    </>
                  ) : (
                    <>
                      <img
                        src={suggestion.user.avatar || "/avatar.png"}
                        alt={suggestion.value}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="text-sm font-medium">
                        {suggestion.value}
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div
              ref={emojiPickerRef}
              className="absolute bottom-20 right-0 sm:right-4 left-0 sm:left-auto z-50 shadow-2xl mx-2 sm:mx-0"
            >
              <EmojiPicker
                onEmojiClick={(data) => {
                  insertTextAtCursor(data.emoji);
                  setShowEmojiPicker(false);
                }}
                theme="dark"
                emojiStyle="native"
                width={350}
                height={380}
              />
            </div>
          )}

          {/* GIF Picker */}
          {showGifPicker && (
            <div
              ref={gifPickerRef}
              className="absolute bottom-20 right-0 sm:right-4 left-0 sm:left-auto z-50 shadow-2xl rounded-2xl overflow-hidden border border-white/6 mx-2 sm:mx-0"
            >
              <GifPicker
                onGifClick={handleGifClick}
                klipyApiKey={process.env.NEXT_PUBLIC_KLIPY_API_KEY}
                theme="dark"
                width={380}
                height={400}
              />
            </div>
          )}

          {showScheduledPanel && (
            <div className="mb-2 md:mb-3 p-2 md:p-3 rounded-2xl bg-slate-surface border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-ivory/80">
                  Scheduled messages
                </p>
                <button
                  type="button"
                  onClick={() => setShowScheduledPanel(false)}
                  className="text-ivory/30 hover:text-ivory/60"
                  aria-label="Close scheduled messages"
                  title="Close"
                >
                  <X size={16} />
                </button>
              </div>

              {loadingScheduled ? (
                <p className="text-xs text-ivory/30">Loading...</p>
              ) : scheduledItems.length === 0 ? (
                <p className="text-xs text-ivory/20">No scheduled messages</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {scheduledItems.map((s) => (
                    <div
                      key={s._id}
                      className="flex items-center justify-between gap-3 p-2 rounded-xl bg-black/20 border border-white/5"
                    >
                      <div className="min-w-0">
                        <p className="text-xs text-ivory/80 truncate">
                          {s.content}
                        </p>
                        <p className="text-[10px] text-ivory/30">
                          {new Date(s.sendAt).toLocaleString()} • {s.status}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onCancelScheduled(s._id)}
                        className="px-2 py-1 text-[10px] font-bold rounded-md border border-red-500/30 text-red-400 hover:bg-red-500/10"
                      >
                        Cancel
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Voice message recorder panel */}
          {showVoiceRecorder && (
            <div className="mb-2 px-1">
              <VoiceMessageRecorder onSend={handleVoiceSend} />
            </div>
          )}

          <FileAttachmentPreview
            files={stagedFiles}
            previews={filePreviews}
            progress={fileProgress}
            errors={fileErrors}
            uploading={fileUploading}
            onRemove={removeFile}
          />

          <div className="bg-slate-surface rounded-2xl flex items-center flex-wrap p-2 gap-1 border border-white/5 focus-within:border-accent/50 transition-all shadow-inner">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-8 md:w-9 h-8 md:h-9 flex items-center justify-center text-ivory/30 hover:text-accent transition-colors shrink-0"
              title="Upload files"
              aria-label="Upload files"
            >
              <Plus size={20} />
            </button>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                selectFiles(e.target.files);
                e.target.value = "";
              }}
            />

            <div className="flex-1 relative min-w-0">
              <div
                ref={inputRef}
                className="w-full bg-transparent outline-none text-xs md:text-sm caret-white px-2 md:px-3 py-2 placeholder:text-ivory/20 transition-colors relative z-10 border-none message-input-rich"
                contentEditable={canType}
                onInput={handleInput}
                onPaste={(e) => {
                  e.preventDefault();
                  const text = e.clipboardData.getData("text/plain");
                  insertTextAtCursor(text);
                }}
                onKeyDown={(e) => {
                  handleKeyDown(e);
                  if (e.key === "Enter" && !e.shiftKey && !suggestions.length) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                placeholder={
                  isAnnouncement
                    ? `Post an announcement in #${activeModule.name}...`
                    : `Message #${activeModule.name}`
                }
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setShowGifPicker((v) => !v);
                setShowEmojiPicker(false);
              }}
              className={`hidden lg:inline-flex px-2 py-1 mx-1 text-[10px] font-black rounded-md border transition-all ${showGifPicker
                  ? "bg-accent/20 border-accent/40 text-accent"
                  : "bg-white/4 border-white/10 text-ivory/30 hover:text-ivory/60"
                }`}
            >
              GIF
            </button>

            <button
              type="button"
              onClick={() => {
                setShowVoiceRecorder((v) => !v);
                setShowEmojiPicker(false);
                setShowGifPicker(false);
              }}
              className={`w-9 h-9 flex items-center justify-center transition-all ${showVoiceRecorder
                  ? "text-accent"
                  : "text-ivory/30 hover:text-ivory/60"
                }`}
              title="Voice message"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowEmojiPicker((v) => !v);
                setShowGifPicker(false);
              }}
              className={`w-8 md:w-9 h-8 md:h-9 flex items-center justify-center transition-all shrink-0 ${showEmojiPicker
                  ? "text-accent"
                  : "text-ivory/30 hover:text-ivory/60"
                }`}
              title="Emoji"
            >
              <Smile size={20} />
            </button>

            {/* AI Button - Desktop */}
            <div
              ref={aiMenuRefDesktop}
              className="relative hidden lg:inline-flex"
            >
              <button
                type="button"
                onClick={() => setAiMenuOpen((v) => !v)}
                title="AI tools"
                aria-label="AI tools"
                className={`inline-flex items-center gap-1 px-2 py-1 mx-1 text-[10px] font-black rounded-md border transition-all ${aiMenuOpen
                    ? "bg-accent/20 border-accent/40 text-accent"
                    : aiReplies.length > 0 || tonePickerOpen
                      ? "bg-accent/20 border-accent/40 text-accent"
                      : "bg-white/4 border-white/10 text-ivory/30 hover:bg-accent/10 hover:border-accent/30 hover:text-accent"
                  }`}
              >
                ✦ AI
              </button>
              {aiMenuOpen && (
                <div className="absolute bottom-full mb-1 right-0 w-44 bg-deep border border-white/10 rounded-lg shadow-lg overflow-hidden z-50">
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 text-[11px] text-ivory/70 hover:bg-white/6 hover:text-ivory transition-colors"
                    onClick={() => {
                      setAiMenuOpen(false);
                      handleAiButton();
                    }}
                  >
                    Reply suggestions
                  </button>
                  <button
                    type="button"
                    disabled={!text.trim()}
                    className={`w-full text-left px-3 py-2 text-[11px] transition-colors ${text.trim()
                        ? "text-ivory/70 hover:bg-white/6 hover:text-ivory"
                        : "text-ivory/20 opacity-40 cursor-not-allowed"
                      }`}
                    onClick={() => {
                      if (!text.trim()) return;
                      setAiMenuOpen(false);
                      setAiReplies([]);
                      setTonePickerOpen(true);
                    }}
                  >
                    Rewrite tone
                  </button>
                </div>
              )}
            </div>

            {/* Schedule Dropdown */}
            <div
              ref={scheduleDropdownRef}
              className="relative hidden lg:inline-flex"
            >
              <button
                type="button"
                onClick={() => setScheduleDropdownOpen((v) => !v)}
                className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${scheduleDropdownOpen
                    ? "bg-accent/20 text-accent"
                    : "text-ivory/30 hover:text-ivory/60"
                  }`}
                title="Schedule or view pending"
              >
                <Clock size={18} />
              </button>

              {scheduleDropdownOpen && (
                <div className="absolute bottom-full right-0 mb-2 w-56 bg-deep border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-ivory/40">
                      Schedule Message
                    </span>
                    <button
                      onClick={() => setScheduleDropdownOpen(false)}
                      className="text-ivory/20 hover:text-ivory transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-3 space-y-2">
                    {/* Schedule Option */}
                    <div>
                      <label className="text-[11px] font-mono text-ivory/50 mb-2 block">
                        Send at
                      </label>
                      <input
                        type="datetime-local"
                        value={sendAt}
                        min={formatLocalMin()}
                        onChange={(e) => setSendAt(e.target.value)}
                        className="w-full bg-white/4 border border-white/10 rounded-lg px-2.5 py-2 text-xs text-ivory/80 outline-none focus:border-accent/40 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          if (!sendAt) {
                            toast.error("Please select a date and time");
                            return;
                          }
                          await scheduleMessage();
                          setScheduleDropdownOpen(false);
                        }}
                        disabled={!sendAt || scheduling}
                        className="w-full mt-2 px-3 py-1.5 bg-accent/20 hover:bg-accent/30 disabled:opacity-50 disabled:cursor-not-allowed text-accent text-[11px] font-bold rounded-lg transition-all"
                      >
                        {scheduling ? "Scheduling..." : "Schedule"}
                      </button>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-white/5" />

                    {/* Pending Messages */}
                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          setShowScheduledPanel(true);
                          refreshScheduled();
                          setScheduleDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-semibold text-ivory/70 hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <Calendar size={14} className="text-accent/60" />
                        View Pending
                        {scheduledItems.length > 0 && (
                          <span className="ml-auto px-2 py-0.5 bg-accent/20 text-accent text-[10px] font-mono rounded">
                            {scheduledItems.length}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={
                scheduling ||
                fileUploading ||
                fileErrors.some((e) => e !== null) ||
                (!text.trim() && stagedFiles.length === 0)
              }
              title="Send"
              className={`w-9 h-9 flex items-center justify-center rounded-xl ml-1 transition-all active:scale-95 shadow-lg ${scheduling ||
                  fileUploading ||
                  fileErrors.some((e) => e !== null) ||
                  (!text.trim() && stagedFiles.length === 0)
                  ? "bg-slate-700 text-ivory/40 cursor-not-allowed opacity-50"
                  : "bg-accent hover:bg-accent/90 text-black shadow-accent/20"
                }`}
            >
              <Send size={18} />
            </button>

            {/* Mobile-only expanded toolbar row */}
            <div className="sm:hidden w-full flex items-center gap-1.5 pt-2 border-t border-white/5 mt-1 overflow-x-auto scrollbar-hide pb-1">
              <button
                type="button"
                onClick={() => {
                  setShowGifPicker(!showGifPicker);
                  setShowEmojiPicker(false);
                }}
                className={`shrink-0 px-2.5 py-1.5 text-[11px] font-black rounded-lg border transition-all ${showGifPicker
                  ? "bg-accent/20 border-accent/40 text-accent"
                  : "bg-white/4 border-white/10 text-ivory/50 hover:text-ivory"
                  }`}
              >
                GIF
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowVoiceRecorder((v) => !v);
                  setShowEmojiPicker(false);
                  setShowGifPicker(false);
                }}
                className={`px-2 py-1 text-[10px] font-black rounded-md border transition-all ${showVoiceRecorder
                    ? "bg-accent/20 border-accent/40 text-accent"
                    : "bg-white/4 border-white/10 text-ivory/30 hover:text-ivory/60"
                  }`}
              >
                🎙 Voice
              </button>

              {/* AI Button - Mobile */}
              <div ref={aiMenuRefMobile} className="relative inline-flex">
                <button
                  type="button"
                  onClick={() => setAiMenuOpen((v) => !v)}
                  title="AI tools"
                  aria-label="AI tools"
                  className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-black rounded-lg border transition-all ${aiMenuOpen
                      ? "bg-accent/20 border-accent/40 text-accent"
                      : aiReplies.length > 0 || tonePickerOpen
                        ? "bg-accent/20 border-accent/40 text-accent"
                        : "bg-white/4 border-white/10 text-ivory/50 hover:text-ivory"
                    }`}
                >
                  ✦ AI
                </button>
                {aiMenuOpen && (
                  <div className="absolute bottom-full mb-1 right-0 w-44 bg-deep border border-white/10 rounded-lg shadow-lg overflow-hidden z-50">
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2 text-[11px] text-ivory/70 hover:bg-white/6 hover:text-ivory transition-colors"
                      onClick={() => {
                        setAiMenuOpen(false);
                        handleAiButton();
                      }}
                    >
                      Reply suggestions
                    </button>
                    <button
                      type="button"
                      disabled={!text.trim()}
                      className={`w-full text-left px-3 py-2 text-[11px] transition-colors ${text.trim()
                          ? "text-ivory/70 hover:bg-white/6 hover:text-ivory"
                          : "text-ivory/20 opacity-40 cursor-not-allowed"
                        }`}
                      onClick={() => {
                        if (!text.trim()) return;
                        setAiMenuOpen(false);
                        setAiReplies([]);
                        setTonePickerOpen(true);
                      }}
                    >
                      Rewrite tone
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setScheduleDropdownOpen((v) => !v)}
                className={`mobile-schedule-trigger shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-black rounded-lg border transition-all ${scheduleDropdownOpen
                  ? "bg-accent/20 border-accent/40 text-accent"
                  : "bg-white/4 border-white/10 text-ivory/50 hover:text-ivory"
                  }`}
                title="Schedule or view pending"
              >
                ⏱ Schedule
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mx-3 mb-3 px-4 py-3 bg-white/3 border border-white/6 rounded-2xl text-center">
          <p className="text-ivory/20 text-[12px] font-mono">
            Only admins and owners can post in announcement modules
          </p>
        </div>
      )}

      {/* Thread Panel */}
      {activeThreadMessage && (
        <ThreadPanel
          moduleId={moduleId}
          workspaceId={workspaceId}
          workspace={workspace}
          parentMessage={activeThreadMessage}
          onClose={() => setActiveThreadMessage(null)}
        />
      )}

      {/* Pinned Messages Panel */}
      {showPinnedPanel && (
        <PinnedMessagesPanel
          moduleId={moduleId}
          workspaceId={workspaceId}
          workspace={workspace}
          onClose={() => setShowPinnedPanel(false)}
          onJumpToMessage={handleJumpToMessage}
        />
      )}

      {/* Search Panel */}
      {showSearchPanel && (
        <ModuleSearchPanel
          moduleId={moduleId}
          workspace={workspace}
          onClose={() => setShowSearchPanel(false)}
          onJumpToMessage={handleJumpToMessage}
        />
      )}
    </main>
  );
}
