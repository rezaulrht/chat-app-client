"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  X,
  Link2,
  RefreshCw,
  Trash2,
  Settings,
  LogOut,
  Copy,
  Check,
  Search,
  Loader2,
  UserPlus,
  UserMinus,
  Shield,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { useWorkspace } from "@/hooks/useWorkspace";
import api from "@/app/api/Axios";

const ROLE_BADGE = {
  owner: { label: "Owner", cls: "text-yellow-400/80 bg-yellow-400/10" },
  admin: { label: "Admin", cls: "text-accent/80 bg-accent/10" },
  member: { label: "Member", cls: "text-ivory/30 bg-white/[0.04]" },
};

export default function WorkspaceSettingsPanel({ workspaceId, onClose }) {
  const { user } = useAuth();
  const {
    workspaces,
    membersCache,
    updateWorkspace,
    deleteWorkspace,
    leaveWorkspace,
    generateInvite,
    revokeInvite,
    fetchWorkspaceMembers,
    addMembers,
    removeMembers,
    updateMemberRole,
  } = useWorkspace();
  const router = useRouter();

  const workspace = workspaces.find((w) => w._id === workspaceId);
  const myRole = workspace?.myRole;
  const isOwner = myRole === "owner";
  const isAdmin = myRole === "admin" || isOwner;

  const [editName, setEditName] = useState(workspace?.name || "");
  const [editDesc, setEditDesc] = useState(workspace?.description || "");
  const [savingInfo, setSavingInfo] = useState(false);
  const [generatingInvite, setGeneratingInvite] = useState(false);
  const [inviteExpiry, setInviteExpiry] = useState("never");
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Members state ─────────────────────────────────────────────────────────
  const [membersLoading, setMembersLoading] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [userQuery, setUserQuery] = useState("");
  const [userResults, setUserResults] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const userQueryDebounce = useRef(null);

  // Fetch members when admin opens the panel
  useEffect(() => {
    if (!isAdmin || !workspaceId) return;
    setMembersLoading(true);
    fetchWorkspaceMembers(workspaceId).finally(() => setMembersLoading(false));
  }, [workspaceId, isAdmin, fetchWorkspaceMembers]);

  if (!workspace) return null;

  const inviteUrl = workspace.inviteCode
    ? `${window.location.origin}/invite/${workspace.inviteCode}`
    : null;

  const handleSaveInfo = async () => {
    if (!editName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    setSavingInfo(true);
    try {
      await updateWorkspace(workspaceId, {
        name: editName.trim(),
        description: editDesc.trim(),
      });
      toast.success("Workspace updated");
    } catch (err) {
      toast.error("Failed to update workspace");
    } finally {
      setSavingInfo(false);
    }
  };

  const handleGenerateInvite = async () => {
    setGeneratingInvite(true);
    try {
      await generateInvite(workspaceId, inviteExpiry);
      toast.success("Invite link generated");
    } catch (err) {
      toast.error("Failed to generate invite");
    } finally {
      setGeneratingInvite(false);
    }
  };

  const handleRevokeInvite = async () => {
    try {
      await revokeInvite(workspaceId);
      toast.success("Invite link revoked");
    } catch (err) {
      toast.error("Failed to revoke invite");
    }
  };

  const handleCopyInvite = () => {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Invite link copied!");
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    try {
      await deleteWorkspace(workspaceId);
      toast.success("Workspace deleted");
      onClose();
      router.push("/app/workspace");
    } catch (err) {
      toast.error("Failed to delete workspace");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  // ── Member handlers ───────────────────────────────────────────────────────
  const members = membersCache[workspaceId] || [];
  const filteredMembers = memberSearch.trim()
    ? members.filter(
      ({ user: m }) =>
        m.name?.toLowerCase().includes(memberSearch.toLowerCase()) ||
        m.email?.toLowerCase().includes(memberSearch.toLowerCase()),
    )
    : members;

  const handleUserQuery = (q) => {
    setUserQuery(q);
    clearTimeout(userQueryDebounce.current);
    if (!q.trim()) {
      setUserResults([]);
      return;
    }
    userQueryDebounce.current = setTimeout(async () => {
      setSearchingUsers(true);
      try {
        const results = await api
          .get(`/api/chat/users?q=${encodeURIComponent(q)}`)
          .then((r) => r.data);
        const memberIds = new Set(members.map((m) => m.user._id.toString()));
        setUserResults(results.filter((u) => !memberIds.has(u._id.toString())));
      } catch {
        setUserResults([]);
      } finally {
        setSearchingUsers(false);
      }
    }, 300);
  };

  const handleAddMember = async (userId) => {
    try {
      await addMembers(workspaceId, [userId]);
      toast.success("Member added");
      setUserQuery("");
      setUserResults([]);
      fetchWorkspaceMembers(workspaceId);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add member");
    }
  };

  const handleRoleChange = async (targetUserId, newRole) => {
    try {
      await updateMemberRole(workspaceId, targetUserId, newRole);
      toast.success(`Role updated to ${newRole}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update role");
    }
  };

  const handleKickMember = async (targetUserId) => {
    try {
      await removeMembers(workspaceId, [targetUserId]);
      toast.success("Member removed");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to remove member");
    }
  };

  return (
    <>
      <div className="absolute top-0 right-0 h-full w-80 glass-panel border-l border-white/6 flex flex-col z-30 shadow-[-12px_0_40px_rgba(0,0,0,0.3)]">
        {/* Header */}
        <div className="h-13 px-4 flex items-center justify-between border-b border-white/6">
          <div className="flex items-center gap-2">
            <Settings size={15} className="text-accent/60" />
            <span className="font-display font-bold text-ivory text-[14px]">
              Workspace Settings
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-ivory/20 hover:text-ivory/60 hover:bg-white/6 transition-all"
          >
            <X size={15} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-6">
          {/* ── Info Section (admin/owner only) ── */}
          {isAdmin && (
            <section className="space-y-3">
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-ivory/25">
                Info
              </p>
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                maxLength={50}
                className="w-full bg-white/4 border border-white/8 rounded-xl px-3 py-2 text-ivory text-sm font-mono placeholder:text-ivory/20 focus:outline-none focus:border-accent/40 transition-all"
                placeholder="Workspace name"
              />
              <input
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                maxLength={120}
                className="w-full bg-white/4 border border-white/8 rounded-xl px-3 py-2 text-ivory text-sm font-mono placeholder:text-ivory/20 focus:outline-none focus:border-accent/40 transition-all"
                placeholder="Description (optional)"
              />
              <button
                onClick={handleSaveInfo}
                disabled={savingInfo}
                className="w-full h-9 rounded-xl bg-accent/10 hover:bg-accent/20 text-accent text-[12px] font-display font-bold border border-accent/20 transition-all disabled:opacity-40"
              >
                {savingInfo ? "Saving..." : "Save Changes"}
              </button>
            </section>
          )}

          {/* ── Invite Link (admin/owner) ── */}
          {isAdmin && (
            <section className="space-y-3">
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-ivory/25">
                Invite Link
              </p>
              {inviteUrl ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 bg-white/3 border border-white/6 rounded-xl px-3 py-2">
                    <Link2 size={13} className="text-accent/50 shrink-0" />
                    <span className="text-ivory/40 text-[11px] font-mono flex-1 truncate">
                      {inviteUrl}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopyInvite}
                      className="flex-1 h-9 rounded-xl bg-accent/10 hover:bg-accent/20 text-accent text-[12px] font-display font-bold border border-accent/20 transition-all flex items-center justify-center gap-1.5"
                    >
                      {copied ? <Check size={13} /> : <Copy size={13} />}
                      {copied ? "Copied!" : "Copy"}
                    </button>
                    <button
                      onClick={handleRevokeInvite}
                      className="flex-1 h-9 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400/70 text-[12px] font-display font-bold border border-red-500/20 transition-all"
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <select
                    value={inviteExpiry}
                    onChange={(e) => setInviteExpiry(e.target.value)}
                    className="w-full bg-[#0f0f17] border border-white/8 rounded-xl px-3 py-2 text-ivory/60 text-[12px] font-mono focus:outline-none focus:border-accent/40 transition-all appearance-none cursor-pointer"
                  >
                    <option value="30m" className="bg-[#0f0f17] text-ivory/80">
                      Expires in 30 minutes
                    </option>
                    <option value="1h" className="bg-[#0f0f17] text-ivory/80">
                      Expires in 1 hour
                    </option>
                    <option value="6h" className="bg-[#0f0f17] text-ivory/80">
                      Expires in 6 hours
                    </option>
                    <option value="12h" className="bg-[#0f0f17] text-ivory/80">
                      Expires in 12 hours
                    </option>
                    <option value="1d" className="bg-[#0f0f17] text-ivory/80">
                      Expires in 1 day
                    </option>
                    <option value="7d" className="bg-[#0f0f17] text-ivory/80">
                      Expires in 7 days
                    </option>
                    <option
                      value="never"
                      className="bg-[#0f0f17] text-ivory/80"
                    >
                      Never expires
                    </option>
                  </select>
                  <button
                    onClick={handleGenerateInvite}
                    disabled={generatingInvite}
                    className="w-full h-9 rounded-xl bg-white/4 hover:bg-white/7 text-ivory/50 hover:text-ivory text-[12px] font-display font-bold border border-white/6 transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw
                      size={13}
                      className={generatingInvite ? "animate-spin" : ""}
                    />
                    {generatingInvite
                      ? "Generating..."
                      : "Generate Invite Link"}
                  </button>
                </div>
              )}
            </section>
          )}

          {/* ── Members (admin/owner) ── */}
          {isAdmin && (
            <section className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-ivory/25">
                  Members
                  {workspace.memberCount ? ` · ${workspace.memberCount}` : ""}
                </p>
                {membersLoading && (
                  <Loader2 size={11} className="text-accent/40 animate-spin" />
                )}
              </div>

              {/* Add Member toggle */}
              <button
                onClick={() => {
                  setAddingMember((v) => !v);
                  setUserQuery("");
                  setUserResults([]);
                }}
                className="w-full h-9 rounded-xl bg-white/4 hover:bg-white/7 text-ivory/50 hover:text-ivory text-[12px] font-display font-bold border border-white/6 transition-all flex items-center justify-center gap-1.5"
              >
                <UserPlus size={13} />
                {addingMember ? "Cancel" : "Add Member"}
              </button>

              {/* User search for add */}
              {addingMember && (
                <div className="space-y-1.5">
                  <div className="relative">
                    <Search
                      size={12}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/20 pointer-events-none"
                    />
                    <input
                      value={userQuery}
                      onChange={(e) => handleUserQuery(e.target.value)}
                      placeholder="Search by name or email..."
                      className="w-full bg-white/4 border border-white/8 rounded-xl pl-8 pr-3 py-2 text-ivory text-[12px] font-mono placeholder:text-ivory/20 focus:outline-none focus:border-accent/40 transition-all"
                    />
                  </div>
                  {searchingUsers && (
                    <div className="flex justify-center py-2">
                      <Loader2
                        size={13}
                        className="text-accent/50 animate-spin"
                      />
                    </div>
                  )}
                  {userResults.length > 0 && (
                    <div className="space-y-px max-h-36 overflow-y-auto scrollbar-hide rounded-xl bg-white/2 border border-white/6 p-1">
                      {userResults.map((u) => (
                        <button
                          key={u._id}
                          onClick={() => handleAddMember(u._id)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/5 transition-all text-left"
                        >
                          <Image
                            src={
                              u.avatar ||
                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`
                            }
                            width={26}
                            height={26}
                            className="rounded-lg shrink-0"
                            alt={u.name}
                            unoptimized
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-ivory/80 text-[12px] font-mono truncate">
                              {u.name}
                            </p>
                            <p className="text-ivory/30 text-[10px] font-mono truncate">
                              {u.email}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {userQuery.trim() &&
                    !searchingUsers &&
                    userResults.length === 0 && (
                      <p className="text-ivory/20 text-[11px] font-mono text-center py-2">
                        No users found
                      </p>
                    )}
                </div>
              )}

              {/* Search filter for existing members */}
              {members.length > 5 && (
                <div className="relative">
                  <Search
                    size={12}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/20 pointer-events-none"
                  />
                  <input
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Filter members..."
                    className="w-full bg-white/4 border border-white/8 rounded-xl pl-8 pr-3 py-2 text-ivory text-[12px] font-mono placeholder:text-ivory/20 focus:outline-none focus:border-accent/40 transition-all"
                  />
                </div>
              )}

              {/* Members list */}
              <div className="space-y-px max-h-56 overflow-y-auto scrollbar-hide">
                {!membersLoading && members.length === 0 && (
                  <p className="text-ivory/20 text-[11px] font-mono text-center py-4">
                    No members loaded
                  </p>
                )}
                {filteredMembers.map(({ user: member, role: memberRole }) => {
                  const badge = ROLE_BADGE[memberRole] || ROLE_BADGE.member;
                  const isSelf = member._id === user?._id;
                  const canChangeRole =
                    isAdmin && !isSelf && memberRole !== "owner";
                  const canRemove =
                    !isSelf &&
                    memberRole !== "owner" &&
                    (isOwner || memberRole === "member");

                  return (
                    <div
                      key={member._id}
                      className="flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-white/3 group"
                    >
                      {/* Avatar */}
                      <Image
                        src={
                          member.avatar ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`
                        }
                        width={28}
                        height={28}
                        className="rounded-lg shrink-0 ring-1 ring-white/6"
                        alt={member.name}
                        unoptimized
                      />
                      {/* Name + role */}
                      <div className="flex-1 min-w-0">
                        <p className="text-ivory/80 text-[12px] font-mono truncate leading-tight">
                          {member.name}
                          {isSelf && (
                            <span className="text-ivory/25 ml-1">(you)</span>
                          )}
                        </p>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${badge.cls}`}
                        >
                          {badge.label}
                        </span>
                      </div>
                      {/* Inline action buttons (hover-revealed) */}
                      {(canChangeRole || canRemove) && (
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          {canChangeRole && (
                            <button
                              title={
                                memberRole === "admin"
                                  ? "Demote to Member"
                                  : "Promote to Admin"
                              }
                              onClick={() =>
                                handleRoleChange(
                                  member._id,
                                  memberRole === "admin" ? "member" : "admin",
                                )
                              }
                              className="w-6 h-6 rounded-lg flex items-center justify-center text-ivory/30 hover:text-accent hover:bg-accent/10 transition-all"
                            >
                              <Shield size={12} />
                            </button>
                          )}
                          {canRemove && (
                            <button
                              title="Remove from workspace"
                              onClick={() => handleKickMember(member._id)}
                              className="w-6 h-6 rounded-lg flex items-center justify-center text-ivory/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            >
                              <UserMinus size={12} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── Danger Zone ── */}
          <section className="space-y-3 pt-2">
            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-red-400/40">
              Danger Zone
            </p>
            {!isOwner && (
              <button
                onClick={async () => {
                  try {
                    await leaveWorkspace(workspaceId);
                    toast.success("Left workspace");
                    onClose();
                    router.push("/app/workspace");
                  } catch (err) {
                    toast.error(
                      err?.response?.data?.message ||
                      "Failed to leave workspace",
                    );
                  }
                }}
                className="w-full h-9 rounded-xl bg-red-500/8 hover:bg-red-500/15 text-red-400/70 hover:text-red-400 text-[12px] font-display font-bold border border-red-500/15 transition-all flex items-center justify-center gap-1.5"
              >
                <LogOut size={13} /> Leave Workspace
              </button>
            )}
            {isOwner && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className={`w-full h-9 rounded-xl text-[12px] font-display font-bold border transition-all flex items-center justify-center gap-1.5 ${confirmDelete
                    ? "bg-red-500/25 border-red-500/50 text-red-300"
                    : "bg-red-500/8 border-red-500/15 text-red-400/70 hover:bg-red-500/15 hover:text-red-400"
                  }`}
              >
                <Trash2 size={13} />
                {deleting
                  ? "Deleting..."
                  : confirmDelete
                    ? "Confirm — permanently delete?"
                    : "Delete Workspace"}
              </button>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
