<template>
  <q-page class="q-pa-md bg-grey-2">
    <!-- 🔹 Encabezado -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5 text-primary text-weight-bold">
        {{
          modoVista === "pendientes"
            ? "Pagos Pendientes a Profesores"
            : "Pagos Completados"
        }}
      </div>

      <!-- 🟢 Toggle vista -->
      <div class="row items-center q-gutter-sm">
        <q-btn
          color="green-6"
          glossy
          icon="file_download"
          label="Exportar Excel"
          @click="exportToExcel"
        />
        <q-btn-toggle
          v-model="modoVista"
          color="primary"
          rounded
          unelevated
          glossy
          toggle-color="primary"
          :options="[
            {
              label: 'Pendientes',
              value: 'pendientes',
              icon: 'hourglass_empty',
            },
            { label: 'Pagados', value: 'pagados', icon: 'paid' },
          ]"
          @update:model-value="loadPagos"
        />
      </div>
    </div>

    <!-- 🔍 Buscador -->
    <div class="row justify-between items-center q-mb-md">
      <q-input
        v-model="filtro"
        placeholder="Buscar por profesor..."
        dense
        outlined
        debounce="300"
        clearable
        class="col-12 col-md-4"
      >
        <template #prepend><q-icon name="search" /></template>
      </q-input>

      <q-btn
        color="primary"
        icon="refresh"
        label="Actualizar"
        @click="loadPagos"
        :loading="loading"
        glossy
      />
    </div>

    <!-- 📋 Tabla -->
    <q-card flat bordered class="shadow-2">
      <q-table
        :rows="pagosFiltrados"
        :columns="columns"
        row-key="idpago"
        :loading="loading"
        flat
        bordered
        separator="horizontal"
        no-data-label="No hay registros en esta categoría"
        :pagination="{ rowsPerPage: 5 }"
      >
        <!-- ✅ Estado con color -->
        <template #body-cell-estado="props">
          <q-td :props="props" align="center">
            <q-chip
              :color="getEstadoColor(props.row.estado)"
              text-color="white"
              dense
              class="text-weight-bold"
            >
              {{ props.row.estado.toUpperCase() }}
            </q-chip>
          </q-td>
        </template>

        <!-- ⚙️ Acciones -->
        <template #body-cell-acciones="props">
          <q-td :props="props" align="center">
            <div class="row justify-center q-gutter-sm">
              <!-- 🟢 Botón PAGAR -->
              <q-btn
                v-if="
                  modoVista === 'pendientes' && props.row.estado === 'pendiente'
                "
                color="positive"
                label="Pagar"
                icon="payments"
                glossy
                unelevated
                @click="abrirDialogoPago(props.row)"
              >
                <q-tooltip>Registrar pago y generar factura</q-tooltip>
              </q-btn>

              <!-- 📄 Botón VER FACTURA -->
              <q-btn
                v-if="modoVista === 'pagados' && props.row.factura?.idfactura"
                color="primary"
                label="Factura"
                icon="receipt_long"
                glossy
                unelevated
                @click="goFactura(props.row.factura.idfactura)"
              >
                <q-tooltip>Ver factura generada</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- 💳 Modal confirmar pago -->
    <q-dialog v-model="dialogPago">
      <q-card style="min-width: 400px">
        <!-- Encabezado -->
        <q-card-section class="bg-positive text-white">
          <div class="text-h6">Confirmar Pago al Profesor</div>
        </q-card-section>

        <!-- Contenido -->
        <q-card-section>
          <div>
            <b>Profesor:</b>
            {{ pagoSeleccionado?.profesor?.usuario?.nombres || "Desconocido" }}
            {{ pagoSeleccionado?.profesor?.usuario?.apellidos || "" }}
          </div>
          <div><b>Monto:</b> {{ pagoSeleccionado?.monto }} Bs</div>
          <div>
            <b>Curso:</b>
            {{ pagoSeleccionado?.licencia?.curso?.nombre || "Sin curso" }}
          </div>

          <q-separator class="q-my-md" />

          <q-select
            v-model="metodoPago"
            :options="metodosPago"
            label="Método de Pago"
            option-label="nombre"
            option-value="idtipo_pago"
            outlined
            dense
            emit-value
            map-options
            clearable
            behavior="menu"
            :loading="loadingMetodos"
          >
            <template #no-option>
              <q-item>
                <q-item-section class="text-grey">
                  No hay métodos de pago disponibles
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <q-input
            v-if="metodoPago"
            v-model="referencia"
            label="Referencia / Código (opcional)"
            outlined
            dense
            class="q-mt-md"
          />
        </q-card-section>

        <!-- Acciones -->
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            color="positive"
            label="Confirmar Pago"
            icon="check"
            :loading="loadingPago"
            @click="confirmarPago"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { api } from "boot/axios";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const $q = useQuasar();
const router = useRouter();

