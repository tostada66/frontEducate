<template>
  <q-page class="q-pa-md bg-grey-2">
    <!-- 🔹 Encabezado -->
    <div class="text-h5 text-primary text-weight-bold q-mb-md">
      Gestión de Cursos Pendientes, Ofertas y Rechazados
    </div>

    <!-- 🔘 Filtros -->
    <div class="row q-col-gutter-md q-mb-lg items-center justify-between">
      <div class="col-12 col-md-6">
        <q-btn-toggle
          v-model="estadoFiltro"
          toggle-color="primary"
          unelevated
          glossy
          spread
          rounded
          :options="[
            { label: 'Todos', value: 'todos' },
            { label: 'En Revisión', value: 'en_revision' },
            { label: 'Oferta Enviada', value: 'oferta_enviada' },
            { label: 'Rechazados', value: 'rechazado' },
          ]"
        />
      </div>

      <div class="col-12 col-md-4">
        <q-input
          v-model="busquedaProfesor"
          placeholder="Buscar por profesor..."
          dense
          outlined
          debounce="300"
          clearable
        >
          <template #prepend><q-icon name="search" /></template>
        </q-input>
      </div>
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
      No hay cursos que coincidan con los filtros.
    </div>

    <!-- 🔹 Grid de cursos -->
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
              <q-badge
                :color="getColorEstado(curso.estado)"
                class="text-white text-bold"
              >
                {{ getLabelEstado(curso.estado) }}
              </q-badge>
            </div>
          </div>

          <!-- Info -->
          <q-card-section>
            <div class="text-h6 text-primary">{{ curso.nombre }}</div>
            <div class="text-caption text-grey-7 q-mb-xs">
              {{ curso.categoria?.nombre || "Sin categoría" }}
            </div>
            <div class="text-caption text-grey">
              Profesor: {{ curso.profesor?.usuario?.nombres || "Desconocido" }}
            </div>
          </q-card-section>

          <q-separator />

          <!-- Acciones -->
          <q-card-actions align="right" class="q-gutter-sm">
            <!-- 👁️ Ver curso -->
            <q-btn
              color="teal"
              icon="visibility"
              label="Ver curso"
              dense
              @click="verDetalle(curso)"
            />

            <!-- 💬 Ver comentarios -->
            <q-btn
              v-if="Number(curso.num_observaciones) > 0"
              color="info"
              icon="comment"
              label="Ver comentarios"
              dense
              glossy
              @click="cargarObservaciones(curso.idcurso)"
            />

            <!-- 🟢 Estados -->
            <q-btn
              v-if="curso.estado === 'en_revision'"
              color="positive"
              icon="local_offer"
              label="Enviar Oferta"
              dense
              @click="abrirDialogo(curso)"
            />

            <q-btn
              v-else-if="curso.estado === 'oferta_enviada'"
              color="amber"
              icon="visibility"
              label="Ver Oferta"
              dense
              @click="verOferta(curso)"
            />

            <!-- ❌ Rechazo -->
            <q-btn
              v-if="curso.estado !== 'rechazado'"
              color="negative"
              icon="close"
              label="Rechazar"
              dense
              @click="abrirDialogoRechazo(curso)"
            />

            <q-btn
              v-else
              color="negative"
              icon="highlight_off"
              label="Rechazado"
              dense
              flat
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- 💬 Diálogo de observaciones -->
    <q-dialog v-model="dialogObservaciones">
      <q-card style="min-width: 500px; max-width: 600px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Historial de Observaciones</div>
        </q-card-section>

        <q-card-section v-if="observaciones.length">
          <div
            v-for="obs in observaciones"
            :key="obs.idobservacion"
            class="q-mb-md"
          >
            <q-item>
              <q-item-section avatar>
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
                      : 'blue'
                  "
                />
              </q-item-section>
              <q-item-section>
                <div class="text-body2 text-weight-medium">
                  {{ obs.comentario }}
                </div>
                <div class="text-caption text-grey-7">
                  {{ formatDate(obs.created_at) }} —
                  {{
                    obs.tipo === "rechazo"
                      ? "Rechazo"
                      : obs.tipo === "contraoferta"
                      ? "Contraoferta"
                      : "Observación"
                  }}
                </div>
              </q-item-section>
            </q-item>
            <q-separator />
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

    <!-- ❌ Diálogo de rechazo -->
    <q-dialog v-model="dialogRechazo">
      <q-card style="min-width: 450px">
        <q-card-section class="bg-negative text-white">
          <div class="text-h6">Rechazar Curso</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="comentarioRechazo"
            type="textarea"
            label="Motivo del rechazo o sugerencia"
            autogrow
            outlined
            dense
          />
        </q-card-section>

        <q-separator />
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            color="negative"
            label="Confirmar Rechazo"
            :disable="!comentarioRechazo"
            @click="rechazarCursoConfirmado"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 💼 Diálogo de oferta -->
    <q-dialog v-model="dialogOferta">
      <q-card style="min-width: 500px">
        <q-card-section
          :class="
            cursoSeleccionado?.estado === 'oferta_enviada'
              ? 'bg-amber text-white'
              : 'bg-primary text-white'
          "
        >
          <div class="text-h6">
            {{
              cursoSeleccionado?.estado === "oferta_enviada"
                ? "Oferta Enviada al Profesor"
                : "Configurar Nueva Oferta"
            }}
          </div>
        </q-card-section>

        <!-- Mostrar oferta enviada -->
        <q-card-section
          v-if="cursoSeleccionado?.estado === 'oferta_enviada' && oferta"
        >
          <div class="text-subtitle2 q-mb-sm">
            Curso: {{ oferta.curso?.nombre }}
          </div>
          <div>Duración: {{ oferta.duracion_meses }} meses</div>
          <div>Precio por clase: {{ oferta.tarifa_por_clase }} Bs</div>
          <div>Precio por mes: {{ oferta.tarifa_por_mes }} Bs</div>
          <div class="q-mt-sm text-bold">
            💰 Total: {{ oferta.costo_total }} Bs
          </div>
        </q-card-section>

        <!-- Nueva oferta -->
        <q-card-section v-else>
          <q-form class="q-gutter-md">
            <q-input
              v-model.number="ofertaData.num_clases"
              label="Número de clases"
              readonly
              outlined
            />
            <q-input
              v-model.number="ofertaData.tarifa_por_clase"
              label="Precio por clase (Bs)"
              outlined
              type="number"
            />
            <q-input
              v-model.number="ofertaData.tarifa_por_mes"
              label="Precio por mes (Bs)"
              outlined
              type="number"
            />
            <q-input
              v-model.number="ofertaData.duracion_meses"
              label="Duración (meses)"
              outlined
              type="number"
            />
            <q-input
              :model-value="costoTotal"
              label="Costo total (Bs)"
              outlined
              readonly
            />
          </q-form>
        </q-card-section>

        <q-separator />
        <q-card-actions align="right">
          <q-btn flat label="Cerrar" v-close-popup />
          <q-btn
            v-if="cursoSeleccionado?.estado === 'en_revision'"
            color="positive"
            label="Enviar Oferta al Profesor"
            @click="guardarOferta"
            :loading="loading"
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
const busquedaProfesor = ref("");

