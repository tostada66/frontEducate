<template>
  <q-page class="q-pa-md bg-grey-1">
    <!-- 🔹 Encabezado -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5 text-primary">
        {{
          isAdmin
            ? "📜 Historial General de Facturas"
            : isProfessor
            ? "💰 Pagos Recibidos"
            : "📦 Mis Facturas de Suscripción"
        }}
      </div>

      <div class="row items-center q-gutter-sm">
        <!-- 🔹 Filtro solo visible para admin -->
        <q-select
          v-if="isAdmin"
          outlined
          dense
          :options="filtrosAdmin"
          v-model="filtroTipo"
          style="width: 240px"
          label="Filtrar por usuario"
          emit-value
          map-options
        />

        <!-- ✅ Botón Excel solo para Admin -->
        <q-btn
          v-if="isAdmin"
          color="green-5"
          glossy
          icon="file_download"
          label="Exportar Excel"
          @click="exportToExcel"
        />
      </div>
    </div>

    <!-- 🧾 Tabla -->
    <q-card v-if="facturasFiltradas.length" flat bordered class="shadow-3">
      <q-table
        :rows="facturasFiltradas"
        :columns="columns"
        row-key="idfactura"
        separator="horizontal"
        :pagination="{ rowsPerPage: 6 }"
      >
        <!-- Tipo -->
        <template v-slot:body-cell-tipo="props">
          <q-td :props="props">
            <q-chip dense :color="colorTipo(props.row.tipo)" text-color="white">
              {{ textoTipo(props.row.tipo) }}
            </q-chip>
          </q-td>
        </template>

        <!-- Usuario (solo admin) -->
        <template v-if="isAdmin" v-slot:body-cell-usuario="props">
          <q-td :props="props">
            <div class="row items-center">
              <q-avatar size="28px" class="q-mr-sm">
                <img :src="getFotoUsuario(props.row)" alt="Foto" />
              </q-avatar>
              {{ getNombreUsuario(props.row) }}
            </div>
          </q-td>
        </template>

        <!-- Detalle (Plan o Curso) -->
        <template v-slot:body-cell-detalle="props">
          <q-td :props="props">
            {{
              props.row.tipo === "suscripcion"
                ? props.row.plan?.nombre || "Plan no disponible"
                : props.row.pago_profesor?.licencia?.curso?.nombre ||
                  props.row.licencia?.curso?.nombre ||
                  "—"
            }}
          </q-td>
        </template>

        <!-- Total -->
        <template v-slot:body-cell-total="props">
          <q-td :props="props" class="text-bold text-positive">
            Bs. {{ props.row.total }}
          </q-td>
        </template>

        <!-- Estado -->
        <template v-slot:body-cell-estado="props">
          <q-td :props="props">
            <q-chip
              dense
              :color="props.row.estado === 'pagada' ? 'green' : 'orange'"
              text-color="white"
            >
              {{ props.row.estado?.toUpperCase() }}
            </q-chip>
          </q-td>
        </template>

        <!-- Fecha -->
        <template v-slot:body-cell-fecha="props">
          <q-td :props="props">
            {{ formatFecha(props.row.fecha) }}
          </q-td>
        </template>

        <!-- Acciones -->
        <template v-slot:body-cell-acciones="props">
          <q-td :props="props" class="text-center">
            <q-btn
              flat
              round
              color="primary"
              icon="visibility"
              @click="goFactura(props.row.idfactura)"
            >
              <q-tooltip>Ver Detalle</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              color="red"
              icon="picture_as_pdf"
              @click="downloadPDF(props.row.idfactura)"
            >
              <q-tooltip>Descargar PDF</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- 📭 Sin resultados -->
    <div v-else class="text-center text-grey q-mt-lg">
      <q-icon name="info" size="32px" class="q-mb-sm" />
      <div>
        {{
          isAdmin
            ? "No existen facturas registradas."
            : isProfessor
            ? "Aún no tienes pagos registrados."
            : "Aún no tienes facturas de suscripción."
        }}
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { api } from "boot/axios";
import { useRouter } from "vue-router";
import { useAuthStore } from "stores/auth";
import { useQuasar } from "quasar";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const router = useRouter();
const $q = useQuasar();
const auth = useAuthStore();

const facturas = ref([]);
const filtroTipo = ref("todos");

// 🧠 Roles
const isAdmin = computed(() => auth.isAdmin);
const isProfessor = computed(() => auth.isProfessor);
const isStudent = computed(() => auth.isStudent);

