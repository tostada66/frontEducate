<template>
  <q-page class="q-pa-md bg-grey-1">
    <div class="text-h5 text-primary text-center q-mb-lg">
      📜 Historial de Suscripciones
    </div>

    <!-- Si hay suscripciones -->
    <q-card v-if="subscriptions.length" flat bordered class="shadow-2">
      <q-table
        :rows="subscriptions"
        :columns="columns"
        row-key="idsus"
        flat
        bordered
        separator="horizontal"
        :pagination="{ rowsPerPage: 5 }"
      >
        <!-- Estado con chip -->
        <template v-slot:body-cell-estado="props">
          <q-td :props="props">
            <q-chip
              :color="getEstadoColor(props.row.estado)"
              text-color="white"
              dense
            >
              {{
                props.row.estado == 1 ||
                props.row.estado === true ||
                props.row.estado === "ACTIVA"
                  ? "ACTIVA"
                  : "EXPIRADA"
              }}
            </q-chip>
          </q-td>
        </template>

        <!-- Plan -->
        <template v-slot:body-cell-plan="props">
          <q-td :props="props">
            {{ props.row.plan?.nombre || "—" }}
          </q-td>
        </template>

        <!-- Fechas -->
        <template v-slot:body-cell-fecha_inicio="props">
          <q-td :props="props">
            {{ formatDate(props.row.fecha_inicio) }}
          </q-td>
        </template>
        <template v-slot:body-cell-fecha_fin="props">
          <q-td :props="props">
            {{ formatDate(props.row.fecha_fin) }}
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

const subscriptions = ref([]);

// columnas de la tabla
const columns = [
  { name: "plan", label: "Plan", align: "left", field: "plan" },
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
];

// helpers
function getEstadoColor(estado) {
  return estado == 1 || estado === true || estado === "ACTIVA"
    ? "green"
    : "red";
}

function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("es-BO");
}

// cargar historial desde backend
async function loadHistorial() {
  try {
    const { data } = await api.get("/suscripciones");
    subscriptions.value = data;
  } catch (err) {
    console.error("❌ Error cargando historial:", err);
  }
}

onMounted(() => {
  loadHistorial();
});
</script>

<style scoped>
.q-table {
  border-radius: 12px;
  overflow: hidden;
}
</style>
