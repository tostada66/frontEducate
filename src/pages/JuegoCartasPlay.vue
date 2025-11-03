<template>
  <q-page class="q-pa-none cartas-page">
    <!-- ⏱️ Contador flotante (sin oscurecer) -->
    <transition name="fade">
      <div v-if="mostrandoCuenta" class="cuenta-float">
        <div class="cuenta-num">¡Memoriza las cartas!</div>
        <div class="cuenta-num">{{ cuentaRestante }}</div>
      </div>
    </transition>

    <div class="play-wrapper">
      <!-- 🟣 Topbar -->
      <div class="topbar">
        <div class="left">
          <q-icon name="style" size="32px" />
          <span class="titulo">{{ headerTitle }}</span>
        </div>

        <div class="center row items-center q-gutter-sm">
          <q-badge class="stat-badge" color="purple-6">
            Pares {{ aciertos }} / {{ totalPares }}
          </q-badge>

          <q-badge class="stat-badge" :color="tiempoRestanteColor">
            ⏳ {{ tiempoRestante }}s
          </q-badge>

          <q-badge class="stat-badge" :color="tiempoColor">
            ⏱ {{ tiempo }}s
          </q-badge>
        </div>

        <div class="right">
          <q-badge class="stat-badge q-mr-sm" color="amber-7"
            >⭐ {{ puntaje }}</q-badge
          >
          <q-badge class="stat-badge q-mr-sm" color="teal-6"
            >👣 {{ movimientos }}</q-badge
          >
          <q-badge class="stat-badge" color="red-6">❌ {{ errores }}</q-badge>
        </div>
      </div>

      <!-- ⏳ Estados -->
      <div v-if="cargando" class="loader">
        <q-spinner color="purple" size="40px" />
        <div class="q-mt-sm">Cargando cartas...</div>
      </div>

      <div v-else-if="!cartas.length" class="vacio">
        <q-icon name="hourglass_empty" size="56px" class="q-mb-sm" />
        No hay cartas configuradas para este juego.
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

      <!-- 🎮 Tablero -->
      <div v-else class="board">
        <div class="grid" :style="gridStyle">
          <div
            v-for="c in cartas"
            :key="c.uid"
            class="card"
            :class="{
              flipped: c.volteada || c.acertada,
              locked: lockBoard,
              shake: c.shake,
              'glow-ok': c.glowOk,
              'glow-bad': c.glowBad,
            }"
            @click="voltear(c)"
          >
            <!-- dorso -->
            <div class="card-face back">
              <q-icon name="help_outline" size="40px" />
            </div>

            <!-- frente -->
            <div class="card-face front">
              <img
                v-if="c.tipo === 'img' && c.src"
                :src="c.src"
                alt="carta"
                class="card-img"
                draggable="false"
                @error="onImgError($event)"
              />
              <div
                v-else
                class="card-text"
                :class="{
                  'text-giant': isShortText(c.texto),
                  'text-medium': !isShortText(c.texto),
                }"
                :title="c.texto"
              >
                {{ c.texto }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ⬇️ Footer fijo: FINALIZAR (también aparece si se fuerza fin por tiempo) -->
    <transition name="fade">
      <div v-if="terminado || terminadoForzado" class="footer-final">
        <q-btn
          color="green-6"
          class="btn-finalizar"
          glossy
          icon="check_circle"
          :label="intentoGuardado ? 'Ver score' : 'Finalizar'"
          :loading="guardando"
          @click="guardarIntento(true)"
        />
      </div>
    </transition>
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

const $q = useQuasar();
const route = useRoute();
const router = useRouter();

/** ============== Estado ============== */
const cargando = ref(true);
const guardando = ref(false);
const intentoGuardado = ref(false);
const ultimoIdIntento = ref(null);

const cursoJuego = ref(null);
const juego = ref(null);
const cartas = ref([]);
const totalPares = ref(0);

const movimientos = ref(0);
const aciertos = ref(0);
const errores = ref(0);
const puntaje = ref(0);

const tiempo = ref(0); // ⏱️ transcurrido
const tiempoRestante = ref(0); // ⏳ restante
const tiempoLimite = ref(0); // límite calculado
let cronometro = null;

const lockBoard = ref(false);
const abierto = ref([]);
let lastToastAt = 0;

// 🔥 rachas
let racha = 0;
let rachaMax = 0;

// 🔚 fin forzado por tiempo
const terminadoForzado = ref(false);

// ⏱️ Memorización
const MEMO_SEG = 5;
const mostrandoCuenta = ref(false);
const cuentaRestante = ref(MEMO_SEG);

/** ============== Reglas ============== */
const PAREJA_OK = 50;
const PENAL_FALLO = 10;
const BONUS_RACHA = 10;
const BONUS_RAPIDEZ_MAX = 50;

// Tiempo dinámico por par
const SEG_POR_PAR = 10;
const LIMITE_MIN = 60;
const LIMITE_MAX = 240;

// (para bonus si completa todo)
const TIEMPO_OBJETIVO = 60;

/** ============== Params/Query helpers ============== */
const idcursojuegoParam = computed(() =>
  Number(route.params.idcursojuego ?? route.query.idcursojuego ?? 0)
);

/** ============== UI computeds ============== */
const gridStyle = computed(() => {
  const n = cartas.value.length || 1;
  const cols = Math.ceil(Math.sqrt(n));
  return { gridTemplateColumns: `repeat(${cols}, minmax(140px, 1fr))` };
});

const headerTitle = computed(
  () =>
    cursoJuego.value?.nombre_tema || juego.value?.nombre || "Cartas de Memoria"
);

const tiempoColor = computed(() => {
  if (tiempo.value <= 10) return "green-6";
  if (tiempo.value <= 30) return "orange-6";
  return "purple-6";
});

const tiempoRestanteColor = computed(() => {
  if (tiempoRestante.value <= Math.ceil(tiempoLimite.value * 0.15))
    return "red-6";
  if (tiempoRestante.value <= Math.ceil(tiempoLimite.value * 0.35))
    return "orange-6";
  return "green-6";
});

const terminado = computed(() => aciertos.value >= totalPares.value);

/** ============== Utils ============== */
function isShortText(t = "") {
  return (t || "").trim().length <= 10;
}
function mapSrc(img) {
  if (!img) return null;
  if (typeof img === "string" && img.startsWith("http")) return img;
  return img ? `http://127.0.0.1:8000/storage/${img}` : null;
}
function onImgError(e) {
  e.target.src = "/images/juego-placeholder.jpg";
}

/** ============== Carga ============== */
async function cargar() {
  cargando.value = true;
  intentoGuardado.value = false;
  ultimoIdIntento.value = null;
  terminadoForzado.value = false;

  try {
    const idcursojuego = idcursojuegoParam.value;
    if (!idcursojuego) {
      cargando.value = false;
      return $q.notify({
        type: "warning",
        message: "No se recibió idcursojuego.",
      });
    }

    const cantidad = Number(route.query.cantidad || 8);
    const { data } = await api.get(`/juego-cartas/${idcursojuego}`, {
      params: { cantidad },
    });

    const pares = Array.isArray(data?.data) ? data.data : [];
    totalPares.value = pares.length;

    // ⏳ calcula límite
    tiempoLimite.value = Math.max(
      LIMITE_MIN,
      Math.min(LIMITE_MAX, totalPares.value * SEG_POR_PAR)
    );
    tiempoRestante.value = tiempoLimite.value;

    const mazo = [];
    pares.forEach((p) => {
      const mk = `par-${p.idpar}`;
      mazo.push({
        uid: `${mk}-A`,
        matchKey: mk,
        tipo: p.imagen_a_url || p.imagen_a ? "img" : "txt",
        src: p.imagen_a_url || mapSrc(p.imagen_a),
        texto: p.texto_a || "",
        volteada: false,
        acertada: false,
        shake: false,
        glowOk: false,
        glowBad: false,
      });
      mazo.push({
        uid: `${mk}-B`,
        matchKey: mk,
        tipo: p.imagen_b_url || p.imagen_b ? "img" : "txt",
        src: p.imagen_b_url || mapSrc(p.imagen_b),
        texto: p.texto_b || "",
        volteada: false,
        acertada: false,
        shake: false,
        glowOk: false,
        glowBad: false,
      });
    });

    cartas.value = mezclar(mazo);
    reiniciarTemporal(false); // no arranca cronómetro aún

    // 🧠 Mostrar todas las cartas 5s
    await nextTick();
    cartas.value.forEach((c) => (c.volteada = true));

    mostrandoCuenta.value = true;
    cuentaRestante.value = MEMO_SEG;

    const cuentaInterval = setInterval(() => {
      cuentaRestante.value--;
      if (cuentaRestante.value <= 0) {
        clearInterval(cuentaInterval);
        mostrandoCuenta.value = false;
        cartas.value.forEach((c) => (c.volteada = false));
        $q.notify({
          type: "positive",
          message: "🎮 ¡Empieza el juego!",
          position: "top",
          timeout: 1200,
        });
        iniciarTimerJuego(); // ⬅️ arranca cronómetro del juego
      }
    }, 1000);
  } catch (e) {
    console.error(e);
    $q.notify({
      type: "negative",
      message:
        e?.response?.data?.message || "No se pudieron cargar las cartas.",
    });
  } finally {
    cargando.value = false;
  }
}

function mezclar(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** ============== Timers ============== */
function iniciarTimerJuego() {
  limpiarCronometro();
  cronometro = setInterval(() => {
    tiempo.value++;
    tiempoRestante.value--;
    if (tiempoRestante.value <= 0) finalizarPorTiempo();
  }, 1000);
}

function reiniciarTemporal(iniciar = true) {
  limpiarCronometro();
  movimientos.value = 0;
  aciertos.value = 0;
  errores.value = 0;
  puntaje.value = 0;
  tiempo.value = 0;
  tiempoRestante.value = tiempoLimite.value;
  abierto.value = [];
  lockBoard.value = false;
  racha = 0;
  rachaMax = 0;

  if (iniciar) iniciarTimerJuego();
}

function limpiarCronometro() {
  if (cronometro) {
    clearInterval(cronometro);
    cronometro = null;
  }
}

/** ============== Juego ============== */
function voltear(c) {
  if (lockBoard.value || mostrandoCuenta.value || terminadoForzado.value)
    return;
  if (c.acertada || c.volteada) return;

  c.volteada = true;
  abierto.value.push(c);

  if (abierto.value.length === 2) {
    lockBoard.value = true;
    movimientos.value++;

    const [c1, c2] = abierto.value;
    const esMatch = c1.matchKey === c2.matchKey;

    if (esMatch) {
      c1.acertada = true;
      c2.acertada = true;
      aciertos.value++;
      racha++;
      rachaMax = Math.max(rachaMax, racha);

      const bonus = (racha - 1) * BONUS_RACHA;
      puntaje.value += PAREJA_OK + bonus;

      // ✅ Glow verde 1s
      c1.glowOk = c2.glowOk = true;
      setTimeout(() => {
        c1.glowOk = c2.glowOk = false;
      }, 1000);

      abierto.value = [];
      lockBoard.value = false;

      const now = Date.now();
      if (now - lastToastAt > 400) {
        lastToastAt = now;
        const msg =
          racha > 1
            ? `🔥 ¡Racha de ${racha}! (+${PAREJA_OK + bonus})`
            : `✅ ¡Par encontrado! (+${PAREJA_OK})`;
        $q.notify({
          type: "positive",
          message: msg,
          position: "top",
          timeout: 1200,
        });
      }

      if (terminado.value) {
        limpiarCronometro();
        // Bonus por rapidez SOLO si completó todo
        const t = Math.max(1, tiempo.value);
        const ratio = Math.min(1, TIEMPO_OBJETIVO / t);
        puntaje.value += Math.round(BONUS_RAPIDEZ_MAX * ratio);

        $q.notify({
          type: "positive",
          message: "🎉 ¡Completaste todos los pares!",
          position: "top",
        });
        setTimeout(() => guardarIntento(true), 400);
      }
    } else {
      errores.value++;
      racha = 0;
      puntaje.value = Math.max(0, puntaje.value - PENAL_FALLO);

      // ❌ Shake + glow rojo y volver a tapar
      c1.shake = c2.shake = true;
      c1.glowBad = c2.glowBad = true;

      setTimeout(() => {
        c1.shake = c2.shake = false;
        c1.glowBad = c2.glowBad = false;
        c1.volteada = false;
        c2.volteada = false;
        abierto.value = [];
        lockBoard.value = false;
      }, 700);

      $q.notify({
        type: "negative",
        message: "❌ No coinciden, intenta otra vez.",
        position: "top",
        timeout: 800,
      });
    }
  }
}

function finalizarPorTiempo() {
  if (terminadoForzado.value) return;
  limpiarCronometro();
  lockBoard.value = true;
  terminadoForzado.value = true;

  $q.notify({
    type: "warning",
    message: "⏱️ Tiempo agotado — juego terminado.",
    position: "top",
  });
  guardarIntento(true);
}

/** ============== Guardado / navegación ============== */
async function guardarIntento(irResultado = false) {
  try {
    if (guardando.value) return;
    if (intentoGuardado.value) {
      if (irResultado) goResultado();
      return;
    }

    guardando.value = true;
    const idcursojuego = idcursojuegoParam.value;
    if (!idcursojuego) {
      guardando.value = false;
      return $q.notify({
        type: "warning",
        message: "Falta idcursojuego para guardar.",
      });
    }

    const cobertura = totalPares.value ? aciertos.value / totalPares.value : 0;

    const payload = {
      puntaje: Number(puntaje.value || 0),
      aciertos: Number(aciertos.value || 0),
      errores: Number(errores.value || 0),
      tiempo: Number(tiempo.value || 0),
      detalles: {
        pares_totales: totalPares.value,
        movimientos: movimientos.value,
        eficiencia: Number(
          (
            aciertos.value / Math.max(1, aciertos.value + errores.value)
          ).toFixed(3)
        ),
        cobertura: Number(cobertura.toFixed(3)),
        racha_max: rachaMax,
        tiempo_limite: tiempoLimite.value,
        tiempo_restante: tiempoRestante.value,
        fin_por_tiempo: !terminado.value,
        reglas: {
          PAREJA_OK,
          PENAL_FALLO,
          BONUS_RACHA,
          BONUS_RAPIDEZ_MAX,
          SEG_POR_PAR,
          MEMO_SEG,
          LIMITE_MIN,
          LIMITE_MAX,
        },
      },
    };

    const { data } = await api.post(
      `/juegos/curso-juego/${idcursojuego}/intentos`,
      payload
    );
    const idintento =
      data?.data?.idintento ?? data?.idintento ?? data?.data?.id ?? data?.id;

    if (idintento) {
      intentoGuardado.value = true;
      ultimoIdIntento.value = idintento;
    }

    if (irResultado) goResultado();
    else $q.notify({ type: "positive", message: "Intento guardado." });
  } catch (e) {
    console.error(e);
    $q.notify({
      type: "negative",
      message: e?.response?.data?.message || "No se pudo guardar el intento.",
    });
  } finally {
    guardando.value = false;
  }
}

function goResultado() {
  const id = ultimoIdIntento.value;
  if (!id) return $q.notify({ type: "warning", message: "Sin ID de intento." });
  router.push({ name: "juego-resultado", params: { idintento: String(id) } });
}

function volverInicio() {
  router.back();
}

/** ============== Lifecycle ============== */
onMounted(async () => {
  await cargar();
  await nextTick();
});
onBeforeUnmount(() => limpiarCronometro());
watch(
  () => [route.params.idcursojuego, route.query.idcursojuego],
  () => cargar()
);
</script>

<style scoped>
.cartas-page {
  min-height: 100vh;
  background: radial-gradient(circle at 25% 25%, #3b0a73, #1a0033 85%);
  color: #fff;
  position: relative;
}
.play-wrapper {
  max-width: 1080px;
  margin: 0 auto;
  padding: 18px 16px 96px; /* espacio para el footer fijo */
}

/* Topbar */
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 12px 16px;
  margin-bottom: 16px;
}
.titulo {
  font-weight: 800;
  letter-spacing: 0.3px;
  margin-left: 6px;
}

.stat-badge {
  font-size: clamp(0.95rem, 1.15vw, 1.15rem);
  padding: 6px 12px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
}

/* Estados */
.loader,
.vacio {
  text-align: center;
  padding: 60px 0;
  color: #eee;
}

/* Board */
.board {
  margin-top: 8px;
}

/* Grid responsivo */
.grid {
  display: grid;
  gap: 16px;
}

/* Carta */
.card {
  position: relative;
  border-radius: 16px;
  perspective: 900px;
  cursor: pointer;
  overflow: hidden;
  aspect-ratio: 4 / 3;
  min-height: 140px;
  transition: transform 0.25s ease;
}
.card.locked {
  pointer-events: none;
}
.card-face {
  position: absolute;
  inset: 0;
  border-radius: 16px;
  display: grid;
  place-items: center;
  backface-visibility: hidden;
  transition: transform 0.35s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  padding: 8px;
}

/* Dorso */
.card .back {
  background: linear-gradient(145deg, #5b02a6, #2e0068);
  box-shadow: 0 0 12px rgba(162, 0, 220, 0.6);
  color: #fff;
}

/* Frente */
.card .front {
  background: rgba(255, 255, 255, 0.07);
  border: 2px solid rgba(255, 255, 255, 0.15);
  transform: rotateY(180deg);
}
.card.flipped .front {
  transform: rotateY(0deg);
}
.card.flipped .back {
  transform: rotateY(180deg);
}

/* Imagen dentro */
.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
  user-select: none;
  pointer-events: none;
}

/* Texto */
.card-text {
  width: 100%;
  text-align: center;
  font-weight: 900;
  line-height: 1.1;
  word-break: break-word;
}
.card-text.text-giant {
  font-size: clamp(1.8rem, 4vw, 3rem);
}
.card-text.text-medium {
  font-size: clamp(1.1rem, 2.6vw, 1.6rem);
  padding: 6px 10px;
}

/* Footer fijo Finalizar */
.footer-final {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 16px;
  display: flex;
  justify-content: center;
  pointer-events: none;
}
.btn-finalizar {
  pointer-events: all;
  border-radius: 999px;
  padding: 12px 28px;
  font-weight: 800;
  box-shadow: 0 8px 30px rgba(0, 255, 136, 0.35);
}

/* ======= Animaciones extra ======= */
.card.shake {
  animation: shake 0.45s ease;
}
@keyframes shake {
  0% {
    transform: translateX(0);
  }
  15% {
    transform: translateX(-6px);
  }
  30% {
    transform: translateX(6px);
  }
  45% {
    transform: translateX(-4px);
  }
  60% {
    transform: translateX(4px);
  }
  75% {
    transform: translateX(-2px);
  }
  100% {
    transform: translateX(0);
  }
}

/* Glow rojo en error */
.card.glow-bad .front {
  box-shadow: 0 0 18px rgba(255, 60, 60, 0.9),
    inset 0 0 18px rgba(255, 60, 60, 0.5);
  border-color: rgba(255, 60, 60, 0.9);
}

/* Glow verde en acierto (1s) */
.card.glow-ok .front {
  box-shadow: 0 0 18px rgba(0, 255, 136, 0.9),
    inset 0 0 18px rgba(0, 255, 136, 0.5);
  border-color: rgba(0, 255, 136, 0.9);
}

/* Contador flotante: MISMO estilo para texto y número */
.cuenta-float {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 30;
  pointer-events: none;
}
.cuenta-num {
  font-size: clamp(3rem, 7vw, 6rem);
  font-weight: 900;
  color: #ffcd4d;
  text-shadow: 0 0 20px rgba(255, 205, 77, 0.9);
  animation: pop 1s ease infinite;
  line-height: 0.95;
}
@keyframes pop {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.22);
  }
}

/* Fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
