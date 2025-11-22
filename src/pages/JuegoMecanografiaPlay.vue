<template>
  <q-page class="q-pa-none mecanografia-page">
    <div class="play-wrapper">
      <!-- 🟣 Topbar -->
      <div class="topbar">
        <div class="left">
          <q-icon name="keyboard" size="28px" />
          <span class="titulo">
            {{ cursoJuego?.nombre_tema || juego?.nombre || "Mecanografía" }}
          </span>
        </div>
        <div class="center">
          <q-badge color="purple-6" class="q-mr-sm">
            Palabra {{ indice + 1 }} / {{ palabras.length || 0 }}
          </q-badge>
          <q-badge :color="tiempo <= 5 ? 'red-6' : 'green-6'">
            ⏱ {{ tiempo }}s
          </q-badge>
        </div>
        <div class="right">
          <q-badge color="amber-7" class="q-mr-sm">⭐ {{ puntaje }}</q-badge>
          <q-badge color="teal-6" class="q-mr-sm">✅ {{ aciertos }}</q-badge>
          <q-badge color="red-6">❌ {{ errores }}</q-badge>
        </div>
      </div>

      <!-- ⏳ Estados -->
      <div v-if="cargando" class="loader">
        <q-spinner color="purple" size="40px" />
        <div class="q-mt-sm">Cargando juego...</div>
      </div>

      <div v-else-if="!palabras.length" class="vacio">
        <q-icon name="hourglass_empty" size="56px" class="q-mb-sm" />
        No hay palabras configuradas para este juego.
        <div class="q-mt-md">
          <q-btn
            color="grey-7"
            outline
            icon="arrow_back"
            label="Volver"
            @click="volverInicio"
          />
        </div>
      </div>

      <!-- 🎮 Juego -->
      <div v-else class="game-card" :class="{ shake: shakeInput }">
        <!-- 🔠 Palabra -->
        <div class="palabra-cuadros">
          <div
            v-for="(letra, i) in (palabraActual.palabra || '').split('')"
            :key="i"
            class="letra-box"
            :class="{
              correcta: entrada[i] === letra,
              incorrecta: entrada[i] && entrada[i] !== letra,
            }"
          >
            {{ letra }}
          </div>
        </div>

        <!-- 🏁 Finalizar (entre palabra y barra) -->
        <div v-if="mostrarFinalizar" class="finalizar-wrap">
          <q-btn
            color="deep-purple-6"
            glossy
            icon="flag"
            label="Finalizar"
            size="lg"
            :loading="guardando"
            :disable="guardando"
            @click="finalizar"
          />
        </div>

        <!-- 🧮 Input invisible -->
        <q-input
          v-model="entrada"
          ref="inputRef"
          borderless
          autofocus
          input-class="input-oculto"
          @keydown="onKeyDown"
          @keyup="onKeyUp"
        />

        <!-- 🕒 Barra de tiempo -->
        <div class="timer-bar">
          <div
            class="timer-fill"
            :style="{ width: `${(tiempo / duracionActual) * 100}%` }"
          ></div>
        </div>

        <!-- 🎹 Teclado PC completo -->
        <div class="teclado q-mt-lg">
          <div class="fila funciones">
            <div
              v-for="k in funcRow"
              :key="k"
              class="tecla tecla-func"
              @click="typeSpecial(k)"
            >
              {{ k }}
            </div>
          </div>

          <div class="fila">
            <div
              v-for="k in row1"
              :key="k.label"
              :class="keyClass(k)"
              @click="typeKeyFromDef(k)"
            >
              {{ k.print }}
            </div>
          </div>
          <div class="fila">
            <div
              v-for="k in row2"
              :key="k.label"
              :class="keyClass(k)"
              @click="typeKeyFromDef(k)"
            >
              {{ k.print }}
            </div>
          </div>
          <div class="fila">
            <div
              v-for="k in row3"
              :key="k.label"
              :class="keyClass(k)"
              @click="typeKeyFromDef(k)"
            >
              {{ k.print }}
            </div>
          </div>
          <div class="fila">
            <div
              v-for="k in row4"
              :key="k.label"
              :class="keyClass(k)"
              @click="typeKeyFromDef(k)"
            >
              {{ k.print }}
            </div>
          </div>
          <div class="fila">
            <div
              v-for="k in row5"
              :key="k.label"
              :class="keyClass(k)"
              @click="typeKeyFromDef(k)"
            >
              {{ k.print }}
            </div>
          </div>
        </div>

        <!-- ✅ Feedback -->
        <transition name="fade">
          <div v-if="mensaje" class="mensaje-feedback" :class="mensajeTipo">
            {{ mensaje }}
          </div>
        </transition>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  watch,
  nextTick,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { api } from "boot/axios";

