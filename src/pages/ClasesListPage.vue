<template>
  <q-page class="q-pa-md">
    <!-- Encabezado -->
    <div class="row items-center q-mb-md">
      <!-- Botón volver con relleno -->
      <q-btn
        color="secondary"
        label="Volver a Unidades"
        icon="arrow_back"
        @click="goBackUnidades"
      />

      <q-space />

      <!-- Título centrado, más grande y en negrita -->
      <div class="text-h4 text-weight-bold text-primary text-center">
        Clases de la Unidad
      </div>

      <q-space />

      <!-- Botón nueva clase -->
      <q-btn
        color="primary"
        icon="add"
        label="Nueva Clase"
        @click="goCreateClase"
      />
    </div>

    <!-- Filtro de búsqueda -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-4">
        <q-input
          v-model="filtroTitulo"
          outlined
          dense
          debounce="300"
          placeholder="Buscar por título"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
          <template v-slot:append>
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

    <!-- Tabla de clases -->
    <q-table
      :rows="filteredClases"
      :columns="columns"
      row-key="idclase"
      flat
      bordered
      :loading="loading"
      no-data-label="No hay clases registradas"
    >
      <!-- Duración -->
      <template v-slot:body-cell-duracion="props">
        <q-td class="text-center">
          {{ props.row.duracion_total || 0 }} min
        </q-td>
      </template>

      <!-- Orden con número y flechas -->
      <template v-slot:body-cell-orden="props">
        <q-td class="text-center">
          <div class="row items-center justify-center q-gutter-xs">
            <span>{{ props.row.orden }}</span>

            <!-- Flecha arriba -->
            <q-btn
              v-if="clases.length > 1 && props.row.orden > 1"
              :disable="loadingOrden"
              dense
              flat
              round
              size="sm"
              icon="arrow_upward"
              color="primary"
              @click="cambiarOrden(props.row.idclase, 'up')"
            />

            <!-- Flecha abajo -->
            <q-btn
              v-if="clases.length > 1 && props.row.orden < clases.length"
              :disable="loadingOrden"
              dense
              flat
              round
              size="sm"
              icon="arrow_downward"
              color="primary"
              @click="cambiarOrden(props.row.idclase, 'down')"
            />
          </div>
        </q-td>
      </template>

      <!-- Acciones -->
      <template v-slot:body-cell-acciones="props">
        <q-td class="text-center q-gutter-xs">
          <q-btn
            dense
            flat
            round
            icon="edit"
            color="primary"
            @click="goEditClase(props.row.idclase)"
          />
          <q-btn
            dense
            flat
            round
            icon="delete"
            color="negative"
            @click="deleteClase(props.row.idclase)"
          />
          <q-btn
            dense
            flat
            round
            icon="list"
            color="secondary"
            @click="goContenidos(props.row.idclase)"
          />
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
const idunidad = route.params.idunidad;

const clases = ref([]);
const loading = ref(false);
const loadingOrden = ref(false);
const filtroTitulo = ref("");

// Columnas
const columns = [
  { name: "titulo", label: "Título", field: "titulo", align: "left" },
  {
    name: "duracion",
    label: "Duración",
    field: "duracion_total",
    align: "center",
  },
  { name: "estado", label: "Estado", field: "estado", align: "center" },
  { name: "orden", label: "Orden", field: "orden", align: "center" },
  { name: "acciones", label: "Acciones", align: "center" },
];

// 🔎 Filtrar clases por título
const filteredClases = computed(() => {
  return clases.value.filter((c) =>
    !filtroTitulo.value
      ? true
      : c.titulo.toLowerCase().includes(filtroTitulo.value.toLowerCase())
  );
});

// 📂 Cargar clases
async function loadClases() {
  loading.value = true;
  try {
    const { data } = await api.get(
      `/cursos/${idcurso}/unidades/${idunidad}/clases`
    );
    clases.value = data;
  } catch (err) {
    $q.notify({ type: "negative", message: "Error cargando clases" });
    console.error("❌ Error cargando clases:", err.response?.data || err);
  } finally {
    loading.value = false;
  }
}

// 🔄 Cambiar orden
async function cambiarOrden(idclase, direccion) {
  loadingOrden.value = true;
  try {
    const { data } = await api.patch(
      `/cursos/${idcurso}/unidades/${idunidad}/clases/${idclase}/orden`,
      { direccion }
    );
    clases.value = data.clases;
    $q.notify({ type: "positive", message: "Orden actualizado" });
  } catch (err) {
    console.error("❌ Error cambiando orden:", err.response?.data || err);
    $q.notify({ type: "negative", message: "Error cambiando orden" });
  } finally {
    loadingOrden.value = false;
  }
}

function goCreateClase() {
  router.push({ name: "clases-create", params: { idcurso, idunidad } });
}
function goEditClase(idclase) {
  router.push({ name: "clases-edit", params: { idcurso, idunidad, idclase } });
}
async function deleteClase(idclase) {
  $q.dialog({
    title: "Confirmar",
    message: "¿Eliminar esta clase?",
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await api.delete(
        `/cursos/${idcurso}/unidades/${idunidad}/clases/${idclase}`
      );
      $q.notify({ type: "positive", message: "Clase eliminada correctamente" });
      await loadClases();
    } catch (err) {
      console.error("❌ Error eliminando clase:", err.response?.data || err);
      $q.notify({ type: "negative", message: "Error eliminando clase" });
    }
  });
}
function goContenidos(idclase) {
  router.push({ name: "contenidos-list", params: { idclase } });
}
function goBackUnidades() {
  router.push({ name: "unidades-list", params: { idcurso } });
}

onMounted(() => {
  loadClases();
});
</script>
