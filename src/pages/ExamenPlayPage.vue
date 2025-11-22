<template>
  <q-page class="examen-play-page flex flex-center q-pa-lg bg-violet-gradient">
    <!-- ⏳ Loader -->
    <div v-if="loading" class="text-center text-white q-mt-xl">
      <q-spinner-hourglass color="white" size="60px" />
      <div class="q-mt-md">Cargando examen...</div>
    </div>

    <!-- 🧠 Examen activo -->
    <q-card
      v-else-if="preguntaActual"
      class="quiz-card shadow-10 q-pa-md relative-position"
    >
      <!-- 💜 Encabezado -->
      <q-card-section class="text-center relative-position">
        <div class="titulo-examen neon-text">{{ examen?.titulo }}</div>

        <!-- 🔹 Número de pregunta -->
        <div class="pregunta-contador text-white q-mt-xs">
          <span>Pregunta</span>
          <span class="numero"> {{ indiceActual + 1 }} </span>
          <span>de {{ preguntas.length }}</span>
        </div>

        <!-- ❤️ Corazones -->
        <div class="vidas-container">
          <q-icon
            v-for="n in maxVidas"
            :key="n"
            name="favorite"
            size="26px"
            :color="n <= vidas ? 'pink-5' : 'grey-6'"
            class="vida-icon"
          />
        </div>
      </q-card-section>

      <!-- 🕰 Tiempo -->
      <div class="flex flex-center q-my-sm">
        <div class="timer-container">
          <q-icon name="hourglass_empty" class="timer-icon" size="28px" />
          <span class="text-white text-bold q-ml-xs"
            >{{ tiempoRestante }}s</span
          >
        </div>
      </div>

      <!-- 📊 Barra progreso -->
      <div class="progress-wrapper q-my-md flex justify-center">
        <div
          class="progress-chip"
          :class="{
            pulse:
              tiempoRestante <= (preguntaActual?.tiempo_segundos || 10) / 4,
          }"
        >
          <div
            class="progress-fill"
            :style="{ width: progresoAnimado + '%' }"
          ></div>
        </div>
      </div>

      <!-- 🧩 Pregunta -->
      <q-card-section class="text-center">
        <div class="pregunta-texto q-mb-lg">
          {{ preguntaActual.texto }}
        </div>

        <!-- Opciones -->
        <div class="column q-gutter-sm">
          <q-btn
            v-for="(resp, i) in preguntaActual.respuestas"
            :key="i"
            :label="resp.texto"
            glossy
            no-caps
            :class="['opcion-btn', colorOpcion(i, resp)]"
            @click="seleccionarRespuesta(i, resp)"
            :disable="respondida"
          />
        </div>
      </q-card-section>
    </q-card>
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
const preguntas = ref([]);
const indiceActual = ref(0);
const tiempoRestante = ref(0);
const progresoAnimado = ref(100);
const seleccion = ref(null);
const respondida = ref(false);
const respuestaCorrecta = ref(null);
const loading = ref(true);
const idintento = ref(null);
const vidas = ref(3);
const maxVidas = 3;
let timer = null;
let intervalAnim = null;

const preguntaActual = computed(() => preguntas.value[indiceActual.value]);

// 🧩 Cargar examen e iniciar intento
async function loadExamen() {
  try {
    loading.value = true;
    const { idexamen } = route.params;

    const intentoRes = await api.post("/intentos", { idexamen });
    idintento.value = intentoRes.data.intento.idintento;

    const { data } = await api.get(`/examenes/${idexamen}`);
    examen.value = data;
    preguntas.value = data.preguntas || [];

    if (preguntas.value.length > 0) iniciarTiempo();
  } catch {
    $q.notify({ type: "negative", message: "Error cargando examen." });
  } finally {
    loading.value = false;
  }
}

