"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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

  // Debounced user search
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

  const addMember = (user) => {
    if (selectedMembers.length >= MAX_MEMBERS) {
      toast.error(`Groups can have at most ${MAX_MEMBERS + 1} members`);
      return;
    }
    setSelectedMembers((prev) => [...prev, user]);
    setSearchResults((prev) => prev.filter((u) => u._id !== user._id));
    setSearchQuery("");
  };

  const removeMember = (userId) => {
    setSelectedMembers((prev) => prev.filter((m) => m._id !== userId));
  };

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

  const initials = getGroupInitials(groupName);
  const avatarColor = getGroupAvatarColor(groupName);
  const canSubmit =
    !loading && groupName.trim().length > 0 && selectedMembers.length >= 2;

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-6 h-6 rounded-md text-ivory/30 hover:bg-white/[0.06] hover:text-ivory/60 flex items-center justify-center transition-all duration-200"
        title="New Group"
      >
        <UserPlus size={12} />
      </button>

      {/* Modal */}
      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={handleClose}
          >
            <div
              className="glass-card w-full max-w-lg rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[90vh] ring-1 ring-white/[0.08]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* ── Header ── */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] shrink-0 relative">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shadow-[0_0_16px_rgba(0,211,187,0.08)]">
                    <Users size={15} className="text-accent" />
                  </div>
                  <div>
                    <h2 className="text-ivory font-display font-bold text-sm leading-tight">
                      New Group
                    </h2>
                    <p className="text-ivory/20 text-[10px] font-mono">
                      Add at least 2 members
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="w-7 h-7 rounded-xl bg-white/[0.04] flex items-center justify-center hover:bg-white/[0.08] transition-all duration-200"
                >
                  <X size={14} className="text-ivory/30" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/10 to-transparent" />
              </div>

              {/* ── Scrollable body ── */}
              <div className="overflow-y-auto flex-1 scrollbar-hide px-6 py-5 space-y-5">
                {/* Avatar + Name row */}
                <div className="flex items-center gap-4">
                  {/* Avatar upload */}
                  <label className="cursor-pointer group shrink-0">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden relative border-2 border-dashed border-accent/30 hover:border-accent/60 transition-all duration-300 shadow-[0_0_20px_rgba(0,211,187,0.05)] hover:shadow-[0_0_20px_rgba(0,211,187,0.12)]">
                      {avatarPreview ? (
                        <>
                          <Image
                            src={avatarPreview}
                            alt="Group avatar"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                            <button
                              type="button"
                              onClick={removeAvatar}
                              className="text-ivory"
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
                              : "rgba(26,26,46,0.6)",
                          }}
                        >
                          {groupName ? (
                            <span
                              className="text-lg font-display font-black leading-none"
                              style={{ color: avatarColor.text }}
                            >
                              {initials}
                            </span>
                          ) : (
                            <Upload
                              size={18}
                              className="text-accent/50 group-hover:text-accent transition-colors"
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
                      placeholder="Group name..."
                      className="w-full glass-card rounded-2xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-accent/30 text-ivory/80 placeholder:text-ivory/15 transition-all font-display"
                    />
                    <p className="text-[10px] text-ivory/10 mt-1.5 pl-1 font-mono">
                      {groupName.length}/100
                    </p>
                  </div>
                </div>

                {/* Selected members chips */}
                {selectedMembers.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedMembers.map((member) => (
                      <div
                        key={member._id}
                        className="flex items-center gap-1.5 bg-accent/10 border border-accent/20 text-accent/80 pl-1 pr-2 py-1 rounded-full text-xs"
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
                        <span className="font-display font-semibold">
                          {member.name.split(" ")[0]}
                        </span>
                        <button
                          onClick={() => removeMember(member._id)}
                          className="text-accent/50 hover:text-red-400 transition-colors ml-0.5"
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
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/15"
                      size={14}
                    />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search people to add..."
                      className="w-full glass-card rounded-2xl py-2.5 pl-9 pr-4 text-sm outline-none focus:ring-1 focus:ring-accent/30 text-ivory/80 placeholder:text-ivory/15 transition-all"
                    />
                  </div>

                  <div className="space-y-0.5 max-h-52 overflow-y-auto scrollbar-hide">
                    {searching && (
                      <div className="flex items-center justify-center gap-2 py-5">
                        <div className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                        <p className="text-ivory/25 text-xs font-mono">
                          Searching...
                        </p>
                      </div>
                    )}

                    {!searching &&
                      searchQuery &&
                      searchResults.length === 0 && (
                        <p className="text-center text-ivory/15 text-xs py-5 font-mono">
                          No users found
                        </p>
                      )}

                    {!searching &&
                      !searchQuery &&
                      selectedMembers.length === 0 && (
                        <p className="text-center text-ivory/10 text-xs py-5">
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
                          className={
                            "flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-200 " +
                            (isSelected
                              ? "glass-card ring-1 ring-accent/20 opacity-50 cursor-not-allowed"
                              : "hover:bg-white/[0.04] hover:ring-1 hover:ring-accent/10")
                          }
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
                              className="rounded-xl"
                              unoptimized
                            />
                            {onlineUsers?.get(user._id)?.online && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-deep shadow-[0_0_6px_rgba(52,211,153,0.4)]" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-ivory/80 text-sm font-display font-semibold truncate">
                              {user.name}
                            </p>
                            <p
                              className={
                                "text-xs font-mono " +
                                (onlineUsers?.get(user._id)?.online
                                  ? "text-emerald-400"
                                  : "text-ivory/15")
                              }
                            >
                              {onlineUsers?.get(user._id)?.online
                                ? "Online"
                                : user.email}
                            </p>
                          </div>
                          {isSelected && (
                            <Check size={14} className="text-accent shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ── Footer ── */}
              <div className="px-6 py-4 border-t border-white/[0.06] flex gap-3 shrink-0">
                <button
                  onClick={handleClose}
                  className="flex-1 py-3 rounded-2xl text-sm font-medium border border-white/[0.06] text-ivory/30 hover:bg-white/[0.04] hover:text-ivory/60 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateGroup}
                  disabled={!canSubmit}
                  className="flex-1 py-3 rounded-2xl text-sm font-display font-bold bg-accent hover:bg-accent/85 disabled:bg-white/[0.04] disabled:text-ivory/15 text-obsidian disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.97] shadow-[0_8px_24px_-6px_rgba(0,211,187,0.3)] disabled:shadow-none"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-obsidian/40 border-t-transparent animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Users size={15} />
                      Create Group
                      {selectedMembers.length >= 2 && (
                        <span className="text-[10px] bg-obsidian/20 rounded-full px-1.5 py-0.5 font-mono font-bold">
                          {selectedMembers.length + 1}
                        </span>
                      )}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
