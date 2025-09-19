<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>EduPlatform</q-toolbar-title>

        <div class="row items-center q-gutter-sm">
          <!-- Nombre del usuario -->
          <div v-if="auth.user" class="text-grey-4">
            {{ auth.user?.nombres || auth.user?.name || "Usuario" }}
          </div>

          <!-- Botón Perfil -->
          <q-btn
            v-if="auth.isAuthed"
            flat
            dense
            icon="person"
            label="Perfil"
            @click="goProfile"
          />

          <!-- Botón Cerrar sesión -->
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

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header>Menú</q-item-label>

        <!-- Link a perfil -->
        <q-item v-if="auth.isAuthed" clickable @click="goProfile">
          <q-item-section avatar><q-icon name="person" /></q-item-section>
          <q-item-section>Perfil</q-item-section>
        </q-item>

        <!-- ✅ Cursos (solo profesores) -->
        <q-item
          v-if="
            auth.isAuthed &&
            ((auth.user?.rolRel?.nombre || '').toLowerCase() === 'profesor' ||
              auth.user?.rol_id === 2)
          "
          clickable
          @click="goCursos"
        >
          <q-item-section avatar><q-icon name="school" /></q-item-section>
          <q-item-section>Cursos</q-item-section>
        </q-item>

        <!-- Logout también en drawer -->
        <q-item v-if="auth.isAuthed" clickable @click="doLogout">
          <q-item-section avatar><q-icon name="logout" /></q-item-section>
          <q-item-section>Cerrar sesión</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "src/stores/auth";
import { api } from "boot/axios";

defineOptions({ name: "MainLayout" });

const router = useRouter();
const auth = useAuthStore();

const leftDrawerOpen = ref(false);
const loggingOut = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

// ✅ Redirige según el rol del usuario
function goProfile() {
  if (!auth.user) return;

  const rol = (auth.user?.rolRel?.nombre || "").toLowerCase();

  if (rol === "profesor" || auth.user?.rol_id === 2) {
    router.push({ name: "profesor-profile" });
  } else {
    router.push({ name: "profile-view" });
  }
}

// ✅ Redirigir a lista de cursos (para profesor)
function goCursos() {
  router.push({ name: "cursos-list" }); // 👈 ahora manda a la lista
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
