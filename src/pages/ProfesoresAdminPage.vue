<template>
  <q-page class="profesores-admin-page q-pa-md">
    <!-- 🌈 Título -->
    <div class="text-h4 text-bold text-center q-mb-md titulo-luminoso">
      👨‍🏫 Listado General de Profesores
    </div>
    <div class="text-center text-grey-4 q-mb-lg">
      Filtra, visualiza y exporta los profesores registrados según tus
      criterios.
    </div>

    <!-- 🔍 Filtros -->
    <q-card class="q-pa-md bg-card q-mb-md shadow-4">
      <div class="row q-col-gutter-md items-center">
        <!-- Buscador -->
        <div class="col-12 col-md-4">
          <q-input
            v-model="busqueda"
            label="Buscar profesor por nombre o apellido"
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

        <!-- Fecha inicio -->
        <div class="col-12 col-md-4">
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
                <q-icon name="event" size="18px" class="q-mr-xs" />
                Desde fecha
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

        <!-- Fecha fin -->
        <div class="col-12 col-md-4">
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
                <q-icon name="event" size="18px" class="q-mr-xs" />
                Hasta fecha
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

      <!-- Botones -->
      <div class="row justify-center q-mt-md q-gutter-md">
        <q-btn
          color="secondary"
          glossy
          icon="clear_all"
          label="Limpiar"
          @click="limpiarFiltros"
        />
        <q-btn
          color="purple"
          glossy
          icon="file_download"
          label="Exportar Excel"
          @click="exportarExcel"
        />
      </div>
    </q-card>

    <!-- 📋 Tabla -->
    <q-card class="shadow-4 q-pa-md bg-card">
      <q-table
        :rows="profesoresFiltrados"
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

        <!-- Nombre -->
        <template v-slot:body-cell-nombre="props">
          <q-td :props="props">
            <div class="text-bold">
              {{ props.row.nombres }} {{ props.row.apellidos }}
            </div>
            <div class="text-grey-5 text-caption">{{ props.row.correo }}</div>
          </q-td>
        </template>

        <!-- Cursos -->
        <template v-slot:body-cell-cursos="props">
          <q-td :props="props">
            <q-chip dense color="purple-4" text-color="white">
              {{ props.row.total_cursos || 0 }} cursos
            </q-chip>
          </q-td>
        </template>

        <!-- Fecha -->
        <template v-slot:body-cell-fecha_registro="props">
          <q-td :props="props">
            {{ formatDate(props.row.created_at) }}
          </q-td>
        </template>

        <!-- Acciones -->
        <template v-slot:body-cell-acciones="props">
          <q-td :props="props">
            <div class="row justify-center q-gutter-sm">
              <q-btn
                dense
                round
                color="light-blue-5"
                icon="visibility"
                @click="verCatalogo(props.row.idusuario)"
              >
                <q-tooltip>Ver Catálogo</q-tooltip>
              </q-btn>
              <q-btn
                dense
                round
                color="deep-purple-5"
                icon="person"
                @click="verPerfil(props.row.idusuario)"
              >
                <q-tooltip>Ver Perfil</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { api } from "boot/axios";
import { useRouter } from "vue-router";
import * as XLSX from "xlsx";

const router = useRouter();
const profesores = ref([]);
const loading = ref(false);
const busqueda = ref("");
const fechaInicio = ref(null);
const fechaFin = ref(null);

const popupInicio = ref(null);
const popupFin = ref(null);

const columns = [
  { name: "nombre", label: "Profesor", align: "left", field: "nombres" },
  { name: "correo", label: "Correo", align: "left", field: "correo" },
  { name: "cursos", label: "Cursos", align: "center", field: "total_cursos" },
  { name: "estado", label: "Estado", align: "center", field: "estado" },
  { name: "fecha_registro", label: "Registro", align: "center" },
  { name: "acciones", label: "Acciones", align: "center" },
];

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

async function loadProfesores() {
  loading.value = true;
  try {
    const { data } = await api.get("/admin/profesores");
    profesores.value = data;
  } finally {
    loading.value = false;
  }
}

const profesoresFiltrados = computed(() => {
  const q = busqueda.value.toLowerCase();
  return profesores.value.filter((p) => {
    const nombreCompleto = `${p.nombres} ${p.apellidos}`.toLowerCase();
    const fecha = new Date(p.created_at);
    const matchBusqueda = !q || nombreCompleto.includes(q);
    const matchInicio =
      !fechaInicio.value || fecha >= new Date(fechaInicio.value);
    const matchFin = !fechaFin.value || fecha <= new Date(fechaFin.value);
    return matchBusqueda && matchInicio && matchFin;
  });
});

function limpiarFiltros() {
  busqueda.value = "";
  fechaInicio.value = null;
  fechaFin.value = null;
}

function exportarExcel() {
  const datos = profesoresFiltrados.value.map((p) => ({
    Profesor: `${p.nombres} ${p.apellidos}`,
    Correo: p.correo,
    Cursos: p.total_cursos || 0,
    Estado: p.estado ? "Activo" : "Inactivo",
    "Fecha Registro": formatDate(p.created_at),
  }));
  const ws = XLSX.utils.json_to_sheet(datos);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Profesores");
  XLSX.writeFile(wb, "profesores_filtrados.xlsx");
}

function verCatalogo(id) {
  router.push({ name: "admin-profesor-catalogo", params: { idusuario: id } });
}
function verPerfil(id) {
  router.push({
    name: "admin-profesor-perfil",
    params: { idusuario: id },
    query: { soloVista: true }, // 🔹 indica que viene desde el listado
  });
}

onMounted(() => loadProfesores());
</script>

<style scoped>
.profesores-admin-page {
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
  background: rgba(25, 25, 59, 0.55);
  border-radius: 20px;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.q-input {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}
.q-field__label {
  color: #d0c7ff !important;
}

/* 🌈 Calendario elegante */
.calendar-container {
  background: rgba(25, 20, 50, 0.95);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 0 14px rgba(140, 80, 255, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.cal-header {
  background: linear-gradient(90deg, #a66cff, #7b3eff);
  padding: 6px 0;
  font-weight: 600;
  letter-spacing: 0.4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  text-shadow: 0 0 8px rgba(160, 100, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
}

.q-date {
  background: transparent;
  color: white;
  border-radius: 0 0 16px 16px;
}
.q-date__header {
  display: none;
}
</style>
