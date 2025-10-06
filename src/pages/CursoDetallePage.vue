<template>
  <q-page class="q-pa-none bg-grey-1">
    <!-- 🔷 Aviso de modo profesor -->
    <div v-if="isProfesor" class="bg-primary text-white text-center q-pa-sm">
      <q-icon name="visibility" class="q-mr-xs" />
      Vista previa del curso (Profesor)
    </div>

    <!-- 🖼️ Portada -->
    <div class="curso-hero">
      <img
        :src="fixUrlCurso(curso)"
        alt="Imagen del curso"
        class="curso-hero-img"
      />
      <div class="curso-hero-overlay">
        <h2 class="curso-titulo">{{ curso?.nombre }}</h2>
      </div>
    </div>

    <!-- 📋 Panel información -->
    <div v-if="curso" class="curso-info-panel q-pa-md">
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-4">
          <span class="info-label">Categoría:</span>
          <span class="info-value">
            {{ curso.categoria?.nombre || "Sin categoría" }}
          </span>
        </div>
        <div class="col-12 col-md-4">
          <span class="info-label">Nivel:</span>
          <span class="info-value">{{ curso.nivel || "General" }}</span>
        </div>
        <div class="col-12">
          <span class="info-label">Descripción:</span>
          <span class="info-value">
            {{ curso.descripcion || "Sin descripción" }}
          </span>
        </div>
      </div>
    </div>

    <!-- 🔙 Título + botón volver dinámico -->
    <div class="row items-center justify-between q-pa-md q-mt-xl q-mb-md">
      <q-btn
        color="teal-6"
        glossy
        rounded
        icon="arrow_back"
        :label="volverLabel"
        class="q-px-md q-py-xs text-white text-bold shadow-2"
        @click="goBack"
      />

      <div class="text-h6 text-primary text-center col">
        📚 Lista de Unidades
      </div>

      <div style="width: 120px"></div>
    </div>

    <!-- 🔍 Buscador -->
    <div class="q-pa-md">
      <q-input
        v-model="filtroNombre"
        outlined
        rounded
        dense
        placeholder="Buscar unidad por nombre"
        clearable
        debounce="300"
        standout="bg-white text-primary"
      >
        <template #prepend>
          <q-icon name="search" color="primary" />
        </template>
      </q-input>
    </div>

    <!-- 🧩 Unidades -->
    <div
      v-if="curso && unidadesFiltradas.length"
      class="row q-col-gutter-lg q-pa-lg"
    >
      <div
        v-for="unidad in unidadesFiltradas"
        :key="unidad.idunidad"
        class="col-12 col-md-6 col-lg-4"
      >
        <q-card class="unidad-card shadow-3">
          <div class="unidad-img-container">
            <img :src="fixUrl(unidad)" alt="Imagen unidad" class="unidad-img" />
            <div class="unidad-overlay">
              <div class="unidad-titulo">{{ unidad.titulo }}</div>
            </div>
          </div>

          <q-card-section>
            <div class="q-mb-sm">
              <span class="info-label">Curso:</span>
              <span class="info-value">{{ curso?.nombre }}</span>
            </div>
            <div class="q-mb-sm">
              <span class="info-label">Unidad:</span>
              <span class="info-value">{{ unidad.titulo }}</span>
            </div>
            <div class="q-mb-sm">
              <span class="info-label">Descripción:</span>
              <span class="info-value">{{
                unidad.descripcion || "Sin descripción"
              }}</span>
            </div>

            <div class="row items-center text-caption text-grey-7">
              <q-icon name="schedule" size="16px" class="q-mr-xs" />
              <span>
                {{
                  unidad.duracion_total
                    ? unidad.duracion_total + " hrs"
                    : "Duración no definida"
                }}
              </span>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              color="primary"
              label="Ver clases"
              @click="handleVerClases(unidad.idunidad)"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- 🚫 Sin unidades -->
    <div
      v-if="!loading && curso && unidadesFiltradas.length === 0"
      class="text-center text-grey q-mt-lg"
    >
      No se encontraron unidades para este curso.
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

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const curso = ref(null);
const loading = ref(false);
const filtroNombre = ref("");

