<template>
  <q-page class="q-pa-md">
    <!-- Encabezado -->
    <div class="row items-center q-mb-md">
      <!-- Botón volver -->
      <q-btn
        color="secondary"
        icon="arrow_back"
        label="Volver al dashboard"
        @click="goDashboard"
      />

      <q-space />

      <!-- Título centrado -->
      <div class="text-h4 text-weight-bold text-primary text-center">
        Mis Cursos
      </div>

      <q-space />

      <!-- Botón nuevo curso -->
      <q-btn
        v-if="auth.isProfessor"
        color="primary"
        icon="add"
        label="Nuevo curso"
        @click="$router.push({ name: 'cursos-create' })"
      />
    </div>

    <!-- Filtros -->
    <div class="row q-col-gutter-md q-mb-md">
      <!-- Buscar por nombre -->
      <div class="col-12 col-md-4">
        <q-input
          v-model="filtros.nombre"
          outlined
          dense
          debounce="300"
          placeholder="Buscar por nombre"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
          <template v-slot:append>
            <q-icon
              v-if="filtros.nombre"
              name="close"
              class="cursor-pointer"
              @click="filtros.nombre = ''"
            />
          </template>
        </q-input>
      </div>

      <!-- Filtro por nivel -->
      <div class="col-6 col-md-3">
        <q-select
          v-model="filtros.nivel"
          :options="niveles"
          outlined
          dense
          label="Nivel"
          clearable
        />
      </div>

      <!-- Filtro por categoría -->
      <div class="col-6 col-md-3">
        <q-select
          v-model="filtros.categoria"
          :options="categoriasOptions"
          option-label="nombre"
          option-value="idcategoria"
          emit-value
          map-options
          outlined
          dense
          label="Categoría"
          clearable
          :loading="loadingCategorias"
        />
      </div>
    </div>

    <!-- Tabla de cursos -->
    <q-table
      :rows="filteredCursos"
      :columns="columns"
      row-key="idcurso"
      flat
      bordered
      :loading="loading"
      no-data-label="No tienes cursos registrados"
    >
      <!-- Foto -->
      <template v-slot:body-cell-foto="props">
        <q-td class="text-center">
          <div class="row justify-center">
            <q-avatar square size="42px">
              <img
                :src="
                  props.row.imagen_url ||
                  'https://via.placeholder.com/80x80?text=Curso'
                "
              />
            </q-avatar>
          </div>
        </q-td>
      </template>

      <!-- Duración -->
      <template v-slot:body-cell-duracion="props">
        <q-td> {{ props.row.duracion_estimada || 0 }} min </q-td>
      </template>

      <!-- Acciones -->
      <template v-slot:body-cell-acciones="props">
        <q-td class="text-center">
          <div class="row justify-center q-gutter-xs">
            <q-btn
              v-if="auth.isProfessor"
              dense
              flat
              round
              icon="edit"
              color="primary"
              @click="editCurso(props.row.idcurso)"
            />
            <q-btn
              v-if="auth.isProfessor"
              dense
              flat
              round
              icon="delete"
              color="negative"
              @click="deleteCurso(props.row.idcurso)"
            />
            <q-btn
              v-if="auth.isProfessor"
              dense
              flat
              round
              icon="school"
              color="secondary"
              @click="goUnidades(props.row.idcurso)"
            />
          </div>
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { api } from "boot/axios";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { useAuthStore } from "src/stores/auth";

const $q = useQuasar();
const router = useRouter();
const auth = useAuthStore();

const cursos = ref([]);
const loading = ref(false);
const categoriasOptions = ref([]);
const loadingCategorias = ref(false);

// Filtros
const filtros = ref({
  nombre: "",
  nivel: null,
  categoria: null,
});

const niveles = ["Básico", "Intermedio", "Avanzado"];

// Columnas
const columns = [
  { name: "foto", label: "Foto del curso", align: "center" },
  { name: "nombre", label: "Nombre", field: "nombre", align: "left" },
  { name: "nivel", label: "Nivel", field: "nivel", align: "left" },
  {
    name: "categoria",
    label: "Categoría",
    field: "categoria_nombre",
    align: "left",
  },
  {
    name: "duracion",
    label: "Duración",
    field: "duracion_estimada",
    align: "left",
  },
  { name: "estado", label: "Estado", field: "estado", align: "left" },
  { name: "acciones", label: "Acciones", field: "acciones", align: "center" },
];

// Cursos filtrados
const filteredCursos = computed(() => {
  return cursos.value.filter((c) => {
    const matchNombre =
      !filtros.value.nombre ||
      c.nombre.toLowerCase().includes(filtros.value.nombre.toLowerCase());

    const matchNivel = !filtros.value.nivel || c.nivel === filtros.value.nivel;

    const matchCategoria =
      !filtros.value.categoria || c.idcategoria === filtros.value.categoria;

    return matchNombre && matchNivel && matchCategoria;
  });
});

// Cargar cursos
async function loadCursos() {
  loading.value = true;
  try {
    const { data } = await api.get("/cursos");

    cursos.value = (data.data || data).map((c) => ({
      ...c,
      categoria_nombre: c.categoria?.nombre || "Sin categoría",
      imagen_url: c.imagen_url || null,
    }));
  } catch (err) {
    console.error("❌ Error cargando cursos:", err);
    $q.notify({
      type: "negative",
      message: "Error cargando cursos",
    });
  } finally {
    loading.value = false;
  }
}

// Cargar categorías para filtro
async function loadCategorias() {
  loadingCategorias.value = true;
  try {
    const { data } = await api.get("/categorias");
    categoriasOptions.value = data;
  } catch (err) {
    console.error("❌ Error cargando categorías:", err);
  } finally {
    loadingCategorias.value = false;
  }
}

function editCurso(id) {
  router.push({ name: "cursos-edit", params: { idcurso: id } });
}

function goUnidades(id) {
  router.push({ name: "unidades-list", params: { idcurso: id } });
}

function goDashboard() {
  router.push({ name: "index" });
}

async function deleteCurso(id) {
  $q.dialog({
    title: "Confirmar",
    message: "¿Seguro que deseas eliminar este curso?",
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await api.delete(`/cursos/${id}`);
      await loadCursos();
      $q.notify({
        type: "positive",
        message: "Curso eliminado correctamente",
      });
    } catch (err) {
      console.error("❌ Error eliminando curso:", err.response?.data || err);
      $q.notify({
        type: "negative",
        message: "Error eliminando curso",
      });
    }
  });
}

onMounted(() => {
  loadCursos();
  loadCategorias();
});
</script>