// ===== Config =====
const allowBackspace = false; // cambia a true si quieres permitir borrar

// ⚖️ Reglas de puntaje
const P_LETRA = 5; // puntos por letra correcta (posición correcta)
const BONUS_PALABRA = 20; // bono por palabra perfecta
const BONUS_SEGUNDO = 1; // bono por cada segundo sobrante (si es perfecta)
const PENAL_LETRA = 3; // penalización por letra incorrecta
const PENAL_TIMEOUT = 10; // penalización fija por quedarse sin tiempo

const $q = useQuasar();
const route = useRoute();
const router = useRouter();

const cursoJuego = ref(null);
const juego = ref(null);
const palabras = ref([]); // [{idpalabra, palabra, tiempo, dificultad, ...}, ...]

const cargando = ref(true);
const guardando = ref(false);
const indice = ref(0);
const entrada = ref("");
const aciertos = ref(0);
const errores = ref(0);
const puntaje = ref(0); // ⭐ puntaje total
const tiempo = ref(0); // tiempo decreciente visible
const duracionActual = ref(20); // duración de la palabra actual
const tiempoTotal = ref(0); // ⏱ acumulador de tiempo total

let cronometro = null;
let tiempoInicioPalabra = 0; // marca de inicio por palabra

const mensaje = ref("");
const mensajeTipo = ref("");
const shakeInput = ref(false);
const mostrarFinalizar = ref(false);
const inputRef = ref(null);

// Teclado
const funcRow = [
  "Esc",
  "F1",
  "F2",
  "F3",
  "F4",
  "F5",
  "F6",
  "F7",
  "F8",
  "F9",
  "F10",
  "F11",
  "F12",
];
const row1 = [
  { label: "º", code: "º", print: "º" },
  { label: "1", code: "1", print: "1" },
  { label: "2", code: "2", print: "2" },
  { label: "3", code: "3", print: "3" },
  { label: "4", code: "4", print: "4" },
  { label: "5", code: "5", print: "5" },
  { label: "6", code: "6", print: "6" },
  { label: "7", code: "7", print: "7" },
  { label: "8", code: "8", print: "8" },
  { label: "9", code: "9", print: "9" },
  { label: "0", code: "0", print: "0" },
  { label: "'", code: "'", print: "'" },
  { label: "¡", code: "¡", print: "¡" },
  {
    label: "Backspace",
    code: "Backspace",
    print: "⌫",
    w: "w-back",
    disabled: !allowBackspace,
  },
];
const row2 = [
  { label: "Tab", code: "Tab", print: "Tab", w: "w-tab" },
  ...["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"].map((k) => ({
    label: k.toUpperCase(),
    code: k,
    print: k.toUpperCase(),
  })),
  { label: "´", code: "´", print: "´" },
  { label: "+", code: "+", print: "+" },
];
const row3 = [
  { label: "Caps", code: "CapsLock", print: "Caps", w: "w-caps" },
  ...["a", "s", "d", "f", "g", "h", "j", "k", "l", "ñ"].map((k) => ({
    label: k.toUpperCase(),
    code: k,
    print: k.toUpperCase(),
  })),
  { label: ";", code: ";", print: ";" },
  { label: "Enter", code: "Enter", print: "Enter", w: "w-enter" },
];
const row4 = [
  { label: "Shift", code: "ShiftLeft", print: "Shift", w: "w-shift" },
  ...["z", "x", "c", "v", "b", "n", "m", ",", ".", "-"].map((k) => ({
    label: k.toUpperCase(),
    code: k,
    print: k.toUpperCase(),
  })),
  { label: "Shift", code: "ShiftRight", print: "Shift", w: "w-shift" },
];
const row5 = [
  { label: "Ctrl", code: "Control", print: "Ctrl", w: "w-ctrl" },
  { label: "Win", code: "Meta", print: "Win", w: "w-ctrl" },
  { label: "Alt", code: "Alt", print: "Alt", w: "w-ctrl" },
  { label: "Space", code: " ", print: "Espacio", w: "w-space" },
  { label: "AltGr", code: "AltGraph", print: "AltGr", w: "w-ctrl" },
  { label: "Menu", code: "ContextMenu", print: "Menu", w: "w-ctrl" },
  { label: "Ctrl", code: "ControlRight", print: "Ctrl", w: "w-ctrl" },
];

