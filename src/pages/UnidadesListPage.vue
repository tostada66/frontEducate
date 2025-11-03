<template>
  <q-page class="q-pa-md">
    <!-- 🧭 Encabezado -->
    <div class="row items-center q-mb-md">
      <q-btn
        color="secondary"
        label="Volver a cursos"
        icon="arrow_back"
        @click="goCursos"
      />

      <q-space />

      <div class="text-h4 text-weight-bold text-primary text-center">
        Unidades del Curso
      </div>

      <q-space />

      <div class="row items-center q-gutter-sm">
        <!-- ➕ Nueva Unidad (solo si el curso no está publicado) -->
        <q-btn
          v-if="['borrador', 'rechazado'].includes(curso?.estado)"
          color="primary"
          icon="add"
          label="Nueva Unidad"
          @click="goCreateUnidad"
        />
      </div>
    </div>

    <!-- 🔎 Filtro -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-4">
        <q-input
          v-model="filtroTitulo"
          outlined
          dense
          debounce="300"
          placeholder="Buscar por título"
        >
          <template #prepend><q-icon name="search" /></template>
          <template #append>
            <q-icon
              v-if="filtroTitulo"
              name="close"
              class="cursor-pointer"
              @click="filtroTitulo = ''"
            />
          </template>
        </q-input>
      </div>
    </div>

    <!-- 📋 Tabla -->
    <q-table
      :rows="filteredUnidades"
      :columns="columns"
      row-key="idunidad"
      flat
      bordered
      :loading="loading"
      no-data-label="No hay unidades registradas"
    >
      <!-- 📸 Imagen -->
      <template #body-cell-foto="props">
        <q-td class="text-center">
          <q-avatar square size="42px">
            <img
              :src="
                props.row.imagen_url ||
                'https://via.placeholder.com/80x80?text=Unidad'
              "
              alt="unidad"
            />
          </q-avatar>
        </q-td>
      </template>

      <!-- ⏱ Duración -->
      <template #body-cell-duracion="props">
        <q-td class="text-center">
          {{ props.row.duracion_total || 0 }} min
        </q-td>
      </template>

      <!-- 🟢 Estado -->
      <template #body-cell-estado="props">
        <q-td class="text-center">
          <q-badge
            :color="getEstadoColor(props.row.estado || curso?.estado)"
            class="text-white text-weight-bold"
          >
            {{ props.row.estado || curso?.estado || "N/A" }}
          </q-badge>
        </q-td>
      </template>

      <!-- ⚙️ Acciones -->
      <template #body-cell-acciones="props">
        <q-td class="text-center q-gutter-xs">
          <!-- ✏️ Editar unidad (solo editable) -->
          <q-btn
            v-if="isEditable(props.row)"
            dense
            flat
            round
            icon="edit"
            color="primary"
            @click="editUnidad(props.row.idunidad)"
          >
            <q-tooltip>Editar unidad</q-tooltip>
          </q-btn>

          <!-- ❌ Eliminar (solo editable) -->
          <q-btn
            v-if="isEditable(props.row)"
            dense
            flat
            round
            icon="delete"
            color="negative"
            @click="deleteUnidad(props.row)"
          >
            <q-tooltip>Eliminar unidad</q-tooltip>
          </q-btn>

          <!-- 🎓 Clases (siempre visible) -->
          <q-btn
            dense
            flat
            round
            icon="school"
            color="secondary"
            @click="goClases(props.row.idunidad)"
          >
            <q-tooltip>Ver clases</q-tooltip>
          </q-btn>
          <!-- 🎮 Control de juegos (editable → gestionar, publicado → solo ver) -->
          <q-btn
            dense
            flat
            round
            icon="videogame_asset"
            :color="isEditable(props.row) ? 'purple' : 'grey'"
            @click="goJuegosUnidad(props.row)"
          >
            <q-tooltip>
              {{ isEditable(props.row) ? "Gestionar juegos" : "Ver juegos" }}
            </q-tooltip>
          </q-btn>

          <!-- 🧩 Examen (siempre disponible para ver / crear) -->
          <q-btn
            dense
            flat
            round
            icon="quiz"
            :color="props.row.examen ? 'purple' : 'grey'"
            @click="goExamen(props.row)"
          >
            <q-tooltip>
              {{ props.row.examen ? "Ver examen existente" : "Crear examen" }}
            </q-tooltip>
          </q-btn>

          <!-- 👁 Vista previa (siempre visible) -->
          <q-btn
            dense
            flat
            round
            icon="visibility"
            color="teal"
            @click="verComoEstudiante(props.row.idunidad)"
          >
            <q-tooltip>Vista previa</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { api } from "boot/axios";
