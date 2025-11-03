<template>
  <q-page class="estudiantes-admin-page q-pa-md">
    <!-- 🌈 Título -->
    <div class="text-h4 text-bold text-center q-mb-md titulo-luminoso">
      🎓 Listado General de Estudiantes
    </div>
    <div class="text-center text-grey-4 q-mb-lg">
      Filtra, visualiza y exporta los estudiantes registrados según tus
      criterios.
    </div>

    <!-- 🔍 Filtros -->
    <q-card class="q-pa-lg bg-card q-mb-lg shadow-4">
      <div class="row q-col-gutter-md">
        <!-- 🧠 Buscador -->
        <div class="col-12 col-md-6">
          <q-input
            v-model="busqueda"
            label="Buscar estudiante por nombre o apellido"
            outlined
            dense
            dark
            rounded
            color="white"
            debounce="200"
            clearable
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>

        <!-- 🎓 Filtro por curso (MÚLTIPLE) -->
        <div class="col-12 col-md-6">
          <q-select
            v-model="cursosSeleccionados"
            :options="cursos"
            label="Filtrar por curso"
            outlined
            dense
            dark
            rounded
            color="white"
            emit-value
            map-options
            multiple
            use-chips
            clearable
          >
            <template v-slot:prepend>
              <q-icon name="school" />
            </template>
          </q-select>
        </div>

        <!-- 📅 Fecha inicio -->
        <div class="col-12 col-md-6">
          <q-input
            label="Desde fecha de registro"
            outlined
            dense
            dark
            rounded
            color="white"
            v-model="fechaInicio"
            mask="date"
            readonly
            @click="abrirCalendario('inicio')"
          >
            <template v-slot:prepend>
              <q-icon name="event" />
            </template>
          </q-input>

          <q-popup-proxy
            ref="popupInicio"
            transition-show="scale"
            transition-hide="scale"
          >
            <div class="calendar-container">
              <div class="cal-header text-white text-center text-subtitle2">
                <q-icon name="event" size="18px" class="q-mr-xs" /> Desde fecha
              </div>
              <q-date
                v-model="fechaInicio"
                mask="YYYY-MM-DD"
                color="purple"
                flat
                bordered
                minimal
                @update:model-value="popupInicio.value.hide()"
              />
            </div>
          </q-popup-proxy>
        </div>

        <!-- 📅 Fecha fin -->
        <div class="col-12 col-md-6">
          <q-input
            label="Hasta fecha de registro"
            outlined
            dense
            dark
            rounded
            color="white"
            v-model="fechaFin"
            mask="date"
            readonly
            @click="abrirCalendario('fin')"
          >
            <template v-slot:prepend>
              <q-icon name="event" />
            </template>
          </q-input>

          <q-popup-proxy
            ref="popupFin"
            transition-show="scale"
            transition-hide="scale"
          >
            <div class="calendar-container">
              <div class="cal-header text-white text-center text-subtitle2">
                <q-icon name="event" size="18px" class="q-mr-xs" /> Hasta fecha
              </div>
              <q-date
                v-model="fechaFin"
                mask="YYYY-MM-DD"
                color="purple"
                flat
                bordered
                minimal
                @update:model-value="popupFin.value.hide()"
              />
            </div>
          </q-popup-proxy>
        </div>
      </div>

      <!-- 🔘 Botones -->
      <div class="row justify-center q-mt-lg q-gutter-md">
        <q-btn
          color="teal"
          glossy
          icon="clear_all"
          label="Limpiar"
          @click="limpiarFiltros"
          class="q-px-lg text-bold"
        />
        <q-btn
          color="purple"
          glossy
          icon="file_download"
          label="Exportar Excel"
          @click="exportarExcel"
          class="q-px-lg text-bold"
        />
      </div>
    </q-card>

    <!-- 📋 Tabla -->
    <q-card class="shadow-4 q-pa-md bg-card">
      <q-table
        :rows="estudiantesFiltrados"
        :columns="columns"
        row-key="idusuario"
        :loading="loading"
        :pagination="{ rowsPerPage: 8 }"
        flat
        bordered
      >
        <!-- Estado -->
        <template v-slot:body-cell-estado="props">
          <q-td :props="props">
            <q-chip
              dense
              :color="props.row.estado ? 'green-5' : 'red-5'"
              text-color="white"
            >
              {{ props.row.estado ? "Activo" : "Inactivo" }}
            </q-chip>
          </q-td>
        </template>

        <!-- Nombre + botón perfil -->
        <template v-slot:body-cell-nombre="props">
          <q-td :props="props">
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-bold">
                  {{ props.row.nombres }} {{ props.row.apellidos }}
                </div>
                <div class="text-grey-5 text-caption">
                  {{ props.row.correo }}
                </div>
              </div>
              <q-btn
                dense
                flat
                round
                color="deep-purple-5"
                icon="visibility"
                class="q-ml-sm"
                @click="verPerfil(props.row.idusuario)"
              >
                <q-tooltip anchor="top middle" self="bottom middle">
                  Ver perfil del estudiante
                </q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>

        <!-- Curso (chips dinámicos filtrados) -->
        <template v-slot:body-cell-curso="props">
          <q-td :props="props">
            <div v-if="props.row.curso_nombre">
              <q-chip
                v-for="curso in mostrarCursos(props.row.curso_nombre)"
                :key="curso"
                size="md"
                color="purple-4"
                text-color="white"
                class="q-mr-xs q-mb-xs text-bold"
              >
                {{ curso.trim() }}
              </q-chip>
            </div>
            <div v-else>Sin curso</div>
          </q-td>
        </template>

        <!-- Fecha -->
        <template v-slot:body-cell-fecha_registro="props">
          <q-td :props="props">
            {{ formatDate(props.row.created_at) }}
          </q-td>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { api } from "boot/axios";
