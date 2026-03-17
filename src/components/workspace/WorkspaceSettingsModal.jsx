"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  X,
  Settings,
  Users,
  Shield,
  Link2,
  AlertTriangle,
  ChevronRight,
  Check,
  Pencil,
  Trash2,
  Plus,
  Copy,
  RefreshCw,
  Globe,
  Lock,
  Crown,
  LogOut,
  Camera,
  Loader2,
  Search,
  UserMinus,
  UserCog,
  Hash,
} from "lucide-react";
import { useWorkspace } from "@/hooks/useWorkspace";
import useAuth from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

// ── Colour palette for role swatches ─────────────────────────────────────────
const ROLE_COLORS = [
  "#e55656",
  "#e57c56",
  "#e5b456",
  "#c8e556",
  "#56e574",
  "#56c8e5",
  "#5674e5",
  "#7c56e5",
  "#c456e5",
  "#e55692",
  "#5b5b8f",
  "#00d3bb",
];

const AVAILABLE_PERMISSIONS = [
  {
    id: "ADMINISTRATOR",
    label: "Administrator",
    desc: "Bypasses all other permissions. Grants full access to the workspace.",
  },
  {
    id: "MANAGE_WORKSPACE",
    label: "Manage Workspace",
    desc: "Allows editing the workspace name, description, avatar, and banner.",
  },
  {
    id: "MANAGE_ROLES",
    label: "Manage Roles",
    desc: "Allows creating, editing, and deleting custom roles.",
  },
  {
    id: "MANAGE_CHANNELS",
    label: "Manage Channels",
    desc: "Allows creating, editing, reordering, and deleting channels.",
  },
  {
    id: "KICK_MEMBERS",
    label: "Kick Members",
    desc: "Allows removing other members from the workspace.",
  },
  {
    id: "CREATE_INVITES",
    label: "Create Invites",
    desc: "Allows generating invite links for new members.",
  },
  {
    id: "MANAGE_MESSAGES",
    label: "Manage Messages",
    desc: "Allows deleting messages sent by others, and posting in announcement channels.",
  },
  {
    id: "SEND_MESSAGES",
    label: "Send Messages",
    desc: "Allows members to send messages in text channels.",
  },
  {
    id: "VIEW_CHANNEL",
    label: "View Channels",
    desc: "Allows members to view and read channels.",
  },
];

