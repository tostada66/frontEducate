<template>
  <q-page class="q-pa-md cursos-page">
    <!-- 🔹 Encabezado -->
    <div class="row items-center q-mb-md">
      <q-btn
        color="secondary"
        icon="arrow_back"
        label="Volver al dashboard"
        @click="goDashboard"
      />

      <q-space />

      <div class="text-h4 text-weight-bold text-primary text-center">
        {{ auth.isAdmin ? "Gestión de Cursos" : "Mis Cursos" }}
      </div>

      <q-space />

      <div class="row items-center q-gutter-sm">
        <!-- ✅ Excel para ambos -->
        <q-btn
          color="green-5"
          glossy
          icon="file_download"
          label="Exportar Excel"
          @click="exportToExcel"
        />

        <!-- Solo profesor puede crear -->
        <q-btn
          v-if="auth.isProfessor"
          color="primary"
          icon="add"
          label="Nuevo curso"
          @click="$router.push({ name: 'cursos-create' })"
        />
      </div>
    </div>

    <!-- 🔘 Selector de vista centrado -->
    <div class="row justify-center q-mb-xl">
      <q-btn-toggle
        v-model="modoVista"
        :options="[
          { label: 'Catálogo', value: 'catalogo', icon: 'grid_view' },
          { label: 'Tabla', value: 'tabla', icon: 'table_chart' },
        ]"
        color="primary"
        rounded
        unelevated
        dense
        toggle-color="primary"
        glossy
      />
    </div>

    <!-- 🔹 Filtros -->
    <q-card flat bordered class="q-pa-md filtros-card q-mb-md bg-filtros">
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-3">
          <q-input
            v-model="filtros.nombre"
            outlined
            dense
            debounce="300"
            placeholder="Buscar por nombre"
            class="input-filtro"
          >
            <template #prepend><q-icon name="search" /></template>
            <template #append>
              <q-icon
                v-if="filtros.nombre"
                name="close"
                class="cursor-pointer"
                @click="filtros.nombre = ''"
              />
            </template>
          </q-input>
        </div>

        <div class="col-6 col-md-2">
          <q-select
            v-model="filtros.nivel"
            :options="niveles"
            outlined
            dense
            label="Nivel"
            class="input-filtro"
            clearable
          />
        </div>

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
            class="input-filtro"
            clearable
            :loading="loadingCategorias"
          />
        </div>

        <div class="col-6 col-md-2">
          <q-select
            v-model="filtros.estado"
            :options="estados"
            outlined
            dense
            label="Estado"
            class="input-filtro"
            clearable
          />
        </div>
      </div>
    </q-card>

    <!-- 🖼️ VISTA CATÁLOGO -->
    <div v-if="modoVista === 'catalogo'">
      <div class="row q-col-gutter-lg q-mt-md">
        <div
          v-for="curso in filteredCursos"
          :key="curso.idcurso"
          class="col-12 col-md-6 col-lg-4"
        >
          <q-card class="curso-card shadow-4">
            <div class="curso-img-container">
              <img
                :src="
                  curso.imagen_url ||
                  'https://via.placeholder.com/400x250?text=Curso'
                "
                class="curso-img"
                alt="imagen curso"
              />
              <div class="curso-overlay">
                <div class="curso-titulo">{{ curso.nombre }}</div>
              </div>
            </div>

            <q-card-section>
              <div class="text-caption text-grey-7 q-mb-xs">
                {{ curso.categoria_nombre || "Sin categoría" }} ·
                {{ curso.nivel || "General" }}
              </div>
              <div class="text-body2">
                <q-badge
                  :color="getEstadoColor(curso.estado)"
                  class="text-white text-weight-bold"
                >
                  {{ curso.estado }}
                </q-badge>
              </div>
              <div
                v-if="auth.isAdmin && curso.profesor?.usuario"
                class="text-caption text-grey q-mt-xs"
              >
                👨‍🏫 {{ curso.profesor.usuario.nombres }}
                {{ curso.profesor.usuario.apellidos }}
              </div>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn
                flat
                color="secondary"
                icon="school"
                label="Unidades"
                @click="goUnidades(curso.idcurso)"
              />
              <q-btn
                flat
                color="teal"
                icon="visibility"
                label="Ver"
                @click="verComoEstudiante(curso.idcurso)"
              />
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </div>

    <!-- 📋 VISTA TABLA -->
    <div v-else>
      <q-table
        :rows="filteredCursos"
        :columns="columns"
        row-key="idcurso"
        flat
        bordered
        :loading="loading"
        class="tabla-blanca"
        :no-data-label="
          auth.isAdmin
            ? 'No hay cursos registrados'
            : 'No tienes cursos registrados'
        "
      >
        <template #body-cell-foto="props">
          <q-td class="text-center">
            <q-avatar square size="42px">
              <img
                :src="
                  props.row.imagen_url ||
                  'https://via.placeholder.com/80x80?text=Curso'
                "
              />
            </q-avatar>
          </q-td>
        </template>

        <template #body-cell-profesor="props">
          <q-td v-if="auth.isAdmin">
            {{
              props.row.profesor?.usuario
                ? props.row.profesor.usuario.nombres +
                  " " +
                  props.row.profesor.usuario.apellidos
                : "Sin asignar"
            }}
          </q-td>
        </template>

        <!-- 🔹 Mantenemos tus acciones intactas -->
        <template #body-cell-duracion="props">
          <q-td>{{ props.row.duracion_estimada || 0 }} min</q-td>
        </template>

        <template #body-cell-acciones="props">
          <q-td class="text-center">
            <div class="row justify-center q-gutter-xs">
              <q-btn
                v-if="
                  auth.isProfessor &&
                  ['borrador', 'rechazado'].includes(props.row.estado)
                "
                dense
                flat
                round
                icon="edit"
                color="primary"
                @click="editCurso(props.row.idcurso)"
              >
                <q-tooltip>Editar curso</q-tooltip>
              </q-btn>

              <q-btn
                v-if="
                  auth.isProfessor &&
                  ['borrador', 'rechazado'].includes(props.row.estado)
                "
                dense
                flat
                round
                icon="delete"
                color="negative"
                @click="deleteCurso(props.row.idcurso)"
              >
                <q-tooltip>Eliminar curso</q-tooltip>
              </q-btn>

              <q-btn
                dense
                flat
                round
                icon="school"
                color="secondary"
                @click="goUnidades(props.row.idcurso)"
              >
                <q-tooltip>Ver unidades</q-tooltip>
              </q-btn>

              <q-btn
                dense
                flat
                round
                icon="visibility"
                color="teal"
                @click="verComoEstudiante(props.row.idcurso)"
              >
                <q-tooltip>Ver curso</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>

        <template #body-cell-estado="props">
          <q-td>
            <q-badge
              :color="getEstadoColor(props.row.estado)"
              class="text-white text-weight-bold"
            >
              {{ props.row.estado }}
            </q-badge>
          </q-td>
        </template>
      </q-table>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { api } from "boot/axios";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { useAuthStore } from "src/stores/auth";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const $q = useQuasar();
