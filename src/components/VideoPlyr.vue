<template>
  <div class="video-wrap">
    <!-- Forzamos remount si cambia la URL -->
    <video
      :key="videoKey"
      ref="videoEl"
      class="player"
      playsinline
      controls
      :poster="poster || undefined"
    >
      <source :src="resolvedSrc" :type="mimeType" />
    </video>

    <!-- Debug opcional -->
    <div v-if="debug" class="text-caption text-grey q-mt-xs">
      <div><b>SRC:</b> {{ resolvedSrc }}</div>
      <div><b>Duración:</b> {{ Math.round(duration) }}s</div>
      <div>
        <b>Tiempo actual:</b> {{ Math.round(current) }}s ({{ percent }}%)
      </div>
    </div>
  </div>
</template>

<script setup>
// ✅ Plyr mínimo (sin hotkeys)
import Plyr from "plyr"; // si tu bundler da guerra: import Plyr from "plyr/dist/plyr.js";
import "plyr/dist/plyr.css";

import {
  ref,
  computed,
  nextTick,
  onMounted,
  onBeforeUnmount,
  watch,
} from "vue";

/* ---------------- Props ---------------- */
const props = defineProps({
  /** Ruta del video. Puede ser absoluta o /storage/... */
  src: { type: String, required: true },
  /** MIME type del source */
  mimeType: { type: String, default: "video/mp4" },
  /** Miniatura */
  poster: { type: String, default: "" },
  /** Segundo inicial donde arrancar */
  startAt: { type: Number, default: 0 },
  /** Si true, convierte /storage/... -> /api/stream/... */
  convertStorageToStream: { type: Boolean, default: true },
  /** Base URL para construir stream absoluto (p.ej., http://127.0.0.1:8000) */
  baseURL: { type: String, default: "" },
  /** Opciones de Plyr (parciales) */
  options: {
    type: Object,
    default: () => ({
      seekTime: 10,
      controls: [
        "play-large",
        "play",
        "rewind",
        "fast-forward",
        "progress",
        "current-time",
        "duration",
        "mute",
        "volume",
        "settings",
        "pip",
        "fullscreen",
      ],
      keyboard: { focused: true, global: false },
      tooltips: { controls: true, seek: true },
    }),
  },
  /** Mostrar datos de depuración debajo del player */
  debug: { type: Boolean, default: false },
});

/* ---------------- Emits ---------------- */
const emit = defineEmits([
  // Dispara cuando ya conocemos la duración y se inicializó todo
  "ready", // payload: { duration }
  "timeupdate", // payload: { current, duration, percent }
  "progress", // alias de timeupdate (por compatibilidad)
  "pause", // payload: { current, duration, percent }
  "ended", // sin payload
  "error", // payload: Error|{message:string}
]);

/* ---------------- State refs ---------------- */
const videoEl = ref(null);
const plyr = ref(null);
const current = ref(0);
const duration = ref(0);
const percent = ref(0);

/* ---------------- Helpers ---------------- */
// Convierte /storage/... a /api/stream/... (con baseURL si se da)
const resolvedSrc = computed(() => {
  const raw = props.src || "";
  if (!raw) return "";
  if (!props.convertStorageToStream) return raw;

  try {
    const u = new URL(raw, props.baseURL || window.location.origin);
    // reemplaza exactamente el primer "/storage/" del pathname
    const newPath = u.pathname.replace("/storage/", "/api/stream/");
    return u.origin + newPath + u.search + u.hash;
  } catch {
    // fallback simple (en caso de ruta relativa rara)
    if (props.baseURL && raw.startsWith("/storage/")) {
      return (
        props.baseURL.replace(/\/$/, "") +
        raw.replace("/storage/", "/api/stream/")
      );
    }
    return raw.replace("/storage/", "/api/stream/");
  }
});

// Clave para remount cuando cambia la URL efectiva
const videoKey = computed(() => `${resolvedSrc.value}::${props.poster || ""}`);

