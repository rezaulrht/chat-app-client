"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { WorkspaceContext } from "./WorkspaceContext";
import { useSocket } from "@/hooks/useSocket";
import toast from "react-hot-toast";

import api from "@/app/api/Axios";
const listMyWorkspaces = () => api.get("/api/workspaces").then((r) => r.data);
const getWorkspace = (id) =>
  api.get(`/api/workspaces/${id}`).then((r) => r.data);
const apiCreateWorkspace = (d) =>
  api.post("/api/workspaces", d).then((r) => r.data);
const apiUpdateWorkspace = (id, d) =>
  api.patch(`/api/workspaces/${id}`, d).then((r) => r.data);
const apiDeleteWorkspace = (id) => api.delete(`/api/workspaces/${id}`);
const apiGenerateInvite = (id, expiresIn = "never") =>
  api.post(`/api/workspaces/${id}/invite`, { expiresIn }).then((r) => r.data);
const apiRevokeInvite = (id) => api.delete(`/api/workspaces/${id}/invite`);
const apiJoinViaInvite = (code) =>
  api.post(`/api/workspaces/join/${code}`).then((r) => r.data);
const apiAddMembers = (wsId, userIds) =>
  api.post(`/api/workspaces/${wsId}/members`, { userIds }).then((r) => r.data);
const apiRemoveMembers = (wsId, userIds) =>
  api
    .delete(`/api/workspaces/${wsId}/members`, { data: { userIds } })
    .then((r) => r.data);
