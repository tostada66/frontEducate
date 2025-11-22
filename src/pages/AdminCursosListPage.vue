<template>
  <q-page class="q-pa-lg bg-grey-2">
    <!-- 🧭 Encabezado -->
    <div class="titulo-gestion q-mb-lg">🧭 Gestión General de Cursos</div>

    <!-- 🔘 Selector de vista -->
    <div class="row justify-center q-mb-xl">
      <q-btn-toggle
        v-model="modoVista"
        :options="[
          { label: 'Catálogo', value: 'catalogo', icon: 'grid_view' },
          { label: 'Tabla', value: 'tabla', icon: 'table_chart' },
        ]"
        color="primary"
        glossy
        rounded
        unelevated
        toggle-color="primary"
      />
    </div>

    <!-- 🔍 Filtros -->
    <div class="filtros-container q-mb-xl row q-col-gutter-md">
      <!-- Buscar -->
      <div class="col-12 col-md-6">
        <div class="q-mb-xs text-grey-7 flex items-center">
          <q-icon name="search" size="16px" class="q-mr-xs" color="primary" />
          <span class="text-caption">Buscar por nombre</span>
        </div>
        <q-input
          v-model="filtros.busqueda"
          outlined
          rounded
          standout="bg-white text-primary"
          dense
          placeholder="Ej. Programación"
          clearable
          debounce="300"
        />
      </div>

      <!-- Categoría -->
      <div class="col-12 col-md-3">
        <div class="q-mb-xs text-grey-7 flex items-center">
          <q-icon
            name="category"
            size="16px"
            class="q-mr-xs"
            color="secondary"
          />
          <span class="text-caption">Filtrar por categoría</span>
        </div>
        <q-select
          v-model="filtros.categoria"
          :options="categorias"
          option-value="idcategoria"
          option-label="nombre"
          outlined
          rounded
          standout="bg-white text-primary"
          dense
          clearable
          emit-value
          map-options
          placeholder="Selecciona categoría"
        />
      </div>

      <!-- Nivel -->
      <div class="col-12 col-md-3">
        <div class="q-mb-xs text-grey-7 flex items-center">
          <q-icon name="school" size="16px" class="q-mr-xs" color="primary" />
          <span class="text-caption">Filtrar por nivel</span>
        </div>
        <q-select
          v-model="filtros.nivel"
          :options="nivelesConIcono"
          option-value="value"
          option-label="label"
          outlined
          rounded
          standout="bg-white text-primary"
          dense
          clearable
          placeholder="Selecciona nivel"
        >
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section avatar>
                <q-icon :name="scope.opt.icon" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ scope.opt.label }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>
    </div>

    <!-- ============================
         🧱 MODO CATÁLOGO
    ============================ -->
    <div v-if="modoVista === 'catalogo'" class="row q-col-gutter-lg">
      <div
        v-for="curso in cursosFiltrados"
        :key="curso.idcurso"
        class="col-12 col-md-6 col-lg-4"
      >
        <q-card class="curso-card shadow-4">
          <div class="curso-img-container">
            <img
              :src="fixUrl(curso)"
              alt="Imagen del curso"
              class="curso-img"
            />
            <div class="curso-overlay">
              <div class="curso-titulo">Curso: {{ curso.nombre }}</div>
            </div>
          </div>

          <q-card-section>
            <!-- Categoría -->
            <div class="detalle-linea">
              <q-icon
                name="category"
                size="18px"
                class="q-mr-xs text-primary"
              />
              <span class="detalle-label">Categoría:</span>
              <q-badge
                color="secondary"
                class="q-ml-xs text-caption"
                :label="curso.categoria?.nombre || 'Sin categoría'"
              />
            </div>

            <!-- Nivel -->
            <div class="detalle-linea">
              <q-icon name="school" size="18px" class="q-mr-xs text-primary" />
              <span class="detalle-label">Nivel:</span>
              <span class="detalle-value">
                {{ curso.nivel || "General" }}
              </span>
            </div>

            <!-- Profesor -->
            <div class="detalle-linea">
              <q-icon name="person" size="18px" class="q-mr-xs text-primary" />
              <span class="detalle-label">Profesor:</span>
              <span class="detalle-value">
                {{ curso.profesor?.usuario?.nombres || "No asignado" }}
              </span>
            </div>

            <!-- Duración -->
            <div class="detalle-linea">
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
                    : curso.duracion_estimada
                    ? formatearDuracion(curso.duracion_estimada * 60)
                    : "No definida"
                }}
              </span>
            </div>

            <!-- Estado -->
            <div class="detalle-linea">
              <q-icon name="sell" size="18px" class="q-mr-xs text-primary" />
              <span class="detalle-label">Estado:</span>
              <q-badge
                :color="getEstadoColor(curso.estado)"
                class="text-caption text-white q-ml-xs"
                :label="curso.estado.toUpperCase()"
              />
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              color="secondary"
              flat
              icon="school"
              label="Unidades"
              @click="goUnidades(curso.idcurso)"
            />
            <q-btn
              color="teal"
              flat
              icon="visibility"
              label="Ver curso"
              @click="goCursoDetalle(curso.idcurso)"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- ============================
         📋 MODO TABLA
    ============================ -->
    <div v-else>
      <q-table
        :rows="cursosFiltrados"
        :columns="columns"
        row-key="idcurso"
        flat
        bordered
        :loading="loading"
        no-data-label="No hay cursos disponibles"
        :pagination="{ rowsPerPage: 8 }"
        class="tabla-cursos"
      >
        <!-- Imagen -->
        <template #body-cell-imagen="props">
          <q-td>
            <q-avatar square size="45px">
              <img :src="fixUrl(props.row)" />
            </q-avatar>
          </q-td>
        </template>

        <!-- Duración formateada -->
        <template #body-cell-duracion="props">
          <q-td>
            {{
              props.row.duracion_total
                ? formatearDuracion(props.row.duracion_total)
                : props.row.duracion_estimada
                ? formatearDuracion(props.row.duracion_estimada * 60)
                : "0s"
            }}
          </q-td>
        </template>

        <!-- Estado -->
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

        <!-- Acciones -->
        <template #body-cell-acciones="props">
          <q-td class="text-center q-gutter-xs">
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
              @click="goCursoDetalle(props.row.idcurso)"
            >
              <q-tooltip>Ver curso</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </div>

    <!-- Loader -->
    <div v-if="loading" class="row justify-center q-mt-lg">
      <q-spinner-dots color="primary" size="40px" />
    </div>

    <!-- Sin resultados -->
    <div
      v-if="!loading && cursosFiltrados.length === 0"
      class="text-center text-grey q-mt-lg"
    >
      No hay cursos disponibles.
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { api } from "boot/axios";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";

