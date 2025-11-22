<template>
  <q-page class="q-pa-none bg-grey-1">
    <!-- 🖼️ Hero del curso -->
    <div class="curso-hero">
      <img
        :src="fixUrlCurso(curso)"
        alt="Imagen del curso"
        class="curso-hero-img"
      />
      <div class="curso-hero-overlay">
        <div class="curso-titulo-container">
          <h2 class="curso-titulo">{{ curso?.nombre }}</h2>
        </div>
      </div>
    </div>

    <!-- 📋 Info del curso -->
    <div v-if="curso" class="curso-info-panel q-pa-lg">
      <div class="row q-col-gutter-md q-mb-sm">
        <div class="col-12 col-md-4">
          <span class="info-label">Categoría:</span>
          <span class="info-value">{{
            curso.categoria?.nombre || "Sin categoría"
          }}</span>
        </div>
        <div class="col-12 col-md-4">
          <span class="info-label">Nivel:</span>
          <span class="info-value">{{ curso.nivel || "General" }}</span>
        </div>
      </div>

      <div class="q-mb-md">
        <span class="info-label">Descripción:</span>
        <span class="info-value">{{
          curso.descripcion || "Sin descripción"
        }}</span>
      </div>

      <q-btn
        color="blue"
        glossy
        icon="arrow_back"
        label="Volver al Curso"
        class="q-mt-sm"
        @click="volverCurso"
      />
    </div>

    <!-- 🎮 Título de juegos -->
    <div class="q-pa-md q-pt-none">
      <div
        class="text-h5 text-primary text-weight-bold q-mb-md flex items-center"
      >
        <q-icon
          name="sports_esports"
          color="primary"
          size="32px"
          class="q-mr-sm"
        />
        Juegos del Curso
      </div>

      <!-- 🕹️ Lista de juegos -->
      <div
        v-if="!cargando && juegos.length"
        class="row q-col-gutter-xl justify-center"
      >
        <div
          v-for="j in juegos"
          :key="j.idcursojuego"
          class="col-12 col-sm-6 col-md-4 col-lg-3"
        >
          <q-card
            class="juego-card cursor-pointer column justify-between"
            @click="abrirJuego(j)"
          >
            <q-img
              :src="j.imagen_url || '/images/juego-placeholder.jpg'"
              ratio="1"
              spinner-color="primary"
              class="rounded-borders"
            >
              <template v-slot:error>
                <div
                  class="absolute-full flex flex-center bg-grey-4 text-grey-8"
                >
                  Sin imagen
                </div>
              </template>
            </q-img>

            <q-card-section class="text-center q-pt-md">
              <div class="text-h6 text-indigo-9 text-weight-bold">
                {{ j.nombre_tema || j.juego?.nombre || "Juego sin título" }}
              </div>
              <div class="text-subtitle2 text-grey-7 q-mt-xs">
                Nivel {{ j.nivel || 1 }}
              </div>
            </q-card-section>

            <q-separator color="grey-3" />

            <q-card-actions align="around" class="q-pb-md q-pt-sm">
              <q-badge
                :color="j.activo ? 'green' : 'red'"
                :label="j.activo ? 'Activo' : 'Inactivo'"
                class="text-bold text-white"
              />
              <q-btn
                :disable="!j.activo"
                glossy
                color="deep-purple-6"
                icon="play_arrow"
                label="Jugar"
                @click.stop="abrirJuego(j)"
                rounded
              />
            </q-card-actions>
          </q-card>
        </div>
      </div>

      <!-- 🚫 Sin juegos -->
      <div
        v-else-if="!cargando && !juegos.length"
        class="text-center text-grey q-mt-xl"
      >
        <q-icon name="videogame_asset_off" size="80px" color="grey-5" />
        <div class="text-h6 q-mt-md">
          No hay juegos disponibles en este curso
        </div>
      </div>

      <!-- 🔄 Cargando -->
      <div v-else class="flex flex-center q-mt-xl">
        <q-spinner color="primary" size="50px" />
        <span class="text-grey q-ml-md">Cargando juegos...</span>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { api } from "boot/axios";

const $q = useQuasar();
const route = useRoute();
const router = useRouter();

const juegos = ref([]);
const curso = ref(null);
const cargando = ref(false);

async function cargarDatos() {
  cargando.value = true;
  try {
    const { idcurso } = route.params;
    const [cursoRes, juegosRes] = await Promise.all([
      api.get(`/cursos/${idcurso}`),
      api.get(`/juegos/curso/${idcurso}`),
    ]);
    curso.value = cursoRes.data;
    juegos.value = juegosRes.data.data || [];
  } catch (e) {
    console.error("❌ Error al cargar datos:", e);
    $q.notify({
      type: "negative",
      message: "Error al cargar información del curso o juegos.",
    });
  } finally {
    cargando.value = false;
  }
}

function abrirJuego(juego) {
  if (!juego.activo) {
    $q.notify({ type: "warning", message: "Este juego aún no está activo." });
    return;
  }
  router.push({
    name: "juego-inicio",
    params: { idcursojuego: juego.idcursojuego },
  });
}

function volverCurso() {
  router.push({
    name: "curso-detalle",
    params: { idcurso: route.params.idcurso },
  });
}

function fixUrlCurso(curso) {
  if (!curso) return "/images/curso-placeholder.png";
  if (curso.imagen_url) return curso.imagen_url;
  if (curso.imagen) return `http://127.0.0.1:8000/storage/${curso.imagen}`;
  return "/images/curso-placeholder.png";
}

onMounted(() => cargarDatos());
</script>

<style scoped>
/* 🔹 Hero del curso */
.curso-hero {
  position: relative;
  width: 100%;
  height: 240px;
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
  padding: 20px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.65), transparent);
}
.curso-titulo-container {
  color: white;
}
.curso-titulo {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 4px;
}

/* 🔹 Info del curso */
.curso-info-panel {
  background: #fff;
  border-top: 1px solid #ddd;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}
.info-label {
  font-weight: 600;
  color: #37474f;
  margin-right: 6px;
}
.info-value {
  color: #455a64;
}

/* 🔹 Cards de juegos */
.juego-card {
  border-radius: 18px;
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  box-shadow: 0 2px 12px rgba(120, 80, 255, 0.2);
  background: linear-gradient(180deg, #ffffff, #f6f2ff);
}
.juego-card:hover {
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(160, 80, 255, 0.4);
}
.q-badge {
  font-weight: 700;
  padding: 6px 10px;
  border-radius: 8px;
}
.q-btn {
  font-weight: 600;
  text-transform: uppercase;
}
</style>
