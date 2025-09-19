// src/router/index.js
import { route } from "quasar/wrappers";
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from "vue-router";
import routes from "./routes";
import { useAuthStore } from "src/stores/auth"; // guard usa Pinia

export default route(function ({ store /*, ssrContext */ }) {
  // ✅ recibe store
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === "history"
    ? createWebHistory
    : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  // 🔒 Guard global
  Router.beforeEach((to) => {
    const auth = useAuthStore(store); // ✅ pasa store para evitar getActivePinia
    const isAuthed = !!auth.token;

    // 1) Rutas que requieren sesión
    if (to.meta?.requiresAuth && !isAuthed) {
      return {
        path: "/login",
        query: { next: to.fullPath }, // para volver luego
      };
    }

    // 2) Si ya está logueado y va a /login, redirige a lo que corresponda
    if (isAuthed && to.path === "/login") {
      return auth.needsRole
        ? { path: "/choose-role" }
        : { path: "/DashboardPage" };
    }

    // 3) Si necesita elegir rol y está entrando a algo distinto a /choose-role,
    //    fuerzalo a escoger rol primero (pero deja pasar /logout por si acaso)
    if (isAuthed && auth.needsRole && to.path !== "/choose-role") {
      return { path: "/choose-role" };
    }

    // 4) Por defecto continuar
    return true;
  });

  return Router;
});