import * as XLSX from "xlsx";

const router = useRouter();

const estudiantes = ref([]);
const cursos = ref([]);
const loading = ref(false);
const busqueda = ref("");
const fechaInicio = ref(null);
const fechaFin = ref(null);
const cursosSeleccionados = ref([]);

const popupInicio = ref(null);
const popupFin = ref(null);

const columns = [
  { name: "nombre", label: "Estudiante", align: "left", field: "nombres" },
  { name: "correo", label: "Correo", align: "left", field: "correo" },
  { name: "curso", label: "Curso", align: "center", field: "curso_nombre" },
  { name: "estado", label: "Estado", align: "center", field: "estado" },
  { name: "fecha_registro", label: "Registro", align: "center" },
];

// 👁 Navegar al perfil del estudiante
function verPerfil(idusuario) {
  router.push(`/admin/usuarios/${idusuario}/perfil`);
}

function abrirCalendario(tipo) {
  if (tipo === "inicio") popupInicio.value.show();
  if (tipo === "fin") popupFin.value.show();
}

function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("es-BO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// 🔹 Cargar estudiantes y cursos
async function loadData() {
  loading.value = true;
  try {
    const { data } = await api.get("/estudiantes");
    estudiantes.value = data;

    // 🔹 Crear lista única de cursos
    const cursosUnicos = new Set();
    data.forEach((e) => {
      if (e.curso_nombre) {
        e.curso_nombre.split(",").forEach((curso) => {
          const limpio = curso.trim();
          if (limpio) cursosUnicos.add(limpio);
        });
      }
    });

    cursos.value = Array.from(cursosUnicos).map((nombre) => ({
      label: nombre,
      value: nombre,
    }));
  } finally {
    loading.value = false;
  }
}

// ✅ Mostrar solo los cursos seleccionados si hay filtros activos
function mostrarCursos(cursoStr) {
  if (!cursoStr) return [];
  const lista = cursoStr.split(",").map((c) => c.trim());
  if (!cursosSeleccionados.value.length) return lista;

  return lista.filter((c) =>
    cursosSeleccionados.value.some(
      (sel) => sel.toLowerCase() === c.toLowerCase()
    )
  );
}

// 🔹 Computed: aplicar filtros combinados
const estudiantesFiltrados = computed(() => {
  const q = busqueda.value.toLowerCase();
  return estudiantes.value.filter((e) => {
    const nombreCompleto = `${e.nombres} ${e.apellidos}`.toLowerCase();
    const fecha = new Date(e.created_at);
    const matchBusqueda = !q || nombreCompleto.includes(q);

    const cursosEst = e.curso_nombre
      ? e.curso_nombre.split(",").map((c) => c.trim().toLowerCase())
      : [];
    const matchCurso =
      !cursosSeleccionados.value.length ||
      cursosSeleccionados.value.some((sel) =>
        cursosEst.includes(sel.toLowerCase())
      );

    const matchInicio =
      !fechaInicio.value || fecha >= new Date(fechaInicio.value);
    const matchFin = !fechaFin.value || fecha <= new Date(fechaFin.value);

    return matchBusqueda && matchCurso && matchInicio && matchFin;
  });
});

function limpiarFiltros() {
  busqueda.value = "";
  fechaInicio.value = null;
  fechaFin.value = null;
  cursosSeleccionados.value = [];
}

function exportarExcel() {
  const datos = estudiantesFiltrados.value.map((e) => ({
    Estudiante: `${e.nombres} ${e.apellidos}`,
    Correo: e.correo,
    Cursos: e.curso_nombre || "Sin curso",
    Estado: e.estado ? "Activo" : "Inactivo",
    "Fecha Registro": formatDate(e.created_at),
  }));
  const ws = XLSX.utils.json_to_sheet(datos);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Estudiantes");
  XLSX.writeFile(wb, "estudiantes_filtrados.xlsx");
}

onMounted(() => loadData());
</script>

<style scoped>
.estudiantes-admin-page {
  background: radial-gradient(circle at 25% 25%, #2b0066, #0d0120 90%);
  min-height: 100vh;
  color: white;
}

.titulo-luminoso {
  background: linear-gradient(90deg, #d2a8ff, #a66cff, #00c6ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 25px rgba(140, 80, 255, 0.7);
}

.bg-card {
  background: rgba(30, 15, 60, 0.65);
  backdrop-filter: blur(12px);
  border-radius: 22px;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.q-chip {
  font-size: 0.9rem;
  padding: 0 10px;
  height: 28px;
}
</style>
