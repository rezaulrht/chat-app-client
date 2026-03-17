"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Camera,
  Mail,
  Shield,
  Calendar,
  Github,
  Chrome,
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  User,
  MessageSquare,
  FileText,
} from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { useWorkspace } from "@/hooks/useWorkspace";
import useFeed from "@/hooks/useFeed";
import toast from "react-hot-toast";

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
  const [avatarData, setAvatarData] = useState(null); // base64 or null

  // ── password change ──────────────────────────────────────────────────
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // ── ui state ─────────────────────────────────────────────────────────
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [activeTab, setActiveTab] = useState("profile"); // "profile" | "security"
  const fileRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // ── avatar picker ──────────────────────────────────────────────────
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
      setAvatarData(reader.result); // full data URI
    };
    reader.readAsDataURL(file);
  };

  // ── save profile ───────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (savingProfile) return;
    setSavingProfile(true);
    const payload = { name, bio, statusMessage };
    if (avatarData) payload.avatar = avatarData;

    const result = await updateProfile(payload);
    setSavingProfile(false);

    if (result.success) {
      toast.success("Profile updated!");
      setAvatarData(null); // clear pending upload
    } else {
      toast.error(result.message || "Could not save profile");
    }
  };

  // ── change password ───────────────────────────────────────────────
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (savingPw) return;
    if (newPw !== confirmPw) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPw.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setSavingPw(true);
    const result = await changePassword(currentPw, newPw);
    setSavingPw(false);
    if (result.success) {
      toast.success("Password changed!");
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } else {
      toast.error(result.message || "Could not change password");
    }
  };

  // ── helpers ───────────────────────────────────────────────────────
  const providerLabel =
    user?.provider === "google"
      ? "Google"
      : user?.provider === "github"
        ? "GitHub"
        : "Email";

  const ProviderIcon =
    user?.provider === "google"
      ? Chrome
      : user?.provider === "github"
        ? Github
        : Mail;

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null;

  const workspaceCount = workspaces?.length || 0;
  const isLocal = user?.provider === "local";

  // ── render ────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md glass-card rounded-3xl border border-white/[0.08] shadow-2xl shadow-black/60 overflow-hidden flex flex-col max-h-[90vh]">
        {/* ── gradient top bar ─────────────────────────────────────── */}
        <div className="h-1.5 w-full bg-linear-to-r from-accent/60 via-accent to-accent/60" />

        {/* ── header ───────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 shrink-0">
          <h2 className="text-ivory font-display font-bold text-lg tracking-tight">
            My Profile
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-ivory/25 hover:text-ivory/60 hover:bg-white/[0.06] transition-all duration-200"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── tabs ─────────────────────────────────────────────────── */}
        <div className="flex gap-1 px-6 pb-3 shrink-0">
          {["profile", ...(isLocal ? ["security"] : [])].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold uppercase tracking-[0.12em] transition-all duration-200 ${
                activeTab === tab
                  ? "bg-accent/15 text-accent border border-accent/30"
                  : "text-ivory/30 hover:text-ivory/50 hover:bg-white/[0.04]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── scrollable body ──────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-6 pb-6" data-lenis-prevent>
          {/* ═══════════════ PROFILE TAB ═══════════════ */}
          {activeTab === "profile" && (
            <div className="space-y-5">
              {/* Avatar + identity */}
              <div className="flex items-start gap-4">
                {/* Avatar picker */}
                <div className="relative shrink-0 group/av">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-white/[0.08] group-hover/av:ring-accent/40 transition-all duration-300 shadow-[0_0_24px_rgba(19,200,236,0.08)]">
                    <Image
                      src={
                        avatarPreview ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || "user"}`
                      }
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                      alt="avatar"
                      unoptimized
                    />
                  </div>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="absolute inset-0 rounded-2xl flex items-center justify-center bg-black/50 opacity-0 group-hover/av:opacity-100 transition-opacity duration-200"
                    title="Change photo"
                  >
                    <Camera size={18} className="text-white" />
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>

                {/* Quick identity block */}
                <div className="flex-1 min-w-0 pt-1 space-y-1">
                  <p className="text-ivory font-display font-bold text-base truncate">
                    {user?.name}
                  </p>
                  <p className="text-ivory/30 text-[12px] font-mono truncate">
                    {user?.email}
                  </p>
                  {/* Provider badge */}
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-[10px] font-mono text-ivory/40">
                    <ProviderIcon size={10} className="text-accent/60" />
                    {providerLabel}
                  </span>
                </div>
              </div>

              {/* Status message */}
              <div>
                <label className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-ivory/30 mb-1.5">
                  <MessageSquare size={10} className="text-accent/50" />
                  Status
                </label>
                <input
                  type="text"
                  value={statusMessage}
                  onChange={(e) => setStatusMessage(e.target.value)}
                  maxLength={80}
                  placeholder="What's on your mind?"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-[13px] text-ivory placeholder:text-ivory/20 focus:outline-none focus:border-accent/40 focus:bg-white/[0.06] transition-all duration-200"
                />
                <p className="text-right text-[9px] font-mono text-ivory/15 mt-1">
                  {statusMessage.length}/80
                </p>
              </div>

              {/* Name */}
              <div>
                <label className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-ivory/30 mb-1.5">
                  <User size={10} className="text-accent/50" />
                  Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={50}
                  placeholder="Your name"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-[13px] text-ivory placeholder:text-ivory/20 focus:outline-none focus:border-accent/40 focus:bg-white/[0.06] transition-all duration-200"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-ivory/30 mb-1.5">
                  <FileText size={10} className="text-accent/50" />
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={160}
                  rows={3}
                  placeholder="Tell the world a little about yourself…"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-[13px] text-ivory placeholder:text-ivory/20 focus:outline-none focus:border-accent/40 focus:bg-white/[0.06] transition-all duration-200 resize-none leading-relaxed"
                />
                <p className="text-right text-[9px] font-mono text-ivory/15 -mt-0.5">
                  {bio.length}/160
                </p>
              </div>

              {/* Divider */}
              <div className="border-t border-white/[0.06]" />

              {/* Read-only account info */}
              <div className="space-y-2.5">
                <p className="text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-ivory/20 mb-2">
                  Account Info
                </p>

                {/* Email */}
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-white/[0.02] rounded-xl border border-white/[0.05]">
                  <Mail size={13} className="text-ivory/20 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-mono text-ivory/20 uppercase tracking-wider mb-0.5">
                      Email
                    </p>
                    <p className="text-[12px] text-ivory/50 truncate font-mono">
                      {user?.email}
                    </p>
                  </div>
                  {user?.isVerified && (
                    <CheckCircle2
                      size={13}
                      className="text-emerald-400/70 shrink-0"
                    />
                  )}
                </div>

                {/* Auth provider */}
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-white/[0.02] rounded-xl border border-white/[0.05]">
                  <Shield size={13} className="text-ivory/20 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-mono text-ivory/20 uppercase tracking-wider mb-0.5">
                      Sign-in method
                    </p>
                    <div className="flex items-center gap-1.5">
                      <ProviderIcon size={11} className="text-accent/50" />
                      <p className="text-[12px] text-ivory/50 font-mono">
                        {providerLabel}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Member since */}
                {memberSince && (
                  <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-white/[0.02] rounded-xl border border-white/[0.05]">
                    <Calendar size={13} className="text-ivory/20 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-mono text-ivory/20 uppercase tracking-wider mb-0.5">
                        Member since
                      </p>
                      <p className="text-[12px] text-ivory/50 font-mono">
                        {memberSince}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: workspaceCount, label: "Workspaces" },
                  { value: userStats.postCount, label: "Posts" },
                  { value: userStats.followersCount, label: "Followers" },
                  { value: userStats.followingCount, label: "Following" },
                ].map(({ value, label }) => (
                  <div key={label} className="flex flex-col items-center justify-center py-3 px-1 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                    <p className="text-[18px] font-display font-bold text-ivory leading-none">
                      {value}
                    </p>
                    <p className="text-[8px] font-mono text-ivory/25 mt-1 uppercase tracking-wider text-center">
                      {label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Save button */}
              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="w-full py-2.5 rounded-xl bg-accent/15 hover:bg-accent/25 border border-accent/30 hover:border-accent/50 text-accent font-display font-bold text-[13px] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {savingProfile ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          )}

          {/* ═══════════════ SECURITY TAB ═══════════════ */}
          {activeTab === "security" && isLocal && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <p className="text-[11px] text-ivory/30 font-mono leading-relaxed">
                Choose a strong password with at least 8 characters.
              </p>

              {/* Current password */}
              <div>
                <label className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-ivory/30 mb-1.5">
                  <KeyRound size={10} className="text-accent/50" />
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPw ? "text" : "password"}
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 pr-10 text-[13px] text-ivory placeholder:text-ivory/20 focus:outline-none focus:border-accent/40 focus:bg-white/[0.06] transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ivory/20 hover:text-ivory/40 transition-colors"
                  >
                    {showCurrentPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* New password */}
              <div>
                <label className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-ivory/30 mb-1.5">
                  <KeyRound size={10} className="text-accent/50" />
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
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 pr-10 text-[13px] text-ivory placeholder:text-ivory/20 focus:outline-none focus:border-accent/40 focus:bg-white/[0.06] transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ivory/20 hover:text-ivory/40 transition-colors"
                  >
                    {showNewPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {/* Strength bar */}
                {newPw.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {[8, 10, 14].map((threshold, i) => (
                      <div
                        key={i}
                        className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                          newPw.length >= threshold
                            ? i === 0
                              ? "bg-red-400/70"
                              : i === 1
                                ? "bg-amber-400/70"
                                : "bg-emerald-400/70"
                            : "bg-white/[0.06]"
                        }`}
                      />
                    ))}
                    <span className="text-[9px] font-mono text-ivory/20 w-10 text-right">
                      {newPw.length < 8
                        ? "weak"
                        : newPw.length < 10
                          ? "fair"
                          : newPw.length < 14
                            ? "good"
                            : "strong"}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-ivory/30 mb-1.5">
                  <KeyRound size={10} className="text-accent/50" />
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  required
                  placeholder="Repeat new password"
                  className={`w-full bg-white/[0.04] border rounded-xl px-3.5 py-2.5 text-[13px] text-ivory placeholder:text-ivory/20 focus:outline-none transition-all duration-200 ${
                    confirmPw && confirmPw !== newPw
                      ? "border-red-400/40 focus:border-red-400/60"
                      : "border-white/[0.08] focus:border-accent/40 focus:bg-white/[0.06]"
                  }`}
                />
                {confirmPw && confirmPw !== newPw && (
                  <p className="text-[10px] text-red-400/70 mt-1 font-mono">
                    Passwords don&apos;t match
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={
                  savingPw ||
                  !currentPw ||
                  newPw !== confirmPw ||
                  newPw.length < 8
                }
                className="w-full py-2.5 rounded-xl bg-accent/15 hover:bg-accent/25 border border-accent/30 hover:border-accent/50 text-accent font-display font-bold text-[13px] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {savingPw ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Updating…
                  </>
                ) : (
                  "Change Password"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
