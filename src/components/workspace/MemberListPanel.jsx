"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import { X, Crown, Shield, ChevronRight, Users, Circle } from "lucide-react";
import { useWorkspace } from "@/hooks/useWorkspace";
import useAuth from "@/hooks/useAuth";

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

function MemberRow({ member, roles, isOnline, onProfileClick }) {
  const roleInfo =
    member.role === "owner"
      ? { label: "Owner", color: "#e5b456", Icon: Crown }
      : member.role === "admin"
        ? { label: "Admin", color: "#e55692", Icon: Shield }
        : null;

  const customRoles = (member.roleIds || [])
    .map((id) => roles.find((r) => r._id === id))
    .filter(Boolean);

  return (
    <div
      onClick={onProfileClick ? () => onProfileClick(member) : undefined}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all group ${
        onProfileClick ? "hover:bg-white/4 cursor-pointer" : ""
      }`}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div
          className={`w-8 h-8 rounded-xl overflow-hidden ring-1 ring-white/6 transition-all ${
            isOnline
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
            className={`rounded-xl ${
              isOnline
                ? ""
                : "brightness-90 group-hover:brightness-100 transition-[filter]"
            }`}
            unoptimized
          />
        </div>
        {/* Online dot */}
        <div
          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0e0e17] transition-colors ${
            isOnline
              ? "bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.5)]"
              : "bg-white/15"
          }`}
        />
      </div>

      {/* Name + roles */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p
            className={`text-[12px] font-display font-bold truncate ${
              roleInfo?.color ? "" : "text-ivory/60"
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
  const { workspaces, membersCache, onlineUsers, fetchWorkspaceMembers } =
    useWorkspace();
  const { user: currentUser } = useAuth();

  const workspace = workspaces.find((w) => w._id === workspaceId);
  const members = membersCache[workspaceId] || [];
  const roles = workspace?.roles || [];

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
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
