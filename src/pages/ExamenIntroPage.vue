<template>
  <q-page class="examen-inicio-page q-pa-none">
    <!-- 🧭 HERO ENCABEZADO -->
    <div class="hero-encabezado">
      <img :src="unidadImagen" alt="Imagen de la unidad" class="hero-img" />
      <div class="hero-overlay">
        <div
          class="hero-content column items-start justify-end q-px-lg q-pb-md"
        >
          <div v-if="examen?.unidad" class="unidad-info q-mb-md">
            <div class="unidad-titulo">
              {{ examen.unidad.titulo || "Sin unidad" }}
            </div>
            <div class="unidad-curso">
              Curso: {{ examen.unidad.curso?.nombre || "Sin curso" }}
            </div>
          </div>

          <q-btn
            class="boton-volver"
            glossy
            size="sm"
            unelevated
            icon="arrow_back"
            label="Volver a unidades"
            @click="volverUnidad"
          />
        </div>
      </div>
    </div>

    <!-- 📋 TARJETA DE INFORMACIÓN DEL EXAMEN -->
    <div class="examen-container">
      <q-card class="shadow-6 q-pa-xl examen-card">
        <div class="text-h4 text-morado text-bold q-mb-md text-center">
          ✨ {{ examen?.titulo || "Examen sin título" }} ✨
        </div>
        <div class="text-body1 text-light text-center q-mb-md">
          {{ examen?.descripcion || "Sin descripción disponible." }}
        </div>

        <q-separator color="grey-4" spaced />

        <!-- 🔹 Estadísticas -->
        <div class="q-mt-lg row justify-evenly text-center q-col-gutter-lg">
          <div>
            <div class="text-morado text-bold">
              <q-icon name="schedule" /> Duración
            </div>
            <div class="text-h6 text-white">
              {{ (examen?.duracion_segundos / 60).toFixed(0) }} min
            </div>
          </div>

          <div>
            <div class="text-morado text-bold">
              <q-icon name="favorite" color="pink" /> Vidas
            </div>
            <div class="text-h6 text-white">{{ examen?.vidas }}</div>
          </div>

          <div>
            <div class="text-morado text-bold">
              <q-icon name="bar_chart" color="purple" /> Aprobación
            </div>
            <div class="text-h6 text-white">
              {{ examen?.minimo_aprobacion }}%
            </div>
          </div>
        </div>

        <q-separator color="grey-4" spaced />

        <!-- 🎯 BOTONES -->
        <div class="q-mt-xl flex justify-center q-gutter-md">
          <q-btn
            color="deep-purple-6"
            glossy
            icon="play_arrow"
            label="Comenzar intento"
            @click="goToPlay"
            rounded
            size="lg"
          />

          <!-- 📊 Solo visible para profesores -->
          <q-btn
            v-if="auth.isProfessor"
            color="purple-6"
            glossy
            icon="bar_chart"
            label="Ver estadísticas"
            @click="goToEstadisticas"
            rounded
            size="lg"
          />
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { api } from "boot/axios";
import { useAuthStore } from "src/stores/auth"; // ✅ para detectar si es profesor

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const auth = useAuthStore(); // 🧠 acceso al rol del usuario

const examen = ref(null);
const unidadImagen = ref("/images/unidad-placeholder.png");

async function loadExamen() {
  try {
    const { idexamen } = route.params;
    const { data } = await api.get(`/examenes/${idexamen}`);
    examen.value = data;
    unidadImagen.value =
      data.unidad?.imagen_url ||
      data.unidad?.imagen ||
      "/images/unidad-placeholder.png";
  } catch (err) {
    console.error("❌ Error cargando examen:", err);
    $q.notify({ type: "negative", message: "No se pudo cargar el examen." });
  }
}

function goToPlay() {
  router.push({
    name: "examen-play",
    params: { idexamen: examen.value.idexamen },
  });
}

// 📊 Ir a estadísticas (solo para profesores)
function goToEstadisticas() {
  router.push({
    name: "examen-estadisticas",
    params: { idexamen: examen.value.idexamen },
  });
}

function volverUnidad() {
  const idunidad = examen.value?.idunidad || examen.value?.unidad?.idunidad;
  const idcurso = examen.value?.unidad?.curso?.idcurso || examen.value?.idcurso;
  if (idcurso && idunidad) {
    router.push({
      name: "unidad-detalle",
      params: { idcurso, idunidad },
    });
  } else {
    router.back();
  }
}

onMounted(() => loadExamen());
</script>

<style scoped>
/* 🌿 Fondo blanco */
.examen-inicio-page {
  background: #ffffff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 🧭 HERO */
.hero-encabezado {
  position: relative;
  width: 100%;
  height: 260px;
  overflow: hidden;
  border-bottom: 3px solid rgba(162, 0, 220, 0.4);
  box-shadow: 0 4px 15px rgba(150, 0, 255, 0.2);
}
.hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.8);
}
.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.2));
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
}
.hero-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
}

/* 🧾 Unidad */
.unidad-titulo {
  font-size: 2.4rem;
  font-weight: 900;
  color: #fff;
  text-shadow: 0 0 12px #a200dc, 0 0 25px #d86cff;
}
.unidad-curso {
  font-size: 1.2rem;
  color: #e5d9ff;
  text-shadow: 0 0 6px rgba(255, 255, 255, 0.3);
}

/* 🔙 Botón volver */
.boton-volver {
  background: linear-gradient(90deg, #00cc66, #39ff14) !important;
  color: #fff !important;
  font-weight: 600;
  border-radius: 999px;
  box-shadow: 0 0 10px rgba(57, 255, 20, 0.5);
  transition: all 0.3s ease;
}
.boton-volver:hover {
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(57, 255, 20, 0.8);
}

/* 📊 Tarjeta principal */
.examen-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
}
.examen-card {
  max-width: 900px;
  width: 100%;
  border-radius: 30px;
  padding: 50px 60px;
  background: linear-gradient(180deg, #5b02a6, #2e0068);
  color: white;
  box-shadow: 0 0 25px rgba(162, 0, 220, 0.5);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: fadeInUp 0.8s ease;
}
@keyframes fadeInUp {
  from {
    transform: translateY(25px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Título */
.text-h4 {
  font-size: 2rem;
  text-shadow: 0 0 12px #b86cff, 0 0 25px #a200dc;
}

/* Textos */
.text-morado {
  color: #d2a8ff;
  text-shadow: 0 0 8px #b86cff, 0 0 16px #a200dc;
}
.text-light {
  color: #e6dfff;
  text-shadow: 0 0 6px rgba(255, 255, 255, 0.25);
}

/* Botón principal */
.q-btn[color="deep-purple-6"] {
  background: linear-gradient(90deg, #a200dc, #7a00ff) !important;
  box-shadow: 0 0 15px rgba(162, 0, 220, 0.6);
  color: #fff !important;
  text-shadow: 0 0 8px #e0b3ff;
  font-weight: 700;
}
.q-btn[color="deep-purple-6"]:hover {
  box-shadow: 0 0 25px rgba(162, 0, 220, 0.9);
  transform: scale(1.06);
}

/* Separador */
.q-separator {
  opacity: 0.3;
  margin: 10px 0;
  border-color: rgba(255, 255, 255, 0.2);
}
</style>
