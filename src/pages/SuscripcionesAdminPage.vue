<template>
  <q-page class="suscripciones-admin-page q-pa-md">
    <!-- 🧭 Encabezado -->
    <div class="text-h4 text-bold text-center q-mb-md titulo-luminoso">
      📜 Historial General de Suscripciones
    </div>
    <div class="text-center text-grey-4 q-mb-lg">
      Filtra las suscripciones activas, expiradas o por tipo de plan.
    </div>

    <!-- 🟣 Toggle vista -->
    <div class="flex justify-center q-mb-lg">
      <q-btn-toggle
        v-model="modoVista"
        rounded
        glossy
        color="deep-purple-6"
        toggle-color="deep-purple-6"
        text-color="white"
        unelevated
        :options="[
          { label: '📋 Tabla', value: 'tabla' },
          { label: '📊 Gráficas', value: 'graficas' },
        ]"
      />
    </div>

    <!-- ==========================
         📋 VISTA TABLA
    ========================== -->
    <div v-if="modoVista === 'tabla'">
      <q-card class="q-pa-md q-mb-lg filtros-card">
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-3">
            <q-select
              v-model="filtros.tipo"
              :options="tipos"
              label="Tipo de suscripción"
              outlined
              dense
              clearable
            />
          </div>

          <div class="col-12 col-md-3">
            <q-select
              v-model="filtros.estado"
              :options="estados"
              label="Estado"
              outlined
              dense
              clearable
            />
          </div>

          <div class="col-12 col-md-3">
            <q-input
              v-model="filtros.desde"
              type="date"
              label="Desde"
              outlined
              dense
            />
          </div>
          <div class="col-12 col-md-3">
            <q-input
              v-model="filtros.hasta"
              type="date"
              label="Hasta"
              outlined
              dense
            />
          </div>

          <div class="col-12 flex justify-end q-mt-sm">
            <q-btn
              color="deep-purple-6"
              icon="search"
              label="Filtrar"
              glossy
              @click="filtrarSuscripciones"
            />
            <q-btn
              flat
              color="grey-5"
              label="Limpiar"
              icon="refresh"
              class="q-ml-sm"
              @click="resetFiltros"
            />
            <q-btn
              color="amber-7"
              glossy
              class="q-ml-sm"
              icon="download"
              label="Exportar Excel"
              @click="exportarExcel"
            />
          </div>
        </div>
      </q-card>

      <!-- 📋 Tabla -->
      <q-card class="shadow-4 q-pa-md bg-card">
        <q-table
          :rows="suscripciones"
          :columns="columns"
          row-key="idsuscripcion"
          :loading="loading"
          :pagination="{ rowsPerPage: 8 }"
          flat
          bordered
        >
          <template v-slot:body-cell-estado="props">
            <q-td :props="props">
              <q-chip
                dense
                :color="props.row.estado === 'ACTIVA' ? 'green-5' : 'red-5'"
                text-color="white"
              >
                {{ props.row.estado }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-tipo="props">
            <q-td :props="props">
              <q-chip dense color="purple-5" text-color="white">{{
                props.row.tipo || "Suscripción"
              }}</q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-usuario="props">
            <q-td :props="props">
              <div v-if="props.row.usuario" class="row items-center no-wrap">
                <div class="col">
                  <div class="text-bold">
                    {{ props.row.usuario.nombres }}
                    {{ props.row.usuario.apellidos }}
                  </div>
                  <div class="text-grey-5 text-caption">
                    {{ props.row.usuario.correo }}
                  </div>
                </div>
                <q-btn
                  dense
                  flat
                  round
                  color="deep-purple-5"
                  icon="visibility"
                  class="q-ml-sm"
                  @click="verPerfil(props.row.usuario.idusuario)"
                />
              </div>
              <div v-else>—</div>
            </q-td>
          </template>

          <template v-slot:body-cell-fecha_inicio="props">
            <q-td :props="props">{{ formatDate(props.row.fecha_inicio) }}</q-td>
          </template>

          <template v-slot:body-cell-fecha_fin="props">
            <q-td :props="props">{{ formatDate(props.row.fecha_fin) }}</q-td>
          </template>

          <template v-slot:body-cell-total="props">
            <q-td :props="props">
              <b class="text-positive">
                Bs. {{ Number(props.row.total || 0).toFixed(2) }}
              </b>
            </q-td>
          </template>
        </q-table>
      </q-card>
    </div>

    <!-- ==========================
         📊 VISTA GRÁFICAS
    ========================== -->
    <div v-else>
      <!-- 📊 RESUMEN SUPERIOR -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-md-3" v-for="(card, i) in resumen" :key="i">
          <q-card class="q-pa-md text-center resumen-card">
            <div class="text-h6 text-bold">{{ card.label }}</div>
            <div :class="['text-h4', card.color]">{{ card.value }}</div>
          </q-card>
        </div>
      </div>

      <!-- 📈 GRÁFICAS -->
      <q-card class="shadow-4 q-pa-lg bg-card">
        <q-separator class="q-my-lg" color="white" />
        <q-card class="shadow-4 q-pa-lg bg-card">
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h5 text-white">📈 Suscripciones por Período</div>

            <div class="row items-center q-gutter-sm">
              <!-- 🔹 Filtros de rango directo -->
              <q-input
                v-model="filtros.desde"
                type="date"
                dense
                outlined
                label="Desde"
                class="q-mr-sm"
                style="width: 150px"
              />
              <q-input
                v-model="filtros.hasta"
                type="date"
                dense
                outlined
                label="Hasta"
                class="q-mr-sm"
                style="width: 150px"
              />
              <!-- 🔹 Selector de modo temporal -->
              <q-btn-toggle
                v-model="modoTiempo"
                color="deep-purple-6"
                glossy
                toggle-color="deep-purple-6"
                text-color="white"
                :options="[
                  { label: 'Día', value: 'dia' },
                  { label: 'Mes', value: 'mes' },
                  { label: 'Año', value: 'año' },
                ]"
              />
            </div>
          </div>

          <apexchart
            height="350"
            :type="modoTiempo === 'año' ? 'bar' : 'line'"
            :options="chartOptionsTemporal"
            :series="seriesTemporal"
          />
        </q-card>

        <div class="text-h5 text-center q-mb-md">
          🧩 Distribución por Tipo de Plan
        </div>
        <apexchart
          type="donut"
          height="320"
          :options="chartOptionsTipo"
          :series="seriesTipo"
        />

        <q-separator class="q-my-lg" color="white" />

        <div class="text-h5 text-center q-mb-md">
          💰 Ingresos Totales por Tipo
        </div>
        <apexchart
          type="bar"
          height="320"
          :options="chartOptionsIngresos"
          :series="seriesIngresos"
        />
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { api } from "boot/axios";
import { useRouter } from "vue-router";
import { useQuasar, Loading } from "quasar";

