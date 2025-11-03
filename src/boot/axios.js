// src/boot/axios.js
import { boot } from "quasar/wrappers";
import axios from "axios";

const baseURL = import.meta.env.DEV
  ? "http://127.0.0.1:8000/api"
  : import.meta.env.VITE_API_BASE_URL || "https://api.tu-dominio.com/api";

// 🔧 Instancia principal de Axios
export const api = axios.create({
  baseURL,
  withCredentials: false,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// ✅ Guardar token
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

// 🔎 Interceptor de request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

// 🚨 Interceptor de response
let redirectingToLogin = false;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || "";

    // ⚠️ 1️⃣ Ignorar 401 del logout → no hacer nada
    if (status === 401 && url.includes("/logout")) {
      console.info("[AUTH] Logout ya procesado, ignorando 401.");
      return Promise.resolve({ data: { message: "Sesión cerrada" } });
    }

    // ⚠️ 2️⃣ Cualquier otro 401 → sesión inválida o expirada
    if (status === 401) {
      console.warn("[AUTH] Sesión expirada o no autorizada.");

      try {
        const { useAuthStore } = await import("src/stores/auth");
        const auth = useAuthStore();

        if (auth.token) {
          auth.clear(); // Limpia el store
        } else {
          clearAuthToken();
        }
      } catch (e) {
        console.error("[AUTH] Error limpiando sesión tras 401:", e);
        clearAuthToken();
      }

      // 🚪 Redirigir solo una vez al login
      if (!redirectingToLogin) {
        redirectingToLogin = true;
        try {
          const { default: router } = await import("src/router");
          if (router.currentRoute.value.name !== "login") {
            router.replace({ name: "login" });
          }
        } catch (e) {
          console.error("[AUTH] Error redirigiendo al login:", e);
        } finally {
          setTimeout(() => (redirectingToLogin = false), 600);
        }
      }
    }

    // 🧩 Retornar error formateado
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
