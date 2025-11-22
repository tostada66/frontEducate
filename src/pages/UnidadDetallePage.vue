<template>
  <q-page class="q-pa-none bg-grey-1">
    <!-- 🖼️ HERO + BOTÓN VOLVER ENCIMA -->
    <div class="unidad-hero">
      <img
        :src="fixUrlUnidad(unidad)"
        alt="Imagen de la unidad"
        class="unidad-hero-img"
      />

      <div class="unidad-hero-overlay">
        <!-- 🔙 Botón volver sobre la imagen -->
        <div class="volver-container">
          <q-btn
            color="teal"
            unelevated
            icon="arrow_back"
            label="Volver al Catálogo"
            class="boton-volver"
            @click="goBack"
          />
        </div>

        <!-- Título -->
        <h2 class="unidad-titulo">
          <span class="unidad-label">Unidad:</span>
          {{ unidad?.titulo }}
        </h2>
      </div>
    </div>

    <!-- 🔷 Vista profesor debajo del hero -->
    <div
      v-if="auth.isProfessor"
      class="bg-primary text-white text-center q-pa-sm q-mt-sm"
    >
      <q-icon name="visibility" class="q-mr-xs" />
      Vista previa de la unidad (Profesor)
    </div>

    <!-- 📋 CARD PRINCIPAL DE INFORMACIÓN (más compacta) -->
    <q-card v-if="unidad" flat bordered class="unidad-info-card q-pa-lg">
      <!-- Fila de info principal -->
      <div class="row q-col-gutter-md info-row">
        <!-- Curso -->
        <div class="col-12 col-md-4 info-box">
          <q-icon name="menu_book" class="info-icon text-indigo-7" />
          <div class="info-text">
            <span class="info-label">Curso:</span>
            <span class="info-value">
              {{ unidad.curso?.nombre || "Sin curso" }}
            </span>
          </div>
        </div>

        <!-- Duración -->
        <div class="col-12 col-md-4 info-box">
          <q-icon name="schedule" class="info-icon text-teal-7" />
          <div class="info-text">
            <span class="info-label">Duración:</span>
            <span class="info-value">
              {{ formatearDuracion(unidad.duracion_total) }}
            </span>
          </div>
        </div>

        <!-- Clases -->
        <div class="col-12 col-md-4 info-box">
          <q-icon name="import_contacts" class="info-icon text-orange-7" />
          <div class="info-text">
            <span class="info-label">Clases:</span>
            <span class="info-value">
              {{ unidad.clases?.length || 0 }}
            </span>
          </div>
        </div>
      </div>

      <!-- Descripción en una sola línea tipo curso -->
      <div class="descripcion-row q-mt-sm">
        <q-icon name="description" class="info-icon text-blue-7" />
        <div class="info-text descripcion-inline">
          <span class="info-label">Descripción:</span>
          <span class="info-value">
            {{ unidad.descripcion || "Sin descripción" }}
          </span>
        </div>
      </div>

      <!-- Examen -->
      <div class="row items-center q-gutter-md q-mt-md">
        <q-btn
          v-if="puedeDarExamen"
          color="deep-purple-6"
          glossy
          rounded
          icon="quiz"
          :label="
            auth.isProfessor || auth.isAdmin ? 'Ver Examen' : 'Realizar Examen'
          "
          class="boton-accion text-white"
          @click="irAExamen"
        />
      </div>
    </q-card>

    <!-- 🟣 Filtros -->
    <div class="text-center q-mt-lg q-mb-md">
      <q-chip
        v-for="f in filtros"
        :key="f.value"
        clickable
        :color="filtroActual === f.value ? 'primary' : 'grey-4'"
        :text-color="filtroActual === f.value ? 'white' : 'black'"
        @click="filtroActual = f.value"
        class="chip-filtro"
      >
        <q-icon :name="f.icon" class="q-mr-xs" />
        {{ f.label }}
      </q-chip>
    </div>

    <!-- 📘 Clases -->
    <div v-if="mostrarClases" class="q-pa-lg">
      <div class="text-h5 text-primary text-bold q-mb-md">
        📚 Clases de esta unidad
      </div>

      <q-list
        bordered
        separator
        class="rounded-borders shadow-2 bg-white"
        v-if="unidad?.clases?.length"
      >
        <q-item
          v-for="clase in unidad.clases"
          :key="clase.idclase"
          clickable
          v-ripple
          class="clase-card"
          @click="abrirClase(clase)"
        >
          <!-- Miniatura del primer video de la clase -->
          <q-item-section avatar>
            <q-avatar square size="120px" class="thumb-container">
              <img
                :src="getMiniatura(clase)"
                class="thumb-img"
                alt="miniatura clase"
              />
              <div class="thumb-duration">{{ getDuracionClase(clase) }}</div>
            </q-avatar>
          </q-item-section>

          <!-- Info de la clase -->
          <q-item-section>
            <q-item-label class="titulo-clase">
              {{ clase.titulo }}
            </q-item-label>
            <q-item-label caption class="desc-clase">
              {{ clase.descripcion || "Sin descripción" }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <div v-else class="text-center text-grey q-mt-md">
        No se encontraron clases registradas en esta unidad.
      </div>
    </div>

    <!-- 🎮 Juegos -->
    <div v-if="mostrarJuegos" class="q-pa-lg">
      <div class="text-h5 text-indigo-8 text-bold q-mb-md">
        🎮 Juegos de esta unidad
      </div>

      <div v-if="juegos.length" class="row q-col-gutter-lg">
        <div
          v-for="j in juegos"
          :key="j.idcursojuego"
          class="col-12 col-md-6 col-lg-4"
        >
          <q-card class="juego-card cursor-pointer" @click="abrirJuego(j)">
            <q-img
              :src="j.imagen_url || '/images/juego-placeholder.png'"
              height="150px"
              spinner-color="primary"
            />

            <q-card-section>
              <div class="text-h6 text-weight-bold text-primary q-mb-xs">
                {{ j.nombre_tema || j.juego?.nombre }}
              </div>

              <div class="text-caption text-grey-7">
                Nivel {{ j.nivel || 1 }} ·
                <span :class="j.activo ? 'text-green' : 'text-red'">
                  {{ j.activo ? "Activo" : "Inactivo" }}
                </span>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <div v-else class="text-center text-grey q-mt-md">
        No hay juegos registrados en esta unidad.
      </div>
    </div>

    <!-- Loader -->
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

const unidad = ref(null);
const juegos = ref([]);
const loading = ref(false);

/* 🎯 Filtros */
const filtroActual = ref("todos");
const filtros = [
  { label: "Todos", value: "todos", icon: "apps" },
  { label: "Clases", value: "clases", icon: "menu_book" },
  { label: "Juegos", value: "juegos", icon: "sports_esports" },
];

const mostrarClases = computed(
  () => filtroActual.value === "todos" || filtroActual.value === "clases"
);
const mostrarJuegos = computed(
  () => filtroActual.value === "todos" || filtroActual.value === "juegos"
);

/* 📌 Miniatura del video de la clase */
function getMiniatura(clase) {
  const video = (clase.contenidos || []).find((c) => c.tipo === "video");
  if (!video) return "/images/video-placeholder.png";
  return video.miniatura_publica || video.archivo;
}

/* ⏱ Duración del video de la clase */
function getDuracionClase(clase) {
  const video = (clase.contenidos || []).find((c) => c.tipo === "video");
  if (!video?.duracion) return "0:00";

  const s = Number(video.duracion);
  const m = Math.floor(s / 60);
  const sec = String(s % 60).padStart(2, "0");

  return `${m}:${sec}`;
}

/* 📌 Fix imagen */
function fixUrlUnidad(u) {
  if (!u) return "/images/unidad-placeholder.png";
  if (u.imagen_url) return u.imagen_url;
  if (u.imagen) return `http://127.0.0.1:8000/storage/${u.imagen}`;
  return "/images/unidad-placeholder.png";
}

/* 🕒 Duración total de la unidad */
function formatearDuracion(segundos) {
  if (!segundos || segundos === 0) return "0s";

  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  const s = segundos % 60;

  if (h > 0)
    return `${h}:${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  if (m > 0) return `${m}:${s.toString().padStart(2, "0")}`;
  return `${s}s`;
}

/* 📦 Cargar unidad */
async function loadUnidad() {
  loading.value = true;
  try {
    const { idcurso, idunidad } = route.params;
    const { data } = await api.get(`/cursos/${idcurso}/unidades/${idunidad}`);
    unidad.value = data;
    await loadJuegos(idunidad);
  } catch (err) {
    $q.notify({ type: "negative", message: "Error cargando unidad" });
  } finally {
    loading.value = false;
  }
}

async function loadJuegos(idunidad) {
  try {
    const { data } = await api.get(`/juegos/unidad/${idunidad}`);
    juegos.value = data.data || [];
  } catch (_) {}
}

/* 🔙 Volver */
function goBack() {
  router.push({ name: "catalogo-cursos" });
}

/* 🎬 Abrir clase */
function abrirClase(clase) {
  const video = (clase.contenidos || []).find((c) => c.tipo === "video");

  const destino = auth.isProfessor
    ? "profesor-contenido-detalle"
    : auth.isAdmin
    ? "admin-contenido-detalle"
    : "contenido-detalle";

  if (!video) {
    return $q.notify({
      type: "warning",
      message: "Esta clase no tiene video.",
    });
  }

  router.push({
    name: destino,
    params: {
      idcurso: route.params.idcurso,
      idunidad: route.params.idunidad,
      idclase: clase.idclase,
      idcontenido: video.idcontenido,
    },
  });
}

/* 🎮 Abrir juego */
function abrirJuego(juego) {
  if (!juego.activo)
    return $q.notify({
      type: "warning",
      message: "Este juego aún no está activo.",
    });

  router.push({
    name: "juego-inicio",
    params: {
      idcurso: route.params.idcurso,
      idunidad: route.params.idunidad,
      idcursojuego: juego.idcursojuego,
    },
  });
}

/* 🧠 Examen */
const puedeDarExamen = computed(() => {
  const u = unidad.value;
  if (!u?.tiene_examen) return false;
  if (auth.isStudent && u?.matriculado) return true;
  if (auth.isProfessor || auth.isAdmin) return true;
  return false;
});

function irAExamen() {
  const examen = unidad.value?.examen;
  if (!examen)
    return $q.notify({
      type: "warning",
      message: "Esta unidad no tiene examen disponible.",
    });

  router.push({
    name: "examen-intro",
    params: {
      idcurso: route.params.idcurso,
      idunidad: route.params.idunidad,
      idexamen: examen.idexamen,
    },
    query: auth.isProfessor || auth.isAdmin ? { preview: true } : {},
  });
}

onMounted(() => loadUnidad());
</script>

<style scoped>
/* --- HERO + BOTÓN --- */
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
  flex-direction: column;
  justify-content: space-between;
  padding: 16px 30px 40px 30px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.55), transparent);
}

.boton-volver {
  font-weight: 700;
  border-radius: 10px;
  backdrop-filter: blur(4px);
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

/* --- TÍTULO EN HERO --- */
.unidad-titulo {
  font-size: 2.4rem;
  font-weight: 900;
  color: white;
  margin: 0;
}

/* --- CARD PRINCIPAL (tipo panel de curso) --- */
.unidad-info-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 3px 14px rgba(0, 0, 0, 0.08);
  margin: 14px auto 24px auto;
  width: 95%;
  max-width: 1400px;
  position: relative;
  z-index: 1;
  border-top: 1px solid #e0e0e0;
}

.info-row {
  border-bottom: 1px solid #eeeeee;
  padding-bottom: 8px;
  margin-bottom: 4px;
}

.info-box {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.info-icon {
  font-size: 24px;
  margin-right: 8px;
}

.info-text {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px;
}

.info-label {
  font-weight: 600;
  color: #37474f;
  margin-right: 6px;
  font-size: 1.3rem; /* 🔼 antes sin tamaño o más pequeño */
}

.info-value {
  color: #455a64;
  font-size: 1.3rem; /* 🔼 un poco más grande */
}
/* Descripción alineada en una fila, más limpia */
.descripcion-row {
  display: flex;
  align-items: flex-start;
  margin-top: 4px;
}

.descripcion-inline {
  flex: 1;
}

.descripcion-inline .info-value {
  font-size: 1.3rem;
}

/* Chips de filtro */
.chip-filtro {
  font-size: 1rem;
  padding: 10px 18px !important;
  border-radius: 12px;
  margin: 0 4px;
}

/* 🌟 NUEVO DISEÑO DE CLASES */
.clase-card {
  padding: 14px;
  border-radius: 14px;
  transition: 0.25s;
}

.clase-card:hover {
  background: #f5f7ff;
  transform: translateY(-3px);
}

.thumb-container {
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
}

.thumb-duration {
  position: absolute;
  bottom: 6px;
  right: 6px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 4px;
}

.titulo-clase {
  font-weight: 700;
  font-size: 1.15rem;
  color: #1a237e;
  margin-bottom: 6px;
}

.desc-clase {
  font-size: 0.9rem;
  color: #555;
}

/* 🎮 JUEGOS */
.juego-card {
  border-radius: 14px;
  transition: 0.2s;
}

.juego-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.15);
}

/* Responsive básico para la card */
@media (max-width: 768px) {
  .unidad-info-card {
    width: 96%;
    margin: 10px auto 20px auto;
  }

  .info-row {
    padding-bottom: 6px;
  }

  .info-icon {
    font-size: 22px;
  }

  .unidad-titulo {
    font-size: 2rem;
  }
}
</style>
