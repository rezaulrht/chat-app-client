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
  FolderPlus,
  Check,
  X,
  MoreHorizontal,
  Pencil,
  Trash2,
  LogOut,
} from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { useWorkspace } from "@/hooks/useWorkspace";
import toast from "react-hot-toast";
import UserProfileModal from "@/components/profile/UserProfileModal";

export default function ChannelSidebar({
  selectedWorkspaceId,
  onBack,
  activeModuleId,
  onSettingsOpen, // () => void — opens WorkspaceSettingsPanel
  onCreateModule, // () => void — opens CreateModuleModal (later by Member 6)
}) {
  const { user: currentUser, logout } = useAuth();
  const {
    modulesCache,
    loadingModules,
    fetchModules,
    workspaces,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useWorkspace();
  const router = useRouter();

  const [showNewCategory, setShowNewCategory] = React.useState(false);
  const [showProfile, setShowProfile] = React.useState(false);
  const [newCategoryName, setNewCategoryName] = React.useState("");
  const [savingCategory, setSavingCategory] = React.useState(false);

  // Per-category menu state
  const [openMenuCat, setOpenMenuCat] = React.useState(null);
  const [renamingCat, setRenamingCat] = React.useState(null);
  const [renameValue, setRenameValue] = React.useState("");

  const handleRenameSubmit = async (e) => {
    e?.preventDefault();
    if (!renameValue.trim() || !renamingCat) return;
    try {
      await updateCategory(
        selectedWorkspaceId,
        renamingCat._id,
        renameValue.trim(),
      );
      setRenamingCat(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to rename category");
    }
  };

  const handleDeleteCategory = async (catEntry) => {
    if (!catEntry?._id) return;
    try {
      await deleteCategory(selectedWorkspaceId, catEntry._id);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete category");
    }
  };

  const handleCreateCategory = async (e) => {
    e?.preventDefault();
    if (!newCategoryName.trim() || savingCategory) return;
    setSavingCategory(true);
    try {
      await addCategory(selectedWorkspaceId, newCategoryName.trim());
      setNewCategoryName("");
      setShowNewCategory(false);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to create category";
      toast.error(msg);
    } finally {
      setSavingCategory(false);
    }
  };

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
    // Always include every workspace category, even empty ones
    const ordered = [];
    const seenNames = new Set();
    categoryOrder.forEach((name) => {
      if (seenNames.has(name)) return; // skip genuine DB duplicates
      seenNames.add(name);
      ordered.push({ name, modules: groups[name] || [] });
      delete groups[name];
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
        onClick={() => {
          if (workspace?.myRole === "owner" || workspace?.myRole === "admin") {
            onSettingsOpen?.();
          }
        }}
        className={`h-13 px-4 flex items-center justify-between border-b border-white/6 hover:bg-white/3 transition-all duration-300 group relative ${
          workspace?.myRole === "owner" || workspace?.myRole === "admin"
            ? "cursor-pointer"
            : "cursor-default"
        }`}
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
            <div className="flex items-center gap-0.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNewCategory((v) => !v);
                  setNewCategoryName("");
                }}
                title="New category"
                className="w-6 h-6 rounded-lg flex items-center justify-center text-ivory/25 hover:text-accent hover:bg-white/6 transition-all duration-200 shrink-0"
              >
                <FolderPlus size={13} />
              </button>
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
            </div>
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
            {groupedModules.map((group, gi) => {
              const catEntry = workspace?.categories?.find(
                (c) => c.name === group.name,
              );
              const isMenuOpen = openMenuCat === group.name;
              const isRenaming = renamingCat && renamingCat.name === group.name;
              const isAdminOrOwner =
                workspace?.myRole === "owner" || workspace?.myRole === "admin";

              return (
                <div key={`${group.name}-${gi}`}>
                  {/* Category Header */}
                  <div className="flex items-center justify-between px-2 mb-1.5 group/cat">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <span className="w-0.5 h-3 rounded-full bg-accent/30 shrink-0" />
                      {isRenaming ? (
                        <form
                          onSubmit={handleRenameSubmit}
                          className="flex items-center gap-1 flex-1 min-w-0"
                        >
                          <input
                            autoFocus
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            maxLength={50}
                            className="flex-1 min-w-0 bg-white/5 border border-accent/30 rounded-md px-1.5 py-0.5 text-[10px] font-mono text-ivory/80 focus:outline-none focus:border-accent/60"
                          />
                          <button
                            type="submit"
                            className="text-accent/60 hover:text-accent"
                            title="Save"
                          >
                            <Check size={11} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setRenamingCat(null)}
                            className="text-ivory/20 hover:text-ivory/50"
                            title="Cancel"
                          >
                            <X size={11} />
                          </button>
                        </form>
                      ) : (
                        <span className="text-[10px] font-mono font-bold tracking-[0.15em] uppercase text-ivory/25 group-hover/cat:text-ivory/40 transition-colors duration-200 truncate">
                          {group.name}
                        </span>
                      )}
                    </div>

                    {/* Hamburger menu (only admin/owner, hidden when renaming) */}
                    {isAdminOrOwner && !isRenaming && (
                      <div className="relative shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuCat(isMenuOpen ? null : group.name);
                          }}
                          title="Category options"
                          className="w-5 h-5 flex items-center justify-center rounded text-ivory/15 hover:text-accent opacity-0 group-hover/cat:opacity-100 transition-all duration-200"
                        >
                          <MoreHorizontal size={13} />
                        </button>

                        {isMenuOpen && (
                          <>
                            {/* backdrop to close */}
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setOpenMenuCat(null)}
                            />
                            <div className="absolute right-0 top-6 z-50 w-44 bg-[#13131c] border border-white/8 rounded-xl shadow-2xl shadow-black/50 overflow-hidden py-1">
                              <button
                                onClick={() => {
                                  setOpenMenuCat(null);
                                  onCreateModule?.(group.name);
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-ivory/60 hover:bg-white/5 hover:text-ivory transition-colors"
                              >
                                <Plus size={13} className="text-accent/70" />
                                Add module
                              </button>
                              <button
                                onClick={() => {
                                  setOpenMenuCat(null);
                                  setRenamingCat(
                                    catEntry || { name: group.name },
                                  );
                                  setRenameValue(group.name);
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-ivory/60 hover:bg-white/5 hover:text-ivory transition-colors"
                              >
                                <Pencil size={13} className="text-ivory/40" />
                                Rename category
                              </button>
                              <div className="my-1 border-t border-white/6" />
                              <button
                                onClick={() => {
                                  setOpenMenuCat(null);
                                  handleDeleteCategory(catEntry);
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-red-400/80 hover:bg-red-500/8 hover:text-red-400 transition-colors"
                              >
                                <Trash2 size={13} />
                                Delete category
                              </button>
                            </div>
                          </>
                        )}
                      </div>
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
                              ? "bg-white/6 text-ivory backdrop-blur-sm"
                              : "hover:bg-white/3 text-ivory/30 hover:text-ivory/60"
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
                            <Lock
                              size={11}
                              className="text-ivory/15 shrink-0"
                            />
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
              );
            })}

            {/* Inline new-category input */}
            {showNewCategory && (
              <form
                onSubmit={handleCreateCategory}
                className="flex items-center gap-1.5 px-2 py-1"
              >
                <span className="w-0.5 h-3 rounded-full bg-accent/30 shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Category name…"
                  maxLength={50}
                  className="flex-1 bg-white/5 border border-accent/30 rounded-lg px-2 py-1 text-[11px] font-mono text-ivory/80 placeholder:text-ivory/20 focus:outline-none focus:border-accent/60 min-w-0"
                />
                <button
                  type="submit"
                  disabled={!newCategoryName.trim() || savingCategory}
                  className="w-6 h-6 rounded-md flex items-center justify-center text-accent/60 hover:text-accent hover:bg-white/6 disabled:opacity-30 transition-all"
                  title="Create"
                >
                  <Check size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewCategory(false);
                    setNewCategoryName("");
                  }}
                  className="w-6 h-6 rounded-md flex items-center justify-center text-ivory/20 hover:text-ivory/50 hover:bg-white/6 transition-all"
                  title="Cancel"
                >
                  <X size={12} />
                </button>
              </form>
            )}

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

      {/* User Profile Modal */}
      {showProfile && (
        <UserProfileModal onClose={() => setShowProfile(false)} />
      )}

      {/* User Status Bar (bottom) */}
      <div className="mx-2 mb-2 p-2.5 glass-card rounded-2xl flex items-center gap-2.5">
        <div
          onClick={() => setShowProfile(true)}
          className="relative shrink-0 cursor-pointer group/av"
        >
          {/* TODO: restore avatar overlay presence dot once socket presence is wired */}
          <div className="w-8 h-8 rounded-xl overflow-hidden ring-1 ring-white/[0.06] group-hover/av:ring-accent/40 transition-all duration-300">
            <Image
              src={
                currentUser?.avatar ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name}`
              }
              width={32}
              height={32}
              className="rounded-xl"
              alt="avatar"
              unoptimized
            />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-deep bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.4)]" />
        </div>
        <div
          onClick={() => setShowProfile(true)}
          className="flex-1 min-w-0 cursor-pointer group/u"
        >
          <p className="text-ivory text-[13px] font-display font-bold truncate leading-tight group-hover/u:text-accent transition-colors duration-200 hover:underline decoration-accent/40 underline-offset-2">
            {currentUser?.name?.split(" ")[0]}
          </p>
          <p className="text-ivory/20 text-[10px] truncate leading-tight flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_4px_rgba(52,211,153,0.4)]" />
            Online
          </p>
        </div>

        <div className="flex items-center gap-0.5 opacity-40 group-hover/user:opacity-80 transition-opacity">
          <button
            onClick={() => onSettingsOpen?.()}
            className="p-1.5 rounded-lg hover:bg-white/6 text-ivory/40 hover:text-ivory/60 transition-all duration-200"
            title="Workspace Settings"
          >
            <Settings size={15} />
          </button>
          <button
            onClick={() => logout()}
            className="p-1.5 rounded-lg hover:bg-white/6 text-ivory/40 hover:text-ivory/60 transition-all duration-200"
            title="Logout"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
