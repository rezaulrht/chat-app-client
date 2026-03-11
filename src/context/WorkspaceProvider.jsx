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
const apiGenerateInvite = (id) =>
  api.post(`/api/workspaces/${id}/invite`).then((r) => r.data);
const apiRevokeInvite = (id) => api.delete(`/api/workspaces/${id}/invite`);
const apiJoinViaInvite = (code) =>
  api.post(`/api/workspaces/join/${code}`).then((r) => r.data);
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
  const generateInvite = useCallback(async (workspaceId) => {
    const { inviteCode } = await apiGenerateInvite(workspaceId);
    setWorkspaces((prev) =>
      prev.map((w) => (w._id === workspaceId ? { ...w, inviteCode } : w)),
    );
    return inviteCode;
  }, []);

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

    socket.on("workspace:updated", onWorkspaceUpdated);
    socket.on("workspace:deleted", onWorkspaceDeleted);
    socket.on("module:created", onModuleCreated);
    socket.on("module:updated", onModuleUpdated);
    socket.on("module:deleted", onModuleDeleted);

    return () => {
      socket.off("workspace:updated", onWorkspaceUpdated);
      socket.off("workspace:deleted", onWorkspaceDeleted);
      socket.off("module:created", onModuleCreated);
      socket.off("module:updated", onModuleUpdated);
      socket.off("module:deleted", onModuleDeleted);
    };
  }, [socket]);

  const value = {
    workspaces,
    loadingWorkspaces,
    modulesCache,
    loadingModules,
    fetchModules,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    generateInvite,
    revokeInvite,
    joinViaInvite,
    createModule,
    updateModule,
    deleteModule,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}