const router = useRouter();
const auth = useAuthStore();

const cursos = ref([]);
const loading = ref(false);
const categoriasOptions = ref([]);
const loadingCategorias = ref(false);
const modoVista = ref("catalogo");

const filtros = ref({
  nombre: "",
  nivel: null,
  categoria: null,
  estado: null,
});

const niveles = ["Básico", "Intermedio", "Avanzado"];
const estados = [
  "borrador",
  "en_revision",
  "oferta_enviada",
  "pendiente_aceptacion",
  "publicado",
  "rechazado",
];

const columns = computed(() => {
  const base = [
    { name: "foto", label: "Foto", align: "center" },
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
  ];
  if (auth.isAdmin)
    base.splice(3, 0, { name: "profesor", label: "Profesor", align: "left" });
  base.push({ name: "acciones", label: "Acciones", align: "center" });
  return base;
});

function getEstadoColor(estado) {
  const map = {
    borrador: "grey",
    en_revision: "orange",
    oferta_enviada: "blue",
    pendiente_aceptacion: "amber",
    publicado: "green",
    rechazado: "red",
  };
  return map[estado] || "grey";
}

const filteredCursos = computed(() =>
  cursos.value.filter((c) => {
    const matchNombre =
      !filtros.value.nombre ||
      c.nombre.toLowerCase().includes(filtros.value.nombre.toLowerCase());
    const matchNivel = !filtros.value.nivel || c.nivel === filtros.value.nivel;
    const matchCategoria =
      !filtros.value.categoria || c.idcategoria === filtros.value.categoria;
    const matchEstado =
      !filtros.value.estado || c.estado === filtros.value.estado;
    return matchNombre && matchNivel && matchCategoria && matchEstado;
  })
);

