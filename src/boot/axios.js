// src/boot/axios.js
import { boot } from "quasar/wrappers";
import axios from "axios";

const baseURL = import.meta.env.DEV
  ? "http://127.0.0.1:8000/api" // 👈 ajusta si usas proxy "/api"
  : import.meta.env.VITE_API_BASE_URL || "https://api.tu-dominio.com/api";

// 🔧 Instancia de Axios
export const api = axios.create({
  baseURL,
  withCredentials: false,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// ✅ Guardar token en axios + localStorage
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("token", token);
  } else {
    clearAuthToken();
  }
}

// ✅ Borrar token
export function clearAuthToken() {
  delete api.defaults.headers.common["Authorization"];
  localStorage.removeItem("token");
}

// 🔎 Interceptor de request → añade token si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

// 🚨 Interceptor de response → captura 401 y redirige a login
let redirectingToLogin = false;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      try {
        // 🔥 logout desde Pinia
        const { useAuthStore } = await import("src/stores/auth");
        useAuthStore().logout?.();
      } catch {
        clearAuthToken();
      }

      try {
        if (!redirectingToLogin) {
          redirectingToLogin = true;
          const { default: router } = await import("src/router");
          if (router.currentRoute.value.name !== "login") {
            router.push({ name: "login" });
          }
          setTimeout(() => (redirectingToLogin = false), 500);
        }
      } catch {}
    }

    return Promise.reject({
      status,
      data: error?.response?.data,
      message:
        error?.response?.data?.message ||
        error?.message ||
        "Error de red. Intenta de nuevo.",
    });
  }
);

// ⚡ Boot de Quasar
export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;

  const saved = localStorage.getItem("token");
  if (saved) {
    api.defaults.headers.common["Authorization"] = `Bearer ${saved}`;
  }
});
