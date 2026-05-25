import axios from "axios";
import { auth } from "./firebase";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8082";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { "Content-Type": "application/json" },
});

// Attach Firebase ID token to every request if user is logged in
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    try {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    } catch (err) {
      console.error("Failed to get Firebase ID token:", err);
    }
  }
  return config;
});

// Auto-logout UI redirect on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      auth.signOut().then(() => {
        if (window.location.pathname.startsWith("/admin") && !window.location.pathname.includes("/login")) {
          window.location.href = "/admin/login";
        }
      });
    }
    return Promise.reject(error);
  }
);

export default api;