// Roles
const isProfesor = computed(
  () => auth.role === "profesor" || route.name?.startsWith("profesor-")
);
const isAdmin = computed(
  () => auth.role === "admin" || route.name?.startsWith("admin-")
);
const isEstudiante = computed(
  () => auth.role === "estudiante" || route.name?.startsWith("catalogo-")
);

// 📦 Cargar curso
async function loadCurso() {
  loading.value = true;
  try {
    const { data } = await api.get(`/cursos/${route.params.idcurso}`);
    curso.value = data;
  } catch (err) {
    console.error("❌ Error cargando curso:", err);
    $q.notify({ type: "negative", message: "Error cargando curso" });
  } finally {
    loading.value = false;
  }
}

// 🖼️ Imagenes
function fixUrl(unidad) {
  if (unidad.imagen_url) return unidad.imagen_url;
  if (unidad.imagen) return `http://127.0.0.1:8000/storage/${unidad.imagen}`;
  return "/images/unidad-placeholder.png";
}
function fixUrlCurso(curso) {
  if (!curso) return "/images/curso-placeholder.png";
  if (curso.imagen_url) return curso.imagen_url;
  if (curso.imagen) return `http://127.0.0.1:8000/storage/${curso.imagen}`;
  return "/images/curso-placeholder.png";
}

// 🔙 Lógica dinámica del botón volver
const volverLabel = computed(() => {
  if (isAdmin.value) return "Volver al Panel de Cursos";
  if (isProfesor.value) return "Volver a Mis Cursos";
  return "Volver al Catálogo";
});

function goBack() {
  if (isAdmin.value) {
    router.push({ name: "admin-cursos-pendientes" });
  } else if (isProfesor.value) {
    router.push({ name: "cursos-list" });
  } else {
    router.push({ name: "catalogo-cursos" });
  }
}

// 📘 Ver clases
function handleVerClases(idunidad) {
  const destino = isProfesor.value
    ? "profesor-unidad-detalle"
    : isAdmin.value
    ? "admin-unidad-detalle"
    : "unidad-detalle";

  router.push({
    name: destino,
    params: { idcurso: route.params.idcurso, idunidad },
  });
}

// 🔍 Filtro
const unidadesFiltradas = computed(() => {
  if (!curso.value || !curso.value.unidades) return [];
  const search = filtroNombre.value.toLowerCase().trim();
  return curso.value.unidades.filter((u) =>
    u.titulo?.toLowerCase().includes(search)
  );
});

onMounted(() => {
  loadCurso();
});
</script>

<style scoped>
.curso-hero {
  position: relative;
  width: 100%;
  height: 260px;
  overflow: hidden;
}
.curso-hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.curso-hero-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: flex-start;
  align-items: flex-end;
  padding: 16px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.55), transparent);
}
.curso-titulo {
  color: #fff;
  font-size: 1.6rem;
  font-weight: 700;
}
.curso-info-panel {
  background: #fff;
  border-top: 1px solid #ddd;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  margin-top: -2px;
}
.info-label {
  font-weight: 600;
  color: #37474f;
  margin-right: 6px;
}
.info-value {
  color: #455a64;
}
.unidad-card {
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}
.unidad-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.15);
}
.unidad-img-container {
  position: relative;
  width: 100%;
  height: 160px;
  overflow: hidden;
}
.unidad-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}
.unidad-card:hover .unidad-img {
  transform: scale(1.1);
}
.unidad-overlay {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 8px 12px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.65), transparent);
}
.unidad-titulo {
  color: #fff;
  font-size: 1.05rem;
  font-weight: 600;
}
</style>
