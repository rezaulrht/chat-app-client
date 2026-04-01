"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  X, Camera, Mail, Shield, Calendar, Github, Chrome, KeyRound,
  Eye, EyeOff, Loader2, CheckCircle2, User, MessageSquare, FileText,
  Clock, Heart, Grid
} from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { useWorkspace } from "@/hooks/useWorkspace";
import useFeed from "@/hooks/useFeed";
import toast from "react-hot-toast";
import api from "@/app/api/Axios"; // for posts

export default function UserProfileModal({ onClose }) {
  const { user, updateProfile, changePassword } = useAuth();
  const { workspaces } = useWorkspace();
  const { userStats, fetchMyStats } = useFeed();

  // Refresh feed stats when modal opens
  useEffect(() => { fetchMyStats(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── editable fields ──────────────────────────────────────────────────
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [statusMessage, setStatusMessage] = useState(user?.statusMessage || "");
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");
  const [avatarData, setAvatarData] = useState(null);

  // ── password change ──────────────────────────────────────────────────
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // ── posts state ──────────────────────────────────────────────────────
  const [myPosts, setMyPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // ── ui state ─────────────────────────────────────────────────────────
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [activeTab, setActiveTab] = useState("activity"); // "activity" | "profile" | "security"
  const fileRef = useRef(null);

  useEffect(() => {
    if (activeTab === "activity" && myPosts.length === 0) {
      loadMyPosts();
    }
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMyPosts = async () => {
    try {
      setLoadingPosts(true);
      const res = await api.get("/api/v1/posts/me?page=1&limit=10");
      if (res.data?.success) {
        setMyPosts(res.data.data.docs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPosts(false);
    }
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Handle avatar
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image must be under 4 MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
      setAvatarData(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (savingProfile) return;
    setSavingProfile(true);
    const payload = { name, bio, statusMessage };
    if (avatarData) payload.avatar = avatarData;

    const result = await updateProfile(payload);
    setSavingProfile(false);

    if (result.success) {
      toast.success("Profile updated!");
      setAvatarData(null);
    } else {
      toast.error(result.message || "Could not save profile");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (savingPw) return;
    if (newPw !== confirmPw) {
      toast.error("Passwords do not match"); return;
    }
    if (newPw.length < 8) {
      toast.error("Password must be at least 8 characters"); return;
    }
    setSavingPw(true);
    const result = await changePassword(currentPw, newPw);
    setSavingPw(false);
    if (result.success) {
      toast.success("Password changed!");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } else {
      toast.error(result.message || "Could not change password");
    }
  };

  // ── helpers ───────────────────────────────────────────────────────
  const providerLabel = user?.provider === "google" ? "Google" : user?.provider === "github" ? "GitHub" : "Email";
  const ProviderIcon = user?.provider === "google" ? Chrome : user?.provider === "github" ? Github : Mail;
  const isLocal = user?.provider === "local";

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;
  const workspaceCount = workspaces?.length || 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-4xl bg-[#13141b] rounded-2xl shadow-2xl shadow-black/90 overflow-hidden flex flex-col md:flex-row max-h-[85vh] border border-white/8 animate-in zoom-in-95 duration-200">

        {/* left panel */}
        <div className="w-full md:w-[320px] bg-[#1a1b23] flex-shrink-0 flex flex-col relative overflow-y-auto scrollbar-hide border-r border-white/4">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-br from-accent/40 via-accent/15 to-[#0f1015] relative shrink-0 overflow-hidden">
            {user?.banner?.imageUrl && <Image src={user.banner.imageUrl} fill className="object-cover" alt="Banner" unoptimized />}
          </div>

          <div className="relative px-6 flex-shrink-0">
            {/* Avatar edit */}
            <div className="absolute top-[-50px] left-6 w-[100px] h-[100px] rounded-full bg-[#1a1b23] p-[6px] z-20">
              <div className="w-full h-full rounded-full overflow-hidden relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
                <Image
                  src={avatarPreview || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || "user"}`}
                  fill
                  className="object-cover"
                  alt="avatar"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                  <Camera size={20} className="text-white" />
                </div>
              </div>
              <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full border-[3px] border-[#1a1b23] bg-emerald-400 z-30 shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
          </div>

          <div className="pt-16 pb-6 px-6 flex-1 flex flex-col relative z-0">
            <h2 className="text-ivory font-display font-bold text-[22px] leading-tight flex items-center gap-2">
              {user?.name}
              {user?.isVerified && (
                <CheckCircle2 size={16} className="text-emerald-400" />
              )}
            </h2>
            <p className="text-ivory/50 text-[13px] font-mono">{user?.email}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-[11px] font-mono text-ivory/60">
                <ProviderIcon size={12} className="text-accent/60" />
                {providerLabel}
              </span>
              {memberSince && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-[11px] font-mono text-ivory/60">
                  <Calendar size={12} className="text-accent/60" />
                  {memberSince}
                </span>
              )}
            </div>

            <div className="h-px bg-white/[0.06] my-5" />

            {/* Custom Status Display */}
            <div className="mb-5">
              <div className="text-[11px] uppercase font-mono tracking-widest font-bold text-ivory/30 mb-2">About Me</div>
              {bio ? (
                <p className="text-[13px] text-ivory/70 leading-relaxed whitespace-pre-wrap">{bio}</p>
              ) : (
                <p className="text-[13px] text-ivory/30 italic">No bio provided.</p>
              )}
            </div>

            <div className="h-px bg-white/[0.06] my-5" />

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="flex flex-col items-center justify-center py-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                <p className="text-[20px] font-display font-bold text-ivory">{userStats.postCount || 0}</p>
                <p className="text-[9px] font-mono text-ivory/30 mt-1 uppercase tracking-wider">Posts</p>
              </div>
              <div className="flex flex-col items-center justify-center py-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                <p className="text-[20px] font-display font-bold text-ivory">{workspaces?.length || 0}</p>
                <p className="text-[9px] font-mono text-ivory/30 mt-1 uppercase tracking-wider">Workspaces</p>
              </div>
            </div>
          </div>
        </div>

        {/* right panel */}
        <div className="flex-1 flex flex-col h-full bg-[#13141b] overflow-hidden relative">
          {/* Header Actions & Close */}
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-ivory/40 hover:text-ivory bg-white/[0.05] hover:bg-white/[0.1] backdrop-blur-md transition-all duration-200"
            >
              <X size={16} />
            </button>
          </div>

          {/* Tabs */}
          <div className="px-6 pt-5 bg-[#13141b] border-b border-white/[0.04] shrink-0">
             <div className="flex gap-6">
                {[
                  { id: "activity", label: "Activity Feed" },
                  { id: "profile", label: "Edit Profile" },
                  ...(isLocal ? [{ id: "security", label: "Security" }] : [])
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-3 text-[13px] font-display font-bold uppercase tracking-wider transition-colors border-b-2 ${
                      activeTab === tab.id
                        ? "text-accent border-accent"
                        : "text-ivory/40 border-transparent hover:text-ivory/70 hover:border-ivory/20"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
             </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide">
            
            {/* ═══════════════ ACTIVITY TAB ═══════════════ */}
            {activeTab === "activity" && (
              <div className="space-y-4 max-w-2xl">
                 <h3 className="text-ivory font-display font-bold text-lg mb-4 flex items-center gap-2">
                   <Grid size={18} className="text-accent" />
                   Recently Posted
                 </h3>
                 {loadingPosts ? (
                    <div className="flex items-center justify-center py-10 opacity-50">
                       <Loader2 size={24} className="animate-spin text-ivory/30" />
                    </div>
                 ) : myPosts.length > 0 ? (
                    <div className="space-y-4">
                       {myPosts.map(post => (
                         <div key={post._id} className="glass-card rounded-xl p-4 border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] transition-colors shadow-none">
                           {post.imageUrl && (
                             <div className="w-full h-32 md:h-48 rounded-lg overflow-hidden mb-3 relative bg-black/20">
                                <Image src={post.imageUrl} fill className="object-cover" alt="Post media" unoptimized />
                             </div>
                           )}
                            <p className="text-ivory/80 text-[14px] leading-relaxed mb-3 whitespace-pre-wrap break-words">{post.caption || post.content}</p>
                           <div className="flex items-center gap-4 text-ivory/40 text-[12px] font-mono">
                              <span className="flex items-center gap-1.5"><Heart size={14} className={post.likes?.includes(user?._id) ? "text-red-400" : ""} /> {post.likes?.length || 0}</span>
                              <span className="flex items-center gap-1.5"><MessageSquare size={14} /> {post.comments?.length || 0}</span>
                              <span className="flex items-center gap-1.5 ml-auto"><Clock size={14} /> {new Date(post.createdAt).toLocaleDateString()}</span>
                           </div>
                         </div>
                       ))}
                    </div>
                 ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-ivory/30 text-center glass-card border border-white/[0.02] rounded-xl shadow-none">
                      <FileText size={48} className="mb-4 opacity-50 text-accent/50" />
                      <p className="font-display font-bold text-[16px] text-ivory/70">No Recent Activity</p>
                      <p className="text-[13px] font-mono mt-1 opacity-60">Looks like it's quiet here.</p>
                    </div>
                 )}
              </div>
            )}

            {/* ═══════════════ EDIT PROFILE TAB ═══════════════ */}
            {activeTab === "profile" && (
              <div className="space-y-6 max-w-lg">
                <h3 className="text-ivory font-display font-bold text-lg mb-2 flex items-center gap-2">
                   <User size={18} className="text-accent" />
                   Profile Settings
                </h3>
                
                {/* Status message */}
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-widest text-ivory/40 mb-2">
                    Custom Status
                  </label>
                  <input
                    type="text"
                    value={statusMessage}
                    onChange={(e) => setStatusMessage(e.target.value)}
                    maxLength={80}
                    placeholder="What's on your mind?"
                    className="w-full bg-black/20 border border-white/[0.08] rounded-xl px-4 py-3 text-[14px] text-ivory placeholder:text-ivory/20 focus:outline-none focus:border-accent/40 focus:bg-white/[0.03] transition-all duration-200"
                  />
                  <p className="text-right text-[10px] font-mono text-ivory/20 mt-1.5">
                    {statusMessage.length}/80
                  </p>
                </div>

                {/* Name */}
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-widest text-ivory/40 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={50}
                    placeholder="Your name"
                    className="w-full bg-black/20 border border-white/[0.08] rounded-xl px-4 py-3 text-[14px] text-ivory placeholder:text-ivory/20 focus:outline-none focus:border-accent/40 focus:bg-white/[0.03] transition-all duration-200"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-widest text-ivory/40 mb-2">
                    About Me
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={160}
                    rows={4}
                    placeholder="Tell the world a little about yourself"
                    className="w-full bg-black/20 border border-white/[0.08] rounded-xl px-4 py-3 text-[14px] text-ivory placeholder:text-ivory/20 focus:outline-none focus:border-accent/40 focus:bg-white/[0.03] transition-all duration-200 resize-none"
                  />
                  <p className="text-right text-[10px] font-mono text-ivory/20 mt-1.5">
                    {bio.length}/160
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="bg-accent/15 hover:bg-accent/25 border border-accent/20 text-accent font-display font-bold text-[14px] px-6 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {savingProfile ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Saving…
                      </>
                    ) : (
                      "Save Profile Changes"
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ═══════════════ SECURITY TAB ═══════════════ */}
            {activeTab === "security" && isLocal && (
              <div className="max-w-lg space-y-6">
                <h3 className="text-ivory font-display font-bold text-lg mb-2 flex items-center gap-2">
                   <Shield size={18} className="text-accent" />
                   Security Settings
                </h3>
                
                <form onSubmit={handleChangePassword} className="space-y-5">
                  <p className="text-[13px] text-ivory/50 font-mono mb-4 leading-relaxed bg-white/[0.02] p-4 rounded-xl border border-white/[0.04]">
                    Choose a strong password containing at least 8 characters. Consider using numbers and special symbols for better security.
                  </p>

                  <div className="space-y-4">
                    {/* Current pw */}
                    <div>
                      <label className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-widest text-ivory/40 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPw ? "text" : "password"}
                          value={currentPw}
                          onChange={(e) => setCurrentPw(e.target.value)}
                          required
                          placeholder="••••••••"
                          className="w-full bg-black/20 border border-white/[0.08] rounded-xl px-4 py-3 pr-10 text-[14px] text-ivory placeholder:text-ivory/20 focus:outline-none focus:border-accent/40 transition-all duration-200"
                        />
                        <button type="button" onClick={() => setShowCurrentPw((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-ivory/20 hover:text-ivory/60 transition-colors">
                          {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* New pw */}
                    <div>
                      <label className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-widest text-ivory/40 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPw ? "text" : "password"}
                          value={newPw}
                          onChange={(e) => setNewPw(e.target.value)}
                          required
                          minLength={8}
                          placeholder="Min 8 characters"
                          className="w-full bg-black/20 border border-white/[0.08] rounded-xl px-4 py-3 pr-10 text-[14px] text-ivory placeholder:text-ivory/20 focus:outline-none focus:border-accent/40 transition-all duration-200"
                        />
                        <button type="button" onClick={() => setShowNewPw((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-ivory/20 hover:text-ivory/60 transition-colors">
                          {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm pw */}
                    <div>
                      <label className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-widest text-ivory/40 mb-2">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        value={confirmPw}
                        onChange={(e) => setConfirmPw(e.target.value)}
                        required
                        placeholder="Repeat new password"
                        className={`w-full bg-black/20 border rounded-xl px-4 py-3 text-[14px] text-ivory placeholder:text-ivory/20 focus:outline-none transition-all duration-200 ${
                          confirmPw && confirmPw !== newPw
                            ? "border-red-400/50 focus:border-red-400/70"
                            : "border-white/[0.08] focus:border-accent/40"
                        }`}
                      />
                      {confirmPw && confirmPw !== newPw && (
                        <p className="text-[11px] text-red-400/90 mt-2 font-mono">Passwords do not match</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={savingPw || !currentPw || newPw !== confirmPw || newPw.length < 8}
                      className="bg-accent/15 hover:bg-accent/25 border border-accent/20 text-accent font-display font-bold text-[14px] px-6 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {savingPw ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Updating…
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div >
      </div >
    </div >
  );
}
