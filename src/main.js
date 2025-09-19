// src/main.js
import { createApp } from "vue";
import { Quasar } from "quasar";
import quasarUserOptions from "./quasar-user-options"; // si no existe, usa la Opción B
import createStore from "stores"; // src/stores/index.js
import createRouter from "router"; // src/router/index.js
import App from "./App.vue";

const app = createApp(App);

const store = createStore(); // 1) crea Pinia
const router = createRouter({ store }); // 2) crea router pasando store

app.use(Quasar, quasarUserOptions);
app.use(store); // 3) Pinia ANTES del router
app.use(router); // 4) luego router

app.mount("#q-app");
