// api.js — all backend calls in one place
// import from this file instead of writing fetch() inline

const BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:3006";

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json();
}

async function patch(path) {
  const res = await fetch(`${BASE}${path}`, { method: "PATCH" });
  if (!res.ok) throw new Error(`PATCH ${path} failed: ${res.status}`);
  return res.json();
}

// ── Users ────────────────────────────────────────────
export const fetchContacts     = (userId)       => get(`/users/${userId}/contacts`);

// ── Chat ─────────────────────────────────────────────
export const fetchRooms        = (userId)       => get(`/chat/rooms/${userId}`);
export const fetchMessages     = (roomId, limit=50, offset=0) =>
  get(`/chat/messages/${roomId}?limit=${limit}&offset=${offset}`);
export const fetchSharedFiles  = (roomId)       => get(`/chat/files/${roomId}`);
export const fetchChatStats    = (userId)       => get(`/chat/stats/${userId}`);
export const fetchMeetings     = (userId)       => get(`/chat/meetings/${userId}`);
export const markRoomRead      = (roomId, userId) =>
  post(`/chat/read`, { roomId, userId });

export const createRoom = (name, memberIds, createdBy) =>
  post(`/chat/rooms`, { name, memberIds, createdBy });

// ── Notifications ─────────────────────────────────────
export const fetchNotifications = (userId)      => get(`/notifications/${userId}`);
export const markAllNotifsRead  = (userId)      => patch(`/notifications/${userId}/read-all`);
export const markOneNotifRead   = (id)          => patch(`/notifications/${id}/read`);

// ── Meetings ──────────────────────────────────────────
export const createMeeting = (title) =>
  post(`/meeting/create`, { title });

// ── Media ─────────────────────────────────────────────
export async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE}/media/upload`, { method: "POST", body: formData });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return res.json();
}
