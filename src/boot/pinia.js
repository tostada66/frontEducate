// src/boot/pinia.js
import { boot } from "quasar/wrappers";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

// ⚡ Crear UNA SOLA instancia de Pinia (fuera del boot)
export const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

export default boot(({ app }) => {
  app.use(pinia);
});
