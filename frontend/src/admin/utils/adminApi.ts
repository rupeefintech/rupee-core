import axios from "axios";

const ADMIN_TOKEN_KEY = "adminToken";
const PROD_BACKEND = "https://rupeepedia-backend.onrender.com/api";

function buildAdminApiBase(): string {
  if (import.meta.env.PROD) return PROD_BACKEND;
  const raw = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  if (!raw) return "/api";
  if (raw.startsWith("/")) return raw.replace(/\/+$/, "") || "/api";
  const base = raw.replace(/\/+$/, "");
  return base.endsWith("/api") ? base : `${base}/api`;
}

export const adminApi = axios.create({
  baseURL: buildAdminApiBase(),
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// Attach token to every request
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to login on 401/403
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  }
);

export function setAdminToken(token: string) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function clearAdminToken() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export function isAdminAuthenticated(): boolean {
  return Boolean(localStorage.getItem(ADMIN_TOKEN_KEY));
}
