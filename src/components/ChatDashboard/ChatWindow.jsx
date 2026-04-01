"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Phone,
  Video,
  Info,
  Smile,
  Send,
  X,
  Reply,
  Pencil,
  Trash2,
  Check,
  Menu,
  Clock,
  Calendar,
  Trash,
  Paperclip,
  ExternalLink,
} from "lucide-react";
import api from "@/app/api/Axios";
import { useSocket } from "@/hooks/useSocket";
import useAuth from "@/hooks/useAuth";
import { useCall } from "@/hooks/useCall";
import { useRouter } from "next/navigation";
import { useDmPrefs } from "@/hooks/useDmPrefs";
import { EMOJI_MAP } from "@/utils/emojis";
import { formatLastSeen } from "@/utils/formatLastSeen";
import CreatePollModal from "../CreatePollModal";
import PollMessage from "../PollMessage";
import { getGroupInitials, getGroupAvatarColor } from "@/utils/groupAvatar";
import toast from "react-hot-toast";
import { useFileUpload } from "@/hooks/useFileUpload";
import FileAttachmentPreview from "@/components/shared/FileAttachmentPreview";
import FileAttachmentDisplay from "@/components/shared/FileAttachmentDisplay";
import PinIcon from "../icons/PinIcon";
import "@/components/workspace/Mention.css";
import ReadReceipts from "../ReadReceipts";
import CallLogMessage from "@/components/calls/CallLogMessage";
import VoiceMessageRecorder from "@/components/calls/VoiceMessageRecorder";

import {
  createScheduledMessage,
  listScheduledMessages,
  cancelScheduledMessage,
} from "@/utils/scheduleApi";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

function parseSharedPost(text) {
  if (!text || typeof text !== "string") return null;
  const shareBlockStart = text.indexOf("📎 *Shared a ");
  if (shareBlockStart === -1) return null;
  const urlMatch = text.match(
    /https?:\/\/[^\s]+\/app\/feed\?post=([a-zA-Z0-9]+)/,
  );
  if (!urlMatch) return null;
  const postId = urlMatch[1];
  const url = urlMatch[0];
  const prefix =
    shareBlockStart > 0 ? text.slice(0, shareBlockStart).trim() : "";
  const typeMatch = text.match(/📎 \*Shared a ([^*]+)\*/);
  const type = typeMatch ? typeMatch[1].trim() : "post";
  const titleMatch = text.match(/\*\*([^*]+)\*\*/);
  const title = titleMatch ? titleMatch[1].trim() : "";
  const authorMatch = text.match(/\nby (.+)\n/);
  const author = authorMatch ? authorMatch[1].trim() : "";
  return { type, title, author, postId, url, prefix };
}

function SharedPostCard({ parsed, isMe }) {
  const router = useRouter();
  const handleClick = () => router.push(`/app/feed?post=${parsed.postId}`);
  return (
    <div className="flex flex-col gap-1.5">
      {parsed.prefix && (
        <p className="text-[13px] leading-relaxed">{parsed.prefix}</p>
      )}
      <button
        type="button"
        onClick={handleClick}
        className={`text-left w-full max-w-[280px] rounded-2xl border transition-all hover:scale-[1.02] active:scale-[0.98] p-4 flex flex-col gap-2 group shadow-sm
          ${
            isMe
              ? "bg-accent/10 border-accent/20 hover:bg-accent/15"
              : "bg-white/[0.04] border-white/10 hover:border-accent/40 hover:bg-white/[0.08]"
          }`}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider opacity-50">
            📎 Shared {parsed.type}
          </span>
          <ExternalLink
            size={9}
            className="opacity-40 group-hover:opacity-70 transition-opacity ml-auto shrink-0"
          />
        </div>
        {parsed.title && (
          <p className="text-[12px] font-semibold leading-snug line-clamp-2 opacity-90">
            {parsed.title}
          </p>
        )}
        {parsed.author && (
          <p className="text-[10px] font-mono opacity-40">by {parsed.author}</p>
        )}
        <p className="text-[11px] font-bold mt-1 tracking-wide text-accent/80 group-hover:text-accent group-hover:underline transition-colors">
          View post →
        </p>
      </button>
    </div>
  );
}

const GifPicker = dynamic(
  () =>
    import("gif-picker-react-klipy").then((m) => m.GifPicker || m.default || m),
  { ssr: false },
);

