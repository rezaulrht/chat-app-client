"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { WorkspaceContext } from "./WorkspaceContext";
import { useSocket } from "@/hooks/useSocket";
import toast from "react-hot-toast";
import api from "@/app/api/Axios";

// ── API helpers ──────────────────────────────────────────────────────────────
const listMyWorkspaces = () => api.get("/api/workspaces").then((r) => r.data);
const getWorkspace = (id) => api.get(`/api/workspaces/${id}`).then((r) => r.data);
const apiCreateWorkspace = (d) => api.post("/api/workspaces", d).then((r) => r.data);
const apiUpdateWorkspace = (id, d) => api.patch(`/api/workspaces/${id}`, d).then((r) => r.data);
const apiDeleteWorkspace = (id) => api.delete(`/api/workspaces/${id}`);
const apiGenerateInvite = (id, expiresIn = "never") =>
  api.post(`/api/workspaces/${id}/invite`, { expiresIn }).then((r) => r.data);
const apiRevokeInvite = (id) => api.delete(`/api/workspaces/${id}/invite`);
const apiJoinViaInvite = (code) =>
  api.post(`/api/workspaces/join/${code}`).then((r) => r.data);
const apiGetWorkspaceByInvite = (code) =>
  api.get(`/api/workspaces/invite/${code}`).then((r) => r.data);
const apiJoinPublic = (wsId) =>
  api.post(`/api/workspaces/${wsId}/join-public`).then((r) => r.data);
const apiDiscoverWorkspaces = (query, limit = 20) =>
  api
    .get(`/api/workspaces/discover`, { params: { query, limit } })
    .then((r) => r.data);
const apiAddMembers = (wsId, userIds) =>
  api.post(`/api/workspaces/${wsId}/members`, { userIds }).then((r) => r.data);
const apiRemoveMembers = (wsId, userIds) =>
  api.delete(`/api/workspaces/${wsId}/members`, { data: { userIds } }).then((r) => r.data);
const apiUpdateMemberRole = (wsId, targetUserId, role) =>
  api.patch(`/api/workspaces/${wsId}/members/${targetUserId}/role`, { role }).then((r) => r.data);
const apiAssignRolesToMember = (wsId, targetUserId, roleIds) =>
  api
    .patch(`/api/workspaces/${wsId}/members/${targetUserId}/roles`, { roleIds })
    .then((r) => r.data);
const apiBanMember = (wsId, targetUserId) =>
  api.post(`/api/workspaces/${wsId}/members/${targetUserId}/ban`);
const apiUnbanMember = (wsId, targetUserId) =>
  api.delete(`/api/workspaces/${wsId}/members/${targetUserId}/ban`);
const apiGetBannedUsers = (wsId) =>
  api.get(`/api/workspaces/${wsId}/bans`).then((r) => r.data);

// Role API
const apiCreateRole = (wsId, data) =>
  api.post(`/api/workspaces/${wsId}/roles`, data).then((r) => r.data);
const apiUpdateRole = (wsId, roleId, data) =>
  api.patch(`/api/workspaces/${wsId}/roles/${roleId}`, data).then((r) => r.data);
const apiDeleteRole = (wsId, roleId) =>
  api.delete(`/api/workspaces/${wsId}/roles/${roleId}`);

// Module API
const listModules = (wsId) =>
  api.get(`/api/workspaces/${wsId}/modules`).then((r) => r.data);
const apiCreateModule = (wsId, d) =>
  api.post(`/api/workspaces/${wsId}/modules`, d).then((r) => r.data);
const apiUpdateModule = (wsId, mid, d) =>
  api.patch(`/api/workspaces/${wsId}/modules/${mid}`, d).then((r) => r.data);
const apiDeleteModule = (wsId, mid) =>
  api.delete(`/api/workspaces/${wsId}/modules/${mid}`);