// ⏱ Manejo de tiempo fluido
function iniciarTiempo() {
  clearInterval(timer);
  clearInterval(intervalAnim);
  if (!preguntaActual.value) return;

  const duracion = preguntaActual.value.tiempo_segundos || 10;
  tiempoRestante.value = duracion;
  progresoAnimado.value = 100;

  const start = Date.now();
  const end = start + duracion * 1000;

  // Animación de progreso
  intervalAnim = setInterval(() => {
    const now = Date.now();
    const progress = Math.max(0, ((end - now) / (duracion * 1000)) * 100);
    progresoAnimado.value = progress;
    if (progress <= 0) clearInterval(intervalAnim);
  }, 30);

  // Cuenta regresiva
  timer = setInterval(() => {
    if (tiempoRestante.value > 0) {
      tiempoRestante.value--;
    } else {
      procesarRespuesta(null, true);
    }
  }, 1000);
}

// 🟢 Selección de respuesta sin parpadeo
async function seleccionarRespuesta(i, respuesta) {
  if (respondida.value) return;
  seleccion.value = i;
  respondida.value = false;
  await procesarRespuesta(respuesta, false);
}

// ✅ Procesar la respuesta (incluso sin contestar)
async function procesarRespuesta(respuesta, porTiempo) {
  clearInterval(timer);
  clearInterval(intervalAnim);

  try {
    let data = { correcta: false };

    // Si no hay respuesta, registrar como no respondida
    if (!respuesta) {
      await api.post(`/intentos/${idintento.value}/responder`, {
        idpregunta: preguntaActual.value.idpregunta,
        idrespuesta: null,
      });
      vidas.value--;
    } else {
      const res = await api.post(`/intentos/${idintento.value}/responder`, {
        idpregunta: preguntaActual.value.idpregunta,
        idrespuesta: respuesta.idrespuesta,
      });
      data = res.data;
      if (!data.correcta) vidas.value--;
    }

    // Marcar la correcta antes de mostrar color
    respuestaCorrecta.value = obtenerCorrecta();
    respondida.value = true;

    if (porTiempo) {
      $q.notify({
        type: "negative",
        position: "top",
        message: "⏰ ¡Tiempo agotado!",
        timeout: 1200,
      });
    }

    // Avanzar o finalizar (asegurando registro)
    setTimeout(() => {
      const esUltima = indiceActual.value >= preguntas.value.length - 1;
      if (!esUltima && vidas.value > 0) {
        siguientePregunta();
      } else {
        finalizarExamen();
      }
    }, 1200);
  } catch (err) {
    console.error("Error procesando respuesta:", err);
  }
}

// 🧠 Obtener id de la respuesta correcta
function obtenerCorrecta() {
  const correcta = preguntaActual.value.respuestas.find((r) => r.es_correcta);
  return correcta?.idrespuesta || null;
}

// 🎨 Colorear opción seleccionada
function colorOpcion(i, resp) {
  if (!respondida.value) return "opcion-default";
  if (resp.idrespuesta === respuestaCorrecta.value) return "opcion-correcta";
  if (seleccion.value === i && resp.idrespuesta !== respuestaCorrecta.value)
    return "opcion-incorrecta";
  return "opcion-default";
}

// ⏭ Siguiente pregunta
function siguientePregunta() {
  if (indiceActual.value < preguntas.value.length - 1) {
    indiceActual.value++;
    seleccion.value = null;
    respondida.value = false;
    respuestaCorrecta.value = null;
    iniciarTiempo();
  } else {
    finalizarExamen();
  }
}

// 🧾 Finalizar intento
async function finalizarExamen() {
  clearInterval(timer);
  clearInterval(intervalAnim);
  try {
    const { data } = await api.post(`/intentos/${idintento.value}/finalizar`);
    $q.notify({
      type: data.aprobado ? "positive" : "warning",
      message: data.aprobado ? "🎉 Examen aprobado" : "💔 Examen finalizado",
    });
    router.push({
      name: "examen-resultado",
      params: { idintento: idintento.value },
    });
  } catch (err) {
    console.error("Error finalizando examen:", err);
  }
}

onMounted(() => loadExamen());
</script>

