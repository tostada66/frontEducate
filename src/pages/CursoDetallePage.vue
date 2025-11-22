<template>
  <q-page class="q-pa-none bg-grey-1">
    <!-- 🔷 Vista de profesor -->
    <div v-if="isProfesor" class="bg-primary text-white text-center q-pa-sm">
      <q-icon name="visibility" class="q-mr-xs" />
      Vista previa del curso (Profesor)
    </div>

    <!-- 🖼️ Hero -->
    <div class="curso-hero">
      <img
        :src="fixUrlCurso(curso)"
        alt="Imagen del curso"
        class="curso-hero-img"
      />
      <div class="curso-hero-overlay">
        <div class="curso-titulo-container">
          <h2 class="curso-titulo">
            <span class="curso-label">Curso:</span>
            <span class="curso-nombre">{{ curso?.nombre }}</span>
          </h2>

          <div v-if="curso?.promedio_resenas" class="curso-rating">
            <q-rating
              v-model="curso.promedio_resenas"
              max="5"
              color="amber"
              size="1.2em"
              readonly
              icon="star"
              icon-half="star_half"
            />
            <span class="text-white text-caption q-ml-sm">
              {{ curso.promedio_resenas.toFixed(1) }} / 5
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 📋 Información del curso -->
    <div v-if="curso" class="curso-info-panel q-pa-lg">
      <!-- 🧱 Fila 1 (Categoría, Nivel, Duración total) -->
      <div class="row q-col-gutter-md q-mb-md">
        <!-- Categoría -->
        <div class="col-12 col-md-4 q-mb-sm info-item">
          <q-icon name="category" class="info-icon text-indigo-7" />
          <div>
            <div class="info-label">Categoría</div>
            <div class="info-value">
              {{ curso.categoria?.nombre || "Sin categoría" }}
            </div>
          </div>
        </div>

        <!-- Nivel -->
        <div class="col-12 col-md-4 q-mb-sm info-item">
          <q-icon name="school" class="info-icon text-teal-7" />
          <div>
            <div class="info-label">Nivel</div>
            <div class="info-value">
              {{ curso.nivel || "General" }}
            </div>
          </div>
        </div>

        <!-- ⏱️ Duración total -->
        <div class="col-12 col-md-4 q-mb-sm info-item">
          <q-icon name="schedule" class="info-icon text-primary" />
          <div>
            <div class="info-label">Duración total</div>
            <div class="info-value">
              {{ formatearDuracion(curso.duracion_total) }}
            </div>
          </div>
        </div>
      </div>

      <!-- 📝 Descripción -->
      <div class="q-mb-md info-item descripcion-item">
        <q-icon name="description" class="info-icon text-blue-7" />
        <div>
          <div class="info-label">Descripción</div>
          <div class="info-value">
            {{ curso.descripcion || "Sin descripción" }}
          </div>
        </div>
      </div>

      <!-- 🔘 Botones -->
      <div class="row items-center q-gutter-md q-mt-md">
        <q-btn
          color="teal"
          unelevated
          icon="arrow_back"
          :label="volverLabel"
          class="boton-accion"
          @click="goBack"
        />

        <q-btn
          v-for="option in tabs"
          :key="option.value"
          :color="currentTab === option.value ? 'primary' : 'grey-5'"
          :text-color="currentTab === option.value ? 'white' : 'grey-8'"
          unelevated
          class="boton-accion"
          :label="option.label"
          @click="currentTab = option.value"
        />
      </div>
    </div>

    <!-- 🔍 Título y buscador -->
    <div v-if="currentTab === 'unidades'" class="q-pa-md">
      <div class="text-h5 text-primary text-weight-bold q-mb-sm">
        Unidades del curso
      </div>

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

    <!-- 🧩 Listado de unidades -->
    <div v-if="currentTab === 'unidades'">
      <div
        v-if="curso && unidadesFiltradas.length"
        class="row q-col-gutter-lg q-pa-md"
        style="min-height: 60vh"
      >
        <div
          v-for="unidad in unidadesFiltradas"
          :key="unidad.idunidad"
          class="col-12 col-md-6 col-lg-4"
        >
          <q-card class="unidad-card shadow-3">
            <!-- IMG -->
            <div class="unidad-img-container">
              <img
                :src="fixUrl(unidad)"
                alt="Imagen unidad"
                class="unidad-img"
              />
              <div class="unidad-overlay">
                <div class="unidad-titulo">{{ unidad.titulo }}</div>
              </div>
            </div>

            <!-- INFO CARD -->
            <q-card-section class="scroll-content">
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
                <span class="info-value">
                  {{ unidad.descripcion || "Sin descripción" }}
                </span>
              </div>

              <!-- ⏱ Duración -->
              <div class="q-mb-sm">
                <span class="info-label">Duración:</span>
                <span class="info-value">
                  {{ formatearDuracion(unidad.duracion_total) }}
                </span>
              </div>
            </q-card-section>

            <q-separator />

            <q-card-actions align="right" class="q-pa-sm">
              <q-btn
                color="primary"
                label="Ver clases"
                class="q-mt-sm full-width"
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
    </div>

    <!-- ⭐ Reseñas -->
    <div v-else-if="currentTab === 'resenas' && auth.isReady">
      <ResenasCurso
        v-if="curso"
        :idcurso="curso.idcurso"
        @actualizar-promedio="actualizarPromedio"
      />
    </div>

    <!-- ⏳ Loader -->
    <div class="row justify-center q-mt-lg" v-if="loading">
      <q-spinner-dots color="primary" size="40px" />
    </div>

    <!-- 🔐 Modal invitado -->
    <q-dialog v-model="showLoginDialog" persistent>
      <q-card class="q-pa-md text-center" style="max-width: 400px">
        <q-icon name="lock" size="48px" color="primary" class="q-mb-sm" />
        <div class="text-h6 text-primary q-mb-xs">Inicia sesión</div>
        <div class="text-body2 text-grey-7 q-mb-md">
          Para acceder a las clases de este curso necesitas iniciar sesión o
          crear una cuenta gratuita.
        </div>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn color="primary" label="Acceder" @click="goLogin" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 💳 Modal suscripción -->
    <q-dialog v-model="showSubsDialog" persistent>
      <q-card class="q-pa-md text-center" style="max-width: 400px">
        <q-icon
          name="credit_card"
          size="48px"
          color="secondary"
          class="q-mb-sm"
        />
        <div class="text-h6 text-secondary q-mb-xs">Suscripción requerida</div>
        <div class="text-body2 text-grey-7 q-mb-md">
          Este curso está disponible solo para usuarios con una suscripción
          activa. Elige un plan para continuar.
        </div>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn color="secondary" label="Ver planes" @click="goPlanes" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { api } from "boot/axios";
