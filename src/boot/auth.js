import { boot } from "quasar/wrappers";
import { useAuthStore } from "stores/auth";

export default boot(async () => {
  const auth = useAuthStore();
  await auth.init(); // 👈 inicializa sesión si hay token
});
