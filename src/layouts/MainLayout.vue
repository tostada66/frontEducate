<template>
  <!-- ✅ Esperar a que el auth esté listo -->
  <q-layout v-if="auth.isReady" view="hHh Lpr lFf" class="layout-root">
    <!-- HEADER -->
    <q-header v-if="!$route.meta.hideHeader" elevated class="header-neon">
      <q-toolbar class="relative-position">
        <!-- Botón menú lateral -->
        <q-btn
          v-if="shouldShowDrawer"
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <!-- 🔙 Flecha volver -->
        <div v-if="mostrarBotonVolver" class="q-ml-sm q-mr-sm">
          <BotonVolver />
        </div>

        <!-- Título -->
        <q-toolbar-title class="titulo-neon">EduPlatform</q-toolbar-title>

        <!-- Usuario -->
        <div class="row items-center q-gutter-sm">
          <div v-if="auth.user" class="usuario-nombre">
            {{ auth.user?.nombres || auth.user?.name || "Usuario" }}
          </div>

          <q-btn
            v-if="auth.isAuthed"
            flat
            dense
            icon="person"
            label="Perfil"
            @click="goProfile"
          />

          <q-btn
            v-if="auth.isAuthed"
            flat
            dense
            icon="logout"
            label="Cerrar sesión"
            :loading="loggingOut"
            @click="doLogout"
          />
        </div>
      </q-toolbar>
    </q-header>

    <!-- DRAWER -->
    <q-drawer
      v-if="shouldShowDrawer"
      v-model="leftDrawerOpen"
      show-if-above
      behavior="desktop"
      class="drawer-modern"
    >
      <div class="drawer-container q-pa-md">
        <q-item-label header class="menu-header">Menú</q-item-label>

        <!-- Perfil -->
        <q-item v-if="auth.isAuthed" clickable @click="goProfile">
          <q-item-section avatar>
            <q-icon
              :name="
                auth.isAdmin
                  ? 'admin_panel_settings'
                  : auth.isProfessor
                  ? 'person_outline'
                  : 'person'
              "
              color="purple"
            />
          </q-item-section>
          <q-item-section class="menu-item">Mi Perfil</q-item-section>
        </q-item>

        <q-separator dark />

        <!-- Opciones por rol -->
        <!-- 👑 ADMIN -->
        <template v-if="auth.isAdmin">
          <q-item clickable @click="goSolicitudes">
            <q-item-section avatar>
              <q-icon name="groups" color="teal" />
            </q-item-section>
            <q-item-section class="menu-item"
              >Solicitudes Profesores</q-item-section
            >
          </q-item>

          <q-item clickable @click="goCursosPendientes">
            <q-item-section avatar>
              <q-icon name="school" color="orange" />
            </q-item-section>
            <q-item-section class="menu-item">Cursos Pendientes</q-item-section>
          </q-item>

          <q-item clickable @click="goPagosProfesores">
            <q-item-section avatar>
              <q-icon name="payments" color="green" />
            </q-item-section>
            <q-item-section class="menu-item"
              >Pagos a Profesores</q-item-section
            >
          </q-item>

          <q-item clickable @click="goCursosAdmin">
            <q-item-section avatar>
              <q-icon name="library_books" color="blue" />
            </q-item-section>
            <q-item-section class="menu-item">Todos los Cursos</q-item-section>
          </q-item>

          <!-- 🎮 NUEVO: Juegos Base -->
          <q-item clickable @click="goJuegosAdmin">
            <q-item-section avatar>
              <q-icon name="sports_esports" color="deep-purple" />
            </q-item-section>
            <q-item-section class="menu-item">Juegos Base</q-item-section>
          </q-item>
        </template>

        <!-- 👨‍🏫 PROFESOR -->
        <template v-if="auth.isProfessor">
          <q-item clickable @click="goCursos">
            <q-item-section avatar>
              <q-icon name="school" color="purple" />
            </q-item-section>
            <q-item-section class="menu-item">Mis Cursos</q-item-section>
          </q-item>

          <q-item clickable @click="goLicencias">
            <q-item-section avatar>
              <q-icon name="workspace_premium" color="teal" />
            </q-item-section>
            <q-item-section class="menu-item"
              >Licencias y Revisión</q-item-section
            >
          </q-item>
        </template>

        <!-- 🎓 ESTUDIANTE -->
        <template v-if="auth.isStudent">
          <q-item clickable @click="goCatalogo">
            <q-item-section avatar>
              <q-icon name="library_books" color="purple" />
            </q-item-section>
            <q-item-section class="menu-item">Catálogo</q-item-section>
          </q-item>

          <q-item clickable @click="goMisCursos">
            <q-item-section avatar>
              <q-icon name="favorite" color="red" />
            </q-item-section>
            <q-item-section class="menu-item">Mis Cursos</q-item-section>
          </q-item>

          <q-item clickable @click="goHistorialSuscripciones">
            <q-item-section avatar>
              <q-icon name="receipt_long" color="blue" />
            </q-item-section>
            <q-item-section class="menu-item"
              >Historial Suscripciones</q-item-section
            >
          </q-item>
        </template>

        <q-separator dark />

        <!-- Facturas -->
        <q-item v-if="auth.isAuthed" clickable @click="goHistorialFacturas">
          <q-item-section avatar>
            <q-icon name="receipt" color="pink" />
          </q-item-section>
          <q-item-section class="menu-item"
            >Historial de Facturas</q-item-section
          >
        </q-item>

        <q-separator dark />

        <!-- Cerrar Sesión -->
        <q-item v-if="auth.isAuthed" clickable @click="doLogout">
          <q-item-section avatar>
            <q-icon name="logout" color="grey-5" />
          </q-item-section>
          <q-item-section class="menu-item">Cerrar Sesión</q-item-section>
        </q-item>
      </div>
    </q-drawer>

    <!-- CONTENIDO PRINCIPAL -->
    <q-page-container class="main-bg">
      <router-view />
    </q-page-container>
  </q-layout>

  <!-- Loader -->
  <div
    v-else
    class="row justify-center items-center q-pa-xl"
    style="height: 100vh"
  >
    <q-spinner color="deep-purple-6" size="40px" />
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "src/stores/auth";
import { api } from "boot/axios";
import { useQuasar } from "quasar";
import BotonVolver from "src/components/BotonVolver.vue";