import { useRoute, useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { useAuthStore } from "src/stores/auth";
import ResenasCurso from "src/components/ResenasCurso.vue";

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const curso = ref(null);
const loading = ref(false);
const filtroNombre = ref("");
const showLoginDialog = ref(false);
const showSubsDialog = ref(false);
const currentTab = ref("unidades");

const tabs = [
  { label: "Unidades", value: "unidades" },
  { label: "Reseñas", value: "resenas" },
];

// Roles
const isProfesor = computed(() => auth.isProfessor);
const isAdmin = computed(() => auth.isAdmin);

// 🎯 FORMATEADOR DE TIEMPO
function formatearDuracion(segundos) {
  if (!segundos || segundos === 0) return "0s";

  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  const s = segundos % 60;

  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  if (m > 0) {
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  return `${s}s`;
}

// 📦 Cargar curso
async function loadCurso() {
  loading.value = true;
  try {
    const endpoint = auth.isAuthed
      ? `/cursos/${route.params.idcurso}`
      : `/catalogo/cursos/${route.params.idcurso}`;
    const { data } = await api.get(endpoint);
    curso.value = data;
  } catch (err) {
    console.error("❌ Error cargando curso:", err);
    $q.notify({ type: "negative", message: "Error cargando curso" });
  } finally {
    loading.value = false;
  }
}

// 🟡 Actualizar promedio
function actualizarPromedio(nuevoPromedio) {
  if (!curso.value) return;
  curso.value = { ...curso.value, promedio_resenas: nuevoPromedio };
}

// 🖼️ Imagenes
function fixUrl(unidad) {
  if (unidad.imagen_url) return unidad.imagen_url;
  if (unidad.imagen) return `http://127.0.0.1:8000/storage/${unidad.imagen}`;
  return "/images/unidad-placeholder.png";
}
function fixUrlCurso(cursoObj) {
  if (!cursoObj) return "/images/curso-placeholder.png";
  if (cursoObj.imagen_url) return cursoObj.imagen_url;
  if (cursoObj.imagen)
    return `http://127.0.0.1:8000/storage/${cursoObj.imagen}`;
  return "/images/curso-placeholder.png";
}

// 🔙 Volver
const volverLabel = computed(() =>
  isAdmin.value
    ? "Volver al Panel de Cursos"
    : isProfesor.value
    ? "Volver a Mis Cursos"
    : "Volver a Cursos"
);

function goBack() {
  if (isAdmin.value) router.push({ name: "admin-cursos-pendientes" });
  else if (isProfesor.value) router.push({ name: "cursos-list" });
  else router.push({ name: "catalogo-cursos" });
}

// 📘 Ver clases
function handleVerClases(idunidad) {
  if (!auth.isAuthed) {
    showLoginDialog.value = true;
    return;
  }
  if (auth.isStudent && !auth.hasSubscription) {
    showSubsDialog.value = true;
    return;
  }

  const destino = auth.isProfessor
    ? "profesor-unidad-detalle"
    : auth.isAdmin
    ? "admin-unidad-detalle"
    : "unidad-detalle";

  router.push({
    name: destino,
    params: { idcurso: route.params.idcurso, idunidad },
  });
}

// 🔗 Redirecciones
function goLogin() {
  showLoginDialog.value = false;
  router.push({ name: "login" });
}
function goPlanes() {
  showSubsDialog.value = false;
  router.push({ name: "planes" });
}

// 🔍 Filtro de unidades
const unidadesFiltradas = computed(() => {
  if (!curso.value || !curso.value.unidades) return [];
  const search = filtroNombre.value.toLowerCase().trim();
  return curso.value.unidades.filter((u) =>
    u.titulo?.toLowerCase().includes(search)
  );
});

onMounted(() => loadCurso());
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
  flex-direction: column;
  justify-content: flex-end;
  padding: 20px 24px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
}

/* 🔹 Título Curso */
.curso-titulo {
  font-size: 2.4rem;
  font-weight: 800;
  margin: 0 0 4px 0;
  color: #ffffff;
}
.curso-label {
  opacity: 0.9;
  margin-right: 6px;
}
.curso-nombre {
  font-weight: 900;
}

/* Panel info */
.curso-info-panel {
  background: #fff;
  border-top: 1px solid #ddd;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

/* Botones */
.boton-accion {
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  padding: 6px 16px;
  transition: 0.2s;
}
.boton-accion:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Info items */
.info-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.info-icon {
  font-size: 26px;
  margin-top: 2px;
}
.info-label {
  font-weight: 600;
  color: #37474f;
  margin-bottom: 2px;
  font-size: 1rem;
}
.info-value {
  color: #455a64;
  font-size: 1.3rem;
}

/* Descripción alineada con el resto */
.descripcion-item {
  margin-top: 4px;
}

/* Cards de unidades */
.unidad-card {
  border-radius: 14px;
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

/* Responsive pequeño */
@media (max-width: 768px) {
  .curso-titulo {
    font-size: 2rem;
  }
  .info-value {
    font-size: 1.15rem;
  }
}
</style>
