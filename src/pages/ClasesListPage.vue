<template>
  <q-page class="q-pa-md">
    <!-- 🧭 Encabezado -->
    <div class="row items-center q-mb-md">
      <!-- Botón volver -->
      <q-btn
        color="secondary"
        label="Volver a Unidades"
        icon="arrow_back"
        @click="goBackUnidades"
      />

      <q-space />

      <!-- Título -->
      <div class="text-h4 text-weight-bold text-primary text-center">
        Clases de la Unidad
      </div>

      <q-space />

      <!-- Botón nueva clase (solo si curso editable) -->
      <q-btn
        v-if="isEditable(cursoEstado)"
        color="primary"
        icon="add"
        label="Nueva Clase"
        @click="goCreateClase"
      />
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
      :rows="filteredClases"
      :columns="columns"
      row-key="idclase"
      flat
      bordered
      :loading="loading"
      no-data-label="No hay clases registradas"
    >
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
            :color="getEstadoColor(props.row.estado)"
            class="text-white text-weight-bold"
          >
            {{ props.row.estado || "N/A" }}
          </q-badge>
        </q-td>
      </template>

      <!-- 🔢 Orden -->
      <template #body-cell-orden="props">
        <q-td class="text-center">
          <div class="row items-center justify-center q-gutter-xs">
            <span>{{ props.row.orden }}</span>

            <!-- Solo si editable -->
            <template v-if="isEditable(props.row.estado)">
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
            </template>
          </div>
        </q-td>
      </template>

      <!-- ⚙️ Acciones -->
      <template #body-cell-acciones="props">
        <q-td class="text-center q-gutter-xs">
          <!-- ✏️ Editar -->
          <q-btn
            v-if="isEditable(props.row.estado)"
            dense
            flat
            round
            icon="edit"
            color="primary"
            @click="goEditClase(props.row.idclase)"
          >
            <q-tooltip>Editar clase</q-tooltip>
          </q-btn>

          <!-- ❌ Eliminar -->
          <q-btn
            v-if="isEditable(props.row.estado)"
            dense
            flat
            round
            icon="delete"
            color="negative"
            @click="deleteClase(props.row.idclase)"
          >
            <q-tooltip>Eliminar clase</q-tooltip>
          </q-btn>

          <!-- 🎓 Contenidos -->
          <q-btn
            dense
            flat
            round
            icon="school"
            color="secondary"
            @click="goContenidos(props.row.idclase)"
          >
            <q-tooltip>Administrar contenidos</q-tooltip>
          </q-btn>

          <!-- 👁 Vista previa -->
          <q-btn
            dense
            flat
            round
            icon="visibility"
            color="teal"
            @click="verComoEstudiante(props.row.idclase)"
          >
            <q-tooltip>
              {{
                props.row.estado === "rechazado"
                  ? "Ver detalles del curso rechazado"
                  : "Vista previa de la clase"
              }}
            </q-tooltip>
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
const idunidad = route.params.idunidad;

const clases = ref([]);
const loading = ref(false);
const loadingOrden = ref(false);
const filtroTitulo = ref("");
const cursoEstado = ref("");

// 📋 Columnas
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

// 🔍 Filtro
const filteredClases = computed(() =>
  clases.value.filter((c) =>
    !filtroTitulo.value
      ? true
      : c.titulo.toLowerCase().includes(filtroTitulo.value.toLowerCase())
  )
);

// 🎨 Colores de estado
function getEstadoColor(estado) {
  const e = (estado || "").toLowerCase();
  if (e === "borrador") return "grey";
  if (e === "en_revision") return "orange";
  if (e === "oferta_enviada") return "blue";
  if (e === "pendiente_aceptacion") return "amber";
  if (e === "publicado") return "green";
  if (e === "rechazado") return "red";
  return "grey";
}

// 🧠 Editable si curso o clase están en 'borrador' o 'rechazado'
function isEditable(estado) {
  const e = (estado || "").toLowerCase();
  const c = (cursoEstado.value || "").toLowerCase();
  return (
    e === "borrador" ||
    e === "rechazado" ||
    c === "rechazado" ||
    c === "borrador"
  );
}

// 📦 Cargar clases y estado del curso
async function loadClases() {
  loading.value = true;
  try {
    const { data } = await api.get(
      `/cursos/${idcurso}/unidades/${idunidad}/clases`
    );
    clases.value = data;

    const cursoResp = await api.get(`/cursos/${idcurso}`);
    cursoEstado.value = cursoResp.data.estado;
  } catch (err) {
    console.error("❌ Error cargando clases o curso:", err);
    $q.notify({ type: "negative", message: "Error cargando datos" });
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
    console.error("❌ Error cambiando orden:", err);
    $q.notify({ type: "negative", message: "Error cambiando orden" });
  } finally {
    loadingOrden.value = false;
  }
}

// 👁 Vista previa
async function verComoEstudiante(idclase) {
  try {
    const { data } = await api.get(
      `/cursos/${idcurso}/unidades/${idunidad}/clases/${idclase}/contenidos`
    );

    if (data.length > 0) {
      const primerContenido = data[0];
      router.push({
        name: "profesor-contenido-detalle",
        params: {
          idcurso,
          idunidad,
          idclase,
          idcontenido: primerContenido.idcontenido,
        },
      });
    } else {
      $q.notify({
        type: "warning",
        message: "Esta clase aún no tiene contenidos.",
      });
    }
  } catch (err) {
    console.error("❌ Error vista previa:", err);
    $q.notify({ type: "negative", message: "Error cargando vista previa" });
  }
}

// 🧭 Navegación
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
      console.error("❌ Error eliminando clase:", err);
      $q.notify({ type: "negative", message: "Error eliminando clase" });
    }
  });
}
function goContenidos(idclase) {
  router.push({
    name: "contenidos-list",
    params: { idcurso, idunidad, idclase },
  });
}
function goBackUnidades() {
  router.push({ name: "unidades-list", params: { idcurso } });
}

onMounted(() => loadClases());
</script>
