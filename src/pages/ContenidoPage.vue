<!-- src/pages/ContenidoPage.vue -->
<template>
  <q-page class="q-pa-md bg-grey-2">
    <!-- 🔹 Banners de rol -->
    <div
      v-if="auth.isProfessor"
      class="bg-primary text-white text-center q-pa-sm q-mb-md"
    >
      <q-icon name="visibility" class="q-mr-xs" /> Vista previa del contenido
      (Profesor)
    </div>
    <div
      v-else-if="auth.isAdmin"
      class="bg-positive text-white text-center q-pa-sm q-mb-md"
    >
      <q-icon name="admin_panel_settings" class="q-mr-xs" /> Vista del contenido
      (Administrador)
    </div>

    <!-- Loader -->
    <div v-if="loading" class="row justify-center q-mt-lg">
      <q-spinner-dots color="primary" size="40px" />
    </div>

    <!-- 🔹 Contenido -->
    <div v-else class="row q-col-gutter-md q-mt-md">
      <!-- 📺 Columna izquierda -->
      <div class="col-12 col-md-8">
        <!-- Encabezado -->
        <div class="encabezado q-mb-sm q-pt-sm">
          <div class="clase-line">
            <span class="label">Clase:</span>
            <span class="clase-titulo">
              {{ currentClase?.titulo || "Clase" }}
            </span>
          </div>
          <div class="video-line">
            <span class="label">Video:</span>
            <span class="video-titulo">
              {{ contenido?.titulo || "Contenido" }}
            </span>
            <span class="sep">·</span>
            <q-icon name="schedule" size="18px" class="dur-icon" />
            <span class="video-duracion">
              {{ formatDuration(contenido?.duracion) }}
            </span>
          </div>
        </div>

        <div class="text-grey-7 q-mb-lg">
          {{ contenido?.descripcion }}
        </div>

        <!-- 🎥 Reproductor (componente) -->
        <div v-if="contenido?.tipo === 'video'" class="q-mb-lg">
          <!-- ⛔ UI de progreso removida (se mantiene interno) -->
          <VideoPlyr
            :src="contenido?.archivo"
            :poster="contenido?.miniatura_publica"
            :mimeType="contenido?.mime_type || 'video/mp4'"
            :startAt="progreso?.ultimo_segundo || 0"
            :baseURL="baseURL"
            :convertStorageToStream="true"
            :debug="false"
            @ready="onPlayerReady"
            @progress="onPlayerProgress"
            @pause="() => guardarProgreso(false)"
            @ended="onPlayerEnded"
            @error="onPlayerError"
          />
        </div>

        <!-- ⚠️ No es video -->
        <div v-else>
          <q-banner rounded class="bg-orange-2 text-orange-9">
            Este contenido no es un video. Usa la pestaña
            <b>Contenidos</b> para abrir imágenes o documentos.
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
                    <span class="author-name">
                      {{ comentario.autor_nombre }}
                    </span>
                    <span class="comment-date">
                      {{ comentario.created_at }}
                    </span>
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
                      <span class="author-name">
                        {{ resp.autor_nombre }}
                      </span>
                      <span class="comment-date">
                        {{ resp.created_at }}
                      </span>
                    </div>
                    <div class="comment-text q-mt-xs">
                      {{ resp.contenido }}
                    </div>
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

        <!-- Lista de VIDEOS -->
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

        <!-- Lista de CONTENIDOS (docs/imágenes) -->
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
                  v-if="isImage(c)"
                  square
                  size="80px"
                  class="relative-position"
                >
                  <img
                    :src="c.miniatura_publica || c.archivo"
                    alt="miniatura"
                    style="
                      width: 100%;
                      height: 100%;
                      object-fit: cover;
                      border-radius: 6px;
                      pointer-events: none;
                    "
                  />
                </q-avatar>
                <q-avatar
                  v-else
                  square
                  size="80px"
                  class="bg-blue text-white flex flex-center"
                >
                  <q-icon :name="getDocIcon(c.archivo)" size="md" />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-grey-9">
                  {{ c.titulo }}
                </q-item-label>
                <q-item-label caption class="text-grey-7">
                  {{ (c.tipo || "documento").toUpperCase() }}
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
import { ref, onMounted, nextTick, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { api } from "boot/axios";
import { useQuasar } from "quasar";
import { useAuthStore } from "src/stores/auth";
import VideoPlyr from "src/components/VideoPlyr.vue";

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const auth = useAuthStore();
const baseURL = window.location.origin;

const COMPLETE_THRESHOLD = 60;

/* ---------- Estado ---------- */
const contenido = ref(null);
const clases = ref([]);
const videosFlat = ref([]);
const contenidosNoVideo = ref([]);
const loading = ref(false);
const currentTab = ref("videos");

/* Comentarios */
const comentarios = ref([]);
const nuevoComentario = ref("");
const comentarioPadre = ref(null);
const sendingComment = ref(false);
const commentInputRef = ref(null);

/* Progreso local (interno) */
const progreso = ref({
  ultimo_segundo: 0,
  porcentaje: 0,
  completado: false,
});

/* Utils */
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

  // ⏱️ Menos de 1 minuto → "SS s"
  if (s < 60) {
    return `${ss}s`;
  }

  // ⏱️ Menos de 1 hora → "M:SS"
  if (s < 3600) {
    return `${m}:${sss}`;
  }

  // ⏱️ 1 hora o más → "H:MM:SS"
  return `${h}:${mm}:${sss}`;
}

