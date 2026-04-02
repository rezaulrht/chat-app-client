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
    member, // workspace member data with role, roleIds
    workspaceRoles, // array of workspace role objects
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

    // Local user state that can be updated
    const [user, setUser] = useState(initialUser);

    // Inline status edit state
    const [editingStatus, setEditingStatus] = useState(false);
    const [statusInput, setStatusInput] = useState(initialUser?.statusMessage || "");
    const [savingStatus, setSavingStatus] = useState(false);

    // Posts state - fetch internally if not provided
    const [posts, setPosts] = useState(initialPosts || []);
    const [postsLoading, setPostsLoading] = useState(false);
    const [postsError, setPostsError] = useState(null);

    // Fetch user posts if not provided
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
                // Update local user state
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

    // Get custom roles for this member
    const customRoles = useMemo(() => {
        const roles = workspaceRoles || workspaces.find(w => w._id === workspaceId)?.roles || [];
        if (!member?.roleIds) return [];
        return member.roleIds
            .map(roleId => roles.find(r => r._id?.toString() === roleId?.toString()))
            .filter(Boolean);
    }, [member?.roleIds, workspaceRoles, workspaces, workspaceId]);

    // Animation state
    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 50);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center pt-[80px] px-4 pb-4 bg-black/50 backdrop-blur-sm transition-opacity duration-200"
            style={{ opacity: isVisible ? 1 : 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div 
                ref={modalRef}
                className="relative w-full max-w-4xl bg-white dark:bg-[#1a1b26] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[calc(100vh-120px)] border border-gray-200 dark:border-white/10 transition-all duration-300"
                style={{ 
                    transform: isVisible ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(-20px)',
                    opacity: isVisible ? 1 : 0
                }}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:text-white/40 dark:hover:text-white bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 transition-all duration-200"
                >
                    <X size={16} />
                </button>

                {/* LEFT PANEL */}
                <div className="w-full md:w-[320px] bg-gray-50 dark:bg-[#13141b] flex-shrink-0 flex flex-col relative overflow-y-auto scrollbar-hide border-r border-gray-100 dark:border-white/5">
                    {/* Banner */}
                    <div className="h-28 bg-gradient-to-br from-[#5865F2]/30 via-[#5865F2]/15 to-gray-100 dark:to-[#13141b] relative shrink-0 overflow-hidden">
                        {user?.banner?.imageUrl && <Image src={user.banner.imageUrl} fill className="object-cover" alt="Banner" unoptimized />}
                    </div>

                    <div className="relative px-6 flex-shrink-0">
                        {/* Avatar */}
                        <div className="absolute top-[-50px] left-6 w-[100px] h-[100px] rounded-full bg-white dark:bg-[#13141b] p-[6px] z-20">
                            <div className="w-full h-full rounded-full overflow-hidden relative">
                                <Image
                                    src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || "user"}`}
                                    fill
                                    className="object-cover"
                                    alt="avatar"
                                    unoptimized
                                />
                            </div>
                            {/* Online dot - real-time presence */}
                            <div 
                                className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-[3px] border-white dark:border-[#13141b] z-30 transition-colors duration-300 ${
                                    isOnline 
                                        ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' 
                                        : 'bg-gray-400 dark:bg-gray-600'
                                }`}
                            />
                        </div>
                    </div>

                    <div className="pt-16 pb-6 px-6 flex-1 flex flex-col relative z-0">
                        <h2 className="text-gray-900 dark:text-white font-bold text-[20px] leading-tight flex items-center gap-2">
                           {user?.name}
                           {user?.isVerified && (
                              <Check size={16} className="text-emerald-500" />
                           )}
                        </h2>
                        
                        {/* Roles */}
                        <div className="flex flex-wrap gap-1.5 mb-4 mt-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/20 text-gray-600 dark:text-gray-300">
                                Member
                            </span>
                            {customRoles.map((role) => (
                                <span
                                    key={role._id}
                                    className="px-2 py-0.5 rounded text-[10px] font-semibold border"
                                    style={{
                                        backgroundColor: `${role.color}15`,
                                        borderColor: `${role.color}40`,
                                        color: role.color
                                    }}
                                >
                                    {role.name}
                                </span>
                            ))}
                            {member?.role === "owner" && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/15 border border-yellow-500/30 text-yellow-600 dark:text-yellow-400">
                                    Owner
                                </span>
                            )}
                            {member?.role === "admin" && member?.role !== "owner" && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/15 border border-blue-500/30 text-blue-600 dark:text-blue-400">
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
                                            className="flex-1 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-[13px] text-gray-900 dark:text-white outline-none focus:border-[#5865F2]/50 transition-colors"
                                            placeholder="What's on your mind?"
                                        />
                                        <button onClick={handleSaveStatus} disabled={savingStatus} className="w-7 h-7 rounded-md bg-[#5865F2]/20 hover:bg-[#5865F2]/30 text-[#5865F2] flex items-center justify-center transition-colors">
                                            {savingStatus ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                        </button>
                                        <button onClick={() => setEditingStatus(false)} className="w-7 h-7 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-500 hover:text-gray-700 dark:text-white/50 dark:hover:text-white transition-colors flex items-center justify-center">
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => { setStatusInput(user.statusMessage || ""); setEditingStatus(true); }}
                                        className="w-full text-left group flex items-center justify-between cursor-text hover:bg-gray-50 dark:hover:bg-white/5 p-2 -mx-2 rounded-lg transition-colors"
                                    >
                                        <p className={`text-[13px] italic ${user.statusMessage ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>
                                            {user.statusMessage || "Click to add a status..."}
                                        </p>
                                        <Pencil size={12} className="text-gray-300 dark:text-white/20 group-hover:text-[#5865F2] opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                )
                            ) : (
                                user?.statusMessage ? (
                                    <p className="text-[13px] italic text-gray-600 dark:text-gray-300">"{user.statusMessage}"</p>
                                ) : null
                            )}
                        </div>

                        <div className="h-px bg-gray-200 dark:bg-white/5 mb-5" />

                        {/* Bio */}
                        <div className="mb-5">
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                {user?.bio || <span className="text-gray-400 dark:text-gray-500 italic">No bio provided.</span>}
                            </p>
                        </div>

                        <div className="h-px bg-gray-200 dark:bg-white/5 mb-5" />

                        <div className="text-[10px] uppercase font-mono tracking-widest font-bold text-gray-400 dark:text-white/30 mb-1">Member Since</div>
                        <p className="text-[13px] text-gray-700 dark:text-gray-200 mb-5">{joinDate}</p>

                        <div className="h-px bg-gray-200 dark:bg-white/5 mb-5" />

                        {/* Connections */}
                        <div className="text-[10px] uppercase font-mono tracking-widest font-bold text-gray-400 dark:text-white/30 mb-2">Connections</div>
                        <div className="space-y-2 mb-4">
                            {hasGithub ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center border border-gray-200 dark:border-white/10 shrink-0">
                                        <Github size={14} className="text-gray-600 dark:text-gray-400" />
                                    </div>
                                    <a href={`https://github.com/${user.socialConnections.github.username}`} target="_blank" rel="noopener noreferrer" className="text-[13px] text-gray-700 dark:text-gray-200 flex items-center gap-1 hover:text-[#5865F2] transition-colors">
                                        @{user.socialConnections.github.username}
                                    </a>
                                </div>
                            ) : (
                                <p className="text-[12px] text-gray-400 dark:text-gray-500 italic">No connections linked</p>
                            )}
                        </div>

                        {/* Action buttons */}
                        <div className="mt-auto pt-4">
                            {!isOwnProfile && (
                                <button
                                    onClick={onMessage}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#5865F2]/90 text-white font-semibold text-[13px] transition-all shadow-lg shadow-[#5865F2]/20"
                                >
                                    <MessageCircle size={16} />
                                    Send Message
                                </button>
                            )}
                        </div>

                    </div>
                </div>

                {/* RIGHT PANEL - Activity feed */}
                <div className="flex-1 bg-white dark:bg-[#1a1b26] flex flex-col relative overflow-hidden">
                    {/* Header */}
                    <div className="px-6 pt-4 pb-3 border-b border-gray-100 dark:border-white/5 shrink-0">
                         <h3 className="text-[12px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Recent Activity</h3>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-hide">
                        {postsLoading ? (
                            <div className="flex items-center justify-center h-full pb-12">
                                <Loader2 size={24} className="animate-spin text-[#5865F2]/40" />
                            </div>
                        ) : postsError ? (
                            <div className="flex flex-col items-center justify-center h-full text-center pb-12">
                                <p className="text-red-400/60 text-[13px]">{postsError}</p>
                            </div>
                        ) : posts && posts.length > 0 ? (
                            <div className="space-y-3 max-w-2xl">
                                {posts.map((post) => (
                                    <div key={post._id} className="rounded-xl p-4 border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02] hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-colors">
                                        {post.imageUrl && (
                                            <div className="w-full h-32 rounded-lg overflow-hidden mb-3 relative bg-gray-200 dark:bg-black/20">
                                                <Image src={post.imageUrl} fill className="object-cover" alt="Post media" unoptimized />
                                            </div>
                                        )}
                                        <p className="text-gray-800 dark:text-gray-200 text-[13px] leading-relaxed mb-3 whitespace-pre-wrap break-words line-clamp-4">{post.caption || post.content}</p>
                                        <div className="flex items-center gap-4 text-gray-400 dark:text-gray-500 text-[11px]">
                                            <span className="flex items-center gap-1"><Heart size={12} className={post.likes?.includes(authUser?._id || authUser?.id) ? "text-red-400 fill-red-400" : ""} /> {post.likes?.length || 0}</span>
                                            <span className="flex items-center gap-1"><MessageSquare size={12} /> {post.comments?.length || post.replies || 0}</span>
                                            <span className="flex items-center gap-1 ml-auto">{new Date(post.createdAt || Date.now()).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center pb-12">
                                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4 border border-gray-200 dark:border-white/10">
                                    <MessageSquare size={24} className="text-gray-300 dark:text-gray-600" />
                                </div>
                                <h3 className="text-gray-700 dark:text-gray-300 font-bold text-[15px] mb-1">No Recent Activity</h3>
                                <p className="text-[12px] text-gray-400 dark:text-gray-500">This user hasn't posted anything lately.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
