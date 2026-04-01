"use client";
import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { X, Crown, Shield, Users, Circle } from "lucide-react";
import { useWorkspace } from "@/hooks/useWorkspace";
import useAuth from "@/hooks/useAuth";
import useIsAdmin from "@/hooks/useIsAdmin";
import PreviewUserCard from "@/components/profile/PreviewUserCard";
import FullUserProfile from "@/components/profile/FullUserProfile";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import api from "@/app/api/Axios";
import { confirmSweetAlert } from "@/utils/sweetAlert";

function RoleBadge({ color, name }) {
  return (
    <span
      className="inline-flex items-center rounded-full border font-mono font-bold text-[9px] px-1.5 py-0.5"
      style={{
        borderColor: color + "50",
        color,
        backgroundColor: color + "15",
      }}
    >
      {name}
    </span>
  );
}

function MemberRow({ member, roles, isOnline, onProfileClick, onContextMenu }) {
  const roleInfo =
    member.role === "owner"
      ? { label: "Owner", color: "#e5b456", Icon: Crown }
      : member.role === "admin"
        ? { label: "Admin", color: "#e55692", Icon: Shield }
        : null;

  const customRoles = (member.roleIds || [])
    .map((id) => roles.find((r) => r._id === id))
    .filter(Boolean);

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    onProfileClick?.({
      member,
      x: rect.right + 8,
      y: rect.top,
    });
  };

  // Double click opens full profile
  const handleDoubleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    onProfileClick?.({
      member,
      x: rect.right + 8,
      y: rect.top,
      openFull: true,
    });
  };

  return (
    <div
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={onContextMenu ? (e) => onContextMenu(e, member) : undefined}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all group ${onProfileClick ? "hover:bg-white/4 cursor-pointer" : ""
        }`}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div
          className={`w-8 h-8 rounded-xl overflow-hidden ring-1 ring-white/6 transition-all ${isOnline
            ? "group-hover:ring-accent/30"
            : "opacity-85 group-hover:opacity-100"
            }`}
        >
          <Image
            src={
              member.user?.avatar ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.user?.name}`
            }
            width={32}
            height={32}
            alt={member.user?.name || ""}
            className={`rounded-xl ${isOnline
              ? ""
              : "brightness-90 group-hover:brightness-100 transition-[filter]"
              }`}
            unoptimized
          />
        </div>
        {/* Online dot */}
        <div
          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0e0e17] transition-colors ${isOnline
            ? "bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.5)]"
            : "bg-white/15"
            }`}
        />
      </div>

      {/* Name + roles */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p
            className={`text-[12px] font-display font-bold truncate ${roleInfo?.color ? "" : "text-ivory/60"
              } ${isOnline ? "" : "opacity-80 group-hover:opacity-100 transition-opacity"}`}
            style={roleInfo ? { color: roleInfo.color } : {}}
          >
            {member.user?.name}
          </p>
          {roleInfo && (
            <roleInfo.Icon
              size={10}
              style={{ color: roleInfo.color }}
              className={`shrink-0 ${isOnline ? "" : "opacity-80 group-hover:opacity-100 transition-opacity"}`}
            />
          )}
        </div>
        {customRoles.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {customRoles.map((r) => (
              <RoleBadge key={r._id} color={r.color} name={r.name} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MemberListPanel({
  workspaceId,
  onClose,
  onSettingsOpen,
}) {
  const { workspaces, membersCache, onlineUsers, fetchWorkspaceMembers, removeMembers, updateMemberRole, banMember } =
    useWorkspace();
  const { user: currentUser } = useAuth();
  const isAdmin = useIsAdmin(workspaceId);

  const workspace = workspaces.find((w) => w._id === workspaceId);
  const members = membersCache[workspaceId] || [];
  const roles = workspace?.roles || [];

  const [profileTarget, setProfileTarget] = useState(null);
  const [fullProfile, setFullProfile] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);

  const handleProfileClick = useCallback(({ member, x, y, openFull }) => {
    if (openFull) {
      // Double-click opens full profile directly
      setFullProfile({ user: member.user, member });
    } else {
      // Single click shows preview card with roles
      setProfileTarget({ member, x, y });
    }
    setContextMenu(null);
  }, []);

  const handleContextMenu = useCallback((e, member) => {
    e.preventDefault();
    setContextMenu({ member, x: e.clientX, y: e.clientY });
  }, []);

  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  const router = useRouter();

  const handleMessage = useCallback(async (messageText, userId) => {
    try {
      const res = await api.post("/api/chat/conversations", { participantId: userId });
      router.push(`/app?conv=${res.data._id}`);
    } catch {
      toast.error("Could not open conversation");
    }
  }, [router]);

  const handleQuickMessage = useCallback(async (messageText) => {
    if (!profileTarget?.member?.user?._id) return;
    await handleMessage(messageText, profileTarget.member.user._id);
  }, [profileTarget, handleMessage]);

  useEffect(() => {
    if (workspaceId) fetchWorkspaceMembers(workspaceId);
  }, [workspaceId, fetchWorkspaceMembers]);

  // Group members: owner → admins → custom → members, then split online / offline
  const groupedSections = React.useMemo(() => {
    const sections = [];
    const groupedIds = new Set();

    // Owner
    const owners = members.filter((m) => m.role === "owner");
    if (owners.length) {
      sections.push({
        title: `Owner — ${owners.length}`,
        color: "#e5b456",
        items: owners,
      });
      owners.forEach((m) => groupedIds.add(m.user?._id));
    }

    // Admins
    const admins = members.filter(
      (m) => m.role === "admin" && !groupedIds.has(m.user?._id),
    );
    if (admins.length) {
      sections.push({
        title: `Admin — ${admins.length}`,
        color: "#e55692",
        items: admins,
      });
      admins.forEach((m) => groupedIds.add(m.user?._id));
    }

    // Custom Roles
    if (roles && roles.length) {
      roles.forEach((role) => {
        const roleMembers = members.filter(
          (m) =>
            (m.roleIds || []).includes(role._id) &&
            !groupedIds.has(m.user?._id),
        );
        if (roleMembers.length) {
          sections.push({
            title: `${role.name} — ${roleMembers.length}`,
            color: role.color,
            items: roleMembers,
          });
          roleMembers.forEach((m) => groupedIds.add(m.user?._id));
        }
      });
    }

    // Remaining Members
    const remaining = members.filter((m) => !groupedIds.has(m.user?._id));
    const onlineMembers = remaining.filter((m) => onlineUsers.has(m.user?._id));
    const offlineMembers = remaining.filter(
      (m) => !onlineUsers.has(m.user?._id),
    );

    if (onlineMembers.length) {
      sections.push({
        title: `Online — ${onlineMembers.length}`,
        color: "#56e574",
        items: onlineMembers,
      });
    }
    if (offlineMembers.length) {
      sections.push({
        title: `Offline — ${offlineMembers.length}`,
        color: null,
        items: offlineMembers,
      });
    }

    return sections;
  }, [members, roles, onlineUsers]);

  return (
    <aside className="w-64 h-full flex flex-col bg-[#0d0d16] border-l border-white/6 shrink-0 overflow-hidden">
      {/* Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-white/6 shrink-0">
        <div className="flex items-center gap-2">
          <Users size={14} className="text-accent/60" />
          <span className="text-[13px] font-display font-bold text-ivory/70">
            Members
          </span>
          <span className="text-[10px] font-mono text-ivory/25 bg-white/4 px-1.5 py-0.5 rounded-full">
            {members.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-ivory/25 hover:text-ivory hover:bg-white/6 transition-all"
        >
          <X size={14} />
        </button>
      </div>

      {/* Member list */}
      <div className="flex-1 overflow-y-auto scrollbar-hide py-3 px-2 space-y-5">
        {groupedSections.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <Users size={20} className="text-ivory/10" />
            <p className="text-ivory/20 text-[11px] font-mono">
              No members loaded
            </p>
          </div>
        ) : (
          groupedSections.map((section) => (
            <div key={section.title}>
              <div className="flex items-center gap-2 px-3 mb-1.5">
                {section.color && (
                  <Circle
                    size={6}
                    fill={section.color}
                    className="shrink-0"
                    style={{ color: section.color }}
                  />
                )}
                <span
                  className="text-[9px] font-mono font-bold uppercase tracking-[0.15em]"
                  style={{ color: section.color || "rgba(255,255,255,0.2)" }}
                >
                  {section.title}
                </span>
              </div>
              <div className="space-y-0.5">
                {section.items.map((member) => (
                  <MemberRow
                    key={member.user?._id}
                    member={member}
                    roles={roles}
                    isOnline={onlineUsers.has(member.user?._id)}
                    onProfileClick={handleProfileClick}
                    onContextMenu={handleContextMenu}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Preview card - new profile interaction */}
      {profileTarget && (
        <PreviewUserCard
          user={profileTarget.member.user}
          member={profileTarget.member}
          workspaceId={workspaceId}
          isAdmin={isAdmin}
          position={{ x: profileTarget.x, y: profileTarget.y }}
          onViewProfile={() => {
            setFullProfile({ 
              user: profileTarget.member.user,
              member: profileTarget.member 
            });
            setProfileTarget(null);
          }}
          onMessage={handleQuickMessage}
          onAddRole={() => {
            if (onSettingsOpen) {
              onSettingsOpen();
              setProfileTarget(null);
              toast("Use Roles tab in Workspace Settings to assign roles");
            } else {
              toast("Manage roles in Workspace Settings");
            }
          }}
          onKick={async () => {
            const userId = profileTarget.member.user._id?.toString();
            if (!(await confirmSweetAlert({
              title: "Kick Member?",
              text: `Kick ${profileTarget.member.user?.name}?`,
              confirmButtonText: "Kick",
              icon: "warning",
            }))) return;
            try {
              await removeMembers(workspaceId, [userId]);
              toast.success(`${profileTarget.member.user?.name} was kicked`);
              setProfileTarget(null);
            } catch {
              toast.error("Failed to kick member");
            }
          }}
          onBan={async () => {
            const userId = profileTarget.member.user._id?.toString();
            if (!(await confirmSweetAlert({
              title: "Ban Member?",
              text: `Ban ${profileTarget.member.user?.name}? They won't be able to rejoin.`,
              confirmButtonText: "Ban",
              icon: "warning",
            }))) return;
            try {
              await banMember(workspaceId, userId);
              toast.success(`${profileTarget.member.user?.name} was banned`);
              setProfileTarget(null);
            } catch {
              toast.error("Failed to ban member");
            }
          }}
          onReport={() => {
            toast("Report functionality coming soon", { icon: "📋" });
            setProfileTarget(null);
          }}
          onClose={() => setProfileTarget(null)}
        />
      )}

      {/* Full profile modal */}
      {fullProfile && (
        <FullUserProfile
          user={fullProfile.user}
          member={fullProfile.member}
          workspaceRoles={roles}
          isOwnProfile={fullProfile.user._id === currentUser?._id}
          onClose={() => setFullProfile(null)}
          onMessage={() => {
            handleMessage("", fullProfile.user._id);
          }}
        />
      )}

      {/* Context menu */}
      {contextMenu && (
        <MemberContextMenu
          member={contextMenu.member}
          x={contextMenu.x}
          y={contextMenu.y}
          isAdmin={isAdmin}
          workspaceId={workspaceId}
          onClose={closeContextMenu}
          onOpenProfile={(m) => {
            const rect = document.elementFromPoint(contextMenu.x, contextMenu.y)?.closest("[data-member]")?.getBoundingClientRect() || { right: contextMenu.x, top: contextMenu.y };
            setProfileTarget({
              member: m,
              x: rect.right + 8,
              y: rect.top,
            });
            setContextMenu(null);
          }}
          onMessage={(userId) => handleMessage("", userId)}
          removeMembers={removeMembers}
          updateMemberRole={updateMemberRole}
          banMember={banMember}
        />
      )}
    </aside>
  );
}

