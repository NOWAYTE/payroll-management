import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api",
});

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

// Attach access token if present (localStorage first, then cookie fallback)
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const isRefresh = (config.url || "").includes("/auth/refresh");
    // Don't override explicit Authorization header or attach for refresh endpoint
    const hasAuthHeader = !!config.headers && !!(config.headers as any).Authorization;
    if (!hasAuthHeader && !isRefresh) {
      let token = localStorage.getItem("access_token");
      if (!token) token = getCookie("access_token");
      if (token) {
        config.headers = config.headers || {};
        (config.headers as any).Authorization = `Bearer ${token}`;
      }
    }
  }
  return config;
});

let isRefreshing = false;
let pendingRequests: Array<(t: string | null) => void> = [];

// Bare axios instance without interceptors for refresh
const raw = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api" });

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const status = err?.response?.status;
    const original = err.config;

    if (status === 401 && typeof window !== "undefined" && !(original?.url || "").includes("/auth/refresh")) {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        // no refresh token -> log out
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        document.cookie = "access_token=; Path=/; Max-Age=0; SameSite=Lax";
        if (!window.location.pathname.startsWith("/login")) window.location.href = "/login";
        return Promise.reject(err);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const r = await raw.post("/auth/refresh", null, {
            headers: { Authorization: `Bearer ${refreshToken}` },
          });
          const newAccess = r.data.access_token as string;
          localStorage.setItem("access_token", newAccess);
          document.cookie = `access_token=${newAccess}; Path=/; Max-Age=${60 * 60}; SameSite=Lax`;
          pendingRequests.forEach((cb) => cb(newAccess));
          pendingRequests = [];
          // retry original request with new token
          original.headers = original.headers || {};
          (original.headers as any).Authorization = `Bearer ${newAccess}`;
          return api(original);
        } catch (e) {
          pendingRequests.forEach((cb) => cb(null));
          pendingRequests = [];
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          document.cookie = "access_token=; Path=/; Max-Age=0; SameSite=Lax";
          if (!window.location.pathname.startsWith("/login")) window.location.href = "/login";
          return Promise.reject(e);
        } finally {
          isRefreshing = false;
        }
      } else {
        // queue until refresh resolves, then retry or fail
        return new Promise((resolve, reject) => {
          pendingRequests.push((newToken) => {
            if (!newToken) return reject(err);
            original.headers = original.headers || {};
            (original.headers as any).Authorization = `Bearer ${newToken}`;
            resolve(api(original));
          });
        });
      }
    }

    return Promise.reject(err);
  }
);
