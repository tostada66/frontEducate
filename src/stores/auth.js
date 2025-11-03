// src/stores/auth.js
import { defineStore } from "pinia";
import { api, setAuthToken, clearAuthToken } from "boot/axios";
import { useRouter } from "vue-router";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("token") || null,
    user: null,
    needsRole: false,
    isReady: false, // 🔸 Controla cuándo se puede renderizar el layout
  }),

  getters: {
    isAuthed: (s) => !!s.token && !!s.user,
    isProfessor: (s) => s.user?.idrol === 2, // 👨‍🏫 Profesor
    isStudent: (s) => s.user?.idrol === 1, // 🎓 Estudiante
    isAdmin: (s) => s.user?.idrol === 3, // 🛠️ Administrador
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

      this.isReady = true; // 🔹 Asegura render inmediato
    },

    /**
     * 🧹 Limpiar sesión
     */
    clear() {
      this.token = null;
      this.user = null;
      this.needsRole = false;
      this.isReady = true;

      // 🔥 Limpieza total de persistencia
      localStorage.removeItem("token");
      localStorage.removeItem("auth"); // 👈 Borra el persistente del plugin
      clearAuthToken();
    },

    /**
     * 🚪 Cerrar sesión (siempre limpia y redirige)
     */
    async logout() {
      try {
        // Ignora error 401 si el token ya fue invalidado
        await api.post("/logout").catch(() => {});
      } catch (e) {
        console.warn("⚠️ Error cerrando sesión:", e);
      }

      this.clear();

      // 🔄 Forzar recarga completa para reiniciar router + store
      window.location.href = "/#/login";
    },

    /**
     * 🚀 Inicializa sesión persistente al cargar la app
     */
    async init() {
      if (!this.token) {
        this.isReady = true;
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
     * 👤 Obtener usuario autenticado
     */
    async fetchMe() {
      const { data } = await api.get("/me");
      this.user = data ? { ...data } : null;
      return this.user;
    },

    /**
     * 🔐 Iniciar sesión (redirige según el rol)
     */
    async login(credentials) {
      const router = useRouter();

      const { data } = await api.post("/login", credentials);
      this.setSession({
        token: data.token,
        user: data.user,
        needs_role: data.needs_role,
      });

      // 🔹 Redirección inteligente según rol
      // 🔹 Redirección inteligente según rol
      switch (data.user?.idrol) {
        case 1: // 🎓 Estudiante
          router.replace({ name: "estudiante-dashboard" });
          break;

        case 2: // 👨‍🏫 Profesor
          router.replace({ name: "cursos-list" });
          break;

        case 3: // 🛠️ Admin
          router.replace({ name: "admin-dashboard" });
          break;

        default:
          router.replace({ name: "home" });
          break;
      }

      return data;
    },
  },
});
