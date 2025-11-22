<template>
  <q-page class="estadisticas-examen-page q-pa-xl">
    <!-- 🔙 Botón volver -->
    <div class="row items-center justify-between q-mb-lg">
      <q-btn
        flat
        color="deep-purple-6"
        icon="arrow_back"
        label="Volver"
        class="text-bold"
        @click="$router.back()"
      />
    </div>

    <!-- 🧭 Encabezado -->
    <div class="encabezado text-center q-mb-xl">
      <div class="text-h4 text-bold text-morado">
        📊 Estadísticas del Examen
      </div>
      <div class="text-subtitle1 text-grey-7">
        {{ examen?.titulo || "Cargando examen..." }} —
        {{ examen?.unidad?.titulo || "" }}
      </div>
    </div>

    <!-- 📈 Tarjeta principal -->
    <q-card class="estadisticas-card q-pa-xl shadow-10 text-center">
      <div class="row q-col-gutter-xl justify-around">
        <!-- Promedio -->
        <div class="col-12 col-sm-3 text-center">
          <q-circular-progress
            show-value
            font-size="24px"
            :value="estadisticas.promedio"
            value-color="lime-4"
            track-color="grey-5"
            size="150px"
            thickness="0.22"
            animation-speed="1200"
          >
            <div class="text-h5 text-bold text-lime-3">
              {{ estadisticas.promedio }}%
            </div>
          </q-circular-progress>
          <div class="text-subtitle1 text-light q-mt-sm">Promedio general</div>
        </div>

        <!-- Aprobación -->
        <div class="col-12 col-sm-3 text-center">
          <q-circular-progress
            show-value
            font-size="24px"
            :value="estadisticas.aprobadosPorcentaje"
            value-color="pink-4"
            track-color="grey-5"
            size="150px"
            thickness="0.22"
            animation-speed="1200"
          >
            <div class="text-h5 text-bold text-pink-3">
              {{ estadisticas.aprobadosPorcentaje }}%
            </div>
          </q-circular-progress>
          <div class="text-subtitle1 text-light q-mt-sm">
            Tasa de aprobación
          </div>
        </div>

        <!-- Intentos -->
        <div class="col-12 col-sm-3 text-center">
          <q-circular-progress
            show-value
            font-size="24px"
            :value="estadisticas.totalIntentos"
            :max="maxIntentos"
            value-color="cyan-4"
            track-color="grey-5"
            size="150px"
            thickness="0.22"
            animation-speed="1200"
          >
            <div class="text-h5 text-bold text-cyan-3">
              {{ estadisticas.totalIntentos }}
            </div>
          </q-circular-progress>
          <div class="text-subtitle1 text-light q-mt-sm">Intentos totales</div>
        </div>
      </div>
    </q-card>

    <!-- 📋 Tabla de estudiantes -->
    <q-card class="q-mt-xl tabla-card shadow-8">
      <q-table
        :rows="resultados"
        :columns="columns"
        row-key="idintento"
        flat
        bordered
        separator="cell"
        :pagination="{ rowsPerPage: 8 }"
        no-data-label="Aún no hay intentos registrados."
        class="tabla-modern"
      >
        <!-- Resultado -->
        <template v-slot:body-cell-aprobado="props">
          <q-td :props="props">
            <q-chip
              :color="props.row.aprobado ? 'green-5' : 'red-5'"
              text-color="white"
              glossy
            >
              {{ props.row.aprobado ? "Aprobado" : "No aprobado" }}
            </q-chip>
          </q-td>
        </template>

        <!-- ✔ Correctas -->
        <template v-slot:body-cell-correctas="props">
          <q-td :props="props">
            <q-badge color="green-6" text-color="white" align="middle">
              {{ props.row.correctas }}
            </q-badge>
          </q-td>
        </template>

        <!-- ✖ Incorrectas -->
        <template v-slot:body-cell-incorrectas="props">
          <q-td :props="props">
            <q-badge color="red-6" text-color="white" align="middle">
              {{ props.row.incorrectas }}
            </q-badge>
          </q-td>
        </template>

        <!-- ⏸ No respondidas -->
        <template v-slot:body-cell-noRespondidas="props">
          <q-td :props="props">
            <q-badge color="grey-7" text-color="white" align="middle">
              {{ props.row.noRespondidas }}
            </q-badge>
          </q-td>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useQuasar } from "quasar";
import { api } from "boot/axios";

const $q = useQuasar();
const route = useRoute();

const examen = ref(null);
const resultados = ref([]);
const estadisticas = ref({
  promedio: 0,
  aprobadosPorcentaje: 0,
  totalIntentos: 0,
});
const maxIntentos = 100;

const columns = [
  {
    name: "estudiante",
    label: "Estudiante",
    field: "estudiante",
    align: "left",
  },
  { name: "puntaje", label: "Puntaje (%)", field: "puntaje", align: "center" },
  {
    name: "correctas",
    label: "✔ Correctas",
    field: "correctas",
    align: "center",
  },
  {
    name: "incorrectas",
    label: "✖ Incorrectas",
    field: "incorrectas",
    align: "center",
  },
  {
    name: "noRespondidas",
    label: "⏸ No respondidas",
    field: "noRespondidas",
    align: "center",
  },
  { name: "tiempo", label: "Tiempo usado", field: "tiempo", align: "center" },
  { name: "vidas", label: "Vidas", field: "vidas_restantes", align: "center" },
  { name: "aprobado", label: "Resultado", field: "aprobado", align: "center" },
];

async function loadEstadisticas() {
  try {
    const { idexamen } = route.params;
    const { data } = await api.get(`/examenes/${idexamen}/estadisticas`);
    examen.value = data.examen;
    resultados.value = data.intentos || [];

    estadisticas.value = {
      promedio: data.promedio || 0,
      aprobadosPorcentaje: data.aprobadosPorcentaje || 0,
      totalIntentos: data.intentos?.length || 0,
    };
  } catch (err) {
    console.error("❌ Error cargando estadísticas:", err);
    $q.notify({
      type: "negative",
      message: "No se pudieron cargar las estadísticas del examen.",
    });
  }
}

onMounted(() => loadEstadisticas());
</script>

<style scoped>
.estadisticas-examen-page {
  background: #ffffff;
  min-height: 100vh;
}

/* 🟣 Encabezado */
.text-morado {
  color: #7a33ff;
  text-shadow: 0 0 8px rgba(122, 51, 255, 0.25);
}

/* 🌈 Tarjeta principal */
.estadisticas-card {
  background: linear-gradient(180deg, #5b02a6, #2e0068);
  color: rgb(0, 0, 0);
  border-radius: 30px;
  box-shadow: 0 0 35px rgba(140, 0, 255, 0.45);
  transition: transform 0.3s ease;
}
.estadisticas-card:hover {
  transform: scale(1.015);
}
.text-light {
  color: #f1eaff;
}

/* 📋 Tabla */
.tabla-card {
  background: white;
  border-radius: 18px;
  overflow: hidden;
}
.q-table thead tr th {
  background: #6c00ff;
  color: #ffffff;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.q-table tbody tr:nth-child(even) {
  background: #f7f2ff;
}
.q-table tbody tr:hover {
  background: rgba(160, 80, 255, 0.1);
  transition: 0.2s ease;
}
.tabla-modern .q-td {
  font-size: 15px;
  color: #2e2e2e;
}
</style>