const $q = useQuasar();
const router = useRouter();

const loading = ref(false);
const suscripciones = ref([]);
const modoVista = ref("tabla");

const filtros = ref({
  tipo: null,
  estado: null,
  desde: null,
  hasta: null,
});

const tipos = [
  { label: "Mensual", value: "Mensual" },
  { label: "Medio Año", value: "Medio Año" },
  { label: "Anual", value: "Anual" },
];

const estados = [
  { label: "Activa", value: "ACTIVA" },
  { label: "Expirada", value: "EXPIRADA" },
];

const columns = [
  { name: "tipo", label: "Tipo", align: "center", field: "tipo" },
  { name: "usuario", label: "Usuario", align: "left", field: "usuario" },
  { name: "plan", label: "Plan", align: "center", field: "plan" },
  { name: "total", label: "Total (Bs.)", align: "center", field: "total" },
  { name: "estado", label: "Estado", align: "center", field: "estado" },
  { name: "fecha_inicio", label: "Inicio", align: "center" },
  { name: "fecha_fin", label: "Fin", align: "center" },
];

function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("es-BO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

async function loadSuscripciones() {
  loading.value = true;
  try {
    const { data } = await api.get("/admin/suscripciones");
    suscripciones.value = data;
  } finally {
    loading.value = false;
  }
}

function resetFiltros() {
  filtros.value = { tipo: null, estado: null, desde: null, hasta: null };
  loadSuscripciones();
}

async function filtrarSuscripciones() {
  loading.value = true;
  try {
    const { data } = await api.get("/admin/suscripciones", {
      params: filtros.value,
    });
    suscripciones.value = data;
  } finally {
    loading.value = false;
  }
}

async function exportarExcel() {
  try {
    Loading.show({
      spinnerColor: "deep-purple-5",
      message: "Generando Excel...",
    });
    const params = new URLSearchParams(filtros.value).toString();
    const res = await api.get(`/admin/suscripciones/export?${params}`, {
      responseType: "blob",
    });
    const blob = new Blob([res.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "suscripciones.xlsx";
    link.click();
  } catch {
    $q.notify({ type: "negative", message: "❌ Error exportando Excel" });
  } finally {
    Loading.hide();
  }
}

function verPerfil(idusuario) {
  router.push(`/admin/usuarios/${idusuario}/perfil`);
}

// ======================
// 📊 RESUMEN GENERAL
// ======================
const totalSuscripciones = computed(() => suscripciones.value.length);
const totalActivas = computed(
  () => suscripciones.value.filter((s) => s.estado === "ACTIVA").length
);
const totalExpiradas = computed(
  () => suscripciones.value.filter((s) => s.estado === "EXPIRADA").length
);
const ingresosTotales = computed(() =>
  suscripciones.value.reduce((s, v) => s + parseFloat(v.total || 0), 0)
);

const resumen = computed(() => [
  {
    label: "Total Suscripciones",
    value: totalSuscripciones.value,
    color: "text-light-blue-4",
  },
  { label: "Activas", value: totalActivas.value, color: "text-positive" },
  { label: "Expiradas", value: totalExpiradas.value, color: "text-negative" },
  {
    label: "Ingresos Totales (Bs.)",
    value: ingresosTotales.value.toFixed(2),
    color: "text-amber-4",
  },
]);

// ======================
// 📈 GRÁFICAS
// ======================
// ======================
// 📈 GRÁFICA TEMPORAL CON RANGO DE FECHAS
// ======================
const modoTiempo = ref("mes"); // 'dia', 'mes' o 'año'

// agrupa las suscripciones por período, dentro del rango seleccionado
const chartDataTemporal = computed(() => {
  const grupos = {};

  // si el usuario puso fechas, filtramos
  const desde = filtros.value.desde ? new Date(filtros.value.desde) : null;
  const hasta = filtros.value.hasta ? new Date(filtros.value.hasta) : null;

  suscripciones.value.forEach((s) => {
    const fecha = new Date(s.fecha_inicio);
    // filtrar por rango
    if (desde && fecha < desde) return;
    if (hasta && fecha > hasta) return;

    // clave de agrupación
    let key;
    if (modoTiempo.value === "dia") {
      key = fecha.toLocaleDateString("es-BO", {
        day: "2-digit",
        month: "short",
      });
    } else if (modoTiempo.value === "mes") {
      key = fecha.toLocaleDateString("es-BO", {
        month: "short",
        year: "numeric",
      });
    } else {
      key = fecha.getFullYear();
    }

    grupos[key] = (grupos[key] || 0) + 1;
  });

  return Object.entries(grupos)
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
    .map(([periodo, total]) => ({ periodo, total }));
});

// serie del gráfico
const seriesTemporal = computed(() => [
  {
    name: "Suscripciones",
    data: chartDataTemporal.value.map((d) => d.total),
  },
]);

// opciones visuales adaptadas
const chartOptionsTemporal = computed(() => ({
  chart: {
    type: modoTiempo.value === "año" ? "bar" : "line",
    foreColor: "#fff",
    background: "transparent",
    toolbar: { show: false },
    animations: { enabled: true, easing: "easeinout", speed: 700 },
  },
  stroke: {
    curve: "smooth",
    width: modoTiempo.value === "año" ? 0 : 4,
  },
  colors: ["#b86cff"],
  fill: {
    type: modoTiempo.value === "año" ? "solid" : "gradient",
    gradient: {
      shade: "dark",
      type: "vertical",
      gradientToColors: ["#00eaff"],
      opacityFrom: 0.9,
      opacityTo: 0.4,
      stops: [0, 90, 100],
    },
  },
  plotOptions: {
    bar: {
      columnWidth: modoTiempo.value === "año" ? "40%" : "60%",
      borderRadius: 8,
    },
  },
  dataLabels: {
    enabled: true,
    style: { colors: ["#fff"], fontSize: "13px", fontWeight: 700 },
  },
  grid: {
    borderColor: "rgba(255,255,255,0.1)",
    strokeDashArray: 5,
  },
  xaxis: {
    categories: chartDataTemporal.value.map((d) => d.periodo),
    labels: { style: { colors: "#d0c4ff", fontWeight: 600 } },
  },
  yaxis: {
    title: {
      text: "Cantidad de suscripciones",
      style: { color: "#bdaaff", fontWeight: "bold" },
    },
    labels: { style: { colors: "#bdaaff" } },
  },
  tooltip: {
    theme: "dark",
    y: { formatter: (v) => `${v} suscripciones` },
  },
  legend: {
    position: "top",
    labels: { colors: "#fff" },
  },
}));

function movingAverage(data, n) {
  return data.map((_, i, arr) =>
    i < n - 1
      ? null
      : arr.slice(i - n + 1, i + 1).reduce((a, b) => a + b, 0) / n
  );
}

const seriesWeekly = computed(() => [
  {
    name: "Suscripciones Nuevas",
    type: "column",
    data: chartDataWeekly.value.map((d) => d.total),
  },
  {
    name: "Promedio Móvil",
    type: "line",
    data: movingAverage(
      chartDataWeekly.value.map((d) => d.total),
      2
    ),
  },
]);

const chartOptionsWeekly = computed(() => ({
  chart: {
    foreColor: "#fff",
    background: "transparent",
    toolbar: { show: false },
  },
  stroke: { width: [0, 3], curve: "smooth" },
  colors: ["#9b5cff", "#00c6ff"],
  plotOptions: { bar: { columnWidth: "50%", borderRadius: 6 } },
  dataLabels: { enabled: false },
  grid: { borderColor: "rgba(255,255,255,0.15)", strokeDashArray: 5 },
  xaxis: {
    categories: chartDataWeekly.value.map((d) => d.semana),
    labels: { rotate: -45 },
  },
  yaxis: {
    title: { text: "Cantidad de suscripciones", style: { color: "#bdaaff" } },
  },
  legend: { position: "top", labels: { colors: "#fff" } },
  tooltip: { theme: "dark", y: { formatter: (val) => `${val} suscripciones` } },
}));

const chartDataTipo = computed(() => {
  const tipos = {};
  suscripciones.value.forEach((s) => {
    if (!s.tipo) return;
    tipos[s.tipo] = (tipos[s.tipo] || 0) + 1;
  });
  return Object.entries(tipos).map(([tipo, cantidad]) => ({ tipo, cantidad }));
});

const seriesTipo = computed(() => chartDataTipo.value.map((d) => d.cantidad));
const chartOptionsTipo = computed(() => ({
  chart: { type: "donut", foreColor: "#fff", background: "transparent" },
  labels: chartDataTipo.value.map((d) => d.tipo),
  colors: ["#9b5cff", "#c47aff", "#7a00ff"],
  legend: { position: "bottom", labels: { colors: "#fff" } },
  dataLabels: {
    enabled: true,
    style: { colors: ["#fff"], fontSize: "14px", fontWeight: 700 },
  },
  tooltip: { theme: "dark", y: { formatter: (val) => `${val} suscripciones` } },
  plotOptions: {
    pie: {
      donut: {
        size: "70%",
        labels: {
          show: true,
          total: {
            show: true,
            label: "Total",
            color: "#d9c7ff",
            formatter: () =>
              chartDataTipo.value.reduce((sum, d) => sum + d.cantidad, 0),
          },
        },
      },
    },
  },
}));

const chartDataIngresos = computed(() => {
  const totales = {};
  suscripciones.value.forEach((s) => {
    if (!s.tipo) return;
    totales[s.tipo] = (totales[s.tipo] || 0) + parseFloat(s.total || 0);
  });
  return Object.entries(totales).map(([tipo, total]) => ({ tipo, total }));
});

const seriesIngresos = computed(() => [
  { name: "Ingresos (Bs.)", data: chartDataIngresos.value.map((d) => d.total) },
]);

const chartOptionsIngresos = computed(() => ({
  chart: { foreColor: "#fff", background: "transparent" },
  plotOptions: {
    bar: {
      horizontal: true,
      borderRadius: 8,
      distributed: true,
      dataLabels: { position: "center" },
    },
  },
  colors: ["#9b5cff", "#b86cff", "#7a00ff"],
  dataLabels: {
    enabled: true,
    style: { colors: ["#fff"], fontWeight: "bold" },
    formatter: (val) => `Bs ${val}`,
  },
  xaxis: {
    categories: chartDataIngresos.value.map((d) => d.tipo),
    labels: { style: { colors: "#d8cfff" } },
  },
  grid: { borderColor: "rgba(255,255,255,0.15)" },
  tooltip: { theme: "dark", y: { formatter: (val) => `Bs ${val.toFixed(2)}` } },
}));

onMounted(() => loadSuscripciones());
</script>

<style scoped>
.suscripciones-admin-page {
  background: radial-gradient(circle at 25% 25%, #3b0a73, #1a0033 85%);
  min-height: 100vh;
  color: white;
  font-family: "Segoe UI", sans-serif;
}

/* ✨ Título */
.titulo-luminoso {
  background: linear-gradient(90deg, #d2a8ff, #b86cff, #ff6bff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 25px rgba(184, 58, 255, 0.7);
}

/* 🧾 Card filtros */
.filtros-card {
  background: linear-gradient(
    145deg,
    rgba(55, 0, 120, 0.8),
    rgba(20, 0, 60, 0.95)
  );
  border-radius: 18px;
  box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.08),
    0 0 25px rgba(162, 0, 220, 0.25);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

/* 🔳 Campos (inputs y selects) */
:deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.12) !important;
  border-radius: 10px !important;
  color: white !important;
  font-size: 16px !important;
  font-weight: 600 !important;
}
:deep(.q-field__control:hover) {
  background: rgba(255, 255, 255, 0.22) !important;
}

/* Etiquetas del campo */
:deep(.q-field__label) {
  color: #ffffff !important;
  font-size: 15px !important;
  font-weight: 700 !important;
}

/* Texto del menú desplegable */
:deep(.q-item__label) {
  color: white !important;
  font-size: 16px !important;
  font-weight: 500 !important;
}

/* Placeholder (texto cuando está vacío) */
:deep(input::placeholder) {
  color: rgba(255, 255, 255, 0.8) !important;
  font-size: 15px;
}

/* 🔘 Botón FILTRAR */
:deep(.q-btn[color="deep-purple-6"]) {
  background: linear-gradient(90deg, #8a2eff, #5e00c9) !important;
  color: white !important;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.5px;
  box-shadow: 0 3px 10px rgba(160, 60, 255, 0.4);
  transition: all 0.2s ease;
}
:deep(.q-btn[color="deep-purple-6"]:hover) {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(180, 100, 255, 0.6);
}

/* 🔘 Botón LIMPIAR */
:deep(.q-btn[color="grey-5"]) {
  background: rgba(255, 255, 255, 0.15) !important;
  color: white !important;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  transition: background 0.2s;
}
:deep(.q-btn[color="grey-5"]:hover) {
  background: rgba(255, 255, 255, 0.25) !important;
}

/* 💛 Botón EXPORTAR EXCEL */
:deep(.q-btn[color="amber-7"]) {
  background: linear-gradient(90deg, #ffc107, #ff9800) !important;
  color: #2a0033 !important;
  font-size: 15px;
  font-weight: 800;
  border-radius: 10px;
  box-shadow: 0 3px 12px rgba(255, 200, 50, 0.5);
  transition: all 0.25s ease-in-out;
}
:deep(.q-btn[color="amber-7"]:hover) {
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(255, 210, 100, 0.6);
  filter: brightness(1.1);
}

/* 📋 Tabla */
.bg-card {
  background: rgba(25, 25, 59, 0.45);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

/* 🧩 Tarjetas resumen */
.resumen-card {
  background: linear-gradient(
    160deg,
    rgba(120, 0, 255, 0.3),
    rgba(40, 0, 100, 0.5)
  );
  border-radius: 15px;
  box-shadow: 0 0 20px rgba(184, 58, 255, 0.3);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
