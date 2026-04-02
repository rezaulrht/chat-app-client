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
            // Close menu if clicking outside menu
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowMenu(false);
            }
            // Close card if clicking outside card (but not if clicking menu)
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
        // Use actual DOM size if available, otherwise fall back to w-80 (320px)
        const cardWidth = cardRef.current?.offsetWidth || 320;
        const cardHeight = cardRef.current?.offsetHeight || 520;
        const gap = 16;

        let left = position.x + gap;
        let top = position.y;

        // Right overflow
        if (left + cardWidth > window.innerWidth - 20) {
            left = Math.max(16, position.x - cardWidth - gap);
        }

        // Bottom overflow
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

    return (
        <div
            ref={cardRef}
            onClick={(e) => e.stopPropagation()}
            className="w-80 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1b26] shadow-2xl overflow-hidden"
            style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "scale(1) translateY(0)" : "scale(0.95) translateY(-10px)",
                transition: "opacity 0.2s ease-out, transform 0.2s ease-out",
            }}
        >
            {/* BANNER */}
            <div className="relative h-20 bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-[#5865F2]/30 dark:to-[#5865F2]/10 overflow-hidden">
                {user?.banner?.imageUrl ? (
                    <Image
                        src={user.banner.imageUrl}
                        alt="Banner"
                        fill
                        className="object-cover"
                        unoptimized
                    />
                ) : null}
            </div>

            {/* BODY */}
            <div className="px-4 pb-4">
                {/* AVATAR */}
                <div className="flex justify-center -mt-10 mb-3 relative z-10">
                    <div className="w-20 h-20 rounded-full bg-white dark:bg-[#1a1b26] border-4 border-white dark:border-[#1a1b26] overflow-hidden shadow-lg">
                        {user?.avatar ? (
                            <Image
                                src={user.avatar}
                                alt={user.name}
                                width={80}
                                height={80}
                                className="w-full h-full object-cover"
                                unoptimized
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#5865F2] to-[#5865F2]/60 flex items-center justify-center text-2xl font-bold text-white">
                                {user?.name?.charAt(0)?.toUpperCase()}
                            </div>
                        )}
                    </div>
                </div>

                {/* NAME */}
                <div className="text-center mb-3">
                    <h3 className="font-bold text-gray-900 dark:text-white text-base">{user?.name}</h3>
                </div>

                {/* ROLES */}
                <div className="flex flex-wrap justify-center gap-1 mb-3">
                    {/* Always show Member badge */}
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/20 text-gray-600 dark:text-gray-300">
                        Member
                    </span>
                    {/* Custom roles */}
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
                    {/* Owner/Admin indicator */}
                    {isOwner && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/15 border border-yellow-500/30 text-yellow-600 dark:text-yellow-400">
                            Owner
                        </span>
                    )}
                    {isAdminRole && !isOwner && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/15 border border-blue-500/30 text-blue-600 dark:text-blue-400">
                            Admin
                        </span>
                    )}
                </div>

                {/* STATUS MESSAGE */}
                {user?.statusMessage && (
                    <div className="w-full text-center mb-3 p-2 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                        <p className="text-sm text-gray-600 dark:text-gray-300 italic">"{user.statusMessage}"</p>
                    </div>
                )}

                {/* BIO PREVIEW */}
                {user?.bio && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center line-clamp-2 mb-3">
                        {user.bio}
                    </p>
                )}

                {/* MEMBER SINCE */}
                {member?.joinedAt && (
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mb-3">
                        Joined {new Date(member.joinedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                )}

                {/* BUTTONS */}
                <div className="flex gap-2 mt-2">
                    <button
                        onClick={onViewProfile}
                        className="flex-1 px-3 py-2 rounded-lg bg-[#5865F2]/10 hover:bg-[#5865F2]/20 border border-[#5865F2]/30 text-[#5865F2] font-semibold text-xs transition-all"
                    >
                        View Profile
                    </button>
                    <button
                        onClick={handleSendMessage}
                        disabled={!messageText.trim() || isSending}
                        className="px-3 py-2 rounded-lg bg-[#5865F2]/10 hover:bg-[#5865F2]/20 border border-[#5865F2]/30 text-[#5865F2] disabled:opacity-40 transition-all"
                    >
                        <Send size={14} />
                    </button>
                </div>

                {/* MESSAGE INPUT */}
                <div className="mt-2">
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
                        placeholder={`Message ${user?.name}...`}
                        maxLength={100}
                        className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-[#5865F2]/50 text-gray-900 dark:text-white text-xs placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none transition-all"
                    />
                </div>
            </div>
        </div>
    );
}

