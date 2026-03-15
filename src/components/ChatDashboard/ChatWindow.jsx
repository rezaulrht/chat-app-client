"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  Phone,
  Video,
  Info,
  Plus,
  Smile,
  Send,
  X,
  Reply,
  Pencil,
  Trash2,
  Check,
  Menu,
} from "lucide-react";
import api from "@/app/api/Axios";
import { useSocket } from "@/hooks/useSocket";
import useAuth from "@/hooks/useAuth";
import { EMOJI_MAP } from "@/utils/emojis";
import { formatLastSeen } from "@/utils/formatLastSeen";
import { getGroupInitials, getGroupAvatarColor } from "@/utils/groupAvatar";
import toast from "react-hot-toast";

import {
  createScheduledMessage,
  listScheduledMessages,
  cancelScheduledMessage,
} from "@/utils/scheduleApi";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });
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
  onConversationUpdate,
  toggleSidebar,
  toggleWorkspace,
}) {
  const { socket, onlineUsers, typingUsers } = useSocket() || {};
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [replyTo, setReplyTo] = useState(null);

  const [reactions, setReactions] = useState({});
  const [reactionPickerMsgId, setReactionPickerMsgId] = useState(null);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);

  const [suggestions, setSuggestions] = useState([]);
  const [suggestionIndex, setSuggestionIndex] = useState(0);

  const [aiReplies, setAiReplies] = useState([]);
  const [loadingAiReplies, setLoadingAiReplies] = useState(false);
  const lastAiRepliesForMsgRef = useRef(null);

  // Tone rewrite state
  const [aiMenuOpen, setAiMenuOpen] = useState(false);
  const [tonePickerOpen, setTonePickerOpen] = useState(false);
  const [selectedTone, setSelectedTone] = useState("");
  const [customTone, setCustomTone] = useState("");
  const [loadingRewrite, setLoadingRewrite] = useState(false);
  const [rewritePreview, setRewritePreview] = useState(null);
  const [originalText, setOriginalText] = useState("");
  const aiMenuRefDesktop = useRef(null);
  const aiMenuRefMobile = useRef(null);

  // Scheduled messages UI
  const [scheduleMode, setScheduleMode] = useState(false);
  const [sendAt, setSendAt] = useState("");
  const [scheduling, setScheduling] = useState(false);

  const [scheduledItems, setScheduledItems] = useState([]);
  const [showScheduledPanel, setShowScheduledPanel] = useState(false);
  const [loadingScheduled, setLoadingScheduled] = useState(false);

  // Edit/Delete UI
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editedText, setEditedText] = useState("");

  // Mobile long-press message actions
  const [longPressedMsgId, setLongPressedMsgId] = useState(null);
  const longPressTimerRef = useRef(null);

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

  // Close pickers on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        reactionPickerRef.current &&
        !reactionPickerRef.current.contains(e.target)
      ) {
        setReactionPickerMsgId(null);
      }
      // Dismiss mobile long-press actions on outside tap
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
      // Close AI menu on outside click
      // A null ref means the element isn't mounted — treat as "outside"
      const outsideDesktop =
        !aiMenuRefDesktop.current ||
        !aiMenuRefDesktop.current.contains(e.target);
      const outsideMobile =
        !aiMenuRefMobile.current ||
        !aiMenuRefMobile.current.contains(e.target);
      if (aiMenuOpen && outsideDesktop && outsideMobile) {
        setAiMenuOpen(false);
      }
    };

    if (reactionPickerMsgId || showEmojiPicker || showGifPicker || aiMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [reactionPickerMsgId, showEmojiPicker, showGifPicker, aiMenuOpen]);

  const handleEmojiClick = (emojiData) =>
    setText((prev) => prev + emojiData.emoji);

  const insertEmoji = (emoji) => {
    setText((prev) => {
      const match = prev.match(/:[a-zA-Z0-9_]*$/);
      if (!match) return prev + emoji;
      return prev.slice(0, match.index) + emoji;
    });
    setSuggestions([]);
  };

  const handleTextChange = (e) => {
    let val = e.target.value;

    // replace :code: with emoji if exact lastWord
    const lastWord = val.split(" ").pop();
    if (EMOJI_MAP[lastWord]) val = val.replace(lastWord, EMOJI_MAP[lastWord]);

    setText(val);

    // typing indicator
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

    // suggestions for :xxx
    const match = val.match(/:([a-zA-Z0-9_]*)$/);
    if (match) {
      const query = match[1].toLowerCase();
      const filtered = Object.entries(EMOJI_MAP)
        .filter(([code]) => {
          const name = code.slice(1, -1);
          return (
            name.startsWith(query) ||
            name.split("_").some((w) => w.startsWith(query))
          );
        })
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(0, 8);

      setSuggestions(filtered);
      setSuggestionIndex(0);
    } else {
      setSuggestions([]);
    }
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
      } else if (e.key === "Enter") {
        e.preventDefault();
        insertEmoji(suggestions[suggestionIndex][1]);
      } else if (e.key === "Escape") {
        setSuggestions([]);
      }
    }
  };

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

  // Edit/Delete handlers
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

  // Fetch messages when conversation changes
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
      setScheduleMode(false);
      setShowScheduledPanel(false);
      setAiReplies([]);
      lastAiRepliesForMsgRef.current = null;
      // Tone rewrite resets
      setAiMenuOpen(false);
      setTonePickerOpen(false);
      setSelectedTone("");
      setCustomTone("");
      setLoadingRewrite(false);
      setRewritePreview(null);
      setOriginalText("");

      try {
        const res = await api.get(`/api/chat/messages/${conversation._id}`);
        setMessages(res.data || []);

        // load reactions map
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

        // reset seen-init marker for new conversation
        seenInitializedConversationRef.current = null;
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [conversation?._id]);

  // Join/leave conversation room (for reactions + other events)
  useEffect(() => {
    if (!socket || !conversation?._id) return;
    socket.emit("conversation:join", conversation._id);
    return () => socket.emit("conversation:leave", conversation._id);
  }, [socket, conversation?._id]);

  // Mark initial loaded messages as seen once per active conversation
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

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleReceive = (msg) => {
      if (msg.conversationId !== conversation?._id) return;

      setMessages((prev) => {
        const optimisticIndex = prev.findIndex((m) => m._id === msg.tempId);
        if (optimisticIndex !== -1) {
          const updated = [...prev];
          updated[optimisticIndex] = msg;
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

    const handleDeleted = ({ messageId }) => {
      if (!messageId) return;
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId ? { ...m, isDeleted: true, text: m.text } : m,
        ),
      );
    };

    socket.on("message:new", handleReceive);
    socket.on("message:status", handleDelivered);
    socket.on("message:reacted", handleReacted);
    socket.on("message:edited", handleEdited);
    socket.on("message:deleted", handleDeleted);

    return () => {
      socket.off("message:new", handleReceive);
      socket.off("message:status", handleDelivered);
      socket.off("message:reacted", handleReacted);
      socket.off("message:edited", handleEdited);
      socket.off("message:deleted", handleDeleted);
    };
  }, [socket, conversation?._id, user?._id, onMessagesSeen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
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

  // Scheduled: refresh list
  const refreshScheduled = useCallback(async () => {
    if (!conversation?._id) return;
    setLoadingScheduled(true);
    try {
      const data = await listScheduledMessages({
        conversationId: conversation._id,
      });
      setScheduledItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
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

  // activeTone: string primitive — safe to use in useCallback dep array
  const activeTone = customTone.trim() || selectedTone;

  const handleRewrite = useCallback(async () => {
    if (!activeTone || !text.trim() || loadingRewrite) return;

    setOriginalText(text);      // capture before call — overwrites any previous value
    setLoadingRewrite(true);
    setRewritePreview(null);    // hide stale preview while loading

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
      console.error(err);
      toast.error(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to cancel scheduled message",
      );
    }
  };

  // Scheduled: create
  const scheduleMessage = async () => {
    // Clear AI state so tone picker/preview don't persist after scheduling
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
      setScheduleMode(false);
      setSuggestions([]);
      setReplyTo(null);

      onMessageSent?.(conversation._id, "SCHEDULED");
      toast.success("✅ Message scheduled!");

      setShowScheduledPanel(true);
      refreshScheduled();
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to schedule",
      );
    } finally {
      setScheduling(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !conversation) return;

    // Scheduled send
    if (scheduleMode) return scheduleMessage();

    // Normal send (socket)
    if (!socket) return;

    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      _id: tempId,
      conversationId: conversation._id,
      sender: { _id: user?._id, name: user?.name },
      text: text.trim(),
      createdAt: new Date().toISOString(),
      status: "sent",
      isOptimistic: true,
      replyTo,
    };

    setMessages((prev) => [...prev, optimistic]);
    setText("");
    setAiReplies([]);
    // Tone rewrite resets
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
    socket.emit("message:send", {
      conversationId: conversation._id,
      ...(isGrp ? {} : { receiverId: conversation.participant?._id }),
      text: optimistic.text,
      tempId,
      replyTo: replyTo?._id || null,
    });

    setSuggestions([]);
    setReplyTo(null);
  };

  if (!conversation) {
    return (
      <div className="flex-1 bg-obsidian flex flex-col items-center justify-center gap-6 p-6">
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

  const isGroup = conversation.type === "group";
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
    <main className="flex-1 min-w-0 flex flex-col bg-obsidian relative h-full">
      <header className="h-17 border-b border-white/5 flex justify-between items-center px-3 sm:px-5 bg-obsidian/80 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="md:hidden w-8 h-8 rounded-xl bg-white/4 flex items-center justify-center text-ivory/30 hover:text-ivory transition-colors"
          >
            <Menu size={18} />
          </button>
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
                <h2 className="font-bold text-ivory text-sm leading-tight">
                  {conversation.name}
                </h2>
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
              <div className="relative">
                <div
                  className={`rounded-2xl overflow-hidden ${
                    isParticipantOnline
                      ? "ring-2 ring-accent/60 ring-offset-1 ring-offset-[#0a0e13]"
                      : ""
                  }`}
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
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-obsidian ${
                    isParticipantOnline ? "bg-emerald-400" : "bg-slate-600"
                  }`}
                />
              </div>

              <div>
                <h2 className="font-bold text-ivory text-sm leading-tight">
                  {participant?.name}
                </h2>
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
          <button className="w-8 h-8 rounded-xl bg-white/4 hover:bg-accent/10 hover:text-accent flex items-center justify-center text-ivory/30 transition-all">
            <Phone size={16} />
          </button>
          <button className="w-8 h-8 rounded-xl bg-white/4 hover:bg-accent/10 hover:text-accent flex items-center justify-center text-ivory/30 transition-all">
            <Video size={16} />
          </button>
          <button
            type="button"
            onClick={isGroup ? onToggleGroupInfo : undefined}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
              isGroup && showGroupInfo
                ? "bg-accent/20 text-accent border border-accent/30"
                : "bg-white/4 hover:bg-accent/10 hover:text-accent text-ivory/30"
            }`}
          >
            <Info size={16} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-5 flex flex-col gap-3 scrollbar-hide">
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
          // Robust calculation of last message indices for each status
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

                <div
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
                        {msg.sender?.name || "Member"}
                      </span>
                    )}

                    <div className="relative group w-fit">
                      {!msg.isOptimistic && (
                        <div
                          className={`absolute -top-7 ${isMe ? "right-0" : "left-0"} items-center gap-0.5 bg-deep border border-white/6 rounded-lg p-0.5 shadow-xl shadow-black/40 z-30 ${longPressedMsgId === msg._id ? "flex" : "hidden group-hover:flex"}`}
                        >
                          {["👍", "❤️", "😂", "😮", "😢"].map((emoji) => (
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
                                : "bg-accent text-black rounded-br-none shadow-lg shadow-accent/10"
                              : isGif
                                ? "bg-transparent"
                                : "bg-slate-surface text-ivory/80 rounded-bl-none shadow-sm shadow-black/5"
                        } 
                        ${msg.isOptimistic ? "opacity-60" : ""}`}
                      >
                        {msg.replyTo && (
                          <div className="mb-2 p-2 bg-black/20 rounded-lg border-l-2 border-accent text-[11px] opacity-80 line-clamp-2">
                            <p className="font-bold mb-0.5">
                              {msg.replyTo.sender?.name === user?.name
                                ? "You"
                                : msg.replyTo.sender?.name || "Participant"}
                            </p>
                            {msg.replyTo.text}
                          </div>
                        )}
                        {msg.isDeleted ? (
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
                                <span className="text-ivory/40">cancel</span> •
                                Enter to{" "}
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
                        ) : isGif ? (
                          <img
                            src={msg.gifUrl}
                            alt="GIF"
                            className="max-w-70 rounded-xl"
                            loading="lazy"
                          />
                        ) : (
                          msg.text
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
                          index === lastAnyMeIndex && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/6 text-ivory/30 text-[8px] font-medium">
                              Sent
                            </span>
                          )
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
              </React.Fragment>
            );
          });
        })()}
        {typingUsers?.get(conversation._id) &&
          (() => {
            const typingSet = typingUsers.get(conversation._id);
            if (!typingSet || typingSet.size === 0) return null;

            // For groups resolve names; for DMs use the participant name
            let typerNames = [];
            if (isGroup) {
              const members = conversation.participants || [];
              typerNames = [...typingSet]
                .map((uid) => members.find((p) => p._id === uid)?.name)
                .filter(Boolean);
            } else {
              // Direct message - only one possible typer other than self
              if (typingSet.has(conversation.participant?._id)) {
                typerNames = [conversation.participant?.name];
              }
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

      <form
        onSubmit={handleSend}
        className="p-4 relative z-20 bg-obsidian/80 backdrop-blur-sm border-t border-white/5"
      >
        {/* Shared absolute wrapper — rewritePreview and replyTo stack as block elements */}
        <div className="absolute bottom-full left-0 right-0">
          {rewritePreview && (
            <div className="p-3 bg-slate-surface border-t border-accent/30 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-accent">
                  AI rewrite · {activeTone}
                </span>
              </div>
              <p className="text-sm text-ivory/80 leading-relaxed">{rewritePreview}</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setText(rewritePreview);
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
            <div className="p-3 bg-slate-surface border-t border-accent/30 flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-1 bg-accent h-8 rounded-full" />
                <div className="overflow-hidden">
                  <p className="text-[11px] font-bold text-accent">
                    Replying to {replyTo.sender?.name}
                  </p>
                  <p className="text-xs text-ivory/40 truncate">{replyTo.text}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="p-1.5 hover:bg-white/5 rounded-full text-ivory/30"
                aria-label="Cancel reply"
                title="Cancel reply"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {showScheduledPanel && (
          <div className="mb-3 p-3 rounded-2xl bg-slate-surface border border-white/5">
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
                      aria-label="Cancel scheduled message"
                      title="Cancel"
                    >
                      Cancel
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

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

        {(aiReplies.length > 0 || loadingAiReplies || tonePickerOpen) && (
          <div className="flex items-center gap-1.5 flex-wrap mb-2 px-1">
            {tonePickerOpen ? (
              /* ── Tone Picker ── */
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
                    className={`px-3 py-1 text-[11px] rounded-full border transition-all ${
                      selectedTone === tone && !customTone.trim()
                        ? "bg-accent/20 border-accent/40 text-accent"
                        : "bg-accent/10 border-accent/20 text-accent/80 hover:bg-accent/20 hover:text-accent"
                    }`}
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
                  className="px-2 py-1 text-[11px] rounded-full bg-white/5 border border-white/10 text-ivory/60 placeholder:text-ivory/20 outline-none focus:border-accent/30 max-w-[120px]"
                />
                <button
                  type="button"
                  onClick={handleRewrite}
                  disabled={!activeTone || loadingRewrite}
                  className={`flex items-center gap-1 px-3 py-1 text-[11px] font-bold rounded-full border transition-all ${
                    !activeTone || loadingRewrite
                      ? "bg-white/5 border-white/10 text-ivory/20 cursor-not-allowed"
                      : "bg-accent/20 border-accent/40 text-accent hover:bg-accent/30"
                  }`}
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
                  title="Dismiss tone picker"
                  aria-label="Dismiss tone picker"
                >
                  <X size={11} />
                </button>
              </>
            ) : (
              /* ── AI Reply Chips ── */
              <>
                <span className="text-[9px] text-ivory/20 font-semibold uppercase tracking-wide">
                  AI
                </span>
                {loadingAiReplies ? (
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                    <span className="text-[10px] text-ivory/30">Generating replies...</span>
                  </div>
                ) : (
                  <>
                    {aiReplies.map((reply, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setText(reply)}
                        className="px-3 py-1 text-[11px] rounded-full bg-accent/10 border border-accent/20 text-accent/80 hover:bg-accent/20 hover:text-accent transition-all max-w-[180px] truncate"
                        title={reply}
                      >
                        {reply}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setAiReplies([])}
                      className="ml-auto p-0.5 text-ivory/20 hover:text-ivory/50 transition-colors"
                      title="Dismiss suggestions"
                      aria-label="Dismiss AI suggestions"
                    >
                      <X size={11} />
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        )}

        <div className="bg-slate-surface rounded-2xl flex items-center flex-wrap p-2 gap-1 border border-white/5 focus-within:border-accent/50 transition-all shadow-inner">
          <button
            type="button"
            className="w-9 h-9 flex items-center justify-center text-ivory/30 hover:text-accent transition-colors"
            title="More"
            aria-label="More"
            onClick={() => setShowExtraTools && setShowExtraTools((v) => !v)}
          >
            <Plus size={20} />
          </button>

          <input
            className="flex-1 min-w-0 bg-transparent outline-none text-sm text-ivory/80 px-3 placeholder:text-ivory/20"
            placeholder="Type a message..."
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
          />

          {suggestions.length > 0 && (
            <div className="absolute bottom-20 left-2 sm:left-10 bg-deep/95 backdrop-blur-md border border-white/6 rounded-xl p-1 shadow-2xl z-50 min-w-37.5 max-w-[calc(100vw-2rem)]">
              {suggestions.map(([code, emoji], i) => (
                <div
                  key={code}
                  onClick={() => insertEmoji(emoji)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    i === suggestionIndex
                      ? "bg-accent/20 text-accent"
                      : "hover:bg-white/6 text-ivory/40"
                  }`}
                >
                  <span className="text-lg">{emoji}</span>
                  <span className="text-xs font-mono">{code}</span>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setShowGifPicker(!showGifPicker);
              setShowEmojiPicker(false);
              setScheduleMode(false);
            }}
            className={`hidden sm:inline-flex px-2 py-1 mx-1 text-[10px] font-black rounded-md border transition-all ${
              showGifPicker
                ? "bg-accent/20 border-accent/40 text-accent"
                : "bg-white/4 border-white/10 text-ivory/30 hover:text-ivory/60"
            }`}
          >
            GIF
          </button>

          <div ref={aiMenuRefDesktop} className="relative hidden sm:inline-flex">
            <button
              type="button"
              onClick={() => setAiMenuOpen((v) => !v)}
              title="AI tools"
              aria-label="AI tools"
              className={`inline-flex items-center gap-1 px-2 py-1 mx-1 text-[10px] font-black rounded-md border transition-all ${
                aiMenuOpen
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
                  className={`w-full text-left px-3 py-2 text-[11px] transition-colors ${
                    text.trim()
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

          {!isGroup && (
            <button
              type="button"
              title="View scheduled messages"
              aria-label="View scheduled messages"
              onClick={() => {
                setShowScheduledPanel((v) => !v);
                refreshScheduled();
              }}
              className="hidden sm:inline-flex px-2 py-1 mx-1 text-[10px] font-black rounded-md border bg-white/4 border-white/10 text-ivory/30 hover:text-ivory/60"
            >
              PENDING
            </button>
          )}

          {!isGroup && (
            <button
              type="button"
              title="Schedule message"
              aria-label="Schedule message"
              onClick={() => {
                setScheduleMode((v) => !v);
                setShowScheduledPanel(true);
              }}
              className={`hidden sm:inline-flex px-2 py-1 mx-1 text-[10px] font-black rounded-md border transition-all ${
                scheduleMode
                  ? "bg-accent/20 border-accent/40 text-accent"
                  : "bg-white/4 border-white/10 text-ivory/30 hover:text-ivory/60"
              }`}
            >
              SCHEDULE
            </button>
          )}

          {!isGroup && scheduleMode && (
            <input
              type="datetime-local"
              value={sendAt}
              min={new Date().toISOString().slice(0, 16)}
              onChange={(e) => setSendAt(e.target.value)}
              className="hidden sm:inline-flex mx-1 px-2 py-1 rounded-md bg-accent border border-white/10 text-ivory/80 text-[11px]"
            />
          )}

          <button
            type="button"
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setShowGifPicker(false);
              setScheduleMode(false);
            }}
            className={`w-9 h-9 flex items-center justify-center transition-all ${
              showEmojiPicker
                ? "text-accent"
                : "text-ivory/30 hover:text-ivory/60"
            }`}
            title="Emoji"
            aria-label="Emoji"
          >
            <Smile size={20} />
          </button>

          <button
            type="submit"
            disabled={scheduling}
            className={`w-9 h-9 flex items-center justify-center rounded-xl ml-1 transition-all active:scale-95 shadow-lg ${
              scheduling
                ? "bg-slate-700 text-ivory/40 cursor-not-allowed"
                : "bg-accent hover:bg-accent/90 text-black shadow-accent/20"
            }`}
            title={scheduleMode ? "Schedule send" : "Send"}
            aria-label={scheduleMode ? "Schedule send" : "Send"}
          >
            <Send size={18} />
          </button>

          {/* Mobile-only expanded toolbar row */}
          <div className="sm:hidden w-full flex items-center gap-1 pt-1 border-t border-white/5 mt-1">
            <button
              type="button"
              onClick={() => {
                setShowGifPicker(!showGifPicker);
                setShowEmojiPicker(false);
                setScheduleMode(false);
              }}
              className={`px-2 py-1 text-[10px] font-black rounded-md border transition-all ${
                showGifPicker
                  ? "bg-accent/20 border-accent/40 text-accent"
                  : "bg-white/4 border-white/10 text-ivory/30 hover:text-ivory/60"
              }`}
            >
              GIF
            </button>

            <div ref={aiMenuRefMobile} className="relative inline-flex">
              <button
                type="button"
                onClick={() => setAiMenuOpen((v) => !v)}
                title="AI tools"
                aria-label="AI tools"
                className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-black rounded-md border transition-all ${
                  aiMenuOpen
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
                    className={`w-full text-left px-3 py-2 text-[11px] transition-colors ${
                      text.trim()
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

            {!isGroup && (
              <button
                type="button"
                title="View scheduled messages"
                aria-label="View scheduled messages"
                onClick={() => {
                  setShowScheduledPanel((v) => !v);
                  refreshScheduled();
                }}
                className="px-2 py-1 text-[10px] font-black rounded-md border bg-white/4 border-white/10 text-ivory/30 hover:text-ivory/60"
              >
                PENDING
              </button>
            )}

            {!isGroup && (
              <button
                type="button"
                title="Schedule message"
                aria-label="Schedule message"
                onClick={() => {
                  setScheduleMode((v) => !v);
                  setShowScheduledPanel(true);
                }}
                className={`px-2 py-1 text-[10px] font-black rounded-md border transition-all ${
                  scheduleMode
                    ? "bg-accent/20 border-accent/40 text-accent"
                    : "bg-white/4 border-white/10 text-ivory/30 hover:text-ivory/60"
                }`}
              >
                SCHEDULE
              </button>
            )}

            {!isGroup && scheduleMode && (
              <input
                type="datetime-local"
                value={sendAt}
                min={new Date().toISOString().slice(0, 16)}
                onChange={(e) => setSendAt(e.target.value)}
                className="flex-1 min-w-0 px-2 py-1 rounded-md bg-accent border border-white/10 text-ivory/80 text-[11px]"
              />
            )}
          </div>
        </div>
      </form>
    </main>
  );
}
