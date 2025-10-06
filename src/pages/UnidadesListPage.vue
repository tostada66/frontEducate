<template>
  <q-page class="q-pa-md">
    <!-- 🧭 Encabezado -->
    <div class="row items-center q-mb-md">
      <!-- Botón volver -->
      <q-btn
        color="secondary"
        label="Volver a cursos"
        icon="arrow_back"
        @click="goCursos"
      />

      <q-space />

      <!-- Título -->
      <div class="text-h4 text-weight-bold text-primary text-center">
        Unidades del Curso
      </div>

      <q-space />

      <!-- Botón nueva unidad (solo si curso está en borrador o rechazado) -->
      <q-btn
        v-if="['borrador', 'rechazado'].includes(curso?.estado)"
        color="primary"
        icon="add"
        label="Nueva Unidad"
        @click="goCreateUnidad"
      />
    </div>

    <!-- 🔎 Filtro de búsqueda -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-4">
        <q-input
          v-model="filtroTitulo"
          outlined
          dense
          debounce="300"
          placeholder="Buscar por título"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
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

    <!-- 📋 Tabla de unidades -->
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

      <!-- 🟢 Estado con color -->
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
          <!-- ✏️ Editar si el curso está en borrador o rechazado -->
          <q-btn
            v-if="['borrador', 'rechazado'].includes(curso?.estado)"
            dense
            flat
            round
            icon="edit"
            color="primary"
            @click="editUnidad(props.row.idunidad)"
          >
            <q-tooltip>Editar unidad</q-tooltip>
          </q-btn>

          <!-- ❌ Eliminar si el curso está en borrador o rechazado -->
          <q-btn
            v-if="['borrador', 'rechazado'].includes(curso?.estado)"
            dense
            flat
            round
            icon="delete"
            color="negative"
            @click="deleteUnidad(props.row.idunidad)"
          >
            <q-tooltip>Eliminar unidad</q-tooltip>
          </q-btn>

          <!-- 🎓 Ir a clases (siempre disponible) -->
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

          <!-- 👁 Vista previa (ver como estudiante/profesor) -->
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

// 🧩 Columnas
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

// 🔎 Filtro por título
const filteredUnidades = computed(() => {
  return unidades.value.filter((u) =>
    !filtroTitulo.value
      ? true
      : u.titulo.toLowerCase().includes(filtroTitulo.value.toLowerCase())
  );
});

// 📂 Cargar curso (para saber estado)
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
    unidades.value = data;
  } catch (err) {
    console.error("❌ Error cargando unidades:", err);
    $q.notify({ type: "negative", message: "Error cargando unidades" });
  } finally {
    loading.value = false;
  }
}

// ✏️ Crear / Editar / Eliminar / Ver / Navegación
function goCreateUnidad() {
  router.push({ name: "unidad-create", params: { idcurso } });
}
function editUnidad(idunidad) {
  router.push({ name: "unidad-edit", params: { idcurso, idunidad } });
}
async function deleteUnidad(idunidad) {
  $q.dialog({
    title: "Confirmar",
    message: "¿Eliminar esta unidad?",
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await api.delete(`/cursos/${idcurso}/unidades/${idunidad}`);
      $q.notify({
        type: "positive",
        message: "Unidad eliminada correctamente",
      });
      await loadUnidades();
    } catch (err) {
      console.error("❌ Error eliminando unidad:", err);
      $q.notify({ type: "negative", message: "Error eliminando unidad" });
    }
  });
}
function goClases(idunidad) {
  router.push({ name: "clases-list", params: { idcurso, idunidad } });
}
function goCursos() {
  router.push({ name: "cursos-list" });
}

// 👁 Vista previa fluida
function verComoEstudiante(idunidad) {
  router.push({
    name: "profesor-unidad-detalle",
    params: { idcurso, idunidad },
  });
}

// 🎨 Color según estado
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
