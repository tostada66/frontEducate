<template>
  <q-page class="q-pa-md bg-grey-2">
    <!-- 🔹 Banner solo para Admin/Profesor -->
    <div
      v-if="auth.isProfessor"
      class="bg-primary text-white text-center q-pa-sm q-mb-md"
    >
      <q-icon name="visibility" class="q-mr-xs" />
      Vista previa del contenido (Profesor)
    </div>
    <div
      v-else-if="auth.isAdmin"
      class="bg-positive text-white text-center q-pa-sm q-mb-md"
    >
      <q-icon name="admin_panel_settings" class="q-mr-xs" />
      Vista del contenido (Administrador)
    </div>

    <!-- Loader -->
    <div v-if="loading" class="row justify-center q-mt-lg">
      <q-spinner-dots color="primary" size="40px" />
    </div>

    <!-- 🔹 Contenido principal -->
    <div v-else class="row q-col-gutter-md">
      <!-- 📺 Columna izquierda -->
      <div class="col-12 col-md-8">
        <!-- Encabezado -->
        <div class="encabezado q-mb-sm">
          <div class="clase-line">
            <span class="label">Clase:</span>
            <span class="clase-titulo">{{
              currentClase?.titulo || "Clase"
            }}</span>
          </div>
          <div class="video-line">
            <span class="label">Video:</span>
            <span class="video-titulo">{{
              contenido?.titulo || "Contenido"
            }}</span>
            <span class="sep">·</span>
            <q-icon name="schedule" size="18px" class="dur-icon" />
            <span class="video-duracion">{{
              formatDuration(contenido?.duracion)
            }}</span>
          </div>
        </div>

        <div class="text-grey-7 q-mb-lg">
          {{ contenido?.descripcion }}
        </div>

        <!-- 🎥 Reproductor con Plyr -->
        <div
          v-if="contenido?.tipo === 'video'"
          class="video-container q-mb-lg relative-position"
          @mouseenter="focusPlayer"
          @click="focusPlayer"
        >
          <div
            v-if="progreso.porcentaje > 0"
            class="text-caption text-grey-7 q-mb-xs"
          >
            Progreso: {{ progreso.porcentaje }}%
          </div>

          <!-- Overlays tipo YouTube -->
          <transition name="fade">
            <div v-if="skipOverlay" class="yt-overlay absolute-center">
              {{ skipOverlay }}
            </div>
          </transition>
          <transition name="fade">
            <div v-if="speedOverlay" class="yt-overlay absolute-center">
              {{ speedOverlay }}
            </div>
          </transition>

          <!-- Video -->
          <video
            :key="contenido?.idcontenido"
            ref="rawVideoEl"
            playsinline
            controls
            class="player focusable-video"
            tabindex="0"
            :poster="contenido?.miniatura_publica || undefined"
          >
            <source :src="contenido?.archivo" type="video/mp4" />
            <!-- Si luego usas thumbnails .vtt, déjalo activo -->
            <track
              v-if="contenido?.thumb_vtt"
              kind="metadata"
              :src="contenido.thumb_vtt"
              default
            />
          </video>
        </div>

        <!-- ⚠️ No es video -->
        <div v-else>
          <q-banner rounded class="bg-orange-2 text-orange-9">
            Este contenido no es un video. Usa la pestaña <b>Contenidos</b> para
            abrir imágenes o documentos.
          </q-banner>
        </div>

        <!-- 💬 Comentarios -->
        <div class="q-mt-xl">
          <div class="text-h6 text-primary q-mb-md">Comentarios</div>

          <q-input
            ref="commentInputRef"
            v-model="nuevoComentario"
            placeholder="Escribe un comentario..."
            outlined
            dense
            autogrow
            class="q-mb-md"
            :disable="sendingComment"
            @keydown.enter.exact.prevent="publicarComentario"
          >
            <template #append>
              <q-btn
                flat
                icon="send"
                color="primary"
                :loading="sendingComment"
                @click="publicarComentario"
              />
            </template>
          </q-input>

          <div v-if="comentarios.length">
            <div
              v-for="comentario in comentarios"
              :key="comentario.idcomentario"
              class="q-mb-md"
            >
              <div class="row items-start no-wrap q-mb-xs">
                <q-avatar size="40px">
                  <img
                    :src="comentario.foto_url || defaultAvatar"
                    @error="(e) => (e.target.src = defaultAvatar)"
                    alt="foto usuario"
                  />
                </q-avatar>

                <div class="q-ml-sm col">
                  <div class="comment-header">
                    <span class="author-name">{{
                      comentario.autor_nombre
                    }}</span>
                    <span class="comment-date">{{
                      comentario.created_at
                    }}</span>
                  </div>
                  <div class="comment-text q-mt-xs">
                    {{ comentario.contenido }}
                  </div>
                  <div class="row items-center q-mt-xs">
                    <q-btn
                      flat
                      dense
                      size="sm"
                      color="primary"
                      icon="reply"
                      label="Responder"
                      @click="abrirRespuesta(comentario)"
                    />
                    <q-btn
                      v-if="puedeEliminar(comentario)"
                      flat
                      dense
                      size="sm"
                      color="negative"
                      icon="delete"
                      label="Eliminar"
                      class="q-ml-sm"
                      @click="eliminarComentario(comentario)"
                    />
                  </div>
                </div>
              </div>

              <!-- Respuestas -->
              <div
                v-for="resp in comentario.respuestas"
                :key="resp.idcomentario"
                class="q-ml-xl q-mt-xs"
              >
                <div class="row items-start no-wrap">
                  <q-avatar size="32px">
                    <img
                      :src="resp.foto_url || defaultAvatar"
                      @error="(e) => (e.target.src = defaultAvatar)"
                      alt="foto respuesta"
                    />
                  </q-avatar>
                  <div class="q-ml-sm col">
                    <div class="comment-header">
                      <span class="author-name">{{ resp.autor_nombre }}</span>
                      <span class="comment-date">{{ resp.created_at }}</span>
                    </div>
                    <div class="comment-text q-mt-xs">{{ resp.contenido }}</div>

                    <q-btn
                      v-if="puedeEliminar(resp)"
                      flat
                      dense
                      size="sm"
                      color="negative"
                      icon="delete"
                      label="Eliminar"
                      class="q-mt-xs"
                      @click="eliminarComentario(resp)"
                    />
                  </div>
                </div>
              </div>

              <q-separator spaced />
            </div>
          </div>

          <div v-else class="text-grey text-center q-mt-md">
            Aún no hay comentarios. Sé el primero en opinar.
          </div>
        </div>
      </div>

      <!-- 📋 Columna derecha -->
      <div class="col-12 col-md-4">
        <div class="row q-mb-md">
          <q-btn
            flat
            :color="currentTab === 'videos' ? 'primary' : 'grey'"
            label="Videos"
            class="q-mr-sm"
            @click="currentTab = 'videos'"
          />
          <q-btn
            flat
            :color="currentTab === 'contenidos' ? 'primary' : 'grey'"
            label="Contenidos"
            @click="currentTab = 'contenidos'"
          />
        </div>

        <div v-if="currentTab === 'videos'">
          <q-list bordered class="rounded-borders">
            <q-item
              v-for="v in videosFlat"
              :key="v.idcontenido"
              clickable
              @click="goToContenido(v)"
            >
              <q-item-section avatar>
                <q-avatar square size="80px" class="relative-position">
                  <img
                    :src="v.miniatura_publica || v.archivo"
                    alt="miniatura video"
                    style="
                      width: 100%;
                      height: 100%;
                      object-fit: cover;
                      border-radius: 6px;
                      pointer-events: none;
                    "
                  />
                  <q-icon
                    name="play_circle"
                    color="white"
                    size="28px"
                    class="absolute-center"
                    style="text-shadow: 0 0 6px rgba(0, 0, 0, 0.7)"
                  />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-grey-9">
                  <span class="text-weight-bold">Clase:</span>
                  {{ v.claseTitulo }}
                  <span class="q-mx-xs">·</span>
                  <span class="text-weight-bold">Video:</span>
                  {{ v.titulo || "Sin título" }}
                  <span class="q-mx-xs">·</span>
                  <q-icon name="schedule" size="16px" class="q-mr-2" />
                  <span>{{ formatDuration(v.duracion) }}</span>
                </q-item-label>
                <q-item-label v-if="v.descripcion" caption class="text-grey-7">
                  {{ v.descripcion }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <div v-else-if="currentTab === 'contenidos'">
          <q-list bordered class="rounded-borders">
            <q-item
              v-for="c in contenidosNoVideo"
              :key="c.idcontenido"
              clickable
              @click="goToContenido(c)"
            >
              <q-item-section avatar>
                <q-avatar
                  square
                  size="80px"
                  class="bg-blue text-white flex flex-center"
                >
                  <q-icon :name="getDocIcon(c.archivo)" size="md" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-grey-9">{{ c.titulo }}</q-item-label>
                <q-item-label caption class="text-grey-7">
                  {{ c.tipo.toUpperCase() }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import "plyr/dist/plyr.css";
import {
  ref,
  onMounted,
  nextTick,
  watch,
  computed,
  onBeforeUnmount,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { api } from "boot/axios";
import { useQuasar } from "quasar";
import { useAuthStore } from "src/stores/auth";
import Plyr from "plyr";

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const auth = useAuthStore();

const contenido = ref(null);
const clases = ref([]);
const videosFlat = ref([]);
const contenidosNoVideo = ref([]);
const loading = ref(false);
const currentTab = ref("videos");

// 💬 Comentarios
const comentarios = ref([]);
const nuevoComentario = ref("");
const comentarioPadre = ref(null);
const sendingComment = ref(false);
const commentInputRef = ref(null);

// 🎥 Plyr
const rawVideoEl = ref(null); // <video>
const plyr = ref(null); // instancia Plyr
const videoRef = ref(null); // HTMLVideoElement
const progreso = ref({ ultimo_segundo: 0, porcentaje: 0, completado: false });

// Overlays
const skipOverlay = ref("");
const speedOverlay = ref("");
let overlayTimer = null;

// Plyr options (dejamos keyboard off; nosotros manejamos teclas)
const plyrOptions = {
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
  keyboard: { focused: false, global: false },
  tooltips: { controls: true, seek: true },
};

// Utils
const defaultAvatar =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'>
    <rect width='100%' height='100%' fill='#ECEFF1'/>
    <circle cx='64' cy='48' r='24' fill='#90A4AE'/>
    <rect x='20' y='80' width='88' height='32' rx='16' fill='#B0BEC5'/>
  </svg>`);

const currentClase = computed(() =>
  clases.value.find((x) => String(x.idclase) === String(route.params.idclase))
);

function formatDuration(sec) {
  const s = Number(sec || 0);
  if (!s) return "—";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = Math.floor(s % 60);
  const mm = String(m).padStart(2, "0");
  const sss = String(ss).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${sss}` : `${m}:${sss}`;
}
function getDocIcon(url = "") {
  const l = (url || "").toLowerCase();
  if (l.endsWith(".pdf")) return "picture_as_pdf";
  if (l.endsWith(".doc") || l.endsWith(".docx")) return "description";
  if (l.endsWith(".xls") || l.endsWith(".xlsx")) return "grid_on";
  if (l.endsWith(".ppt") || l.endsWith(".pptx")) return "slideshow";
  return "insert_drive_file";
}
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}
function isTypingTarget(el) {
  if (!el) return false;
  const tag = el.tagName?.toLowerCase();
  return tag === "input" || tag === "textarea" || el.isContentEditable;
}
function showOverlay(refVar, text) {
  refVar.value = text;
  if (overlayTimer) clearTimeout(overlayTimer);
  overlayTimer = setTimeout(() => {
    refVar.value = "";
  }, 700);
}
function focusPlayer() {
  rawVideoEl.value?.focus?.({ preventScroll: true });
}

/* ========== Plyr mount / cleanup ========== */
function destroyPlyr() {
  try {
    plyr.value?.destroy();
  } catch {}
  plyr.value = null;
  videoRef.value = null;
}

async function mountPlyr() {
  await nextTick();
  destroyPlyr();
  if (!rawVideoEl.value) return;

  plyr.value = new Plyr(rawVideoEl.value, plyrOptions);
  videoRef.value = plyr.value.media;

  // Reposicionar si hay progreso previo
  videoRef.value.onloadedmetadata = () => {
    if (progreso.value?.ultimo_segundo > 5) {
      try {
        videoRef.value.currentTime = progreso.value.ultimo_segundo;
      } catch {}
    }
  };

  // Guardado periódico
  let ultimoGuardadoLocal = 0;
  videoRef.value.ontimeupdate = () => {
    const current = Math.floor(videoRef.value.currentTime || 0);
    if (current - ultimoGuardadoLocal >= 15) {
      guardarProgreso();
      ultimoGuardadoLocal = current;
    }
  };
  videoRef.value.onended = () => guardarProgreso(true);
}

/* ========== Hotkeys estilo YouTube ========== */
function onKeydown(e) {
  if (!plyr.value || !videoRef.value) return;

  // Si estás escribiendo, no intervenir
  if (isTypingTarget(e.target)) return;

  // Si no hay un input enfocado, fuerza foco al video
  const ae = document.activeElement;
  if (!isTypingTarget(ae)) focusPlayer();

  const v = plyr.value;
  const el = videoRef.value; // usamos directamente el <video>
  const step = 10;

  // Bloquear scroll y burbujeo
  const affectors = [
    " ",
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "j",
    "J",
    "k",
    "K",
    "l",
    "L",
  ];
  if (
    affectors.includes(e.key) ||
    /^[0-9]$/.test(e.key) ||
    e.key === ">" ||
    e.key === "<" ||
    e.key.toLowerCase() === "m" ||
    e.key.toLowerCase() === "f"
  ) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation?.();
  }

  // 0–9 → saltar a porcentaje
  if (
    /^[0-9]$/.test(e.key) &&
    !e.shiftKey &&
    !e.altKey &&
    !e.ctrlKey &&
    !e.metaKey
  ) {
    const pct = e.key === "0" ? 0 : parseInt(e.key, 10) * 0.1;
    const dur = el.duration || 0;
    if (dur && isFinite(dur)) {
      el.currentTime = clamp(dur * pct, 0, dur);
      showOverlay(skipOverlay, `${Math.round(pct * 100)}%`);
    }
    return;
  }

  switch (e.key) {
    case " ":
    case "k":
    case "K":
      v.togglePlay();
      break;

    case "ArrowRight":
    case "l":
    case "L":
      el.currentTime = clamp(
        (el.currentTime || 0) + step,
        0,
        el.duration || Infinity
      );
      showOverlay(skipOverlay, ">>> +10s");
      break;

    case "ArrowLeft":
    case "j":
    case "J":
      el.currentTime = clamp(
        (el.currentTime || 0) - step,
        0,
        el.duration || Infinity
      );
      showOverlay(skipOverlay, "<<< -10s");
      break;

    case "ArrowUp": {
      const vol = clamp((v.volume ?? 1) + 0.05, 0, 1);
      v.volume = vol;
      showOverlay(speedOverlay, `${Math.round(vol * 100)}% 🔊`);
      break;
    }
    case "ArrowDown": {
      const vol = clamp((v.volume ?? 1) - 0.05, 0, 1);
      v.volume = vol;
      showOverlay(speedOverlay, `${Math.round(vol * 100)}% 🔉`);
      break;
    }

    case "m":
    case "M":
      v.muted = !v.muted;
      showOverlay(speedOverlay, v.muted ? "Mute" : "Unmute");
      break;

    case "f":
    case "F":
      v.fullscreen.toggle();
      break;

    // Velocidad con Shift+> / Shift+<
    case ">":
      if (e.shiftKey) {
        v.speed = clamp((v.speed || 1) + 0.25, 0.25, 2);
        showOverlay(speedOverlay, `${v.speed.toFixed(2)}×`);
      }
      break;
    case "<":
      if (e.shiftKey) {
        v.speed = clamp((v.speed || 1) - 0.25, 0.25, 2);
        showOverlay(speedOverlay, `${v.speed.toFixed(2)}×`);
      }
      break;

    // Reset velocidad con Alt+1
    case "1":
      if (e.altKey) {
        v.speed = 1;
        showOverlay(speedOverlay, `1.00×`);
      }
      break;
  }
}