function MemberContextMenu({ member, x, y, isAdmin, workspaceId, onClose, onOpenProfile, onMessage, removeMembers, updateMemberRole, banMember }) {
  const userId = member.user?._id?.toString();
  const isOwner = member.role === "owner";
  const canPromote = member.role === "member";
  const canDemote = member.role === "admin";

  const handleKick = async () => {
    if (!(await confirmSweetAlert({
      title: "Kick Member?",
      text: `Kick ${member.user?.name}?`,
      confirmButtonText: "Kick",
      icon: "warning",
    }))) return;
    try {
      await removeMembers(workspaceId, [userId]);
      toast.success(`${member.user?.name} was kicked`);
      onClose();
    } catch { toast.error("Failed to kick member"); }
  };

  const handleBan = async () => {
    if (!(await confirmSweetAlert({
      title: "Ban Member?",
      text: `Ban ${member.user?.name}? They won't be able to rejoin.`,
      confirmButtonText: "Ban",
      icon: "warning",
    }))) return;
    try {
      await banMember(workspaceId, userId);
      toast.success(`${member.user?.name} was banned`);
      onClose();
    } catch { toast.error("Failed to ban member"); }
  };

  const handlePromoteDemote = async () => {
    try {
      const newRole = canPromote ? "admin" : "member";
      await updateMemberRole(workspaceId, userId, newRole);
      toast.success(canPromote ? "Promoted to Admin" : "Demoted to Member");
      onClose();
    } catch { toast.error("Failed to update role"); }
  };

  useEffect(() => {
    const handler = () => onClose();
    const keyHandler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", keyHandler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", keyHandler);
    };
  }, [onClose]);

  const itemCls = "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] text-ivory/72 hover:bg-white/5 transition-all text-left";

  return (
    <div
      style={{ position: "fixed", top: y, left: x, zIndex: 9999 }}
      className="w-47.5 bg-[#16162a] border border-white/8 rounded-xl p-1 shadow-2xl"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <p className="text-[9px] font-mono uppercase tracking-widest text-white/20 px-2.5 pt-1.5 pb-1 truncate">{member.user?.name}</p>
      <button onClick={() => { onOpenProfile(member); onClose(); }} className={itemCls}>View Profile</button>
      <button onClick={() => { onMessage(userId); onClose(); }} className={itemCls}>Send Message</button>
      <button disabled className={`${itemCls} opacity-40 cursor-not-allowed`}>Mention</button>
      {isAdmin && !isOwner && (
        <>
          <div className="h-px bg-white/6 my-1" />
          <p className="text-[9px] font-mono uppercase tracking-[0.1em] text-[#e55692]/50 px-2.5 py-1">Admin Actions</p>
          <button onClick={() => { onOpenProfile(member, true); onClose(); }} className={itemCls}>Manage Roles</button>
          {(canPromote || canDemote) && (
            <button onClick={handlePromoteDemote} className={itemCls}>{canPromote ? "Promote to Admin" : "Demote to Member"}</button>
          )}
          <div className="h-px bg-white/6 my-1" />
          <button onClick={handleKick} className={`${itemCls} text-red-400`}>Kick Member</button>
          <button onClick={handleBan} className={`${itemCls} text-red-500`}>Ban Member</button>
        </>
      )}
      <div className="h-px bg-white/6 my-1" />
      <button disabled className={`${itemCls} text-red-400/50 cursor-not-allowed opacity-50`}>Report User</button>
    </div>
  );
}
