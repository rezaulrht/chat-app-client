// src/utils/scheduleApi.js
const API = process.env.NEXT_PUBLIC_API_URL; // e.g. http://localhost:5000

function authHeaders(token) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function createScheduledMessage({
  token,
  conversationId,
  content,
  sendAt,
}) {
  const res = await fetch(`${API}/api/messages/schedule`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ conversationId, content, sendAt }),
  });
  const data = await res.json();
  if (!res.ok)
    throw new Error(data?.error || data?.message || "Failed to schedule");
  return data;
}

export async function listScheduledMessages({ token, conversationId }) {
  const res = await fetch(
    `${API}/api/messages/scheduled?conversationId=${conversationId}`,
    {
      headers: authHeaders(token),
    },
  );
  const data = await res.json();
  if (!res.ok)
    throw new Error(data?.error || data?.message || "Failed to load scheduled");
  return data;
}

export async function cancelScheduledMessage({ token, scheduledId }) {
  const res = await fetch(`${API}/api/messages/scheduled/${scheduledId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  const data = await res.json();
  if (!res.ok)
    throw new Error(data?.error || data?.message || "Failed to cancel");
  return data;
}

export async function editScheduledMessage({
  token,
  scheduledId,
  content,
  sendAt,
}) {
  const res = await fetch(`${API}/api/messages/scheduled/${scheduledId}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ content, sendAt }),
  });
  const data = await res.json();
  if (!res.ok)
    throw new Error(data?.error || data?.message || "Failed to edit");
  return data;
}