defineOptions({ name: "MainLayout" });

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const $q = useQuasar();

const leftDrawerOpen = ref(false);
const loggingOut = ref(false);

onMounted(async () => {
  await nextTick();
  if (auth.isAuthed && !auth.user) {
    await auth.fetchUser();
  }
});

const shouldShowDrawer = computed(() => {
  if (!auth.isAuthed && route.meta.public) return false;
  if (route.meta.hideDrawer) return false;
  return true;
});

const mostrarBotonVolver = computed(() => {
  const ocultarEn = [
    "login",
    "register",
    "portada",
    "index",
    "catalogo-cursos",
    "admin-dashboard",
    "profesor-dashboard",
  ];
  return !ocultarEn.includes(route.name);
});

watch(
  () => [route.fullPath, leftDrawerOpen.value, auth.isAuthed],
  async () => {
    await nextTick();
    if ($q.layout) $q.layout.refresh();
  }
);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function goProfile() {
  if (!auth.user) return;
  if (auth.isAdmin) router.push({ name: "admin-dashboard" });
  else if (auth.isProfessor) router.push({ name: "profesor-profile" });
  else if (auth.isStudent) router.push({ name: "profile-view" });
}

function goSolicitudes() {
  router.push({ name: "admin-solicitudes" });
}
function goCursosPendientes() {
  router.push({ name: "admin-cursos-pendientes" });
}
function goPagosProfesores() {
  router.push({ name: "admin-pagos-profesores" });
}
function goCursosAdmin() {
  router.push({ name: "admin-cursos-list" });
}
function goJuegosAdmin() {
  router.push({ name: "juegos-admin" });
}
function goCursos() {
  router.push({ name: "cursos-list" });
}
function goLicencias() {
  router.push({ name: "profesor-cursos-licencias" });
}
function goCatalogo() {
  router.push({ name: "catalogo-cursos" });
}
function goMisCursos() {
  router.push({ name: "mis-cursos" });
}
function goHistorialSuscripciones() {
  router.push({ name: "suscripciones-historial" });
}
function goHistorialFacturas() {
  router.push({ name: "facturas-historial" });
}

