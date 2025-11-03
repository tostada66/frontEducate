import { boot } from "quasar/wrappers";
import { useAuthStore } from "stores/auth";

export default boot(async ({ router }) => {
  const auth = useAuthStore();

  // 🕒 Esperar a que Pinia haya restaurado su estado persistido
  await new Promise((resolve) => setTimeout(resolve, 150));

  // 🔐 Inicializar la sesión (solo si no está lista)
  if (!auth.isReady) {
    await auth.init();
  }

  // 🧭 Middleware global de rutas
  router.beforeEach((to, from, next) => {
    // Si aún no está listo, esperar un poco y reintentar
    if (!auth.isReady) {
      setTimeout(() => next(to.fullPath), 100);
      return;
    }

    // Rutas públicas → permitir acceso
    if (to.meta.public) {
      next();
      return;
    }

    // Autenticado → permitir
    if (auth.isAuthed) {
      next();
      return;
    }

    // No autenticado → redirigir al login
    next({ name: "login" });
  });

  // 🔁 **Reforzar navegación al restaurar sesión**
  // Si ya hay token y usuario, pero la página es pública → redirigir automáticamente
  if (auth.isAuthed && router.currentRoute.value.meta?.public) {
    // Por ejemplo: redirigir al dashboard adecuado según rol
    const rol = auth.user?.idrol;
    if (rol === 1) router.replace({ name: "estudiante-dashboard" });
    else if (rol === 2) router.replace({ name: "cursos-list" });
    else if (rol === 3) router.replace({ name: "admin-cursos-pendientes" });
  }
});