import { useRoute, useRouter } from "vue-router";
import { useQuasar } from "quasar";

const $q = useQuasar();
const route = useRoute();
const router = useRouter();

const idcurso = route.params.idcurso;
const curso = ref(null);
const unidades = ref([]);
const loading = ref(false);
const filtroTitulo = ref("");

// 📊 Columnas
const columns = [
  { name: "foto", label: "Unidad", align: "center" },
  { name: "titulo", label: "Título", field: "titulo", align: "left" },
  {
    name: "descripcion",
    label: "Descripción",
    field: "descripcion",
    align: "left",
  },
  {
    name: "duracion",
    label: "Duración",
    field: "duracion_total",
    align: "center",
  },
  { name: "estado", label: "Estado", field: "estado", align: "center" },
  { name: "acciones", label: "Acciones", align: "center" },
];

// 🔎 Filtro
const filteredUnidades = computed(() =>
  unidades.value.filter((u) =>
    !filtroTitulo.value
      ? true
      : u.titulo.toLowerCase().includes(filtroTitulo.value.toLowerCase())
  )
);

// 📂 Cargar curso
async function loadCurso() {
  try {
    const { data } = await api.get(`/cursos/${idcurso}`);
    curso.value = data;
  } catch (err) {
    console.error("❌ Error cargando curso:", err);
  }
}

// 📂 Cargar unidades
async function loadUnidades() {
  loading.value = true;
  try {
    const { data } = await api.get(`/cursos/${idcurso}/unidades`);

    for (const unidad of data) {
      try {
        const res = await api.get(`/examenes/by-unidad/${unidad.idunidad}`);
        unidad.examen = res.data || null;
      } catch {
        unidad.examen = null;
      }
    }

    unidades.value = data;
  } catch (err) {
    console.error("❌ Error cargando unidades:", err);
    $q.notify({ type: "negative", message: "Error cargando unidades" });
  } finally {
    loading.value = false;
  }
}

// ✅ Helper: ¿unidad editable?
function isEditable(unidad) {
  const estado = unidad?.estado ?? curso.value?.estado;
  return ["borrador", "rechazado"].includes(estado);
}

// 🧭 Navegación
function goCreateUnidad() {
  router.push({ name: "unidad-create", params: { idcurso } });
}

function editUnidad(idunidad) {
  router.push({ name: "unidad-edit", params: { idcurso, idunidad } });
}

async function deleteUnidad(unidad) {
  $q.dialog({
    title: "Eliminar unidad",
    message: `¿Seguro que deseas eliminar la unidad "${unidad.titulo}"? Esta acción no se puede deshacer.`,
    cancel: true,
    persistent: true,
    ok: { color: "negative", label: "Eliminar" },
    cancelLabel: "Cancelar",
  }).onOk(async () => {
    try {
      await api.delete(`/cursos/${idcurso}/unidades/${unidad.idunidad}`);
      $q.notify({ type: "positive", message: "Unidad eliminada" });
      await loadUnidades();
    } catch (e) {
      console.error(e);
      $q.notify({ type: "negative", message: "No se pudo eliminar la unidad" });
    }
  });
}

function goClases(idunidad) {
  router.push({ name: "clases-list", params: { idcurso, idunidad } });
}

function goCursos() {
  router.push({ name: "cursos-list" });
}

// 🎮 Juegos por unidad (readonly si está publicada)
function goJuegosUnidad(unidad) {
  const estado = unidad?.estado ?? curso.value?.estado;
  const readonly = estado === "publicado";

  router.push({
    name: "juegos-unidad",
    params: { idcurso, idunidad: unidad.idunidad },
    query: readonly ? { readonly: "1" } : {},
  });
}

function verComoEstudiante(idunidad) {
  router.push({
    name: "profesor-unidad-detalle",
    params: { idcurso, idunidad },
  });
}

// 🧩 Crear o ver examen
function goExamen(unidad) {
  if (!unidad.examen || !unidad.examen.idexamen) {
    router.push({
      name: "examen-create",
      params: { idcurso, idunidad: unidad.idunidad },
    });
  } else {
    router.push({
      name: "examen-edit",
      params: {
        idcurso,
        idunidad: unidad.idunidad,
        idexamen: unidad.examen.idexamen,
      },
    });
  }
}

// 🎨 Estado → color
function getEstadoColor(estado) {
  switch (estado) {
    case "borrador":
      return "grey";
    case "en_revision":
      return "orange";
    case "pendiente_aceptacion":
      return "blue";
    case "publicado":
      return "green";
    case "rechazado":
      return "red";
    default:
      return "grey-6";
  }
}

onMounted(() => {
  loadCurso();
  loadUnidades();
});
</script>
