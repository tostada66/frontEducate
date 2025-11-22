<template>
  <q-page class="reciclaje-lluvia-page">
    <!-- 🔹 Contador inicial -->
    <transition name="fade">
      <div v-if="mostrandoCuenta" class="cuenta-float">
        <div class="cuenta-num">¡Prepárate!</div>
        <div class="cuenta-num">{{ cuentaRestante }}</div>
      </div>
    </transition>

    <div class="play-wrapper">
      <!-- 🟢 Topbar -->
      <div ref="topbarEl" class="topbar">
        <div class="left">
          <q-icon name="recycling" size="28px" />
          <span class="titulo">{{ headerTitle }}</span>
        </div>

        <div class="center row items-center q-gutter-sm">
          <q-badge class="stat-badge" color="green-6">
            ✅ {{ aciertos }} / {{ totalItems }}
          </q-badge>
          <q-badge class="stat-badge" color="cyan-6"> ⏱ {{ tiempo }}s </q-badge>
        </div>

        <div class="right row items-center q-gutter-sm">
          <q-badge class="stat-badge" color="amber-7">⭐ {{ puntaje }}</q-badge>
          <q-badge class="stat-badge" color="red-6">❌ {{ errores }}</q-badge>
          <q-btn
            dense
            rounded
            glossy
            color="negative"
            icon="logout"
            label="Salir"
            @click="finalizarJuego(true)"
          />
        </div>
      </div>

      <!-- 🚮 Zona de juego -->
      <div
        class="game-area"
        ref="gameArea"
        :style="{ height: gameHeight + 'px' }"
      >
        <transition-group name="fade" tag="div">
          <div
            v-for="item in itemsActivos"
            :key="item.iditem"
            class="falling-item"
            :style="{
              top: item.y + 'px',
              left: item.x + 'px',
              transform: 'translate(-50%, 0)',
            }"
            draggable="true"
            @dragstart="onDragStart(item)"
          >
            <q-img
              v-if="item.imagen_url"
              :src="item.imagen_url"
              style="width: 84px; height: 84px; border-radius: 10px"
            />
            <div v-else class="item-nombre">{{ item.nombre }}</div>
          </div>
        </transition-group>

        <!-- 🟩 Línea del piso -->
        <div class="ground-line" :style="{ bottom: groundOffset + 'px' }"></div>

        <!-- 🗑️ Contenedores -->
        <div class="bins-area" ref="binsArea">
          <div
            v-for="bin in categorias"
            :key="bin.value"
            class="bin"
            :class="{
              glow: hoveredBin === bin.value,
              correcto: binEstado[bin.value] === 'ok',
              incorrecto: binEstado[bin.value] === 'fail',
            }"
            @dragover.prevent="hoveredBin = bin.value"
            @dragleave="hoveredBin = null"
            @drop="onDrop(bin.value)"
          >
            <q-icon :name="bin.icon" size="40px" />
            <div class="bin-label">{{ bin.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ✅ Botón Finalizar -->
    <transition name="fade">
      <div v-if="terminado" class="footer-final">
        <q-btn
          color="green-6"
          glossy
          icon="check_circle"
          class="btn-finalizar"
          :label="intentoGuardado ? 'Ver score' : 'Finalizar'"
          :loading="guardando"
          @click="guardarIntento(true)"
        />
      </div>
    </transition>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { api } from "boot/axios";

const $q = useQuasar();
const route = useRoute();
const router = useRouter();

const idcursojuego = Number(route.params.idcursojuego ?? 0);

/* ================== Parámetros ================== */
/* ⚡ Velocidad de caída base */
const BASE_SPEED_MIN = 0.2;
const BASE_SPEED_MAX = 0.36;
const SPEED_MULT = 2.15;
/* ⏱ Cadencia exacta: 1 ítem cada 4s; el primero en t=0 tras el conteo */
const SPAWN_MS = 4000;
const REPEAT_TIMES = 3;

/* ================== Estado ================== */
const cargando = ref(true);
const guardando = ref(false);
const intentoGuardado = ref(false);
const ultimoIdIntento = ref(null);

const topbarEl = ref(null);
const gameArea = ref(null);
const binsArea = ref(null);
const gameHeight = ref(720);
const groundOffset = ref(140);

const categorias = [
  { label: "Orgánico", value: "organico", icon: "eco" },
  { label: "Plástico", value: "plastico", icon: "delete_outline" },
  { label: "Papel", value: "papel", icon: "description" },
  { label: "Vidrio", value: "vidrio", icon: "wine_bar" },
  { label: "Metal", value: "metal", icon: "build" },
  { label: "Otros", value: "otros", icon: "help_outline" },
];

const items = ref([]);
const itemsActivos = computed(() => items.value.filter((i) => i.activo));
const totalItems = ref(0);

const aciertos = ref(0);
const errores = ref(0);
const puntaje = ref(0);
const tiempo = ref(0);

let cronometro = null;
let animFrame = null;
let spawnTimer = null; // ← scheduler con setTimeout encadenado
let resizeObs = null;

const hoveredBin = ref(null);
const binEstado = ref({});
let draggedItem = null;

const mostrandoCuenta = ref(false);
const cuentaRestante = ref(3);

const headerTitle = "Recicla correctamente los residuos";

/* 🔢 Procesados reales (cada clon cuenta aparte) */
const procesados = computed(
  () => items.value.filter((i) => i.procesado).length
);
const terminado = computed(
  () => procesados.value >= totalItems.value && totalItems.value > 0
);

/* ================== Altura y piso ================== */
function computeGameHeight() {
  const vh = window.innerHeight || 800;
  const hudH = (topbarEl.value?.offsetHeight || 0) + 12;
  const binsH = binsArea.value?.offsetHeight || 120;
  const bottomGap = 28;
  const h = Math.max(480, Math.round(vh - hudH - bottomGap));
  gameHeight.value = Math.max(h, binsH + 300);
  groundOffset.value = binsH + 10 + 8;
}

/* ================== Carga ================== */
async function cargar() {
  cargando.value = true;
  try {
    const { data } = await api.get(`/curso-juego/${idcursojuego}/reciclaje`);
    const base = (data.data || []).map((i) => ({
      iditem: String(i.iditem),
      nombre: i.nombre,
      tipo: i.tipo,
      imagen_url: i.imagen_url ?? (i.imagen ? i.imagen : null),
      x: 0,
      y: 0,
      velocidad: 0,
      activo: false,
      procesado: false,
      cloneOf: String(i.iditem),
      cloneIndex: 0,
    }));

    // ♻️ Triplicar: cada clon es objeto distinto
    const expanded = [];
    for (let k = 0; k < REPEAT_TIMES; k++) {
      for (const it of base) {
        expanded.push({
          ...it,
          iditem: `${it.iditem}__dup${k}`,
          cloneIndex: k,
        });
      }
    }

    const width = gameArea.value?.clientWidth || 900;
    items.value = expanded.map((i) => ({
      ...i,
      x: Math.max(70, Math.min(width - 70, Math.random() * width)),
      y: -Math.random() * 300 - 100,
      velocidad:
        Math.random() * (BASE_SPEED_MAX - BASE_SPEED_MIN) + BASE_SPEED_MIN,
      activo: false,
      procesado: false,
    }));
    totalItems.value = items.value.length;

    // 3...2...1 y en 0 arranca el juego (scheduler lanza el primer ítem)
    mostrandoCuenta.value = true;
    cuentaRestante.value = 3;
    const t = setInterval(() => {
      cuentaRestante.value--;
      if (cuentaRestante.value <= 0) {
        clearInterval(t);
        mostrandoCuenta.value = false;

        iniciarJuego(); // arranca cronómetro, scheduler de 4s y bucle de caída
        $q.notify({
          type: "positive",
          message: "¡Comienza a reciclar!",
          position: "top",
        });
      }
    }, 1000);
  } catch (e) {
    console.error(e);
    $q.notify({ type: "negative", message: "Error al cargar ítems." });
  } finally {
    cargando.value = false;
  }
}

/* ================== Juego ================== */
function iniciarJuego() {
  iniciarCronometro();
  startSpawnCadence(); // ← primer ítem en t=0 y luego cada 4s
  loopCaida();
}

/** Scheduler: 1 ítem cada 4s. El primero se lanza en t=0. */
function startSpawnCadence() {
  clearSpawnTimer();

  const spawnOne = () => {
    const next = items.value.find((i) => !i.activo && !i.procesado);
    if (next) {
      next.activo = true;
      next.y = -40; // aparece visible enseguida
      const width = gameArea.value?.clientWidth || 900;
      next.x = Math.max(70, Math.min(width - 70, Math.random() * width));
    }

    // ¿Quedan por lanzar?
    const quedanPendientes = items.value.some((i) => !i.activo && !i.procesado);
    if (!quedanPendientes) {
      clearSpawnTimer();
      return;
    }

    // agenda el siguiente en 4s exactos
    spawnTimer = setTimeout(spawnOne, SPAWN_MS);
  };

  // t = 0 (primer ítem)
  spawnOne();
}

function clearSpawnTimer() {
  if (spawnTimer) {
    clearTimeout(spawnTimer);
    spawnTimer = null;
  }
}

function iniciarCronometro() {
  cronometro = setInterval(() => {
    tiempo.value++;
  }, 1000);
}
function limpiarCronometro() {
  if (cronometro) {
    clearInterval(cronometro);
    cronometro = null;
  }
}

function loopCaida() {
  const areaH = gameArea.value?.clientHeight || gameHeight.value;
  const piso = groundOffset.value + 84; // ≈ alto del ítem

  for (const item of itemsActivos.value) {
    item.y += item.velocidad * SPEED_MULT;
    if (item.y > areaH - piso) {
      item.activo = false;
      if (!item.procesado) {
        item.procesado = true;
        errores.value++;
        puntaje.value = Math.max(0, puntaje.value - 10);
        $q.notify({
          type: "negative",
          message: `❌ ${item.nombre} cayó al suelo`,
          position: "top",
          timeout: 700,
        });
      }
    }
  }

  if (!terminado.value) {
    animFrame = requestAnimationFrame(loopCaida);
  } else {
    finalizarJuego(true);
  }
}

/* ================== Drag & Drop ================== */
function onDragStart(item) {
  draggedItem = item;
}
function onDrop(tipoBin) {
  if (!draggedItem) return;

  if (draggedItem.tipo === tipoBin) {
    binEstado.value[tipoBin] = "ok";
    setTimeout(() => (binEstado.value[tipoBin] = null), 300);
    aciertos.value++;
    puntaje.value += 50;
    $q.notify({
      type: "positive",
      message: `✅ ${draggedItem.nombre} reciclado correctamente`,
      position: "top",
      timeout: 700,
    });
  } else {
    binEstado.value[tipoBin] = "fail";
    setTimeout(() => (binEstado.value[tipoBin] = null), 300);
    errores.value++;
    puntaje.value = Math.max(0, puntaje.value - 10);
    $q.notify({
      type: "negative",
      message: `❌ ${draggedItem.nombre} en contenedor equivocado`,
      position: "top",
      timeout: 700,
    });
  }

  draggedItem.activo = false;
  draggedItem.procesado = true;
  draggedItem = null;
  hoveredBin.value = null;

  if (terminado.value) finalizarJuego(true);
}

/* ================== Fin & Guardado ================== */
function finalizarJuego(irResultado = false) {
  cancelAnimationFrame(animFrame);
  limpiarCronometro();
  clearSpawnTimer(); // ← importante

  if (!intentoGuardado.value) guardarIntento(irResultado);
  else if (irResultado) goResultado();
}

async function guardarIntento(irResultado = false) {
  try {
    if (guardando.value) return;
    guardando.value = true;

    const payload = {
      puntaje: puntaje.value,
      aciertos: aciertos.value,
      errores: errores.value,
      tiempo: tiempo.value,
      detalles: {
        total_items: totalItems.value,
        repeat_times: REPEAT_TIMES,
        procesados: procesados.value,
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
  } catch (e) {
    console.error(e);
    $q.notify({ type: "negative", message: "Error al guardar intento." });
  } finally {
    guardando.value = false;
  }
}

function goResultado() {
  if (!ultimoIdIntento.value)
    return $q.notify({ type: "warning", message: "Sin ID de intento." });

  router.push({
    name: "juego-resultado",
    params: { idintento: String(ultimoIdIntento.value) },
  });
}

/* ================== Lifecycle ================== */
onMounted(async () => {
  resizeObs = new ResizeObserver(() => {
    computeGameHeight();
  });
  if (topbarEl.value) resizeObs.observe(topbarEl.value);
  if (binsArea.value) resizeObs.observe(binsArea.value);

  computeGameHeight();
  await cargar();

  window.addEventListener("resize", computeGameHeight);
});

onBeforeUnmount(() => {
  limpiarCronometro();
  cancelAnimationFrame(animFrame);
  clearSpawnTimer();
  window.removeEventListener("resize", computeGameHeight);
  if (resizeObs && topbarEl.value) resizeObs.unobserve(topbarEl.value);
  if (resizeObs && binsArea.value) resizeObs.unobserve(binsArea.value);
});
</script>

<style scoped>
.reciclaje-lluvia-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #063e24, #001c10 80%);
  color: #fff;
  overflow: hidden;
  position: relative;
}

.play-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 18px 16px 96px;
}

/* HUD */
.topbar {
  position: sticky;
  top: 10px;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 10px 14px;
  margin-bottom: 12px;
}
.titulo {
  font-weight: 800;
  letter-spacing: 0.3px;
  margin-left: 6px;
}
.stat-badge {
  font-size: 0.95rem;
  padding: 6px 12px;
  border-radius: 999px;
}

/* Área de juego */
.game-area {
  position: relative;
  width: 100%;
  border-radius: 14px;
  background: rgba(0, 60, 30, 0.28);
  overflow: hidden;
}

/* Línea de piso */
.ground-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(0, 255, 136, 0.7);
  box-shadow: 0 0 10px rgba(0, 255, 136, 0.9);
}

/* Ítems */
.falling-item {
  position: absolute;
  transition: top 0.06s linear;
}
.item-nombre {
  width: 84px;
  height: 84px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  font-weight: 800;
}

/* Contenedores */
.bins-area {
  position: absolute;
  bottom: 10px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
}
.bin {
  border: 2px dashed rgba(255, 255, 255, 0.35);
  border-radius: 12px;
  padding: 10px;
  text-align: center;
  width: 128px;
  transition: all 0.25s ease;
}
.bin.glow {
  background: rgba(0, 255, 136, 0.12);
  border-color: rgba(0, 255, 136, 0.5);
}
.bin.correcto {
  background: rgba(0, 255, 136, 0.25);
  border-color: #00ff88;
  box-shadow: 0 0 18px #00ff88;
}
.bin.incorrecto {
  background: rgba(255, 77, 77, 0.25);
  border-color: #ff4d4d;
  box-shadow: 0 0 18px #ff4d4d;
}
.bin-label {
  font-weight: 800;
  color: #fff;
  margin-top: 5px;
}

/* Footer finalizar */
.footer-final {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 20px;
  display: flex;
  justify-content: center;
}
.btn-finalizar {
  border-radius: 999px;
  padding: 12px 28px;
  font-weight: 800;
  box-shadow: 0 8px 30px rgba(0, 255, 136, 0.35);
}

/* Contador */
.cuenta-float {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 30;
}
.cuenta-num {
  font-size: clamp(3rem, 7vw, 6rem);
  font-weight: 900;
  color: #ffcd4d;
  text-shadow: 0 0 20px rgba(255, 205, 77, 0.9);
  animation: pop 1s ease infinite;
}
@keyframes pop {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

/* Transiciones */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
