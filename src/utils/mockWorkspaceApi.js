// src/utils/mockWorkspaceApi.js
// ── Mock backend for Workspace + Module features (Days 1-5) ──────────────
// Day 6 swap: delete this file and change the import in WorkspaceProvider.jsx
// to the real workspaceService.js (same function names, same return shapes)

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Mock data ──────────────────────────────────────────────────────────────
export const MOCK_WORKSPACES = [
  {
    _id: "ws1",
    name: "Modernize",
    description: "Product and design workspace",
    avatar: null,
    visibility: "private",
    inviteCode: null,
    createdBy: "u1",
    memberCount: 12,
    myRole: "owner",
    categories: [
      { _id: "cat1", name: "Information", position: 0 },
      { _id: "cat2", name: "General",     position: 1 },
      { _id: "cat3", name: "Engineering", position: 2 },
    ],
  },
  {
    _id: "ws2",
    name: "Dev Team",
    description: "Backend and infra team",
    avatar: null,
    visibility: "private",
    inviteCode: null,
    createdBy: "u2",
    memberCount: 7,
    myRole: "admin",
    categories: [
      { _id: "cat4", name: "General", position: 0 },
      { _id: "cat5", name: "Dev",     position: 1 },
    ],
  },
  {
    _id: "ws3",
    name: "Startup Hub",
    description: "Open community workspace",
    avatar: null,
    visibility: "public",
    inviteCode: "abc123xy",
    createdBy: "u3",
    memberCount: 48,
    myRole: "member",
    categories: [
      { _id: "cat6", name: "General",   position: 0 },
      { _id: "cat7", name: "Resources", position: 1 },
    ],
  },
];

export const MOCK_MODULES = {
  ws1: [
    { _id: "mod1", workspaceId: "ws1", name: "announcements", type: "announcement", category: "Information", position: 0, isPrivate: false, unreadCount: 0 },
    { _id: "mod2", workspaceId: "ws1", name: "rules",         type: "text",         category: "Information", position: 1, isPrivate: false, unreadCount: 0 },
    { _id: "mod3", workspaceId: "ws1", name: "chat",          type: "text",         category: "General",     position: 0, isPrivate: false, unreadCount: 3 },
    { _id: "mod4", workspaceId: "ws1", name: "introductions", type: "text",         category: "General",     position: 1, isPrivate: false, unreadCount: 0 },
    { _id: "mod5", workspaceId: "ws1", name: "frontend",      type: "text",         category: "Engineering", position: 0, isPrivate: false, unreadCount: 1 },
    { _id: "mod6", workspaceId: "ws1", name: "backend",       type: "text",         category: "Engineering", position: 1, isPrivate: false, unreadCount: 0 },
  ],
  ws2: [
    { _id: "mod7", workspaceId: "ws2", name: "general",  type: "text", category: "General", position: 0, isPrivate: false, unreadCount: 0 },
    { _id: "mod8", workspaceId: "ws2", name: "devops",   type: "text", category: "Dev",     position: 0, isPrivate: false, unreadCount: 2 },
    { _id: "mod9", workspaceId: "ws2", name: "releases", type: "announcement", category: "Dev", position: 1, isPrivate: false, unreadCount: 0 },
  ],
  ws3: [
    { _id: "mod10", workspaceId: "ws3", name: "welcome",   type: "announcement", category: "General",   position: 0, isPrivate: false, unreadCount: 0 },
    { _id: "mod11", workspaceId: "ws3", name: "open-chat", type: "text",         category: "General",   position: 1, isPrivate: false, unreadCount: 5 },
    { _id: "mod12", workspaceId: "ws3", name: "resources", type: "text",         category: "Resources", position: 0, isPrivate: false, unreadCount: 0 },
  ],
};

// ── Workspace API functions ────────────────────────────────────────────────
export const listMyWorkspaces = async () => {
  await delay(180);
  return MOCK_WORKSPACES;
};

export const getWorkspace = async (id) => {
  await delay(120);
  const ws = MOCK_WORKSPACES.find((w) => w._id === id);
  if (!ws) throw new Error("Workspace not found");
  return ws;
};

export const createWorkspace = async ({ name, description, visibility, avatar }) => {
  await delay(350);
  const newWs = {
    _id: "ws-" + Date.now(),
    name,
    description: description || "",
    avatar: avatar || null,
    visibility: visibility || "private",
    inviteCode: null,
    createdBy: "me",
    memberCount: 1,
    myRole: "owner",
    categories: [{ _id: "cat-default", name: "General", position: 0 }],
  };
  MOCK_WORKSPACES.push(newWs);
  MOCK_MODULES[newWs._id] = [];
  return newWs;
};

export const updateWorkspace = async (id, data) => {
  await delay(200);
  const idx = MOCK_WORKSPACES.findIndex((w) => w._id === id);
  if (idx === -1) throw new Error("Workspace not found");
  Object.assign(MOCK_WORKSPACES[idx], data);
  return MOCK_WORKSPACES[idx];
};

export const deleteWorkspace = async (id) => {
  await delay(300);
  const idx = MOCK_WORKSPACES.findIndex((w) => w._id === id);
  if (idx !== -1) MOCK_WORKSPACES.splice(idx, 1);
  delete MOCK_MODULES[id];
};

export const generateInvite = async (id) => {
  await delay(250);
  const code = Math.random().toString(36).slice(2, 10);
  const ws = MOCK_WORKSPACES.find((w) => w._id === id);
  if (ws) ws.inviteCode = code;
  return { inviteCode: code };
};

export const revokeInvite = async (id) => {
  await delay(200);
  const ws = MOCK_WORKSPACES.find((w) => w._id === id);
  if (ws) ws.inviteCode = null;
};

export const joinViaInvite = async (code) => {
  await delay(400);
  const ws = MOCK_WORKSPACES.find((w) => w.inviteCode === code);
  if (!ws) throw new Error("Invalid or expired invite link");
  return ws;
};

// ── Module API functions ───────────────────────────────────────────────────
export const listModules = async (workspaceId) => {
  await delay(150);
  return MOCK_MODULES[workspaceId] || [];
};

export const createModule = async (workspaceId, { name, type, category, isPrivate }) => {
  await delay(300);
  const list = MOCK_MODULES[workspaceId] || [];
  const newMod = {
    _id: "mod-" + Date.now(),
    workspaceId,
    name,
    type: type || "text",
    category: category || "General",
    position: list.length,
    isPrivate: isPrivate || false,
    unreadCount: 0,
  };
  list.push(newMod);
  MOCK_MODULES[workspaceId] = list;
  return newMod;
};

export const updateModule = async (workspaceId, moduleId, data) => {
  await delay(200);
  const list = MOCK_MODULES[workspaceId] || [];
  const idx = list.findIndex((m) => m._id === moduleId);
  if (idx !== -1) Object.assign(list[idx], data);
  return list[idx];
};

export const deleteModule = async (workspaceId, moduleId) => {
  await delay(250);
  if (MOCK_MODULES[workspaceId]) {
    MOCK_MODULES[workspaceId] = MOCK_MODULES[workspaceId].filter(
      (m) => m._id !== moduleId,
    );
  }
};
