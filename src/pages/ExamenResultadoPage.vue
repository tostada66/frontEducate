<template>
  <q-page class="examen-resultado-page q-pa-none">
    <!-- 🧭 Hero del examen -->
    <div class="hero-encabezado">
      <img :src="unidadImagen" alt="Imagen unidad" class="hero-img" />

      <div class="hero-overlay">
        <div
          class="hero-content column items-start justify-end q-px-lg q-pb-md"
        >
          <div v-if="examen?.unidad" class="unidad-info q-mb-md">
            <div class="unidad-titulo">
              {{ examen.unidad.titulo || "Sin unidad" }}
            </div>
            <div class="unidad-curso">
              {{ examen.unidad.curso?.nombre || "Sin curso" }}
            </div>
          </div>
          <div v-else class="unidad-info q-mb-md">
            <div class="unidad-titulo">Cargando unidad...</div>
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

    <!-- 📋 Resultados -->
    <div class="resultados-container">
      <q-card class="shadow-6 q-pa-xl resultado-card">
        <div class="text-h5 text-morado text-bold q-mb-md">
          ✨ Resultado del examen ✨
        </div>

        <q-separator color="grey-4" spaced />

        <div
          class="q-mt-md text-h4 text-bold"
          :class="aprobado ? 'text-positive' : 'text-negative'"
        >
          {{ aprobado ? "¡Aprobado! 🎉" : "No aprobado 😞" }}
        </div>

        <!-- 🔹 Datos principales -->
        <div class="q-mt-lg row justify-evenly text-center q-col-gutter-lg">
          <div>
            <div class="text-morado text-bold">
              <q-icon name="bar_chart" /> Puntaje
            </div>
            <div class="text-h6 text-white">{{ puntaje }}%</div>
          </div>

          <div>
            <div class="text-morado text-bold">
              <q-icon name="schedule" /> Tiempo usado
            </div>
            <div class="text-h6 text-white">{{ tiempoFormateado }}</div>
          </div>

          <div>
            <div class="text-morado text-bold">
              <q-icon name="favorite" color="pink" /> Vidas
            </div>
            <div class="text-h6 text-white">{{ vidasRestantes }}</div>
          </div>
        </div>

        <!-- 🔸 Nuevas métricas -->
        <q-separator color="grey-4" spaced />

        <div class="q-mt-lg row justify-evenly text-center q-col-gutter-lg">
          <div>
            <div class="text-green text-bold">
              <q-icon name="check_circle" color="green-5" /> Correctas
            </div>
            <div class="text-h6 text-white">{{ correctas }}</div>
          </div>

          <div>
            <div class="text-red text-bold">
              <q-icon name="cancel" color="red-5" /> Incorrectas
            </div>
            <div class="text-h6 text-white">{{ incorrectas }}</div>
          </div>

          <div>
            <div class="text-grey-4 text-bold">
              <q-icon name="help_outline" color="grey-4" /> No respondidas
            </div>
            <div class="text-h6 text-white">{{ vacias }}</div>
          </div>
        </div>

        <q-separator color="grey-4" spaced />

        <!-- 🔘 Botones -->
        <div class="q-mt-xl flex justify-center q-gutter-md">
          <q-btn
            color="deep-purple-6"
            glossy
            icon="replay"
            label="Reintentar examen"
            @click="reintentarExamen"
            rounded
          />
          <q-btn
            color="green-6"
            glossy
            icon="arrow_back"
            label="Volver a unidad"
            @click="volverUnidad"
            rounded
          />
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { api } from "boot/axios";

const $q = useQuasar();
const route = useRoute();
const router = useRouter();

const examen = ref(null);
const unidadImagen = ref("/images/unidad-placeholder.png");
const aprobado = ref(false);
const puntaje = ref(0);
const tiempoUsado = ref(0);
const vidasRestantes = ref(3);
const correctas = ref(0);
const incorrectas = ref(0);
const vacias = ref(0);

// ⏱ Formatear tiempo
const tiempoFormateado = computed(() => {
  const min = Math.floor(tiempoUsado.value / 60);
  const seg = tiempoUsado.value % 60;
  return `${min}m ${seg}s`;
});

