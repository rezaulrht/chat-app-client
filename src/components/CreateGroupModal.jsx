"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  X,
  Upload,
  Users,
  UserPlus,
  Search,
  Check,
  Camera,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/app/api/Axios";
import { useSocket } from "@/hooks/useSocket";
import { getGroupInitials, getGroupAvatarColor } from "@/utils/groupAvatar";

const MAX_MEMBERS = 49;
const compressImage = (
  file,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.9,
) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target.result;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const isPNG = file.type === "image/png";
        const outputFormat = isPNG ? "image/png" : "image/jpeg";

        // Convert canvas to base64 string
        const base64 = canvas.toDataURL(
          outputFormat,
          isPNG ? undefined : quality,
        );

        // Cleanup
        img.onload = img.onerror = null;
        reader.onload = reader.onerror = null;
        img.src = "";
        canvas.width = canvas.height = 0;

        resolve(base64); // ✅ return base64 string
      };

      img.onerror = (error) => {
        img.onload = img.onerror = null;
        reader.onload = reader.onerror = null;
        reject(error);
      };
    };

    reader.onerror = (error) => {
      reader.onload = reader.onerror = null;
      reject(error);
    };
  });
};

export default function CreateGroupModal({ onGroupCreated }) {
  const { onlineUsers } = useSocket() || {};

  const [isOpen, setIsOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const searchInputRef = useRef(null);
  const fileInputRef = useRef(null);

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

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setAvatarFile(file);
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
      toast.error("Add at least 2 members");
      return;
    }

    setLoading(true);
    try {
      let avatarUrl = null;

      // Step 1: Upload avatar to ImgBB if one was selected
      if (avatarFile) {
        try {
          // Compress the image first
          const compressedImage = await compressImage(
            avatarFile,
            800,
            800,
            0.8,
          );

          // Upload to ImgBB via your backend
          const uploadRes = await api.post("/api/upload/avatar", {
            image: compressedImage,
          });

          avatarUrl = uploadRes.data.url;
        } catch (uploadErr) {
          console.error("Avatar upload failed:", uploadErr);
          toast.error(
            uploadErr.response?.data?.message || "Failed to upload avatar",
          );
          setLoading(false);
          return;
        }
      }

      // Step 2: Create the group with the ImgBB URL
      const res = await api.post("/api/chat/conversations/group", {
        name: groupName.trim(),
        description: description.trim(),
        avatar: avatarUrl, // ImgBB URL like "https://i.ibb.co/abc123/image.jpg"
        participantIds: selectedMembers.map((m) => m._id),
      });

      toast.success(`"${res.data.name}" created!`);
      if (onGroupCreated) onGroupCreated(res.data);
      handleClose();
    } catch (err) {
      console.error("createGroup error:", err);
      const msg = err.response?.data?.message || "Failed to create group";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setGroupName("");
    setDescription("");
    setSelectedMembers([]);
    setSearchQuery("");
    setSearchResults([]);
    removeAvatar();
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

      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-3 md:p-4"
            onClick={handleClose}
          >
            <div
              className="glass-card w-full max-w-md md:max-w-lg rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[90vh] ring-1 ring-white/[0.08]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-white/[0.06] shrink-0 relative">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
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
              </div>

              {/* Body */}
              <div className="overflow-y-auto flex-1 scrollbar-hide px-4 md:px-6 py-4 md:py-5 space-y-4 md:space-y-5">
                {/* Group Name */}
                <div>
                  <p className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-ivory/25 mb-2">
                    Group Name
                  </p>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    maxLength={100}
                    placeholder="Enter group name..."
                    className="w-full glass-card rounded-2xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-accent/30 text-ivory/80 placeholder:text-ivory/15 transition-all font-display"
                  />
                  <p className="text-[10px] text-ivory/10 mt-1.5 pl-1 font-mono">
                    {groupName.length}/100
                  </p>
                </div>

                {/* Group Avatar */}
                <div>
                  <p className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-ivory/25 mb-2">
                    Group Photo (Optional)
                  </p>
                  <div className="flex items-center gap-4">
                    {/* Avatar Preview */}
                    <div className="relative shrink-0">
                      <div
                        className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center ring-2 ring-accent/20"
                        style={{
                          background: avatarPreview
                            ? "transparent"
                            : groupName
                              ? avatarColor.bg
                              : "rgba(26,26,46,0.6)",
                        }}
                      >
                        {avatarPreview ? (
                          <Image
                            src={avatarPreview}
                            alt="Group avatar"
                            width={80}
                            height={80}
                            className="object-cover w-full h-full"
                            unoptimized
                          />
                        ) : groupName ? (
                          <span
                            className="text-2xl font-display font-black"
                            style={{ color: avatarColor.text }}
                          >
                            {initials}
                          </span>
                        ) : (
                          <Camera size={28} className="text-ivory/15" />
                        )}
                      </div>
                    </div>

                    {/* Upload/Remove Buttons */}
                    <div className="flex-1 flex flex-col gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />

                      {!avatarPreview ? (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent/10 border border-accent/20 text-accent hover:bg-accent/15 transition-all text-sm font-medium"
                        >
                          <Upload size={14} />
                          Upload Photo
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent/10 border border-accent/20 text-accent hover:bg-accent/15 transition-all text-sm font-medium"
                          >
                            <Camera size={14} />
                            Change
                          </button>
                          <button
                            type="button"
                            onClick={removeAvatar}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/15 transition-all text-sm font-medium"
                          >
                            <X size={14} />
                            Remove
                          </button>
                        </div>
                      )}

                      <p className="text-[10px] text-ivory/30 px-1">
                        JPG, PNG or GIF • Max 5MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description Field */}
                <div>
                  <p className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-ivory/25 mb-2">
                    Description (optional)
                  </p>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={500}
                    rows={3}
                    placeholder="What is this group about?"
                    className="w-full glass-card text-ivory text-sm p-3 rounded-xl border border-accent/30 focus:outline-none focus:ring-1 focus:ring-accent/30 resize-y min-h-[80px]"
                  />
                  <p className="text-right text-[10px] text-ivory/30 mt-1">
                    {description.length}/500
                  </p>
                </div>

                {/* Selected members chips */}
                {selectedMembers.length > 0 && (
                  <div>
                    <p className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-ivory/25 mb-2">
                      Members ({selectedMembers.length})
                    </p>
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
                  </div>
                )}

                {/* User search */}
                <div>
                  <p className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-ivory/25 mb-2">
                    Add Members
                  </p>
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
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-ivory/80 text-sm font-display font-semibold truncate">
                              {user.name}
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

              {/* Footer */}
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
