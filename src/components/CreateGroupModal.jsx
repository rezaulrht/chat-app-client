"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { X, Upload, Users, UserPlus, Search, Check } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/app/api/Axios";
import { useSocket } from "@/hooks/useSocket";
import { getGroupInitials, getGroupAvatarColor } from "@/utils/groupAvatar";

const MAX_MEMBERS = 49; // creator + 49 = 50 (MAX_GROUP_SIZE)

export default function CreateGroupModal({ onGroupCreated }) {
  const { onlineUsers } = useSocket() || {};

  const [isOpen, setIsOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const searchInputRef = useRef(null);

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  // Debounced user search — same API as the New Chat modal in SidebarChats
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get(
          `/api/chat/users?q=${encodeURIComponent(searchQuery)}`,
          { signal: controller.signal },
        );
        // Exclude already-selected members from results
        setSearchResults(
          res.data.filter((u) => !selectedMembers.some((m) => m._id === u._id)),
        );
      } catch (err) {
        if (err.name === "CanceledError" || err.code === "ERR_CANCELED") return;
        console.error("User search failed:", err);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery, selectedMembers]);

  // Avatar file picker
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const removeAvatar = (e) => {
    e.stopPropagation();
    setAvatarFile(null);
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(null);
  };

  // Add a user to the selection
  const addMember = (user) => {
    if (selectedMembers.length >= MAX_MEMBERS) {
      toast.error(`Groups can have at most ${MAX_MEMBERS + 1} members`);
      return;
    }
    setSelectedMembers((prev) => [...prev, user]);
    setSearchResults((prev) => prev.filter((u) => u._id !== user._id));
    setSearchQuery("");
  };

  // Remove a user from the selection
  const removeMember = (userId) => {
    setSelectedMembers((prev) => prev.filter((m) => m._id !== userId));
  };

  // Submit
  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }
    if (selectedMembers.length < 2) {
      toast.error("Add at least 2 members (3 total including you)");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/api/chat/conversations/group", {
        name: groupName.trim(),
        participantIds: selectedMembers.map((m) => m._id),
        avatar: avatarFile ? avatarPreview : undefined,
      });

      toast.success(`"${res.data.name}" created!`);
      if (onGroupCreated) onGroupCreated(res.data);
      handleClose();
    } catch (err) {
      console.error("createGroup error:", err);
      const msg =
        err.response?.data?.message || "Failed to create group. Try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setGroupName("");
    setSelectedMembers([]);
    setSearchQuery("");
    setSearchResults([]);
    setAvatarFile(null);
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(null);
  };

  const handleClose = () => {
    setIsOpen(false);
    resetForm();
  };

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  // Live group initials for the avatar preview
  const initials = getGroupInitials(groupName);
  const avatarColor = getGroupAvatarColor(groupName);

  const canSubmit =
    !loading && groupName.trim().length > 0 && selectedMembers.length >= 2;

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-8 h-8 rounded-xl bg-teal-normal/10 border border-teal-normal/20 flex items-center justify-center hover:bg-teal-normal/20 transition-all group"
        title="New Group"
      >
        <UserPlus
          size={15}
          className="text-teal-normal group-hover:scale-110 transition-transform"
        />
      </button>

      {/* Modal backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={handleClose}
        >
          <div
            className="bg-[#0f1318] w-full max-w-lg mx-4 rounded-3xl border border-white/8 shadow-2xl shadow-black/50 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Header ─────────────────────────────────────── */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/6 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-teal-normal/15 border border-teal-normal/25 flex items-center justify-center">
                  <Users size={14} className="text-teal-normal" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-sm leading-tight">
                    New Group
                  </h2>
                  <p className="text-slate-600 text-[10px]">
                    Add at least 2 members
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-7 h-7 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all"
              >
                <X size={14} className="text-slate-400" />
              </button>
            </div>

            {/* ── Scrollable body ─────────────────────────────── */}
            <div className="overflow-y-auto flex-1 scrollbar-hide px-6 py-5 space-y-5">
              {/* Avatar + Name row */}
              <div className="flex items-center gap-4">
                {/* Avatar upload */}
                <label className="cursor-pointer group shrink-0">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden relative border-2 border-dashed border-teal-normal/40 hover:border-teal-normal/70 transition-colors">
                    {avatarPreview ? (
                      <>
                        <Image
                          src={avatarPreview}
                          alt="Group avatar"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        {/* Remove overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <button
                            type="button"
                            onClick={removeAvatar}
                            className="text-white"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div
                        className="w-full h-full flex flex-col items-center justify-center gap-0.5 transition-colors"
                        style={{
                          backgroundColor: groupName
                            ? avatarColor.bg
                            : "#1a1f26",
                        }}
                      >
                        {groupName ? (
                          <span
                            className="text-lg font-black leading-none"
                            style={{ color: avatarColor.text }}
                          >
                            {initials}
                          </span>
                        ) : (
                          <Upload
                            size={18}
                            className="text-teal-normal/60 group-hover:text-teal-normal transition-colors"
                          />
                        )}
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>

                {/* Group name input */}
                <div className="flex-1">
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    maxLength={100}
                    placeholder="Group name…"
                    className="w-full bg-white/5 rounded-2xl py-3 px-4 text-sm outline-none border border-white/5 focus:border-teal-normal/40 focus:bg-white/8 text-slate-200 placeholder:text-slate-600 transition-all"
                  />
                  <p className="text-[10px] text-slate-700 mt-1.5 pl-1">
                    {groupName.length}/100 characters
                  </p>
                </div>
              </div>

              {/* Selected members chips */}
              {selectedMembers.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedMembers.map((member) => (
                    <div
                      key={member._id}
                      className="flex items-center gap-1.5 bg-teal-normal/12 border border-teal-normal/25 text-teal-300 pl-1 pr-2 py-1 rounded-full text-xs"
                    >
                      <Image
                        src={
                          member.avatar ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`
                        }
                        alt={member.name}
                        width={20}
                        height={20}
                        className="rounded-full"
                        unoptimized
                      />
                      <span className="font-medium">
                        {member.name.split(" ")[0]}
                      </span>
                      <button
                        onClick={() => removeMember(member._id)}
                        className="text-teal-400/60 hover:text-red-400 transition-colors ml-0.5"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* User search */}
              <div>
                <div className="relative mb-2">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                    size={14}
                  />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search people to add…"
                    className="w-full bg-white/5 rounded-2xl py-2.5 pl-9 pr-4 text-sm outline-none border border-white/5 focus:border-teal-normal/40 text-slate-200 placeholder:text-slate-600 transition-all"
                  />
                </div>

                {/* Results list */}
                <div className="space-y-0.5 max-h-52 overflow-y-auto scrollbar-hide">
                  {searching && (
                    <div className="flex items-center justify-center gap-2 py-5">
                      <div className="w-4 h-4 rounded-full border-2 border-teal-normal border-t-transparent animate-spin" />
                      <p className="text-slate-500 text-xs">Searching…</p>
                    </div>
                  )}

                  {!searching && searchQuery && searchResults.length === 0 && (
                    <p className="text-center text-slate-600 text-xs py-5">
                      No users found
                    </p>
                  )}

                  {!searching &&
                    !searchQuery &&
                    selectedMembers.length === 0 && (
                      <p className="text-center text-slate-700 text-xs py-5">
                        Search for friends to add to the group
                      </p>
                    )}

                  {searchResults.map((user) => {
                    const isSelected = selectedMembers.some(
                      (m) => m._id === user._id,
                    );
                    return (
                      <div
                        key={user._id}
                        onClick={() => !isSelected && addMember(user)}
                        className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer border transition-all ${
                          isSelected
                            ? "bg-teal-normal/8 border-teal-normal/20 opacity-50 cursor-not-allowed"
                            : "hover:bg-teal-normal/8 border-transparent hover:border-teal-normal/15"
                        }`}
                      >
                        <div className="relative shrink-0">
                          <Image
                            src={
                              user.avatar ||
                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`
                            }
                            alt={user.name}
                            width={38}
                            height={38}
                            className="rounded-full"
                            unoptimized
                          />
                          {onlineUsers?.get(user._id)?.online && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-[#0f1318]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-200 text-sm font-semibold truncate">
                            {user.name}
                          </p>
                          <p
                            className={`text-xs ${onlineUsers?.get(user._id)?.online ? "text-green-400" : "text-slate-600"}`}
                          >
                            {onlineUsers?.get(user._id)?.online
                              ? "● Online"
                              : user.email}
                          </p>
                        </div>
                        {isSelected && (
                          <Check
                            size={14}
                            className="text-teal-normal shrink-0"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── Footer ─────────────────────────────────────── */}
            <div className="px-6 py-4 border-t border-white/6 flex gap-3 shrink-0">
              <button
                onClick={handleClose}
                className="flex-1 py-3 rounded-2xl text-sm font-medium border border-white/8 text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={!canSubmit}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold bg-teal-normal hover:bg-teal-dark disabled:bg-white/8 disabled:text-slate-600 text-black disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-teal-normal/15"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-black/40 border-t-transparent animate-spin" />
                    Creating…
                  </>
                ) : (
                  <>
                    <Users size={15} />
                    Create Group
                    {selectedMembers.length >= 2 && (
                      <span className="text-[10px] bg-black/20 rounded-full px-1.5 py-0.5 font-bold">
                        {selectedMembers.length + 1}
                      </span>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
