const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      // ✅ Página principal (IndexPage), protegida con login
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

      // ✅ Onboarding nivel académico (sin login todavía)
      {
        path: "onboarding/nivel",
        name: "onb-nivel",
        component: () => import("pages/OnbNivelPage.vue"),
      },

      // ✅ Onboarding intereses (también sin login)
      {
        path: "onboarding/intereses",
        name: "onb-intereses",
        component: () => import("pages/OnbInteresesPage.vue"),
      },

      // ✅ Página de perfil final (flujo de registro, no requiere login)
      {
        path: "profile",
        name: "profile",
        component: () => import("pages/ProfilePage.vue"),
      },

      // ✅ Perfil Estudiante (ya logueado)
      {
        path: "profile/view",
        name: "profile-view",
        component: () => import("pages/ProfileViewPage.vue"),
        meta: { requiresAuth: true },
      },

      // ✅ Perfil Profesor (registro antes de login)
      {
        path: "register/profesor/profile",
        name: "register-profesor-profile",
        component: () => import("pages/ProfileProfesorPage.vue"),
      },

      // ✅ Perfil Profesor (ya logueado)
      {
        path: "profesor/profile",
        name: "profesor-profile",
        component: () => import("pages/ProfileProfesorView.vue"),
        meta: { requiresAuth: true },
      },

      // ✅ Cursos (gestión del profesor)
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

      // ✅ Clases (gestión de clases dentro de un curso)
      {
        path: "cursos/:idcurso/clases",
        name: "clases-list",
        component: () => import("pages/ClasesListPage.vue"),
        props: true,
        meta: { requiresAuth: true },
      },

      // ✅ Contenidos (gestión de contenidos dentro de una clase)
      {
        path: "clases/:idclase/contenidos",
        name: "contenidos-list",
        component: () => import("pages/ContenidosListPage.vue"),
        props: true,
        meta: { requiresAuth: true },
      },
      {
        path: "estudiante/dashboard",
        name: "estudiante-dashboard",
        component: () => import("pages/EstudianteDashboardPage.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "catalogo/cursos/:idcurso",
        name: "curso-detalle",
        component: () => import("pages/CursoDetallePage.vue"),
        meta: { requiresAuth: true },
      },
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
