"use client";
import React, { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
import FullUserProfile from "@/components/profile/FullUserProfile";
import VoiceChannelStrip from "@/components/calls/VoiceChannelStrip";
import VoiceChannelBar from "@/components/calls/VoiceChannelBar";

export default function ChannelSidebar({
  selectedWorkspaceId,
  onBack,
  activeModuleId,
  onSettingsOpen, // () => void — opens WorkspaceSettingsPanel
  onCreateModule, // () => void — opens CreateModuleModal (later by Member 6)
  onModuleSettingsOpen, // (moduleId) => void — opens ModuleSettingsModal
  collapsed = false,
}) {
  const { user: currentUser } = useAuth();
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
  const [menuPosition, setMenuPosition] = React.useState({ top: 0, left: 0 });
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

  if (collapsed) return null;

  return (
    <aside className="w-full h-full flex flex-col shrink-0 flex-1 min-h-0 overflow-hidden relative">
      {/* Workspace Header (click to open settings) */}
      <div
        onClick={() => onSettingsOpen?.()}
        className="px-3 py-2 flex items-center justify-between border-b border-white/[0.06] hover:bg-white/[0.03] transition-all duration-200 group relative cursor-pointer shrink-0"
      >
        <h2 className="text-ivory/90 font-display font-bold text-[13px] truncate min-w-0 flex-1 pr-1">
          {workspace?.name || "Workspace"}
        </h2>
        <div className="flex items-center gap-0.5 shrink-0">
          {(workspace?.myRole === "owner" || workspace?.myRole === "admin") && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNewCategory((v) => !v);
                  setNewCategoryName("");
                }}
                title="New category"
                className="w-6 h-6 rounded-md flex items-center justify-center text-ivory/25 hover:text-accent hover:bg-white/[0.06] transition-all shrink-0"
              >
                <FolderPlus size={12} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateModule?.("General");
                }}
                title="New module"
                className="w-6 h-6 rounded-md flex items-center justify-center text-ivory/25 hover:text-accent hover:bg-white/[0.06] transition-all shrink-0"
              >
                <Plus size={13} />
              </button>
            </>
          )}
          <ChevronDown
            size={14}
            className="text-ivory/20 group-hover:text-ivory/50 transition-colors ml-0.5"
          />
        </div>
        <div className="absolute bottom-0 left-3 right-3 h-px bg-linear-to-r from-transparent via-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
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
                            if (isMenuOpen) {
                              setOpenMenuCat(null);
                              return;
                            }

                            const MENU_WIDTH = 176;
                            const MENU_HEIGHT = 132;
                            const EDGE_PADDING = 8;
                            const rect = e.currentTarget.getBoundingClientRect();

                            const left = Math.max(
                              EDGE_PADDING,
                              Math.min(
                                rect.right - MENU_WIDTH,
                                window.innerWidth - MENU_WIDTH - EDGE_PADDING,
                              ),
                            );

                            const shouldOpenUp =
                              rect.bottom + MENU_HEIGHT >
                              window.innerHeight - EDGE_PADDING;

                            const top = shouldOpenUp
                              ? Math.max(EDGE_PADDING, rect.top - MENU_HEIGHT)
                              : Math.min(
                                rect.bottom + 6,
                                window.innerHeight - MENU_HEIGHT - EDGE_PADDING,
                              );

                            setMenuPosition({ top, left });
                            setOpenMenuCat(group.name);
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
                            <div
                              className="fixed z-50 w-44 bg-[#13131c] border border-white/8 rounded-xl shadow-2xl shadow-black/50 overflow-hidden py-1"
                              style={{
                                top: `${menuPosition.top}px`,
                                left: `${menuPosition.left}px`,
                              }}
                            >
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
                      if (mod.type === "voice" || mod.isVoiceChannel) {
                        return (
                          <VoiceChannelStrip
                            key={mod._id}
                            module={mod}
                            workspaceId={selectedWorkspaceId}
                          />
                        );
                      }

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
                          className={`flex items-center gap-2.5 px-2 py-1.75 rounded-xl cursor-pointer group/ch transition-all duration-200 relative ${
                            isActive
                            ? "bg-white/6 text-ivory backdrop-blur-sm"
                            : "hover:bg-white/3 text-ivory/30 hover:text-ivory/60"
                          }`}
                        >
                          {isActive && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.75 h-4 bg-accent rounded-r-full shadow-[0_0_6px_rgba(0,211,187,0.4)]" />
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
                            <span className="text-[10px] font-bold font-mono bg-accent/20 text-accent rounded-full px-1.5 py-0.5 min-w-4.5 text-center">
                              {mod.unreadCount > 99 ? "99+" : mod.unreadCount}
                            </span>
                          )}

                          {isAdminOrOwner && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onModuleSettingsOpen?.(mod._id);
                              }}
                              className="text-ivory/20 hover:text-accent opacity-0 group-hover/ch:opacity-100 transition-all rounded p-1 hover:bg-white/5 absolute right-2"
                            >
                              <Settings size={13} />
                            </button>
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

      {/* Voice Channel Bar — shown above status bar when in a voice channel */}
      <VoiceChannelBar />

      {/* User Status Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-deep border-t border-white/[0.04]">
        <button
          onClick={() => setShowProfile(true)}
          className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/[0.04] transition-colors group"
        >
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-white/10">
              <Image
                src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name}`}
                width={36}
                height={36}
                className="w-full h-full object-cover"
                alt=""
                unoptimized
              />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-deep bg-emerald-400" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-[12px] font-semibold text-ivory/90 truncate">{currentUser?.name}</p>
            <p className="text-[10px] text-ivory/40 truncate">
              {currentUser?.statusMessage || "Online"}
            </p>
          </div>
          <LogOut size={14} className="text-ivory/20 group-hover:text-ivory/50 transition-colors" />
        </button>
      </div>

      {/* User Profile Modal */}
      {showProfile && (
        <FullUserProfile
          user={currentUser}
          isOwnProfile={true}
          onClose={() => setShowProfile(false)}
        />
      )}
    </aside>
  );
}
