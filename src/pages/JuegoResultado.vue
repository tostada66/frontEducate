<template>
  <q-page class="resultado-juego-page q-pa-none">
    <!-- 🧭 ENCABEZADO DE LA UNIDAD -->
    <div class="hero-encabezado">
      <img :src="unidadImagenSrc" alt="Imagen de la unidad" class="hero-img" />

      <div class="hero-overlay column justify-between">
        <div class="row justify-start q-pa-md">
          <q-btn
            color="blue"
            glossy
            icon="arrow_back"
            label="Volver a la unidad"
            class="boton-volver"
            @click="volverUnidad"
          />
        </div>

        <div
          class="hero-content column items-start justify-end q-px-lg q-pb-md"
        >
          <div class="unidad-info q-mb-md">
            <div class="unidad-titulo">
              {{
                intento?.curso_juego?.unidad?.titulo ||
                intento?.curso_juego?.unidad?.nombre ||
                "Unidad sin nombre"
              }}
            </div>

            <div class="unidad-curso">
              <span class="text-bold">Curso:</span>
              {{ intento?.curso_juego?.unidad?.curso?.nombre || "Sin curso" }}
              <span class="q-mx-sm text-bold">|</span>
              <span class="text-bold">Nivel:</span>
              {{
                intento?.curso_juego?.unidad?.curso?.nivel || "No especificado"
              }}
            </div>

            <div class="unidad-descripcion q-mt-xs">
              <span class="text-bold">Descripción:</span>
              {{
                intento?.curso_juego?.unidad?.descripcion || "Sin descripción"
              }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 📊 RESULTADOS -->
    <div class="resultados-container">
      <q-card class="resultado-card shadow-6 q-pa-xl">
        <div class="text-h5 text-morado text-bold q-mb-md">
          🏁 Resultado del juego —
          {{
            esReciclaje ? "Reciclaje" : esMemoria ? "Memoria" : "Mecanografía"
          }}
        </div>

        <q-separator color="grey-4" spaced />

        <div class="q-mt-md column items-center">
          <div
            class="text-h4 text-bold"
            :class="ganado ? 'text-positive' : 'text-negative'"
          >
            {{ ganado ? mensajeOk : mensajeNo }}
          </div>

          <div class="q-mt-md flex items-center q-gutter-md">
            <q-circular-progress
              :value="progresoPct"
              size="90px"
              :thickness="0.22"
              :color="colorPorcentaje"
              track-color="grey-8"
              show-value
              class="text-white"
            >
              {{ progresoPct }}%
            </q-circular-progress>

            <div class="text-grey-4">
              <template v-if="esMemoria">
                ({{ intento?.aciertos ?? 0 }} / {{ totalItems }}
                {{ etiquetaItems }})
              </template>
              <template v-else-if="esReciclaje">
                Umbral de éxito: <b>{{ UMBRAL_RECICLAJE }}%</b><br />
                ({{ intento?.aciertos ?? 0 }} / {{ totalItems }}
                {{ etiquetaItems }})
              </template>
              <template v-else>
                Aprobación mínima: <b>{{ UMBRAL_APROBACION }}%</b><br />
                ({{ intento?.aciertos ?? 0 }} / {{ totalItems }}
                {{ etiquetaItems }})
              </template>
            </div>
          </div>
        </div>

        <q-separator color="grey-4" spaced />

        <!-- 🔹 Stats pirámide -->
        <div class="stats-wrap q-mt-lg">
          <div class="row q-col-gutter-md justify-center q-mb-lg">
            <div class="col-12 col-sm-6 col-md-4">
              <div class="stat-box">
                <div class="stat-label text-green">
                  <q-icon name="check_circle" color="green-5" />
                  {{ etiquetaAciertos }}
                </div>
                <div class="stat-value">{{ aciertosN }}</div>
              </div>
            </div>

            <div class="col-12 col-sm-6 col-md-4">
              <div class="stat-box">
                <div class="stat-label text-red">
                  <q-icon name="cancel" color="red-5" />
                  Errores
                </div>
                <div class="stat-value">{{ erroresN }}</div>
              </div>
            </div>

            <div class="col-12 col-sm-6 col-md-4" v-if="esMemoria">
              <div class="stat-box">
                <div class="stat-label">
                  <q-icon name="bolt" color="purple-4" />
                  Precisión
                </div>
                <div class="stat-value">{{ precisionPct }}%</div>
              </div>
            </div>

            <div class="col-12 col-sm-6 col-md-4" v-else-if="esReciclaje">
              <div class="stat-box">
                <div class="stat-label">
                  <q-icon name="percent" color="purple-4" />
                  Eficiencia
                </div>
                <div class="stat-value">{{ eficienciaPct }}%</div>
              </div>
            </div>
          </div>

          <div class="row q-col-gutter-md justify-center">
            <template v-if="esMemoria">
              <div class="col-12 col-sm-6 col-md-4">
                <div class="stat-box">
                  <div class="stat-label">
                    <q-icon name="directions_run" color="purple-4" />
                    Movimientos
                  </div>
                  <div class="stat-value">{{ movimientosTxt }}</div>
                </div>
              </div>

              <div class="col-12 col-sm-6 col-md-4" v-if="rachaMax != null">
                <div class="stat-box">
                  <div class="stat-label">
                    <q-icon name="local_fire_department" color="orange-5" />
                    Racha máx.
                  </div>
                  <div class="stat-value">{{ rachaMax }}</div>
                </div>
              </div>
            </template>

            <template v-else-if="esReciclaje">
              <div class="col-12 col-sm-6 col-md-4">
                <div class="stat-box">
                  <div class="stat-label">
                    <q-icon name="speed" color="purple-4" />
                    Objetos/min
                  </div>
                  <div class="stat-value">{{ objetosPorMin }}</div>
                </div>
              </div>

              <div class="col-12 col-sm-6 col-md-4">
                <div class="stat-box">
                  <div class="stat-label">
                    <q-icon name="hourglass_bottom" color="purple-4" />
                    Tiempo restante
                  </div>
                  <div class="stat-value">{{ tiempoRestanteTxt }}</div>
                </div>
              </div>
            </template>
          </div>
        </div>

        <q-separator color="grey-4" spaced />

        <div class="q-mt-xl flex justify-center q-gutter-md">
          <q-btn
            color="deep-purple-6"
            glossy
            icon="replay"
            label="Reintentar juego"
            @click="reintentarJuego"
            rounded
          />
          <q-btn
            color="green-6"
            glossy
            icon="arrow_back"
            label="Volver a la unidad"
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

const UMBRAL_APROBACION = 75;
const UMBRAL_RECICLAJE = 75;
const PLACEHOLDER = "/images/unidad-placeholder.jpg";

const intento = ref(null);

const BACKEND_ORIGIN = (() => {
  try {
    const u = new URL(api.defaults.baseURL || "");
    return `${u.protocol}//${u.host}`;
  } catch {
    return window.location.origin;
  }
})();

function normalizeImageUrl(u) {
  if (!u) return PLACEHOLDER;
  const s = String(u).trim();
  if (/^https?:\/\//i.test(s)) return s;
  return `${BACKEND_ORIGIN}/storage/${s.replace(/^\/?storage\/?/, "")}`;
}

async function loadResultado() {
  try {
    const { idintento } = route.params;
    const { data } = await api.get(`/juegos/intentos/${idintento}`);
    intento.value = data.data;
  } catch (err) {
    console.error("❌ Error cargando intento:", err);
    $q.notify({
      type: "negative",
      message:
        err?.response?.data?.message || "No se pudo cargar el resultado.",
    });
  }
}

const unidadImagenSrc = computed(() => {
  const unidad = intento.value?.curso_juego?.unidad;
  return normalizeImageUrl(unidad?.imagen_url || unidad?.imagen || PLACEHOLDER);
});

/* --- Cálculos --- */
const detalles = computed(() => intento.value?.detalles || {});
const esMemoria = computed(
  () => typeof detalles.value.pares_totales !== "undefined"
);
const esReciclaje = computed(
  () => !esMemoria.value && typeof detalles.value.total_items !== "undefined"
);
const totalItems = computed(() => {
  if (esMemoria.value) return Number(detalles.value.pares_totales || 0);
  if (esReciclaje.value) return Number(detalles.value.total_items || 0);
  return (
    Number(intento.value?.aciertos || 0) + Number(intento.value?.errores || 0)
  );
});
const etiquetaItems = computed(() =>
  esMemoria.value ? "pares" : esReciclaje.value ? "objetos" : "palabras"
);
const etiquetaAciertos = computed(() =>
  esMemoria.value ? "Pares" : esReciclaje.value ? "Reciclados" : "Aciertos"
);
const tiempoTotal = computed(() => Number(intento.value?.tiempo || 0));
const tiempoFormateado = computed(() => {
  const min = Math.floor(tiempoTotal.value / 60);
  const seg = tiempoTotal.value % 60;
  return `${min}m ${seg}s`;
});
const aciertosN = computed(() => Number(intento.value?.aciertos || 0));
const erroresN = computed(() => Number(intento.value?.errores || 0));
const precisionPct = computed(() => {
  const denom = Math.max(1, aciertosN.value + erroresN.value);
  return Math.round((aciertosN.value / denom) * 100);
});
const progresoPct = computed(() => {
  const tot = Math.max(1, totalItems.value);
  return Math.round((aciertosN.value / tot) * 100);
});
const colorPorcentaje = computed(() =>
  progresoPct.value >= UMBRAL_APROBACION ? "positive" : "negative"
);
const movimientosTxt = computed(() => detalles.value?.movimientos ?? "-");
const rachaMax = computed(() => detalles.value?.racha_max ?? null);
const eficienciaPct = computed(() => {
  const denom = Math.max(1, aciertosN.value + erroresN.value);
  return Math.round((aciertosN.value / denom) * 100);
});
const objetosPorMin = computed(() => {
  const mins = Math.max(1, tiempoTotal.value / 60);
  return (aciertosN.value / mins).toFixed(1);
});
const tiempoRestanteTxt = computed(() => {
  const t = Number(detalles.value?.tiempo_restante ?? 0);
  const m = Math.floor(t / 60);
  const s = t % 60;
  return `${m}m ${s}s`;
});
const ganado = computed(() => progresoPct.value >= UMBRAL_APROBACION);
const mensajeOk = computed(() => "¡Excelente desempeño! 🎉");
const mensajeNo = computed(() => "Sigue practicando 💪");

function reintentarJuego() {
  const idcursojuego =
    intento.value?.idcursojuego || intento.value?.curso_juego?.idcursojuego;
  if (!idcursojuego)
    return $q.notify({
      type: "warning",
      message: "No se encontró el id del curso-juego.",
    });
  const name = esMemoria.value
    ? "juego-memoria-play"
    : esReciclaje.value
    ? "juego-reciclaje-play"
    : "juego-mecanografia-play";
  router.push({ name, params: { idcursojuego: String(idcursojuego) } });
}

async function volverUnidad() {
  try {
    const idcurso = intento.value?.curso_juego?.unidad?.curso?.idcurso;
    const idunidad = intento.value?.curso_juego?.unidad?.idunidad;
    if (idcurso && idunidad) {
      await router.push({
        name: "unidad-detalle",
        params: { idcurso, idunidad },
      });
      return;
    }
    router.back();
  } catch (e) {
    console.error(e);
    $q.notify({ type: "negative", message: "No se pudo volver a la unidad." });
  }
}

onMounted(loadResultado);
</script>

<style scoped>
.resultado-juego-page {
  background: radial-gradient(circle at 25% 25%, #3b0a73, #1a0033 85%);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
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
  filter: brightness(0.75);
}
.hero-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.75), transparent 80%);
}
.unidad-titulo {
  font-size: 2rem;
  font-weight: 800;
  color: #fff;
  text-shadow: 0 0 14px #a200dc, 0 0 25px #d86cff;
}
.unidad-curso,
.unidad-descripcion {
  font-size: 1.1rem;
  color: #e2e2e2;
}
.boton-volver {
  font-weight: 600;
  border-radius: 10px;
  box-shadow: 0 0 12px rgba(0, 140, 255, 0.7);
}

/* 📊 Resultados */
.resultados-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}
.resultado-card {
  max-width: 920px;
  border-radius: 26px;
  padding: 36px 32px;
  background: linear-gradient(180deg, #4b0082, #2a005a);
  color: white;
  box-shadow: 0 0 25px rgba(162, 0, 220, 0.6), 0 0 55px rgba(120, 0, 255, 0.3);
  backdrop-filter: blur(6px) brightness(1.1);
}
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

/* ✅ Pirámide */
.stats-wrap {
  width: 100%;
}
.stat-box {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 14px 18px;
  min-height: 96px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  box-shadow: 0 10px 24px rgba(162, 0, 220, 0.16);
  backdrop-filter: blur(3px);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}
.stat-box:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 30px rgba(162, 0, 220, 0.24);
}
.stat-label {
  color: #d2a8ff;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
}
.stat-value {
  color: #fff;
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: 0.2px;
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
</style>
