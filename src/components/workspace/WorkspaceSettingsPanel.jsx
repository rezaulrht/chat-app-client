"use client";
import React, { useState } from "react";
import {
  X,
  Link2,
  RefreshCw,
  Trash2,
  Settings,
  Users,
  LogOut,
  Copy,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { useWorkspace } from "@/hooks/useWorkspace";
import InviteMembersModal from "./InviteMembersModal";

export default function WorkspaceSettingsPanel({ workspaceId, onClose }) {
  const { user } = useAuth();
  const {
    workspaces,
    updateWorkspace,
    deleteWorkspace,
    leaveWorkspace,
    generateInvite,
    revokeInvite,
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
  const [copied, setCopied] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
      await generateInvite(workspaceId);
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

  return (
    <>
      <div className="absolute top-0 right-0 h-full w-80 glass-panel border-l border-white/[0.06] flex flex-col z-30 shadow-[-12px_0_40px_rgba(0,0,0,0.3)]">
        {/* Header */}
        <div className="h-13 px-4 flex items-center justify-between border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Settings size={15} className="text-accent/60" />
            <span className="font-display font-bold text-ivory text-[14px]">
              Workspace Settings
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-ivory/20 hover:text-ivory/60 hover:bg-white/[0.06] transition-all"
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
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-ivory text-sm font-mono placeholder:text-ivory/20 focus:outline-none focus:border-accent/40 transition-all"
                placeholder="Workspace name"
              />
              <input
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                maxLength={120}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-ivory text-sm font-mono placeholder:text-ivory/20 focus:outline-none focus:border-accent/40 transition-all"
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
                  <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2">
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
                <button
                  onClick={handleGenerateInvite}
                  disabled={generatingInvite}
                  className="w-full h-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] text-ivory/50 hover:text-ivory text-[12px] font-display font-bold border border-white/[0.06] transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
                >
                  <RefreshCw
                    size={13}
                    className={generatingInvite ? "animate-spin" : ""}
                  />
                  {generatingInvite ? "Generating..." : "Generate Invite Link"}
                </button>
              )}
            </section>
          )}

          {/* ── Members (admin/owner) ── */}
          {isAdmin && (
            <section className="space-y-3">
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-ivory/25">
                Members
              </p>
              <button
                onClick={() => setShowInviteModal(true)}
                className="w-full h-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] text-ivory/50 hover:text-ivory text-[12px] font-display font-bold border border-white/[0.06] transition-all flex items-center justify-center gap-1.5"
              >
                <Users size={13} />
                Manage Members
              </button>
            </section>
          )}

          {/* ── Danger Zone ── */}
          <section className="space-y-3 pt-2">
            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-red-400/40">
              Danger Zone
            </p>
            {!isOwner && (
              <button
                onClick={() => {
                  // TODO: call leaveWorkspace(workspaceId) then router.push("/app/workspace")
                  toast("Leave workspace — wire in Day 6");
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
                className={`w-full h-9 rounded-xl text-[12px] font-display font-bold border transition-all flex items-center justify-center gap-1.5 ${
                  confirmDelete
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

      {showInviteModal && (
        <InviteMembersModal
          workspaceId={workspaceId}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </>
  );
}
