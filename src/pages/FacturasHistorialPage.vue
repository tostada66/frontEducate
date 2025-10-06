<!-- src/pages/SuscripcionesHistorialPage.vue -->
<template>
  <q-page class="q-pa-md bg-grey-1">
    <div class="text-h5 text-primary text-center q-mb-lg">
      📜 Historial de Suscripciones
    </div>

    <!-- Tabla de suscripciones -->
    <q-card v-if="suscripciones.length" flat bordered class="shadow-2">
      <q-table
        :rows="suscripciones"
        :columns="columns"
        row-key="idsus"
        flat
        bordered
        separator="horizontal"
        :pagination="{ rowsPerPage: 5 }"
      >
        <!-- Estado -->
        <template v-slot:body-cell-estado="props">
          <q-td :props="props">
            <q-chip
              dense
              :color="props.row.estado ? 'green-6' : 'red-6'"
              text-color="white"
            >
              {{ props.row.estado ? "ACTIVA" : "INACTIVA" }}
            </q-chip>
          </q-td>
        </template>

        <!-- Fecha inicio -->
        <template v-slot:body-cell-fecha_inicio="props">
          <q-td :props="props">
            {{ formatDate(props.row.fecha_inicio) }}
          </q-td>
        </template>

        <!-- Fecha fin -->
        <template v-slot:body-cell-fecha_fin="props">
          <q-td :props="props">
            {{ formatDate(props.row.fecha_fin) }}
          </q-td>
        </template>

        <!-- Acciones -->
        <template v-slot:body-cell-acciones="props">
          <q-td :props="props">
            <q-btn
              v-if="props.row.factura?.idfactura"
              flat
              round
              color="primary"
              icon="receipt_long"
              @click="goFactura(props.row.factura.idfactura)"
            >
              <q-tooltip>Ver Factura</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Si no hay suscripciones -->
    <div v-else class="text-center text-grey-7 q-mt-lg">
      <q-icon name="info" size="32px" class="q-mb-sm" />
      <div>No tienes suscripciones registradas aún.</div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { api } from "boot/axios";
import { useRouter } from "vue-router";

const router = useRouter();
const suscripciones = ref([]);

const columns = [
  {
    name: "plan",
    label: "Plan",
    align: "left",
    field: (row) => row.plan?.nombre || "—",
  },
  { name: "estado", label: "Estado", align: "center", field: "estado" },
  {
    name: "fecha_inicio",
    label: "Fecha inicio",
    align: "center",
    field: "fecha_inicio",
  },
  {
    name: "fecha_fin",
    label: "Fecha fin",
    align: "center",
    field: "fecha_fin",
  },
  { name: "acciones", label: "Acciones", align: "center" },
];

function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("es-BO");
}

async function loadSuscripciones() {
  try {
    const { data } = await api.get("/suscripciones");
    suscripciones.value = data;
  } catch (err) {
    console.error("❌ Error cargando suscripciones:", err);
  }
}

function goFactura(idfactura) {
  router.push({ name: "factura", params: { id: idfactura } });
}

onMounted(() => {
  loadSuscripciones();
});
</script>

<style scoped>
.q-table {
  border-radius: 12px;
  overflow: hidden;
}
</style>