function bindHotkeys() {
  document.addEventListener("keydown", onKeydown, {
    capture: true,
    passive: false,
  });
}
function unbindHotkeys() {
  document.removeEventListener("keydown", onKeydown, { capture: true });
}

/* ========== Carga principal ========== */
async function loadContenido() {
  loading.value = true;
  try {
    const { idcurso, idunidad, idclase, idcontenido } = route.params;

    // Contenido actual
    const { data } = await api.get(
      `/cursos/${idcurso}/unidades/${idunidad}/clases/${idclase}/contenidos/${idcontenido}`
    );
    contenido.value = data;

    if (contenido.value?.tipo === "video") {
      await cargarProgreso();
      await mountPlyr();
    } else {
      destroyPlyr();
    }

    // Clases de la unidad
    const { data: dataClases } = await api.get(
      `/cursos/${idcurso}/unidades/${idunidad}/clases`
    );
    clases.value = dataClases;

    // Listado plano de videos (toda la unidad)
    const grupos = await Promise.all(
      clases.value.map(async (cl) => {
        const { data: conts } = await api.get(
          `/cursos/${idcurso}/unidades/${idunidad}/clases/${cl.idclase}/contenidos`
        );
        return conts
          .filter((x) => x.tipo === "video")
          .sort((a, b) => (a.orden || 0) - (b.orden || 0))
          .map((x) => ({ ...x, claseTitulo: cl.titulo, idclase: cl.idclase }));
      })
    );
    videosFlat.value = grupos.flat();

    // Contenidos no-video de la clase actual
    const { data: contActual } = await api.get(
      `/cursos/${idcurso}/unidades/${idunidad}/clases/${idclase}/contenidos`
    );
    contenidosNoVideo.value = contActual
      .filter((x) => x.tipo !== "video")
      .sort((a, b) => (a.orden || 0) - (b.orden || 0));

    // Comentarios por clase
    await cargarComentarios();
  } catch (err) {
    console.error("❌ Error cargando contenido:", err);
  } finally {
    loading.value = false;
  }
}

