// chat-app-client/src/components/workspace/MemberProfileModal.jsx
"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, Calendar, MoreHorizontal } from "lucide-react";
import { useWorkspace } from "@/hooks/useWorkspace";
import useIsAdmin from "@/hooks/useIsAdmin";
import toast from "react-hot-toast";
import { confirmSweetAlert } from "@/utils/sweetAlert";

function RoleBadge({ role, isAdmin, onRemove }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-bold font-mono px-2 py-1 rounded-full border"
      style={{ color: role.color, borderColor: role.color + "4d", backgroundColor: role.color + "1a" }}
    >
      {role.name}
      {isAdmin && (
        <button
          onClick={() => onRemove(role._id)}
          className="w-3.5 h-3.5 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/25 transition-all opacity-50 hover:opacity-100 text-[9px]"
        >
          ✕
        </button>
      )}
    </span>
  );
}

function RolesSection({ member, wsRoles, workspaceId, isAdmin, assignRolesToMember, showRolePicker, setShowRolePicker }) {
  const assignedIds = (member.roleIds || []).map(String);
  const assignedRoles = wsRoles.filter((r) => assignedIds.includes(r._id?.toString()));

  const handleRemove = async (roleId) => {
    try {
      const newIds = assignedIds.filter((id) => id !== roleId.toString());
      await assignRolesToMember(workspaceId, member.user._id.toString(), newIds);
      toast.success("Role removed");
    } catch {
      toast.error("Failed to remove role");
    }
  };

  const handleToggle = async (roleId) => {
    try {
      const rid = roleId.toString();
      const newIds = assignedIds.includes(rid)
        ? assignedIds.filter((id) => id !== rid)
        : [...assignedIds, rid];
      await assignRolesToMember(workspaceId, member.user._id.toString(), newIds);
    } catch {
      toast.error("Failed to update role");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] font-mono font-bold uppercase tracking-[0.13em] text-ivory/28">
          Roles in this workspace
        </span>
        {isAdmin && (
          <button
            onClick={() => setShowRolePicker((v) => !v)}
            className="w-5 h-5 rounded-md flex items-center justify-center bg-accent/14 border border-accent/28 text-accent hover:bg-accent/24 transition-all text-base leading-none"
          >
            +
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {assignedRoles.length === 0 && (
          <span className="text-[11px] text-ivory/20 font-mono">No roles assigned</span>
        )}
        {assignedRoles.map((r) => (
          <RoleBadge key={r._id} role={r} isAdmin={isAdmin} onRemove={handleRemove} />
        ))}
      </div>

      {isAdmin && showRolePicker && wsRoles.length > 0 && (
        <div className="mt-2 bg-[#16162a] border border-white/8 rounded-xl p-1.5 shadow-xl">
          <p className="text-[9px] font-mono uppercase tracking-[0.12em] text-white/20 px-2 py-1">
            Assign a role
          </p>
          {wsRoles.map((r) => {
            const isAssigned = assignedIds.includes(r._id?.toString());
            return (
              <button
                key={r._id}
                onClick={() => handleToggle(r._id)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-all"
              >
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
                <span className="text-[12px] text-ivory/70 flex-1 text-left">{r.name}</span>
                {isAssigned && <span className="text-[11px] text-accent">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ActionBar({ isAdmin, member, workspaceId, onMessage, onClose, removeMembers, banMember }) {
  const userId = member.user._id?.toString();

  const handleKick = async () => {
    if (!(await confirmSweetAlert({
      title: "Kick Member?",
      text: `Kick ${member.user.name} from this workspace?`,
      confirmButtonText: "Kick",
      icon: "warning",
    }))) return;
    try {
      await removeMembers(workspaceId, [userId]);
      toast.success(`${member.user.name} was kicked`);
      onClose();
    } catch {
      toast.error("Failed to kick member");
    }
  };

  const handleBan = async () => {
    if (!(await confirmSweetAlert({
      title: "Ban Member?",
      text: `Ban ${member.user.name}? They won't be able to rejoin.`,
      confirmButtonText: "Ban",
      icon: "warning",
    }))) return;
    try {
      await banMember(workspaceId, userId);
      toast.success(`${member.user.name} was banned`);
      onClose();
    } catch {
      toast.error("Failed to ban member");
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => { onMessage(userId); onClose(); }}
        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold bg-accent/18 text-accent/90 border border-accent/28 hover:bg-accent/28 transition-all"
      >
        Message
      </button>
      {isAdmin && (
        <>
          <button
            onClick={handleKick}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/18 transition-all"
          >
            Kick
          </button>
          <button
            onClick={handleBan}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold bg-red-700/12 text-red-500 border border-red-700/22 hover:bg-red-700/22 transition-all"
          >
            Ban
          </button>
        </>
      )}
    </div>
  );
}

function MoreMenu({ isAdmin, member, workspaceId, onClose, onMessage, updateMemberRole, removeMembers, banMember, onDismiss }) {
  const userId = member.user._id?.toString();
  const canPromote = member.role === "member";
  const canDemote = member.role === "admin";
  const isOwner = member.role === "owner";

  const handlePromoteDemote = async () => {
    try {
      const newRole = canPromote ? "admin" : "member";
      await updateMemberRole(workspaceId, userId, newRole);
      toast.success(canPromote ? `${member.user.name} promoted to Admin` : `${member.user.name} demoted to Member`);
      onDismiss();
    } catch {
      toast.error("Failed to update role");
    }
  };

  const handleKick = async () => {
    if (!(await confirmSweetAlert({
      title: "Kick Member?",
      text: `Kick ${member.user.name}?`,
      confirmButtonText: "Kick",
      icon: "warning",
    }))) return;
    try {
      await removeMembers(workspaceId, [userId]);
      toast.success(`${member.user.name} was kicked`);
      onClose();
    } catch {
      toast.error("Failed to kick member");
    }
  };

  const handleBan = async () => {
    if (!(await confirmSweetAlert({
      title: "Ban Member?",
      text: `Ban ${member.user.name}?`,
      confirmButtonText: "Ban",
      icon: "warning",
    }))) return;
    try {
      await banMember(workspaceId, userId);
      toast.success(`${member.user.name} was banned`);
      onClose();
    } catch {
      toast.error("Failed to ban member");
    }
  };

  return (
    <div className="absolute right-0 top-9 z-10 w-[180px] bg-[#16162a] border border-white/8 rounded-xl p-1 shadow-2xl">
      {isAdmin && !isOwner && (
        <>
          <p className="text-[9px] font-mono uppercase tracking-[0.1em] text-[#e55692]/50 px-2.5 py-1.5">Admin Actions</p>
          {(canPromote || canDemote) && (
            <button onClick={handlePromoteDemote} className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] text-ivory/70 hover:bg-white/5 transition-all text-left">
              {canPromote ? "Promote to Admin" : "Demote to Member"}
            </button>
          )}
          <div className="h-px bg-white/6 my-1" />
          <button onClick={handleKick} className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] text-red-400 hover:bg-red-500/10 transition-all text-left">
            Kick Member
          </button>
          <button onClick={handleBan} className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] text-red-500 hover:bg-red-700/12 transition-all text-left">
            Ban Member
          </button>
          <div className="h-px bg-white/6 my-1" />
        </>
      )}
      <button disabled className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] text-red-400/70 hover:bg-white/5 transition-all text-left opacity-50 cursor-not-allowed">
        Report User
      </button>
    </div>
  );
}

export default function MemberProfileModal({
  workspaceId,
  member,
  onClose,
  onMessage,
  scrollToRoles = false,
}) {
  const router = useRouter();
  const { workspaces, assignRolesToMember, removeMembers, updateMemberRole, banMember } = useWorkspace();
  const isAdmin = useIsAdmin(workspaceId);
  const rolesRef = useRef(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showRolePicker, setShowRolePicker] = useState(false);

  const workspace = workspaces.find((w) => w._id === workspaceId);
  const wsRoles = workspace?.roles || [];

  const user = member.user;
  const userId = user._id?.toString();

  useEffect(() => {
    if (scrollToRoles && rolesRef.current) {
      setTimeout(() => rolesRef.current.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [scrollToRoles]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const joinedDate = member.joinedAt
    ? new Date(member.joinedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-[340px] bg-[#13131f] border border-white/7 rounded-2xl overflow-hidden shadow-2xl">

        {/* Banner */}
        <div className="h-[76px] bg-gradient-to-br from-[#1a1040] via-[#0e1535] to-[#150d30] relative">
          <div className="absolute inset-0 opacity-30"
            style={{ backgroundImage: "repeating-linear-gradient(45deg,transparent,transparent 18px,rgba(108,99,255,0.07) 18px,rgba(108,99,255,0.07) 36px)" }} />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center text-ivory/30 hover:text-ivory hover:bg-white/10 transition-all"
          >
            <X size={14} />
          </button>
          <div className="absolute bottom-[-22px] left-[18px]">
            <div className="relative">
              <div className="w-[60px] h-[60px] rounded-[15px] overflow-hidden border-[3px] border-[#13131f]">
                <Image
                  src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                  width={60} height={60} alt={user?.name || ""}
                  className="rounded-[12px]" unoptimized
                />
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="pt-8 px-[18px] pb-[18px]">

          {/* Name row */}
          <div className="flex items-start justify-between mb-1">
            <div>
              <button
                onClick={() => router.push(`/profile/${userId}`)}
                className="text-[17px] font-extrabold text-ivory hover:underline text-left"
              >
                {user?.name}
              </button>
              {user?.email && (
                <p className="text-[11px] text-ivory/30 mt-0.5">@{user.email.split("@")[0]}</p>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => setShowMoreMenu((v) => !v)}
                className="w-[30px] h-[30px] rounded-lg flex items-center justify-center text-ivory/30 hover:text-ivory bg-white/4 border border-white/7 hover:bg-white/8 transition-all"
              >
                <MoreHorizontal size={16} />
              </button>
              {showMoreMenu && (
                <MoreMenu
                  isAdmin={isAdmin}
                  member={member}
                  workspaceId={workspaceId}
                  onClose={onClose}
                  onMessage={onMessage}
                  updateMemberRole={updateMemberRole}
                  removeMembers={removeMembers}
                  banMember={banMember}
                  onDismiss={() => setShowMoreMenu(false)}
                />
              )}
            </div>
          </div>

          {/* Bio */}
          {user?.bio && (
            <p className="text-[12px] text-ivory/45 leading-relaxed my-3 px-3 py-2.5 bg-white/[0.025] rounded-lg border-l-2 border-accent/35">
              {user.bio}
            </p>
          )}

          {/* Roles section */}
          <div className="mt-4" ref={rolesRef}>
            <RolesSection
              member={member}
              wsRoles={wsRoles}
              workspaceId={workspaceId}
              isAdmin={isAdmin}
              assignRolesToMember={assignRolesToMember}
              showRolePicker={showRolePicker}
              setShowRolePicker={setShowRolePicker}
            />
          </div>

          {/* Meta row */}
          {joinedDate && (
            <div className="flex items-center gap-1.5 mt-4">
              <Calendar size={11} className="text-ivory/25" />
              <span className="text-[11px] text-ivory/35">Joined {joinedDate}</span>
            </div>
          )}

          <div className="h-px bg-white/[0.055] my-4" />

          {/* Action bar */}
          <ActionBar
            isAdmin={isAdmin}
            member={member}
            workspaceId={workspaceId}
            onMessage={onMessage}
            onClose={onClose}
            removeMembers={removeMembers}
            banMember={banMember}
          />

        </div>
      </div>
    </div>
  );
}
