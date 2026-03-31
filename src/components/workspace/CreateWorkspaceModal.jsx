"use client";
import React, { useState } from "react";
import { createPortal } from "react-dom";
import { X, Plus, Globe, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useWorkspace } from "@/hooks/useWorkspace";

export default function CreateWorkspaceModal({ trigger = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("private");
  const [loading, setLoading] = useState(false);
  const { createWorkspace } = useWorkspace();
  const router = useRouter();

  const reset = () => {
    setName("");
    setDescription("");
    setVisibility("private");
  };

  const handleClose = () => {
    reset();
    setIsOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Workspace name is required");
      return;
    }
    if (name.trim().length > 50) {
      toast.error("Name must be under 50 characters");
      return;
    }

    setLoading(true);
    try {
      const ws = await createWorkspace({
        name: name.trim(),
        description: description.trim(),
        visibility,
      });
      toast.success(`Workspace "${ws.name}" created!`);
      handleClose();
      router.push(`/app/workspace/${ws._id}`);
    } catch (err) {
      toast.error(err.message || "Failed to create workspace");
    } finally {
      setLoading(false);
    }
  };

  const modal = isOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-sm md:max-w-md glass-card rounded-3xl border border-white/[0.08] shadow-[0_24px_80px_rgba(0,0,0,0.6)] p-4 md:p-6 space-y-4 md:space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display font-bold text-ivory text-lg">
              Create Workspace
            </h2>
            <p className="text-ivory/30 text-[12px] font-mono mt-0.5">
              A workspace is your team's home for modules and chat
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-ivory/20 hover:text-ivory/60 hover:bg-white/[0.06] transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Workspace Name */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold uppercase tracking-widest text-ivory/30">
              Workspace Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My Team"
              maxLength={50}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-ivory text-sm font-mono placeholder:text-ivory/20 focus:outline-none focus:border-accent/40 focus:bg-white/[0.06] transition-all"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold uppercase tracking-widest text-ivory/30">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional — what's this workspace for?"
              maxLength={120}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-ivory text-sm font-mono placeholder:text-ivory/20 focus:outline-none focus:border-accent/40 focus:bg-white/[0.06] transition-all"
            />
          </div>

          {/* Visibility Toggle */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold uppercase tracking-widest text-ivory/30">
              Visibility
            </label>
            <div className="flex gap-2">
              {[
                {
                  id: "private",
                  label: "Private",
                  icon: Lock,
                  desc: "Invite only",
                },
                {
                  id: "public",
                  label: "Public",
                  icon: Globe,
                  desc: "Anyone can join",
                },
              ].map((opt) => {
                const Icon = opt.icon;
                const isSelected = visibility === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setVisibility(opt.id)}
                    className={`flex-1 flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all ${isSelected
                        ? "border-accent/40 bg-accent/8 text-accent"
                        : "border-white/[0.06] bg-white/[0.02] text-ivory/30 hover:text-ivory/50 hover:border-white/[0.1]"
                      }`}
                  >
                    <Icon size={15} />
                    <div className="text-left">
                      <p className="text-[12px] font-display font-bold">
                        {opt.label}
                      </p>
                      <p className="text-[10px] font-mono text-ivory/25">
                        {opt.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full h-11 rounded-xl bg-accent/15 hover:bg-accent/25 text-accent font-display font-bold text-sm tracking-wide border border-accent/20 hover:border-accent/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              "Create Workspace"
            )}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Trigger: custom element or default button */}
      {trigger ? (
        React.cloneElement(trigger, {
          onClick: (e) => {
            trigger.props.onClick?.(e);
            setIsOpen(true);
          },
        })
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-ivory/20 hover:text-accent hover:bg-accent/5 transition-all duration-150"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-dashed border-white/10 hover:border-accent/30 transition-colors">
            <Plus size={18} />
          </div>
          <span className="text-sm font-display font-semibold">
            Create Workspace
          </span>
        </button>
      )}

      {typeof window !== "undefined" && createPortal(modal, document.body)}
    </>
  );
}
