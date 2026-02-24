"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, Upload, Users, UserPlus } from "lucide-react";
import Image from "next/image";

const dummyUsers = [
  { id: "1", name: "Rakib Hoshen", avatar: "https://i.pravatar.cc/150?img=12" },
  {
    id: "2",
    name: "Farjana Aktar",
    avatar: "https://i.pravatar.cc/150?img=47",
  },
  { id: "3", name: "Samad alom", avatar: "https://i.pravatar.cc/150?img=65" },
  { id: "4", name: "Hero Alom", avatar: "https://i.pravatar.cc/150?img=33" },
  { id: "5", name: "Potol vai", avatar: "https://i.pravatar.cc/150?img=68" },
  { id: "6", name: "Kallu Mama", avatar: "https://i.pravatar.cc/150?img=22" },
  { id: "7", name: "Anuar vai", avatar: "https://i.pravatar.cc/150?img=9" },
  { id: "8", name: "Patuary Vai", avatar: "https://i.pravatar.cc/150?img=44" },
];

export default function CreateGroupModal({ onGroupCreated }) {
  const [isOpen, setIsOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const [allUsers] = useState(dummyUsers);

  const filteredUsers = allUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedMembers.some((m) => m.id === user.id),
  );

  // Avatar Upload
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  // Select / Deselect Member
  const toggleMember = (user) => {
    if (selectedMembers.some((m) => m.id === user.id)) {
      setSelectedMembers(selectedMembers.filter((m) => m.id !== user.id));
    } else {
      setSelectedMembers([...selectedMembers, user]);
    }
  };

  const removeMember = (id) => {
    setSelectedMembers(selectedMembers.filter((m) => m.id !== id));
  };

  // Create Group
  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedMembers.length === 0) {
      alert("You must provide a group name and at least 1 member!");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("name", groupName.trim());
    formData.append(
      "members",
      JSON.stringify(selectedMembers.map((m) => m.id)),
    );
    if (avatarFile) formData.append("avatar", avatarFile);

    try {
      const res = await axios.post("/api/groups/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("🎉 Group Created Successfully!");
      if (onGroupCreated) onGroupCreated(res.data);

      // Reset & Close
      setIsOpen(false);
      resetForm();
    } catch (error) {
      console.error(error);
      alert("❌ There was a problem creating the group");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setGroupName("");
    setSelectedMembers([]);
    setSearchTerm("");
    setAvatarFile(null);
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(null);
  };

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  return (
    <>
      {/* CREATE GROUP BUTTON */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-white hover:text-[#13c8ec]/90  py-2.5 rounded-xl font-medium transition-all active:scale-95"
      >
        <UserPlus size={20} />
      </button>

      {/* MODAL */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b dark:border-gray-800 px-6 py-4">
              <div className="flex items-center gap-3">
                <Users className="text-amber-600" size={28} />
                <h2 className="text-2xl font-bold">Create New Group</h2>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-red-500 transition"
              >
                <X size={28} />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Group Avatar */}
              <div className="flex flex-col items-center">
                <label className="cursor-pointer group">
                  <div className="w-28 h-28 rounded-2xl border-4 border-dashed border-amber-400 overflow-hidden relative">
                    {avatarPreview ? (
                      <Image
                        src={avatarPreview}
                        alt="Group Avatar"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full dark:bg-gray-800 flex items-center justify-center">
                        <Upload className="text-amber-500" size={40} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                      <span className="text-white text-sm font-medium">
                        Change
                      </span>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  Optional Group Photo
                </p>
              </div>

              {/* Group Name */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Group Name
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g. Team Undefined 🔥"
                  className="w-full px-4 py-3 bg-gray-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-lg"
                />
              </div>

              {/* Search & Select Members */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Add Members ({selectedMembers.length} selected)
                </label>

                <input
                  type="text"
                  placeholder="Search friends..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 rounded-2xl mb-4 focus:outline-none"
                />

                {/* Users List */}
                <div className="max-h-56 overflow-y-auto space-y-2 pr-2 custom-scroll">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => toggleMember(user)}
                      className="flex items-center gap-3 p-3 hover:bg-gray-800 dark:hover:bg-gray-800 rounded-2xl cursor-pointer transition"
                    >
                      <input
                        type="checkbox"
                        checked={selectedMembers.some((m) => m.id === user.id)}
                        readOnly
                        className="w-5 h-5 accent-amber-600"
                      />
                      <Image
                        src={user.avatar}
                        alt={user.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <span className="font-medium">{user.name}</span>
                    </div>
                  ))}
                  {filteredUsers.length === 0 && (
                    <p className="text-center text-gray-500 py-4">
                      No users found 😕
                    </p>
                  )}
                </div>
              </div>

              {/* Selected Members Preview */}
              {selectedMembers.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-3">Selected Members</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-4 py-1.5 rounded-3xl text-sm"
                      >
                        <Image
                          src={member.avatar}
                          alt=""
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                        {member.name}
                        <button
                          onClick={() => removeMember(member.id)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-5 flex gap-3">
              <button
                onClick={() => {
                  setIsOpen(false);
                  resetForm();
                }}
                className="flex-1 py-3.5 rounded-2xl font-medium border border-gray-300 dark:border-gray-700 hover:bg-gray-800 dark:hover:bg-gray-800"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateGroup}
                disabled={
                  loading || !groupName.trim() || selectedMembers.length === 0
                }
                className="flex-1 py-3.5 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-700 text-white font-semibold rounded-2xl transition flex items-center justify-center gap-2"
              >
                {loading ? "Creating..." : "✅ Create Group"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
