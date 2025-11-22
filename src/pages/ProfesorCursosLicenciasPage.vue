<template>
  <q-page class="q-pa-md bg-grey-2">
    <!-- 🧑‍🏫 Encabezado -->
    <div class="titulo-licencia q-mb-md">Mis Cursos y Estado de Licencia</div>

    <!-- 🔘 Filtros -->
    <div class="row justify-center q-mb-lg">
      <q-btn-toggle
        v-model="estadoFiltro"
        toggle-color="primary"
        unelevated
        glossy
        spread
        rounded
        :options="[
          { label: 'Todos', value: 'todos' },
          { label: 'Borrador', value: 'borrador' },
          { label: 'En revisión', value: 'en_revision' },
          { label: 'Oferta Enviada', value: 'oferta_enviada' },
          { label: 'Publicado', value: 'publicado' },
          { label: 'Rechazado', value: 'rechazado' },
        ]"
      />
    </div>

    <!-- Loader -->
    <q-inner-loading :showing="loading">
      <q-spinner size="40px" color="primary" />
    </q-inner-loading>

    <!-- Sin cursos -->
    <div
      v-if="!loading && cursosFiltrados.length === 0"
      class="text-grey text-center q-mt-xl"
    >
      No se encontraron cursos para este estado.
    </div>

    <!-- 🔹 Lista de cursos -->
    <div class="row q-col-gutter-md">
      <div
        v-for="curso in cursosFiltrados"
        :key="curso.idcurso"
        class="col-12 col-md-6 col-lg-4"
      >
        <q-card bordered class="shadow-3 bg-white hover-card">
          <!-- Imagen -->
          <div class="curso-img-container">
            <img :src="fixUrlCurso(curso)" class="curso-img" />
            <div class="curso-overlay">
              <transition name="fade">
                <q-badge
                  :color="getColorEstado(curso.estado)"
                  class="estado-badge text-white text-bold"
                >
                  {{ getLabelEstado(curso.estado) }}
                </q-badge>
              </transition>
            </div>
          </div>

          <!-- Info -->
          <q-card-section>
            <!-- Título del curso -->
            <div class="curso-titulo-card q-mb-xs">
              <q-icon
                name="menu_book"
                size="20px"
                class="q-mr-sm text-primary"
              />
              <span>Curso: {{ curso.nombre }}</span>
            </div>

            <!-- Categoría -->
            <div class="detalle-linea">
              <q-icon
                name="category"
                size="18px"
                class="q-mr-xs text-primary"
              />
              <span class="detalle-label">Categoría:</span>
              <span class="detalle-value">
                {{ curso.categoria?.nombre || "Sin categoría" }}
              </span>
            </div>

            <!-- Clases -->
            <div class="detalle-linea">
              <q-icon
                name="play_lesson"
                size="18px"
                class="q-mr-xs text-primary"
              />
              <span class="detalle-label">Clases:</span>
              <span class="detalle-value">
                {{ curso.num_clases || 0 }}
              </span>
            </div>

            <!-- Duración (si existe) -->
            <div
              class="detalle-linea"
              v-if="curso.duracion_total || curso.duracion_estimada"
            >
              <q-icon
                name="schedule"
                size="18px"
                class="q-mr-xs text-primary"
              />
              <span class="detalle-label">Duración:</span>
              <span class="detalle-value">
                {{
                  curso.duracion_total
                    ? formatearDuracion(curso.duracion_total)
                    : formatearDuracion((curso.duracion_estimada || 0) * 60)
                }}
              </span>
            </div>
          </q-card-section>

          <!-- Acciones -->
          <q-separator />
          <q-card-actions align="right" class="q-gutter-sm">
            <q-btn
              color="teal"
              icon="visibility"
              label="Ver curso"
              dense
              @click="verCurso(curso)"
            />

            <!-- 🟡 Borrador -->
            <template v-if="curso.estado === 'borrador'">
              <q-btn
                color="primary"
                icon="edit"
                label="Editar"
                dense
                @click="editarCurso(curso)"
              />
              <q-btn
                color="positive"
                icon="send"
                label="Enviar a revisión"
                dense
                @click="enviarRevision(curso)"
              />
            </template>

            <!-- 🔵 En revisión -->
            <template v-else-if="curso.estado === 'en_revision'">
              <q-btn
                color="blue"
                icon="hourglass_top"
                label="En revisión"
                flat
                disable
              />
            </template>

            <!-- 🟠 Oferta Enviada -->
            <template v-else-if="curso.estado === 'oferta_enviada'">
              <q-btn
                color="orange"
                icon="visibility"
                label="Ver oferta"
                dense
                @click="verOferta(curso)"
              />
            </template>

            <!-- 🟢 Publicado -->
            <template v-else-if="curso.estado === 'publicado'">
              <q-btn
                color="secondary"
                icon="school"
                label="Publicado"
                flat
                disable
              />
            </template>

            <!-- 🔴 Rechazado -->
            <template v-else-if="curso.estado === 'rechazado'">
              <q-btn
                color="amber"
                icon="send"
                label="Volver a enviar"
                dense
                @click="volverAEnviar(curso)"
              />
            </template>

            <!-- 💬 Mostrar botón de comentarios si existen observaciones -->
            <q-btn
              v-if="curso.tieneObservaciones"
              color="info"
              icon="comment"
              label="Ver comentarios"
              dense
              @click="verComentarios(curso)"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- 💬 Diálogo observaciones -->
    <q-dialog v-model="dialogObservaciones" persistent>
      <q-card style="min-width: 600px; max-width: 750px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Historial de observaciones</div>
        </q-card-section>

        <q-card-section v-if="observaciones.length > 0" class="bg-grey-2">
          <div
            v-for="obs in observaciones"
            :key="obs.idobservacion"
            class="q-pa-md q-mb-md rounded-borders"
            style="background-color: #f0f2f5; border-left: 5px solid #1976d2"
          >
            <div class="row items-center justify-between q-mb-xs">
              <div class="row items-center">
                <q-icon
                  :name="
                    obs.tipo === 'rechazo'
                      ? 'highlight_off'
                      : obs.tipo === 'contraoferta'
                      ? 'swap_horiz'
                      : 'info'
                  "
                  :color="
                    obs.tipo === 'rechazo'
                      ? 'negative'
                      : obs.tipo === 'contraoferta'
                      ? 'amber'
                      : 'primary'
                  "
                  size="18px"
                  class="q-mr-xs"
                />
                <span class="text-weight-bold text-primary">
                  {{
                    obs.usuario
                      ? `${obs.usuario.nombres || ""} ${
                          obs.usuario.apellidos || ""
                        }`.trim()
                      : obs.tipo === "contraoferta"
                      ? "Profesor"
                      : "Administrador"
                  }}
                </span>
              </div>
              <div class="text-grey text-caption flex items-center">
                <q-icon name="event" size="16px" class="q-mr-xs" />
                {{ obs.created_at ? formatDate(obs.created_at) : "Sin fecha" }}
              </div>
            </div>

            <q-separator />

            <div class="q-mt-sm text-body1">
              <q-icon name="chat" size="16px" class="q-mr-xs text-primary" />
              {{ obs.comentario }}
            </div>

            <div class="q-mt-sm">
              <q-badge
                :color="
                  obs.tipo === 'rechazo'
                    ? 'negative'
                    : obs.tipo === 'contraoferta'
                    ? 'amber'
                    : 'primary'
                "
                class="text-white"
              >
                {{
                  obs.tipo === "rechazo"
                    ? "Rechazo"
                    : obs.tipo === "contraoferta"
                    ? "Contraoferta"
                    : obs.tipo === "revision"
                    ? "Revisión"
                    : "Sistema"
                }}
              </q-badge>
            </div>
          </div>
        </q-card-section>

        <q-card-section v-else>
          <div class="text-grey text-center q-mt-md">
            No hay observaciones registradas.
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 💼 Diálogo oferta -->
    <q-dialog v-model="dialogOferta" persistent>
      <q-card style="min-width: 550px; max-width: 700px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Oferta de Licencia</div>
        </q-card-section>

        <q-card-section v-if="oferta" class="text-body1">
          <div class="text-subtitle2 q-mb-sm">
            <b>Curso:</b> {{ cursoSeleccionado?.nombre }}
          </div>
          <div><b>Duración:</b> {{ oferta.duracion_meses }} meses</div>
          <div><b>Precio por clase:</b> {{ oferta.tarifa_por_clase }} Bs</div>
          <div><b>Precio por mes:</b> {{ oferta.tarifa_por_mes }} Bs</div>
          <div class="q-mt-sm text-bold text-primary text-h6">
            💰 Total: {{ oferta.costo }} Bs
          </div>
        </q-card-section>

        <q-separator />
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cerrar" v-close-popup />
          <q-btn
            color="negative"
            label="Rechazar con comentario"
            icon="close"
            outline
            @click="abrirDialogoContraoferta"
          />
          <q-btn
            color="positive"
            label="Aceptar Oferta"
            icon="check_circle"
            @click="aceptarOferta"
            :loading="loading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 💬 Diálogo contraoferta -->
    <q-dialog v-model="dialogContraoferta" persistent>
      <q-card style="min-width: 450px; max-width: 600px">
        <q-card-section class="bg-negative text-white">
          <div class="text-h6">Enviar contraoferta o comentario</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="comentarioContraoferta"
            type="textarea"
            outlined
            autogrow
            label="Escribe tus observaciones o nueva propuesta"
            counter
            maxlength="500"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            color="negative"
            label="Enviar contraoferta"
            :disable="!comentarioContraoferta.trim()"
            @click="enviarContraoferta"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { api } from "boot/axios";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";

