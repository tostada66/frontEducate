<template>
  <!-- ✅ Esperar a que el auth esté listo -->
  <q-layout v-if="auth.isReady" view="hHh Lpr lFf">
    <!-- Header -->
    <q-header
      v-if="!$route.meta.hideHeader"
      elevated
      class="bg-primary text-white"
    >
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
        <q-toolbar-title class="text-weight-bold">
          EduPlatform
        </q-toolbar-title>

        <!-- Usuario -->
        <div class="row items-center q-gutter-sm">
          <div v-if="auth.user" class="text-grey-1">
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

    <!-- Drawer izquierdo -->
    <q-drawer
      v-if="shouldShowDrawer"
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      behavior="desktop"
    >
      <q-list>
        <q-item-label header>Menú</q-item-label>

        <!-- Perfil según rol -->
        <q-item
          v-if="auth.isAuthed && auth.isStudent"
          clickable
          @click="goProfile"
        >
          <q-item-section avatar><q-icon name="person" /></q-item-section>
          <q-item-section>Mi Perfil</q-item-section>
        </q-item>

        <q-item
          v-if="auth.isAuthed && auth.isProfessor"
          clickable
          @click="goProfile"
        >
          <q-item-section avatar><q-icon name="person" /></q-item-section>
          <q-item-section>Perfil Profesor</q-item-section>
        </q-item>

        <q-item
          v-if="auth.isAuthed && auth.isAdmin"
          clickable
          @click="goProfile"
        >
          <q-item-section avatar>
            <q-icon name="admin_panel_settings" />
          </q-item-section>
          <q-item-section>Panel Admin</q-item-section>
        </q-item>

        <q-separator />

        <!-- Opciones Admin -->
        <q-item
          v-if="auth.isAuthed && auth.isAdmin"
          clickable
          @click="goSolicitudes"
        >
          <q-item-section avatar><q-icon name="groups" /></q-item-section>
          <q-item-section>Solicitudes Profesores</q-item-section>
        </q-item>

        <q-item
          v-if="auth.isAuthed && auth.isAdmin"
          clickable
          @click="goCursosPendientes"
        >
          <q-item-section avatar>
            <q-icon name="school" color="orange" />
          </q-item-section>
          <q-item-section>Cursos pendientes</q-item-section>
        </q-item>

        <!-- Opciones Profesor -->
        <q-item
          v-if="auth.isAuthed && auth.isProfessor"
          clickable
          @click="goCursos"
        >
          <q-item-section avatar>
            <q-icon name="school" />
          </q-item-section>
          <q-item-section>Mis Cursos</q-item-section>
        </q-item>

        <q-item
          v-if="auth.isAuthed && auth.isProfessor"
          clickable
          @click="goLicencias"
        >
          <q-item-section avatar>
            <q-icon name="workspace_premium" color="teal" />
          </q-item-section>
          <q-item-section>Licencias y Revisión</q-item-section>
        </q-item>

        <!-- Opciones Estudiante -->
        <q-item
          v-if="auth.isAuthed && auth.isStudent"
          clickable
          @click="goCatalogo"
        >
          <q-item-section avatar>
            <q-icon name="library_books" />
          </q-item-section>
          <q-item-section>Catálogo</q-item-section>
        </q-item>

        <q-item
          v-if="auth.isAuthed && auth.isStudent"
          clickable
          @click="goMisCursos"
        >
          <q-item-section avatar>
            <q-icon name="favorite" color="red" />
          </q-item-section>
          <q-item-section>Mis cursos</q-item-section>
        </q-item>

        <q-item
          v-if="auth.isAuthed && auth.isStudent"
          clickable
          @click="goHistorialSuscripciones"
        >
          <q-item-section avatar>
            <q-icon name="receipt_long" />
          </q-item-section>
          <q-item-section>Historial suscripciones</q-item-section>
        </q-item>

        <q-item
          v-if="auth.isAuthed && auth.isStudent"
          clickable
          @click="goHistorialFacturas"
        >
          <q-item-section avatar>
            <q-icon name="receipt" />
          </q-item-section>
          <q-item-section>Historial facturas</q-item-section>
        </q-item>

        <!-- Logout -->
        <q-item v-if="auth.isAuthed" clickable @click="doLogout">
          <q-item-section avatar><q-icon name="logout" /></q-item-section>
          <q-item-section>Cerrar sesión</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- Contenido principal -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>

  <!-- ⏳ Loader mientras se carga el auth -->
  <div
    v-else
    class="row justify-center items-center q-pa-xl"
    style="height: 100vh"
  >
    <q-spinner color="primary" size="40px" />
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

// ✅ Esperar a que el usuario esté cargado
onMounted(async () => {
  await nextTick();
  if (auth.isAuthed && !auth.user) {
    await auth.fetchUser();
  }
});

// ✅ Control de visibilidad del drawer
const shouldShowDrawer = computed(() => {
  if (!auth.isAuthed && route.meta.public) return false;
  if (route.meta.hideDrawer) return false;
  return true;
});

// ✅ Mostrar botón volver (oculto en páginas principales)
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

// 🔄 Refrescar layout al cambiar ruta/drawer
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
.q-header {
  z-index: 2000 !important;
}
</style>
