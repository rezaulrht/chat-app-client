// src/utils/scheduleApi.js
import api from "@/app/api/Axios";

export async function createScheduledMessage({
  conversationId,
  moduleId,
  workspaceId,
  content,
  sendAt,
}) {
  const res = await api.post("/api/messages/schedule", {
    conversationId,
    moduleId,
    workspaceId,
    content,
    sendAt,
  });
  return res.data;
}

export async function listScheduledMessages({ conversationId, moduleId, workspaceId }) {
  let queryParam = "";
  if (conversationId) queryParam = `conversationId=${conversationId}`;
  else if (moduleId) queryParam = `moduleId=${moduleId}`;
  else if (workspaceId) queryParam = `workspaceId=${workspaceId}`;
  
  const res = await api.get(`/api/messages/scheduled?${queryParam}`);
  return res.data;
}

export async function cancelScheduledMessage({ scheduledId }) {
  const res = await api.delete(`/api/messages/scheduled/${scheduledId}`);
  return res.data;
}

export async function editScheduledMessage({ scheduledId, content, sendAt }) {
  const res = await api.patch(`/api/messages/scheduled/${scheduledId}`, {
    content,
    sendAt,
  });
  return res.data;
}
