import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
});

export const authService = {
  // POST /api/auth/register
  register: async (formData) => {
    const res = await API.post("/auth/register", formData);
    return res.data;
  },

  // POST /api/auth/login
  login: async (email, password) => {
    const res = await API.post("/auth/login", { email, password });
    return res.data;
  },

  // GET /api/auth/me  (protected)
  getMe: async (token) => {
    const res = await API.get("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // POST /api/auth/logout (protected)
  logout: async (token) => {
    const res = await API.post(
      "/auth/logout",
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  },

  // POST /api/auth/change-password (protected)
  changePassword: async (token, oldPassword, newPassword) => {
    const res = await API.post(
      "/auth/change-password",
      { oldPassword, newPassword },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  },
};