const apiUpdateMemberRole = (wsId, targetUserId, role) =>
  api
    .patch(`/api/workspaces/${wsId}/members/${targetUserId}/role`, { role })
    .then((r) => r.data);
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

  // members cache: { [workspaceId]: { user, role, joinedAt, nickname }[] }
  const [membersCache, setMembersCache] = useState({});

  // Track which workspaceId we've already fetched (avoid duplicate requests)
  const fetchedWorkspaceIds = useRef(new Set());

  // ── Fetch all workspaces on mount ────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
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

  // ── Fetch modules for a workspace (cached) ───────────────────────────────
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
      fetchedWorkspaceIds.current.delete(workspaceId); // allow retry
    } finally {
      setLoadingModules(false);
    }
  }, []);

  // ── Workspace CRUD ───────────────────────────────────────────────────────
  const createWorkspace = useCallback(async (formData) => {
    const ws = await apiCreateWorkspace(formData);
    setWorkspaces((prev) => [ws, ...prev]);
    return ws;
  }, []);

  const updateWorkspace = useCallback(async (id, data) => {
    const updated = await apiUpdateWorkspace(id, data);
    setWorkspaces((prev) =>
      prev.map((w) => (w._id === id ? { ...w, ...updated } : w)),
    );
    return updated;
  }, []);

  const deleteWorkspace = useCallback(async (id) => {
    await apiDeleteWorkspace(id);
    setWorkspaces((prev) => prev.filter((w) => w._id !== id));
    setModulesCache((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    fetchedWorkspaceIds.current.delete(id);
  }, []);

  // ── Invite management ────────────────────────────────────────────────────
  const generateInvite = useCallback(
    async (workspaceId, expiresIn = "never") => {
      const { inviteCode } = await apiGenerateInvite(workspaceId, expiresIn);
      setWorkspaces((prev) =>
        prev.map((w) => (w._id === workspaceId ? { ...w, inviteCode } : w)),
      );
      return inviteCode;
    },
    [],
  );

  const revokeInvite = useCallback(async (workspaceId) => {
    await apiRevokeInvite(workspaceId);
    setWorkspaces((prev) =>
      prev.map((w) => (w._id === workspaceId ? { ...w, inviteCode: null } : w)),
    );
  }, []);

  const joinViaInvite = useCallback(async (code) => {
    const ws = await apiJoinViaInvite(code);
    setWorkspaces((prev) => {
      if (prev.find((w) => w._id === ws._id)) return prev;
      return [ws, ...prev];
    });
    return ws;
  }, []);

  const leaveWorkspace = useCallback(async (workspaceId) => {
    await api.post(`/api/workspaces/${workspaceId}/leave`);
    setWorkspaces((prev) => prev.filter((w) => w._id !== workspaceId));
    setModulesCache((prev) => {
      const next = { ...prev };
      delete next[workspaceId];
      return next;
    });
    fetchedWorkspaceIds.current.delete(workspaceId);
  }, []);

  // ── Module CRUD ──────────────────────────────────────────────────────────
  const createModule = useCallback(async (workspaceId, data) => {
    const mod = await apiCreateModule(workspaceId, data);
    setModulesCache((prev) => ({
      ...prev,
      [workspaceId]: [...(prev[workspaceId] || []), mod],
    }));
    return mod;
  }, []);

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
      [workspaceId]: (prev[workspaceId] || []).filter(
        (m) => m._id !== moduleId,
      ),
    }));
  }, []);

  const addCategory = useCallback(async (workspaceId, name) => {
    const category = await api
      .post(`/api/workspaces/${workspaceId}/categories`, { name })
      .then((r) => r.data);
    return category;
  }, []);

  const updateCategory = useCallback(async (workspaceId, categoryId, name) => {
    await api.patch(`/api/workspaces/${workspaceId}/categories/${categoryId}`, {
      name,
    });
    // socket event workspace:category-updated handles state update
  }, []);

  const deleteCategory = useCallback(async (workspaceId, categoryId) => {
    await api.delete(`/api/workspaces/${workspaceId}/categories/${categoryId}`);
    // socket event workspace:category-deleted handles state update
  }, []);

  // ── Member management ────────────────────────────────────────────────────
  const fetchWorkspaceMembers = useCallback(async (workspaceId) => {
    if (!workspaceId) return [];
    try {
      const data = await getWorkspace(workspaceId);
      const members = data.members || [];
      setMembersCache((prev) => ({ ...prev, [workspaceId]: members }));
      return members;
    } catch (err) {
      console.error("Failed to load members:", err);
      return [];
    }
  }, []);

  const addMembers = useCallback(async (workspaceId, userIds) => {
    const result = await apiAddMembers(workspaceId, userIds);
    // socket workspace:member-joined updates membersCache + memberCount
    return result;
  }, []);

  const removeMembers = useCallback(async (workspaceId, userIds) => {
    const result = await apiRemoveMembers(workspaceId, userIds);
    // socket workspace:member-left updates membersCache + memberCount
    return result;
  }, []);

  const updateMemberRole = useCallback(
    async (workspaceId, targetUserId, role) => {
      const result = await apiUpdateMemberRole(workspaceId, targetUserId, role);
      // socket workspace:role-updated updates membersCache
      return result;
    },
    [],
  );

  // ── Socket: workspace + module live events ───────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const onWorkspaceUpdated = ({ workspace }) => {
      setWorkspaces((prev) =>
        prev.map((w) => (w._id === workspace._id ? { ...w, ...workspace } : w)),
      );
    };

    const onWorkspaceDeleted = ({ workspaceId }) => {
      setWorkspaces((prev) => prev.filter((w) => w._id !== workspaceId));
      setModulesCache((prev) => {
        const next = { ...prev };
        delete next[workspaceId];
        return next;
      });
    };

    const onModuleCreated = ({ module }) => {
      setModulesCache((prev) => {
        const existing = prev[module.workspaceId] || [];
        if (existing.find((m) => m._id === module._id)) return prev;
        return { ...prev, [module.workspaceId]: [...existing, module] };
      });
    };

    const onModuleUpdated = ({ module }) => {
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
        [workspaceId]: (prev[workspaceId] || []).filter(
          (m) => m._id !== moduleId,
        ),
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

    const onMemberJoined = ({ workspaceId, newMembers }) => {
      setWorkspaces((prev) =>
        prev.map((w) =>
          w._id === workspaceId
            ? {
                ...w,
                memberCount: (w.memberCount || 0) + (newMembers?.length || 0),
              }
            : w,
        ),
      );
      setMembersCache((prev) => {
        if (!prev[workspaceId]) return prev;
        const existingIds = new Set(
          prev[workspaceId].map((m) => m.user._id.toString()),
        );
        const toAdd = (newMembers || [])
          .filter((u) => !existingIds.has(u._id.toString()))
          .map((u) => ({
            user: u,
            role: "member",
            joinedAt: new Date().toISOString(),
          }));
        if (!toAdd.length) return prev;
        return { ...prev, [workspaceId]: [...prev[workspaceId], ...toAdd] };
      });
    };

    const onMemberLeft = ({ workspaceId, removedUserIds }) => {
      setWorkspaces((prev) =>
        prev.map((w) =>
          w._id === workspaceId
            ? {
                ...w,
                memberCount: Math.max(
                  0,
                  (w.memberCount || 0) - (removedUserIds?.length || 0),
                ),
              }
            : w,
        ),
      );
      setMembersCache((prev) => {
        if (!prev[workspaceId]) return prev;
        const idSet = new Set((removedUserIds || []).map(String));
        return {
          ...prev,
          [workspaceId]: prev[workspaceId].filter(
            (m) => !idSet.has(m.user._id.toString()),
          ),
        };
      });
    };

    const onRoleUpdated = ({ workspaceId, targetUserId, newRole }) => {
      setMembersCache((prev) => {
        if (!prev[workspaceId]) return prev;
        return {
          ...prev,
          [workspaceId]: prev[workspaceId].map((m) =>
            m.user._id.toString() === targetUserId
              ? { ...m, role: newRole }
              : m,
          ),
        };
      });
    };

    const onKicked = ({ workspaceId }) => {
      setWorkspaces((prev) => prev.filter((w) => w._id !== workspaceId));
      setModulesCache((prev) => {
        const next = { ...prev };
        delete next[workspaceId];
        return next;
      });
      setMembersCache((prev) => {
        const next = { ...prev };
        delete next[workspaceId];
        return next;
      });
      fetchedWorkspaceIds.current.delete(workspaceId);
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
    socket.on("workspace:kicked", onKicked);

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
      socket.off("workspace:kicked", onKicked);
    };
  }, [socket]);

  const value = {
    workspaces,
    loadingWorkspaces,
    modulesCache,
    loadingModules,
    membersCache,
    fetchModules,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    generateInvite,
    revokeInvite,
    joinViaInvite,
    leaveWorkspace,
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
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}
