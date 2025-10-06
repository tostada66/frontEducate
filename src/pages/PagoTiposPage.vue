<template>
  <q-page class="q-pa-lg pago-tipos-page">
    <!-- Título -->
    <div class="text-h5 text-center text-primary q-mb-md">
      Selecciona tu método de pago
    </div>
    <div class="text-subtitle2 text-grey-7 text-center q-mb-xl">
      Estás a punto de suscribirte al plan <b>{{ plan?.nombre }}</b>
    </div>

    <!-- Opciones de pago -->
    <div
      v-if="!loading"
      class="row q-col-gutter-md justify-center items-stretch"
    >
      <div v-for="pago in tiposPago" :key="pago.idpago" class="col-12 col-md-4">
        <q-card
          class="pago-card cursor-pointer full-height"
          :class="{ 'pago-selected': selectedPago?.idpago === pago.idpago }"
          @click="selectPago(pago)"
        >
          <q-card-section class="text-center">
            <q-icon :name="getIcon(pago.nombre)" size="48px" color="primary" />
            <div class="text-h6 q-mt-sm">{{ pago.nombre }}</div>
            <div class="text-subtitle2 text-grey-7">
              {{ pago.descripcion }}
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Loader -->
    <div v-else class="row justify-center q-mt-xl">
      <q-spinner-dots color="primary" size="40px" />
    </div>

    <!-- Botón continuar -->
    <div class="row justify-center q-mt-xl">
      <q-btn
        color="secondary"
        label="Continuar"
        rounded
        glossy
        size="lg"
        :disable="!selectedPago"
        @click="continuar"
      />
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useSuscripcionStore } from "src/stores/suscripcion";
import { api } from "boot/axios"; // 👈 Axios instance

const router = useRouter();
const suscripcionStore = useSuscripcionStore();

const plan = suscripcionStore.selectedPlan; // viene desde página de planes
const selectedPago = ref(null);
const tiposPago = ref([]);
const loading = ref(false);

// Cargar tipos de pago desde API
async function loadTiposPago() {
  loading.value = true;
  try {
    const { data } = await api.get("/tipos-pagos");
    tiposPago.value = data;
  } catch (err) {
    console.error("❌ Error cargando tipos de pago:", err);
  } finally {
    loading.value = false;
  }
}

function selectPago(pago) {
  selectedPago.value = pago;
}

function continuar() {
  if (!selectedPago.value) return;

  // Guardar en store para usar en la página de pago
  suscripcionStore.setTipoPago(selectedPago.value);

  // 👉 Siempre redirige a PagoPage.vue
  router.push({ name: "pago" });
}

// Para mostrar iconos según nombre
function getIcon(nombre) {
  if (!nombre) return "payment";
  const n = nombre.toLowerCase();
  if (n.includes("tarjeta")) return "credit_card";
  if (n.includes("qr")) return "qr_code";
  if (n.includes("efectivo")) return "attach_money";
  return "payment";
}

onMounted(() => {
  loadTiposPago();
});
</script>

<style scoped>
.pago-card {
  border-radius: 16px;
  transition: transform 0.25s, box-shadow 0.25s;
  min-height: 200px; /* 👈 altura mínima igual para simetría */
  display: flex;
  flex-direction: column;
  justify-content: center; /* centra contenido */
}
.pago-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}
.pago-selected {
  border: 2px solid #2196f3;
  box-shadow: 0 0 12px rgba(33, 150, 243, 0.6);
}
</style>
