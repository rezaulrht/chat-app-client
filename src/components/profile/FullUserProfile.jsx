"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import Image from "next/image";
import {
    X, Github, Mail, MessageCircle, Clock, Heart, MessageSquare, Shield, Circle, Edit2, Pencil, Check, Loader2
} from "lucide-react";
import toast from "react-hot-toast";
import useAuth from "@/hooks/useAuth";
import { useWorkspace } from "@/hooks/useWorkspace";
import api from "@/app/api/Axios";

export default function FullUserProfile({
    user: initialUser,
    member,
    workspaceRoles,
    workspaceId,
    isOwnProfile,
    onClose,
    onMessage,
    onEdit,
    recentPosts: initialPosts
}) {
    const modalRef = useRef(null);
    const { user: authUser, updateProfile } = useAuth();
    const { workspaces, membersCache } = useWorkspace();
    
    // Get real-time presence from members cache
    const workspaceMembers = membersCache[workspaceId] || [];
    const currentMember = workspaceMembers.find(m => m.user?._id === (initialUser?._id || initialUser?.id));
    const isOnline = currentMember?.online || false;

    const [user, setUser] = useState(initialUser);
    const [editingStatus, setEditingStatus] = useState(false);
    const [statusInput, setStatusInput] = useState(initialUser?.statusMessage || "");
    const [savingStatus, setSavingStatus] = useState(false);
    const [posts, setPosts] = useState(initialPosts || []);
    const [postsLoading, setPostsLoading] = useState(false);
    const [postsError, setPostsError] = useState(null);

    useEffect(() => {
        if (initialPosts && initialPosts.length > 0) {
            setPosts(initialPosts);
            return;
        }
        
        if (!user?._id && !user?.id) return;

        const fetchPosts = async () => {
            setPostsLoading(true);
            setPostsError(null);
            try {
                const userId = user._id || user.id;
                const res = await api.get(`/api/feed/users/${userId}/posts`, {
                    params: { page: 1, limit: 10 }
                });
                setPosts(res.data.posts || []);
            } catch (err) {
                console.error("Failed to fetch posts:", err);
                setPostsError("Failed to load posts");
            } finally {
                setPostsLoading(false);
            }
        };

        fetchPosts();
    }, [initialPosts, user?._id, user?.id]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape") onClose?.();
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [onClose]);

    const handleSaveStatus = async () => {
        setSavingStatus(true);
        try {
            const res = await updateProfile({ statusMessage: statusInput });
            if (res.success) {
                setUser(prev => ({ ...prev, statusMessage: statusInput }));
                toast.success("Status updated");
                setEditingStatus(false);
            } else {
                toast.error(res.message || "Failed to update status");
            }
        } catch (error) {
            toast.error(error.message || "Failed to update status");
        } finally {
            setSavingStatus(false);
        }
    };

    const hasGithub = user?.socialConnections?.github;
    const joinDate = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        : "Unknown";

    const customRoles = useMemo(() => {
        const roles = workspaceRoles || workspaces.find(w => w._id === workspaceId)?.roles || [];
        if (!member?.roleIds) return [];
        return member.roleIds
            .map(roleId => roles.find(r => r._id?.toString() === roleId?.toString()))
            .filter(Boolean);
    }, [member?.roleIds, workspaceRoles, workspaces, workspaceId]);

    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 50);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center pt-[80px] px-4 pb-4 bg-black/60 backdrop-blur-sm transition-opacity duration-200"
            style={{ opacity: isVisible ? 1 : 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div 
                ref={modalRef}
                className="relative w-full max-w-4xl glass-panel rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[calc(100vh-120px)] border border-white/[0.08] transition-all duration-300"
                style={{ 
                    transform: isVisible ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(-20px)',
                    opacity: isVisible ? 1 : 0
                }}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 w-8 h-8 rounded-full flex items-center justify-center text-ivory/40 hover:text-ivory bg-white/[0.05] hover:bg-white/[0.1] transition-all duration-200"
                >
                    <X size={16} />
                </button>

                {/* LEFT PANEL */}
                <div className="w-full md:w-[320px] bg-deep flex-shrink-0 flex flex-col relative overflow-y-auto scrollbar-hide border-r border-white/[0.04]">
                    {/* Banner */}
                    <div className="h-28 bg-linear-to-br from-accent/40 via-accent/15 to-deep relative shrink-0 overflow-hidden">
                        {user?.banner?.imageUrl && <Image src={user.banner.imageUrl} fill className="object-cover" alt="Banner" unoptimized />}
                    </div>

                    <div className="relative px-6 flex-shrink-0">
                        {/* Avatar */}
                        <div className="absolute top-[-50px] left-6 w-[100px] h-[100px] rounded-full bg-deep p-[6px] z-20">
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
                            <div className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-[3px] border-deep z-30 transition-colors duration-300 ${isOnline ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]' : 'bg-gray-500'}`} />
                        </div>
                    </div>

                    <div className="pt-16 pb-6 px-6 flex-1 flex flex-col relative z-0">
                        <h2 className="text-ivory font-display font-bold text-[20px] leading-tight flex items-center gap-2">
                           {user?.name}
                           {user?.isVerified && (
                              <Check size={16} className="text-emerald-400" />
                           )}
                        </h2>
                        
                        {/* Roles */}
                        <div className="flex flex-wrap gap-1.5 mb-4 mt-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/5 border border-white/10 text-ivory/60">
                                Member
                            </span>
                            {customRoles.map((role) => (
                                <span
                                    key={role._id}
                                    className="px-2 py-0.5 rounded text-[10px] font-semibold border"
                                    style={{
                                        backgroundColor: `${role.color}20`,
                                        borderColor: `${role.color}50`,
                                        color: role.color
                                    }}
                                >
                                    {role.name}
                                </span>
                            ))}
                            {member?.role === "owner" && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/20 border border-yellow-500/40 text-yellow-300">
                                    Owner
                                </span>
                            )}
                            {member?.role === "admin" && member?.role !== "owner" && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 border border-blue-500/40 text-blue-300">
                                    Admin
                                </span>
                            )}
                        </div>

                        {/* Custom Status */}
                        <div className="mb-4">
                            {isOwnProfile ? (
                                editingStatus ? (
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
                                            {savingStatus ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                        </button>
                                        <button onClick={() => setEditingStatus(false)} className="w-7 h-7 rounded-md bg-white/[0.05] hover:bg-white/[0.1] text-ivory/50 hover:text-ivory transition-colors flex items-center justify-center">
                                            <X size={14} />
                                        </button>
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

                        <div className="text-[10px] uppercase font-mono tracking-widest font-bold text-ivory/30 mb-1">Member Since</div>
                        <p className="text-[13px] text-ivory mb-5">{joinDate}</p>

                        <div className="h-px bg-white/[0.06] mb-5" />

                        {/* Email */}
                        <div className="text-[10px] uppercase font-mono tracking-widest font-bold text-ivory/30 mb-1">Email</div>
                        <p className="text-[13px] text-ivory mb-5">{user?.email || "Not available"}</p>

                        <div className="h-px bg-white/[0.06] mb-5" />

                        {/* Connections */}
                        <div className="text-[10px] uppercase font-mono tracking-widest font-bold text-ivory/30 mb-2">Connections</div>
                        <div className="space-y-2 mb-4">
                            {hasGithub ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-full bg-white/[0.08] flex items-center justify-center border border-white/[0.1] shrink-0">
                                        <Github size={14} className="text-ivory/60" />
                                    </div>
                                    <a href={`https://github.com/${user.socialConnections.github.username}`} target="_blank" rel="noopener noreferrer" className="text-[13px] text-ivory flex items-center gap-1 hover:text-accent transition-colors">
                                        @{user.socialConnections.github.username}
                                    </a>
                                </div>
                            ) : (
                                <p className="text-[12px] text-ivory/40 italic">No connections linked</p>
                            )}
                        </div>

                        {/* Action buttons */}
                        <div className="mt-auto pt-4">
                            {!isOwnProfile && (
                                <button
                                    onClick={onMessage}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent/20 hover:bg-accent/30 border border-accent/40 text-accent font-semibold text-[13px] transition-all"
                                >
                                    <MessageCircle size={16} />
                                    Send Message
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL - Activity feed */}
                <div className="flex-1 glass-panel flex flex-col relative overflow-hidden">
                    {/* Header */}
                    <div className="px-6 pt-4 pb-3 border-b border-white/[0.04] shrink-0">
                         <h3 className="text-[12px] font-display font-bold uppercase tracking-wider text-ivory/50">Recent Activity</h3>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-hide">
                        {postsLoading ? (
                            <div className="flex items-center justify-center h-full pb-12">
                                <Loader2 size={24} className="animate-spin text-accent/40" />
                            </div>
                        ) : postsError ? (
                            <div className="flex flex-col items-center justify-center h-full text-center pb-12">
                                <p className="text-red-400/60 text-[13px]">{postsError}</p>
                            </div>
                        ) : posts && posts.length > 0 ? (
                            <div className="space-y-3 max-w-2xl">
                                {posts.map((post) => (
                                    <div key={post._id} className="rounded-xl p-4 border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                                        {post.imageUrl && (
                                            <div className="w-full h-32 rounded-lg overflow-hidden mb-3 relative bg-black/20">
                                                <Image src={post.imageUrl} fill className="object-cover" alt="Post media" unoptimized />
                                            </div>
                                        )}
                                        <p className="text-ivory/80 text-[13px] leading-relaxed mb-3 whitespace-pre-wrap break-words line-clamp-4">{post.caption || post.content}</p>
                                        <div className="flex items-center gap-4 text-ivory/40 text-[11px]">
                                            <span className="flex items-center gap-1"><Heart size={12} className={post.likes?.includes(authUser?._id || authUser?.id) ? "text-red-400 fill-red-400" : ""} /> {post.likes?.length || 0}</span>
                                            <span className="flex items-center gap-1"><MessageSquare size={12} /> {post.comments?.length || post.replies || 0}</span>
                                            <span className="flex items-center gap-1 ml-auto">{new Date(post.createdAt || Date.now()).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center pb-12">
                                <div className="w-16 h-16 rounded-full bg-white/[0.02] flex items-center justify-center mb-4 border border-white/[0.05]">
                                    <MessageSquare size={24} className="text-white/20" />
                                </div>
                                <h3 className="text-ivory font-display font-bold text-[15px] mb-1">No Recent Activity</h3>
                                <p className="text-[12px] text-ivory/40">This user hasn't posted anything lately.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
