"use client";
import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Settings,
  Shield,
  Trash2,
  Check,
  AlertTriangle,
  Loader2,
  Lock,
} from "lucide-react";
import toast from "react-hot-toast";
import { useWorkspace } from "@/hooks/useWorkspace";

const AVAILABLE_PERMISSIONS = [
  { id: "VIEW_CHANNEL", label: "View Channel", desc: "Allows members to view and read this channel." },
  { id: "SEND_MESSAGES", label: "Send Messages", desc: "Allows members to send messages in this channel." },
  { id: "MANAGE_MESSAGES", label: "Manage Messages", desc: "Allows deleting messages sent by others, and posting in announcement channels." },
  { id: "MANAGE_CHANNELS", label: "Manage Channel", desc: "Allows editing this channel's settings and deleting it." },
];

export default function ModuleSettingsModal({ workspaceId, moduleId, onClose }) {
  const { workspaces, modulesCache, updateModule, deleteModule } = useWorkspace();
  const workspace = workspaces.find((w) => w._id === workspaceId);
  const moduleData = (modulesCache[workspaceId] || []).find((m) => m._id === moduleId);

  const [activeTab, setActiveTab] = useState("overview");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!mounted || !moduleData || typeof window === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative w-full md:max-w-2xl h-[92dvh] md:h-[600px] flex flex-col bg-obsidian border border-white/10 rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden">

        {/* Header with tabs on mobile, sidebar on desktop */}
        <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
          {/* Nav: horizontal tabs on mobile, vertical sidebar on desktop */}
          <div className="shrink-0 border-b border-white/5 md:border-b-0 md:border-r md:w-52 bg-white/[0.02] flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto scrollbar-hide">
            <div className="hidden md:block mb-4 px-4 pt-4">
              <h2 className="text-ivory font-display font-bold text-[15px] truncate">
                {moduleData.name}
              </h2>
              <p className="text-ivory/40 text-[11px] font-mono mt-0.5">
                Channel Settings
              </p>
            </div>

            <div className="flex flex-row md:flex-col gap-1 md:gap-0 md:space-y-1 px-2 py-2 md:py-0 md:pb-4">
              {[
                { id: "overview", label: "Overview", icon: Settings },
                { id: "permissions", label: "Permissions", icon: Shield },
                { id: "danger", label: "Danger Zone", icon: AlertTriangle },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`shrink-0 md:w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-left ${
                    activeTab === id
                      ? "bg-accent/10 text-accent font-bold"
                      : id === "danger"
                        ? "text-red-400/50 hover:text-red-400 hover:bg-red-500/[0.08] font-medium"
                        : "text-ivory/60 hover:bg-white/5 hover:text-ivory font-medium"
                  } text-[13px]`}
                >
                  <Icon size={15} />
                  <span className="whitespace-nowrap">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 relative min-h-0">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 md:top-6 md:right-6 w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-ivory/40 hover:text-ivory transition-all backdrop-blur-md z-10"
            >
            <X size={16} />
          </button>

          <div className="max-w-xl">
            <h2 className="text-lg font-display font-bold text-ivory mb-6 capitalize px-1">
              {activeTab === "danger" ? "Danger Zone" : activeTab}
            </h2>

            {activeTab === "overview" && (
              <OverviewTab
                workspace={workspace}
                moduleData={moduleData}
                onUpdate={(payload) => updateModule(workspaceId, moduleId, payload)}
              />
            )}
            {activeTab === "permissions" && (
              <PermissionsTab
                workspace={workspace}
                moduleData={moduleData}
                onUpdate={(payload) => updateModule(workspaceId, moduleId, payload)}
              />
            )}
            {activeTab === "danger" && (
              <DangerTab
                moduleData={moduleData}
                onDelete={async () => {
                  try {
                    await deleteModule(workspaceId, moduleId);
                    toast.success("Channel deleted");
                    onClose();
                  } catch {
                    toast.error("Failed to delete channel");
                  }
                }}
              />
            )}
          </div>
        </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// OVERVIEW TAB
// ─────────────────────────────────────────────────────────────────────────────
function OverviewTab({ workspace, moduleData, onUpdate }) {
  const [name, setName] = useState(moduleData.name || "");
  const [description, setDescription] = useState(moduleData.description || "");
  const [category, setCategory] = useState(moduleData.category || "General");
  const [saving, setSaving] = useState(false);

  const categories = workspace?.categories?.map((c) => c.name).filter(Boolean) || ["General"];

  const isDirty =
    name !== (moduleData.name || "") ||
    description !== (moduleData.description || "") ||
    category !== (moduleData.category || "General");

  const handleSave = async () => {
    if (!name.trim()) return toast.error("Name cannot be empty");
    setSaving(true);
    try {
      await onUpdate({
        name: name.trim().toLowerCase().replace(/\s+/g, "-"),
        description,
        category,
      });
      toast.success("Channel updated!");
    } catch {
      toast.error("Failed to update channel");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-[11px] font-mono font-bold text-ivory/40 uppercase tracking-widest mb-2">
          Channel Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. general-chat"
          className="w-full bg-white/4 border border-white/8 rounded-xl px-3 py-2 text-[13px] font-mono text-ivory/70 placeholder:text-ivory/20 focus:outline-none focus:border-accent/40"
        />
      </div>

      <div>
        <label className="block text-[11px] font-mono font-bold text-ivory/40 uppercase tracking-widest mb-2">
          Category
        </label>
        <select
          className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-3 py-2.5 text-ivory text-[13px] font-mono outline-none focus:border-accent/30 transition-all appearance-none cursor-pointer"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((cat, i) => (
            <option key={`${cat}-${i}`} value={cat} className="bg-obsidian">
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-[11px] font-mono font-bold text-ivory/40 uppercase tracking-widest mb-2">
          Description / Topic
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What's this channel about?"
          rows={3}
          className="w-full bg-white/4 border border-white/8 rounded-xl px-3 py-2 text-[13px] text-ivory/70 placeholder:text-ivory/20 focus:outline-none focus:border-accent/40 resize-none scrollbar-hide"
        />
      </div>

      {isDirty && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-2.5 bg-accent hover:bg-accent/90 text-black font-bold rounded-xl text-[13px] transition-all flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
          Save Changes
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PERMISSIONS TAB
// ─────────────────────────────────────────────────────────────────────────────
function PermissionsTab({ workspace, moduleData, onUpdate }) {
  const [isPrivate, setIsPrivate] = useState(moduleData.isPrivate || false);
  
  // Clone overrides for editing
  const [overrides, setOverrides] = useState(moduleData.permissionOverrides || []);
  const [saving, setSaving] = useState(false);

  // Derive allowed roles if private (for simple toggle UI)
  const allowedRoleIds = useMemo(() => {
    if (!isPrivate) return [];
    return overrides
      .filter((ov) => ov.targetType === "role" && ov.allow.includes("VIEW_CHANNEL"))
      .map((ov) => ov.targetId.toString());
  }, [isPrivate, overrides]);

  const setAllowedRoles = (newRoles) => {
    // If we simply check/uncheck roles, we reconstruct the basic overrides payload.
    const newOverrides = newRoles.map(roleId => ({
      targetId: roleId,
      targetType: "role",
      allow: ["VIEW_CHANNEL"],
      deny: []
    }));
    setOverrides(newOverrides);
  };

  const isDirty = 
    isPrivate !== (moduleData.isPrivate || false) ||
    JSON.stringify(overrides) !== JSON.stringify(moduleData.permissionOverrides || []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate({
        isPrivate,
        permissionOverrides: isPrivate ? overrides : [],
      });
      toast.success("Permissions updated!");
    } catch {
      toast.error("Failed to update permissions");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Lock size={15} className="text-ivory/30" />
          <div>
            <p className="text-[12px] font-display font-bold text-ivory/70">
              Private Channel
            </p>
            <p className="text-[10px] font-mono text-ivory/25">
              Only invited roles can view this channel
            </p>
          </div>
        </div>
        <button
          type="button"
          aria-label={isPrivate ? "Disable private module" : "Enable private module"}
          onClick={() => {
            setIsPrivate((v) => !v);
            if (!isPrivate) setOverrides([]); // clear overrides if made public
          }}
          className={`relative w-10 h-5 rounded-full border transition-all ${
            isPrivate ? "bg-accent/30 border-accent/40" : "bg-white/[0.06] border-white/[0.10]"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform ${
              isPrivate ? "translate-x-5 bg-accent" : "translate-x-0 bg-ivory/30"
            }`}
          />
        </button>
      </div>

      {isPrivate && workspace?.roles?.length > 0 && (
        <div className="space-y-2">
          <label className="text-[11px] font-mono font-bold text-ivory/40 uppercase tracking-wider">
            Who can access this channel?
          </label>
          <div className="flex flex-wrap gap-2">
            {workspace.roles.map((role) => {
              const selected = allowedRoleIds.includes(role._id);
              return (
                <button
                  key={role._id}
                  onClick={() =>
                    setAllowedRoles(
                      selected
                        ? allowedRoleIds.filter((id) => id !== role._id)
                        : [...allowedRoleIds, role._id],
                    )
                  }
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-mono font-bold transition-all"
                  style={{
                    borderColor: selected ? role.color : role.color + "30",
                    color: selected ? role.color : role.color + "60",
                    backgroundColor: selected ? role.color + "20" : "transparent",
                  }}
                >
                  {selected && <Check size={10} />}
                  {role.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {isDirty && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-2.5 bg-accent hover:bg-accent/90 text-black font-bold rounded-xl text-[13px] transition-all flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
          Save Permissions
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DANGER TAB
// ─────────────────────────────────────────────────────────────────────────────
function DangerTab({ moduleData, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 space-y-4">
        <div>
          <h3 className="text-[13px] font-display font-bold text-red-400">
            Delete Channel
          </h3>
          <p className="text-[11px] font-mono text-ivory/40 mt-1">
            Once you delete a channel, there is no going back. Please be certain.
          </p>
        </div>

        {confirmDelete ? (
          <div className="flex gap-2">
            <button
              onClick={onDelete}
              className="flex-1 px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-500 text-[12px] font-bold transition-colors border border-red-500/30 flex items-center justify-center gap-2"
            >
              <Trash2 size={14} /> Yes, delete
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="flex-1 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-ivory/60 text-[12px] font-bold transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[12px] font-bold transition-colors border border-red-500/20"
          >
            Delete {moduleData.name}
          </button>
        )}
      </div>
    </div>
  );
}
