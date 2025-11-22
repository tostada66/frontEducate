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
      {
        path: "login",
        name: "login",
        component: () => import("pages/LoginPage.vue"),
        meta: {
          public: true,
          hideDrawer: true, // oculta el drawer
          hideHeader: true, // ⬅️ oculta también el header
        },
      },
      {
        path: "register",
        name: "register",
        component: () => import("pages/RegisterPage.vue"),
        meta: {
          public: true,
          hideDrawer: true, // oculta el drawer
          hideHeader: true, // ⬅️ oculta también el header
        },
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
        meta: {
          public: true,
          hideDrawer: true, // oculta el drawer
          hideHeader: true, // ⬅️ oculta también el header
        },
      },
      {
        path: "onboarding/intereses",
        name: "onb-intereses",
        component: () => import("pages/OnbInteresesPage.vue"),
        meta: {
          public: true,
          hideDrawer: true, // oculta el drawer
          hideHeader: true, // ⬅️ oculta también el header
        },
      },

      // ✅ Perfil general
      {
        path: "profile",
        name: "profile",
        component: () => import("pages/ProfilePage.vue"),
        meta: {
          public: true,
          hideDrawer: true, // oculta el drawer
          hideHeader: true, // ⬅️ oculta también el header
        },
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
        meta: {
          public: true,
          hideDrawer: true, // oculta el drawer
          hideHeader: true, // ⬅️ oculta también el header
        },
      },
      {
        path: "profesor/profile",
        name: "profesor-profile",
        component: () => import("pages/ProfileProfesorView.vue"),
        meta: { requiresAuth: true },
      },

      // ✅ Gestión de AdminCursosListPage.vue (común)
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
      // ✅ Exámenes
      {
        path: "cursos/:idcurso/unidades/:idunidad/examenes/create",
        name: "examen-create",
        component: () => import("pages/ExamenFormPage.vue"),
        props: true,
        meta: { requiresAuth: true, profesor: true },
      },
      {
        path: "cursos/:idcurso/unidades/:idunidad/examenes/:idexamen/edit",
        name: "examen-edit",
        component: () => import("pages/ExamenFormPage.vue"),
        props: true,
        meta: { requiresAuth: true, profesor: true },
      },
      {
        path: "/examen/:idexamen",
        name: "examen-intro",
        component: () => import("pages/ExamenIntroPage.vue"),
      },
      {
        path: "/examen/:idexamen/play",
        name: "examen-play",
        component: () => import("pages/ExamenPlayPage.vue"),
      },
      {
        path: "/examen/:idintento/resultado",
        name: "examen-resultado",
        component: () => import("pages/ExamenResultadoPage.vue"),
      },
      {
        path: "/examen/:idexamen/estadisticas",
        name: "examen-estadisticas",
        component: () => import("pages/ExamenEstadisticas.vue"),
        meta: { requiresAuth: true, role: "profesor" },
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
      {
        path: "pago/qr",
        name: "pago-qr",
        component: () => import("pages/SuscripcionQrPage.vue"),
        meta: { requiresAuth: true, hideDrawer: true },
      },

      // ✅ Admin
      {
        path: "admin/dashboard",
        name: "admin-dashboard",
        component: () => import("pages/AdminDashboardPage.vue"),
        meta: { requiresAuth: true, admin: true },
      },
      {
        path: "admin/solicitudes",
        name: "admin-solicitudes",
        component: () => import("pages/AdminSolicitudes.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "admin/suscripciones",
        name: "admin-suscripciones",
        component: () => import("pages/SuscripcionesAdminPage.vue"),
        meta: { requiresAuth: true, admin: true },
      },
      {
        path: "admin/profesores",
        name: "admin-profesores",
        component: () => import("pages/ProfesoresAdminPage.vue"),
        meta: { requiresAuth: true, admin: true },
      },
      {
        path: "admin/usuarios/:idusuario/perfil",
        name: "admin-usuario-perfil",
        component: () => import("pages/ProfileViewPage.vue"),
        props: true, // 👈 importante
        meta: { requiresAuth: true, admin: true, hideDrawer: true },
      },
      {
        path: "admin/profesores/:idprofesor",
        name: "admin-profesor-detalle",
        component: () => import("pages/ProfileProfesorView.vue"),
        props: true,
        meta: { requiresAuth: true },
      },
      {
        path: "admin/profesores/perfil/:idusuario",
        name: "admin-profesor-perfil",
        component: () => import("pages/ProfileProfesorView.vue"),
        props: true,
        meta: { requiresAuth: true, admin: true, hideDrawer: true },
      },
      {
        path: "admin/cursos/pendientes",
        name: "admin-cursos-pendientes",
        component: () => import("pages/AdminCursosPendientes.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "admin/pagos-profesores/pendientes",
        name: "admin-pagos-profesores",
        component: () => import("pages/PagosPendientesAdmin.vue"),
        meta: { requiresAuth: true, admin: true },
      },
      {
        path: "/admin/cursos",
        name: "admin-cursos-list",
        component: () => import("pages/AdminCursosListPage.vue"),
        meta: { requiresAuth: true, role: "admin" },
      },
      {
        path: "admin/estudiantes",
        name: "admin-estudiantes",
        component: () => import("pages/EstudiantesAdminPage.vue"),
        meta: { requiresAuth: true, admin: true },
      },
      // ===============================
      // 📌 JUEGOS
      // ===============================

      // 🎮 Gestión de Juegos Base (Admin)
      {
        path: "juegos",
        name: "juegos-admin",
        component: () => import("pages/JuegosAdminPage.vue"),
        meta: { requiresAuth: true, admin: true },
      },

      // 🎮 Listado/gestión de juegos de una UNIDAD
      {
        path: "cursos/:idcurso/unidad/:idunidad/juegos",
        name: "juegos-unidad",
        component: () => import("pages/JuegosUnidadPage.vue"), // ← renombrado (antes JuegosCursoPage.vue)
        props: true,
        meta: { requiresAuth: true },
      },

      // ⌨️ Crear/editar palabras de Mecanografía de una instancia (curso_juego)
      {
        path: "cursos/:idcurso/unidad/:idunidad/juegos/:idcursojuego/mecanografia",
        name: "juego-mecanografia",
        component: () => import("pages/JuegoMecanografia.vue"),
        props: true,
        meta: { requiresAuth: true },
      },

      // 🃏 Configurar Cartas (pares) de una instancia (curso_juego)
      {
        path: "cursos/:idcurso/unidad/:idunidad/juegos/:idcursojuego/cartas",
        name: "juego-memoria",
        component: () => import("pages/JuegoMemoria.vue"),
        props: true,
        meta: { requiresAuth: true },
      },
      // 🃏 Juego de Memoria (Cartas) — estudiante
      {
        path: "juego/cartas/:idcursojuego/play",
        name: "juego-memoria-play",
        component: () => import("pages/JuegoCartasPlay.vue"),
        props: true,
        meta: { hideHeader: true, hideDrawer: true, public: true },
      },

      // ♻️ Configurar Ítems del Juego de Reciclaje (profesor)
      {
        path: "cursos/:idcurso/unidad/:idunidad/juegos/:idcursojuego/reciclaje",
        name: "juego-reciclaje",
        component: () => import("pages/JuegoReciclajeEditor.vue"),
        props: true,
        meta: { requiresAuth: true },
      },

      // ♻️ Juego de Reciclaje — vista estudiante
      {
        path: "juego/reciclaje/:idcursojuego/play",
        name: "juego-reciclaje-play",
        component: () => import("pages/JuegoReciclajePlay.vue"),
        meta: { hideHeader: true, hideDrawer: true, public: true },
      },

      // (Opcional) 🧭 Redirección de legacy "juegos-curso" → nueva ruta por unidad
      {
        path: "cursos/:idcurso/juegos",
        redirect: (to) => {
          // Si aún navegan a la ruta vieja, redirige a una unidad conocida (reemplaza :idunidad por la que corresponda en tu flujo)
          // Aquí dejamos un placeholder para no romper la app.
          return {
            name: "juegos-unidad",
            params: {
              idcurso: to.params.idcurso,
              idunidad: "REEMPLAZA_IDUNIDAD",
            },
          };
        },
      },
      // ===============================
      // 🎮 JUEGOS ESTUDIANTE
      // ===============================
      {
        path: "cursos/:idcurso/juegos-estudiante",
        name: "curso-juegos-estudiante",
        component: () => import("pages/JuegosCursoEstudiante.vue"),
        props: true,
        meta: { requiresAuth: true },
      },
      {
        path: "juego/:idcursojuego/inicio",
        name: "juego-inicio",
        component: () => import("pages/JuegoInicio.vue"),
        props: true,
        meta: { requiresAuth: true },
      },
      // 🧩 Juego de Mecanografía (estudiante)
      {
        path: "juego/mecanografia/:idcursojuego/play",
        name: "juego-mecanografia-play",
        component: () => import("pages/JuegoMecanografiaPlay.vue"),
        props: true,
        meta: { hideHeader: true, hideDrawer: true, public: true },
      },
      {
        path: "juego/:idintento/resultado",
        name: "juego-resultado",
        component: () => import("pages/JuegoResultado.vue"),
        props: (route) => ({ idintento: Number(route.params.idintento) }),
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
      {
        path: "/admin/profesores/:idusuario/catalogo",
        name: "admin-profesor-catalogo",
        component: () => import("pages/CatalogoCursosPage.vue"),
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