// Diálogos y datos
const dialogOferta = ref(false);
const dialogObservaciones = ref(false);
const dialogRechazo = ref(false);
const cursoSeleccionado = ref(null);
const oferta = ref(null);
const observaciones = ref([]);
const comentarioRechazo = ref("");

// Datos de oferta
const ofertaData = ref({
  num_clases: 0,
  tarifa_por_clase: 30,
  tarifa_por_mes: 10,
  duracion_meses: 1,
});

// 💰 Total dinámico
const costoTotal = computed(
  () =>
    ofertaData.value.num_clases * ofertaData.value.tarifa_por_clase +
    ofertaData.value.duracion_meses * ofertaData.value.tarifa_por_mes
);

// 📦 Cargar cursos
async function loadCursos() {
  loading.value = true;
  try {
    const { data } = await api.get("/admin/cursos/pendientes");
    cursos.value = data.cursos || [];
  } catch {
    $q.notify({ type: "negative", message: "Error cargando cursos" });
  } finally {
    loading.value = false;
  }
}

// 🔹 Abrir diálogo de oferta (nueva)
async function abrirDialogo(curso) {
  cursoSeleccionado.value = curso;
  try {
    const { data } = await api.get(
      `/admin/cursos/${curso.idcurso}/aprobar-preview`
    );
    ofertaData.value.num_clases = data.num_clases ?? 0;
  } catch {
    ofertaData.value.num_clases = 0;
    $q.notify({
      type: "warning",
      message: "No se pudo obtener el número de clases",
    });
  }
  dialogOferta.value = true;
}