<style scoped>
/* 🌌 Fondo general */
.bg-violet-gradient {
  background: radial-gradient(circle at 20% 20%, #3b0a73, #200042 85%);
}

/* 📦 Tarjeta principal */
.quiz-card {
  width: 100%;
  max-width: 720px;
  border-radius: 28px;
  background: linear-gradient(180deg, #6a0dad 0%, #4c0080 100%);
  color: white;
  box-shadow: 0 0 30px rgba(162, 0, 220, 0.3);
}

/* ❤️ Vidas */
.vidas-container {
  position: absolute;
  top: 10px;
  right: 14px;
  display: flex;
  gap: 4px;
}
.vida-icon {
  filter: drop-shadow(0 0 6px rgba(255, 100, 180, 0.6));
}

/* 💜 Título */
.titulo-examen {
  font-size: 2.6rem;
  font-weight: 900;
  color: #ffffff;
  text-transform: capitalize;
  text-shadow: 0 0 8px #a200dc, 0 0 15px #d86cff, 0 0 25px #c47bff;
  letter-spacing: 1px;
}

/* 🔹 Número de pregunta */
.pregunta-contador {
  font-size: 1.4rem;
  font-weight: 700;
  color: #e6d6ff;
  margin-top: 4px;
  text-shadow: 0 0 6px rgba(255, 255, 255, 0.3), 0 0 12px #a200dc;
}
.pregunta-contador .numero {
  font-size: 1.8rem;
  font-weight: 900;
  color: #ffffff;
  text-shadow: 0 0 12px #b86cff, 0 0 25px #a200dc;
}

/* 🧠 Pregunta */
.pregunta-texto {
  font-size: 2rem;
  font-weight: 800;
  color: #ffffff;
  text-transform: capitalize;
  margin-top: 10px;
  text-shadow: 0 0 10px #a200dc, 0 0 18px #d86cff, 0 0 35px #c47bff;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

/* ⏳ Timer */
.timer-container {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  padding: 6px 16px;
  box-shadow: 0 0 10px rgba(162, 0, 220, 0.5);
  font-size: 1.1rem;
  color: #fff;
  font-weight: 700;
  text-shadow: 0 0 10px #a200dc, 0 0 20px #d86cff;
  animation: glowPulse 2s ease-in-out infinite alternate;
}
.timer-icon {
  color: #fff;
  margin-right: 6px;
  animation: spin 2s linear infinite;
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
@keyframes glowPulse {
  0% {
    box-shadow: 0 0 8px rgba(162, 0, 220, 0.4);
  }
  100% {
    box-shadow: 0 0 20px rgba(216, 108, 255, 0.8);
  }
}

/* 📊 Barra de progreso */
.progress-chip {
  width: 80%;
  height: 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.25);
  overflow: hidden;
  transition: all 0.3s ease;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #a200dc, #d86cff);
  transition: width 0.05s linear;
}
.pulse {
  animation: pulseEffect 0.8s ease-in-out infinite alternate;
}
@keyframes pulseEffect {
  from {
    transform: scale(1);
    background: rgba(255, 100, 100, 0.4);
  }
  to {
    transform: scale(1.03);
    background: rgba(255, 0, 0, 0.6);
  }
}

/* 🎯 Opciones */
.opcion-btn {
  font-weight: 600;
  border-radius: 999px;
  padding: 14px;
  font-size: 1.2rem;
  background: rgba(255, 255, 255, 0.15) !important;
  color: #fff !important;
  transition: all 0.25s ease-in-out;
  border: none !important;
}
.opcion-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0 12px rgba(162, 0, 220, 0.8);
}

/* ✅ Correcta */
.opcion-correcta {
  background: linear-gradient(145deg, #00ff66, #39ff14) !important;
  box-shadow: 0 0 25px rgba(57, 255, 20, 0.85), 0 0 45px rgba(0, 255, 102, 0.6);
  text-shadow: 0 0 10px #aaff9c;
  animation: pulseGlow 1.6s infinite alternate;
}
@keyframes pulseGlow {
  from {
    box-shadow: 0 0 20px rgba(57, 255, 20, 0.6);
  }
  to {
    box-shadow: 0 0 40px rgba(57, 255, 20, 1);
  }
}

/* ❌ Incorrecta */
.opcion-incorrecta {
  background: linear-gradient(145deg, #ff1a1a, #ff4d4d) !important;
  box-shadow: 0 0 25px #ff1a1a, 0 0 45px rgba(255, 26, 26, 0.8);
}

/* 🌟 Transiciones */
.q-card,
.q-btn {
  transition: all 0.3s ease;
}
</style>
