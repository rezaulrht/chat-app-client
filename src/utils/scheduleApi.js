// src/utils/scheduleApi.js
import api from "@/app/api/Axios";

export async function createScheduledMessage({
  conversationId,
  content,
  sendAt,
}) {
  const res = await api.post("/api/messages/schedule", {
    conversationId,
    content,
    sendAt,
  });
  return res.data;
}

export async function listScheduledMessages({ conversationId }) {
  const res = await api.get(
    `/api/messages/scheduled?conversationId=${conversationId}`,
  );
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