// 🔹 Ver oferta ya enviada
async function verOferta(curso) {
  cursoSeleccionado.value = curso;
  oferta.value = null;
  loading.value = true;
  try {
    const { data } = await api.get(`/profesor/cursos/${curso.idcurso}/oferta`);
    oferta.value = data.oferta;
    dialogOferta.value = true;
  } catch {
    $q.notify({
      type: "negative",
      message: "No se pudo cargar la oferta de este curso",
    });
  } finally {
    loading.value = false;
  }
}

// 🔹 Guardar oferta
async function guardarOferta() {
  if (!cursoSeleccionado.value) return;
  loading.value = true;
  try {
    const payload = {
      tarifa_por_clase: ofertaData.value.tarifa_por_clase,
      tarifa_por_mes: ofertaData.value.tarifa_por_mes,
      duracion_meses: ofertaData.value.duracion_meses,
    };
    await api.patch(
      `/admin/cursos/${cursoSeleccionado.value.idcurso}/aprobar`,
      payload
    );
    $q.notify({ type: "positive", message: "Oferta enviada correctamente" });
    dialogOferta.value = false;
    loadCursos();
  } catch {
    $q.notify({ type: "negative", message: "Error al enviar oferta" });
  } finally {
    loading.value = false;
  }
}

// 🔹 Rechazo
function abrirDialogoRechazo(curso) {
  cursoSeleccionado.value = curso;
  comentarioRechazo.value = "";
  dialogRechazo.value = true;
}

async function rechazarCursoConfirmado() {
  if (!cursoSeleccionado.value) return;
  loading.value = true;
  try {
    await api.patch(
      `/admin/cursos/${cursoSeleccionado.value.idcurso}/rechazar`,
      {
        comentario: comentarioRechazo.value,
      }
    );
    $q.notify({ type: "negative", message: "Curso rechazado correctamente" });
    dialogRechazo.value = false;
    loadCursos();
  } catch {
    $q.notify({ type: "negative", message: "Error al rechazar curso" });
  } finally {
    loading.value = false;
  }
}

// 🔹 Observaciones
async function cargarObservaciones(idcurso) {
  try {
    const { data } = await api.get(`/observaciones/curso/${idcurso}`);
    observaciones.value = data.data;
    dialogObservaciones.value = true;
  } catch {
    $q.notify({ type: "negative", message: "Error cargando observaciones" });
  }
}

// 🔹 Ver detalle
function verDetalle(curso) {
  router.push({
    name: "admin-curso-detalle",
    params: { idcurso: curso.idcurso },
  });
}

// 🎨 Helpers
function fixUrlCurso(curso) {
  if (curso.imagen_url) return curso.imagen_url;
  if (curso.imagen) return `http://127.0.0.1:8000/storage/${curso.imagen}`;
  return "/images/curso-placeholder.png";
}
function getColorEstado(estado) {
  return (
    {
      en_revision: "blue-6",
      oferta_enviada: "amber-7",
      rechazado: "red-6",
    }[estado] || "grey"
  );
}
function getLabelEstado(estado) {
  return (
    {
      en_revision: "En Revisión",
      oferta_enviada: "Oferta Enviada",
      rechazado: "Rechazado",
    }[estado] || estado
  );
}
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString("es-BO", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

const cursosFiltrados = computed(() =>
  cursos.value.filter((c) => {
    const matchEstado =
      estadoFiltro.value === "todos" || c.estado === estadoFiltro.value;
    const matchProf = c.profesor?.usuario?.nombres
      ?.toLowerCase()
      .includes(busquedaProfesor.value.toLowerCase());
    return matchEstado && (busquedaProfesor.value === "" || matchProf);
  })
);

onMounted(loadCursos);
</script>

<style scoped>
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
.hover-card {
  transition: transform 0.2s, box-shadow 0.2s;
}
.hover-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.12);
}
</style>