const getDateLabel = (dateStr) => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";
  return date.toLocaleDateString([], {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const toDateKey = (dateStr) => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

export default function ChatWindow({
  conversation,
  onMessageSent,
  onMessagesSeen,
  showGroupInfo,
  onToggleGroupInfo,
  showDmInfo,
  onToggleDmInfo,
  onConversationUpdate,
  toggleSidebar,
  toggleWorkspace,
}) {
  const { socket, onlineUsers, typingUsers } = useSocket() || {};
  const { user } = useAuth();
  const { startCall } = useCall();

  const handleStartCall = useCallback(
    async (callType) => {
      try {
        const { data } = await api.post("/api/calls/initiate", {
          conversationId: conversation._id,
          callType,
        });
        startCall({ ...data, callType, pending: true });
      } catch (err) {
        toast.error(err?.response?.data?.error || "Failed to start call");
      }
    },
    [conversation._id, startCall],
  );
  const router = useRouter();

  const _isDm = conversation?.type !== "group";
  const { prefs: dmPrefs } = useDmPrefs(conversation);
  const dmColor = dmPrefs.color || "#00d3bb";
  const dmEmoji = dmPrefs.emoji || "👍";
  const dmNickname = _isDm ? dmPrefs.nickname?.trim() : null;

  if (!conversation) {
    return (
      <div className="flex flex-1 items-center justify-center h-full text-gray-400">
        Select a conversation to start chatting
      </div>
    );
  }

  const isGroup = conversation.type === "group";
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [replyTo, setReplyTo] = useState(null);

  const [reactions, setReactions] = useState({});
  const [reactionPickerMsgId, setReactionPickerMsgId] = useState(null);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);

  const [suggestions, setSuggestions] = useState([]);
  const [suggestionIndex, setSuggestionIndex] = useState(0);

  const [aiReplies, setAiReplies] = useState([]);
  const [loadingAiReplies, setLoadingAiReplies] = useState(false);
  const lastAiRepliesForMsgRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);
  const userScrolledUpRef = useRef(false);
  const scrollContainerRef = useRef(null);

  const [showCreatePoll, setShowCreatePoll] = useState(false);

  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [showPinnedDrawer, setShowPinnedDrawer] = useState(false);
  const [loadingPins, setLoadingPins] = useState(false);

  const [aiMenuOpen, setAiMenuOpen] = useState(false);
  const [tonePickerOpen, setTonePickerOpen] = useState(false);
  const [selectedTone, setSelectedTone] = useState("");
  const [customTone, setCustomTone] = useState("");
  const [loadingRewrite, setLoadingRewrite] = useState(false);
  const [rewritePreview, setRewritePreview] = useState(null);
  const [originalText, setOriginalText] = useState("");
  const aiMenuRefDesktop = useRef(null);
  const aiMenuRefMobile = useRef(null);

  // Scheduled messages UI — clock dropdown only (no PENDING/SCHEDULE buttons)
  const [scheduleDropdownOpen, setScheduleDropdownOpen] = useState(false);
  const [sendAt, setSendAt] = useState("");
  const [scheduling, setScheduling] = useState(false);
  const [scheduledItems, setScheduledItems] = useState([]);
  const [showScheduledPanel, setShowScheduledPanel] = useState(false);
  const [loadingScheduled, setLoadingScheduled] = useState(false);
  const scheduleDropdownRef = useRef(null);
  const scheduleMobileTriggerRef = useRef(null);

  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editedText, setEditedText] = useState("");

  const [longPressedMsgId, setLongPressedMsgId] = useState(null);
  const longPressTimerRef = useRef(null);

  const inputRef = useRef(null);

  const handleTouchStart = useCallback((msgId) => {
    longPressTimerRef.current = setTimeout(() => {
      setLongPressedMsgId(msgId);
      if (navigator.vibrate) navigator.vibrate(30);
    }, 500);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
  }, []);

  const bottomRef = useRef(null);
  const reactionPickerRef = useRef(null);
  const inputEmojiPickerRef = useRef(null);
  const gifPickerRef = useRef(null);
  const seenInitializedConversationRef = useRef(null);

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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        reactionPickerRef.current &&
        !reactionPickerRef.current.contains(e.target)
      ) {
        setReactionPickerMsgId(null);
      }
      if (longPressedMsgId) {
        setLongPressedMsgId(null);
      }
      if (
        inputEmojiPickerRef.current &&
        !inputEmojiPickerRef.current.contains(e.target)
      ) {
        setShowEmojiPicker(false);
      }
      if (gifPickerRef.current && !gifPickerRef.current.contains(e.target)) {
        setShowGifPicker(false);
      }
      const outsideDesktop =
        !aiMenuRefDesktop.current ||
        !aiMenuRefDesktop.current.contains(e.target);
      const outsideMobile =
        !aiMenuRefMobile.current || !aiMenuRefMobile.current.contains(e.target);
      if (aiMenuOpen && outsideDesktop && outsideMobile) {
        setAiMenuOpen(false);
      }
      const outsideScheduleDesktop =
        !scheduleDropdownRef.current ||
        !scheduleDropdownRef.current.contains(e.target);
      const outsideScheduleMobile =
        !scheduleMobileTriggerRef.current ||
        !scheduleMobileTriggerRef.current.contains(e.target);
      if (
        scheduleDropdownOpen &&
        outsideScheduleDesktop &&
        outsideScheduleMobile
      ) {
        setScheduleDropdownOpen(false);
      }
    };

    if (
      reactionPickerMsgId ||
      showEmojiPicker ||
      showGifPicker ||
      aiMenuOpen ||
      scheduleDropdownOpen
    ) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [
    reactionPickerMsgId,
    showEmojiPicker,
    showGifPicker,
    aiMenuOpen,
    scheduleDropdownOpen,
  ]);

  const handleEmojiClick = (emojiData) => {
    insertTextAtCursor(emojiData.emoji);
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

  const renderMessageText = (text, mentions, mentionData = []) => {
    if (!text) return null;
    if (!mentions || mentions.length === 0) return text;
    const participants = conversation.participants || [];
    const resolvedMentions = mentions
      .map((m) => {
        const id = typeof m === "object" ? m._id || m.id : m;
        const participant = participants.find(
          (p) => String(p._id) === String(id),
        );
        const smuggled = (mentionData || []).find(
          (d) => String(d.id || d._id) === String(id),
        );
        const name =
          (typeof m === "object" ? m.name : null) ||
          smuggled?.name ||
          participant?.name;
        const avatar =
          (typeof m === "object" ? m.avatar : null) ||
          smuggled?.avatar ||
          participant?.avatar;
        return { id, name, avatar, participant };
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
    }
  };

  const insertEmoji = (emoji) => {
    if (!inputRef.current) return;
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    const textNode = range.startContainer;
    if (textNode.nodeType !== Node.TEXT_NODE) return;
    const content = textNode.textContent;
    const offset = range.startOffset;
    const textBefore = content.slice(0, offset);
    const emojiMatch = textBefore.match(/:([a-zA-Z0-9_]*)$/);
    if (emojiMatch) {
      const start = emojiMatch.index;
      range.setStart(textNode, start);
      range.deleteContents();
      const emojiNode = document.createTextNode(emoji);
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
      insertEmoji(suggestion.value);
    } else if (suggestion.type === "mention") {
      insertMention(suggestion);
    }
  };

  const handleInput = (e) => {
    const el = e.currentTarget;
    const parsed = parseMessage(el);
    const val = parsed.text;
    setText(val);
    if (socket && conversation) {
      const isGrp = conversation.type === "group";
      if (val.trim()) {
        socket.emit("typing:start", {
          conversationId: conversation._id,
          ...(isGrp ? {} : { receiverId: conversation.participant?._id }),
        });
      } else {
        socket.emit("typing:stop", {
          conversationId: conversation._id,
          ...(isGrp ? {} : { receiverId: conversation.participant?._id }),
        });
      }
    }
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
    const emojiMatch = textBeforeCursor.match(/:([a-zA-Z0-9_]*)$/);
    if (emojiMatch) {
      const query = emojiMatch[1].toLowerCase();
      const filtered = Object.entries(EMOJI_MAP).filter(([code]) => {
        const name = code.slice(1, -1);
        return (
          name.startsWith(query) ||
          name.split("_").some((w) => w.startsWith(query))
        );
      });
      if (filtered.length > 0) {
        setSuggestions(filtered);
        setSuggestionIndex(0);
        return;
      }
    }
    const mentionMatch = textBeforeCursor.match(/@([a-zA-Z0-9_\s]*)$/);
    if (mentionMatch) {
      const query = mentionMatch[1].toLowerCase();
      const participants = conversation.participants || [];
      const currentMentions = parsed.mentions.map((m) =>
        typeof m === "object" ? m.id : m,
      );
      const filtered = participants
        .filter(
          (p) =>
            p._id.toString() !== user?._id?.toString() &&
            !currentMentions.includes(p._id.toString()) &&
            p.name.toLowerCase().startsWith(query),
        )
        .map((p) => ({ type: "mention", key: p._id, value: p.name, user: p }))
        .slice(0, 10);
      if (filtered.length > 0) {
        setSuggestions(filtered);
        setSuggestionIndex(0);
        return;
      }
    }
    setSuggestions([]);
  };

  const handleKeyDown = (e) => {
    if (suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSuggestionIndex((prev) => (prev + 1) % suggestions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSuggestionIndex(
          (prev) => (prev - 1 + suggestions.length) % suggestions.length,
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

  useEffect(() => {
    if (!conversation?._id) return;
    const fetchPinnedMessages = async () => {
      setLoadingPins(true);
      try {
        const res = await api.get(
          `/api/chat/conversations/${conversation._id}/pins`,
        );
        setPinnedMessages(res.data.pinnedMessages || []);
      } catch (err) {
        console.error("Failed to fetch pinned messages:", err);
      } finally {
        setLoadingPins(false);
      }
    };
    fetchPinnedMessages();
  }, [conversation?._id]);

  const toggleReaction = useCallback(
    (msgId, emoji) => {
      if (!socket || !conversation?._id) return;
      socket.emit("message:react", {
        messageId: msgId,
        conversationId: conversation._id,
        emoji,
      });
    },
    [socket, conversation?._id],
  );

  const handleGifClick = (gif) => {
    if (!socket || !conversation) return;
    const tempId = `temp-${Date.now()}`;
    const gifUrl = gif.url || gif.previewUrl;
    const optimistic = {
      _id: tempId,
      conversationId: conversation._id,
      sender: { _id: user?._id, name: user?.name },
      gifUrl,
      createdAt: new Date().toISOString(),
      status: "sent",
      isOptimistic: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    setShowGifPicker(false);
    socket.emit("message:send", {
      conversationId: conversation._id,
      ...(conversation.type !== "group"
        ? { receiverId: conversation.participant?._id }
        : {}),
      gifUrl,
      tempId,
    });
    onMessageSent?.(conversation._id, null, gifUrl);
  };

  const handleVoiceSend = useCallback(
    (attachment) => {
      if (!socket || !conversation) return;
      const tempId = `temp-${Date.now()}`;
      const optimistic = {
        _id: tempId,
        conversationId: conversation._id,
        sender: { _id: user?._id, name: user?.name },
        attachments: [attachment],
        createdAt: new Date().toISOString(),
        status: "sent",
        isOptimistic: true,
      };
      setMessages((prev) => [...prev, optimistic]);
      setShowVoiceRecorder(false);
      socket.emit(
        "message:send",
        {
          conversationId: conversation._id,
          ...(conversation.type !== "group"
            ? { receiverId: conversation.participant?._id }
            : {}),
          attachments: [attachment],
          tempId,
        },
        (response) => {
          if (response?.success && response?.message) {
            setMessages((prev) =>
              prev.map((m) => (m._id === tempId ? response.message : m)),
            );
          }
        },
      );
      onMessageSent?.(conversation._id, null, null, [attachment]);
    },
    [socket, conversation, user, onMessageSent],
  );

  const handleEdit = (messageId, currentText) => {
    setEditingMessageId(messageId);
    setEditedText(typeof currentText === "string" ? currentText : "");
  };

  const handleEditSave = () => {
    if (!editedText.trim() || !socket || !conversation) return;
    socket.emit("message:edit", {
      messageId: editingMessageId,
      conversationId: conversation._id,
      newText: editedText.trim(),
    });
    setEditingMessageId(null);
    setEditedText("");
  };

  const handleDelete = (messageId) => {
    if (!socket || !conversation) return;
    socket.emit("message:delete", {
      messageId,
      conversationId: conversation._id,
    });
  };

  useEffect(() => {
    if (!conversation?._id) return;
    const fetchMessages = async () => {
      setLoadingMessages(true);
      setMessages([]);
      setReactions({});
      setEditingMessageId(null);
      setEditedText("");
      setReplyTo(null);
      setLongPressedMsgId(null);
      setShowScheduledPanel(false);
      setAiReplies([]);
      lastAiRepliesForMsgRef.current = null;
      setAiMenuOpen(false);
      setTonePickerOpen(false);
      setSelectedTone("");
      setCustomTone("");
      setLoadingRewrite(false);
      setRewritePreview(null);
      setOriginalText("");
      resetFiles();
      try {
        const res = await api.get(`/api/chat/messages/${conversation._id}`);
        setMessages(res.data || []);
        const rxns = {};
        for (const msg of res.data || []) {
          if (msg.reactions && typeof msg.reactions === "object") {
            const entries =
              msg.reactions instanceof Map
                ? Object.fromEntries(msg.reactions)
                : msg.reactions;
            if (Object.keys(entries).length > 0) rxns[msg._id] = entries;
          }
        }
        setReactions(rxns);
        seenInitializedConversationRef.current = null;
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [conversation?._id]);

  useEffect(() => {
    if (!socket || !conversation?._id) return;
    socket.emit("conversation:join", conversation._id);
    return () => socket.emit("conversation:leave", conversation._id);
  }, [socket, conversation?._id]);

  useEffect(() => {
    if (!socket || !user || !conversation?._id || loadingMessages) return;
    if (seenInitializedConversationRef.current === conversation._id) return;
    const lastUnreadMsg = [...messages]
      .reverse()
      .find((msg) => msg.sender?._id !== user._id && msg.status !== "read");
    if (lastUnreadMsg) {
      socket.emit("conversation:seen", {
        conversationId: conversation._id,
        lastSeenMessageId: lastUnreadMsg._id,
      });
      onMessagesSeen?.(conversation._id);
    }
    seenInitializedConversationRef.current = conversation._id;
  }, [
    socket,
    user,
    conversation?._id,
    loadingMessages,
    messages,
    onMessagesSeen,
  ]);

  useEffect(() => {
    if (!socket) return;

    const handlePinned = ({ conversationId: cId, pinnedMessages: pins }) => {
      if (cId !== conversation?._id) return;
      setPinnedMessages(pins || []);
    };
    const handleUnpinned = ({ conversationId: cId, pinnedMessages: pins }) => {
      if (cId !== conversation?._id) return;
      setPinnedMessages(pins || []);
    };
    const handleReceive = (msg) => {
      if (msg.conversationId !== conversation?._id) return;
      setMessages((prev) => {
        const alreadyExists = prev.some((m) => m._id === msg._id);
        if (alreadyExists) return prev;
        let optimisticIndex = prev.findIndex(
          (m) => m._id === msg.tempId || (m.tempId && m.tempId === msg.tempId),
        );
        if (
          optimisticIndex === -1 &&
          String(msg.sender?._id) === String(user?._id)
        ) {
          optimisticIndex = prev.findIndex(
            (m) =>
              m.isOptimistic &&
              m.text === msg.text &&
              !prev.some((other) => other._id === msg._id),
          );
        }
        if (optimisticIndex !== -1) {
          const updated = [...prev];
          updated[optimisticIndex] = {
            ...msg,
            mentionData:
              msg.mentionData || updated[optimisticIndex].mentionData,
          };
          return updated;
        }
        return [...prev, msg];
      });
      if (msg.sender?._id !== user?._id) {
        socket.emit("conversation:seen", {
          conversationId: conversation._id,
          lastSeenMessageId: msg._id,
        });
        onMessagesSeen?.(conversation._id);
      }
    };
    const handleDelivered = (update) => {
      if (update.conversationId !== conversation?._id) return;
      setMessages((prev) =>
        prev.map((m) => {
          if (update.messageId && m._id === update.messageId)
            return { ...m, status: update.status };
          if (
            update.status === "read" &&
            m.sender?._id === user?._id &&
            m.status !== "read" &&
            m._id <= update.upToMessageId
          ) {
            return { ...m, status: "read" };
          }
          return m;
        }),
      );
    };
    const handlePollUpdated = ({ messageId, poll }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, poll } : m)),
      );
    };
    const handleReacted = ({
      messageId,
      conversationId: cId,
      reactions: rxns,
    }) => {
      if (cId !== conversation?._id) return;
      setReactions((prev) => ({ ...prev, [messageId]: rxns }));
    };
    const handleEdited = (updatedMsg) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === updatedMsg._id ? { ...m, ...updatedMsg } : m,
        ),
      );
    };
    const handleReadReceipt = ({ messageId, reader }) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m._id === messageId) {
            const updated = { ...m };
            if (!updated.readBy) updated.readBy = [];
            const exists = updated.readBy.some(
              (r) => (r.user?._id || r.user) === reader._id,
            );
            if (!exists) {
              updated.readBy.push({
                user: {
                  _id: reader._id,
                  name: reader.name,
                  avatar: reader.avatar,
                },
                readAt: reader.readAt,
              });
            }
            return updated;
          }
          return m;
        }),
      );
    };
    const handleBulkRead = ({ conversationId, messageIds, reader }) => {
      if (conversationId !== conversation?._id) return;
      if (!reader || !reader._id) return;
      setMessages((prev) =>
        prev.map((m) => {
          if (messageIds.includes(m._id)) {
            const updated = { ...m };
            if (!updated.readBy) updated.readBy = [];
            const exists = updated.readBy.some(
              (r) => (r.user?._id || r.user) === reader._id,
            );
            if (!exists) {
              updated.readBy.push({
                user: {
                  _id: reader._id,
                  name: reader.name || "Unknown",
                  avatar: reader.avatar || null,
                },
                readAt: reader.readAt,
              });
            }
            return updated;
          }
          return m;
        }),
      );
    };
    const handleDeleted = ({ messageId }) => {
      if (!messageId) return;
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId ? { ...m, isDeleted: true, text: m.text } : m,
        ),
      );
    };

    // Append call log message in real time.
    // Backend may emit via:
    //   - message:new with callLog field populated  → has _id + callLog
    //   - call:log with full message object         → has _id + callLog
    //   - call:ended / call:declined / call:missed  → may only have { callId, conversationId }
    const handleCallLog = async (payload) => {
      if (!payload) return;
      // Case 1: full message object emitted (has _id)
      if (payload._id && payload.conversationId === conversation?._id) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === payload._id)) return prev;
          return [...prev, payload];
        });
        return;
      }
      // Case 2: minimal payload { callId, conversationId } — fetch latest messages
      const convId = payload.conversationId || payload.callId;
      if (!convId) return;
      // Re-fetch last few messages to pick up the new call log entry
      try {
        const res = await api.get(`/api/chat/messages/${conversation._id}`);
        const fresh = res.data || [];
        setMessages((prev) => {
          // Merge: keep existing, append any new ones from server
          const existingIds = new Set(prev.map((m) => m._id));
          const newMsgs = fresh.filter((m) => !existingIds.has(m._id));
          return newMsgs.length > 0 ? [...prev, ...newMsgs] : prev;
        });
      } catch (err) {
        console.error("[call log] failed to refetch messages:", err);
      }
    };

    socket.on("message:new", handleReceive);
    socket.on("message:status", handleDelivered);
    socket.on("message:reacted", handleReacted);
    socket.on("message:edited", handleEdited);
    socket.on("message:deleted", handleDeleted);
    socket.on("message:pinned", handlePinned);
    socket.on("message:unpinned", handleUnpinned);
    socket.on("poll:updated", handlePollUpdated);
    socket.on("message:read-receipt", handleReadReceipt);
    socket.on("messages:bulk-read", handleBulkRead);
    // Listen on all possible call log event names the backend may emit
    socket.on("call:log", handleCallLog);
    socket.on("call:ended", handleCallLog);
    socket.on("call:declined", handleCallLog);
    socket.on("call:missed", handleCallLog);

    return () => {
      socket.off("message:new", handleReceive);
      socket.off("message:status", handleDelivered);
      socket.off("message:reacted", handleReacted);
      socket.off("message:edited", handleEdited);
      socket.off("message:deleted", handleDeleted);
      socket.off("message:pinned", handlePinned);
      socket.off("message:unpinned", handleUnpinned);
      socket.off("poll:updated", handlePollUpdated);
      socket.off("message:read-receipt", handleReadReceipt);
      socket.off("messages:bulk-read", handleBulkRead);
      socket.off("call:log", handleCallLog);
      socket.off("call:ended", handleCallLog);
      socket.off("call:declined", handleCallLog);
      socket.off("call:missed", handleCallLog);
    };
  }, [socket, conversation?._id, user?._id, onMessagesSeen]);

  useEffect(() => {
    const handleScroll = (e) => {
      const container = e.target;
      const isAtBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        100;
      userScrolledUpRef.current = !isAtBottom;
    };
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer)
      scrollContainer.addEventListener("scroll", handleScroll);
    return () => {
      if (scrollContainer)
        scrollContainer.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const isNewMessage = messages.length > prevMessagesLengthRef.current;
    if (isNewMessage && !userScrolledUpRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages]);

  const fetchAiReplies = useCallback(
    async (messagesList) => {
      const visible = messagesList
        .filter((m) => !m.isOptimistic && !m.isDeleted && m.text?.trim())
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

  const refreshScheduled = useCallback(async () => {
    if (!conversation?._id) return;
    setLoadingScheduled(true);
    try {
      const data = await listScheduledMessages({
        conversationId: conversation._id,
      });
      setScheduledItems(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to load scheduled messages",
      );
    } finally {
      setLoadingScheduled(false);
    }
  }, [conversation?._id]);

  useEffect(() => {
    if (!conversation?._id) return;
    refreshScheduled();
  }, [conversation?._id, refreshScheduled]);

  const handleAiButton = useCallback(() => {
    const visible = messages.filter(
      (m) => !m.isOptimistic && !m.isDeleted && m.text?.trim(),
    );
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

  const onCancelScheduled = async (id) => {
    try {
      await cancelScheduledMessage({ scheduledId: id });
      toast.success("Scheduled message cancelled");
      refreshScheduled();
    } catch (err) {
      toast.error(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to cancel scheduled message",
      );
    }
  };

  useEffect(() => {
    if (!isGroup || !conversation?._id || !socket) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const toMark = [];
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const messageId = entry.target.dataset.messageId;
            const senderId = entry.target.dataset.senderId;
            if (senderId !== user?._id) toMark.push(messageId);
          }
        });
        if (toMark.length > 0) {
          api
            .post(
              `/api/chat/conversations/${conversation._id}/messages/read-bulk`,
              { messageIds: toMark },
            )
            .catch((err) => console.error("Bulk mark read error:", err));
        }
      },
      { threshold: 0.5 },
    );
    const messageElements = document.querySelectorAll("[data-message-id]");
    messageElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [messages, conversation?._id, user?._id, isGroup, socket]);

  const scheduleMessage = async () => {
    setAiMenuOpen(false);
    setTonePickerOpen(false);
    setSelectedTone("");
    setCustomTone("");
    setLoadingRewrite(false);
    setRewritePreview(null);
    setOriginalText("");
    if (!text.trim() || !conversation?._id) return;
    if (!sendAt) {
      toast.error("Select schedule date & time");
      return;
    }
    const dt = new Date(sendAt);
    if (isNaN(dt.getTime())) {
      toast.error("Invalid schedule date/time");
      return;
    }
    if (dt.getTime() <= Date.now()) {
      toast.error("Scheduled time must be in the future");
      return;
    }
    try {
      setScheduling(true);
      await createScheduledMessage({
        conversationId: conversation._id,
        content: text.trim(),
        sendAt: dt.toISOString(),
      });
      setText("");
      setSendAt("");
      setSuggestions([]);
      setReplyTo(null);
      if (inputRef.current) inputRef.current.innerHTML = "";
      onMessageSent?.(conversation._id, "SCHEDULED");
      toast.success("✅ Message scheduled!");
      setShowScheduledPanel(true);
      refreshScheduled();
    } catch (err) {
      toast.error(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to schedule",
      );
    } finally {
      setScheduling(false);
    }
  };

  const handlePinMessage = async (messageId) => {
    if (!conversation?._id) return;
    try {
      await api.post(
        `/api/chat/conversations/${conversation._id}/messages/${messageId}/pin`,
      );
      toast.success("📌 Message pinned");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to pin message");
    }
  };

  const handleUnpinMessage = async (messageId) => {
    if (!conversation?._id) return;
    try {
      await api.delete(
        `/api/chat/conversations/${conversation._id}/messages/${messageId}/pin`,
      );
      toast.success("Message unpinned");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to unpin message");
    }
  };

  const handlePollCreated = (pollMessage) => {
    setMessages((prev) => {
      const alreadyExists = prev.some((m) => m._id === pollMessage._id);
      if (alreadyExists) return prev;
      return [...prev, pollMessage];
    });
    setShowCreatePoll(false);
  };

  useEffect(() => {
    setMessages((prev) => {
      const seen = new Set();
      return prev.filter((msg) => {
        if (seen.has(msg._id)) return false;
        seen.add(msg._id);
        return true;
      });
    });
  }, [conversation?._id]);

  const handleSendQuickEmoji = () => {
    if (!conversation || !socket || fileUploading) return;
    const tempId = `temp-${Date.now()}`;
    const mappedEmoji = Array.from(dmEmoji)
      .map((c) => EMOJI_MAP[c] || c)
      .join("");
    const optimistic = {
      _id: tempId,
      conversationId: conversation._id,
      sender: { _id: user?._id, name: user?.name },
      text: mappedEmoji,
      mentions: [],
      mentionData: [],
      attachments: [],
      createdAt: new Date().toISOString(),
      status: "sending",
      isOptimistic: true,
      replyTo,
    };
    setMessages((prev) => [...prev, optimistic]);
    setReplyTo(null);
    const isGrp = conversation.type === "group";
    socket.emit(
      "message:send",
      {
        conversationId: conversation._id,
        ...(isGrp ? {} : { receiverId: conversation.participant?._id }),
        text: mappedEmoji,
        mentions: [],
        mentionData: [],
        tempId,
        replyTo: replyTo?._id || null,
        attachments: [],
      },
      (response) => {
        if (response?.success && response?.message) {
          setMessages((prev) =>
            prev.map((m) => (m._id === tempId ? response.message : m)),
          );
        }
      },
    );
    onMessageSent?.(conversation._id, mappedEmoji, null, conversation.type);
  };

  const handleSend = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const hasContent = (inputRef.current?.textContent?.trim().length || 0) > 0;
    const hasFiles = stagedFiles.length > 0;
    if (!hasContent && !hasFiles) return;
    if (!conversation || !socket) return;
    if (fileUploading) return;
    const parsed = parseMessage(inputRef.current);
    let attachments = [];
    if (hasFiles) {
      attachments = await uploadFiles();
      if (fileErrors.some((err) => err !== null)) {
        toast.error("Some files failed to upload. Remove them and try again.");
        return;
      }
    }
    const tempId = `temp-${Date.now()}`;
    const mentionData = parsed.mentions
      .map((m) => (typeof m === "object" ? m : null))
      .filter(Boolean);
    const optimistic = {
      _id: tempId,
      conversationId: conversation._id,
      sender: { _id: user?._id, name: user?.name },
      text: parsed.text.trim(),
      mentions: parsed.mentions,
      mentionData,
      attachments,
      createdAt: new Date().toISOString(),
      status: "sending",
      isOptimistic: true,
      replyTo,
    };
    setMessages((prev) => [...prev, optimistic]);
    setText("");
    setAiReplies([]);
    setAiMenuOpen(false);
    setTonePickerOpen(false);
    setSelectedTone("");
    setCustomTone("");
    setLoadingRewrite(false);
    setRewritePreview(null);
    setOriginalText("");
    const isGrp = conversation.type === "group";
    socket.emit("typing:stop", {
      conversationId: conversation._id,
      ...(isGrp ? {} : { receiverId: conversation.participant?._id }),
    });
    socket.emit(
      "message:send",
      {
        conversationId: conversation._id,
        ...(isGrp ? {} : { receiverId: conversation.participant?._id }),
        text: optimistic.text,
        mentions: optimistic.mentions.map((m) =>
          typeof m === "object" ? m.id : m,
        ),
        mentionData,
        tempId,
        replyTo: replyTo?._id || null,
        attachments,
      },
      (response) => {
        if (response?.success && response?.message) {
          setMessages((prev) =>
            prev.map((m) => (m._id === tempId ? response.message : m)),
          );
        }
      },
    );
    setSuggestions([]);
    setReplyTo(null);
    resetFiles();
    if (inputRef.current) inputRef.current.innerHTML = "";
    onMessageSent?.(
      conversation._id,
      optimistic.text || null,
      null,
      attachments,
    );
  };

  if (!conversation) {
    return (
      <div className="flex-1 bg-transparent flex flex-col items-center justify-center gap-6 p-6">
        <div className="relative">
          <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full" />
          <div className="relative w-24 h-24 rounded-4xl bg-accent/10 border border-accent/20 flex items-center justify-center shadow-2xl backdrop-blur-sm">
            <img
              src="https://i.ibb.co/PG0X3Tbf/Convo-X-logo.png"
              alt="ConvoX"
              className="w-12 h-auto opacity-80"
            />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-ivory text-xl font-bold tracking-tight">
            Welcome to ConvoX
          </h2>
          <p className="text-ivory/40 text-sm max-w-70 mx-auto leading-relaxed">
            Select a conversation from the sidebar or jump into a workspace to
            start collaborating.
          </p>
        </div>
        <div className="flex flex-col md:hidden gap-3 w-full max-w-60 pt-4">
          <button
            onClick={toggleSidebar}
            className="w-full py-3 px-4 bg-accent/10 hover:bg-accent/20 border border-accent/20 rounded-xl text-accent text-sm font-bold transition-all"
          >
            Open Chats
          </button>
        </div>
      </div>
    );
  }

  const participant = conversation.participant;
  const isParticipantOnline = onlineUsers?.get(participant?._id)?.online;
  const groupMemberCount = isGroup
    ? (conversation.participants?.length ?? 0)
    : 0;
  const groupOnlineCount = isGroup
    ? (conversation.participants || []).filter(
        (p) => onlineUsers?.get(p._id)?.online,
      ).length
    : 0;
  const groupAvatarColors = isGroup
    ? getGroupAvatarColor(conversation.name)
    : null;

  return (
    <main
      className="flex-1 min-w-0 flex flex-col bg-obsidian/40 backdrop-blur-3xl relative h-full"
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
      {isDragging && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-obsidian/80 border-2 border-dashed border-accent rounded-lg pointer-events-none">
          <p className="text-accent text-lg font-medium">Drop files here</p>
        </div>
      )}

      {/* ── Header ── */}
      <header className="h-17 border-b border-white/[0.06] flex justify-between items-center px-3 sm:px-5 bg-white/[0.02] backdrop-blur-2xl shrink-0 shadow-sm relative z-20">
        <div className="flex items-center gap-3">
          {isGroup ? (
            <>
              <div className="w-10 h-10 rounded-2xl shrink-0 overflow-hidden">
                {conversation.avatar ? (
                  <Image
                    src={conversation.avatar}
                    width={40}
                    height={40}
                    className="rounded-2xl object-cover"
                    alt={conversation.name || "group"}
                    unoptimized
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm"
                    style={{
                      background: groupAvatarColors?.bg,
                      color: groupAvatarColors?.text,
                    }}
                  >
                    {getGroupInitials(conversation.name)}
                  </div>
                )}
              </div>
              <div>
                <button
                  type="button"
                  onClick={onToggleGroupInfo}
                  className="font-bold text-ivory text-sm leading-tight hover:text-accent transition-colors text-left"
                >
                  {conversation.name}
                </button>
                <p className="text-[10px] mt-0.5 text-ivory/30">
                  {groupMemberCount} member{groupMemberCount !== 1 ? "s" : ""}
                  {groupOnlineCount > 0 && (
                    <span className="text-emerald-400 ml-1">
                      · {groupOnlineCount} online
                    </span>
                  )}
                </p>
              </div>
            </>
          ) : (
            <>
              <Link
                href={`/profile/${participant?._id}`}
                className="relative block"
              >
                <div
                  className={`rounded-2xl overflow-hidden ${isParticipantOnline ? "ring-2 ring-accent/60 ring-offset-1 ring-offset-[#0a0e13]" : ""}`}
                >
                  <Image
                    src={
                      participant?.avatar ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${participant?.name}`
                    }
                    width={40}
                    height={40}
                    className="rounded-2xl"
                    alt={participant?.name || "avatar"}
                    unoptimized
                  />
                </div>
                <div
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-obsidian ${isParticipantOnline ? "bg-emerald-400" : "bg-slate-600"}`}
                />
              </Link>
              <div>
                <Link
                  href={`/profile/${participant?._id}`}
                  className="font-bold text-ivory hover:text-accent transition-colors text-sm leading-tight cursor-pointer text-left block"
                >
                  {dmNickname || participant?.name}
                </Link>
                <p className="text-[10px] mt-0.5">
                  {isParticipantOnline ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                      Online
                    </span>
                  ) : (
                    <span className="text-ivory/20">
                      Last seen{" "}
                      {formatLastSeen(
                        onlineUsers?.get(participant?._id)?.lastSeen,
                      ) || "recently"}
                    </span>
                  )}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => handleStartCall("audio")}
            className="w-8 h-8 rounded-xl bg-white/4 hover:bg-accent/10 hover:text-accent flex items-center justify-center text-ivory/30 transition-all"
            title="Voice call"
          >
            <Phone size={16} />
          </button>
          <button
            onClick={() => handleStartCall("video")}
            className="w-8 h-8 rounded-xl bg-white/4 hover:bg-accent/10 hover:text-accent flex items-center justify-center text-ivory/30 transition-all"
            title="Video call"
          >
            <Video size={16} />
          </button>
          {pinnedMessages.length > 0 && (
            <button
              type="button"
              onClick={() => setShowPinnedDrawer(!showPinnedDrawer)}
              className={`relative w-8 h-8 rounded-xl flex items-center justify-center transition-all ${showPinnedDrawer ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-white/4 hover:bg-amber-500/10 hover:text-amber-400 text-ivory/30"}`}
              title="View pinned messages"
            >
              <PinIcon size={14} className="text-amber-400" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-black text-[9px] font-bold rounded-full flex items-center justify-center">
                {pinnedMessages.length}
              </span>
            </button>
          )}
          <button
            type="button"
            onClick={isGroup ? onToggleGroupInfo : onToggleDmInfo}
            title={isGroup ? "Group info" : "Chat info"}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${(isGroup && showGroupInfo) || (!isGroup && showDmInfo) ? "bg-accent/20 text-accent border border-accent/30" : "bg-white/4 hover:bg-accent/10 hover:text-accent text-ivory/30"}`}
          >
            <Info size={16} />
          </button>
        </div>
      </header>

      {/* ── Messages ── */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-3 sm:px-5 py-5 flex flex-col gap-3 scrollbar-hide"
      >
        {/* Pinned Messages Drawer */}
        {showPinnedDrawer && pinnedMessages.length > 0 && (
          <div className="sticky top-0 z-40 bg-linear-to-b from-obsidian via-obsidian to-obsidian/95 backdrop-blur-lg border-b border-amber-500/20 shadow-xl shadow-black/40 mb-4">
            <div className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                    <PinIcon size={14} className="text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-amber-400">
                      Pinned Messages
                    </h3>
                    <p className="text-[10px] text-ivory/30">
                      {pinnedMessages.length} message
                      {pinnedMessages.length !== 1 ? "s" : ""} pinned
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPinnedDrawer(false)}
                  className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-ivory/40 hover:text-ivory/80 transition-all"
                >
                  <X size={14} />
                </button>
              </div>
              {loadingPins ? (
                <div className="flex items-center justify-center gap-2 py-4">
                  <div className="w-4 h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                  <p className="text-xs text-ivory/30">
                    Loading pinned messages...
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-hide">
                  {pinnedMessages.map((pinned, idx) => {
                    const msg = pinned.messageId;
                    if (!msg) return null;
                    const isPinnedByMe =
                      pinned.pinnedBy === user?._id ||
                      pinned.pinnedBy?._id === user?._id;
                    return (
                      <div
                        key={msg._id || idx}
                        className="group relative bg-slate-surface/50 hover:bg-slate-surface border border-white/5 hover:border-amber-500/20 rounded-xl p-3 transition-all"
                      >
                        <div className="flex items-start gap-2">
                          {isGroup && msg.sender && (
                            <div className="w-7 h-7 rounded-lg shrink-0 overflow-hidden">
                              {msg.sender.avatar ? (
                                <Image
                                  src={msg.sender.avatar}
                                  width={28}
                                  height={28}
                                  className="rounded-lg object-cover"
                                  alt={msg.sender.name || ""}
                                  unoptimized
                                />
                              ) : (
                                <div
                                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-bold"
                                  style={{
                                    background: getGroupAvatarColor(
                                      msg.sender.name || "",
                                    ).bg,
                                    color: getGroupAvatarColor(
                                      msg.sender.name || "",
                                    ).text,
                                  }}
                                >
                                  {getGroupInitials(msg.sender.name || "?")}
                                </div>
                              )}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            {isGroup && msg.sender && (
                              <p className="text-[11px] font-bold text-accent mb-1">
                                {msg.sender.name || "Unknown"}
                              </p>
                            )}
                            {msg.gifUrl ? (
                              <img
                                src={msg.gifUrl}
                                alt="GIF"
                                className="max-w-40 rounded-lg"
                                loading="lazy"
                              />
                            ) : (
                              <p className="text-[13px] text-ivory/80 leading-relaxed break-words line-clamp-3">
                                {renderMessageText(msg.text, msg.mentions)}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[9px] text-ivory/20">
                                {new Date(msg.createdAt).toLocaleString([], {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              <span className="text-[9px] text-amber-400/60">
                                • Pinned by {isPinnedByMe ? "you" : "admin"}
                              </span>
                            </div>
                          </div>
                          {(() => {
                            const canUnpin = isGroup
                              ? conversation.admins?.some(
                                  (adminId) =>
                                    adminId === user?._id ||
                                    adminId._id === user?._id,
                                )
                              : true;
                            if (!canUnpin) return null;
                            return (
                              <button
                                type="button"
                                onClick={() => handleUnpinMessage(msg._id)}
                                className="shrink-0 w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 flex items-center justify-center text-ivory/30 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                              >
                                <X size={12} />
                              </button>
                            );
                          })()}
                        </div>
                        <button
                          type="button"
                          onClick={async () => {
                            const msgElement = document.getElementById(
                              `msg-${msg._id}`,
                            );
                            if (msgElement) {
                              msgElement.scrollIntoView({
                                behavior: "smooth",
                                block: "center",
                              });
                              msgElement.classList.add("animate-pulse");
                              setTimeout(
                                () =>
                                  msgElement.classList.remove("animate-pulse"),
                                2000,
                              );
                            } else {
                              try {
                                toast.loading("Loading message...", {
                                  id: `jump-${msg._id}`,
                                });
                                const response = await api.get(
                                  `/api/chat/messages/${conversation._id}`,
                                );
                                const allMessages = response.data || [];
                                if (
                                  allMessages.some((m) => m._id === msg._id)
                                ) {
                                  setMessages(allMessages);
                                  toast.dismiss(`jump-${msg._id}`);
                                  setTimeout(() => {
                                    const element = document.getElementById(
                                      `msg-${msg._id}`,
                                    );
                                    if (element) {
                                      element.scrollIntoView({
                                        behavior: "smooth",
                                        block: "center",
                                      });
                                      element.classList.add("animate-pulse");
                                      setTimeout(
                                        () =>
                                          element.classList.remove(
                                            "animate-pulse",
                                          ),
                                        2000,
                                      );
                                      toast.success("Message found!");
                                    } else {
                                      toast.error(
                                        "Message could not be displayed",
                                      );
                                    }
                                  }, 300);
                                } else {
                                  toast.dismiss(`jump-${msg._id}`);
                                  toast.error(
                                    "Message not found or has been deleted",
                                  );
                                }
                              } catch (err) {
                                toast.dismiss(`jump-${msg._id}`);
                                toast.error("Failed to load message");
                              }
                            }
                          }}
                          className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-accent/10 hover:bg-accent/20 border border-accent/20 text-accent text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-all"
                        >
                          Jump to message →
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {loadingMessages && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <div className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            <p className="text-ivory/20 text-xs">Loading messages...</p>
          </div>
        )}
        {!loadingMessages && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 gap-3">
            <div className="w-12 h-12 rounded-3xl bg-accent/10 border border-accent/15 flex items-center justify-center">
              <span className="text-xl">👋</span>
            </div>
            <p className="text-ivory/20 text-xs">No messages yet. Say hello!</p>
          </div>
        )}

        {(() => {
          let lastReadIndex = -1;
          let lastDeliveredIndex = -1;
          let lastSentIndex = -1;
          let lastAnyMeIndex = -1;
          for (let i = messages.length - 1; i >= 0; i--) {
            const m = messages[i];
            const isMsgMe =
              m.sender?._id === user?._id || m.sender === user?._id;
            if (isMsgMe) {
              if (lastAnyMeIndex === -1) lastAnyMeIndex = i;
              if (m.status === "read" && lastReadIndex === -1)
                lastReadIndex = i;
              if (m.status === "delivered" && lastDeliveredIndex === -1)
                lastDeliveredIndex = i;
              if (m.status === "sent" && lastSentIndex === -1)
                lastSentIndex = i;
            }
          }

          return messages.map((msg, index) => {
            const isMe =
              msg.sender?._id === user?._id || msg.sender === user?._id;
            const isGif = !!msg.gifUrl;
            // callLog can be:
            //   - populated object { callType, status, duration } (from socket)
            //   - unpopulated ObjectId string or { _id } only (from API on refresh)
            //   - null/undefined (not a call message)
            const isCallLog = !!(
              msg.callLog &&
              (msg.callLog.callType ||
                msg.callLog.status ||
                typeof msg.callLog === "string" ||
                (typeof msg.callLog === "object" &&
                  msg.callLog._id &&
                  !msg.text))
            );
            const currentDateKey = toDateKey(msg.createdAt);
            const prevDateKey =
              index > 0 ? toDateKey(messages[index - 1].createdAt) : null;
            const showDateSeparator = currentDateKey !== prevDateKey;

            return (
              <React.Fragment key={msg._id}>
                {showDateSeparator && (
                  <div className="flex items-center gap-3 my-2">
                    <div className="flex-1 h-px bg-white/5" />
                    <span className="text-[10px] font-medium text-ivory/20 px-3 py-1 rounded-full bg-white/4 border border-white/6 shrink-0">
                      {getDateLabel(msg.createdAt)}
                    </span>
                    <div className="flex-1 h-px bg-white/5" />
                  </div>
                )}

                {msg.isSystem ? (
                  <div
                    key={`sys-${msg._id}`}
                    className="flex justify-center my-3 w-full"
                  >
                    <span className="text-[10px] text-ivory/40 bg-white/5 px-3 py-1 rounded-full font-mono text-center">
                      {msg.text}
                    </span>
                  </div>
                ) : (
                  <div
                    id={`msg-${msg._id}`}
                    data-message-id={msg._id}
                    data-sender-id={msg.sender?._id}
                    className={`flex items-end gap-2 group ${isMe ? "justify-end" : "justify-start"}`}
                    onTouchStart={() => handleTouchStart(msg._id)}
                    onTouchEnd={handleTouchEnd}
                    onTouchMove={handleTouchEnd}
                  >
                    {isGroup && !isMe && (
                      <div className="w-6 h-6 rounded-lg shrink-0 overflow-hidden self-end mb-0.5">
                        {msg.sender?.avatar ? (
                          <Image
                            src={msg.sender.avatar}
                            width={24}
                            height={24}
                            className="rounded-lg object-cover"
                            alt={msg.sender?.name || ""}
                            unoptimized
                          />
                        ) : (
                          <div
                            className="w-6 h-6 rounded-lg flex items-center justify-center text-[8px] font-bold"
                            style={{
                              background: getGroupAvatarColor(
                                msg.sender?.name || "",
                              ).bg,
                              color: getGroupAvatarColor(msg.sender?.name || "")
                                .text,
                            }}
                          >
                            {getGroupInitials(msg.sender?.name || "?")}
                          </div>
                        )}
                      </div>
                    )}

                    <div
                      className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[85%]`}
                    >
                      {isGroup && !isMe && (
                        <span className="text-[10px] font-semibold text-accent/80 mb-0.5 px-1">
                          {conversation?.customisation?.nicknames?.[
                            msg.sender?._id
                          ] ||
                            msg.sender?.name ||
                            "Member"}
                        </span>
                      )}

                      <div className="relative group w-fit">
                        {!msg.isOptimistic && (
                          <div
                            className={`absolute -top-7 ${isMe ? "right-0" : "left-0"} items-center gap-0.5 bg-deep border border-white/6 rounded-lg p-0.5 shadow-xl shadow-black/40 z-30 ${longPressedMsgId === msg._id ? "flex" : "hidden group-hover:flex"}`}
                          >
                            {[
                              dmEmoji,
                              ...["👍", "❤️", "😂", "😮", "😢"].filter(
                                (e) => e !== dmEmoji,
                              ),
                            ].map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleReaction(msg._id, emoji);
                                  setLongPressedMsgId(null);
                                }}
                                className={`p-1.5 rounded-md transition-all duration-150 hover:bg-white/6 hover:scale-125 ${reactions[msg._id]?.[emoji]?.includes(user?._id) ? "bg-accent/20" : ""}`}
                                title={`React ${emoji}`}
                              >
                                {emoji}
                              </button>
                            ))}
                            <div className="w-px h-5 bg-white/6 mx-0.5" />
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
                              className="p-1.5 rounded-md text-ivory/40 hover:text-accent hover:bg-white/6 transition-all duration-150"
                              title="More reactions"
                            >
                              <Smile size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setReplyTo(msg);
                                setLongPressedMsgId(null);
                              }}
                              className="p-1.5 rounded-md text-ivory/40 hover:text-accent hover:bg-white/6 transition-all duration-150"
                              title="Reply"
                            >
                              <Reply size={14} />
                            </button>
                            {(() => {
                              const isPinned = pinnedMessages.some(
                                (pm) =>
                                  pm.messageId?._id === msg._id ||
                                  pm.messageId === msg._id,
                              );
                              const canUnpin = isGroup
                                ? conversation.admins?.some(
                                    (adminId) =>
                                      adminId === user?._id ||
                                      adminId._id === user?._id,
                                  )
                                : true;
                              const showButton =
                                !isPinned || (isPinned && canUnpin);
                              if (!showButton) return null;
                              return (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    isPinned
                                      ? handleUnpinMessage(msg._id)
                                      : handlePinMessage(msg._id);
                                    setLongPressedMsgId(null);
                                  }}
                                  className={`p-1.5 rounded-md transition-all duration-150 ${isPinned ? "text-amber-400 hover:text-amber-300 hover:bg-amber-500/20" : "text-ivory/40 hover:text-amber-400 hover:bg-amber-500/10"}`}
                                  title={
                                    isPinned ? "Unpin message" : "Pin message"
                                  }
                                >
                                  <PinIcon
                                    size={14}
                                    className="text-amber-400"
                                  />
                                </button>
                              );
                            })()}
                            {isMe && !msg.isOptimistic && !msg.isDeleted && (
                              <>
                                <div className="w-px h-5 bg-white/6 mx-0.5" />
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(msg._id, msg.text);
                                    setLongPressedMsgId(null);
                                  }}
                                  className="p-1.5 rounded-md text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 transition-all duration-150"
                                  title="Edit message"
                                >
                                  <Pencil size={16} />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(msg._id);
                                    setLongPressedMsgId(null);
                                  }}
                                  className="p-1.5 rounded-md text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all duration-150"
                                  title="Delete message"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        )}

                        <div
                          className={`${isGif ? "p-1" : "p-3.5"} rounded-2xl text-[13px] leading-relaxed relative z-10 
                          ${
                            editingMessageId === msg._id
                              ? "bg-slate-surface text-ivory border border-accent/50 shadow-2xl shadow-accent/10 rounded-br-none"
                              : isMe
                                ? isGif
                                  ? "bg-transparent"
                                  : "backdrop-blur-[12px] text-ivory/90 rounded-br-none"
                                : isGif
                                  ? "bg-transparent"
                                  : "chat-bubble-glass text-ivory/90 rounded-bl-none"
                          } 
                          ${msg.isOptimistic ? "opacity-60" : ""}`}
                          style={
                            isMe && !isGif && editingMessageId !== msg._id
                              ? {
                                  background: `${dmColor}33`,
                                  border: `1px solid ${dmColor}55`,
                                  boxShadow: `0 4px 30px ${dmColor}22`,
                                }
                              : undefined
                          }
                        >
                          {msg.replyTo && (
                            <div className="mb-2 p-2 bg-black/20 rounded-lg border-l-2 border-accent text-[11px] opacity-80 line-clamp-2">
                              <p className="font-bold mb-0.5">
                                {msg.replyTo.sender?.name === user?.name ||
                                msg.replyTo.sender === user?._id
                                  ? "You"
                                  : conversation?.customisation?.nicknames?.[
                                      msg.replyTo.sender?._id
                                    ] ||
                                    msg.replyTo.sender?.name ||
                                    "Participant"}
                              </p>
                              {msg.replyTo.text}
                            </div>
                          )}
                          {isCallLog ? (
                            <CallLogMessage callLog={msg.callLog} isMe={isMe} />
                          ) : msg.isDeleted ? (
                            <p className="italic text-slate-600 text-xs">
                              This message was deleted
                            </p>
                          ) : editingMessageId === msg._id ? (
                            <div className="flex flex-col gap-3 w-full min-w-70">
                              <div className="flex items-center gap-2 text-accent text-[10px] font-bold uppercase tracking-wider">
                                <span className="w-1 h-3 bg-accent rounded-full" />
                                Editing Message
                              </div>
                              <textarea
                                className="w-full min-h-20 max-h-60 bg-deep text-ivory text-[13px] px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 resize-none leading-relaxed transition-all scrollbar-hide shadow-inner"
                                value={editedText}
                                onChange={(e) => setEditedText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleEditSave();
                                  }
                                  if (e.key === "Escape") {
                                    setEditingMessageId(null);
                                    setEditedText("");
                                  }
                                }}
                                autoFocus
                                placeholder="Edit your message..."
                              />
                              <div className="flex items-center justify-between">
                                <span className="text-ivory/20 text-[9px] font-medium">
                                  Escape to{" "}
                                  <span className="text-ivory/40">cancel</span>{" "}
                                  • Enter to{" "}
                                  <span className="text-ivory/40">save</span>
                                </span>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingMessageId(null);
                                      setEditedText("");
                                    }}
                                    className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-ivory/40 hover:text-ivory/80 hover:bg-white/5 transition-all"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleEditSave}
                                    className="px-4 py-1.5 rounded-lg text-[11px] font-bold bg-accent text-black hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 active:scale-95"
                                  >
                                    Save Changes
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : msg.poll &&
                            msg.poll.question &&
                            msg.poll.options &&
                            msg.poll.options.length > 0 ? (
                            <PollMessage message={msg} />
                          ) : isGif ? (
                            <img
                              src={msg.gifUrl}
                              alt="GIF"
                              className="max-w-70 rounded-xl"
                              loading="lazy"
                            />
                          ) : (
                            (() => {
                              const sharedPost = parseSharedPost(msg.text);
                              if (sharedPost)
                                return (
                                  <SharedPostCard
                                    parsed={sharedPost}
                                    isMe={isMe}
                                  />
                                );
                              return (
                                <>
                                  {renderMessageText(msg.text, msg.mentions)}
                                  {msg.attachments?.length > 0 && (
                                    <FileAttachmentDisplay
                                      attachments={msg.attachments}
                                    />
                                  )}
                                </>
                              );
                            })()
                          )}
                          <div
                            className={`text-[9px] mt-1.5 opacity-40 text-right ${isGif ? "px-2" : ""} flex items-center justify-end gap-1`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>

                        {reactionPickerMsgId === msg._id && (
                          <div
                            ref={reactionPickerRef}
                            className={`absolute top-0 z-50 ${isMe ? "right-0 sm:right-full sm:mr-2" : "left-0 sm:left-full sm:ml-2"}`}
                          >
                            <EmojiPicker
                              onEmojiClick={(emojiData) =>
                                toggleReaction(msg._id, emojiData.emoji)
                              }
                              theme="dark"
                              emojiStyle="native"
                              width={
                                typeof window !== "undefined" &&
                                window.innerWidth < 400
                                  ? Math.min(window.innerWidth - 32, 300)
                                  : 320
                              }
                              height={360}
                              searchPlaceholder="Search emoji..."
                              previewConfig={{ showPreview: false }}
                              lazyLoadEmojis
                            />
                          </div>
                        )}
                      </div>

                      {reactions[msg._id] &&
                        Object.keys(reactions[msg._id]).length > 0 && (
                          <div
                            className={`flex flex-wrap gap-1 mt-1 ${isMe ? "flex-row-reverse" : "flex-row"} max-w-65`}
                          >
                            {Object.entries(reactions[msg._id])
                              .slice(0, 10)
                              .map(([emoji, users]) => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => toggleReaction(msg._id, emoji)}
                                  className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded-full border transition-all duration-150 ${users.includes(user?._id) ? "bg-accent/10 border-accent/30" : "bg-slate-surface border-white/6"}`}
                                >
                                  <span className="text-[12px]">{emoji}</span>
                                  <span className="text-[9px] font-bold text-ivory/40">
                                    {users.length}
                                  </span>
                                </button>
                              ))}
                          </div>
                        )}

                      {isMe && !msg.isOptimistic && (
                        <div className="flex items-center gap-0.5 px-0.5 mt-0.5">
                          {isGroup ? (
                            <ReadReceipts
                              message={msg}
                              totalParticipants={
                                conversation.participants?.length || 0
                              }
                              isOwnMessage={true}
                            />
                          ) : (
                            <>
                              {index === lastReadIndex && (
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/15 text-accent text-[8px] font-semibold">
                                  Seen
                                </span>
                              )}
                              {index === lastDeliveredIndex &&
                                index > lastReadIndex && (
                                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/6 text-ivory/40 text-[8px] font-medium">
                                    Delivered
                                  </span>
                                )}
                              {index === lastSentIndex &&
                                index > lastDeliveredIndex &&
                                index > lastReadIndex && (
                                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/6 text-ivory/30 text-[8px] font-medium">
                                    Sent
                                  </span>
                                )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          });
        })()}

        {/* Typing indicator */}
        {typingUsers?.get(conversation._id) &&
          (() => {
            const typingSet = typingUsers.get(conversation._id);
            if (!typingSet || typingSet.size === 0) return null;
            let typerNames = [];
            if (isGroup) {
              const members = conversation.participants || [];
              typerNames = [...typingSet]
                .map((uid) => members.find((p) => p._id === uid)?.name)
                .filter(Boolean);
            } else {
              if (typingSet.has(conversation.participant?._id))
                typerNames = [conversation.participant?.name];
            }
            let label = null;
            if (typerNames.length > 0) {
              if (isGroup) {
                if (typerNames.length === 1)
                  label = `${typerNames[0]} is typing`;
                else if (typerNames.length === 2)
                  label = `${typerNames[0]} and ${typerNames[1]} are typing`;
                else
                  label = `${typerNames[0]}, ${typerNames[1]} and ${typerNames.length - 2} more are typing`;
              } else {
                label = `${typerNames[0]} is typing`;
              }
            }
            const firstTyperName = typerNames[0];
            return (
              <div className="flex items-end gap-2 justify-start">
                {isGroup && firstTyperName && (
                  <div className="w-6 h-6 rounded-lg shrink-0 overflow-hidden self-end mb-0.5">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-[8px] font-bold"
                      style={{
                        background: getGroupAvatarColor(firstTyperName).bg,
                        color: getGroupAvatarColor(firstTyperName).text,
                      }}
                    >
                      {getGroupInitials(firstTyperName)}
                    </div>
                  </div>
                )}
                <div>
                  {label && (
                    <span className="text-[9px] font-semibold text-accent/80 mb-0.5 px-1 block">
                      {label}
                    </span>
                  )}
                  <div className="flex items-center gap-1 px-4 py-3 bg-slate-surface rounded-2xl rounded-bl-none shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            );
          })()}

        <div ref={bottomRef} />
      </div>

      {/* ── Input form ── */}
      <form
        onSubmit={handleSend}
        className="p-3 md:p-4 relative z-20 bg-obsidian/80 backdrop-blur-sm border-t border-white/5"
      >
        {/* Rewrite preview + reply banners */}
        <div className="absolute bottom-full left-0 right-0">
          {rewritePreview && (
            <div className="p-2 md:p-3 bg-slate-surface border-t border-accent/30 flex flex-col gap-2">
              <span className="text-[11px] font-bold text-accent">
                AI rewrite · {activeTone}
              </span>
              <p className="text-sm text-ivory/80 leading-relaxed">
                {rewritePreview}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setText(rewritePreview);
                    if (inputRef.current)
                      inputRef.current.textContent = rewritePreview;
                    setRewritePreview(null);
                    setTonePickerOpen(false);
                    setSelectedTone("");
                    setCustomTone("");
                  }}
                  className="px-3 py-1 text-[11px] font-bold rounded-lg bg-accent/20 border border-accent/40 text-accent hover:bg-accent/30 transition-all"
                >
                  ✓ Use this
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setText(originalText);
                    if (inputRef.current)
                      inputRef.current.textContent = originalText;
                    setRewritePreview(null);
                    setTonePickerOpen(false);
                    setSelectedTone("");
                    setCustomTone("");
                  }}
                  className="px-3 py-1 text-[11px] font-bold rounded-lg bg-white/5 border border-white/10 text-ivory/40 hover:text-ivory/70 transition-all"
                >
                  ✗ Discard
                </button>
              </div>
            </div>
          )}
          {replyTo && (
            <div className="p-2 md:p-3 bg-slate-surface border-t border-accent/30 flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-1 bg-accent h-8 rounded-full" />
                <div className="overflow-hidden">
                  <p className="text-[11px] font-bold text-accent">
                    Replying to {replyTo.sender?.name}
                  </p>
                  <p className="text-xs text-ivory/40 truncate">
                    {replyTo.text}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="p-1.5 hover:bg-white/5 rounded-full text-ivory/30"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Scheduled panel */}
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

        {/* GIF picker */}
        {showGifPicker && (
          <div
            ref={gifPickerRef}
            className="absolute bottom-20 right-0 sm:right-4 left-0 sm:left-auto z-50 shadow-2xl rounded-2xl overflow-hidden border border-white/6 mx-2 sm:mx-0"
          >
            <style>{`.gpr-picker { --gpr-bg-color: #15191C !important; --gpr-secondary-bg: #1C2227 !important; --gpr-text-color: #cbd5e1 !important; --gpr-text-secondary: #94a3b8 !important; --gpr-border-color: #1e293b !important; --gpr-highlight-color: #2dd4bf !important; --gpr-highlight-hover: #5eead4 !important; --gpr-input-bg: #0B0E11 !important; --gpr-hover-bg: rgba(45, 212, 191, 0.1) !important; --gpr-radius: 16px !important; border: none !important; } .gpr-trending-terms { display: none !important; }`}</style>
            <GifPicker
              klipyApiKey={process.env.NEXT_PUBLIC_KLIPY_API_KEY}
              onGifClick={handleGifClick}
              theme="dark"
              width={
                typeof window !== "undefined" && window.innerWidth < 400
                  ? window.innerWidth - 32
                  : 380
              }
              height={400}
              columns={2}
            />
          </div>
        )}

        {/* Emoji picker */}
        {showEmojiPicker && (
          <div
            ref={inputEmojiPickerRef}
            className="absolute bottom-20 right-0 sm:right-4 left-0 sm:left-auto z-50 shadow-2xl mx-2 sm:mx-0"
          >
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              theme="dark"
              emojiStyle="native"
              width={
                typeof window !== "undefined" && window.innerWidth < 400
                  ? window.innerWidth - 32
                  : 350
              }
              height={380}
              searchPlaceholder="Search emoji..."
              previewConfig={{ showPreview: false }}
              lazyLoadEmojis
            />
          </div>
        )}

        {/* AI suggestions / tone picker */}
        {(aiReplies.length > 0 || loadingAiReplies || tonePickerOpen) && (
          <div className="flex items-center gap-1.5 flex-wrap mb-2 px-1 md:px-2">
            {tonePickerOpen ? (
              <>
                <span className="text-[9px] text-ivory/20 font-semibold uppercase tracking-wide">
                  Rewrite as:
                </span>
                {["Formal", "Casual", "Friendly"].map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => {
                      setSelectedTone(tone);
                      setCustomTone("");
                    }}
                    className={`px-3 py-1 text-[11px] rounded-full border transition-all ${selectedTone === tone && !customTone.trim() ? "bg-accent/20 border-accent/40 text-accent" : "bg-accent/10 border-accent/20 text-accent/80 hover:bg-accent/20 hover:text-accent"}`}
                  >
                    {tone}
                  </button>
                ))}
                <input
                  type="text"
                  value={customTone}
                  onChange={(e) => {
                    setCustomTone(e.target.value);
                    setSelectedTone("");
                  }}
                  maxLength={30}
                  placeholder="Custom tone..."
                  className="px-2 py-1 text-[11px] rounded-full bg-white/5 border border-white/10 text-ivory/60 placeholder:text-ivory/20 outline-none focus:border-accent/30 max-w-30"
                />
                <button
                  type="button"
                  onClick={handleRewrite}
                  disabled={!activeTone || loadingRewrite}
                  className={`flex items-center gap-1 px-3 py-1 text-[11px] font-bold rounded-full border transition-all ${!activeTone || loadingRewrite ? "bg-white/5 border-white/10 text-ivory/20 cursor-not-allowed" : "bg-accent/20 border-accent/40 text-accent hover:bg-accent/30"}`}
                >
                  {loadingRewrite ? (
                    <span className="w-2.5 h-2.5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                  ) : (
                    "Rewrite →"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTonePickerOpen(false);
                    setSelectedTone("");
                    setCustomTone("");
                    setRewritePreview(null);
                    setOriginalText("");
                  }}
                  className="ml-auto p-0.5 text-ivory/20 hover:text-ivory/50 transition-colors"
                >
                  <X size={11} />
                </button>
              </>
            ) : (
              <>
                <span className="text-[9px] text-ivory/20 font-semibold uppercase tracking-wide">
                  AI
                </span>
                {loadingAiReplies ? (
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                    <span className="text-[10px] text-ivory/30">
                      Generating replies...
                    </span>
                  </div>
                ) : (
                  <>
                    {aiReplies.map((reply, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setText(reply);
                          if (inputRef.current)
                            inputRef.current.textContent = reply;
                        }}
                        className="px-3 py-1 text-[11px] rounded-full bg-accent/10 border border-accent/20 text-accent/80 hover:bg-accent/20 hover:text-accent transition-all max-w-45 truncate"
                        title={reply}
                      >
                        {reply}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setAiReplies([])}
                      className="ml-auto p-0.5 text-ivory/20 hover:text-ivory/50 transition-colors"
                    >
                      <X size={11} />
                    </button>
                  </>
                )}
              </>
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

          {/* Paperclip */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-9 h-9 flex items-center justify-center text-ivory/30 hover:text-accent transition-colors"
            title="Attach files"
          >
            <Paperclip size={18} />
          </button>

          {/* Poll (groups only) */}
          {isGroup && (
            <button
              type="button"
              onClick={() => setShowCreatePoll(true)}
              className="w-8 md:w-9 h-8 md:h-9 flex items-center justify-center text-ivory/30 hover:text-accent transition-colors shrink-0"
              title="Create Poll"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </button>
          )}

          {/* Message input */}
          <div className="flex-1 relative min-w-0">
            <div
              ref={inputRef}
              className="w-full bg-transparent outline-none text-xs md:text-sm text-ivory/80 px-2 md:px-3 placeholder:text-ivory/20 min-h-5 max-h-37.5 overflow-y-auto whitespace-pre-wrap wrap-break-word empty:before:content-[attr(placeholder)] empty:before:text-ivory/20"
              contentEditable="true"
              placeholder="Type a message..."
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              onPaste={(e) => {
                e.preventDefault();
                const text = e.clipboardData.getData("text/plain");
                const selection = window.getSelection();
                if (!selection.rangeCount) return;
                selection
                  .getRangeAt(0)
                  .insertNode(document.createTextNode(text));
                selection.collapseToEnd();
                handleInput({ currentTarget: inputRef.current });
              }}
            />
          </div>

          {/* Emoji suggestions dropdown */}
          {suggestions.length > 0 && (
            <div className="absolute bottom-20 left-2 sm:left-10 bg-deep/95 backdrop-blur-md border border-white/6 rounded-xl p-1 shadow-2xl z-50 min-w-37.5 max-w-[calc(100vw-2rem)]">
              {suggestions.map(([code, emoji], i) => (
                <div
                  key={code}
                  onClick={() => insertEmoji(emoji)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${i === suggestionIndex ? "bg-accent/20 text-accent" : "hover:bg-white/6 text-ivory/40"}`}
                >
                  <span className="text-lg">{emoji}</span>
                  <span className="text-xs font-mono">{code}</span>
                </div>
              ))}
            </div>
          )}

          {/* GIF — desktop */}
          <button
            type="button"
            onClick={() => {
              setShowGifPicker(!showGifPicker);
              setShowEmojiPicker(false);
            }}
            className={`hidden sm:inline-flex px-2 py-1 mx-1 text-[10px] font-black rounded-md border transition-all ${showGifPicker ? "bg-accent/20 border-accent/40 text-accent" : "bg-white/4 border-white/10 text-ivory/30 hover:text-ivory/60"}`}
          >
            GIF
          </button>

          {/* AI — desktop */}
          <div
            ref={aiMenuRefDesktop}
            className="relative hidden lg:inline-flex"
          >
            <button
              type="button"
              onClick={() => setAiMenuOpen((v) => !v)}
              title="AI tools"
              className={`inline-flex items-center gap-1 px-2 py-1 mx-1 text-[10px] font-black rounded-md border transition-all ${aiMenuOpen || aiReplies.length > 0 || tonePickerOpen ? "bg-accent/20 border-accent/40 text-accent" : "bg-white/4 border-white/10 text-ivory/30 hover:bg-accent/10 hover:border-accent/30 hover:text-accent"}`}
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
                  className={`w-full text-left px-3 py-2 text-[11px] transition-colors ${text.trim() ? "text-ivory/70 hover:bg-white/6 hover:text-ivory" : "text-ivory/20 opacity-40 cursor-not-allowed"}`}
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

          {/* Voice message button */}
          <button
            type="button"
            onClick={() => {
              setShowVoiceRecorder((v) => !v);
              setShowEmojiPicker(false);
              setShowGifPicker(false);
            }}
            className={`w-9 h-9 flex items-center justify-center transition-all ${showVoiceRecorder ? "text-accent" : "text-ivory/30 hover:text-ivory/60"}`}
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

          {/* Emoji button */}
          <button
            type="button"
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setShowGifPicker(false);
            }}
            className={`w-9 h-9 flex items-center justify-center transition-all ${showEmojiPicker ? "text-accent" : "text-ivory/30 hover:text-ivory/60"}`}
            title="Emoji"
          >
            <Smile size={20} />
          </button>

          {/* Clock / Schedule dropdown (DM only) */}
          {!isGroup && (
            <div
              ref={scheduleDropdownRef}
              className="relative hidden lg:inline-flex"
            >
              <button
                type="button"
                onClick={() => setScheduleDropdownOpen((v) => !v)}
                className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${scheduleDropdownOpen ? "bg-accent/20 text-accent" : "text-ivory/30 hover:text-ivory/60"}`}
                title="Schedule message"
              >
                <Clock size={18} />
              </button>

              {scheduleDropdownOpen && (
                <div className="absolute bottom-full right-0 mb-2 w-56 bg-deep border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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
                  <div className="p-3 space-y-2">
                    <div>
                      <label className="text-[11px] font-mono text-ivory/50 mb-2 block">
                        Send at
                      </label>
                      <input
                        type="datetime-local"
                        value={sendAt}
                        min={new Date(
                          Date.now() - new Date().getTimezoneOffset() * 60000,
                        )
                          .toISOString()
                          .slice(0, 16)}
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
                    <div className="h-px bg-white/5" />
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
          )}

          {/* Send / Quick Emoji button */}
          {!text.trim() && stagedFiles.length === 0 ? (
            <button
              type="button"
              onClick={handleSendQuickEmoji}
              disabled={
                scheduling ||
                fileUploading ||
                fileErrors.some((e) => e !== null)
              }
              className="w-11 h-11 flex items-center justify-center rounded-xl ml-1 transition-all active:scale-[0.8] hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed group"
              title={`Send ${dmEmoji}`}
            >
              <span
                className="text-2xl transition-transform group-hover:scale-110 drop-shadow-lg"
                style={{ filter: `drop-shadow(0 4px 12px ${dmColor}40)` }}
              >
                {dmEmoji}
              </span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={
                scheduling ||
                fileUploading ||
                fileErrors.some((e) => e !== null) ||
                (!text.trim() && stagedFiles.length === 0)
              }
              className={`w-9 h-9 flex items-center justify-center rounded-xl ml-1 transition-all active:scale-95 shadow-lg ${scheduling || fileUploading || fileErrors.some((e) => e !== null) || (!text.trim() && stagedFiles.length === 0) ? "bg-slate-700 text-ivory/40 cursor-not-allowed opacity-50" : "bg-accent hover:bg-accent/90 text-black shadow-accent/20"}`}
              title="Send"
            >
              <Send size={18} />
            </button>
          )}

          {/* Mobile toolbar row */}
          <div className="lg:hidden w-full flex items-center gap-1 pt-1 border-t border-white/5 mt-1">
            {isGroup && (
              <button
                type="button"
                onClick={() => setShowCreatePoll(true)}
                className="px-2 py-1 text-[10px] font-black rounded-md border bg-white/4 border-white/10 text-ivory/30 hover:text-ivory/60 transition-all"
              >
                📊 POLL
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setShowGifPicker(!showGifPicker);
                setShowEmojiPicker(false);
              }}
              className={`px-2 py-1 text-[10px] font-black rounded-md border transition-all ${showGifPicker ? "bg-accent/20 border-accent/40 text-accent" : "bg-white/4 border-white/10 text-ivory/30 hover:text-ivory/60"}`}
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
              className={`px-2 py-1 text-[10px] font-black rounded-md border transition-all ${showVoiceRecorder ? "bg-accent/20 border-accent/40 text-accent" : "bg-white/4 border-white/10 text-ivory/30 hover:text-ivory/60"}`}
            >
              🎙 Voice
            </button>
            <div ref={aiMenuRefMobile} className="relative inline-flex">
              <button
                type="button"
                onClick={() => setAiMenuOpen((v) => !v)}
                title="AI tools"
                className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-black rounded-md border transition-all ${aiMenuOpen || aiReplies.length > 0 || tonePickerOpen ? "bg-accent/20 border-accent/40 text-accent" : "bg-white/4 border-white/10 text-ivory/30 hover:bg-accent/10 hover:border-accent/30 hover:text-accent"}`}
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
                    className={`w-full text-left px-3 py-2 text-[11px] transition-colors ${text.trim() ? "text-ivory/70 hover:bg-white/6 hover:text-ivory" : "text-ivory/20 opacity-40 cursor-not-allowed"}`}
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
            {/* Mobile schedule button (DM only) */}
            {!isGroup && (
              <button
                type="button"
                onClick={() => setScheduleDropdownOpen((v) => !v)}
                className={`px-2 py-1 text-[10px] font-black rounded-md border transition-all ${scheduleDropdownOpen ? "bg-accent/20 border-accent/40 text-accent" : "bg-white/4 border-white/10 text-ivory/30 hover:text-ivory/60"}`}
                title="Schedule message"
              >
                ⏱ Schedule
              </button>
            )}
          </div>
        </div>
      </form>

      {showCreatePoll && (
        <CreatePollModal
          conversation={conversation}
          onClose={() => setShowCreatePoll(false)}
          onPollCreated={handlePollCreated}
        />
      )}
    </main>
  );
}
