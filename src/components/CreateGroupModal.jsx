"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, Upload, Users, Search } from "lucide-react";
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

export default function CreateGroupModal({ onGroupCreated, isOpen, onClose }) {
  const [groupName, setGroupName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allUsers, setAllUsers] = useState(dummyUsers);

  // Focus search input or reset when modal opens
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

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
      // Endpoint might need verification, using original from Step 534
      const res = await axios.post("/api/groups/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("🎉 Group Created Successfully!");
      if (onGroupCreated) onGroupCreated(res.data);
      onClose();
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
      {/* MODAL */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-background-dark/95 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-500"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-dark w-full max-w-4xl rounded-[2rem] border border-white/5 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh] relative"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 px-8 py-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-teal-normal/5 blur-3xl rounded-full -mr-32 -mt-32 pointer-events-none"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-teal-normal/10 flex items-center justify-center border border-teal-normal/20">
                  <Users className="text-teal-normal" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight">
                    Create Group
                  </h2>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">
                    Architecture
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all active:scale-90 relative z-10"
              >
                <X size={20} />
              </button>
            </div>

            {/* TWO-COLUMN LAYOUT */}
            <div className="flex flex-1 overflow-hidden">
              {/* Left Column: Group Name and Picture */}
              <div className="w-80 border-r border-white/5 bg-background-dark/20 p-8 flex flex-col gap-8">
                <div className="space-y-4">
                  <label className="cursor-pointer group relative flex justify-center">
                    <div className="w-32 h-32 rounded-[2rem] border-2 border-dashed border-teal-normal/20 overflow-hidden relative group-hover:border-teal-normal transition-all duration-300 bg-background-dark shadow-2xl flex items-center justify-center">
                      {avatarPreview ? (
                        <Image
                          src={avatarPreview}
                          alt="Preview"
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-teal-normal/30 group-hover:text-teal-normal transition-colors">
                          <Upload size={32} strokeWidth={1.5} />
                          <span className="text-[10px] font-black uppercase tracking-tighter">
                            Avatar
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-teal-normal/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <Upload className="text-black" size={24} />
                      </div>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleAvatarChange}
                      accept="image/*"
                    />
                  </label>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                    Group Name
                  </p>
                  <div className="relative group">
                    <input
                      type="text"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="Enter name..."
                      className="w-full bg-background-dark/50 border border-white/5 rounded-xl px-4 py-4 outline-none text-white font-bold focus:border-teal-normal/40 focus:bg-background-dark/80 transition-all placeholder:text-slate-600 shadow-inner"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="mt-auto">
                  <div className="flex items-center gap-2 px-1 text-slate-500">
                    <Users size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      {selectedMembers.length} Selected
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Member Selection */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-6">
                  {/* Search bar */}
                  <div className="relative group/search">
                    <Search
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/search:text-teal-normal transition-all duration-300"
                    />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search members..."
                      className="w-full bg-background-dark/40 border border-white/5 rounded-2xl py-4 pl-12 pr-6 outline-none text-sm font-medium focus:border-teal-normal/20 focus:bg-background-dark/60 transition-all text-slate-200"
                    />
                  </div>

                  {/* Users List */}
                  <div className="grid grid-cols-2 gap-2">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => toggleMember(user)}
                        className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-2xl cursor-pointer transition-all group active:scale-[0.98] border border-transparent hover:border-white/5"
                      >
                        <div
                          className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${selectedMembers.some((m) => m.id === user.id) ? "bg-teal-normal border-teal-normal" : "border-white/10 group-hover:border-teal-normal/40"}`}
                        >
                          {selectedMembers.some((m) => m.id === user.id) && (
                            <span className="text-[12px] text-black font-black">
                              ✓
                            </span>
                          )}
                        </div>
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 shadow-lg">
                          <Image
                            src={user.avatar}
                            alt={user.name}
                            width={40}
                            height={40}
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors block truncate">
                            {user.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {filteredUsers.length === 0 && (
                    <div className="flex flex-col items-center gap-2 py-12 opacity-50">
                      <Users size={24} strokeWidth={1} />
                      <p className="text-[10px] font-black uppercase tracking-widest text-center">
                        No results
                      </p>
                    </div>
                  )}

                  {/* Chips for selected members */}
                  {selectedMembers.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
                      {selectedMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-2 bg-teal-normal/10 text-teal-normal pl-1.5 pr-2 py-1 rounded-lg text-[11px] font-black border border-teal-normal/20"
                        >
                          <div className="w-5 h-5 rounded-md overflow-hidden">
                            <Image
                              src={member.avatar}
                              alt=""
                              width={20}
                              height={20}
                              className="object-cover"
                            />
                          </div>
                          <span className="truncate max-w-[80px]">
                            {member.name.split(" ")[0]}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeMember(member.id);
                            }}
                            className="hover:text-red-400 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Section */}
                <div className="p-6 bg-background-dark/40 border-t border-white/5 flex items-center justify-end gap-4">
                  <button
                    onClick={onClose}
                    className="px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-white hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleCreateGroup}
                    disabled={
                      loading ||
                      !groupName.trim() ||
                      selectedMembers.length === 0
                    }
                    className="min-w-[180px] py-3 bg-teal-normal text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_16px_32px_-8px_rgba(19,200,236,0.3)] hover:shadow-[0_20px_40px_-8px_rgba(19,200,236,0.4)] hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] disabled:opacity-20 disabled:translate-y-0 disabled:shadow-none flex items-center justify-center gap-2 group/btn"
                  >
                    <span>{loading ? "Creating..." : "Create Group"}</span>
                    <Users
                      size={16}
                      strokeWidth={2.5}
                      className="group-hover/btn:scale-110 transition-transform"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