async function doLogout() {
  loggingOut.value = true;
  try {
    await api.post("/logout").catch(() => {});
  } finally {
    auth.logout();
    loggingOut.value = false;
    router.replace({ name: "login" });
  }
}
</script>

<style scoped>
/* 🌌 HEADER */
.header-neon {
  background: linear-gradient(90deg, #6b00d6, #3e0099, #5f00b5);
  box-shadow: 0 0 25px rgba(180, 0, 255, 0.6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 2000 !important;
}

/* ✨ Título EduPlatform */
.titulo-neon {
  font-weight: 900;
  font-size: 1.35rem;
  color: #fff;
  text-shadow: 0 0 10px #d47fff, 0 0 25px #a200dc, 0 0 45px #d27eff;
  animation: pulseGlow 3s infinite ease-in-out;
}
@keyframes pulseGlow {
  0%,
  100% {
    text-shadow: 0 0 10px #b86cff, 0 0 18px #a200dc;
  }
  50% {
    text-shadow: 0 0 25px #e3a4ff, 0 0 45px #c47bff;
  }
}

/* 👤 Usuario */
.usuario-nombre {
  color: #eedcff;
  font-weight: 600;
  text-shadow: 0 0 6px rgba(162, 0, 220, 0.8);
}

/* 🔘 Botones Header */
.q-header .q-btn {
  color: #fff !important;
  text-transform: uppercase;
  transition: all 0.25s;
}
.q-header .q-btn:hover {
  transform: scale(1.08);
  text-shadow: 0 0 8px #c47bff;
}

/* 🟣 Drawer */
.drawer-modern {
  width: 240px;
  display: flex;
  flex-direction: column;
  background: none !important;
  padding: 0;
  overflow: hidden;
}

.drawer-container {
  height: 100%;
  background: linear-gradient(180deg, #4a0a9f 0%, #2b0075 70%, #20004d 100%);
  color: #f5eaff;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  box-shadow: inset -5px 0 25px rgba(200, 0, 255, 0.25);
  border-right: 2px solid rgba(180, 0, 255, 0.25);
}

/* Título del menú */
.menu-header {
  color: #e6b3ff;
  font-weight: 700;
  text-shadow: 0 0 10px rgba(200, 150, 255, 0.9);
}

/* Ítems del menú */
.menu-item {
  font-weight: 600;
  color: #f2e9ff;
  transition: all 0.3s ease;
}

/* 🔮 Hover con efecto de luz */
.q-item:hover {
  background: rgba(140, 0, 255, 0.25);
  box-shadow: 0 0 10px rgba(180, 0, 255, 0.5),
    inset 0 0 12px rgba(180, 0, 255, 0.3);
  border-radius: 10px;
  transform: scale(1.02);
}
.q-item:hover .menu-item {
  color: #fff;
  text-shadow: 0 0 10px #e4b3ff, 0 0 20px #b56dff;
}

/* ✨ ÍCONOS CON EFECTO LUMINOSO */
.q-item__section--avatar .q-icon {
  transition: all 0.3s ease;
  filter: brightness(1.3) drop-shadow(0 0 5px rgba(255, 255, 255, 0.4));
}
.q-item:hover .q-icon {
  transform: scale(1.1);
  filter: brightness(1.7) drop-shadow(0 0 10px rgba(255, 200, 255, 0.8))
    drop-shadow(0 0 15px rgba(180, 0, 255, 0.6));
}

/* 🌌 Fondo general */
.main-bg {
  min-height: 100vh;
  background: radial-gradient(circle at 25% 25%, #5c21b5, #1a0033 85%);
  color: white;
  overflow-x: hidden;
}

/* 🌟 Scrollbar personalizada */
::-webkit-scrollbar {
  width: 10px;
}
::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #b000ff, #8600ff);
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #d580ff, #a84dff);
}
</style>
