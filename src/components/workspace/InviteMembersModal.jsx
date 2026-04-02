"use client";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, Crown, Shield, User, MoreVertical, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import useAuth from "@/hooks/useAuth";
import { useWorkspace } from "@/hooks/useWorkspace";

const ROLE_ICON = { owner: Crown, admin: Shield, member: User };
const ROLE_COLOR = {
  owner: "text-yellow-400",
  admin: "text-accent",
  member: "text-ivory/40",
};

export default function InviteMembersModal({ workspaceId, onClose }) {
  const { user: currentUser } = useAuth();
  const { workspaces } = useWorkspace();
  const workspace = workspaces.find((w) => w._id === workspaceId);
  const myRole = workspace?.myRole;
  const isOwner = myRole === "owner";
  const isAdmin = myRole === "admin" || isOwner;

  const [openMenuId, setOpenMenuId] = useState(null);

  const members = workspace?.members || [];

  const modal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-xs md:max-w-sm glass-card rounded-3xl border border-white/[0.08] shadow-[0_24px_80px_rgba(0,0,0,0.6)] overflow-hidden">
        {/* Header */}
        <div className="px-4 md:px-5 py-3 md:py-4 border-b border-white/[0.06] flex items-center justify-between">
          <h2 className="font-display font-bold text-ivory">Members</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-ivory/20 hover:text-ivory/60 hover:bg-white/[0.06] transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Member List */}
        <div className="max-h-80 overflow-y-auto scrollbar-hide p-2 md:p-3 space-y-px">
          {members.length === 0 && (
            <p className="text-ivory/20 text-[11px] font-mono text-center py-6">
              No members loaded yet
            </p>
          )}
          {members.map(({ user: member, role }) => {
            const RoleIcon = ROLE_ICON[role] || User;
            const roleColor = ROLE_COLOR[role] || "text-ivory/40";
            const isSelf = member._id === currentUser?._id;

            return (
              <div
                key={member._id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.03] group transition-all relative"
              >
                <div className="relative shrink-0">
                  <div className="w-8 h-8 rounded-xl overflow-hidden ring-1 ring-white/[0.06]">
                    <Image
                      src={
                        member.avatar ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`
                      }
                      width={32}
                      height={32}
                      className="rounded-xl"
                      alt={member.name}
                      unoptimized
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-ivory text-[13px] font-display font-semibold truncate">
                    {member.name}{" "}
                    {isSelf && (
                      <span className="text-ivory/30 text-[10px]">(you)</span>
                    )}
                  </p>
                  <div className={`flex items-center gap-1 ${roleColor}`}>
                    <RoleIcon size={10} />
                    <span className="text-[10px] font-mono capitalize">
                      {role}
                    </span>
                  </div>
                </div>

                {/* Role/Remove actions — admin/owner only, not on self or higher-role members */}
                {isAdmin && !isSelf && role !== "owner" && (
                  <button
                    onClick={() =>
                      setOpenMenuId(
                        openMenuId === member._id ? null : member._id,
                      )
                    }
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-ivory/15 hover:text-ivory/40 hover:bg-white/[0.06] opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <MoreVertical size={14} />
                  </button>
                )}

                {/* Context Menu */}
                {openMenuId === member._id && (
                  <div className="absolute right-2 top-full mt-1 glass-card rounded-xl border border-white/[0.08] shadow-lg overflow-hidden z-10 min-w-[140px]">
                    {isOwner && role === "member" && (
                      <button
                        onClick={() => {
                          toast.success("Role management available in Settings");
                          setOpenMenuId(null);
                        }}
                        className="w-full px-3 py-2 text-left text-[12px] font-mono text-accent/70 hover:text-accent hover:bg-white/[0.04] transition-all flex items-center gap-2"
                      >
                        <Shield size={12} /> Make Admin
                      </button>
                    )}
                    {isOwner && role === "admin" && (
                      <button
                        onClick={() => {
                          toast.success("Role management available in Settings");
                          setOpenMenuId(null);
                        }}
                        className="w-full px-3 py-2 text-left text-[12px] font-mono text-ivory/40 hover:text-ivory hover:bg-white/[0.04] transition-all flex items-center gap-2"
                      >
                        <User size={12} /> Remove Admin
                      </button>
                    )}
                    <button
                      onClick={() => {
                        toast.success("Member management available in Settings");
                        setOpenMenuId(null);
                      }}
                      className="w-full px-3 py-2 text-left text-[12px] font-mono text-red-400/70 hover:text-red-400 hover:bg-red-500/5 transition-all flex items-center gap-2"
                    >
                      <X size={12} /> Remove
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-3 pt-0">
          <p className="text-ivory/15 text-[10px] font-mono text-center">
            {members.length} member{members.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </div>
  );

  return typeof window !== "undefined"
    ? createPortal(modal, document.body)
    : null;
}
