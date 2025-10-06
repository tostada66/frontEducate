// src/stores/auth.js
import { defineStore } from "pinia";
import { api, setAuthToken, clearAuthToken } from "boot/axios";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("token") || null,
    user: null,
    needsRole: false,
    isReady: false, // 👈 Nuevo: controla cuándo está lista la sesión
  }),

  getters: {
    isAuthed: (s) => !!s.token,
    isProfessor: (s) => s.user?.idrol === 2, // 👨‍🏫 Profesor
    isStudent: (s) => s.user?.idrol === 1, // 🎓 Estudiante
    isAdmin: (s) => s.user?.idrol === 3, // 🛠️ Administrador

    // 👉 Verifica si hay suscripción activa
    hasSubscription: (s) =>
      !!s.user?.suscripcion_activa && new Date(s.user?.fecha_fin) > new Date(),
  },

  actions: {
    /**
     * 🧩 Guardar sesión local
     */
    setSession({ token, user, needs_role }) {
      this.token = token || null;
      this.user = user ? { ...user } : null;
      this.needsRole = !!needs_role;

      if (this.token) {
        localStorage.setItem("token", this.token);
        setAuthToken(this.token);
      } else {
        localStorage.removeItem("token");
        clearAuthToken();
      }
      this.isReady = true; // 👈 aseguramos que el layout se muestre
    },

    /**
     * 🧹 Limpiar sesión
     */
    clear() {
      this.token = null;
      this.user = null;
      this.needsRole = false;
      this.isReady = true; // 👈 evita que el layout parpadee
      localStorage.removeItem("token");
      clearAuthToken();
    },

    logout() {
      this.clear();
    },

    /**
     * 🚀 Inicializa sesión persistente
     * (se ejecuta al cargar la app)
     */
    async init() {
      if (!this.token) {
        this.isReady = true; // 👈 importante si no hay token
        return;
      }

      setAuthToken(this.token);

      try {
        await this.fetchMe();
      } catch {
        this.clear();
      } finally {
        this.isReady = true;
      }
    },

    /**
     * 🔄 Obtener usuario autenticado
     */
    async fetchMe() {
      const { data } = await api.get("/me");
      this.user = data ? { ...data } : null;
      return this.user;
    },

    /**
     * 🔐 Iniciar sesión
     */
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
