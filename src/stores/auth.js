// src/stores/auth.js
import { defineStore } from "pinia";
import { api, setAuthToken, clearAuthToken } from "boot/axios";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("token") || null,
    user: null,
    needsRole: false,
  }),

  getters: {
    isAuthed: (s) => !!s.token,
    isProfessor: (s) => s.user?.rol_id === 2, // 👈 Profesor
    isStudent: (s) => s.user?.rol_id === 1, // 👈 Estudiante
  },

  actions: {
    // 🔑 Guardar sesión después de login/register
    setSession({ token, user, needs_role }) {
      this.token = token || null;

      // Normalizamos el objeto user
      this.user = user
        ? {
            ...user,
            rol_id: user.idrol || user.rol_id || null,
          }
        : null;

      this.needsRole = !!needs_role;

      if (this.token) setAuthToken(this.token);
      else clearAuthToken();
    },

    // 🚪 Limpiar sesión
    clear() {
      this.token = null;
      this.user = null;
      this.needsRole = false;
      clearAuthToken();
    },

    logout() {
      this.clear();
    },

    // 🚀 Inicializa sesión al recargar la app
    async init() {
      if (!this.token) return;
      try {
        await this.fetchMe();
      } catch {
        this.clear();
      }
    },

    // 👤 Refrescar datos del usuario autenticado
    async fetchMe() {
      const { data } = await api.get("/me");

      this.user = data
        ? {
            ...data,
            rol_id: data.idrol || data.rol_id || null,
          }
        : null;

      return this.user;
    },

    // 📌 Ejemplo de login directo (opcional)
    async login(credentials) {
      const { data } = await api.post("/login", credentials);
      this.setSession({
        token: data.token,
        user: data.user,
        needs_role: data.needs_role,
      });
      return data;
    },
  },
});