const $q = useQuasar();
const router = useRouter();

const cursos = ref([]);
const categorias = ref([]);
const loading = ref(false);
const modoVista = ref("catalogo");

const filtros = ref({
  busqueda: "",
  categoria: null,
  nivel: null,
});

const nivelesConIcono = [
  { label: "Básico", value: "Básico", icon: "school" },
  { label: "Intermedio", value: "Intermedio", icon: "trending_up" },
  { label: "Avanzado", value: "Avanzado", icon: "workspace_premium" },
];

const columns = [
  { name: "imagen", label: "Imagen", align: "center" },
  { name: "nombre", label: "Nombre", field: "nombre", align: "left" },
  {
    name: "categoria",
    label: "Categoría",
    field: (row) => row.categoria?.nombre || "Sin categoría",
    align: "left",
  },
  { name: "nivel", label: "Nivel", field: "nivel", align: "left" },
  {
    name: "profesor",
    label: "Profesor",
    field: (row) => row.profesor?.usuario?.nombres || "No asignado",
    align: "left",
  },
  {
    name: "duracion",
    label: "Duración",
    field: (row) => row.duracion_total || row.duracion_estimada || 0,
    align: "left",
  },
  { name: "estado", label: "Estado", field: "estado", align: "center" },
  { name: "acciones", label: "Acciones", align: "center" },
];

async function loadCursos() {
  loading.value = true;
  try {
    const { data } = await api.get("/cursos"); // 👈 Todos los cursos
    cursos.value = Array.isArray(data.data) ? data.data : data;

    categorias.value = [
      ...new Map(
        cursos.value
          .filter((c) => c.categoria)
          .map((c) => [c.categoria.idcategoria, c.categoria])
      ).values(),
    ];
  } catch (err) {
    console.error("❌ Error cargando cursos:", err);
    $q.notify({ type: "negative", message: "Error cargando cursos" });
  } finally {
    loading.value = false;
  }
}

function getEstadoColor(estado) {
  const map = {
    publicado: "green-6",
    en_revision: "amber-6",
    rechazado: "red-6",
    borrador: "grey-6",
  };
  return map[estado] || "blue-6";
}

function goCursoDetalle(idcurso) {
  router.push({ name: "curso-detalle", params: { idcurso } });
}

function goUnidades(idcurso) {
  router.push({ name: "admin-unidades", params: { idcurso } });
}

function fixUrl(curso) {
  if (curso.imagen_url) return curso.imagen_url;
  if (curso.imagen) return `http://127.0.0.1:8000/storage/${curso.imagen}`;
  return "/images/curso-placeholder.png";
}

const cursosFiltrados = computed(() =>
  cursos.value.filter((curso) => {
    const nombre = curso.nombre?.toLowerCase() || "";
    const busqueda = filtros.value.busqueda?.toLowerCase() || "";
    const matchBusqueda = !busqueda || nombre.includes(busqueda);
    const matchCategoria =
      !filtros.value.categoria || curso.idcategoria === filtros.value.categoria;
    const matchNivel =
      !filtros.value.nivel || curso.nivel === filtros.value.nivel;
    return matchBusqueda && matchCategoria && matchNivel;
  })
);

/* ⏱ Formatear duración (segundos → h:mm:ss / m:ss / Xs) */
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

onMounted(() => loadCursos());
</script>

<style scoped>
/* Título principal */
.titulo-gestion {
  font-size: 2rem;
  font-weight: 700;
  color: #1565c0;
  text-align: center;
}

/* Filtros */
.filtros-container {
  background: #ffffff;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
}

/* Tabla */
.tabla-cursos {
  background: #ffffff;
  border-radius: 16px;
}

/* Cards de curso */
.curso-card {
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}
.curso-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.15);
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
  background: linear-gradient(to top, rgba(0, 0, 0, 0.65), transparent);
}
.curso-titulo {
  color: #fff;
  font-size: 1.3rem;
  font-weight: 700;
}

/* Detalles en la card */
.detalle-linea {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}
.detalle-label {
  font-weight: 600;
  font-size: 0.98rem;
  color: #37474f;
  margin-right: 4px;
}
.detalle-value {
  color: #455a64;
  font-size: 0.98rem;
}
</style>