const palabraActual = computed(
  () => palabras.value[indice.value] || { palabra: "", tiempo: 20 }
);

// ===== Carga =====
async function cargar() {
  cargando.value = true;
  try {
    const { idcursojuego } = route.params;

    // Detalle del curso_juego
    const { data } = await api.get(`/curso-juego/${idcursojuego}`);
    cursoJuego.value = data.data;
    juego.value = data.data?.juego;

    // Palabras (ya vienen como objetos)
    const resP = await api.get(`/curso-juego/${idcursojuego}/mecanografia`);
    palabras.value = Array.isArray(resP.data?.data) ? resP.data.data : [];

    if (palabras.value.length) {
      await nextTick();
      iniciarPalabra();
      focusInput();
    }
  } catch (e) {
    console.error(e);
    $q.notify({ type: "negative", message: "No se pudo cargar el juego." });
  } finally {
    cargando.value = false;
  }
}

function focusInput() {
  inputRef.value?.focus?.();
}

function iniciarPalabra() {
  limpiarCronometro();
  entrada.value = "";
  duracionActual.value = Number(palabraActual.value.tiempo) || 20;
  tiempo.value = duracionActual.value;
  tiempoInicioPalabra = Date.now();
  cronometro = setInterval(() => {
    tiempo.value--;
    if (tiempo.value <= 0) registrarError();
  }, 1000);
}
function limpiarCronometro() {
  if (cronometro) {
    clearInterval(cronometro);
    cronometro = null;
  }
}

// ===== Teclado físico =====
function onKeyDown(e) {
  if (!allowBackspace && (e.key === "Backspace" || e.key === "Delete")) {
    e.preventDefault();
    doShake();
    return;
  }
  const targetLen = (palabraActual.value.palabra || "").length;
  const printable = e.key.length === 1 || e.key === " ";
  if (printable && entrada.value.length >= targetLen) {
    e.preventDefault();
    validarAuto();
    return;
  }
}
function onKeyUp() {
  const targetLen = (palabraActual.value.palabra || "").length;
  if (entrada.value.length === targetLen && targetLen > 0) {
    validarAuto();
  }
}

// ===== Teclado virtual =====
function keyClass(k) {
  return ["tecla", k.w || "", { disabled: k.disabled }];
}
function typeKeyFromDef(k) {
  if (k.disabled) return doShake();
  if (k.code === "Backspace") {
    if (allowBackspace) borrarUno();
    else doShake();
    return;
  }
  if (k.code === "Enter") return validarAuto();
  if (
    k.code === "Tab" ||
    k.code === "CapsLock" ||
    k.code.startsWith("Shift") ||
    k.code.startsWith("Control") ||
    k.code === "Alt" ||
    k.code === "AltGraph" ||
    k.code === "Meta" ||
    k.code === "ContextMenu"
  )
    return;

  typeChar(k.code === " " ? " " : k.code);
}
function typeSpecial() {
  /* Esc/F-keys no escriben */
}
function typeChar(ch) {
  focusInput();
  const targetLen = (palabraActual.value.palabra || "").length;
  if (entrada.value.length >= targetLen) return validarAuto();
  entrada.value += ch;
  if (entrada.value.length === targetLen) validarAuto();
}
function borrarUno() {
  if (entrada.value.length) entrada.value = entrada.value.slice(0, -1);
}
function doShake() {
  shakeInput.value = true;
  setTimeout(() => (shakeInput.value = false), 300);
}

