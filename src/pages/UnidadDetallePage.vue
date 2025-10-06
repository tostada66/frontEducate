<template>
  <q-page class="q-pa-none bg-grey-1">
    <!-- 🔷 Aviso modo profesor -->
    <div v-if="isProfesor" class="bg-primary text-white text-center q-pa-sm">
      <q-icon name="visibility" class="q-mr-xs" />
      Vista previa de la unidad (Profesor)
    </div>

    <!-- 🖼️ Portada / Hero -->
    <div class="unidad-hero">
      <img
        :src="fixUrlUnidad(unidad)"
        alt="Imagen de la unidad"
        class="unidad-hero-img"
      />
      <div class="unidad-hero-overlay">
        <h2 class="unidad-titulo">{{ unidad?.titulo }}</h2>
      </div>
    </div>

    <!-- 📋 Panel información general (pegado al hero) -->
    <div v-if="unidad" class="unidad-info-panel q-pa-md">
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-4">
          <span class="info-label">Curso:</span>
          <span class="info-value">{{
            unidad.curso?.nombre || "Sin curso"
          }}</span>
        </div>
        <div class="col-12 col-md-4">
          <span class="info-label">Duración total:</span>
          <span class="info-value">
            {{
              unidad.duracion_total
                ? unidad.duracion_total + " min"
                : "No definida"
            }}
          </span>
        </div>
        <div class="col-12">
          <span class="info-label">Descripción:</span>
          <span class="info-value">{{
            unidad.descripcion || "Sin descripción"
          }}</span>
        </div>
      </div>
    </div>

    <!-- 🔙 Título de sección + botón volver -->
    <div class="row items-center justify-between q-pa-md q-mt-xl q-mb-md">
      <q-btn
        color="teal-6"
        glossy
        rounded
        icon="arrow_back"
        label="Volver a Unidades"
        class="q-px-md q-py-xs text-white text-bold shadow-2"
        @click="goBackToUnidades"
      />

      <div class="text-h6 text-primary text-center col">
        📚 Clases de esta unidad
      </div>

      <div style="width: 120px"></div>
    </div>

    <!-- 📘 Lista de clases -->
    <div v-if="unidad?.clases?.length" class="q-pa-lg">
      <q-list bordered separator class="rounded-borders shadow-2 bg-white">
        <q-item
          v-for="clase in unidad.clases"
          :key="clase.idclase"
          clickable
          v-ripple
          class="clase-item"
          @click="abrirClase(clase)"
        >
          <q-item-section avatar>
            <q-avatar size="56px" color="primary" text-color="white">
              <q-icon name="menu_book" size="32px" />
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label class="clase-titulo">{{ clase.titulo }}</q-item-label>
            <q-item-label caption class="clase-desc">
              {{ clase.descripcion || "Sin descripción" }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- 🚫 Sin clases -->
    <div
      v-if="unidad && (!unidad.clases || unidad.clases.length === 0)"
      class="text-center text-grey q-mt-lg"
    >
      No se encontraron clases registradas en esta unidad.
    </div>

    <!-- ⏳ Loader -->
    <div class="row justify-center q-mt-lg" v-if="loading">
      <q-spinner-dots color="primary" size="40px" />
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { api } from "boot/axios";
import { useRoute, useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { useAuthStore } from "src/stores/auth";

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const auth = useAuthStore();

const unidad = ref(null);
const loading = ref(false);

// 🔑 Roles
const isProfesor = computed(() => {
  return auth.role === "profesor" || route.name?.startsWith("profesor-");
});
const isAdmin = computed(() => {
  return auth.role === "admin" || route.name?.startsWith("admin-");
});

// 📦 Cargar unidad
async function loadUnidad() {
  loading.value = true;
  try {
    const { idcurso, idunidad } = route.params;
    const { data } = await api.get(`/cursos/${idcurso}/unidades/${idunidad}`);
    unidad.value = data;
  } catch (err) {
    console.error("❌ Error cargando unidad:", err);
    $q.notify({ type: "negative", message: "Error cargando unidad" });
  } finally {
    loading.value = false;
  }
}

// 🖼️ Resolver imagen
function fixUrlUnidad(unidad) {
  if (!unidad) return "/images/unidad-placeholder.png";
  if (unidad.imagen_url) return unidad.imagen_url;
  if (unidad.imagen) return `http://127.0.0.1:8000/storage/${unidad.imagen}`;
  return "/images/unidad-placeholder.png";
}

// 🔙 Volver a unidades
function goBackToUnidades() {
  router.push({
    name: "unidades-list", // ✅ nombre correcto según tus rutas
    params: { idcurso: route.params.idcurso },
  });
}

// 🎬 Abrir clase
function abrirClase(clase) {
  const video = (clase.contenidos || []).find((c) => c.tipo === "video");

  const destino = isProfesor.value
    ? "profesor-contenido-detalle"
    : isAdmin.value
    ? "admin-contenido-detalle"
    : "contenido-detalle";

  if (video) {
    router.push({
      name: destino,
      params: {
        idcurso: route.params.idcurso,
        idunidad: route.params.idunidad,
        idclase: clase.idclase,
        idcontenido: video.idcontenido,
      },
    });
  } else {
    $q.notify({
      type: "warning",
      message: "Esta clase no tiene video principal",
    });
  }
}

// 🎨 Nuevo mapa de colores de estado (si deseas usarlo más adelante)
function getEstadoColor(estado) {
  const map = {
    borrador: "grey",
    en_revision: "orange",
    oferta_enviada: "blue",
    pendiente_aceptacion: "amber",
    publicado: "green",
    rechazado: "red",
  };
  return map[estado] || "grey";
}

onMounted(() => {
  loadUnidad();
});
</script>

<style scoped>
/* 🖼️ Hero */
.unidad-hero {
  position: relative;
  width: 100%;
  height: 260px;
  overflow: hidden;
}
.unidad-hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.unidad-hero-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: flex-start;
  align-items: flex-end;
  padding: 16px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.55), transparent);
}
.unidad-titulo {
  color: #fff;
  font-size: 1.8rem;
  font-weight: 700;
}

/* 📋 Info panel (pegado al hero) */
.unidad-info-panel {
  background: #fff;
  border-top: 1px solid #ddd;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  margin-top: -2px; /* 👈 hace que se vea pegado al hero */
}
.info-label {
  font-weight: 600;
  color: #37474f;
  margin-right: 6px;
}
.info-value {
  color: #455a64;
}

/* 📘 Clases */
.clase-item {
  padding: 20px;
  min-height: 90px;
}
.clase-titulo {
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
}
.clase-desc {
  font-size: 1rem !important;
  color: #666 !important;
}
</style>
