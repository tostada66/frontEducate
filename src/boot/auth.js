import { boot } from "quasar/wrappers";
import { useAuthStore } from "stores/auth";

export default boot(async ({ router }) => {
  const auth = useAuthStore();

  // Esperar a que termine init()
  await auth.init();

  // 🔹 Evita render de rutas protegidas sin datos de usuario
  router.beforeEach((to, from, next) => {
    if (!auth.isReady) return next(false);

    // Si no requiere login o ya está autenticado, sigue normal
    if (to.meta.public || auth.isAuthed) return next();

    // Si no hay sesión, redirige al login
    next({ name: "login" });
  });
});