/* ---------------- Lifecycle ---------------- */
function destroyPlyr() {
  try {
    plyr.value?.destroy();
  } catch {}
  plyr.value = null;
}

async function mountPlyr() {
  await nextTick();
  destroyPlyr();
  if (!videoEl.value) return;

  plyr.value = new Plyr(videoEl.value, { ...props.options });

  // Una vez que haya metadata, fijamos duración y, si corresponde, el startAt
  const media = plyr.value.media;
  const onLoadedMeta = () => {
    duration.value = Number.isFinite(media?.duration) ? media.duration : 0;

    if (props.startAt > 0 && duration.value > 0) {
      try {
        media.currentTime = Math.min(
          Math.max(props.startAt, 0),
          duration.value
        );
      } catch {}
    }

    emit("ready", { duration: duration.value });
  };

  media?.addEventListener("loadedmetadata", onLoadedMeta, { once: true });

  // Time updates
  const onTimeUpdate = () => {
    const d = Number.isFinite(media?.duration) ? media.duration : 0;
    const c = Number.isFinite(media?.currentTime) ? media.currentTime : 0;
    duration.value = d || duration.value; // conserva si d=0
    current.value = c;
    percent.value = d ? Math.round((c / d) * 100) : 0;

    const payload = {
      current: c,
      duration: d || duration.value,
      percent: percent.value,
    };
    emit("timeupdate", payload);
    emit("progress", payload); // alias
  };

  media?.addEventListener("timeupdate", onTimeUpdate);

  // Pause
  const onPause = () => {
    const d = Number.isFinite(media?.duration)
      ? media.duration
      : duration.value;
    const c = Number.isFinite(media?.currentTime)
      ? media.currentTime
      : current.value;
    const p = d ? Math.round((c / d) * 100) : 0;
    emit("pause", { current: c, duration: d, percent: p });
  };
  media?.addEventListener("pause", onPause);

  // Ended
  const onEnded = () => emit("ended");
  media?.addEventListener("ended", onEnded);

  // Error
  const onError = (e) =>
    emit("error", e?.detail || e || { message: "Playback error" });
  media?.addEventListener("error", onError);

  // Limpieza específica de listeners al destruir / remount
  onBeforeUnmount(() => {
    try {
      media?.removeEventListener("loadedmetadata", onLoadedMeta);
      media?.removeEventListener("timeupdate", onTimeUpdate);
      media?.removeEventListener("pause", onPause);
      media?.removeEventListener("ended", onEnded);
      media?.removeEventListener("error", onError);
    } catch {}
  });
}

watch([resolvedSrc], async () => {
  await mountPlyr();
});

onMounted(async () => {
  await mountPlyr();
});

onBeforeUnmount(() => {
  destroyPlyr();
});

/* ---------------- Expose (APIs del player) ---------------- */
function play() {
  try {
    plyr.value?.play?.();
  } catch {}
}
function pause() {
  try {
    plyr.value?.pause?.();
  } catch {}
}
function seekTo(sec = 0) {
  try {
    const d = duration.value || 0;
    const t = Math.max(0, Math.min(sec, d || Infinity));
    plyr.value?.media && (plyr.value.media.currentTime = t);
  } catch {}
}
function getCurrentTime() {
  return current.value || 0;
}
function getDuration() {
  return duration.value || 0;
}

defineExpose({ play, pause, seekTo, getCurrentTime, getDuration });
</script>

<style scoped>
.video-wrap {
  background: #000;
  border-radius: 12px;
  overflow: hidden;
}
.player {
  width: 100%;
  height: auto;
  display: block;
}

/* ✅ Asegura que veas los controles de Plyr y no los nativos */
:deep(.plyr) {
  display: block;
  position: relative;
  max-width: 100%;
}
:deep(.plyr__controls) {
  display: flex !important;
}
/* Oculta controles nativos SOLO cuando Plyr ya está montado */
:deep(.plyr video::-webkit-media-controls) {
  display: none !important;
}
:deep(.plyr video::-webkit-media-controls-enclosure) {
  display: none !important;
}
</style>