const $q = useQuasar();
const router = useRouter();

const cursos = ref([]);
const loading = ref(false);
const estadoFiltro = ref("todos");

// 💼 Oferta y observaciones
const dialogOferta = ref(false);
const oferta = ref(null);
const cursoSeleccionado = ref(null);
const dialogObservaciones = ref(false);
const observaciones = ref([]);

// 💬 Contraoferta
const dialogContraoferta = ref(false);
const comentarioContraoferta = ref("");

// 📂 Cargar cursos
async function loadCursos() {
  loading.value = true;
  try {
    const { data } = await api.get("/profesor/cursos");
    cursos.value = (data.cursos || data.data || []).map((c) => ({
      ...c,
      tieneObservaciones: c.num_observaciones > 0 || false,
    }));
  } catch {
    $q.notify({ type: "negative", message: "Error al cargar cursos" });
  } finally {
    loading.value = false;
  }
}

// 🔍 Filtrado reactivo
const cursosFiltrados = computed(() =>
  estadoFiltro.value === "todos"
    ? cursos.value
    : cursos.value.filter((c) => c.estado === estadoFiltro.value)
);

// 🎨 Helpers
function getColorEstado(estado) {
  return (
    {
      borrador: "orange-6",
      en_revision: "blue-6",
      oferta_enviada: "amber-7",
      publicado: "green-6",
      rechazado: "negative",
    }[estado] || "grey"
  );
}
function getLabelEstado(estado) {
  return (
    {
      borrador: "Borrador",
      en_revision: "En Revisión",
      oferta_enviada: "Oferta Enviada",
      publicado: "Publicado",
      rechazado: "Rechazado",
    }[estado] || estado
  );
}
function fixUrlCurso(curso) {
  if (curso.imagen_url) return curso.imagen_url;
  if (curso.imagen) return `http://127.0.0.1:8000/storage/${curso.imagen}`;
  return "/images/curso-placeholder.png";
}
function formatDate(dateStr) {
  if (!dateStr) return "Sin fecha";
  const fecha = new Date(dateStr);
  if (isNaN(fecha.getTime())) return "Sin fecha";
  return fecha.toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ⏱ Formatear duración (segundos → h:mm:ss / m:ss / Xs)
function formatearDuracion(segundos) {
  if (!segundos || segundos <= 0) return "0s";

  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  const s = segundos % 60;

  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  if (m > 0) {
    return `${m}:${String(s).padStart(2, "0")}`;
  }
  return `${s}s`;
}

// 🧭 Acciones
function verCurso(curso) {
  router.push({
    name: "profesor-curso-detalle",
    params: { idcurso: curso.idcurso },
  });
}
function editarCurso(curso) {
  router.push({
    name: "cursos-edit",
    params: { idcurso: curso.idcurso },
  });
}

async function enviarRevision(curso) {
  try {
    await api.patch(`/profesor/cursos/${curso.idcurso}/enviar-revision`);
    $q.notify({ type: "positive", message: "Curso enviado a revisión" });
    loadCursos();
  } catch {
    $q.notify({ type: "negative", message: "Error al enviar revisión" });
  }
}

async function volverAEnviar(curso) {
  try {
    await api.patch(`/profesor/cursos/${curso.idcurso}/volver-enviar`);
    $q.notify({ type: "positive", message: "Curso reenviado a revisión" });
    loadCursos();
  } catch {
    $q.notify({ type: "negative", message: "Error al reenviar curso" });
  }
}

// 💬 Ver comentarios
async function verComentarios(curso) {
  try {
    const { data } = await api.get(`/observaciones/curso/${curso.idcurso}`);
    observaciones.value = data?.data || [];
    dialogObservaciones.value = true;
  } catch {
    $q.notify({ type: "negative", message: "Error al cargar observaciones" });
  }
}

// 💼 Ver oferta
async function verOferta(curso) {
  cursoSeleccionado.value = curso;
  try {
    const { data } = await api.get(`/profesor/cursos/${curso.idcurso}/oferta`);
    oferta.value = data.oferta || null;
    dialogOferta.value = true;
  } catch {
    $q.notify({ type: "warning", message: "No se encontró oferta" });
  }
}

// 🔹 Contraoferta
function abrirDialogoContraoferta() {
  comentarioContraoferta.value = "";
  dialogOferta.value = false;
  dialogContraoferta.value = true;
}

async function enviarContraoferta() {
  try {
    const curso = cursoSeleccionado.value;
    await api.post(`/profesor/cursos/${curso.idcurso}/rechazar-oferta`, {
      comentario: comentarioContraoferta.value,
    });
    dialogContraoferta.value = false;
    $q.notify({
      type: "negative",
      message: "Contraoferta enviada al administrador",
    });
    loadCursos();
  } catch {
    $q.notify({
      type: "negative",
      message: "Error al enviar la contraoferta",
    });
  }
}

// 🔹 Aceptar oferta (genera licencia + pago pendiente)
async function aceptarOferta() {
  $q.dialog({
    title: "Confirmar aceptación",
    message:
      "¿Deseas aceptar esta oferta? Tu curso será publicado y se generará un pago pendiente.",
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      loading.value = true;
      const curso = cursoSeleccionado.value;
      await api.patch(`/profesor/cursos/${curso.idcurso}/aceptar-oferta`);
      dialogOferta.value = false;
      $q.notify({
        type: "positive",
        message:
          "✅ Oferta aceptada. Se generó la licencia y tu pago pendiente.",
      });
      loadCursos();
    } catch {
      $q.notify({
        type: "negative",
        message: "❌ Error al aceptar la oferta. Intenta nuevamente.",
      });
    } finally {
      loading.value = false;
    }
  });
}