const pagos = ref([]);
const loading = ref(false);
const filtro = ref("");
const dialogPago = ref(false);
const pagoSeleccionado = ref(null);
const metodoPago = ref(null);
const referencia = ref("");
const loadingPago = ref(false);
const modoVista = ref("pendientes");
const metodosPago = ref([]);
const loadingMetodos = ref(false);

// 📋 Columnas de tabla
const columns = [
  {
    name: "idpago",
    label: "ID",
    field: "idpago",
    align: "left",
    sortable: true,
  },
  {
    name: "profesor",
    label: "Profesor",
    field: (row) =>
      row.profesor?.usuario?.nombres
        ? `${row.profesor.usuario.nombres} ${row.profesor.usuario.apellidos}`
        : "Desconocido",
    sortable: true,
  },
  { name: "monto", label: "Monto (Bs)", field: "monto", align: "right" },
  { name: "estado", label: "Estado", align: "center", field: "estado" },
  {
    name: "fecha_generacion",
    label: "Fecha Generación",
    field: (row) => formatearFecha(row.fecha_generacion),
    align: "center",
  },
  { name: "acciones", label: "Acciones", align: "center" },
];

// 🎨 Colores por estado
function getEstadoColor(estado) {
  switch (estado) {
    case "pagado":
      return "green-6";
    case "pendiente":
      return "orange-6";
    case "cancelado":
      return "red-6";
    default:
      return "grey-6";
  }
}

// 🔄 Cargar pagos según vista
async function loadPagos() {
  loading.value = true;
  try {
    const endpoint =
      modoVista.value === "pendientes"
        ? "/admin/pagos-profesores/pendientes"
        : "/admin/pagos-profesores";

    const { data } = await api.get(endpoint);
    pagos.value =
      modoVista.value === "pagados"
        ? (data.data || []).filter((p) => p.estado === "pagado")
        : data.data || [];
  } catch {
    $q.notify({ type: "negative", message: "Error al cargar pagos" });
  } finally {
    loading.value = false;
  }
}

// 🔄 Cargar métodos de pago desde la BD
async function loadMetodosPago() {
  loadingMetodos.value = true;
  try {
    const { data } = await api.get("/admin/pagos-profesores/metodos-pago");
    metodosPago.value = data.data || [];
  } catch {
    $q.notify({ type: "negative", message: "Error al cargar métodos de pago" });
  } finally {
    loadingMetodos.value = false;
  }
}

// 🔍 Filtrado
const pagosFiltrados = computed(() =>
  pagos.value.filter((p) =>
    filtro.value
      ? (p.profesor?.usuario?.nombres || "")
          .toLowerCase()
          .includes(filtro.value.toLowerCase())
      : true
  )
);

// 💬 Abrir modal de pago
function abrirDialogoPago(pago) {
  pagoSeleccionado.value = pago;
  metodoPago.value = null;
  referencia.value = "";
  dialogPago.value = true;
  loadMetodosPago();
}

// 💳 Confirmar pago
async function confirmarPago() {
  if (!pagoSeleccionado.value || !metodoPago.value) {
    return $q.notify({
      type: "warning",
      message: "Selecciona un método de pago antes de confirmar.",
    });
  }
  loadingPago.value = true;
  try {
    await api.patch(
      `/admin/pagos-profesores/${pagoSeleccionado.value.idpago}/confirmar`,
      {
        idtipo_pago: metodoPago.value,
        referencia: referencia.value,
      }
    );
    $q.notify({ type: "positive", message: "Pago confirmado correctamente" });
    dialogPago.value = false;
    loadPagos();
  } catch {
    $q.notify({ type: "negative", message: "Error al confirmar el pago" });
  } finally {
    loadingPago.value = false;
  }
}

// 🧾 Ir a factura
function goFactura(idfactura) {
  router.push({ name: "factura", params: { id: idfactura } });
}

// 📅 Formatear fecha
function formatearFecha(fecha) {
  if (!fecha) return "-";
  const d = new Date(fecha);
  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1
  ).padStart(2, "0")}/${d.getFullYear()}`;
}

// 💾 Exportar a Excel
function exportToExcel() {
  if (!pagosFiltrados.value.length) {
    return $q.notify({
      type: "warning",
      message: "No hay datos para exportar.",
    });
  }

  const dataToExport = pagosFiltrados.value.map((p) => ({
    ID: p.idpago,
    Profesor:
      `${p.profesor?.usuario?.nombres || ""} ${
        p.profesor?.usuario?.apellidos || ""
      }` || "Desconocido",
    Monto: `${p.monto} Bs`,
    Estado: p.estado.toUpperCase(),
    "Fecha Generación": formatearFecha(p.fecha_generacion),
  }));

  const ws = XLSX.utils.json_to_sheet(dataToExport);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Pagos");
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([buf]), "Pagos_Profesores.xlsx");

  $q.notify({
    type: "positive",
    message: "Archivo Excel exportado con éxito.",
  });
}

onMounted(loadPagos);
</script>

<style scoped>
.text-h5 {
  font-weight: 600;
}
.q-table {
  border-radius: 12px;
  overflow: hidden;
}
</style>