/* ✅ Exportar Excel para ambos roles */
async function exportToExcel() {
  try {
    const dataToExport = filteredCursos.value.map((c) => ({
      Nombre: c.nombre,
      Nivel: c.nivel || "—",
      Categoría: c.categoria_nombre || "—",
      Estado: c.estado,
      Profesor:
        c.profesor?.usuario?.nombres + " " + c.profesor?.usuario?.apellidos ||
        "—",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cursos");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    saveAs(blob, "Cursos.xlsx");

    $q.notify({
      type: "positive",
      message: "Archivo Excel exportado correctamente",
    });
  } catch (error) {
    console.error("Error al exportar:", error);
    $q.notify({ type: "negative", message: "Error al exportar Excel" });
  }
}

/* === Cargar datos === */
async function loadCursos() {
  loading.value = true;
  try {
    const { data } = await api.get("/cursos");
    cursos.value = (data.data || data).map((c) => ({
      ...c,
      categoria_nombre: c.categoria?.nombre || "Sin categoría",
      imagen_url: c.imagen_url || null,
    }));
  } catch {
    $q.notify({ type: "negative", message: "Error cargando cursos" });
  } finally {
    loading.value = false;
  }
}

async function loadCategorias() {
  loadingCategorias.value = true;
  try {
    const { data } = await api.get("/categorias");
    categoriasOptions.value = data;
  } catch {
    $q.notify({ type: "negative", message: "Error cargando categorías" });
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
function verComoEstudiante(idcurso) {
  router.push({ name: "profesor-curso-detalle", params: { idcurso } });
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
      $q.notify({ type: "positive", message: "Curso eliminado correctamente" });
    } catch {
      $q.notify({ type: "negative", message: "Error eliminando curso" });
    }
  });
}

onMounted(() => {
  loadCursos();
  loadCategorias();
});
</script>

<style scoped>
/* 🎨 Filtros blancos */
.bg-filtros {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
}
.input-filtro {
  background: #fff;
  border-radius: 10px;
  color: #1a1a1a !important;
  transition: box-shadow 0.3s ease, transform 0.2s ease;
}
.input-filtro:hover {
  box-shadow: 0 0 10px rgba(138, 43, 226, 0.25);
  transform: translateY(-2px);
}

/* 📋 Tabla blanca */
.tabla-blanca {
  background: #ffffff !important;
  color: #1a1a1a !important;
  border-radius: 18px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  font-weight: 500;
}
.tabla-blanca thead th {
  background: #f9f9f9 !important;
  color: #3a3a3a !important;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 0.9rem;
  border-bottom: 1px solid #e5e5e5;
}
.tabla-blanca tbody td {
  background: #ffffff !important;
  color: #2a2a2a !important;
  border-bottom: 1px solid #eee !important;
  transition: background 0.25s ease;
}
.tabla-blanca tbody tr:hover td {
  background: #f4f0ff !important;
}
.tabla-blanca .q-table__bottom {
  background: #fafafa !important;
  color: #555 !important;
  border-top: 1px solid #e6e6e6;
}

/* 🧩 Cursos card */
.curso-card {
  border-radius: 14px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}
.curso-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
}
.curso-img-container {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
}
.curso-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}
.curso-card:hover .curso-img {
  transform: scale(1.1);
}
.curso-overlay {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 8px 12px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
}
.curso-titulo {
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
}
</style>