onMounted(loadCursos);
</script>

<style scoped>
.titulo-licencia {
  font-size: 2rem;
  font-weight: 700;
  color: #1565c0;
  text-align: center;
}

/* Imagen de curso */
.curso-img-container {
  position: relative;
  width: 100%;
  height: 150px;
  overflow: hidden;
  border-bottom: 1px solid #ddd;
}
.curso-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.curso-overlay {
  position: absolute;
  top: 10px;
  left: 10px;
}
.estado-badge {
  font-size: 0.8rem;
  padding: 4px 8px;
}

/* Card hover */
.hover-card {
  transition: transform 0.2s, box-shadow 0.2s;
}
.hover-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.12);
}

/* Info del curso */
.curso-titulo-card {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1a237e;
  display: flex;
  align-items: center;
}
.curso-titulo-card span {
  line-height: 1.2;
}

/* Detalles */
.detalle-linea {
  display: flex;
  align-items: center;
  margin-top: 4px;
}
.detalle-label {
  font-weight: 600;
  font-size: 0.98rem;
  color: #37474f;
  margin-right: 4px;
}
.detalle-value {
  font-size: 0.98rem;
  color: #455a64;
}

/* Observaciones */
.rounded-borders {
  border-radius: 12px;
}

/* Fade badge */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