export function WorkspaceProvider({ children }) {
  const { socket } = useSocket() || {};

  const [workspaces, setWorkspaces] = useState([]);
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);

  // modules cache: { [workspaceId]: Module[] }
  const [modulesCache, setModulesCache] = useState({});
  const [loadingModules, setLoadingModules] = useState(false);

  // members cache: { [workspaceId]: { user, role, roleIds, joinedAt }[] }
  const [membersCache, setMembersCache] = useState({});

  // online presence: Set of user IDs that are online
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  // Track fetched workspace IDs to avoid duplicate requests
  const fetchedWorkspaceIds = useRef(new Set());

  // ── Fetch all workspaces on mount ─────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("token");
      if (!token) { setLoadingWorkspaces(false); return; }
      try {
        const data = await listMyWorkspaces();
        setWorkspaces(data);
      } catch (err) {
        console.error("Failed to load workspaces:", err);
        toast.error("Failed to load workspaces");
      } finally {
        setLoadingWorkspaces(false);
      }
    };
    load();
  }, []);

  // ── Fetch modules for a workspace (cached) ────────────────────────────────
  const fetchModules = useCallback(async (workspaceId) => {
    if (!workspaceId) return;
    if (fetchedWorkspaceIds.current.has(workspaceId)) return;
    fetchedWorkspaceIds.current.add(workspaceId);
    setLoadingModules(true);
    try {
      const data = await listModules(workspaceId);
      setModulesCache((prev) => ({ ...prev, [workspaceId]: data }));
    } catch (err) {
      console.error("Failed to load modules:", err);
      fetchedWorkspaceIds.current.delete(workspaceId);
    } finally {
      setLoadingModules(false);
    }
  }, []);

  // ── Workspace CRUD ────────────────────────────────────────────────────────
  const createWorkspace = useCallback(
    async (formData) => {
      const ws = await apiCreateWorkspace(formData);
      setWorkspaces((prev) => [ws, ...prev]);
      if (socket) socket.emit("workspace:join", ws._id);
      return ws;
    },
    [socket],
  );

  const updateWorkspace = useCallback(async (id, data) => {
    const updated = await apiUpdateWorkspace(id, data);
    setWorkspaces((prev) =>
      prev.map((w) => (w._id === id ? { ...w, ...updated } : w)),
    );
    return updated;
  }, []);

  const deleteWorkspace = useCallback(async (id) => {
    if (socket) socket.emit("workspace:leave", id);
    await apiDeleteWorkspace(id);
    setWorkspaces((prev) => prev.filter((w) => w._id !== id));
    setModulesCache((prev) => { const n = { ...prev }; delete n[id]; return n; });
    setMembersCache((prev) => { const n = { ...prev }; delete n[id]; return n; });
    fetchedWorkspaceIds.current.delete(id);
  }, [socket]);

  // ── Discover + Public Join ────────────────────────────────────────────────
  const discoverWorkspaces = useCallback(async (query = "", limit = 20) => {
    return apiDiscoverWorkspaces(query, limit);
  }, []);

  const joinPublicWorkspace = useCallback(
    async (workspaceId) => {
      const ws = await apiJoinPublic(workspaceId);
      setWorkspaces((prev) => {
        if (prev.find((w) => w._id === ws._id)) return prev;
        return [ws, ...prev];
      });
      if (socket) socket.emit("workspace:join", ws._id);
      return ws;
    },
    [socket],
  );

  // ── Invite management ─────────────────────────────────────────────────────
  const generateInvite = useCallback(async (workspaceId, expiresIn = "never") => {
    const data = await apiGenerateInvite(workspaceId, expiresIn);
    setWorkspaces((prev) =>
      prev.map((w) =>
        w._id === workspaceId
          ? { ...w, inviteCode: data.inviteCode, inviteCodeExpiresAt: data.expiresAt }
          : w,
      ),
    );
    return data;
  }, []);

  const revokeInvite = useCallback(async (workspaceId) => {
    await apiRevokeInvite(workspaceId);
    setWorkspaces((prev) =>
      prev.map((w) =>
        w._id === workspaceId ? { ...w, inviteCode: null, inviteCodeExpiresAt: null } : w,
      ),
    );
  }, []);

  const joinViaInvite = useCallback(
    async (code) => {
      const ws = await apiJoinViaInvite(code);
      setWorkspaces((prev) => {
        if (prev.find((w) => w._id === ws._id)) return prev;
        return [ws, ...prev];
      });
      if (socket) socket.emit("workspace:join", ws._id);
      return ws;
    },
    [socket],
  );

  const getWorkspaceByInvite = useCallback(async (code) => {
    return await apiGetWorkspaceByInvite(code);
  }, []);

  const leaveWorkspace = useCallback(async (workspaceId) => {
    if (socket) socket.emit("workspace:leave", workspaceId);
    await api.post(`/api/workspaces/${workspaceId}/leave`);
    setWorkspaces((prev) => prev.filter((w) => w._id !== workspaceId));
    setModulesCache((prev) => { const n = { ...prev }; delete n[workspaceId]; return n; });
    setMembersCache((prev) => { const n = { ...prev }; delete n[workspaceId]; return n; });
    fetchedWorkspaceIds.current.delete(workspaceId);
  }, [socket]);

  // ── Roles CRUD ────────────────────────────────────────────────────────────
  const createRole = useCallback(async (workspaceId, data) => {
    const role = await apiCreateRole(workspaceId, data);
    setWorkspaces((prev) =>
      prev.map((w) => {
        if (w._id === workspaceId) {
          const exists = (w.roles || []).some(r => r._id === role._id);
          if (exists) return w;
          return { ...w, roles: [...(w.roles || []), role] };
        }
        return w;
      })
    );
    return role;
  }, []);

  const updateRole = useCallback(async (workspaceId, roleId, data) => {
    const role = await apiUpdateRole(workspaceId, roleId, data);
    setWorkspaces((prev) =>
      prev.map((w) =>
        w._id === workspaceId
          ? {
              ...w,
              roles: (w.roles || []).map((r) => (r._id === roleId ? role : r)),
            }
          : w,
      ),
    );
    return role;
  }, []);

  const deleteRole = useCallback(async (workspaceId, roleId) => {
    await apiDeleteRole(workspaceId, roleId);
    setWorkspaces((prev) =>
      prev.map((w) =>
        w._id === workspaceId
          ? { ...w, roles: (w.roles || []).filter((r) => r._id !== roleId) }
          : w,
      ),
    );
    // Strip the role from membersCache
    setMembersCache((prev) => {
      if (!prev[workspaceId]) return prev;
      return {
        ...prev,
        [workspaceId]: prev[workspaceId].map((m) => ({
          ...m,
          roleIds: (m.roleIds || []).filter((id) => id !== roleId),
        })),
      };
    });
  }, []);

  const assignRolesToMember = useCallback(
    async (workspaceId, targetUserId, roleIds) => {
      await apiAssignRolesToMember(workspaceId, targetUserId, roleIds);
      setMembersCache((prev) => {
        if (!prev[workspaceId]) return prev;
        return {
          ...prev,
          [workspaceId]: prev[workspaceId].map((m) =>
            m.user._id.toString() === targetUserId ? { ...m, roleIds } : m,
          ),
        };
      });
    },
    [],
  );

  // ── Module CRUD ───────────────────────────────────────────────────────────
  const createModule = useCallback(
    async (workspaceId, data) => {
      const mod = await apiCreateModule(workspaceId, data);
      setModulesCache((prev) => {
        const existing = prev[workspaceId] || [];
        if (existing.find((m) => m._id === mod._id)) return prev;
        return { ...prev, [workspaceId]: [...existing, mod] };
      });
      return mod;
    },
    [socket],
  );

  const updateModule = useCallback(async (workspaceId, moduleId, data) => {
    const updated = await apiUpdateModule(workspaceId, moduleId, data);
    setModulesCache((prev) => ({
      ...prev,
      [workspaceId]: (prev[workspaceId] || []).map((m) =>
        m._id === moduleId ? { ...m, ...updated } : m,
      ),
    }));
    return updated;
  }, []);

  const deleteModule = useCallback(async (workspaceId, moduleId) => {
    await apiDeleteModule(workspaceId, moduleId);
    setModulesCache((prev) => ({
      ...prev,
      [workspaceId]: (prev[workspaceId] || []).filter((m) => m._id !== moduleId),
    }));
  }, []);

  const addCategory = useCallback(async (workspaceId, name) => {
    const category = await api
      .post(`/api/workspaces/${workspaceId}/categories`, { name })
      .then((r) => r.data);
    return category;
  }, []);

  const updateCategory = useCallback(async (workspaceId, categoryId, name) => {
    await api.patch(`/api/workspaces/${workspaceId}/categories/${categoryId}`, { name });
  }, []);

  const deleteCategory = useCallback(async (workspaceId, categoryId) => {
    await api.delete(`/api/workspaces/${workspaceId}/categories/${categoryId}`);
  }, []);

  // ── Member management ─────────────────────────────────────────────────────
  const fetchWorkspaceMembers = useCallback(async (workspaceId) => {
    if (!workspaceId) return [];
    try {
      const data = await getWorkspace(workspaceId);
      const members = data.members || [];
      setMembersCache((prev) => ({ ...prev, [workspaceId]: members }));
      // Also sync roles from the workspace data
      setWorkspaces((prev) =>
        prev.map((w) =>
          w._id === workspaceId ? { ...w, roles: data.roles || [] } : w,
        ),
      );
      return members;
    } catch (err) {
      console.error("Failed to load members:", err);
      return [];
    }
  }, []);

  const addMembers = useCallback(async (workspaceId, userIds) => {
    return apiAddMembers(workspaceId, userIds);
  }, []);

  const removeMembers = useCallback(async (workspaceId, userIds) => {
    return apiRemoveMembers(workspaceId, userIds);
  }, []);

  const updateMemberRole = useCallback(async (workspaceId, targetUserId, role) => {
    return apiUpdateMemberRole(workspaceId, targetUserId, role);
  }, []);

  const banMember = useCallback(async (workspaceId, userId) => {
    await apiBanMember(workspaceId, userId);
    setMembersCache((prev) => {
      if (!prev[workspaceId]) return prev;
      return {
        ...prev,
        [workspaceId]: prev[workspaceId].filter(
          (m) => m.user._id.toString() !== userId,
        ),
      };
    });
  }, []);

  const unbanMember = useCallback(async (workspaceId, userId) => {
    await apiUnbanMember(workspaceId, userId);
  }, []);

  const getBannedUsers = useCallback(async (workspaceId) => {
    return apiGetBannedUsers(workspaceId);
  }, []);

  // ── Socket: workspace + module live events ────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const onWorkspaceUpdated = (payload) => {
      // Payload can be { workspace } or the flat updated fields
      const updated = payload.workspace || payload;
      setWorkspaces((prev) =>
        prev.map((w) => (w._id === (updated._id || updated.workspaceId) ? { ...w, ...updated } : w)),
      );
    };

    const onWorkspaceDeleted = ({ workspaceId }) => {
      setWorkspaces((prev) => prev.filter((w) => w._id !== workspaceId));
      setModulesCache((prev) => { const n = { ...prev }; delete n[workspaceId]; return n; });
      setMembersCache((prev) => { const n = { ...prev }; delete n[workspaceId]; return n; });
    };

    const onModuleCreated = ({ module }) => {
      if (!module?.workspaceId) return;
      setModulesCache((prev) => {
        const existing = prev[module.workspaceId] || [];
        if (existing.find((m) => m._id === module._id)) return prev;
        return { ...prev, [module.workspaceId]: [...existing, module] };
      });
    };

    const onModuleUpdated = ({ module }) => {
      if (!module?.workspaceId) return;
      setModulesCache((prev) => ({
        ...prev,
        [module.workspaceId]: (prev[module.workspaceId] || []).map((m) =>
          m._id === module._id ? { ...m, ...module } : m,
        ),
      }));
    };

    const onModuleDeleted = ({ moduleId, workspaceId }) => {
      setModulesCache((prev) => ({
        ...prev,
        [workspaceId]: (prev[workspaceId] || []).filter((m) => m._id !== moduleId),
      }));
    };

    const onCategoryAdded = ({ workspaceId, category }) => {
      setWorkspaces((prev) =>
        prev.map((w) => {
          if (w._id !== workspaceId) return w;
          const already = (w.categories || []).some(
            (c) => c._id?.toString() === category._id?.toString(),
          );
          if (already) return w;
          return { ...w, categories: [...(w.categories || []), category] };
        }),
      );
    };

    const onCategoryUpdated = ({ workspaceId, category }) => {
      setWorkspaces((prev) =>
        prev.map((w) => {
          if (w._id !== workspaceId) return w;
          return {
            ...w,
            categories: (w.categories || []).map((c) =>
              c._id?.toString() === category._id?.toString() ? category : c,
            ),
          };
        }),
      );
    };

    const onCategoryDeleted = ({ workspaceId, categoryId }) => {
      setWorkspaces((prev) =>
        prev.map((w) => {
          if (w._id !== workspaceId) return w;
          return {
            ...w,
            categories: (w.categories || []).filter(
              (c) => c._id?.toString() !== categoryId?.toString(),
            ),
          };
        }),
      );
    };

    const onMention = ({ message, workspaceName, moduleName }) => {
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-in fade-in slide-in-from-top-4' : 'animate-out fade-out slide-out-to-top-4'} max-w-sm w-full bg-obsidian border border-accent/30 shadow-2xl rounded-xl p-4 flex flex-col gap-2 pointer-events-auto`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-accent">New Mention</span>
            </div>
            <span className="text-[10px] font-medium text-ivory/40">in {workspaceName} &gt; #{moduleName}</span>
          </div>
          <div className="flex gap-3 items-start">
            <img 
              src={message.sender?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.sender?.name}`}
              className="w-10 h-10 rounded-full border border-white/10"
              alt=""
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-ivory truncate">{message.sender?.name}</p>
              <p className="text-xs text-ivory/60 line-clamp-2 leading-relaxed">
                {message.text}
              </p>
            </div>
          </div>
        </div>
      ), {
        duration: 6000,
        position: 'top-right',
      });
    };

    const onMemberJoined = ({ workspaceId, newMembers }) => {
      setWorkspaces((prev) =>
        prev.map((w) =>
          w._id === workspaceId
            ? { ...w, memberCount: (w.memberCount || 0) + (newMembers?.length || 1) }
            : w,
        ),
      );
      setMembersCache((prev) => {
        if (!prev[workspaceId]) return prev;
        const existingIds = new Set(prev[workspaceId].map((m) => m.user._id.toString()));
        const toAdd = (newMembers || [])
          .filter((u) => !existingIds.has(u._id.toString()))
          .map((u) => ({ user: u, role: "member", roleIds: [], joinedAt: new Date().toISOString() }));
        if (!toAdd.length) return prev;
        return { ...prev, [workspaceId]: [...prev[workspaceId], ...toAdd] };
      });
    };

    const onMemberLeft = ({ workspaceId, removedUserIds }) => {
      setWorkspaces((prev) =>
        prev.map((w) =>
          w._id === workspaceId
            ? { ...w, memberCount: Math.max(0, (w.memberCount || 0) - (removedUserIds?.length || 1)) }
            : w,
        ),
      );
      setMembersCache((prev) => {
        if (!prev[workspaceId]) return prev;
        const idSet = new Set((removedUserIds || []).map(String));
        return {
          ...prev,
          [workspaceId]: prev[workspaceId].filter((m) => !idSet.has(m.user._id.toString())),
        };
      });
    };

    const onRoleUpdated = ({ workspaceId, targetUserId, newRole }) => {
      setMembersCache((prev) => {
        if (!prev[workspaceId]) return prev;
        return {
          ...prev,
          [workspaceId]: prev[workspaceId].map((m) =>
            m.user._id.toString() === targetUserId ? { ...m, role: newRole } : m,
          ),
        };
      });
    };

    // Custom role created/updated/deleted
    const onCustomRoleCreated = ({ workspaceId, role }) => {
      setWorkspaces((prev) =>
        prev.map((w) => {
          if (w._id === workspaceId) {
            const exists = (w.roles || []).some((r) => r._id === role._id);
            if (exists) return w;
            return { ...w, roles: [...(w.roles || []), role] };
          }
          return w;
        })
      );
    };
    const onCustomRoleUpdated = ({ workspaceId, role }) => {
      setWorkspaces((prev) =>
        prev.map((w) =>
          w._id === workspaceId
            ? { ...w, roles: (w.roles || []).map((r) => (r._id === role._id ? role : r)) }
            : w,
        ),
      );
    };
    const onCustomRoleDeleted = ({ workspaceId, roleId }) => {
      setWorkspaces((prev) =>
        prev.map((w) =>
          w._id === workspaceId
            ? { ...w, roles: (w.roles || []).filter((r) => r._id !== roleId) }
            : w,
        ),
      );
      setMembersCache((prev) => {
        if (!prev[workspaceId]) return prev;
        return {
          ...prev,
          [workspaceId]: prev[workspaceId].map((m) => ({
            ...m,
            roleIds: (m.roleIds || []).filter((id) => id !== roleId),
          })),
        };
      });
    };

    const onMemberRolesUpdated = ({ workspaceId, targetUserId, roleIds }) => {
      setMembersCache((prev) => {
        if (!prev[workspaceId]) return prev;
        return {
          ...prev,
          [workspaceId]: prev[workspaceId].map((m) =>
            m.user._id.toString() === targetUserId ? { ...m, roleIds } : m,
          ),
        };
      });
    };

    const onOwnerTransferred = ({ workspaceId, newOwnerId }) => {
      setMembersCache((prev) => {
        if (!prev[workspaceId]) return prev;
        return {
          ...prev,
          [workspaceId]: prev[workspaceId].map((m) => {
            if (m.role === "owner") return { ...m, role: "member" };
            if (m.user._id.toString() === newOwnerId) return { ...m, role: "owner" };
            return m;
          }),
        };
      });
    };

    const onKicked = ({ workspaceId }) => {
      setWorkspaces((prev) => prev.filter((w) => w._id !== workspaceId));
      setModulesCache((prev) => { const n = { ...prev }; delete n[workspaceId]; return n; });
      setMembersCache((prev) => { const n = { ...prev }; delete n[workspaceId]; return n; });
      fetchedWorkspaceIds.current.delete(workspaceId);
    };

    // Online presence
    const onPresenceOnline = ({ userId }) => {
      setOnlineUsers((prev) => new Set([...prev, userId]));
    };
    const onPresenceOffline = ({ userId }) => {
      setOnlineUsers((prev) => { const n = new Set(prev); n.delete(userId); return n; });
    };

    socket.on("workspace:updated", onWorkspaceUpdated);
    socket.on("workspace:deleted", onWorkspaceDeleted);
    socket.on("module:created", onModuleCreated);
    socket.on("module:updated", onModuleUpdated);
    socket.on("module:deleted", onModuleDeleted);
    socket.on("workspace:category-added", onCategoryAdded);
    socket.on("workspace:category-updated", onCategoryUpdated);
    socket.on("workspace:category-deleted", onCategoryDeleted);
    socket.on("workspace:member-joined", onMemberJoined);
    socket.on("workspace:member-left", onMemberLeft);
    socket.on("workspace:role-updated", onRoleUpdated);
    socket.on("workspace:role-created", onCustomRoleCreated);
    socket.on("workspace:role-updated-custom", onCustomRoleUpdated);
    socket.on("workspace:role-deleted-custom", onCustomRoleDeleted);
    socket.on("workspace:member-roles-updated", onMemberRolesUpdated);
    socket.on("workspace:owner-transferred", onOwnerTransferred);
    socket.on("workspace:kicked", onKicked);
    socket.on("user:online", onPresenceOnline);
    socket.on("user:offline", onPresenceOffline);
    socket.on("module:mention", onMention);

    return () => {
      socket.off("workspace:updated", onWorkspaceUpdated);
      socket.off("workspace:deleted", onWorkspaceDeleted);
      socket.off("module:created", onModuleCreated);
      socket.off("module:updated", onModuleUpdated);
      socket.off("module:deleted", onModuleDeleted);
      socket.off("workspace:category-added", onCategoryAdded);
      socket.off("workspace:category-updated", onCategoryUpdated);
      socket.off("workspace:category-deleted", onCategoryDeleted);
      socket.off("workspace:member-joined", onMemberJoined);
      socket.off("workspace:member-left", onMemberLeft);
      socket.off("workspace:role-updated", onRoleUpdated);
      socket.off("workspace:role-created", onCustomRoleCreated);
      socket.off("workspace:role-updated-custom", onCustomRoleUpdated);
      socket.off("workspace:role-deleted-custom", onCustomRoleDeleted);
      socket.off("workspace:member-roles-updated", onMemberRolesUpdated);
      socket.off("workspace:owner-transferred", onOwnerTransferred);
      socket.off("workspace:kicked", onKicked);
      socket.off("user:online", onPresenceOnline);
      socket.off("user:offline", onPresenceOffline);
      socket.off("module:mention", onMention);
    };
  }, [socket]);

  const value = {
    workspaces,
    loadingWorkspaces,
    modulesCache,
    loadingModules,
    membersCache,
    onlineUsers,
    fetchModules,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    discoverWorkspaces,
    joinPublicWorkspace,
    generateInvite,
    revokeInvite,
    joinViaInvite,
    getWorkspaceByInvite,
    leaveWorkspace,
    createRole,
    updateRole,
    deleteRole,
    assignRolesToMember,
    createModule,
    updateModule,
    deleteModule,
    addCategory,
    updateCategory,
    deleteCategory,
    fetchWorkspaceMembers,
    addMembers,
    removeMembers,
    updateMemberRole,
    banMember,
    unbanMember,
    getBannedUsers,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}
