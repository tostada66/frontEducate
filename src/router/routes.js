// src/router/routes.js
const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      // 🌐 Portada pública
      {
        path: "",
        name: "portada",
        component: () => import("pages/PortadaPage.vue"),
        meta: { hideDrawer: true, public: true },
      },

      // ✅ Página principal según rol
      {
        path: "home",
        name: "index",
        component: () => import("pages/IndexPage.vue"),
        meta: { requiresAuth: true },
      },

      // 🔐 Públicas
      {
        path: "login",
        name: "login",
        component: () => import("pages/LoginPage.vue"),
        meta: { hideDrawer: true, public: true },
      },
      {
        path: "register",
        name: "register",
        component: () => import("pages/RegisterPage.vue"),
        meta: { hideDrawer: true, public: true },
      },
      {
        path: "password/reset",
        name: "password-reset-email",
        component: () => import("pages/ResetPasswordPage.vue"),
        meta: { hideDrawer: true, public: true },
      },

      // ✅ Onboarding
      {
        path: "onboarding/nivel",
        name: "onb-nivel",
        component: () => import("pages/OnbNivelPage.vue"),
        meta: { hideDrawer: true, public: true },
      },
      {
        path: "onboarding/intereses",
        name: "onb-intereses",
        component: () => import("pages/OnbInteresesPage.vue"),
        meta: { hideDrawer: true, public: true },
      },

      // ✅ Perfil general
      {
        path: "profile",
        name: "profile",
        component: () => import("pages/ProfilePage.vue"),
        meta: { hideDrawer: true, public: true },
      },
      {
        path: "profile/view",
        name: "profile-view",
        component: () => import("pages/ProfileViewPage.vue"),
        meta: { requiresAuth: true },
      },

      // ✅ Perfil profesor
      {
        path: "register/profesor/profile",
        name: "register-profesor-profile",
        component: () => import("pages/ProfileProfesorPage.vue"),
        meta: { hideDrawer: true, public: true },
      },
      {
        path: "profesor/profile",
        name: "profesor-profile",
        component: () => import("pages/ProfileProfesorView.vue"),
        meta: { requiresAuth: true },
      },

      // ✅ Gestión de cursos (común)
      {
        path: "cursos",
        name: "cursos-list",
        component: () => import("pages/CursosListPage.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "cursos/create",
        name: "cursos-create",
        component: () => import("pages/CursoFormPage.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "cursos/:idcurso/edit",
        name: "cursos-edit",
        component: () => import("pages/CursoFormPage.vue"),
        props: true,
        meta: { requiresAuth: true },
      },

      // ✅ Unidades
      {
        path: "cursos/:idcurso/unidades",
        name: "unidades-list",
        component: () => import("pages/UnidadesListPage.vue"),
        props: true,
        meta: { requiresAuth: true },
      },
      {
        path: "cursos/:idcurso/unidades/create",
        name: "unidad-create",
        component: () => import("pages/UnidadFormPage.vue"),
        props: true,
        meta: { requiresAuth: true },
      },
      {
        path: "cursos/:idcurso/unidades/:idunidad/edit",
        name: "unidad-edit",
        component: () => import("pages/UnidadFormPage.vue"),
        props: true,
        meta: { requiresAuth: true },
      },

      // ✅ Clases
      {
        path: "cursos/:idcurso/unidades/:idunidad/clases",
        name: "clases-list",
        component: () => import("pages/ClasesListPage.vue"),
        props: true,
        meta: { requiresAuth: true },
      },
      {
        path: "cursos/:idcurso/unidades/:idunidad/clases/create",
        name: "clases-create",
        component: () => import("pages/ClaseFormPage.vue"),
        props: true,
        meta: { requiresAuth: true },
      },
      {
        path: "cursos/:idcurso/unidades/:idunidad/clases/:idclase/edit",
        name: "clases-edit",
        component: () => import("pages/ClaseFormPage.vue"),
        props: true,
        meta: { requiresAuth: true },
      },

      // ✅ Contenidos
      {
        path: "cursos/:idcurso/unidades/:idunidad/clases/:idclase/contenidos",
        name: "contenidos-list",
        component: () => import("pages/ContenidosListPage.vue"),
        props: true,
        meta: { requiresAuth: true },
      },
      {
        path: "cursos/:idcurso/unidades/:idunidad/clases/:idclase/contenidos/create",
        name: "contenidos-create",
        component: () => import("pages/ContenidoFormPage.vue"),
        props: true,
        meta: { requiresAuth: true },
      },
      {
        path: "cursos/:idcurso/unidades/:idunidad/clases/:idclase/contenidos/:idcontenido/edit",
        name: "contenidos-edit",
        component: () => import("pages/ContenidoFormPage.vue"),
        props: true,
        meta: { requiresAuth: true },
      },

      // ✅ Estudiante
      {
        path: "estudiante/dashboard",
        name: "estudiante-dashboard",
        component: () => import("pages/EstudianteDashboardPage.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "mis-cursos",
        name: "mis-cursos",
        component: () => import("pages/MisCursosPage.vue"),
        meta: { requiresAuth: true },
      },

      // ✅ Catálogo público
      {
        path: "catalogo/cursos",
        name: "catalogo-cursos",
        component: () => import("pages/CatalogoCursosPage.vue"),
        meta: { public: true },
      },
      {
        path: "catalogo/cursos/:idcurso",
        name: "curso-detalle",
        component: () => import("pages/CursoDetallePage.vue"),
        props: true,
        meta: { public: true },
      },
      {
        path: "catalogo/cursos/:idcurso/unidades/:idunidad",
        name: "unidad-detalle",
        component: () => import("pages/UnidadDetallePage.vue"),
        props: true,
        meta: { public: true },
      },
      {
        path: "catalogo/cursos/:idcurso/unidades/:idunidad/clases/:idclase/contenidos/:idcontenido",
        name: "contenido-detalle",
        component: () => import("pages/ContenidoPage.vue"),
      },
      {
        path: "catalogo/cursos/:idcurso/unidades/:idunidad/clases/:idclase/contenidos/:idcontenido/docs",
        name: "contenido-docs",
        component: () => import("pages/ContenidoDocsPage.vue"),
        props: true,
        meta: { public: true },
      },

      // ✅ Planes de suscripción
      {
        path: "suscripciones",
        name: "planes",
        component: () => import("pages/PlanesPage.vue"),
        meta: { public: true, hideDrawer: true },
      },
      {
        path: "suscripciones/historial",
        name: "suscripciones-historial",
        component: () => import("pages/SuscripcionesHistorialPage.vue"),
        meta: { requiresAuth: true },
      },

      // ✅ Facturas
      {
        path: "facturas/historial",
        name: "facturas-historial",
        component: () => import("pages/FacturasHistorialPage.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "factura/:id",
        name: "factura",
        component: () => import("pages/FacturaPage.vue"),
        props: true,
        meta: { requiresAuth: true },
      },

      // ✅ Pagos
      {
        path: "pago/tipos",
        name: "pago-tipos",
        component: () => import("pages/PagoTiposPage.vue"),
        meta: { requiresAuth: true, hideDrawer: true },
      },
      {
        path: "pago",
        name: "pago",
        component: () => import("pages/PagoPage.vue"),
        meta: { requiresAuth: true, hideDrawer: true },
      },
      {
        path: "pago/exito/:id",
        name: "pago-exito",
        component: () => import("pages/PagoExitoPage.vue"),
        props: true,
        meta: { requiresAuth: true, hideDrawer: true },
      },

      // ✅ Admin
      {
        path: "admin/solicitudes",
        name: "admin-solicitudes",
        component: () => import("pages/AdminSolicitudes.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "admin/profesores/:idprofesor",
        name: "admin-profesor-detalle",
        component: () => import("pages/ProfileProfesorView.vue"),
        props: true,
        meta: { requiresAuth: true },
      },
      {
        path: "admin/cursos/pendientes",
        name: "admin-cursos-pendientes",
        component: () => import("pages/AdminCursosPendientes.vue"),
        meta: { requiresAuth: true },
      },

      // ===============================
      // 📌 Navegación ADMIN
      // ===============================
      {
        path: "admin/cursos/:idcurso",
        name: "admin-curso-detalle",
        component: () => import("pages/CursoDetallePage.vue"),
        props: true,
        meta: { requiresAuth: true, admin: true },
      },
      {
        path: "admin/cursos/:idcurso/unidades/:idunidad",
        name: "admin-unidad-detalle",
        component: () => import("pages/UnidadDetallePage.vue"),
        props: true,
        meta: { requiresAuth: true, admin: true },
      },
      {
        path: "admin/cursos/:idcurso/unidades/:idunidad/clases/:idclase/contenidos/:idcontenido",
        name: "admin-contenido-detalle",
        component: () => import("pages/ContenidoPage.vue"),
        props: true,
        meta: { requiresAuth: true, admin: true },
      },
      {
        path: "admin/cursos/:idcurso/unidades/:idunidad/clases/:idclase/contenidos/:idcontenido/docs",
        name: "admin-contenido-docs",
        component: () => import("pages/ContenidoDocsPage.vue"),
        props: true,
        meta: { requiresAuth: true, admin: true },
      },

      // ===============================
      // 👨‍🏫 Navegación PROFESOR (mismo flujo)
      // ===============================
      {
        path: "profesor/cursos/licencias",
        name: "profesor-cursos-licencias",
        component: () => import("pages/ProfesorCursosLicenciasPage.vue"),
        meta: { requiresAuth: true, profesor: true },
      },
      {
        path: "profesor/cursos/:idcurso",
        name: "profesor-curso-detalle",
        component: () => import("pages/CursoDetallePage.vue"),
        props: true,
        meta: { requiresAuth: true, profesor: true },
      },
      {
        path: "profesor/cursos/:idcurso/unidades/:idunidad",
        name: "profesor-unidad-detalle",
        component: () => import("pages/UnidadDetallePage.vue"),
        props: true,
        meta: { requiresAuth: true, profesor: true },
      },
      {
        path: "profesor/cursos/:idcurso/unidades/:idunidad/clases/:idclase/contenidos/:idcontenido",
        name: "profesor-contenido-detalle",
        component: () => import("pages/ContenidoPage.vue"),
        props: true,
        meta: { requiresAuth: true, profesor: true },
      },
      {
        path: "profesor/cursos/:idcurso/unidades/:idunidad/clases/:idclase/contenidos/:idcontenido/docs",
        name: "profesor-contenido-docs",
        component: () => import("pages/ContenidoDocsPage.vue"),
        props: true,
        meta: { requiresAuth: true, profesor: true },
      },
    ],
  },

  // 404
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