/* ========== Progreso (API) ========== */
async function cargarProgreso() {
  try {
    const { idcontenido } = route.params;
    const res = await api.get(`/vistas/${idcontenido}`);
    if (res.data?.ok && res.data.data) {
      progreso.value = res.data.data;
    } else {
      progreso.value = { ultimo_segundo: 0, porcentaje: 0, completado: false };
    }
  } catch {
    progreso.value = { ultimo_segundo: 0, porcentaje: 0, completado: false };
  }
}

async function guardarProgreso(force = false) {
  const v = plyr.value;
  if (!v || !contenido.value) return;
  const current = Math.floor(v.currentTime || 0);
  const duration = Math.floor(v.duration || 0);
  if (!duration || (current < 1 && !force)) return;

  try {
    await api.patch("/vistas", {
      idclase: route.params.idclase,
      idcontenido: contenido.value.idcontenido,
      segundo_actual: current,
      duracion: duration,
    });
  } catch {}
}

/* ========== Comentarios ========== */
async function cargarComentarios() {
  const { idclase } = route.params;
  try {
    const res = await api.get(`/clases/${idclase}/comentarios`);
    comentarios.value = res.data?.data || [];
  } catch {
    comentarios.value = [];
  }
}
function puedeEliminar(c) {
  return (
    c.idusuario === auth.user?.idusuario || auth.isProfessor || auth.isAdmin
  );
}
async function publicarComentario() {
  if (sendingComment.value) return;
  const texto = (nuevoComentario.value || "").trim();
  if (!texto) {
    $q.notify({ type: "warning", message: "Escribe un comentario primero." });
    return;
  }
  sendingComment.value = true;
  try {
    const { idclase } = route.params;
    await api.post(`/clases/${idclase}/comentarios`, {
      contenido: texto,
      idpadre: comentarioPadre.value
        ? comentarioPadre.value.idcomentario
        : null,
    });
    nuevoComentario.value = "";
    comentarioPadre.value = null;
    await cargarComentarios();
    $q.notify({ type: "positive", message: "Comentario publicado" });
  } catch (err) {
    console.error("❌ Error publicando comentario:", err);
    $q.notify({
      type: "negative",
      message: "No se pudo publicar el comentario",
    });
  } finally {
    sendingComment.value = false;
  }
}
async function eliminarComentario(c) {
  try {
    await api.delete(`/clases/comentarios/${c.idcomentario}`);
    $q.notify({ type: "positive", message: "Comentario eliminado" });
    await cargarComentarios();
  } catch {
    $q.notify({ type: "negative", message: "No se pudo eliminar" });
  }
}
function abrirRespuesta(c) {
  comentarioPadre.value = c;
  nuevoComentario.value = `@${c.autor_nombre} `;
  nextTick(() => {
    commentInputRef.value?.focus?.();
    const el = commentInputRef.value?.$el?.querySelector("textarea, input");
    if (el?.setSelectionRange) {
      const len = nuevoComentario.value.length;
      el.setSelectionRange(len, len);
    }
  });
}