// ===== Util: conteo por-letra =====
function contarCoincidencias(strA, strB) {
  const len = Math.min(strA.length, strB.length);
  let ok = 0;
  for (let i = 0; i < len; i++) {
    if (strA[i] === strB[i]) ok++;
  }
  return { ok, bad: len - ok, lenB: strB.length };
}

// ===== Juego =====
function validarAuto() {
  const esperado = (palabraActual.value.palabra || "").trim();
  const escrito = entrada.value.trim();

  // tiempo usado para esta palabra y acumulado
  const tiempoUsado = Math.min(
    duracionActual.value,
    Math.round((Date.now() - tiempoInicioPalabra) / 1000)
  );
  tiempoTotal.value += tiempoUsado;

  // cálculo por letras
  const { ok, lenB } = contarCoincidencias(escrito, esperado);
  const incorrectas = Math.max(0, lenB - ok);

  // puntaje por-letra
  let delta = ok * P_LETRA - incorrectas * PENAL_LETRA;

  const perfecta = escrito === esperado;
  if (perfecta) {
    aciertos.value++;
    // bono por palabra y bono de tiempo restante
    const segundosSobrantes = Math.max(0, duracionActual.value - tiempoUsado);
    delta += BONUS_PALABRA + segundosSobrantes * BONUS_SEGUNDO;
    mostrarFeedback(`✅ ¡Bien! (+${delta})`, "bien");
  } else {
    errores.value++;
    mostrarFeedback(`❌ Mal (${delta >= 0 ? "+" : ""}${delta})`, "mal");
  }

  puntaje.value = Math.max(0, puntaje.value + delta); // nunca por debajo de 0
  avanzar();
}

function registrarError() {
  const tiempoUsado = Math.min(
    duracionActual.value,
    Math.round((Date.now() - tiempoInicioPalabra) / 1000)
  );
  tiempoTotal.value += tiempoUsado;

  errores.value++;
  const delta = -PENAL_TIMEOUT; // penalización fija
  puntaje.value = Math.max(0, puntaje.value + delta);
  mostrarFeedback(`⏰ Tiempo agotado (${delta})`, "mal");
  avanzar();
}

function avanzar() {
  entrada.value = "";
  limpiarCronometro();
  const esUltima = indice.value >= palabras.value.length - 1;
  if (esUltima) {
    mostrarFinalizar.value = true;
  } else {
    indice.value++;
    iniciarPalabra();
    focusInput();
  }
}

function mostrarFeedback(t, tipo) {
  mensaje.value = t;
  mensajeTipo.value = tipo;
  setTimeout(() => (mensaje.value = ""), 900);
}

// ===== Guardar intento y salir =====
async function finalizar() {
  try {
    guardando.value = true;

    // suma la última palabra si aún estaba corriendo
    if (cronometro) {
      const tiempoUsado = Math.min(
        duracionActual.value,
        Math.round((Date.now() - tiempoInicioPalabra) / 1000)
      );
      tiempoTotal.value += tiempoUsado;
      limpiarCronometro();
    }

    const payload = {
      puntaje: puntaje.value, // ⭐ puntaje total
      aciertos: aciertos.value,
      errores: errores.value,
      tiempo: tiempoTotal.value, // total acumulado
      nivel_superado: cursoJuego.value?.nivel || 1,
      detalles: {
        total_palabras: palabras.value.length,
        reglas: {
          P_LETRA,
          BONUS_PALABRA,
          BONUS_SEGUNDO,
          PENAL_LETRA,
          PENAL_TIMEOUT,
        },
      },
    };

    const res = await api.post(
      `/juegos/curso-juego/${cursoJuego.value.idcursojuego}/intentos`,
      payload
    );

    const idintento =
      res.data?.data?.idintento ??
      res.data?.idintento ??
      res.data?.data?.id ??
      res.data?.id;

    if (!idintento) throw new Error("No se recibió idintento del servidor.");

    router.push({
      name: "juego-resultado",
      params: { idintento },
    });
  } catch (e) {
    const backend = e?.response?.data;
    console.error(backend || e);
    $q.notify({
      type: "negative",
      message:
        backend?.message ||
        backend?.error ||
        e?.message ||
        "No se pudo guardar el resultado.",
    });
  } finally {
    guardando.value = false;
  }
}

