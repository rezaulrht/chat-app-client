"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import Image from "next/image";
import { Github, MoreVertical, MessageCircle, Flag, Send, Plus } from "lucide-react";
import { useWorkspace } from "@/hooks/useWorkspace";

export default function PreviewUserCard({
    user,
    member,
    workspaceId,
    isAdmin = false,
    onViewProfile,
    onMessage,
    onAddRole,
    onKick,
    onBan,
    onReport,
    position,
    onClose,
}) {
    const cardRef = useRef(null);
    const [showMenu, setShowMenu] = useState(false);
    const [messageText, setMessageText] = useState("");
    const [isSending, setIsSending] = useState(false);
    const menuRef = useRef(null);
    const [clampedPosition, setClampedPosition] = useState({ x: 0, y: 0 });

    // Get workspace roles
    const { workspaces } = useWorkspace();
    const workspace = workspaces.find(w => w._id === workspaceId);
    
    // Get custom roles for this member
    const customRoles = useMemo(() => {
        if (!member?.roleIds || !workspace?.roles) return [];
        return member.roleIds
            .map(roleId => workspace.roles.find(r => r._id?.toString() === roleId?.toString()))
            .filter(Boolean);
    }, [member?.roleIds, workspace?.roles]);

    // Animation state
    const [isVisible, setIsVisible] = useState(false);
    
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 10);
        return () => clearTimeout(timer);
    }, []);

    // Consolidated click outside handler
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowMenu(false);
            }
            if (cardRef.current && !cardRef.current.contains(e.target) && 
                (!menuRef.current || !menuRef.current.contains(e.target))) {
                onClose?.();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    // Smart positioning beside panel
    useEffect(() => {
        if (!position) return;
        const cardWidth = cardRef.current?.offsetWidth || 320;
        const cardHeight = cardRef.current?.offsetHeight || 520;
        const gap = 16;

        let left = position.x + gap;
        let top = position.y;

        if (left + cardWidth > window.innerWidth - 20) {
            left = Math.max(16, position.x - cardWidth - gap);
        }

        if (top + cardHeight > window.innerHeight - 20) {
            top = Math.max(16, window.innerHeight - cardHeight - 20);
        }

        setClampedPosition({ x: left, y: top });
    }, [position]);

    const handleSendMessage = async () => {
        if (!messageText.trim()) return;
        setIsSending(true);
        try {
            await onMessage?.(messageText);
            setMessageText("");
        } finally {
            setIsSending(false);
        }
    };

    const hasGithub = user?.socialConnections?.github;
    const isOwner = member?.role === "owner";
    const isAdminRole = member?.role === "admin";
    const roleDisplay = isOwner ? "Owner" : isAdminRole ? "Admin" : "Member";
    const roleColor = isOwner
        ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-700 dark:text-yellow-300"
        : isAdminRole
            ? "bg-blue-500/20 border-blue-500/50 text-blue-700 dark:text-blue-300"
            : "bg-[#5865F2]/20 border-[#5865F2]/50 text-[#5865F2]";

    return (
        <div
            ref={cardRef}
            onClick={(e) => e.stopPropagation()}
            className="fixed z-50 w-80 rounded-xl border border-gray-200/80 dark:border-white/8 bg-white dark:bg-[#1a1b26] shadow-2xl overflow-hidden"
            style={{
                left: clampedPosition.x,
                top: clampedPosition.y,
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateX(0)" : "translateX(-60px)",
                transition: "opacity 0.25s ease-out, transform 0.25s ease-out",
            }}
        >
            {/* BANNER */}
            <div className="relative h-24 bg-gradient-to-r from-[#5865F2]/30 to-[#5865F2]/10 overflow-hidden group">
                {user?.banner?.imageUrl ? (
                    <Image
                        src={user.banner.imageUrl}
                        alt="Banner"
                        fill
                        className="object-cover"
                        unoptimized
                    />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#1a1b26] via-transparent to-transparent" />
            </div>

            {/* BODY */}
            <div className="px-5 pb-4">
                {/* AVATAR + HEADER */}
                <div className="flex items-end gap-3 -mt-12 mb-3 relative z-10">
                    {/* Avatar - Clickable */}
                    <button
                        onClick={onViewProfile}
                        className="shrink-0 group focus:outline-none"
                    >
                        <div className="w-20 h-20 rounded-full bg-white dark:bg-[#1a1b26] border-4 border-white dark:border-[#1a1b26] overflow-hidden hover:border-[#5865F2]/40 transition-all ring-4 ring-white dark:ring-[#1a1b26] group-hover:ring-[#5865F2]/20">
                            {user?.avatar ? (
                                <Image
                                    src={user.avatar}
                                    alt={user.name}
                                    width={80}
                                    height={80}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                    unoptimized
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-[#5865F2]/40 to-[#5865F2]/10 flex items-center justify-center text-xl font-bold text-[#5865F2]">
                                    {user?.name?.charAt(0)?.toUpperCase()}
                                </div>
                            )}
                        </div>
                    </button>

                    {/* Menu button */}
                    <div className="flex-1" />
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/8 rounded transition-all text-gray-400 dark:text-white/50 hover:text-gray-600 dark:hover:text-white"
                            aria-label="More options"
                            aria-expanded={showMenu}
                            aria-haspopup="menu"
                        >
                            <MoreVertical size={16} />
                        </button>

                        {showMenu && (
                            <div className="absolute right-0 top-full mt-2 w-44 rounded-lg bg-white dark:bg-[#13141b] border border-gray-200 dark:border-white/8 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden z-50">
                                <button
                                    onClick={() => {
                                        onReport?.();
                                        setShowMenu(false);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs hover:bg-gray-50 dark:hover:bg-white/8 transition-all text-gray-600 dark:text-white/70 border-b border-gray-100 dark:border-white/6"
                                >
                                    <Flag size={13} />
                                    Report User
                                </button>
                                {isAdmin && onKick && (
                                    <button
                                        onClick={() => {
                                            onKick?.();
                                            setShowMenu(false);
                                        }}
                                        className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-red-50 dark:hover:bg-red-500/20 transition-all text-red-500 border-b border-gray-100 dark:border-white/6"
                                    >
                                        Kick from Workspace
                                    </button>
                                )}
                                {isAdmin && onBan && (
                                    <button
                                        onClick={() => {
                                            onBan?.();
                                            setShowMenu(false);
                                        }}
                                        className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-red-50 dark:hover:bg-red-500/20 transition-all text-red-600"
                                    >
                                        Ban from Workspace
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* NAME + ROLE */}
                <div className="mb-3">
                    <h3 className="font-bold text-gray-900 dark:text-white text-base">{user?.name}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${roleColor}`}>
                            {roleDisplay}
                        </span>
                        {/* Custom roles */}
                        {customRoles.map((role) => (
                            <span
                                key={role._id}
                                className="px-2 py-0.5 rounded text-xs font-semibold border"
                                style={{
                                    backgroundColor: `${role.color}20`,
                                    borderColor: `${role.color}50`,
                                    color: role.color
                                }}
                            >
                                {role.name}
                            </span>
                        ))}
                        {isAdmin && onAddRole && (
                            <button
                                onClick={onAddRole}
                                className="w-5.5 h-5.5 flex items-center justify-center rounded bg-gray-200 dark:bg-[#2b2d31] border border-gray-300 dark:border-[#3f4147] hover:bg-gray-300 dark:hover:bg-[#3f4147] text-gray-600 dark:text-[#dbdee1] transition-colors"
                                title="Add Role"
                            >
                                <Plus size={12} />
                            </button>
                        )}
                        {hasGithub && (
                            <a
                                href={`https://github.com/${user.socialConnections.github.username}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/70 transition-colors"
                            >
                                <Github size={13} />
                            </a>
                        )}
                    </div>
                </div>

                {/* STATUS MESSAGE */}
                {user?.statusMessage && (
                    <div className="w-full text-left mb-3 p-2 rounded-lg bg-gray-50 dark:bg-white/4 border border-gray-100 dark:border-white/6">
                        <p className="text-xs text-gray-500 dark:text-white/50 mb-1">Status</p>
                        <p className="text-sm text-gray-700 dark:text-white/80 italic">"{user.statusMessage}"</p>
                    </div>
                )}

                {/* BIO PREVIEW */}
                {user?.bio && (
                    <p className="text-xs text-gray-600 dark:text-white/60 line-clamp-3 mb-3 leading-relaxed">
                        {user.bio}
                    </p>
                )}

                {/* EMAIL (for own profile or if visible) */}
                {user?.email && (
                    <p className="text-xs text-gray-500 dark:text-white/40 mb-3">
                        {user.email}
                    </p>
                )}

                {/* MEMBER SINCE */}
                {member?.joinedAt && (
                    <p className="text-xs text-gray-400 dark:text-white/40 mb-4">
                        Joined {new Date(member.joinedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                )}

                {/* DIVIDER */}
                <div className="h-px bg-gray-200 dark:bg-white/6 mb-4" />

                {/* BUTTONS */}
                <div className="space-y-2">
                    <button
                        onClick={onViewProfile}
                        className="w-full px-3 py-2 rounded-lg bg-[#5865F2]/20 hover:bg-[#5865F2]/30 border border-[#5865F2]/40 text-[#5865F2] font-semibold text-xs uppercase tracking-wide transition-all"
                    >
                        View Profile
                    </button>
                </div>

                {/* MESSAGE INPUT */}
                <div className="flex gap-2 mt-3">
                    <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey && messageText.trim()) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        placeholder="Message..."
                        maxLength={100}
                        className="flex-1 px-3 py-2 rounded-lg bg-gray-50 dark:bg-white/4 border border-gray-200 dark:border-white/8 focus:border-[#5865F2]/50 text-gray-900 dark:text-white text-xs placeholder:text-gray-400 dark:placeholder:text-white/30 outline-none transition-all"
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!messageText.trim() || isSending}
                        className="px-3 py-2 rounded-lg bg-[#5865F2]/20 hover:bg-[#5865F2]/30 border border-[#5865F2]/40 text-[#5865F2] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        aria-label={`Send message to ${user?.name || "user"}`}
                        title="Send message"
                    >
                        <Send size={13} />
                    </button>
                </div>
            </div>
        </div>
    );
}