/* ========== Navegación + watchers ========== */
function goToContenido(item) {
  const { idcurso, idunidad } = route.params;
  destroyPlyr();
  progreso.value = { ultimo_segundo: 0, porcentaje: 0, completado: false };

  const targetClaseId = item.idclase ?? route.params.idclase;
  router.push({
    name: "contenido-detalle",
    params: {
      idcurso,
      idunidad,
      idclase: targetClaseId,
      idcontenido: item.idcontenido,
    },
  });
}

watch(
  () => [route.params.idclase, route.params.idcontenido],
  async ([nClase, nContenido], [aClase, aContenido]) => {
    if (nClase !== aClase || nContenido !== aContenido) {
      await loadContenido();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }
);

// Remonta Plyr cuando cambia la URL del video
watch(
  () => contenido.value?.archivo,
  async (n, o) => {
    if (!n || n === o) return;
    await nextTick();
    await mountPlyr();
  }
);

onMounted(async () => {
  await loadContenido();
  bindHotkeys();
});
onBeforeUnmount(() => {
  unbindHotkeys();
  destroyPlyr();
});
</script>

<style scoped>
.video-container .player {
  width: 100%;
  border-radius: 12px;
}

/* Evita outlines feos al enfocar el video con tabindex */
.focusable-video:focus {
  outline: none;
}

/* overlay tipo YouTube */
.yt-overlay {
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
  padding: 8px 14px;
  border-radius: 12px;
  font-weight: 700;
  letter-spacing: 0.3px;
  user-select: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Encabezado */
.encabezado .label {
  font-weight: 700;
  margin-right: 0.35rem;
  color: #607d8b;
}
.encabezado .clase-line {
  font-size: 1.35rem;
  line-height: 1.2;
  margin-bottom: 0.15rem;
}
.encabezado .clase-titulo {
  color: var(--q-primary);
  font-weight: 800;
  letter-spacing: 0.2px;
}
.encabezado .video-line {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.encabezado .video-titulo {
  color: var(--q-positive);
  font-weight: 600;
}
.encabezado .sep {
  color: #9e9e9e;
}
.encabezado .dur-icon,
.encabezado .video-duracion {
  color: #2e7d32cc;
}
.encabezado .video-duracion {
  font-weight: 600;
}

/* 💬 Comentarios */
.comment-header {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.author-name {
  font-weight: 700;
  color: #212121 !important;
}
.comment-date {
  font-size: 0.85rem;
  color: #757575;
}
.comment-text {
  color: #212121;
}

/* Avatar */
.q-avatar img {
  object-fit: cover;
  filter: none;
}
</style>
