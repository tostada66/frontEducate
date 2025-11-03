<template>
  <q-page class="q-pa-none bg-grey-1">
    <!-- 🔷 Vista profesor -->
    <div
      v-if="auth.isProfessor"
      class="bg-primary text-white text-center q-pa-sm"
    >
      <q-icon name="visibility" class="q-mr-xs" />
      Vista previa de la unidad (Profesor)
    </div>

    <!-- 🖼️ Hero -->
    <div class="unidad-hero">
      <img
        :src="fixUrlUnidad(unidad)"
        alt="Imagen de la unidad"
        class="unidad-hero-img"
      />
      <div class="unidad-hero-overlay">
        <div class="unidad-titulo-container">
          <h2 class="unidad-titulo">{{ unidad?.titulo }}</h2>
          <div class="text-white text-caption">
            Parte del curso: {{ unidad?.curso?.nombre || "Sin curso" }}
          </div>
        </div>
      </div>
    </div>

    <!-- 📋 Información -->
    <div v-if="unidad" class="unidad-info-panel q-pa-lg">
      <div class="row q-col-gutter-md q-mb-md">
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
        <div class="col-12 col-md-8">
          <span class="info-label">Descripción:</span>
          <span class="info-value">{{
            unidad.descripcion || "Sin descripción"
          }}</span>
        </div>
      </div>

      <!-- 🔘 Botones -->
      <div class="row items-center q-gutter-md q-mt-md">
        <q-btn
          color="teal"
          unelevated
          icon="arrow_back"
          label="Volver al Catálogo"
          class="boton-accion"
          @click="goBack"
        />

        <!-- 🧠 Botón examen -->
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
    </div>

    <!-- 🟣 Filtros -->
    <div class="text-center q-mt-md">
      <q-chip
        v-for="f in filtros"
        :key="f.value"
        clickable
        :color="filtroActual === f.value ? 'primary' : 'grey-4'"
        :text-color="filtroActual === f.value ? 'white' : 'black'"
        @click="filtroActual = f.value"
        class="q-mx-xs text-weight-medium"
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

const unidad = ref(null);
const juegos = ref([]);
const loading = ref(false);

// 🔹 Filtros (Todos / Clases / Juegos)
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

// 📦 Cargar unidad y juegos
async function loadUnidad() {
  loading.value = true;
  try {
    const { idcurso, idunidad } = route.params;
    const { data } = await api.get(`/cursos/${idcurso}/unidades/${idunidad}`);
    unidad.value = data;
    await loadJuegos(idunidad);
  } catch (err) {
    console.error("❌ Error cargando unidad:", err);
    $q.notify({ type: "negative", message: "Error cargando unidad" });
  } finally {
    loading.value = false;
  }
}

async function loadJuegos(idunidad) {
  try {
    const { data } = await api.get(`/juegos/unidad/${idunidad}`);
    juegos.value = data.data || [];
  } catch (err) {
    console.warn("⚠️ No se pudieron cargar los juegos:", err);
  }
}

// 🖼️ Imagen hero
function fixUrlUnidad(u) {
  if (!u) return "/images/unidad-placeholder.png";
  if (u.imagen_url) return u.imagen_url;
  if (u.imagen) return `http://127.0.0.1:8000/storage/${u.imagen}`;
  return "/images/unidad-placeholder.png";
}

// 🔙 Volver
function goBack() {
  router.push({ name: "catalogo-cursos" });
}

// 🎬 Abrir clase
function abrirClase(clase) {
  const video = (clase.contenidos || []).find((c) => c.tipo === "video");
  const destino = auth.isProfessor
    ? "profesor-contenido-detalle"
    : auth.isAdmin
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
      message: "Esta clase no tiene video principal.",
    });
  }
}

// 🎮 Abrir juego → lleva a pantalla de inicio del juego
function abrirJuego(juego) {
  if (!juego.activo) {
    $q.notify({
      type: "warning",
      message: "Este juego aún no está activo.",
    });
    return;
  }

  router.push({
    name: "juego-inicio",
    params: {
      idcurso: route.params.idcurso,
      idunidad: route.params.idunidad,
      idcursojuego: juego.idcursojuego,
    },
  });
}

// 🧠 Botón examen
const puedeDarExamen = computed(() => {
  const u = unidad.value;
  if (!u?.tiene_examen) return false;
  if (auth.isStudent && u?.matriculado) return true;
  if (auth.isProfessor || auth.isAdmin) return true;
  return false;
});

function irAExamen() {
  const examen = unidad.value?.examen;
  if (!examen) {
    return $q.notify({
      type: "warning",
      message: "Esta unidad no tiene examen disponible aún.",
    });
  }

  const params = {
    idcurso: route.params.idcurso,
    idunidad: route.params.idunidad,
    idexamen: examen.idexamen,
  };

  const query = auth.isProfessor || auth.isAdmin ? { preview: true } : {};
  router.push({ name: "examen-intro", params, query });
}

onMounted(() => loadUnidad());
</script>

<style scoped>
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
  justify-content: flex-end;
  padding: 20px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.55), transparent);
}
.unidad-titulo {
  font-size: 1.8rem;
  font-weight: 700;
  color: white;
}
.unidad-info-panel {
  background: #fff;
  border-top: 1px solid #ddd;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}
.boton-accion {
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  padding: 6px 16px;
}
.clase-item {
  padding: 18px;
  min-height: 80px;
}
.clase-titulo {
  font-size: 1.1rem;
  font-weight: 700;
  color: #333;
}
.clase-desc {
  font-size: 0.95rem !important;
  color: #666 !important;
}
.juego-card {
  border-radius: 14px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}
.juego-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.15);
}
</style>
