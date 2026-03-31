"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
    X, Github, Mail, MessageCircle, Clock, Heart, MessageSquare, Shield, Circle, Edit2, Pencil, Check
} from "lucide-react";
import toast from "react-hot-toast";
import useAuth from "@/hooks/useAuth";

export default function FullUserProfile({
    user,
    isOwnProfile,
    onClose,
    onMessage,
    onEdit,
    recentPosts = []
}) {
    const modalRef = useRef(null);
    const { user: authUser, updateProfile } = useAuth();

    // Inline status edit state
    const [editingStatus, setEditingStatus] = useState(false);
    const [statusInput, setStatusInput] = useState(user?.statusMessage || "");
    const [savingStatus, setSavingStatus] = useState(false);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape") onClose?.();
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [onClose]);

    const handleSaveStatus = async () => {
        setSavingStatus(true);
        const res = await updateProfile({ statusMessage: statusInput });
        setSavingStatus(false);
        if (res.success) {
            toast.success("Status updated");
            // If the user object isn't automatically reactive here via SWR/context, we assume the parent refreshes or page reloads.
        } else {
            toast.error(res.message || "Failed to update status");
        }
        setEditingStatus(false);
    };

    const hasGithub = user?.socialConnections?.github;
    const joinDate = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        : "Unknown";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div 
                ref={modalRef}
                className="relative w-full max-w-4xl bg-[#13141b] rounded-2xl shadow-2xl shadow-black/90 overflow-hidden flex flex-col md:flex-row max-h-[85vh] border border-white/[0.08] animate-in zoom-in-95 duration-200"
            >
                {/* Close Button Header overlay for small screens (and standard top right) */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 w-8 h-8 rounded-full flex items-center justify-center text-ivory/40 hover:text-ivory bg-white/[0.05] hover:bg-white/[0.1] backdrop-blur-md transition-all duration-200"
                >
                    <X size={16} />
                </button>

                {/* LEFT PANEL */}
                <div className="w-full md:w-[320px] bg-[#1a1b23] flex-shrink-0 flex flex-col relative overflow-y-auto scrollbar-hide border-r border-white/[0.04]">
                    {/* Banner */}
                    <div className="h-32 bg-gradient-to-br from-accent/40 via-accent/15 to-[#0f1015] relative shrink-0 overflow-hidden">
                        {user?.banner?.imageUrl && <Image src={user.banner.imageUrl} fill className="object-cover" alt="Banner" unoptimized />}
                    </div>

                    <div className="relative px-6 flex-shrink-0">
                        {/* Avatar */}
                        <div className="absolute top-[-50px] left-6 w-[100px] h-[100px] rounded-full bg-[#1a1b23] p-[6px] z-20">
                            <div className="w-full h-full rounded-full overflow-hidden relative">
                                <Image
                                    src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || "user"}`}
                                    fill
                                    className="object-cover"
                                    alt="avatar"
                                    unoptimized
                                />
                            </div>
                            {/* Online dot */}
                            <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full border-[3px] border-[#1a1b23] bg-emerald-400 z-30 shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
                        </div>
                    </div>

                    <div className="pt-16 pb-6 px-6 flex-1 flex flex-col relative z-0">
                        <h2 className="text-ivory font-display font-bold text-[22px] leading-tight flex items-center gap-2">
                           {user?.name}
                           {user?.isVerified && (
                              <Check size={16} className="text-emerald-400" />
                           )}
                        </h2>
                        <div className="flex items-center gap-2 mb-4">
                            {isOwnProfile && <p className="text-ivory/50 text-[13px] font-mono">{user?.email}</p>}
                            {/* Dummy badge for aesthetics mimicking the HTML */}
                            <span className="shrink-0 flex items-center justify-center w-[18px] h-[18px] rounded-[3px] bg-[#5865f2] text-white text-[9px] font-bold">★</span>
                        </div>

                        {/* Custom Status */}
                        <div className="mb-4">
                            {isOwnProfile ? (
                                editingStatus ? (
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-1">
                                            <input 
                                                autoFocus
                                                type="text" 
                                                value={statusInput} 
                                                onChange={e => setStatusInput(e.target.value)}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') handleSaveStatus();
                                                    if (e.key === 'Escape') setEditingStatus(false);
                                                }}
                                                disabled={savingStatus}
                                                className="flex-1 bg-white/[0.04] border border-accent/20 rounded-lg px-2.5 py-1.5 text-[13px] text-ivory outline-none focus:border-accent/50 transition-colors"
                                                placeholder="What's on your mind?"
                                            />
                                            <button onClick={handleSaveStatus} disabled={savingStatus} className="w-7 h-7 rounded-md bg-accent/20 hover:bg-accent/30 text-accent flex items-center justify-center transition-colors">
                                                <Check size={14} />
                                            </button>
                                            <button onClick={() => setEditingStatus(false)} className="w-7 h-7 rounded-md bg-white/[0.05] hover:bg-white/[0.1] text-ivory/50 hover:text-ivory transition-colors flex items-center justify-center">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => { setStatusInput(user.statusMessage || ""); setEditingStatus(true); }}
                                        className="w-full text-left group flex items-center justify-between cursor-text hover:bg-white/[0.03] p-2 -mx-2 rounded-lg transition-colors border border-transparent"
                                    >
                                        <p className={`text-[13px] italic ${user.statusMessage ? 'text-ivory/80' : 'text-ivory/30'}`}>
                                            {user.statusMessage || "Click to add a status..."}
                                        </p>
                                        <Pencil size={12} className="text-ivory/20 group-hover:text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                )
                            ) : (
                                user?.statusMessage ? (
                                    <p className="text-[13px] italic text-ivory/80">"{user.statusMessage}"</p>
                                ) : null
                            )}
                        </div>

                        <div className="h-px bg-white/[0.06] mb-5" />

                        {/* Bio */}
                        <div className="mb-5">
                            <p className="text-sm text-ivory/70 leading-relaxed whitespace-pre-wrap">
                                {user?.bio || <span className="text-ivory/30 italic">No bio provided.</span>}
                            </p>
                        </div>

                        <div className="h-px bg-white/[0.06] mb-5" />

                        <div className="text-[11px] uppercase font-mono tracking-widest font-bold text-ivory/30 mb-2">Member Since</div>
                        <p className="text-[13px] text-ivory mb-5">{joinDate}</p>

                        <div className="h-px bg-white/[0.06] mb-5" />

                        {/* Connections */}
                        <div className="text-[11px] uppercase font-mono tracking-widest font-bold text-ivory/30 mb-2">Connections</div>
                        <div className="space-y-2 mb-6">
                            {hasGithub ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-[#2b2d31] flex items-center justify-center border border-[#4e5058] shrink-0">
                                        <Github size={12} className="text-ivory/60" />
                                    </div>
                                    <a href={`https://github.com/${user.socialConnections.github.username}`} target="_blank" rel="noopener noreferrer" className="text-[13px] text-ivory flex items-center gap-1 hover:underline">
                                        GitHub ↗
                                    </a>
                                </div>
                            ) : null}
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-[#1b2838] flex items-center justify-center shrink-0">
                                    <Mail size={12} className="text-[#c7d5e0]" />
                                </div>
                                {isOwnProfile && <span className="text-[13px] text-ivory">{user?.email}</span>}
                            </div>
                        </div>

                        {/* Action buttons footer aligned to left side layout */}
                        <div className="mt-auto pt-6">
                            {isOwnProfile ? (
                                <button
                                    onClick={onEdit}
                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-accent/15 hover:bg-accent/25 border border-accent/20 text-accent font-display font-bold text-[13px] transition-all"
                                >
                                    <Edit2 size={14} />
                                    Edit Profile
                                </button>
                            ) : (
                                <button
                                    onClick={onMessage}
                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-accent/20 hover:bg-accent/30 border border-accent/40 text-accent font-display font-bold text-[13px] transition-all"
                                >
                                    <MessageCircle size={14} />
                                    Send Message
                                </button>
                            )}
                        </div>

                    </div>
                </div>

                {/* RIGHT PANEL - Activity feed */}
                <div className="flex-1 bg-[#13141b] flex flex-col relative overflow-hidden">
                    {/* Tabs / Header */}
                    <div className="px-6 pt-5 pb-3 border-b border-white/[0.04] shrink-0">
                         <h3 className="text-[13px] font-display font-bold uppercase tracking-wider text-ivory">Activity Feed</h3>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide">
                        {recentPosts && recentPosts.length > 0 ? (
                            <div className="space-y-4 max-w-2xl mx-auto">
                                {recentPosts.map((post) => (
                                    <div key={post._id} className="glass-card rounded-xl p-4 border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] transition-colors shadow-none">
                                        {post.imageUrl && (
                                            <div className="w-full h-32 md:h-48 rounded-lg overflow-hidden mb-3 relative bg-black/20">
                                                <Image src={post.imageUrl} fill className="object-cover" alt="Post media" unoptimized />
                                            </div>
                                        )}
                                        <p className="text-ivory/80 text-[14px] leading-relaxed mb-3 whitespace-pre-wrap break-words">{post.caption || post.content}</p>
                                        <div className="flex items-center gap-4 text-ivory/40 text-[12px] font-mono">
                                            <span className="flex items-center gap-1.5"><Heart size={14} className={post.likes?.includes(authUser?._id || authUser?.id) ? "text-red-400" : ""} /> {post.likes?.length || 0}</span>
                                            <span className="flex items-center gap-1.5"><MessageSquare size={14} /> {post.comments?.length || post.replies || 0}</span>
                                            <span className="flex items-center gap-1.5 ml-auto"><Clock size={14} /> {new Date(post.createdAt || Date.now()).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center pb-12">
                                <div className="w-16 h-16 rounded-full bg-white/[0.02] flex items-center justify-center mb-4 border border-white/[0.05]">
                                    <MessageSquare size={24} className="text-white/20" />
                                </div>
                                <h3 className="text-ivory font-display font-bold text-[16px] mb-1">No Recent Activity</h3>
                                <p className="text-[13px] text-ivory/40 font-mono">This user hasn't posted anything lately.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
