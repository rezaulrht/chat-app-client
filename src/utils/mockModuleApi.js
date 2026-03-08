// src/utils/mockModuleApi.js
// ── Mock backend for ModuleMessage features (Days 1-3) ──────────────────
// Day 4 swap: delete this file and change the import in ModuleProvider.jsx
// to the real moduleService.js (same function names, same return shapes)

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Per-module message store (in-memory, survives hot reload in dev)
const MODULE_MESSAGES = {};

const seedMessages = (moduleId) => {
  if (MODULE_MESSAGES[moduleId]) return;
  const now = Date.now();
  MODULE_MESSAGES[moduleId] = [
    {
      _id: `msg-seed-1-${moduleId}`,
      moduleId,
      sender: { _id: "u2", name: "Alex R.", avatar: null },
      text: "Hey everyone, welcome to this module! 👋",
      createdAt: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
      reactions: {},
      isDeleted: false,
      isEdited: false,
    },
    {
      _id: `msg-seed-2-${moduleId}`,
      moduleId,
      sender: { _id: "u3", name: "Jamie L.", avatar: null },
      text: "Great to be here. Let's build something awesome.",
      createdAt: new Date(now - 1000 * 60 * 30).toISOString(),
      reactions: { "👍": ["u2"] },
      isDeleted: false,
      isEdited: false,
    },
  ];
};

export const getModuleMessages = async ({
  workspaceId,
  moduleId,
  page = 1,
}) => {
  await delay(200);
  seedMessages(moduleId);
  const all = MODULE_MESSAGES[moduleId] || [];
  const pageSize = 30;
  const start = Math.max(0, all.length - page * pageSize);
  const end = all.length - (page - 1) * pageSize;
  return {
    messages: all.slice(start, end),
    hasMore: start > 0,
    page,
  };
};

export const sendModuleMessage = async ({
  workspaceId,
  moduleId,
  text,
  gifUrl,
  replyTo,
  tempId,
}) => {
  await delay(80);
  seedMessages(moduleId);
  const msg = {
    _id: `msg-${Date.now()}`,
    moduleId,
    workspaceId,
    sender: { _id: "me", name: "You", avatar: null },
    text: text || null,
    gifUrl: gifUrl || null,
    replyTo: replyTo || null,
    createdAt: new Date().toISOString(),
    reactions: {},
    isDeleted: false,
    isEdited: false,
    tempId,
  };
  MODULE_MESSAGES[moduleId].push(msg);
  return msg;
};
