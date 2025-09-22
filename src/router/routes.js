const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      // ✅ Página principal dinámica según rol
      {
        path: "",
        name: "index",
        component: () => import("pages/IndexPage.vue"),
        meta: { requiresAuth: true },
      },

      // 🔐 Públicas
      {
        path: "login",
        name: "login",
        component: () => import("pages/LoginPage.vue"),
      },
      {
        path: "register",
        name: "register",
        component: () => import("pages/RegisterPage.vue"),
      },
      {
        path: "password/reset",
        name: "password-reset-email",
        component: () => import("pages/ResetPasswordPage.vue"),
      },

      // ✅ Onboarding
      {
        path: "onboarding/nivel",
        name: "onb-nivel",
        component: () => import("pages/OnbNivelPage.vue"),
      },
      {
        path: "onboarding/intereses",
        name: "onb-intereses",
        component: () => import("pages/OnbInteresesPage.vue"),
      },

      // ✅ Perfil
      {
        path: "profile",
        name: "profile",
        component: () => import("pages/ProfilePage.vue"),
      },
      {
        path: "profile/view",
        name: "profile-view",
        component: () => import("pages/ProfileViewPage.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "register/profesor/profile",
        name: "register-profesor-profile",
        component: () => import("pages/ProfileProfesorPage.vue"),
      },
      {
        path: "profesor/profile",
        name: "profesor-profile",
        component: () => import("pages/ProfileProfesorView.vue"),
        meta: { requiresAuth: true },
      },

      // ✅ Cursos (gestión profe/admin)
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

      // ✅ Catálogo (lo mostramos como home del estudiante)
      {
        path: "catalogo/cursos",
        name: "catalogo-cursos",
        component: () => import("pages/CatalogoCursosPage.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "catalogo/cursos/:idcurso",
        name: "curso-detalle",
        component: () => import("pages/CursoDetallePage.vue"),
        props: true,
        meta: { requiresAuth: true },
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
