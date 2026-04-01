"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  X,
  Users,
  Search,
  UserPlus,
  Crown,
  Shield,
  ShieldCheck,
  LogOut,
  Trash2,
  Check,
  Edit2,
  MoreVertical,
  MessageSquare,
  Smile,
  ChevronRight,
  Bell,
  BellOff,
  Pencil,
} from "lucide-react";
import api from "@/app/api/Axios";
import toast from "react-hot-toast";
import { getGroupInitials, getGroupAvatarColor } from "@/utils/groupAvatar";
import { isAdmin, isCreator, getMemberRole } from "@/utils/groupHelpers";
import { useDmPrefs } from "@/hooks/useDmPrefs";

const QUICK_EMOJIS = [
  "❤️",
  "😂",
  "😮",
  "😢",
  "😡",
  "👍",
  "🔥",
  "✨",
  "🎉",
  "💯",
  "🙏",
  "😍",
];
const PALETTE = [
  "#00d3bb",
  "#818cf8",
  "#f472b6",
  "#fb923c",
  "#34d399",
  "#60a5fa",
  "#facc15",
  "#e879f9",
];

export default function GroupInfoPanel({
  conversation,
  onClose,
  onConversationUpdate,
  currentUser,
  onMuteChange,
}) {
  /* ── Edit group name ── */
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(conversation?.name || "");
  const [savingName, setSavingName] = useState(false);

  /* ── NEW: Edit group description ── */
  const [editingDesc, setEditingDesc] = useState(false);
  const [editDesc, setEditDesc] = useState(conversation?.description || "");
  const [savingDesc, setSavingDesc] = useState(false);

  /* ── Add members ── */
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedToAdd, setSelectedToAdd] = useState([]);
  const [adding, setAdding] = useState(false);

  /* ── Member action dropdown ── */
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);
  const searchTimeout = useRef(null);
  const router = useRouter();

  const sendDm = async (memberId) => {
    try {
      const res = await api.post("/api/chat/conversations", {
        participantId: memberId,
      });
      const convId = res.data?.conversation?._id || res.data?._id;
      if (convId) {
        setOpenMenuId(null);
        router.push(`/app/chat`);
        // Let parent know so the ChatDashboard highlights this conversation
        onConversationUpdate?.(res.data?.conversation || res.data);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to open DM");
    }
  };

  const convId = conversation?._id;
  const amAdmin = isAdmin(conversation, currentUser?._id);
  const amCreator = isCreator(conversation, currentUser?._id);
  const avatarColors = getGroupAvatarColor(conversation?.name);
  const members = conversation?.participants || [];

  const { prefs, update } = useDmPrefs(conversation);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [showNicknames, setShowNicknames] = useState(false);
  const [editingNickId, setEditingNickId] = useState(null);
  const [nickDraft, setNickDraft] = useState("");

  const themeColor = prefs.color || PALETTE[0];
  const chatEmoji = prefs.emoji || "👍";
  const muted = !!prefs.muted;

  /* Close dropdown when clicking outside */
  useEffect(() => {
    if (!openMenuId) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openMenuId]);

  /* Sync inputs when conversation changes */
  useEffect(() => {
    setEditName(conversation?.name || "");
    setEditDesc(conversation?.description || "");
    setShowEmojiPicker(false);
    setShowPalette(false);
  }, [conversation?.name, conversation?.description, convId]);

  /* ── User search ── */
  const handleSearchChange = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    clearTimeout(searchTimeout.current);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get(`/api/chat/users?q=${encodeURIComponent(q)}`);
        const memberIds = new Set(members.map((p) => p._id));
        setSearchResults(res.data.filter((u) => !memberIds.has(u._id)));
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  const toggleSelect = (user) => {
    setSelectedToAdd((prev) =>
      prev.find((u) => u._id === user._id)
        ? prev.filter((u) => u._id !== user._id)
        : [...prev, user],
    );
  };

  const handleAddMembers = async () => {
    if (!selectedToAdd.length) return;
    setAdding(true);
    try {
      const res = await api.patch(
        `/api/chat/conversations/${convId}/members/add`,
        { userIds: selectedToAdd.map((u) => u._id) },
      );
      onConversationUpdate?.(res.data);
      toast.success(
        `Added ${selectedToAdd.length} member${selectedToAdd.length > 1 ? "s" : ""}`,
      );
      setSelectedToAdd([]);
      setSearchQuery("");
      setSearchResults([]);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add members");
    } finally {
      setAdding(false);
    }
  };

  /* ── Save group name ── */
  const handleSaveName = async () => {
    const trimmed = editName.trim();
    if (!trimmed || trimmed === conversation.name) {
      setEditing(false);
      return;
    }
    setSavingName(true);
    try {
      const res = await api.patch(`/api/chat/conversations/${convId}/info`, {
        name: trimmed,
      });
      onConversationUpdate?.(res.data);
      toast.success("Group name updated");
      setEditing(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update name");
    } finally {
      setSavingName(false);
    }
  };

  /* ── Remove member ── */
  const handleRemoveMember = async (userId) => {
    setOpenMenuId(null);
    try {
      const res = await api.patch(
        `/api/chat/conversations/${convId}/members/remove`,
        { userIds: [userId] },
      );
      onConversationUpdate?.(res.data);
      toast.success("Member removed");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to remove member");
    }
  };

  /* ── Promote / demote admin ── */
  const handleToggleAdmin = async (userId, promote) => {
    setOpenMenuId(null);
    try {
      const endpoint = promote ? "admins/add" : "admins/remove";
      const res = await api.patch(
        `/api/chat/conversations/${convId}/${endpoint}`,
        { userId },
      );
      onConversationUpdate?.(res.data);
      toast.success(promote ? "Promoted to admin" : "Admin removed");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update admin");
    }
  };

  /* ── Leave group ── */
  const handleLeave = async () => {
    if (!confirm("Are you sure you want to leave this group?")) return;
    try {
      await api.post(`/api/chat/conversations/${convId}/leave`);
      onConversationUpdate?.({ _id: convId, _removed: true });
      toast.success("Left the group");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to leave group");
    }
  };

  /* ── Delete group (creator only) ── */
  const handleDelete = async () => {
    if (
      !confirm(
        `Delete "${conversation.name}"? This action cannot be undone and all messages will be lost.`,
      )
    )
      return;
    try {
      await api.delete(`/api/chat/conversations/${convId}`);
      onConversationUpdate?.({ _id: convId, _deleted: true });
      toast.success("Group deleted");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete group");
    }
  };

  const handleSaveDescription = async () => {
    const trimmed = editDesc.trim();
    if (trimmed === conversation?.description) {
      setEditingDesc(false);
      return;
    }
    setSavingDesc(true);
    try {
      const res = await api.patch(`/api/chat/conversations/${convId}/info`, {
        description: trimmed,
      });
      onConversationUpdate?.(res.data);
      toast.success("Description updated");
      setEditingDesc(false);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to update description",
      );
    } finally {
      setSavingDesc(false);
    }
  };

  return (
    <aside className="w-full sm:w-80 shrink-0 flex flex-col h-full bg-slate-surface/90 backdrop-blur-2xl md:border-l border-white/[0.08] overflow-hidden">
      {/* ── Panel header ── */}
      <div className="h-[68px] flex items-center justify-between px-5 border-b border-white/[0.06] shrink-0 relative">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
            <Users size={13} className="text-accent" />
          </div>
          <span className="text-sm font-display font-bold text-ivory/80">
            Group Info
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-xl hover:bg-white/[0.06] flex items-center justify-center text-ivory/20 hover:text-ivory/50 transition-all duration-200"
        >
          <X size={14} />
        </button>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/10 to-transparent" />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* ── Group avatar + name ── */}
        <div className="flex flex-col items-center gap-4 py-8 px-5 border-b border-white/[0.06] relative">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 blur-[80px] rounded-full pointer-events-none opacity-20"
            style={{ background: themeColor }}
          />
          <div className="relative z-10 shrink-0">
            {conversation.avatar ? (
              <div
                className="ring-2 ring-offset-4 ring-offset-obsidian rounded-2xl"
                style={{ "--tw-ring-color": themeColor }}
              >
                <Image
                  src={conversation.avatar}
                  width={80}
                  height={80}
                  className="rounded-2xl object-cover"
                  alt={conversation.name}
                  unoptimized
                />
              </div>
            ) : (
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-display font-bold ring-2 ring-offset-4 ring-offset-obsidian shadow-lg"
                style={{
                  background: avatarColors.bg,
                  color: avatarColors.text,
                  "--tw-ring-color": themeColor,
                }}
              >
                {getGroupInitials(conversation.name)}
              </div>
            )}
          </div>

          {editing ? (
            <div className="flex items-center gap-1.5 w-full max-w-[220px] relative z-10">
              <input
                autoFocus
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveName();
                  if (e.key === "Escape") {
                    setEditing(false);
                    setEditName(conversation.name);
                  }
                }}
                className="flex-1 glass-card text-ivory font-display font-bold text-sm text-center px-3 py-2 rounded-xl border-accent/40 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 min-w-0 transition-all"
                maxLength={50}
              />
              <button
                onClick={handleSaveName}
                disabled={savingName}
                className="w-8 h-8 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center text-accent hover:bg-accent/25 transition-all shrink-0"
              >
                {savingName ? (
                  <div className="w-3 h-3 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                ) : (
                  <Check size={13} />
                )}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 relative z-10">
              <h3 className="text-lg font-display font-bold text-ivory">
                {conversation.name}
              </h3>
              {amAdmin && (
                <button
                  onClick={() => {
                    setEditing(true);
                    setEditName(conversation.name);
                  }}
                  className="w-6 h-6 rounded-lg hover:bg-white/[0.06] flex items-center justify-center text-ivory/15 hover:text-accent transition-all duration-200"
                >
                  <Edit2 size={11} />
                </button>
              )}
            </div>
          )}
          <p className="text-[11px] font-mono text-ivory/25 uppercase tracking-[0.15em] relative z-10">
            {members.length} member{members.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* ── Group Description (NEW) ── */}
        <div className="px-5 py-6 border-b border-white/[0.06]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-ivory/25">
              Description
            </p>
            {amAdmin && (
              <button
                type="button"
                onClick={() => {
                  if (editingDesc) {
                    // Cancelling edit - reset to original
                    setEditDesc(group.description || "");
                  }
                  setEditingDesc(!editingDesc);
                }}
                className="..."
              >
                {editingDesc ? "Cancel" : "Edit"}
              </button>
            )}
          </div>

          {editingDesc ? (
            <div className="space-y-2">
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                maxLength={500}
                rows={4}
                className="w-full glass-card text-ivory text-sm p-3 rounded-xl border border-accent/30 focus:outline-none resize-y min-h-[100px]"
                placeholder="Write a short description about this group..."
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setEditingDesc(false);
                    setEditDesc(conversation?.description || "");
                  }}
                  className="px-4 py-1.5 text-xs text-ivory/50 hover:text-ivory"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDescription}
                  disabled={savingDesc}
                  className="px-4 py-1.5 text-xs bg-accent text-black font-medium rounded-xl disabled:opacity-50"
                >
                  {savingDesc ? "Saving..." : "Save"}
                </button>
              </div>
              <p className="text-[10px] text-right text-ivory/30">
                {editDesc.length}/500
              </p>
            </div>
          ) : (
            <p className="text-sm text-ivory/60 leading-relaxed">
              {conversation?.description || (
                <span className="italic text-ivory/30">
                  No description yet.
                </span>
              )}
            </p>
          )}
        </div>

        {/* ── Customise ── */}
        <div className="px-5 py-5 border-b border-white/[0.06] space-y-1">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="w-0.5 h-3 rounded-full"
              style={{ background: themeColor }}
            />
            <p className="text-[10px] font-mono font-bold text-ivory/25 uppercase tracking-[0.15em]">
              Customise Group
            </p>
          </div>

          {/* Chat emoji */}
          <div className="relative">
            <button
              onClick={() => {
                setShowEmojiPicker(!showEmojiPicker);
                setShowPalette(false);
                setShowNicknames(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-all group"
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${themeColor}22` }}
              >
                <Smile size={14} style={{ color: themeColor }} />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[11px] font-mono text-ivory/30 mb-0.5">
                  Chat Emoji
                </p>
                <p className="text-sm">{chatEmoji}</p>
              </div>
              <ChevronRight
                size={13}
                className="text-ivory/20 group-hover:text-ivory/40 shrink-0 transition-colors"
              />
            </button>
            {showEmojiPicker && (
              <div className="mx-3 mb-2 p-3 rounded-2xl bg-deep/80 backdrop-blur-xl border border-white/[0.06] shadow-2xl">
                <p className="text-[9px] font-mono text-ivory/25 uppercase tracking-widest mb-2">
                  Pick a reaction emoji
                </p>
                <div className="grid grid-cols-6 gap-2">
                  {QUICK_EMOJIS.map((em) => (
                    <button
                      key={em}
                      onClick={() => {
                        update("emoji", em);
                        setShowEmojiPicker(false);
                      }}
                      className={`text-xl flex items-center justify-center p-1.5 rounded-xl transition-all hover:scale-110 hover:bg-white/[0.06] ${chatEmoji === em ? "scale-110 ring-1" : ""}`}
                      style={chatEmoji === em ? { ringColor: themeColor } : {}}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Chat colour */}
          <div className="relative">
            <button
              onClick={() => {
                setShowPalette(!showPalette);
                setShowEmojiPicker(false);
                setShowNicknames(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-all group"
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${themeColor}22` }}
              >
                <div
                  className="w-4 h-4 rounded-full border-2 border-white/20"
                  style={{ background: themeColor }}
                />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[11px] font-mono text-ivory/30 mb-0.5">
                  Chat Colour
                </p>
                <div className="flex gap-1 items-center">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: themeColor }}
                  />
                  <span className="text-[11px] font-mono text-ivory/40">
                    {themeColor}
                  </span>
                </div>
              </div>
              <ChevronRight
                size={13}
                className="text-ivory/20 group-hover:text-ivory/40 shrink-0 transition-colors"
              />
            </button>
            {showPalette && (
              <div className="mx-3 mb-2 p-3 rounded-2xl bg-deep/80 backdrop-blur-xl border border-white/[0.06] shadow-2xl">
                <p className="text-[9px] font-mono text-ivory/25 uppercase tracking-widest mb-2">
                  Choose a colour
                </p>
                <div className="flex flex-wrap gap-2">
                  {PALETTE.map((c) => (
                    <button
                      type="button"
                      key={c}
                      aria-label={`Set chat colour to ${c}`}
                      title={`Set chat colour to ${c}`}
                      onClick={() => {
                        update("color", c);
                        setShowPalette(false);
                      }}
                      className={`w-8 h-8 rounded-xl transition-all hover:scale-110 border-2 ${themeColor === c ? "scale-110" : "border-transparent"}`}
                      style={{
                        background: c,
                        borderColor: themeColor === c ? "white" : "transparent",
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Nicknames */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNicknames(!showNicknames);
                setShowEmojiPicker(false);
                setShowPalette(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-all group"
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${themeColor}22` }}
              >
                <Pencil size={14} style={{ color: themeColor }} />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[11px] font-mono text-ivory/30 mb-0.5">
                  Nicknames
                </p>
                <p className="text-[12px] truncate text-ivory/60">
                  Edit member nicknames
                </p>
              </div>
              <ChevronRight
                size={13}
                className="text-ivory/20 group-hover:text-ivory/40 shrink-0 transition-colors"
              />
            </button>
            {showNicknames && (
              <div className="mx-3 mb-2 p-2 rounded-2xl bg-deep/80 backdrop-blur-xl border border-white/[0.06] shadow-2xl flex flex-col gap-1 max-h-48 overflow-y-auto scrollbar-hide">
                {members.map((m) => {
                  const currentNick =
                    conversation?.customisation?.nicknames?.[m._id] || "";
                  const isEditing = editingNickId === m._id;

                  return (
                    <div
                      key={m._id}
                      className="flex items-center justify-between gap-2 p-2 bg-white/[0.03] rounded-xl hover:bg-white/[0.05] transition-all"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Image
                          src={
                            m.avatar ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.name}`
                          }
                          width={24}
                          height={24}
                          className="rounded-md object-cover"
                          alt=""
                          unoptimized
                        />
                        {isEditing ? (
                          <input
                            type="text"
                            autoFocus
                            value={nickDraft}
                            onChange={(e) => setNickDraft(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                update("nickname", nickDraft.trim(), m._id);
                                setEditingNickId(null);
                              } else if (e.key === "Escape") {
                                setEditingNickId(null);
                              }
                            }}
                            className="bg-black/20 border border-white/10 rounded-lg px-2 py-1 text-xs text-ivory focus:outline-none focus:border-accent/40 w-full"
                          />
                        ) : (
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-ivory truncate">
                              {currentNick || m.name}
                            </p>
                            {currentNick && (
                              <p className="text-[9px] text-ivory/30 font-mono truncate">
                                {m.name}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {isEditing ? (
                        <button
                          onClick={() => {
                            update("nickname", nickDraft.trim(), m._id);
                            setEditingNickId(null);
                          }}
                          className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 bg-accent/20 text-accent hover:bg-accent/30 transition-all"
                        >
                          <Check size={12} />
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingNickId(m._id);
                            setNickDraft(currentNick);
                          }}
                          className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 bg-white/5 text-ivory/40 hover:text-white hover:bg-white/10 transition-all"
                        >
                          <Pencil size={12} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Mute */}
          <button
            onClick={() => {
              const newVal = !muted;
              update("muted", newVal);
              onMuteChange?.(conversation._id, newVal);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-all"
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${themeColor}22` }}
            >
              {muted ? (
                <BellOff size={14} style={{ color: themeColor }} />
              ) : (
                <Bell size={14} style={{ color: themeColor }} />
              )}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[11px] font-mono text-ivory/30">
                Notifications
              </p>
              <p className="text-sm text-ivory/60">{muted ? "Muted" : "On"}</p>
            </div>
            <div
              className="w-9 h-5 rounded-full transition-colors relative shrink-0"
              style={{
                background: muted ? "rgba(255,255,255,0.1)" : `${themeColor}60`,
              }}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${muted ? "left-0.5" : "left-4"}`}
              />
            </div>
          </button>
        </div>

        {/* ── Add members (admin only) ── */}
        {amAdmin && (
          <div className="px-5 py-5 border-b border-white/[0.06]">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-0.5 h-3 rounded-full bg-accent/30" />
              <p className="text-[10px] font-mono font-bold text-ivory/25 uppercase tracking-[0.15em]">
                Add Members
              </p>
            </div>
            <div className="relative">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/20 pointer-events-none"
              />
              <input
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search users..."
                className="w-full glass-card text-ivory/80 text-sm pl-9 pr-3 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-accent/30 transition-all placeholder:text-ivory/15"
              />
            </div>

            {searching && (
              <div className="flex items-center gap-2 mt-3 text-ivory/20 text-xs font-mono">
                <div className="w-3 h-3 rounded-full border border-accent border-t-transparent animate-spin" />
                Searching...
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="mt-2 flex flex-col gap-0.5 max-h-44 overflow-y-auto scrollbar-hide">
                {searchResults.map((u) => {
                  const selected = !!selectedToAdd.find((s) => s._id === u._id);
                  return (
                    <button
                      key={u._id}
                      onClick={() => toggleSelect(u)}
                      className={
                        "flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-200 text-left " +
                        (selected
                          ? "glass-card ring-1 ring-accent/25"
                          : "hover:bg-white/[0.04]")
                      }
                    >
                      <Image
                        src={
                          u.avatar ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`
                        }
                        width={28}
                        height={28}
                        className="rounded-lg object-cover shrink-0"
                        alt={u.name}
                        unoptimized
                      />
                      <span className="text-sm text-ivory/60 flex-1 truncate font-medium">
                        {u.name}
                      </span>
                      {selected && (
                        <Check size={13} className="text-accent shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {selectedToAdd.length > 0 && (
              <button
                onClick={handleAddMembers}
                disabled={adding}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent text-obsidian font-display font-bold text-sm transition-all hover:bg-accent/90 active:scale-[0.97] disabled:opacity-60 shadow-[0_8px_24px_-6px_rgba(0,211,187,0.3)]"
              >
                {adding ? (
                  <div className="w-4 h-4 rounded-full border-2 border-obsidian border-t-transparent animate-spin" />
                ) : (
                  <>
                    <UserPlus size={14} />
                    Add {selectedToAdd.length} Member
                    {selectedToAdd.length > 1 ? "s" : ""}
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* ── Members list ── */}
        <div className="px-5 py-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-0.5 h-3 rounded-full bg-accent/30" />
            <p className="text-[10px] font-mono font-bold text-ivory/25 uppercase tracking-[0.15em]">
              Members
            </p>
          </div>
          <div className="flex flex-col gap-0.5" ref={menuRef}>
            {members.map((member) => {
              const role = getMemberRole(conversation, member._id);
              const isMe = member._id === currentUser?._id;
              const menuOpen = openMenuId === member._id;
              const canRemove = amAdmin && !isMe && role !== "creator";
              const canPromote = amCreator && !isMe && role === "member";
              const canDemote = amCreator && !isMe && role === "admin";
              const hasMenu = !isMe;

              return (
                <div
                  key={member._id}
                  className="relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] group transition-all duration-200"
                >
                  <div className="relative shrink-0">
                    <Image
                      src={
                        member.avatar ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`
                      }
                      width={34}
                      height={34}
                      className="rounded-xl object-cover"
                      alt={member.name}
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ivory/80 truncate font-display font-semibold">
                      {member.name}
                      {isMe && (
                        <span className="text-ivory/20 font-normal ml-1 text-xs font-mono">
                          (you)
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Role badge */}
                  {role === "creator" && (
                    <span className="shrink-0 flex items-center gap-1 text-[9px] font-mono font-bold text-amber-400 bg-amber-400/10 border border-amber-400/15 px-2 py-0.5 rounded-full">
                      <Crown size={8} />
                      Creator
                    </span>
                  )}
                  {role === "admin" && (
                    <span className="shrink-0 flex items-center gap-1 text-[9px] font-mono font-bold text-accent bg-accent/10 border border-accent/15 px-2 py-0.5 rounded-full">
                      <ShieldCheck size={8} />
                      Admin
                    </span>
                  )}

                  {/* Action menu button */}
                  {hasMenu && (
                    <button
                      onClick={() =>
                        setOpenMenuId(menuOpen ? null : member._id)
                      }
                      className="shrink-0 w-6 h-6 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/[0.06] flex items-center justify-center text-ivory/20 hover:text-ivory/50 transition-all duration-200"
                    >
                      <MoreVertical size={13} />
                    </button>
                  )}

                  {/* Dropdown menu */}
                  {menuOpen && (
                    <div className="absolute right-2 top-11 z-50 bg-[#13131c] border border-white/10 rounded-xl shadow-[0_8px_40px_rgba(0,0,0,0.6)] py-1 min-w-[156px]">
                      {/* Send DM — always available for non-self */}
                      <button
                        onClick={() => sendDm(member._id)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-ivory/50 hover:bg-accent/8 hover:text-accent transition-all rounded-t-lg"
                      >
                        <MessageSquare size={12} className="text-accent/60" />
                        Send Message
                      </button>
                      {(canPromote || canDemote || canRemove) && (
                        <div className="mx-3 my-1 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
                      )}
                      {canPromote && (
                        <button
                          onClick={() => handleToggleAdmin(member._id, true)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-ivory/50 hover:bg-accent/8 hover:text-accent transition-all rounded-t-lg"
                        >
                          <ShieldCheck size={12} className="text-accent/60" />
                          Make Admin
                        </button>
                      )}
                      {canDemote && (
                        <button
                          onClick={() => handleToggleAdmin(member._id, false)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-ivory/50 hover:bg-amber-500/8 hover:text-amber-300 transition-all"
                        >
                          <Shield size={12} className="text-amber-400/60" />
                          Remove Admin
                        </button>
                      )}
                      {canRemove && (canPromote || canDemote) && (
                        <div className="mx-3 my-1 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
                      )}
                      {canRemove && (
                        <button
                          onClick={() => handleRemoveMember(member._id)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400/80 hover:bg-red-500/8 hover:text-red-300 transition-all rounded-b-lg"
                        >
                          <X size={12} />
                          Remove
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Danger zone ── */}
        <div className="px-5 pt-0 pb-6 border-t border-white/[0.06]">
          <div className="flex items-center gap-2 mb-3 pt-5">
            <span className="w-0.5 h-3 rounded-full bg-red-500/30" />
            <p className="text-[10px] font-mono font-bold text-ivory/25 uppercase tracking-[0.15em]">
              Danger Zone
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={handleLeave}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-red-500/10 bg-red-500/[0.04] hover:bg-red-500/[0.08] text-red-400/80 hover:text-red-300 text-sm font-medium transition-all duration-200"
            >
              <LogOut size={14} />
              Leave Group
            </button>
            {amCreator && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-red-500/20 bg-red-500/[0.08] hover:bg-red-500/[0.12] text-red-400/80 hover:text-red-300 text-sm font-medium transition-all duration-200"
              >
                <Trash2 size={14} />
                Delete Group
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