// 🔽 Filtros admin
const filtrosAdmin = [
  { label: "Todos", value: "todos" },
  { label: "Alumnos", value: "alumnos" },
  { label: "Profesores", value: "profesores" },
];

// 🧾 Columnas
const columns = computed(() => {
  const cols = [
    { name: "tipo", label: "Tipo", align: "center" },
    {
      name: "detalle",
      label: isProfessor.value ? "Curso" : "Plan / Curso",
      align: "left",
    },
    { name: "total", label: "Total", align: "center" },
    { name: "estado", label: "Estado", align: "center" },
    { name: "fecha", label: "Fecha", align: "center" },
  ];

  if (isAdmin.value) {
    cols.splice(1, 0, { name: "usuario", label: "Usuario", align: "left" });
  }

  cols.push({ name: "acciones", label: "Acciones", align: "center" });
  return cols;
});

// 🎨 Chip colores
function colorTipo(tipo) {
  if (tipo === "suscripcion") return "primary";
  if (tipo === "pago_profesor") return "green";
  if (tipo === "licencia") return "orange";
  return "grey";
}
function textoTipo(tipo) {
  return (
    {
      suscripcion: "Suscripción",
      pago_profesor: "Pago a Profesor",
      licencia: "Licencia",
    }[tipo] || "Desconocido"
  );
}

// 👤 Nombre y foto
function getNombreUsuario(row) {
  if (row.tipo === "pago_profesor") {
    return (
      row.pago_profesor?.profesor?.usuario?.nombres +
        " " +
        row.pago_profesor?.profesor?.usuario?.apellidos || "-"
    );
  }
  return (
    row.usuario?.nombres + " " + row.usuario?.apellidos ||
    row.nombre_factura ||
    "-"
  );
}
function getFotoUsuario(row) {
  if (row.tipo === "pago_profesor") {
    return row.pago_profesor?.profesor?.usuario?.foto || "/default-user.png";
  }
  return row.usuario?.foto || "/default-user.png";
}

// 📅 Fecha
function formatFecha(fecha) {
  if (!fecha) return "—";
  return new Date(fecha).toLocaleString("es-BO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

// 🔗 Navegar
function goFactura(idfactura) {
  router.push({ name: "factura", params: { id: idfactura } });
}

// 📥 Descargar PDF
async function downloadPDF(idfactura) {
  try {
    const response = await api.get(`/facturas/${idfactura}/pdf`, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `factura_${idfactura}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    console.error("❌ Error descargando PDF:", err);
  }
}

// 🔄 Cargar facturas
async function loadFacturas() {
  try {
    const { data } = await api.get("/facturas");
    facturas.value = data.data || [];
  } catch (err) {
    console.error("❌ Error cargando facturas:", err);
  }
}

// 📊 Filtrar
const facturasFiltradas = computed(() => {
  if (!isAdmin.value) return facturas.value;
  if (filtroTipo.value === "profesores") {
    return facturas.value.filter((f) => f.tipo === "pago_profesor");
  }
  if (filtroTipo.value === "alumnos") {
    return facturas.value.filter((f) =>
      ["suscripcion", "licencia"].includes(f.tipo)
    );
  }
  return facturas.value;
});

// ✅ Exportar Excel (solo admin)
async function exportToExcel() {
  try {
    const dataToExport = facturasFiltradas.value.map((f) => ({
      Tipo: textoTipo(f.tipo),
      Usuario: getNombreUsuario(f),
      Detalle:
        f.tipo === "suscripcion"
          ? f.plan?.nombre || "—"
          : f.pago_profesor?.licencia?.curso?.nombre ||
            f.licencia?.curso?.nombre ||
            "—",
      Total: `Bs. ${f.total}`,
      Estado: f.estado?.toUpperCase(),
      Fecha: formatFecha(f.fecha),
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Facturas");

    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buf], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    saveAs(blob, "Historial_Facturas.xlsx");

    $q.notify({
      type: "positive",
      message: "Archivo Excel exportado correctamente 📊",
    });
  } catch (error) {
    console.error("❌ Error exportando Excel:", error);
    $q.notify({ type: "negative", message: "Error al exportar Excel" });
  }
}

onMounted(loadFacturas);
</script>

<style scoped>
.q-table {
  border-radius: 12px;
  overflow: hidden;
}
</style>