function volverInicio() {
  router.back();
}

// lifecycle
onMounted(cargar);
onBeforeUnmount(limpiarCronometro);
watch(
  () => route.params.idcursojuego,
  () => cargar()
);
</script>

<style scoped>
.mecanografia-page {
  min-height: 100vh;
  background: radial-gradient(circle at 25% 25%, #3b0a73, #1a0033 85%);
  color: #fff;
}
.play-wrapper {
  max-width: 1080px;
  margin: 0 auto;
  padding: 18px 16px 48px;
}

/* Topbar */
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 10px 14px;
  margin-bottom: 16px;
}
.titulo {
  font-weight: 800;
  letter-spacing: 0.3px;
}

/* Estados */
.loader,
.vacio {
  text-align: center;
  padding: 60px 0;
  color: #eee;
}

/* Card */
.game-card {
  background: rgba(30, 0, 70, 0.85);
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 26px 20px 34px;
  text-align: center;
  box-shadow: 0 0 25px rgba(160, 0, 255, 0.4);
}
.game-card.shake {
  animation: shake 0.28s ease;
}
@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-6px);
  }
  50% {
    transform: translateX(6px);
  }
  75% {
    transform: translateX(-4px);
  }
}

/* Palabra */
.palabra-cuadros {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
}
.letra-box {
  font-size: 2.35rem;
  font-weight: 800;
  width: 60px;
  height: 70px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
  transition: 0.2s;
}
.letra-box.correcta {
  background: #1abc9c;
  color: #fff;
  box-shadow: 0 0 10px #1abc9c;
}
.letra-box.incorrecta {
  background: #e74c3c;
  color: #fff;
  box-shadow: 0 0 10px #e74c3c;
}

/* Finalizar */
.finalizar-wrap {
  margin: 6px 0 8px;
}

/* Timer */
.timer-bar {
  width: 100%;
  height: 16px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.2);
  overflow: hidden;
  margin-top: 6px;
}
.timer-fill {
  height: 100%;
  background: linear-gradient(90deg, #2ecc71, #f1c40f, #e67e22, #e74c3c);
  transition: width 1s linear;
}

/* Teclado */
.teclado {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
}
.fila {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: nowrap;
}
.funciones {
  margin-bottom: 6px;
  opacity: 0.95;
}

.tecla {
  background: rgba(255, 255, 255, 0.08);
  color: #eee;
  min-width: 52px;
  height: 52px;
  padding: 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  transition: all 0.15s ease;
  font-weight: 800;
  user-select: none;
  cursor: pointer;
}
.tecla:hover {
  background: rgba(255, 255, 255, 0.12);
}
.tecla.disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.tecla.activa {
  background: #b86cff;
  color: #fff;
  transform: scale(1.05);
}
.tecla.correcta {
  background: #2ecc71;
  color: #fff;
}
.tecla.incorrecta {
  background: #e74c3c;
  color: #fff;
}

/* Anchuras */
.tecla-func {
  min-width: 58px;
  height: 44px;
  border-radius: 8px;
}
.w-back {
  min-width: 118px;
}
.w-tab {
  min-width: 90px;
}
.w-caps {
  min-width: 110px;
}
.w-enter {
  min-width: 120px;
}
.w-shift {
  min-width: 140px;
}
.w-ctrl {
  min-width: 90px;
}
.w-space {
  min-width: 360px;
}

/* Feedback */
.mensaje-feedback {
  font-size: 1.6rem;
  font-weight: bold;
  margin-top: 18px;
}
.mensaje-feedback.bien {
  color: #2ecc71;
  text-shadow: 0 0 10px #2ecc71;
}
.mensaje-feedback.mal {
  color: #e74c3c;
  text-shadow: 0 0 10px #e74c3c;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Ocultar input */
.input-oculto {
  color: transparent !important;
  caret-color: transparent !important;
  background: transparent !important;
  border: none !important;
  height: 1px;
  padding: 0;
  margin: 0;
}
</style>