// 📊 Cargar resultado
async function loadResultado() {
  try {
    const { idintento } = route.params;
    const { data } = await api.get(`/intentos/${idintento}`);
    examen.value = data.examen;
    puntaje.value = data.puntaje;
    tiempoUsado.value = data.tiempo_usado;
    vidasRestantes.value = data.vidas_restantes;
    aprobado.value = data.aprobado;

    // 👇 Nuevos campos del backend
    correctas.value = data.correctas || 0;
    incorrectas.value = data.incorrectas || 0;
    vacias.value = data.vacias || 0;

    unidadImagen.value =
      data.examen?.unidad?.imagen_url ||
      data.examen?.unidad?.imagen ||
      "/images/unidad-placeholder.png";
  } catch (err) {
    console.error("❌ Error cargando resultado:", err);
    $q.notify({ type: "negative", message: "No se pudo cargar el resultado." });
  }
}

function volverUnidad() {
  const idunidad = examen.value?.unidad?.idunidad;
  const idcurso = examen.value?.unidad?.curso?.idcurso;
  if (idcurso && idunidad) {
    router.push({ name: "unidad-detalle", params: { idcurso, idunidad } });
  } else {
    router.back();
  }
}

function reintentarExamen() {
  router.push({
    name: "examen-play",
    params: { idexamen: examen.value.idexamen },
  });
}

onMounted(() => loadResultado());
</script>

<style scoped>
/* 🎨 Fondo general */
.examen-resultado-page {
  background: radial-gradient(circle at 25% 25%, #3b0a73, #1a0033 85%);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 🧭 Hero superior */
.hero-encabezado {
  position: relative;
  width: 100%;
  height: 260px;
  overflow: hidden;
  border-bottom: 3px solid rgba(162, 0, 220, 0.4);
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
  background: linear-gradient(to top, rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.2));
  display: flex;
  align-items: flex-end;
}
.hero-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
}

/* 📘 Texto unidad */
.unidad-info {
  margin-left: 5px;
}
.unidad-titulo {
  font-size: 2.2rem;
  font-weight: 900;
  color: #ffffff;
  text-transform: capitalize;
  text-shadow: 0 0 12px #a200dc, 0 0 25px #d86cff, 0 0 45px #c47bff;
}
.unidad-curso {
  font-size: 1.1rem;
  color: #ddd;
}

/* 🔙 Botón volver */
.boton-volver {
  background: linear-gradient(90deg, #00cc66, #32ff7e) !important;
  color: #fff !important;
  font-weight: 600;
  border-radius: 999px;
  box-shadow: 0 0 8px rgba(57, 255, 20, 0.4);
  transition: all 0.3s ease;
}
.boton-volver:hover {
  transform: scale(1.05);
}

/* 🧾 Contenedor resultados */
.resultados-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

/* 📊 Tarjeta */
.resultado-card {
  max-width: 720px;
  border-radius: 26px;
  padding: 40px;
  background: linear-gradient(180deg, #4b0082, #2a005a);
  color: white;
  box-shadow: 0 0 25px rgba(162, 0, 220, 0.6), 0 0 55px rgba(120, 0, 255, 0.3);
  backdrop-filter: blur(6px) brightness(1.1);
}

/* Textos */
.text-morado {
  color: #d2a8ff;
  text-shadow: 0 0 8px #b86cff, 0 0 16px #a200dc;
}
.text-positive {
  color: #00ff88 !important;
  text-shadow: 0 0 10px #39ff14;
}
.text-negative {
  color: #ff4d4d !important;
  text-shadow: 0 0 10px #ff1a1a;
}

/* Bloques de info */
.resultado-card .row > div {
  background: rgba(255, 255, 255, 0.08);
  padding: 16px 24px;
  border-radius: 16px;
  transition: transform 0.3s ease;
}
.resultado-card .row > div:hover {
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(162, 0, 220, 0.6);
}

/* Botones */
.q-btn {
  font-weight: 600;
  border-radius: 999px;
  padding: 10px 24px;
  transition: all 0.3s ease;
}
.q-btn[color="deep-purple-6"] {
  background: linear-gradient(90deg, #a200dc, #7a00ff) !important;
  box-shadow: 0 0 15px rgba(162, 0, 220, 0.7);
}
.q-btn[color="green-6"] {
  background: linear-gradient(90deg, #00ff88, #39ff14) !important;
}

/* Separadores */
.q-separator {
  opacity: 0.3;
  margin: 10px 0;
  border-color: rgba(255, 255, 255, 0.2);
}
</style>
