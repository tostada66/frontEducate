<template>
  <q-page class="q-pa-md">
    <!-- Encabezado -->
    <div class="row items-center q-mb-md">
      <q-btn
        color="secondary"
        label="Volver a Clases"
        icon="arrow_back"
        @click="goBackClases"
      />

      <q-space />

      <div class="text-h4 text-weight-bold text-primary text-center">
        Contenidos de la Clase
      </div>

      <q-space />

      <q-btn
        color="primary"
        icon="add"
        label="Nuevo Contenido"
        @click="goCreateContenido"
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

    <!-- Tabla -->
    <q-table
      :rows="filteredContenidos"
      :columns="columns"
      row-key="idcontenido"
      flat
      bordered
      :loading="loading"
      no-data-label="No hay contenidos registrados"
    >
      <!-- Orden con flechas -->
      <template v-slot:body-cell-orden="props">
        <q-td class="text-center">
          <div class="row items-center justify-center q-gutter-xs">
            <span>{{ props.row.orden }}</span>

            <q-btn
              v-if="contenidos.length > 1 && props.row.orden > 1"
              :disable="loadingOrden"
              dense
              flat
              round
              size="sm"
              icon="arrow_upward"
              color="primary"
              @click="cambiarOrden(props.row.idcontenido, 'up')"
            />
            <q-btn
              v-if="
                contenidos.length > 1 && props.row.orden < contenidos.length
              "
              :disable="loadingOrden"
              dense
              flat
              round
              size="sm"
              icon="arrow_downward"
              color="primary"
              @click="cambiarOrden(props.row.idcontenido, 'down')"
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
            @click="goEditContenido(props.row.idcontenido)"
          />
          <q-btn
            dense
            flat
            round
            icon="delete"
            color="negative"
            @click="deleteContenido(props.row.idcontenido)"
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
const idclase = route.params.idclase;

const contenidos = ref([]);
const loading = ref(false);
const loadingOrden = ref(false);
const filtroTitulo = ref("");

// Columnas
const columns = [
  { name: "titulo", label: "Título", field: "titulo", align: "left" },
  { name: "tipo", label: "Tipo", field: "tipo", align: "left" },
  { name: "orden", label: "Orden", field: "orden", align: "center" },
  { name: "estado", label: "Estado", field: "estado", align: "center" },
  { name: "acciones", label: "Acciones", align: "center" },
];

// 🔎 Filtrar
const filteredContenidos = computed(() =>
  contenidos.value.filter((c) =>
    !filtroTitulo.value
      ? true
      : c.titulo.toLowerCase().includes(filtroTitulo.value.toLowerCase())
  )
);

// 📂 Cargar
async function loadContenidos() {
  loading.value = true;
  try {
    const { data } = await api.get(
      `/cursos/${idcurso}/unidades/${idunidad}/clases/${idclase}/contenidos`
    );
    contenidos.value = data;
  } catch (err) {
    $q.notify({ type: "negative", message: "Error cargando contenidos" });
    console.error(err);
  } finally {
    loading.value = false;
  }
}

// 🔄 Cambiar orden
async function cambiarOrden(idcontenido, direccion) {
  loadingOrden.value = true;
  try {
    const { data } = await api.patch(
      `/cursos/${idcurso}/unidades/${idunidad}/clases/${idclase}/contenidos/${idcontenido}/orden`,
      { direccion }
    );
    contenidos.value = data.contenidos; // lista actualizada del backend
    $q.notify({ type: "positive", message: "Orden actualizado" });
  } catch (err) {
    console.error("❌ Error cambiando orden:", err.response?.data || err);
    $q.notify({ type: "negative", message: "Error cambiando orden" });
  } finally {
    loadingOrden.value = false;
  }
}

// Navegación
function goCreateContenido() {
  router.push({
    name: "contenidos-create",
    params: { idcurso, idunidad, idclase },
  });
}
function goEditContenido(idcontenido) {
  router.push({
    name: "contenidos-edit",
    params: { idcurso, idunidad, idclase, idcontenido },
  });
}
async function deleteContenido(id) {
  $q.dialog({
    title: "Confirmar",
    message: "¿Eliminar este contenido?",
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await api.delete(
        `/cursos/${idcurso}/unidades/${idunidad}/clases/${idclase}/contenidos/${id}`
      );
      $q.notify({ type: "positive", message: "Contenido eliminado" });
      await loadContenidos();
    } catch (err) {
      $q.notify({ type: "negative", message: "Error eliminando contenido" });
      console.error(err);
    }
  });
}
function goBackClases() {
  router.push({ name: "clases-list", params: { idcurso, idunidad } });
}

onMounted(() => {
  loadContenidos();
});
</script>
