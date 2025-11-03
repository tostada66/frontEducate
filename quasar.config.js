/* eslint-env node */

/**
 * Quasar v2 + Vite — ESM config
 * Asegúrate que este archivo usa SÓLO 'import' / 'export'
 */
import { configure } from "quasar/wrappers";

export default configure(function (/* ctx */) {
  return {
    supportTS: false,

    // Archivos CSS globales
    css: ["app.scss"], // o 'app.css' si no usas SCSS

    // Boot files (cargan antes que la app)
    boot: ["pinia", "axios", "auth", "apexcharts", "plyr-css"],

    // Iconos / fuentes extra (opcional)
    extras: [
      "roboto-font", // o quítalo si no lo usas
      "material-icons", // "mdi-v6", "ionicons-v4", etc.
    ],

    build: {
      // 'hash' es más tolerante si tu servidor no está configurado con history mode
      vueRouterMode: "hash", // o 'history' si tu servidor está OK
      // variables de entorno disponibles en el cliente
      // usa Vite para inyectar prefijo VITE_
      env: {
        VITE_API_BASE_URL:
          process.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api",
      },

      // Vite config extendida
      vitePlugins: [
        // puedes agregar plugins de Vite aquí si los necesitas
      ],
    },

    devServer: {
      https: false,
      port: 9000,
      open: true,
      // Proxy para llamadas a /api -> backend Laravel (evita CORS en dev)
      proxy: {
        "/api": {
          target: "http://127.0.0.1:8000",
          changeOrigin: true,
          // secure: false, // descomenta si usas https self-signed
        },
      },
    },

    framework: {
      config: {
        // Config global de Quasar (colores, dark, etc.) si lo requieres
      },
      plugins: ["Dialog", "Notify"],
    },

    animations: [], // agrega 'fadeIn', etc. si usas animaciones de Quasar

    // SSR / PWA / Mobile (ajústalo si lo usas)
    ssr: { pwa: false },
    pwa: {
      workboxMode: "generateSW",
      manifest: {
        name: "Proyect Plataforma",
        short_name: "Plataforma",
        description: "App Quasar",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#1976D2",
        icons: [
          {
            src: "icons/icon-128x128.png",
            sizes: "128x128",
            type: "image/png",
          },
          {
            src: "icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icons/icon-256x256.png",
            sizes: "256x256",
            type: "image/png",
          },
          {
            src: "icons/icon-384x384.png",
            sizes: "384x384",
            type: "image/png",
          },
          {
            src: "icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    },

    capacitor: {
      hideSplashscreen: true,
    },

    cordova: {
      // no suele usarse ya, pero lo dejo por si migras
    },

    electron: {
      // Ignóralo si no usas Electron
      bundler: "packager", // o 'builder'
      // preload: 'src-electron/electron-preload.js',
    },
  };
});
