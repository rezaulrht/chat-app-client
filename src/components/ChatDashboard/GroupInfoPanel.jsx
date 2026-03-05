"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
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
} from "lucide-react";
import api from "@/app/api/Axios";
import toast from "react-hot-toast";
import { getGroupInitials, getGroupAvatarColor } from "@/utils/groupAvatar";
import { isAdmin, isCreator, getMemberRole } from "@/utils/groupHelpers";

export default function GroupInfoPanel({
  conversation,
  onClose,
  onConversationUpdate,
  currentUser,
}) {
  /* ── Edit group name ── */
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(conversation?.name || "");
  const [savingName, setSavingName] = useState(false);

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

  const convId = conversation?._id;
  const amAdmin = isAdmin(conversation, currentUser?._id);
  const amCreator = isCreator(conversation, currentUser?._id);
  const avatarColors = getGroupAvatarColor(conversation?.name);
  const members = conversation?.participants || [];

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

  /* Sync editName when conversation changes */
  useEffect(() => {
    setEditName(conversation?.name || "");
  }, [conversation?.name]);

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
        { userId },
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

  return (
    <aside className="w-72 shrink-0 flex flex-col h-full bg-[#0f1318] border-l border-white/5 overflow-hidden">
      {/* ── Panel header ── */}
      <div className="h-[68px] flex items-center justify-between px-4 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <Users size={14} className="text-teal-400" />
          <span className="text-sm font-semibold text-slate-200">
            Group Info
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg hover:bg-white/6 flex items-center justify-center text-slate-500 hover:text-slate-300 transition-all"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* ── Group avatar + name ── */}
        <div className="flex flex-col items-center gap-3 py-6 px-4 border-b border-white/5">
          <div className="shrink-0">
            {conversation.avatar ? (
              <Image
                src={conversation.avatar}
                width={72}
                height={72}
                className="rounded-2xl object-cover"
                alt={conversation.name}
                unoptimized
              />
            ) : (
              <div
                className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center text-xl font-bold"
                style={{
                  background: avatarColors.bg,
                  color: avatarColors.text,
                }}
              >
                {getGroupInitials(conversation.name)}
              </div>
            )}
          </div>

          {editing ? (
            <div className="flex items-center gap-1.5 w-full max-w-[210px]">
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
                className="flex-1 bg-[#12181f] text-slate-100 text-sm font-semibold text-center px-3 py-1.5 rounded-xl border border-teal-normal/40 focus:outline-none focus:border-teal-normal min-w-0"
                maxLength={50}
              />
              <button
                onClick={handleSaveName}
                disabled={savingName}
                className="w-7 h-7 rounded-lg bg-teal-normal/20 border border-teal-normal/30 flex items-center justify-center text-teal-400 hover:bg-teal-normal/30 transition-all shrink-0"
              >
                {savingName ? (
                  <div className="w-3 h-3 rounded-full border-2 border-teal-normal border-t-transparent animate-spin" />
                ) : (
                  <Check size={12} />
                )}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-bold text-slate-100">
                {conversation.name}
              </h3>
              {amAdmin && (
                <button
                  onClick={() => {
                    setEditing(true);
                    setEditName(conversation.name);
                  }}
                  className="w-6 h-6 rounded-lg hover:bg-white/6 flex items-center justify-center text-slate-600 hover:text-teal-400 transition-all"
                >
                  <Edit2 size={11} />
                </button>
              )}
            </div>
          )}
          <p className="text-xs text-slate-500">
            {members.length} member{members.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* ── Add members (admin only) ── */}
        {amAdmin && (
          <div className="px-4 py-4 border-b border-white/5">
            <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-3">
              Add Members
            </p>
            <div className="relative">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none"
              />
              <input
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search users..."
                className="w-full bg-[#12181f] text-slate-200 text-sm pl-8 pr-3 py-2 rounded-xl border border-white/8 hover:border-white/12 focus:border-teal-normal/50 focus:outline-none transition-all placeholder:text-slate-600"
              />
            </div>

            {searching && (
              <div className="flex items-center gap-2 mt-2 text-slate-600 text-xs">
                <div className="w-3 h-3 rounded-full border border-teal-normal border-t-transparent animate-spin" />
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
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-left ${
                        selected
                          ? "bg-teal-normal/12 border border-teal-normal/25"
                          : "hover:bg-white/4 border border-transparent"
                      }`}
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
                      <span className="text-sm text-slate-300 flex-1 truncate">
                        {u.name}
                      </span>
                      {selected && (
                        <Check size={13} className="text-teal-400 shrink-0" />
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
                className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-teal-normal text-black font-bold text-sm transition-all hover:bg-teal-light active:scale-95 disabled:opacity-60"
              >
                {adding ? (
                  <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
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
        <div className="px-4 py-4">
          <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-3">
            Members
          </p>
          <div className="flex flex-col gap-0.5" ref={menuRef}>
            {members.map((member) => {
              const role = getMemberRole(conversation, member._id);
              const isMe = member._id === currentUser?._id;
              const menuOpen = openMenuId === member._id;
              const canRemove = amAdmin && !isMe && role !== "creator";
              const canPromote = amCreator && !isMe && role === "member";
              const canDemote = amCreator && !isMe && role === "admin";
              const hasMenu = canRemove || canPromote || canDemote;

              return (
                <div
                  key={member._id}
                  className="relative flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/4 group transition-all"
                >
                  <Image
                    src={
                      member.avatar ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`
                    }
                    width={32}
                    height={32}
                    className="rounded-xl object-cover shrink-0"
                    alt={member.name}
                    unoptimized
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 truncate font-medium">
                      {member.name}
                      {isMe && (
                        <span className="text-slate-500 font-normal ml-1 text-xs">
                          (you)
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Role badge */}
                  {role === "creator" && (
                    <span className="shrink-0 flex items-center gap-1 text-[9px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded-full">
                      <Crown size={8} />
                      Creator
                    </span>
                  )}
                  {role === "admin" && (
                    <span className="shrink-0 flex items-center gap-1 text-[9px] font-bold text-teal-400 bg-teal-400/10 border border-teal-400/20 px-1.5 py-0.5 rounded-full">
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
                      className="shrink-0 w-6 h-6 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/8 flex items-center justify-center text-slate-500 hover:text-slate-300 transition-all"
                    >
                      <MoreVertical size={13} />
                    </button>
                  )}

                  {/* Dropdown menu */}
                  {menuOpen && (
                    <div className="absolute right-2 top-10 z-50 bg-[#1a1f26] border border-white/8 rounded-xl shadow-2xl shadow-black/50 py-1 min-w-[148px]">
                      {canPromote && (
                        <button
                          onClick={() => handleToggleAdmin(member._id, true)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:bg-teal-normal/8 hover:text-teal-300 transition-all rounded-t-lg"
                        >
                          <ShieldCheck size={12} className="text-teal-400" />
                          Make Admin
                        </button>
                      )}
                      {canDemote && (
                        <button
                          onClick={() => handleToggleAdmin(member._id, false)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:bg-amber-500/8 hover:text-amber-300 transition-all"
                        >
                          <Shield size={12} className="text-amber-400" />
                          Remove Admin
                        </button>
                      )}
                      {canRemove && (canPromote || canDemote) && (
                        <div className="mx-2 my-1 h-px bg-white/6" />
                      )}
                      {canRemove && (
                        <button
                          onClick={() => handleRemoveMember(member._id)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:bg-red-500/8 hover:text-red-300 transition-all rounded-b-lg"
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
        <div className="px-4 pt-0 pb-6 border-t border-white/5">
          <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-3 pt-4">
            Actions
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={handleLeave}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-red-500/15 bg-red-500/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 text-sm font-medium transition-all"
            >
              <LogOut size={14} />
              Leave Group
            </button>
            {amCreator && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-red-500/25 bg-red-500/10 hover:bg-red-500/18 text-red-400 hover:text-red-300 text-sm font-medium transition-all"
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
