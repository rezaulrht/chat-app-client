"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/app/api/Axios";
import Image from "next/image";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import useAuth from "@/hooks/useAuth";
import { useWorkspace } from "@/hooks/useWorkspace";
import toast from "react-hot-toast";
import {
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
  Building2,
  Crown,
  ShieldCheck,
  AtSign,
  Lock,
  Sparkles,
  Globe,
  ChevronRight,
  Rss,
  LinkIcon,
  Unlink,
} from "lucide-react";
import PostCard from "@/components/Feed/PostCard";
import ImageCropModal from "@/components/shared/ImageCropModal";
import { useTheme } from "@/context/ThemeContext";
import { THEMES } from "@/context/ThemeContext";
import { Paintbrush } from "lucide-react";

// ── Appearance card ──────────────────────────────────────────────────────────
function AppearanceCard() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="glass-card rounded-2xl border border-white/[0.08] p-5 space-y-3">
      <h2 className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-ivory/25 flex items-center gap-1.5">
        <Paintbrush size={10} className="text-accent/50" />
        Appearance
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {THEMES.map((t) => {
          const active = theme === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all text-left group ${
                active
                  ? "border-accent/40 bg-accent/[0.07]"
                  : "border-white/[0.06] hover:border-white/[0.14] hover:bg-white/[0.04]"
              }`}
            >
              <div
                className="w-8 h-8 rounded-xl shrink-0 border border-black/[0.12] flex items-center justify-center shadow-sm"
                style={{ background: t.surface }}
              >
                <div className="w-3 h-3 rounded-full" style={{ background: t.accent }} />
              </div>
              <div>
                <p className={`text-[11px] font-display font-bold leading-tight ${active ? "text-accent" : "text-ivory/70"}`}>
                  {t.label}
                </p>
                <p className="text-[9px] font-mono text-ivory/25 capitalize leading-tight mt-0.5">
                  {t.mode}
                </p>
              </div>
              {active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Role badge helper ───────────────────────────────────────────────────────
function RoleBadge({ role }) {
  if (role === "owner")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-wider">
        <Crown size={9} />
        Owner
      </span>
    );
  if (role === "admin")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-mono font-bold uppercase tracking-wider">
        <ShieldCheck size={9} />
        Admin
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-ivory/40 text-[10px] font-mono font-bold uppercase tracking-wider">
      <User size={9} />
      Member
    </span>
  );
}

// ── Password strength helper ────────────────────────────────────────────────
function StrengthBar({ password }) {
  if (!password) return null;
  const level =
    password.length < 8
      ? 0
      : password.length < 10
        ? 1
        : password.length < 14
          ? 2
          : 3;
  const colors = [
    "bg-red-400/70",
    "bg-amber-400/70",
    "bg-emerald-400/70",
    "bg-emerald-400",
  ];
  const labels = ["weak", "fair", "good", "strong"];
  return (
    <div className="flex items-center gap-1.5 mt-1.5">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={`flex-1 h-1 rounded-full transition-all duration-300 ${level >= i ? colors[level] : "bg-white/[0.06]"}`}
        />
      ))}
      <span className="text-[9px] font-mono text-ivory/25 w-10 text-right">
        {labels[level]}
      </span>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────
function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuth();
  const { workspaces } = useWorkspace();

  // Edit fields
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [statusMessage, setStatusMessage] = useState(user?.statusMessage || "");
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");
  const [avatarData, setAvatarData] = useState(null);
  const fileRef = useRef(null);

  // Password fields
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // UI state
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const searchParams = useSearchParams();
  const getInitialTab = () => {
    const tab = searchParams?.get("tab");
    if (tab === "posts" || tab === "connections" || tab === "security" || tab === "account") {
      return tab;
    }
    return "edit";
  };
  const [activeSection, setActiveSection] = useState(getInitialTab);
  const [activePost, setActivePost] = useState(null);

  // Handle OAuth cancellation feedback
  useEffect(() => {
    const cancelled = searchParams?.get("cancelled");
    if (cancelled === "true") {
      toast.error("Account linking was cancelled");
      // Clean up URL without reload
      window.history.replaceState({}, "", "/profile?tab=connections");
    }
  }, [searchParams]);

  // ── My posts (real API) ───────────────────────────────────────────────
  const [myPosts, setMyPosts] = useState([]);
  const [myPostsLoading, setMyPostsLoading] = useState(false);
  const [myPostsPage, setMyPostsPage] = useState(1);
  const [myPostsHasMore, setMyPostsHasMore] = useState(false);

  const [myPostsError, setMyPostsError] = useState(false);
  const [myPostsLoaded, setMyPostsLoaded] = useState(false);

  // ── Banner state ───────────────────────────────────────────────
  const [bannerPreview, setBannerPreview] = useState(user?.banner || "");
  const [bannerData, setBannerData] = useState(null);
  const [customColor, setCustomColor] = useState(user?.customColor || "");
  const [showBannerCrop, setShowBannerCrop] = useState(false);
  const [pendingBannerImage, setPendingBannerImage] = useState(null);
  const [savingBanner, setSavingBanner] = useState(false);
  const bannerFileRef = useRef(null);

  // ── Social links state ───────────────────────────────────────────────
  const [socialLinks, setSocialLinks] = useState([]);
  const [loadingSocialLinks, setLoadingSocialLinks] = useState(false);
  const [linkingProvider, setLinkingProvider] = useState(null);
  const [unlinkingProvider, setUnlinkingProvider] = useState(null);
  const [hasGoogle, setHasGoogle] = useState(false);
  const [hasGitHub, setHasGitHub] = useState(false);
  const [canAddMore, setCanAddMore] = useState(true);

  const loadMyPosts = useCallback(
    async (page = 1) => {
      const userId = user?._id || user?.id;
      if (!userId) return false;
      setMyPostsLoading(true);
      setMyPostsError(false);
      try {
        const res = await api.get(`/api/feed/users/${userId}/posts`, {
          params: { page, limit: 20 },
        });
        const incoming = res.data.posts || [];
        if (page === 1) setMyPosts(incoming);
        else setMyPosts((prev) => [...prev, ...incoming]);
        setMyPostsHasMore(res.data.hasMore ?? false);
        setMyPostsLoaded(true);
        return true;
      } catch (err) {
        console.error("loadMyPosts error:", err.message);
        setMyPostsError(true);
        return false;
      } finally {
        setMyPostsLoading(false);
      }
    },
    [user],
  );

  useEffect(() => {
    if (activeSection === "posts") {
      setMyPostsPage(1);
      loadMyPosts(1);
    }
  }, [activeSection, loadMyPosts]);

  // ── Avatar picker ─────────────────────────────────────────────────────
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

  // ── Banner handling ──────────────────────────────────────────────────
  const handleBannerChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPendingBannerImage(reader.result);
      setShowBannerCrop(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleBannerCropSave = async (croppedImage) => {
    setShowBannerCrop(false);
    setBannerPreview(croppedImage);
    setBannerData(croppedImage);
    setPendingBannerImage(null);
    setSavingBanner(true);
    try {
      // The endpoint is at /api/auth/me/banner but needs FormData
      const formData = new FormData();
      // Convert base64 data URL to blob
      const response = await fetch(croppedImage);
      const blob = await response.blob();
      formData.append("image", blob, "banner.jpg");

      const res = await api.patch("/auth/me/banner", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.banner) {
        // Update local banner state
        setBannerPreview(croppedImage);
        setBannerData(res.data.banner);
        toast.success("Banner updated!");
      }
    } catch (err) {
      console.error("Banner save error:", err);
      toast.error(err.response?.data?.message || "Failed to save banner");
    } finally {
      setSavingBanner(false);
    }
  };

  const handleRemoveBanner = async () => {
    setSavingBanner(true);
    try {
      await api.patch("/auth/me/banner", { banner: "" });
      setBannerPreview("");
      setBannerData(null);
      toast.success("Banner removed");
    } catch (err) {
      console.error("Banner remove error:", err);
      toast.error("Failed to remove banner");
    } finally {
      setSavingBanner(false);
    }
  };

  // ── Social links handling ──────────────────────────────────────────
  const fetchSocialLinks = useCallback(async () => {
    setLoadingSocialLinks(true);
    try {
      const res = await api.get("/api/user/social-links");
      const links = res.data.socialLinks || [];
      setSocialLinks(links);
      setHasGoogle(links.some(l => l.provider === "google"));
      setHasGitHub(links.some(l => l.provider === "github"));
      setCanAddMore(links.length < 2);
    } catch (err) {
      console.error("Failed to fetch social links:", err);
    } finally {
      setLoadingSocialLinks(false);
    }
  }, []);

  useEffect(() => {
    fetchSocialLinks();
  }, [fetchSocialLinks]);

  const handleLinkAccount = async (provider) => {
    setLinkingProvider(provider);
    try {
      const res = await api.post(`/api/user/social-links/init/${provider}`);
      if (res.data.authUrl) {
        // Show a toast indicating the linking process has started
        toast.success(`Connecting ${provider === 'google' ? 'Google' : 'GitHub'} account...`);
        // Use a small delay to allow the toast to show before redirect
        setTimeout(() => {
          window.location.href = res.data.authUrl;
        }, 500);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to start linking";
      toast.error(errorMsg);
      setLinkingProvider(null);
    }
  };

  const handleUnlinkAccount = async (provider) => {
    if (!confirm(`Are you sure you want to disconnect ${provider}?`)) return;
    setUnlinkingProvider(provider);
    try {
      await api.delete(`/api/user/social-links/${provider}`);
      toast.success(`${provider} has been disconnected`);
      fetchSocialLinks();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to unlink account";
      if (err.response?.data?.requiresPassword) {
        toast.error("Please set a password first (Security tab)");
        setActiveSection("security");
      } else {
        toast.error(msg);
      }
    } finally {
      setUnlinkingProvider(null);
    }
  };

  // ── Save profile ──────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (savingProfile) return;
    setSavingProfile(true);
    const payload = { name, bio, statusMessage };
    if (avatarData) payload.avatar = avatarData;
    const result = await updateProfile(payload);
    setSavingProfile(false);
    if (result.success) {
      toast.success("Profile saved!");
      setAvatarData(null);
    } else {
      toast.error(result.message || "Could not save profile");
    }
  };

  // ── Change password ───────────────────────────────────────────────────
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (savingPw) return;
    if (newPw !== confirmPw) return toast.error("Passwords don't match");
    if (newPw.length < 8)
      return toast.error("Password must be at least 8 characters");
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

  // ── Derived values ────────────────────────────────────────────────────
  const isLocal = user?.provider === "local";
  const providerLabel =
    user?.provider === "google"
      ? "Google"
      : user?.provider === "github"
        ? "GitHub"
        : "Email & Password";
  const ProviderIcon =
    user?.provider === "google"
      ? Chrome
      : user?.provider === "github"
        ? Github
        : Mail;
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";
  const memberSinceYear = user?.createdAt
    ? new Date(user.createdAt).getFullYear()
    : "";
  const workspaceCount = workspaces?.length || 0;
  const ownedCount =
    workspaces?.filter((w) => w.myRole === "owner").length || 0;
  const adminCount =
    workspaces?.filter((w) => w.myRole === "admin").length || 0;

  return (
    <div>
      {/* ── Page content ─────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 py-4 md:py-10 space-y-4 md:space-y-6">
        {/* ════════════════════════════════════════════════════════════ */}
        {/* HERO CARD                                                    */}
        {/* ════════════════════════════════════════════════════════════ */}
        <div className="relative rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/40">
          {/* Banner - uses bannerPreview or gradient fallback */}
          <div 
            className="h-20 md:h-32 relative group/banner cursor-pointer"
            onClick={() => bannerFileRef.current?.click()}
            style={bannerPreview ? {
              backgroundImage: `url(${bannerPreview})`,
              backgroundSize: "cover",
              backgroundPosition: "center"
            } : undefined}
          >
            {!bannerPreview && (
              <div className="absolute inset-0 bg-linear-to-br from-accent/20 via-accent/5 to-transparent" />
            )}
            {/* Banner edit overlay */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/banner:opacity-100 transition-opacity">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/60 backdrop-blur-sm">
                <Camera size={14} className="text-white" />
                <span className="text-[11px] font-mono text-white">
                  {bannerPreview ? "Change Banner" : "Add Banner"}
                </span>
              </div>
            </div>

            {/* Overlay grid texture */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg,transparent,transparent 30px,rgba(255,255,255,.5) 30px,rgba(255,255,255,.5) 31px),repeating-linear-gradient(90deg,transparent,transparent 30px,rgba(255,255,255,.5) 30px,rgba(255,255,255,.5) 31px)",
              }}
            />
          </div>
          <input
            ref={bannerFileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleBannerChange}
          />

          {/* Avatar + identity */}
          <div className="relative px-4 md:px-6 pb-4 md:pb-6">
            {/* Avatar — sits half on banner, half below */}
            <div className="relative -mt-7 md:-mt-10 mb-3 md:mb-4 w-fit">
              <div
                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden ring-4 ring-[#07070e] shadow-xl cursor-pointer group/av relative"
                onClick={() => fileRef.current?.click()}
              >
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
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/av:opacity-100 transition-opacity duration-200">
                  <Camera size={18} className="text-white" />
                </div>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              {/* Verified dot */}
              {user?.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-[#07070e] flex items-center justify-center shadow-lg shadow-emerald-400/20">
                  <CheckCircle2 size={10} className="text-[#07070e]" />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <h1 className="text-ivory font-display font-bold text-xl md:text-2xl leading-tight">
                {user?.name}
              </h1>
              {user?.statusMessage && (
                <p className="text-ivory/40 text-[13px] font-mono italic">
                  "{user.statusMessage}"
                </p>
              )}
              <div className="flex items-center flex-wrap gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-[11px] font-mono text-ivory/40">
                  <AtSign size={10} className="text-accent/50" />
                  {user?.email}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-[11px] font-mono text-ivory/40">
                  <ProviderIcon size={10} className="text-accent/50" />
                  {providerLabel}
                </span>
                {user?.isVerified && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-[11px] font-mono">
                    <CheckCircle2 size={10} />
                    Verified
                  </span>
                )}
              </div>
            </div>

            {/* Bio if present */}
            {user?.bio && (
              <p className="mt-3 text-ivory/50 text-[13px] leading-relaxed max-w-xl">
                {user.bio}
              </p>
            )}
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════ */}
        {/* STATS ROW                                                    */}
        {/* ════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: "Workspaces",
              value: workspaceCount,
              icon: Building2,
              color: "text-accent",
            },
            {
              label: "As Owner",
              value: ownedCount,
              icon: Crown,
              color: "text-amber-400",
            },
            {
              label: "Member since",
              value: memberSinceYear || "—",
              icon: Calendar,
              color: "text-ivory/50",
            },
          ].map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="glass-card rounded-2xl border border-white/[0.08] p-4 flex flex-col items-center justify-center gap-1.5 text-center"
            >
              <Icon size={16} className={`${color} opacity-60`} />
              <p
                className={`text-2xl font-display font-bold leading-none ${color}`}
              >
                {value}
              </p>
              <p className="text-[9px] font-mono text-ivory/20 uppercase tracking-[0.15em]">
                {label}
              </p>
            </div>
          ))}
        </div>

        <div
          className={`grid gap-4 md:gap-6 ${activeSection === "posts" || activeSection === "account" ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}
        >
          {/* ════════════════════════════════════════════════════════════ */}
          {/* LEFT COLUMN                                                  */}
          {/* ════════════════════════════════════════════════════════════ */}
          <div className="space-y-4">
            {/* Section tabs */}
            <div className="flex gap-1 p-1 bg-white/[0.03] rounded-xl border border-white/[0.06]">
              {["edit", "connections", ...(isLocal ? ["security"] : []), "posts", "account"].map((s) => (
                <button
                  key={s}
                  onClick={() => setActiveSection(s)}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-[0.1em] transition-all duration-200 ${
                    s === "account" ? "md:hidden" : ""
                  } ${
                    activeSection === s
                      ? "bg-accent/15 text-accent border border-accent/20"
                      : "text-ivory/25 hover:text-ivory/50"
                  }`}
                >
                  {s === "edit"
                    ? "Edit"
                    : s === "security"
                      ? "Security"
                      : s === "posts"
                        ? "Posts"
                        : s === "connections"
                          ? "Connections"
                          : "Account"}
                </button>
              ))}
            </div>

            {/* ── Edit Profile Section ── */}
            {activeSection === "edit" && (
              <div className="glass-card rounded-2xl border border-white/[0.08] p-5 space-y-4">
                <h2 className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-ivory/25 flex items-center gap-1.5">
                  <Sparkles size={10} className="text-accent/50" />
                  Edit Profile
                </h2>

                {/* Avatar upload hint */}
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-dashed border-white/[0.10] hover:border-accent/30 hover:bg-accent/[0.03] transition-all duration-200 group"
                >
                  <div className="w-9 h-9 rounded-xl overflow-hidden ring-1 ring-white/[0.08] shrink-0">
                    <Image
                      src={
                        avatarPreview ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`
                      }
                      width={36}
                      height={36}
                      className="w-full h-full object-cover"
                      alt=""
                      unoptimized
                    />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-[12px] font-mono text-ivory/40 group-hover:text-ivory/60 transition-colors">
                      Change profile photo
                    </p>
                    <p className="text-[10px] font-mono text-ivory/20">
                      JPG, PNG, GIF · max 4 MB
                    </p>
                  </div>
                  <Camera
                    size={14}
                    className="text-ivory/20 group-hover:text-accent/50 shrink-0 transition-colors duration-200"
                  />
                </button>

                {/* Banner upload hint */}
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-ivory/25 mb-1.5">
                    Banner
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => bannerFileRef.current?.click()}
                      className="flex-1 flex items-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-dashed border-white/[0.10] hover:border-accent/30 hover:bg-accent/[0.03] transition-all duration-200 group"
                    >
                      <Camera size={14} className="text-ivory/20 group-hover:text-accent/50" />
                      <span className="text-[11px] font-mono text-ivory/40 group-hover:text-ivory/60">
                        {bannerPreview ? "Change Banner" : "Upload Banner"}
                      </span>
                    </button>
                    {bannerPreview && (
                      <button
                        onClick={handleRemoveBanner}
                        disabled={savingBanner}
                        className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400/70 hover:text-red-400 hover:bg-red-500/20 transition-all text-[11px] font-mono"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-[9px] font-mono text-ivory/15 mt-1">
                    16:9 ratio recommended · Max 5 MB
                  </p>
                </div>

                {/* Status message */}
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-ivory/25 mb-1.5">
                    <MessageSquare size={9} className="text-accent/50" />
                    Status Message
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

                {/* Display name */}
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-ivory/25 mb-1.5">
                    <User size={9} className="text-accent/50" />
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
                  <label className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-ivory/25 mb-1.5">
                    <FileText size={9} className="text-accent/50" />
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={160}
                    rows={3}
                    placeholder="Tell the world about yourself…"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-[13px] text-ivory placeholder:text-ivory/20 focus:outline-none focus:border-accent/40 focus:bg-white/[0.06] transition-all duration-200 resize-none leading-relaxed"
                  />
                  <p className="text-right text-[9px] font-mono text-ivory/15 -mt-0.5">
                    {bio.length}/160
                  </p>
                </div>

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

            {/* ── Connections Section ── */}
            {activeSection === "connections" && (
              <div className="glass-card rounded-2xl border border-white/[0.08] p-5 space-y-4">
                <h2 className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-ivory/25 flex items-center gap-1.5">
                  <LinkIcon size={10} className="text-accent/50" />
                  Connected Accounts
                </h2>

                {loadingSocialLinks ? (
                  <div className="flex justify-center py-6">
                    <Loader2 size={20} className="text-accent/40 animate-spin" />
                  </div>
                ) : (
                  <>
                    {/* Connected accounts */}
                    <div className="space-y-2">
                      {socialLinks.map((link) => (
                        <div
                          key={link.provider}
                          className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl border border-white/[0.04]"
                        >
                          <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center">
                            {link.provider === "google" ? (
                              <Chrome size={18} className="text-accent/60" />
                            ) : (
                              <Github size={18} className="text-ivory/40" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-semibold text-ivory/70 capitalize">
                              {link.provider}
                            </p>
                            {link.username && (
                              <p className="text-[10px] font-mono text-ivory/30 truncate">
                                @{link.username}
                              </p>
                            )}
                          </div>
                          <span className="text-[9px] font-mono text-emerald-400/70 flex items-center gap-1">
                            <CheckCircle2 size={10} />
                            Connected
                          </span>
                          {link.canUnlink && (
                            <button
                              onClick={() => handleUnlinkAccount(link.provider)}
                              disabled={unlinkingProvider === link.provider}
                              className="p-2 rounded-lg text-ivory/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            >
                              {unlinkingProvider === link.provider ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Unlink size={14} />
                              )}
                            </button>
                          )}
                        </div>
                      ))}

                      {socialLinks.length === 0 && (
                        <p className="text-ivory/25 text-[12px] font-mono text-center py-4">
                          No connected accounts
                        </p>
                      )}
                    </div>

                    {/* Connect more */}
                    {canAddMore && (
                      <div className="pt-2 border-t border-white/[0.06]">
                        <p className="text-[10px] font-mono text-ivory/25 mb-2">Connect more accounts</p>
                        <div className="flex gap-2">
                          {!hasGoogle && (
                            <button
                              onClick={() => handleLinkAccount("google")}
                              disabled={linkingProvider === "google"}
                              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-ivory/50 hover:text-ivory hover:bg-white/[0.08] transition-all text-[11px]"
                            >
                              {linkingProvider === "google" ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <Chrome size={12} />
                              )}
                              Connect Google
                            </button>
                          )}
                          {!hasGitHub && (
                            <button
                              onClick={() => handleLinkAccount("github")}
                              disabled={linkingProvider === "github"}
                              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-ivory/50 hover:text-ivory hover:bg-white/[0.08] transition-all text-[11px]"
                            >
                              {linkingProvider === "github" ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <Github size={12} />
                              )}
                              Connect GitHub
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ── My Posts Section ── */}
            {activeSection === "posts" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-ivory/25 flex items-center gap-1.5">
                    <Rss size={10} className="text-accent/50" />
                    Published Posts
                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-accent/10 text-accent text-[9px] font-mono">
                      {myPosts.length}
                    </span>
                  </h2>
                </div>

                {myPostsLoading && myPosts.length === 0 ? (
                  <div className="flex justify-center py-10">
                    <span className="text-accent/40 text-[12px] font-mono animate-pulse">
                      Loading posts...
                    </span>
                  </div>
                ) : myPostsError ? (
                  <div className="glass-card rounded-2xl border border-white/[0.08] p-10 flex flex-col items-center justify-center gap-3 text-center">
                    <p className="text-red-400/50 text-[13px] font-mono">
                      Failed to load posts
                    </p>
                    <button
                      onClick={() => loadMyPosts(1)}
                      className="text-accent text-[12px] font-mono hover:underline"
                    >
                      Try again
                    </button>
                  </div>
                ) : myPostsLoaded && myPosts.length === 0 ? (
                  <div className="glass-card rounded-2xl border border-white/[0.08] p-10 flex flex-col items-center justify-center gap-3 text-center">
                    <Rss size={28} className="text-ivory/10" />
                    <p className="text-ivory/25 text-[13px] font-mono">
                      No posts yet
                    </p>
                    <p className="text-ivory/15 text-[11px] font-mono max-w-xs">
                      Share your knowledge — write articles, snippets, or ask
                      questions in the Feed.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myPosts.map((post) => (
                      <PostCard
                        key={post._id}
                        post={post}
                        currentUserId={user?._id || user?.id || "me"}
                        onOpen={() => setActivePost(post)}
                        onReact={() => {}}
                        onShare={() => {}}
                        onTagClick={() => {}}
                        onEdit={() => {}}
                        onDelete={() => {}}
                      />
                    ))}
                    {myPostsHasMore && (
                      <button
                        onClick={async () => {
                          const next = myPostsPage + 1;
                          const ok = await loadMyPosts(next);
                          if (ok) setMyPostsPage(next);
                        }}
                        disabled={myPostsLoading}
                        className="w-full py-2 text-[11px] font-mono text-ivory/25 hover:text-ivory/50 transition-colors"
                      >
                        {myPostsLoading ? "Loading..." : "Load more"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Security Section ── */}
            {activeSection === "security" && isLocal && (
              <form
                onSubmit={handleChangePassword}
                className="glass-card rounded-2xl border border-white/[0.08] p-5 space-y-4"
              >
                <h2 className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-ivory/25 flex items-center gap-1.5">
                  <Lock size={10} className="text-accent/50" />
                  Change Password
                </h2>
                <p className="text-[11px] text-ivory/25 font-mono leading-relaxed">
                  Choose a strong password with at least 8 characters.
                </p>

                {/* Current password */}
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-ivory/25 mb-1.5">
                    <KeyRound size={9} className="text-accent/50" />
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPw ? "text" : "password"}
                      value={currentPw}
                      onChange={(e) => setCurrentPw(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 pr-10 text-[13px] text-ivory placeholder:text-ivory/20 focus:outline-none focus:border-accent/40 transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ivory/20 hover:text-ivory/40"
                    >
                      {showCurrentPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* New password */}
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-ivory/25 mb-1.5">
                    <KeyRound size={9} className="text-accent/50" />
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
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 pr-10 text-[13px] text-ivory placeholder:text-ivory/20 focus:outline-none focus:border-accent/40 transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ivory/20 hover:text-ivory/40"
                    >
                      {showNewPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <StrengthBar password={newPw} />
                </div>

                {/* Confirm password */}
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-ivory/25 mb-1.5">
                    <KeyRound size={9} className="text-accent/50" />
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    required
                    placeholder="Repeat new password"
                    className={`w-full bg-white/[0.04] border rounded-xl px-3.5 py-2.5 text-[13px] text-ivory placeholder:text-ivory/20 focus:outline-none transition-all duration-200 ${
                      confirmPw && confirmPw !== newPw
                        ? "border-red-400/40"
                        : "border-white/[0.08] focus:border-accent/40"
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

          {/* ════════════════════════════════════════════════════════════ */}
          {/* RIGHT COLUMN — on desktop always visible (except posts tab) */}
          {/*              — on mobile only visible via "Account" tab     */}
          {/* ════════════════════════════════════════════════════════════ */}
          {activeSection !== "posts" && (
            <div className={`space-y-4 ${activeSection !== "account" ? "hidden md:block" : ""}`}>
              {/* ── Account Details ── */}
              <div className="glass-card rounded-2xl border border-white/[0.08] p-5 space-y-3">
                <h2 className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-ivory/25 flex items-center gap-1.5 mb-3">
                  <Shield size={10} className="text-accent/50" />
                  Account Details
                </h2>

                {[
                  {
                    icon: Mail,
                    label: "Email",
                    value: user?.email,
                    extra: user?.isVerified ? (
                      <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-400">
                        <CheckCircle2 size={9} />
                        verified
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono text-amber-400/70">
                        unverified
                      </span>
                    ),
                  },
                  {
                    icon: ProviderIcon,
                    label: "Sign-in method",
                    value: providerLabel,
                  },
                  {
                    icon: Calendar,
                    label: "Member since",
                    value: memberSince,
                  },
                  {
                    icon: Globe,
                    label: "Account type",
                    value:
                      user?.provider === "local"
                        ? "Local account"
                        : `OAuth — ${providerLabel}`,
                  },
                  {
                    icon: User,
                    label: "User ID",
                    value: user?.id ? `…${user.id.slice(-8)}` : "—",
                    mono: true,
                  },
                ].map(({ icon: Icon, label, value, extra, mono }) => (
                  <div
                    key={label}
                    className="flex items-start gap-3 py-2.5 border-b border-white/[0.04] last:border-0"
                  >
                    <div className="w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0 mt-0.5">
                      <Icon size={12} className="text-ivory/25" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-mono text-ivory/20 uppercase tracking-wider mb-0.5">
                        {label}
                      </p>
                      <p
                        className={`text-[12px] text-ivory/60 truncate ${mono ? "font-mono" : ""}`}
                      >
                        {value}
                      </p>
                      {extra && <div className="mt-0.5">{extra}</div>}
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Appearance ── */}
              <AppearanceCard />

              {/* ── My Workspaces ── */}
              <div className="glass-card rounded-2xl border border-white/[0.08] p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-ivory/25 flex items-center gap-1.5">
                    <Building2 size={10} className="text-accent/50" />
                    My Workspaces
                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-accent/10 text-accent text-[9px] font-mono">
                      {workspaceCount}
                    </span>
                  </h2>
                  <Link
                    href="/app"
                    className="text-[10px] font-mono text-ivory/25 hover:text-accent transition-colors flex items-center gap-0.5"
                  >
                    Open app <ChevronRight size={10} />
                  </Link>
                </div>

                {workspaces?.length === 0 ? (
                  <div className="text-center py-6">
                    <Building2
                      size={24}
                      className="mx-auto text-ivory/10 mb-2"
                    />
                    <p className="text-ivory/20 text-[11px] font-mono">
                      No workspaces yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-hide">
                    {workspaces.map((ws) => (
                      <div
                        key={ws._id}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.03] transition-colors duration-150 group"
                      >
                        {/* Workspace avatar */}
                        <div className="w-8 h-8 rounded-xl bg-linear-to-br from-accent/20 to-accent/5 border border-white/[0.08] flex items-center justify-center shrink-0 text-[11px] font-display font-bold text-accent/60">
                          {ws.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-display font-bold text-ivory/70 truncate">
                            {ws.name}
                          </p>
                          {ws.description && (
                            <p className="text-[10px] font-mono text-ivory/25 truncate mt-0.5">
                              {ws.description}
                            </p>
                          )}
                        </div>
                        <RoleBadge role={ws.myRole} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Banner crop modal */}
      {showBannerCrop && pendingBannerImage && (
        <ImageCropModal
          imageUrl={pendingBannerImage}
          onSave={(cropData, croppedCanvas) => {
            // Convert canvas to data URL
            const croppedImage = croppedCanvas.toDataURL("image/jpeg", 0.92);
            handleBannerCropSave(croppedImage);
          }}
          onCancel={() => { setShowBannerCrop(false); setPendingBannerImage(null); }}
        />
      )}
    </div>
  );
}

export { ProfilePage };

export default function Page() {
  return (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  );
}
