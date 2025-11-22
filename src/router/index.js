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
    const auth = useAuthStore(store);
    const isAuthed = !!auth.token;

    // 0) Si está logueado e intenta ir a la portada → redirigir al home
    if (to.name === "portada" && isAuthed) {
      return { path: "/home" };
    }

    // 1) Rutas que requieren sesión
    if (to.meta?.requiresAuth && !isAuthed) {
      return {
        path: "/login",
        query: { next: to.fullPath }, // para volver luego
      };
    }

    // 2) Si ya está logueado y va a /login, redirige a lo que corresponda
    if (isAuthed && to.path === "/login") {
      return auth.needsRole ? { path: "/choose-role" } : { path: "/home" }; // 👈 ojo: aquí cambié DashboardPage → home
    }

    // 3) Si necesita elegir rol y está entrando a algo distinto a /choose-role,
    //    fuerzalo a escoger rol primero
    if (isAuthed && auth.needsRole && to.path !== "/choose-role") {
      return { path: "/choose-role" };
    }

    // 4) Por defecto continuar
    return true;
  });

  return Router;
});
