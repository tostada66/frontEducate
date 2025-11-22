<template>
  <q-page class="q-pa-md">
    <!-- 🧭 Encabezado -->
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

      <!-- ➕ Solo si curso editable -->
      <q-btn
        v-if="isEditable(curso?.estado)"
        color="primary"
        icon="add"
        label="Nuevo Contenido"
        @click="goCreateContenido"
      />
    </div>

    <!-- 🔍 Filtro -->
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
      :rows="filteredContenidos"
      :columns="columns"
      row-key="idcontenido"
      flat
      bordered
      :loading="loading"
      no-data-label="No hay contenidos registrados"
    >
      <!-- 🎞️ Tipo -->
      <template #body-cell-tipo="props">
        <q-td>
          <q-chip
            v-if="normalizeTipo(props.row.tipo) === 'imagen'"
            color="purple-6"
            text-color="white"
            icon="image"
            dense
          >
            Imagen
          </q-chip>

          <q-chip
            v-else-if="normalizeTipo(props.row.tipo) === 'documento'"
            color="blue-6"
            text-color="white"
            icon="description"
            dense
          >
            Documento
          </q-chip>

          <q-chip
            v-else-if="normalizeTipo(props.row.tipo) === 'video'"
            color="red-6"
            text-color="white"
            icon="play_circle"
            dense
          >
            Video
          </q-chip>

          <q-chip v-else color="grey-6" text-color="white" icon="help" dense>
            Otro
          </q-chip>
        </q-td>
      </template>

      <!-- 🔢 Orden -->
      <template #body-cell-orden="props">
        <q-td class="text-center">
          <div class="row items-center justify-center q-gutter-xs">
            <span>{{ props.row.orden }}</span>
            <template v-if="isEditable(curso?.estado)">
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
            </template>
          </div>
        </q-td>
      </template>

      <!-- ⚙️ Acciones -->
      <template #body-cell-acciones="props">
        <q-td class="text-center q-gutter-xs">
          <!-- ✏️ Editar -->
          <q-btn
            v-if="isEditable(curso?.estado)"
            dense
            flat
            round
            icon="edit"
            color="primary"
            @click="goEditContenido(props.row.idcontenido)"
          >
            <q-tooltip>Editar</q-tooltip>
          </q-btn>

          <!-- 🗑 Eliminar -->
          <q-btn
            v-if="isEditable(curso?.estado)"
            dense
            flat
            round
            icon="delete"
            color="negative"
            @click="deleteContenido(props.row.idcontenido)"
          >
            <q-tooltip>Eliminar</q-tooltip>
          </q-btn>

          <!-- 👁 Ver contenido -->
          <q-btn
            dense
            flat
            round
            icon="visibility"
            color="teal"
            @click="verContenido(props.row)"
          >
            <q-tooltip>
              {{
                curso?.estado === "rechazado"
                  ? "Ver detalles del curso rechazado"
                  : "Vista previa del contenido"
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
const idclase = route.params.idclase;

const curso = ref(null);
const contenidos = ref([]);
const loading = ref(false);
const loadingOrden = ref(false);
const filtroTitulo = ref("");

// 🧩 Columnas
const columns = [
  { name: "titulo", label: "Título", field: "titulo", align: "left" },
  { name: "tipo", label: "Tipo", field: "tipo", align: "left" },
  { name: "orden", label: "Orden", field: "orden", align: "center" },
  { name: "estado", label: "Estado", field: "estado", align: "center" },
  { name: "acciones", label: "Acciones", align: "center" },
];

// 🎯 Normalizar tipo
function normalizeTipo(tipo) {
  if (!tipo) return "otro";
  const t = tipo.toLowerCase();
  if (["imagen", "image", "png", "jpg"].includes(t)) return "imagen";
  if (["video", "mp4", "avi", "mov"].includes(t)) return "video";
  if (["documento", "pdf", "word", "doc", "docx", "ppt", "pptx"].includes(t))
    return "documento";
  return "otro";
}

// 🔍 Filtrar
const filteredContenidos = computed(() =>
  contenidos.value.filter((c) =>
    !filtroTitulo.value
      ? true
      : c.titulo.toLowerCase().includes(filtroTitulo.value.toLowerCase())
  )
);

// ✅ Permitir acciones en “borrador” o “rechazado”
function isEditable(estado) {
  const e = (estado || "").toLowerCase();
  return e === "borrador" || e === "rechazado";
}

// 📦 Cargar curso y contenidos
async function loadCurso() {
  try {
    const { data } = await api.get(`/cursos/${idcurso}`);
    curso.value = data;
  } catch (err) {
    console.error("❌ Error cargando curso:", err);
  }
}

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

// ➕ Crear
function goCreateContenido() {
  router.push({
    name: "contenidos-create",
    params: { idcurso, idunidad, idclase },
  });
}

// ✏️ Editar
function goEditContenido(idcontenido) {
  router.push({
    name: "contenidos-edit",
    params: { idcurso, idunidad, idclase, idcontenido },
  });
}

// ❌ Eliminar
async function deleteContenido(idcontenido) {
  $q.dialog({
    title: "Confirmar",
    message: "¿Eliminar este contenido?",
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await api.delete(
        `/cursos/${idcurso}/unidades/${idunidad}/clases/${idclase}/contenidos/${idcontenido}`
      );
      $q.notify({
        type: "positive",
        message: "Contenido eliminado correctamente",
      });
      await loadContenidos();
    } catch (err) {
      console.error("❌ Error eliminando contenido:", err);
      $q.notify({ type: "negative", message: "Error eliminando contenido" });
    }
  });
}

// 🔄 Cambiar orden
async function cambiarOrden(idcontenido, direccion) {
  loadingOrden.value = true;
  try {
    const { data } = await api.patch(
      `/cursos/${idcurso}/unidades/${idunidad}/clases/${idclase}/contenidos/${idcontenido}/orden`,
      { direccion }
    );
    contenidos.value = data.contenidos;
    $q.notify({ type: "positive", message: "Orden actualizado" });
  } catch (err) {
    console.error("❌ Error cambiando orden:", err);
    $q.notify({ type: "negative", message: "Error cambiando orden" });
  } finally {
    loadingOrden.value = false;
  }
}

// 👁 Ver contenido
function verContenido(contenido) {
  const tipo = normalizeTipo(contenido.tipo);

  if (tipo === "video") {
    router.push({
      name: "profesor-contenido-detalle",
      params: {
        idcurso,
        idunidad,
        idclase,
        idcontenido: contenido.idcontenido,
      },
    });
  } else if (["imagen", "documento"].includes(tipo)) {
    router.push({
      name: "profesor-contenido-docs",
      params: {
        idcurso,
        idunidad,
        idclase,
        idcontenido: contenido.idcontenido,
      },
    });
  } else {
    $q.notify({
      type: "warning",
      message: "Tipo de contenido no soportado para vista previa.",
    });
  }
}

// 🔙 Volver
function goBackClases() {
  router.push({ name: "clases-list", params: { idcurso, idunidad } });
}

// 🚀 Montaje
onMounted(() => {
  loadCurso();
  loadContenidos();
});
</script>