function getDocIcon(url = "") {
  const l = (url || "").toLowerCase();
  if (l.endsWith(".pdf")) return "picture_as_pdf";
  if (l.endsWith(".doc") || l.endsWith(".docx")) return "description";
  if (l.endsWith(".xls") || l.endsWith(".xlsx")) return "grid_on";
  if (l.endsWith(".ppt") || l.endsWith(".pptx")) return "slideshow";
  return "insert_drive_file";
}

function isImage(c) {
  const mt = (c?.mime_type || "").toLowerCase();
  const u = (c?.archivo || "").toLowerCase();
  return mt.startsWith("image/") || /\.(png|jpe?g|gif|webp|bmp|svg)$/.test(u);
}

/* ========== Carga ========== */
async function loadContenido() {
  loading.value = true;
  try {
    const { idcurso, idunidad, idclase, idcontenido } = route.params;

    // Contenido actual
    const { data } = await api.get(
      `/cursos/${idcurso}/unidades/${idunidad}/clases/${idclase}/contenidos/${idcontenido}`
    );
    contenido.value = data;

    // Progreso si es video
    if (contenido.value?.tipo === "video") {
      await cargarProgreso();
    } else {
      progreso.value = {
        ultimo_segundo: 0,
        porcentaje: 0,
        completado: false,
      };
    }

    // Clases de la unidad
    const { data: dataClases } = await api.get(
      `/cursos/${idcurso}/unidades/${idunidad}/clases`
    );
    clases.value = dataClases;

    // VIDEOS de toda la unidad
    const grupos = await Promise.all(
      clases.value.map(async (cl) => {
        const { data: conts } = await api.get(
          `/cursos/${idcurso}/unidades/${idunidad}/clases/${cl.idclase}/contenidos`
        );
        return conts
          .filter((x) => x.tipo === "video")
          .sort((a, b) => (a.orden || 0) - (b.orden || 0))
          .map((x) => ({
            ...x,
            claseTitulo: cl.titulo,
            idclase: cl.idclase,
          }));
      })
    );
    videosFlat.value = grupos.flat();

    // CONTENIDOS no-video de la clase actual
    const { data: contActual } = await api.get(
      `/cursos/${idcurso}/unidades/${idunidad}/clases/${idclase}/contenidos`
    );
    contenidosNoVideo.value = contActual
      .filter((x) => x.tipo !== "video")
      .sort((a, b) => (a.orden || 0) - (b.orden || 0));

    // Comentarios
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
      progreso.value = {
        ultimo_segundo: 0,
        porcentaje: 0,
        completado: false,
      };
    }
  } catch {
    progreso.value = {
      ultimo_segundo: 0,
      porcentaje: 0,
      completado: false,
    };
  }
}

async function guardarProgreso(force = false) {
  if (!contenido.value || contenido.value?.tipo !== "video") return;

  const durationFallback = Math.max(1, Number(contenido.value?.duracion || 0));
  const payload = {
    idclase: route.params.idclase,
    idcontenido: contenido.value.idcontenido,
    segundo_actual: Math.max(
      0,
      Math.min(progreso.value.ultimo_segundo || 0, durationFallback)
    ),
    duracion: durationFallback,
  };

  try {
    await api.patch("/vistas", payload);
  } catch (e) {
    const status = e?.response?.status || "ERR";
    if (status !== 401) {
      $q.notify({
        type: "negative",
        message: "No se pudo guardar el progreso",
      });
    }
  }
}

/* ========== Eventos del reproductor ========== */
function onPlayerReady({ duration }) {
  if (!Number(contenido.value?.duracion) && Number.isFinite(duration)) {
    contenido.value.duracion = Math.round(duration);
  }
}

function onPlayerProgress({ current, percent }) {
  if (Number.isFinite(current)) {
    progreso.value.ultimo_segundo = Math.floor(current);
  }
  if (Number.isFinite(percent)) {
    progreso.value.porcentaje = percent;
  }
}

async function onPlayerEnded() {
  await guardarProgreso(true);
}

function onPlayerError(err) {
  console.error("🎬 Error player:", err);
  $q.notify({ type: "negative", message: "Error al reproducir el video" });
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
    return $q.notify({
      type: "warning",
      message: "Escribe un comentario primero.",
    });
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
  } catch {
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

/* ========== Navegación ========== */
function goToContenido(item) {
  const { idcurso, idunidad } = route.params;

  if (item.tipo === "video") {
    router.push({
      name: "contenido-detalle",
      params: {
        idcurso,
        idunidad,
        idclase: item.idclase ?? route.params.idclase,
        idcontenido: item.idcontenido,
      },
    });
  } else {
    router.push({
      name: "contenido-docs",
      params: {
        idcurso,
        idunidad,
        idclase: item.idclase ?? route.params.idclase,
        idcontenido: item.idcontenido,
      },
    });
  }
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

onMounted(async () => {
  await loadContenido();
});
</script>

<style scoped>
/* Encabezado */
.encabezado {
  margin-bottom: 0.3rem;
  padding-top: 1.2rem; /* 🔥 Nueva separación arriba */
}

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

.q-avatar img {
  object-fit: cover;
  filter: none;
}
</style>
