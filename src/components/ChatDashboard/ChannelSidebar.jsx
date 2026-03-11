"use client";
import React, { useEffect, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Hash,
  ChevronDown,
  ChevronLeft,
  Plus,
  Volume2,
  Lock,
  Settings,
  Megaphone,
  Loader2,
} from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { useWorkspace } from "@/hooks/useWorkspace";

export default function ChannelSidebar({
  selectedWorkspaceId,
  onBack,
  activeModuleId,
  onSettingsOpen, // () => void — opens WorkspaceSettingsPanel
  onCreateModule, // () => void — opens CreateModuleModal (later by Member 6)
}) {
  const { user: currentUser } = useAuth();
  const { modulesCache, loadingModules, fetchModules, workspaces } =
    useWorkspace();
  const router = useRouter();

  // Auto-fetch modules when a workspace is selected
  useEffect(() => {
    if (selectedWorkspaceId) {
      fetchModules(selectedWorkspaceId);
    }
  }, [selectedWorkspaceId, fetchModules]);

  // Find current workspace
  const workspace = workspaces.find((w) => w._id === selectedWorkspaceId);

  // Get modules for this workspace (from cache)
  const modules = modulesCache[selectedWorkspaceId] || [];

  // Group modules by category, respecting workspace.categories order
  const groupedModules = useMemo(() => {
    const categoryOrder = workspace?.categories?.map((c) => c.name) || [];
    const groups = {};

    // Group by category
    modules.forEach((mod) => {
      const cat = mod.category || "General";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(mod);
    });

    // Sort inside each group by position
    Object.values(groups).forEach((list) =>
      list.sort((a, b) => a.position - b.position),
    );

    // Build final array in category order (from workspace), extras at end
    const ordered = [];
    categoryOrder.forEach((name) => {
      if (groups[name]) {
        ordered.push({ name, modules: groups[name] });
        delete groups[name];
      }
    });

    // Add any leftover categories alphabetically
    Object.keys(groups)
      .sort()
      .forEach((name) => ordered.push({ name, modules: groups[name] }));

    return ordered;
  }, [modules, workspace]);

  return (
    <aside className="w-full glass-panel flex flex-col shrink-0 flex-1 min-h-0 overflow-hidden">
      {/* Workspace Header (click to open settings) */}
      <div
        onClick={() => onSettingsOpen?.()}
        className="h-13 px-4 flex items-center justify-between border-b border-white/[0.06] hover:bg-white/[0.03] cursor-pointer transition-all duration-300 group relative"
      >
        <div className="flex items-center gap-2 min-w-0">
          {onBack && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBack();
              }}
              className="hidden md:flex w-7 h-7 rounded-lg items-center justify-center text-ivory/20 hover:text-accent hover:bg-white/6 transition-all duration-200 -ml-1 shrink-0"
            >
              <ChevronLeft size={16} />
            </button>
          )}
          <h2 className="text-ivory font-display font-bold text-[15px] truncate">
            {workspace?.name || "Workspace"}
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          {(workspace?.myRole === "owner" || workspace?.myRole === "admin") && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCreateModule?.("General");
              }}
              title="New module"
              className="w-6 h-6 rounded-lg flex items-center justify-center text-ivory/25 hover:text-accent hover:bg-white/6 transition-all duration-200 shrink-0"
            >
              <Plus size={14} />
            </button>
          )}
          <ChevronDown
            size={16}
            className="text-ivory/20 group-hover:text-ivory/60 transition-colors duration-300"
          />
        </div>
        <div className="absolute bottom-0 left-4 right-4 h-px bg-linear-to-r from-transparent via-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Modules List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide py-4 px-2">
        {loadingModules && modules.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={20} className="text-accent/40 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {groupedModules.map((group) => (
              <div key={group.name}>
                {/* Category Header */}
                <div className="flex items-center justify-between px-2 mb-1.5 group/cat cursor-pointer">
                  <div className="flex items-center gap-1.5">
                    <span className="w-0.5 h-3 rounded-full bg-accent/30" />
                    <span className="text-[10px] font-mono font-bold tracking-[0.15em] uppercase text-ivory/25 group-hover/cat:text-ivory/40 transition-colors duration-200">
                      {group.name}
                    </span>
                  </div>

                  {/* + Button to create module (only admin/owner) */}
                  {(workspace?.myRole === "owner" ||
                    workspace?.myRole === "admin") && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCreateModule?.(group.name);
                      }}
                      title="Add module"
                      className="text-ivory/15 hover:text-accent opacity-0 group-hover/cat:opacity-100 transition-all duration-200"
                    >
                      <Plus size={13} />
                    </button>
                  )}
                </div>

                {/* Module Items */}
                <div className="space-y-px">
                  {group.modules.map((mod) => {
                    const isActive = mod._id === activeModuleId;
                    const isAnnouncement = mod.type === "announcement";
                    const Icon = isAnnouncement ? Megaphone : Hash;

                    return (
                      <div
                        key={mod._id}
                        onClick={() =>
                          router.push(
                            `/app/workspace/${selectedWorkspaceId}/${mod._id}`,
                          )
                        }
                        className={`flex items-center gap-2.5 px-2 py-[7px] rounded-xl cursor-pointer group/ch transition-all duration-200 relative ${
                          isActive
                            ? "bg-white/[0.06] text-ivory backdrop-blur-sm"
                            : "hover:bg-white/[0.03] text-ivory/30 hover:text-ivory/60"
                        }`}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-accent rounded-r-full shadow-[0_0_6px_rgba(0,211,187,0.4)]" />
                        )}

                        <Icon
                          size={16}
                          className={
                            isActive
                              ? "text-accent shrink-0"
                              : "text-ivory/15 group-hover/ch:text-accent/60 transition-colors duration-200 shrink-0"
                          }
                        />
                        <span className="text-[13px] font-medium leading-none flex-1 truncate">
                          {mod.name}
                        </span>
                        {mod.isPrivate && (
                          <Lock size={11} className="text-ivory/15 shrink-0" />
                        )}
                        {mod.unreadCount > 0 && !isActive && (
                          <span className="text-[10px] font-bold font-mono bg-accent/20 text-accent rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                            {mod.unreadCount > 99 ? "99+" : mod.unreadCount}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {groupedModules.length === 0 && !loadingModules && (
              <div className="text-center py-8 px-4">
                <Hash size={24} className="mx-auto text-ivory/10 mb-2" />
                <p className="text-ivory/20 text-[11px] font-mono mb-3">
                  No modules yet
                </p>
                {(workspace?.myRole === "owner" ||
                  workspace?.myRole === "admin") && (
                  <button
                    onClick={() => onCreateModule?.("General")}
                    className="flex items-center gap-1.5 mx-auto text-[11px] font-mono text-accent/60 hover:text-accent transition-colors duration-200"
                  >
                    <Plus size={12} />
                    Add a module
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Status Bar (bottom) */}
      <div className="mx-2 mb-2 p-2.5 glass-card rounded-2xl flex items-center gap-2.5">
        <div className="relative shrink-0 cursor-pointer group/av">
          {/* TODO: restore avatar overlay presence dot once socket presence is wired */}
          <div className="w-8 h-8 rounded-xl overflow-hidden ring-1 ring-white/[0.06] group-hover/av:ring-accent/40 transition-all duration-300">
            <Image
              src={
                currentUser?.avatar ||
                "https://api.dicebear.com/7.x/avataaars/svg?seed=" +
                  (currentUser?.name || "user")
              }
              width={32}
              height={32}
              className="rounded-xl"
              alt="avatar"
              unoptimized
            />
          </div>
        </div>
        <div className="flex-1 min-w-0 cursor-pointer group/u">
          <p className="text-ivory text-[13px] font-display font-bold truncate leading-tight group-hover/u:text-accent transition-colors duration-200">
            {currentUser?.name?.split(" ")[0]}
          </p>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-ivory/20 text-[9px] font-mono font-medium uppercase tracking-[0.15em]">
              Online
            </p>
          </div>
        </div>
        <button
          onClick={() => onSettingsOpen?.()}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-ivory/15 hover:text-ivory/40 hover:bg-white/[0.04] transition-all duration-200"
        >
          <Settings size={14} />
        </button>
      </div>
    </aside>
  );
}