function RoleBadge({ color, name, small = false }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-mono font-bold ${small ? "text-[9px] px-1.5 py-0.5" : "text-[10px] px-2 py-0.5"}`}
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

// ─────────────────────────────────────────────────────────────────────────────
// TABS
// ─────────────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "overview", label: "Overview", Icon: Settings },
  { id: "roles", label: "Roles", Icon: Shield },
  { id: "members", label: "Members", Icon: Users },
  { id: "invites", label: "Invites", Icon: Link2 },
  { id: "danger", label: "Danger Zone", Icon: AlertTriangle },
];

// ─────────────────────────────────────────────────────────────────────────────
// OVERVIEW TAB
// ─────────────────────────────────────────────────────────────────────────────
function OverviewTab({ workspace, onUpdate, isAdmin }) {
  const [name, setName] = useState(workspace?.name || "");
  const [description, setDescription] = useState(workspace?.description || "");
  const [avatarUrl, setAvatarUrl] = useState(workspace?.avatar || "");
  const [bannerUrl, setBannerUrl] = useState(workspace?.banner || "");
  const [visibility, setVisibility] = useState(
    workspace?.visibility || "private",
  );
  const [saving, setSaving] = useState(false);

  const isDirty =
    name !== (workspace?.name || "") ||
    description !== (workspace?.description || "") ||
    avatarUrl !== (workspace?.avatar || "") ||
    bannerUrl !== (workspace?.banner || "") ||
    visibility !== (workspace?.visibility || "private");

  const handleSave = async () => {
    if (!name.trim()) return toast.error("Name cannot be empty");
    setSaving(true);
    try {
      await onUpdate({
        name: name.trim(),
        description,
        avatar: avatarUrl,
        banner: bannerUrl,
        visibility,
      });
      toast.success("Workspace updated!");
    } catch {
      toast.error("Failed to update workspace");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      {/* Banner preview */}
      <div>
        <label className="block text-[11px] font-mono font-bold text-ivory/40 uppercase tracking-widest mb-2">
          Banner Image
        </label>
        <div
          className="relative w-full h-28 rounded-2xl overflow-hidden bg-white/4 border border-white/8 group cursor-pointer"
          style={
            bannerUrl
              ? {
                  backgroundImage: `url(${bannerUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : {}
          }
        >
          {!bannerUrl && isAdmin && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Camera size={20} className="mx-auto text-ivory/20 mb-1" />
                <p className="text-ivory/20 text-[10px] font-mono">
                  Paste a banner URL below
                </p>
              </div>
            </div>
          )}
          {/* Avatar overlay */}
          <div className="absolute left-4 -bottom-8 w-16 h-16 rounded-2xl overflow-hidden ring-4 ring-deep bg-accent/10">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                width={64}
                height={64}
                alt="avatar"
                className="object-cover w-full h-full"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-lg font-bold text-accent/60">
                  {workspace?.name?.[0]?.toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>
        {isAdmin && (
          <div className="mt-10">
            <input
              type="text"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              placeholder="https://example.com/banner.jpg"
              className="w-full bg-white/4 border border-white/8 rounded-xl px-3 py-2 text-[12px] font-mono text-ivory/70 placeholder:text-ivory/20 focus:outline-none focus:border-accent/40"
            />
          </div>
        )}
      </div>

      {/* Avatar URL */}
      {isAdmin && (
        <SettingsInput
          label="Avatar URL"
          value={avatarUrl}
          onChange={setAvatarUrl}
          placeholder="https://example.com/avatar.jpg"
        />
      )}

      {/* Name */}
      <SettingsInput
        label="Workspace Name"
        value={name}
        onChange={setName}
        placeholder="My Awesome Workspace"
        disabled={!isAdmin}
      />

      {/* Description */}
      <div>
        <label className="block text-[11px] font-mono font-bold text-ivory/40 uppercase tracking-widest mb-2">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What's this workspace about?"
          rows={3}
          disabled={!isAdmin}
          className="w-full bg-white/4 border border-white/8 rounded-xl px-3 py-2 text-[13px] text-ivory/70 placeholder:text-ivory/20 focus:outline-none focus:border-accent/40 resize-none scrollbar-hide disabled:opacity-70"
        />
      </div>

      {/* Visibility */}
      <div>
        <label className="block text-[11px] font-mono font-bold text-ivory/40 uppercase tracking-widest mb-2">
          Visibility
        </label>
        <div className="flex gap-3">
          {["public", "private"].map((v) => {
            const isActive = visibility === v;
            const Icon = v === "public" ? Globe : Lock;
            return (
              <button
                key={v}
                disabled={!isAdmin}
                onClick={() => setVisibility(v)}
                className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                  isActive
                    ? "border-accent/50 bg-accent/10 text-accent"
                    : "border-white/8 bg-white/3 text-ivory/30 hover:bg-white/6"
                } ${!isAdmin && "opacity-70 cursor-not-allowed"}`}
              >
                <Icon size={15} />
                <span className="text-[13px] font-display font-bold capitalize">
                  {v}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {isDirty && isAdmin && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-2.5 bg-accent hover:bg-accent/90 text-black font-bold rounded-xl text-[13px] transition-all active:scale-98 flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
        >
          {saving ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Check size={15} />
          )}
          {saving ? "Saving…" : "Save Changes"}
        </button>
      )}
    </div>
  );
}

function SettingsInput({ label, value, onChange, placeholder, disabled }) {
  return (
    <div>
      <label className="block text-[11px] font-mono font-bold text-ivory/40 uppercase tracking-widest mb-2">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => !disabled && onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full bg-white/4 border border-white/8 rounded-xl px-3 py-2 text-[13px] text-ivory/70 placeholder:text-ivory/20 focus:outline-none focus:border-accent/40 disabled:opacity-70"
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROLES TAB
// ─────────────────────────────────────────────────────────────────────────────
function RolesTab({ workspace, onCreateRole, onUpdateRole, onDeleteRole }) {
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(ROLE_COLORS[10]);
  const [newPermissions, setNewPermissions] = useState([]);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editPermissions, setEditPermissions] = useState([]);
  const [saving, setSaving] = useState(false);

  const roles = workspace?.roles || [];

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await onCreateRole({
        name: newName.trim(),
        color: newColor,
        permissions: newPermissions,
      });
      setNewName("");
      setNewColor(ROLE_COLORS[10]);
      setNewPermissions([]);
      toast.success("Role created!");
    } catch {
      toast.error("Failed to create role");
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async (roleId) => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      await onUpdateRole(roleId, {
        name: editName.trim(),
        color: editColor,
        permissions: editPermissions,
      });
      setEditingId(null);
      toast.success("Role updated!");
    } catch {
      toast.error("Failed to update role");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (roleId, roleName) => {
    if (
      !confirm(
        `Delete role "${roleName}"? This will remove it from all members.`,
      )
    )
      return;
    try {
      await onDeleteRole(roleId);
      toast.success("Role deleted");
    } catch {
      toast.error("Failed to delete role");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl pb-10">
      <p className="text-ivory/30 text-[12px] font-mono">
        Create custom roles to organise your workspace members. Built-in roles
        (owner, admin, member) cannot be deleted.
      </p>

      {/* Built-in roles display */}
      <div className="space-y-2">
        <p className="text-[10px] font-mono font-bold text-ivory/25 uppercase tracking-widest">
          Built-in roles
        </p>
        {[
          { name: "Owner", color: "#e5b456" },
          { name: "Admin", color: "#e55692" },
          { name: "Member", color: "#5b5b8f" },
        ].map((r) => (
          <div
            key={r.name}
            className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/2 border border-white/5"
          >
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: r.color }}
            />
            <span className="text-[13px] font-medium text-ivory/60 flex-1">
              {r.name}
            </span>
            <span className="text-[10px] font-mono text-ivory/20">
              Built-in
            </span>
          </div>
        ))}
      </div>

      {/* Custom roles */}
      {roles.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-mono font-bold text-ivory/25 uppercase tracking-widest">
            Custom roles
          </p>
          {roles.map((role) => (
            <div
              key={role._id}
              className="px-3 py-2.5 rounded-xl bg-white/3 border border-white/6"
            >
              {editingId === role._id ? (
                <div className="space-y-3">
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-white/5 border border-accent/30 rounded-lg px-2.5 py-1.5 text-[13px] text-ivory focus:outline-none focus:border-accent/60"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {ROLE_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setEditColor(c)}
                        aria-label={`Select role color ${c}`}
                        aria-pressed={editColor === c}
                        className={`w-5 h-5 rounded-full transition-transform hover:scale-110 ${editColor === c ? "ring-2 ring-white ring-offset-1 ring-offset-deep scale-110" : ""}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>

                  {/* Permissions Selection (Edit) */}
                  <div className="mt-4 border-t border-white/10 pt-4 space-y-3">
                    <p className="text-[10px] font-mono font-bold text-ivory/40 uppercase tracking-widest">
                      Permissions
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {AVAILABLE_PERMISSIONS.map((perm) => {
                        const hasPerm = editPermissions.includes(perm.id);
                        return (
                          <label
                            key={perm.id}
                            className="flex items-start gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer"
                          >
                            <div
                              className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${hasPerm ? "bg-accent border-accent text-deep" : "bg-transparent border-ivory/20"}`}
                            >
                              {hasPerm && <Check size={12} strokeWidth={3} />}
                            </div>
                            <input
                              type="checkbox"
                              className="hidden"
                              checked={hasPerm}
                              onChange={(e) => {
                                if (e.target.checked)
                                  setEditPermissions((prev) => [
                                    ...prev,
                                    perm.id,
                                  ]);
                                else
                                  setEditPermissions((prev) =>
                                    prev.filter((p) => p !== perm.id),
                                  );
                              }}
                            />
                            <div>
                              <p className="text-[12px] font-bold text-ivory/90">
                                {perm.label}
                              </p>
                              <p className="text-[11px] text-ivory/50 leading-tight mt-0.5">
                                {perm.desc}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(role._id)}
                      disabled={saving}
                      className="px-3 py-1.5 bg-accent/20 hover:bg-accent/30 text-accent rounded-lg text-[11px] font-mono font-bold transition-all flex items-center gap-1"
                    >
                      {saving ? (
                        <Loader2 size={11} className="animate-spin" />
                      ) : (
                        <Check size={11} />
                      )}{" "}
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 bg-white/4 hover:bg-white/8 text-ivory/40 rounded-lg text-[11px] font-mono transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: role.color }}
                  />
                  <span className="text-[13px] font-medium text-ivory/80 flex-1">
                    {role.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingId(role._id);
                        setEditName(role.name);
                        setEditColor(role.color);
                        setEditPermissions(role.permissions || []);
                      }}
                      className="p-1.5 rounded-lg text-ivory/25 hover:text-accent hover:bg-white/6 transition-all"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete(role._id, role.name)}
                      className="p-1.5 rounded-lg text-ivory/25 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create role */}
      <div className="p-4 rounded-2xl bg-white/2 border border-white/6 space-y-3">
        <p className="text-[11px] font-mono font-bold text-ivory/40 uppercase tracking-widest">
          Create Role
        </p>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          placeholder="Role name…"
          className="w-full bg-white/5 border border-white/8 rounded-xl px-3 py-2 text-[13px] text-ivory/70 placeholder:text-ivory/20 focus:outline-none focus:border-accent/40"
        />
        <div className="flex flex-wrap gap-2">
          {ROLE_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setNewColor(c)}
              aria-label={`Select role color ${c}`}
              aria-pressed={newColor === c}
              className={`w-5 h-5 rounded-full transition-transform hover:scale-110 ${newColor === c ? "ring-2 ring-white ring-offset-1 ring-offset-deep scale-110" : ""}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        {/* Permissions Selection (Create) */}
        <div className="mt-4 border-t border-white/5 pt-4 space-y-3">
          <p className="text-[10px] font-mono font-bold text-ivory/40 uppercase tracking-widest">
            Base Permissions
          </p>
          <div className="grid grid-cols-1 gap-2">
            {AVAILABLE_PERMISSIONS.map((perm) => {
              const hasPerm = newPermissions.includes(perm.id);
              return (
                <label
                  key={perm.id}
                  className="flex items-start gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer"
                >
                  <div
                    className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${hasPerm ? "bg-accent border-accent text-deep" : "bg-transparent border-ivory/20"}`}
                  >
                    {hasPerm && <Check size={12} strokeWidth={3} />}
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={hasPerm}
                    onChange={(e) => {
                      if (e.target.checked)
                        setNewPermissions((prev) => [...prev, perm.id]);
                      else
                        setNewPermissions((prev) =>
                          prev.filter((p) => p !== perm.id),
                        );
                    }}
                  />
                  <div>
                    <p className="text-[12px] font-bold text-ivory/90">
                      {perm.label}
                    </p>
                    <p className="text-[11px] text-ivory/50 leading-tight mt-0.5">
                      {perm.desc}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-white/5">
          <RoleBadge color={newColor} name={newName || "Preview"} />
          <button
            onClick={handleCreate}
            disabled={!newName.trim() || creating}
            className="ml-auto px-4 py-1.5 bg-accent/15 hover:bg-accent/25 text-accent rounded-xl text-[12px] font-mono font-bold transition-all disabled:opacity-40 flex items-center gap-1.5"
          >
            {creating ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Plus size={12} />
            )}
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MEMBERS TAB
// ─────────────────────────────────────────────────────────────────────────────
function MembersTab({
  workspace,
  members,
  currentUser,
  onUpdateMemberRole,
  onRemoveMember,
  onAssignRoles,
}) {
  const [search, setSearch] = useState("");
  const [assigningUserId, setAssigningUserId] = useState(null);
  const [assigningRoleIds, setAssigningRoleIds] = useState([]);
  const [savingRoles, setSavingRoles] = useState(false);

  const isOwner = workspace?.myRole === "owner";
  const isAdmin = workspace?.myRole === "admin" || isOwner;
  const roles = workspace?.roles || [];

  const filtered = (members || []).filter((m) =>
    (m.user?.name || "").toLowerCase().includes(search.toLowerCase()),
  );

  // Group: owner → admins → others
  const ordered = [
    ...filtered.filter((m) => m.role === "owner"),
    ...filtered.filter((m) => m.role === "admin"),
    ...filtered.filter((m) => m.role === "member"),
  ];

  const ROLE_LABELS = {
    owner: { label: "Owner", color: "#e5b456" },
    admin: { label: "Admin", color: "#e55692" },
    member: { label: "Member", color: "#5b5b8f" },
  };

  return (
    <div className="space-y-4 max-w-lg">
      {/* Search */}
      <div className="relative">
        <Search
          size={13}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/25"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search members…"
          className="w-full bg-white/4 border border-white/8 rounded-xl pl-8 pr-3 py-2 text-[13px] text-ivory/70 placeholder:text-ivory/20 focus:outline-none focus:border-accent/40"
        />
      </div>

      <p className="text-[11px] font-mono text-ivory/25">
        {(members || []).length} member{members?.length !== 1 ? "s" : ""}
      </p>

      <div className="space-y-1.5">
        {ordered.map((m) => {
          const isMe = m.user?._id === currentUser?._id;
          const isThisOwner = m.role === "owner";
          const roleInfo = ROLE_LABELS[m.role] || ROLE_LABELS.member;
          const memberRoles = (m.roleIds || [])
            .map((id) => roles.find((r) => r._id === id))
            .filter(Boolean);

          return (
            <div
              key={m.user?._id}
              className="flex flex-col gap-2 px-3 py-2.5 rounded-xl hover:bg-white/3 transition-colors group"
            >
              <div className="flex items-center gap-3 w-full">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-xl overflow-hidden ring-1 ring-white/[0.06]">
                    <Image
                      src={
                        m.user?.avatar ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.user?.name}`
                      }
                      width={36}
                      height={36}
                      alt={m.user?.name || ""}
                      className="rounded-xl"
                      unoptimized
                    />
                  </div>
                  {isThisOwner && (
                    <Crown
                      size={10}
                      className="absolute -top-1 -right-1 text-yellow-400"
                    />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[13px] font-display font-bold text-ivory/80 truncate">
                      {m.user?.name}{" "}
                      {isMe && (
                        <span className="text-accent/60 text-[10px]">
                          (you)
                        </span>
                      )}
                    </p>
                    <span
                      className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full border"
                      style={{
                        borderColor: roleInfo.color + "50",
                        color: roleInfo.color,
                        backgroundColor: roleInfo.color + "15",
                      }}
                    >
                      {roleInfo.label}
                    </span>
                    {memberRoles.map((r) => (
                      <RoleBadge
                        key={r._id}
                        color={r.color}
                        name={r.name}
                        small
                      />
                    ))}
                  </div>
                  <p className="text-[10px] font-mono text-ivory/25 truncate">
                    {m.user?.email}
                  </p>
                </div>

                {/* Actions — only for admins/owners, not on yourself or the owner */}
                {isAdmin && !isMe && !isThisOwner && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Assign Roles */}
                    <button
                      title="Assign Custom Roles"
                      onClick={() => {
                        if (assigningUserId === m.user._id) {
                          setAssigningUserId(null);
                        } else {
                          setAssigningUserId(m.user._id);
                          setAssigningRoleIds(m.roleIds || []);
                        }
                      }}
                      className="p-1.5 rounded-lg text-ivory/25 hover:text-accent hover:bg-white/6 transition-all"
                    >
                      <Hash size={13} />
                    </button>
                    {/* Toggle admin */}
                    <button
                      title={
                        m.role === "admin"
                          ? "Demote to member"
                          : "Promote to admin"
                      }
                      onClick={async () => {
                        try {
                          await onUpdateMemberRole(
                            m.user._id,
                            m.role === "admin" ? "member" : "admin",
                          );
                          toast.success("Role updated");
                        } catch {
                          toast.error("Failed to update role");
                        }
                      }}
                      className="p-1.5 rounded-lg text-ivory/25 hover:text-accent hover:bg-white/6 transition-all"
                    >
                      <UserCog size={13} />
                    </button>
                    {/* Kick */}
                    {isOwner && (
                      <button
                        title="Remove from workspace"
                        onClick={async () => {
                          if (
                            !confirm(
                              `Remove ${m.user.name} from the workspace?`,
                            )
                          )
                            return;
                          try {
                            await onRemoveMember(m.user._id);
                            toast.success("Member removed");
                          } catch {
                            toast.error("Failed to remove member");
                          }
                        }}
                        className="p-1.5 rounded-lg text-ivory/25 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <UserMinus size={13} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Assign Roles Overlay/Dropdown equivalent */}
              {assigningUserId === m.user?._id && (
                <div className="w-full mt-1 p-3 bg-white/4 rounded-xl border border-white/6 shadow-inner">
                  <p className="text-[10px] font-mono font-bold text-ivory/40 uppercase tracking-widest mb-2">
                    Assign Custom Roles
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {roles.length === 0 ? (
                      <span className="text-[11px] text-ivory/30 italic">
                        No custom roles created in workspace yet.
                      </span>
                    ) : (
                      roles.map((r) => {
                        const selected = assigningRoleIds.includes(r._id);
                        return (
                          <button
                            key={r._id}
                            onClick={() => {
                              setAssigningRoleIds((prev) =>
                                prev.includes(r._id)
                                  ? prev.filter((id) => id !== r._id)
                                  : [...prev, r._id],
                              );
                            }}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all border ${selected ? "border-accent/40 bg-accent/15 text-accent" : "border-white/10 text-ivory/50 hover:bg-white/8"}`}
                          >
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: r.color }}
                            />
                            {r.name}
                          </button>
                        );
                      })
                    )}
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setAssigningUserId(null)}
                      className="px-3 py-1.5 text-[11px] font-mono text-ivory/40 hover:text-ivory bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        setSavingRoles(true);
                        try {
                          await onAssignRoles(m.user._id, assigningRoleIds);
                          toast.success("Roles updated");
                          setAssigningUserId(null);
                        } catch {
                          toast.error("Failed to update roles");
                        } finally {
                          setSavingRoles(false);
                        }
                      }}
                      disabled={savingRoles}
                      className="px-3 py-1.5 text-[11px] font-mono font-bold text-accent bg-accent/15 hover:bg-accent/25 rounded-lg border border-accent/20 transition-colors flex items-center gap-1"
                    >
                      {savingRoles && (
                        <Loader2 size={11} className="animate-spin" />
                      )}{" "}
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INVITES TAB
// ─────────────────────────────────────────────────────────────────────────────
function InvitesTab({ workspace, onGenerateInvite, onRevokeInvite }) {
  const [generating, setGenerating] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [expiresIn, setExpiresIn] = useState("never");
  const [copied, setCopied] = useState(false);

  const inviteCode = workspace?.inviteCode;
  const inviteUrl = inviteCode
    ? `${window?.location?.origin}/invite/${inviteCode}`
    : null;

  const EXPIRY_OPTIONS = [
    { value: "30m", label: "30 minutes" },
    { value: "1h", label: "1 hour" },
    { value: "6h", label: "6 hours" },
    { value: "12h", label: "12 hours" },
    { value: "1d", label: "1 day" },
    { value: "7d", label: "7 days" },
    { value: "never", label: "Never expires" },
  ];

  useEffect(() => {
    setExpiresIn(workspace?.inviteExpiresIn || "never");
  }, [workspace?.inviteExpiresIn, workspace?.inviteUrl, inviteUrl]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await onGenerateInvite(expiresIn);
      toast.success("Invite link generated!");
    } catch {
      toast.error("Failed to generate invite");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Invite link copied!");
  };

  const handleRevoke = async () => {
    if (
      !confirm("Revoke this invite link? All existing links will stop working.")
    )
      return;
    setRevoking(true);
    try {
      await onRevokeInvite();
      toast.success("Invite revoked");
    } catch {
      toast.error("Failed to revoke invite");
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <p className="text-ivory/30 text-[12px] font-mono">
        Share an invite link to let people join your workspace. Only one active
        invite exists at a time.
      </p>

      {/* Workspace card preview */}
      <div className="p-4 rounded-2xl bg-white/3 border border-white/8 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl overflow-hidden ring-1 ring-white/[0.06] shrink-0 bg-accent/10 flex items-center justify-center">
          {workspace?.avatar ? (
            <Image
              src={workspace.avatar}
              width={48}
              height={48}
              alt=""
              className="rounded-xl object-cover"
              unoptimized
            />
          ) : (
            <span className="text-xl font-bold text-accent/60">
              {workspace?.name?.[0]?.toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-[14px] font-display font-bold text-ivory truncate">
            {workspace?.name}
          </p>
          <p className="text-[11px] font-mono text-ivory/30">
            {workspace?.memberCount || 0} members
          </p>
        </div>
      </div>

      {/* Current invite link */}
      {inviteUrl ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-white/4 border border-white/8">
            <Link2 size={13} className="text-accent/60 shrink-0" />
            <span className="flex-1 text-[12px] font-mono text-ivory/60 truncate">
              {inviteUrl}
            </span>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg hover:bg-white/6 text-ivory/30 hover:text-accent transition-all shrink-0"
            >
              {copied ? (
                <Check size={14} className="text-accent" />
              ) : (
                <Copy size={14} />
              )}
            </button>
          </div>
          {workspace?.inviteCodeExpiresAt && (
            <p className="text-[10px] font-mono text-orange-400/70">
              Expires:{" "}
              {new Date(workspace.inviteCodeExpiresAt).toLocaleString()}
            </p>
          )}

          <div>
            <label className="block text-[11px] font-mono font-bold text-ivory/40 uppercase tracking-widest mb-2">
              Regenerate Expiry
            </label>
            <select
              value={expiresIn}
              onChange={(e) => setExpiresIn(e.target.value)}
              className="w-full bg-white/4 border border-white/8 rounded-xl px-3 py-2 text-[13px] text-ivory/70 focus:outline-none focus:border-accent/40"
            >
              {EXPIRY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/8 text-ivory/50 hover:text-ivory rounded-xl text-[11px] font-mono transition-all"
            >
              <RefreshCw
                size={12}
                className={generating ? "animate-spin" : ""}
              />
              Regenerate
            </button>
            <button
              onClick={handleRevoke}
              disabled={revoking}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/8 hover:bg-red-500/15 text-red-400/70 hover:text-red-400 rounded-xl text-[11px] font-mono transition-all"
            >
              <X size={12} />
              Revoke
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-mono font-bold text-ivory/40 uppercase tracking-widest mb-2">
              Expiry
            </label>
            <select
              value={expiresIn}
              onChange={(e) => setExpiresIn(e.target.value)}
              className="w-full bg-white/4 border border-white/8 rounded-xl px-3 py-2 text-[13px] text-ivory/70 focus:outline-none focus:border-accent/40"
            >
              {EXPIRY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2.5 bg-accent/15 hover:bg-accent/25 text-accent rounded-xl text-[13px] font-mono font-bold transition-all disabled:opacity-50"
          >
            {generating ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Plus size={14} />
            )}
            Generate Invite Link
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DANGER ZONE TAB
// ─────────────────────────────────────────────────────────────────────────────
function DangerTab({ workspace, currentUser, onDelete, onLeave }) {
  const isOwner = workspace?.myRole === "owner";
  const [confirmText, setConfirmText] = useState("");

  return (
    <div className="space-y-5 max-w-lg">
      {isOwner ? (
        <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/20 space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-[14px] font-display font-bold text-red-400">
                Delete Workspace
              </p>
              <p className="text-[12px] font-mono text-ivory/40 mt-1">
                This will permanently delete{" "}
                <strong className="text-ivory/60">{workspace?.name}</strong> and
                all its channels, messages, and members. This cannot be undone.
              </p>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-mono text-ivory/40 mb-1.5">
              Type{" "}
              <span className="text-red-400 font-bold">{workspace?.name}</span>{" "}
              to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full bg-white/4 border border-red-500/20 rounded-xl px-3 py-2 text-[13px] text-ivory/70 placeholder:text-ivory/20 focus:outline-none focus:border-red-500/50"
              placeholder={workspace?.name}
            />
          </div>
          <button
            onClick={onDelete}
            disabled={confirmText !== workspace?.name}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-500/15 hover:bg-red-500/25 text-red-400 rounded-xl text-[13px] font-mono font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Trash2 size={14} />
            Delete Workspace
          </button>
        </div>
      ) : (
        <div className="p-5 rounded-2xl bg-orange-500/5 border border-orange-500/20 space-y-4">
          <div className="flex items-start gap-3">
            <LogOut size={18} className="text-orange-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-[14px] font-display font-bold text-orange-400">
                Leave Workspace
              </p>
              <p className="text-[12px] font-mono text-ivory/40 mt-1">
                You will lose access to all channels and messages in{" "}
                <strong className="text-ivory/60">{workspace?.name}</strong>.
              </p>
            </div>
          </div>
          <button
            onClick={onLeave}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-500/15 hover:bg-orange-500/25 text-orange-400 rounded-xl text-[13px] font-mono font-bold transition-all"
          >
            <LogOut size={14} />
            Leave Workspace
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function WorkspaceSettingsModal({ workspaceId, onClose }) {
  const [activeTab, setActiveTab] = useState("overview");
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const {
    workspaces,
    membersCache,
    updateWorkspace,
    deleteWorkspace,
    leaveWorkspace,
    generateInvite,
    revokeInvite,
    createRole,
    updateRole,
    deleteRole,
    assignRolesToMember,
    updateMemberRole,
    removeMembers,
    fetchWorkspaceMembers,
  } = useWorkspace();

  const workspace = workspaces.find((w) => w._id === workspaceId);
  const members = membersCache[workspaceId] || [];
  const isAdmin =
    workspace?.myRole === "owner" || workspace?.myRole === "admin";

  // Load members on open
  useEffect(() => {
    if (workspaceId) fetchWorkspaceMembers(workspaceId);
  }, [workspaceId, fetchWorkspaceMembers]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleDelete = async () => {
    try {
      await deleteWorkspace(workspaceId);
      onClose();
      router.push("/app/workspace");
      toast.success("Workspace deleted");
    } catch {
      toast.error("Failed to delete workspace");
    }
  };

  const handleLeave = async () => {
    if (!confirm("Leave this workspace?")) return;
    try {
      await leaveWorkspace(workspaceId);
      onClose();
      router.push("/app/workspace");
      toast.success("You left the workspace");
    } catch {
      toast.error("Failed to leave workspace");
    }
  };

  if (!workspace) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl h-[88vh] max-h-[720px] bg-[#0e0e17] rounded-3xl shadow-2xl shadow-black/60 flex overflow-hidden ring-1 ring-white/6 mx-4">
        {/* ── Left nav */}
        <nav
          data-lenis-prevent="true"
          className="w-52 shrink-0 border-r border-white/6 bg-white/[0.015] flex flex-col py-4 overflow-y-auto"
        >
          <div className="px-4 mb-5">
            <p className="text-[10px] font-mono font-bold text-ivory/25 uppercase tracking-widest">
              Settings
            </p>
            <p className="text-[13px] font-display font-bold text-ivory/70 mt-1 truncate">
              {workspace.name}
            </p>
          </div>

          <div className="flex-1 space-y-0.5 px-2">
            {TABS.map((tab) => {
              const Icon = tab.Icon;
              const isActive = activeTab === tab.id;
              if (tab.id === "roles" || tab.id === "invites") {
                if (!isAdmin) return null;
              }
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-medium transition-all ${
                    isActive
                      ? "bg-accent/12 text-accent"
                      : tab.id === "danger"
                        ? "text-red-400/50 hover:text-red-400 hover:bg-red-500/8"
                        : "text-ivory/35 hover:text-ivory/60 hover:bg-white/4"
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                  {isActive && <ChevronRight size={11} className="ml-auto" />}
                </button>
              );
            })}
          </div>
        </nav>

        {/* ── Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="h-14 px-6 flex items-center justify-between border-b border-white/6 shrink-0">
            <h2 className="text-[15px] font-display font-bold text-ivory">
              {TABS.find((t) => t.id === activeTab)?.label}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-ivory/30 hover:text-ivory hover:bg-white/6 transition-all"
            >
              <X size={16} />
            </button>
          </div>

          {/* Scrollable content */}
          <div
            data-lenis-prevent="true"
            className="flex-1 overflow-y-auto p-6 relative"
          >
            {activeTab === "overview" && (
              <OverviewTab
                workspace={workspace}
                isAdmin={isAdmin}
                onUpdate={(d) => updateWorkspace(workspaceId, d)}
              />
            )}
            {activeTab === "roles" && isAdmin && (
              <RolesTab
                workspace={workspace}
                onCreateRole={(d) => createRole(workspaceId, d)}
                onUpdateRole={(rid, d) => updateRole(workspaceId, rid, d)}
                onDeleteRole={(rid) => deleteRole(workspaceId, rid)}
              />
            )}
            {activeTab === "members" && (
              <MembersTab
                workspace={workspace}
                members={members}
                currentUser={currentUser}
                onUpdateMemberRole={(uid, role) =>
                  updateMemberRole(workspaceId, uid, role)
                }
                onRemoveMember={(uid) => removeMembers(workspaceId, [uid])}
                onAssignRoles={(uid, rids) =>
                  assignRolesToMember(workspaceId, uid, rids)
                }
              />
            )}
            {activeTab === "invites" && isAdmin && (
              <InvitesTab
                workspace={workspace}
                onGenerateInvite={(exp) => generateInvite(workspaceId, exp)}
                onRevokeInvite={() => revokeInvite(workspaceId)}
              />
            )}
            {activeTab === "danger" && (
              <DangerTab
                workspace={workspace}
                currentUser={currentUser}
                onDelete={handleDelete}
                onLeave={handleLeave}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
