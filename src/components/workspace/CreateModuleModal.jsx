"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Hash, Megaphone, Lock, X, Loader2, Check, Shield } from "lucide-react";
import { useWorkspace } from "@/hooks/useWorkspace";
import toast from "react-hot-toast";

const MODULE_TYPES = [
  {
    value: "text",
    label: "Text",
    icon: Hash,
    description: "General-purpose chat channel",
  },
  {
    value: "announcement",
    label: "Announcement",
    icon: Megaphone,
    description: "Admins post, members read",
  },
];

function toSlug(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export default function CreateModuleModal({
  workspaceId,
  defaultCategory = "General",
  onClose,
}) {
  const router = useRouter();
  const { workspaces, createModule } = useWorkspace();
  const workspace = workspaces.find((w) => w._id === workspaceId);
  const categories = workspace?.categories
    ?.map((c) => c.name)
    .filter(Boolean) || ["General"];

  const [name, setName] = useState("");
  const [type, setType] = useState("text");
  const [category, setCategory] = useState(
    categories.includes(defaultCategory)
      ? defaultCategory
      : categories[0] || "General",
  );
  const [isPrivate, setIsPrivate] = useState(false);
  const [allowedRoles, setAllowedRoles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Sync category when defaultCategory or workspace categories resolve
  useEffect(() => {
    if (categories.length > 0) {
      setCategory(
        categories.includes(defaultCategory) ? defaultCategory : categories[0],
      );
    }
  }, [defaultCategory, workspaceId]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const slug = toSlug(name);
  const canSubmit = slug.length > 0 && !submitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const mod = await createModule(workspaceId, {
        name: slug,
        type,
        category,
        isPrivate,
        allowedRoles: isPrivate ? allowedRoles : [],
      });
      toast.success(`#${mod.name} created!`);
      onClose();
      router.push(`/app/workspace/${workspaceId}/${mod._id}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create module");
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted || typeof window === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-obsidian border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-ivory font-display font-bold text-[15px]">
              Create Module
            </h2>
            <p className="text-ivory/30 text-[11px] font-mono mt-0.5">
              in {workspace?.name || "workspace"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-ivory/25 hover:text-ivory hover:bg-white/[0.06] transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-5">
          {/* Module Type */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono font-bold text-ivory/40 uppercase tracking-wider">
              Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {MODULE_TYPES.map(({ value, label, icon: Icon, description }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setType(value)}
                  className={`flex flex-col items-start gap-1.5 p-3 rounded-xl border transition-all text-left ${
                    type === value
                      ? "bg-accent/10 border-accent/40 text-ivory"
                      : "bg-white/[0.03] border-white/[0.06] text-ivory/50 hover:border-white/[0.12] hover:text-ivory/70"
                  }`}
                >
                  <Icon
                    size={16}
                    className={type === value ? "text-accent" : "text-ivory/30"}
                  />
                  <div>
                    <p className="text-[12px] font-display font-bold leading-none">
                      {label}
                    </p>
                    <p className="text-[10px] font-mono text-ivory/25 mt-0.5">
                      {description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Module Name */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold text-ivory/40 uppercase tracking-wider">
              Name
            </label>
            <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] rounded-xl px-3 py-2.5 focus-within:border-accent/30 transition-all">
              <Hash size={14} className="text-ivory/20 shrink-0" />
              <input
                type="text"
                className="flex-1 bg-transparent text-ivory text-[13px] outline-none placeholder:text-ivory/20 font-mono"
                placeholder="e.g. general-chat"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={80}
                autoFocus
              />
            </div>
            {slug && (
              <p className="text-[10px] font-mono text-ivory/25 px-1">
                Will be created as{" "}
                <span className="text-accent/60">#{slug}</span>
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold text-ivory/40 uppercase tracking-wider">
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

          {/* Private toggle */}
          <div className="flex items-center justify-between bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
            <div className="flex items-center gap-2.5">
              <Lock size={15} className="text-ivory/30" />
              <div>
                <p className="text-[12px] font-display font-bold text-ivory/70">
                  Private module
                </p>
                <p className="text-[10px] font-mono text-ivory/25">
                  Only invited members can view
                </p>
              </div>
            </div>
            <button
              type="button"
              aria-label={
                isPrivate ? "Disable private module" : "Enable private module"
              }
              aria-pressed={isPrivate}
              onClick={() => setIsPrivate((v) => !v)}
              className={`relative w-10 h-5 rounded-full border transition-all ${
                isPrivate
                  ? "bg-accent/30 border-accent/40"
                  : "bg-white/[0.06] border-white/[0.10]"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform ${
                  isPrivate
                    ? "translate-x-5 bg-accent"
                    : "translate-x-0 bg-ivory/30"
                }`}
              />
            </button>
          </div>

          {/* Allowed Roles (when private) */}
          {isPrivate && workspace?.roles?.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Shield size={12} className="text-ivory/30" />
                <label className="text-[11px] font-mono font-bold text-ivory/40 uppercase tracking-wider">
                  Role Access
                </label>
              </div>
              <p className="text-[10px] font-mono text-ivory/25">
                Select roles that can access this private channel (leave empty for admins/owner only)
              </p>
              <div className="flex flex-wrap gap-2">
                {workspace.roles.map((role) => {
                  const selected = allowedRoles.includes(role._id);
                  return (
                    <button
                      key={role._id}
                      type="button"
                      onClick={() =>
                        setAllowedRoles((prev) =>
                          selected
                            ? prev.filter((id) => id !== role._id)
                            : [...prev, role._id],
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

          {/* Footer */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-[12px] font-mono font-bold text-ivory/30 hover:text-ivory bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex-1 py-2.5 rounded-xl text-[12px] font-mono font-bold text-accent bg-accent/10 hover:bg-accent/20 border border-accent/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 size={13} className="animate-spin" />}
              Create Module
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
