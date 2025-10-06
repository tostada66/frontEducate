<template>
  <q-page class="q-pa-lg planes-page">
    <!-- Título -->
    <div class="text-h4 text-center text-bold q-mb-sm text-white">
      Elige tu plan
    </div>
    <div class="text-subtitle1 text-center text-grey-3 q-mb-xl">
      Selecciona el plan que mejor se adapte a tus necesidades de aprendizaje
    </div>

    <!-- Grid de planes -->
    <div v-if="!loading" class="row justify-center q-col-gutter-lg">
      <div
        v-for="plan in planes"
        :key="plan.idplan"
        class="col-12 col-md-4 col-sm-6"
      >
        <q-card
          class="plan-card shadow-4 cursor-pointer column"
          :class="{ 'plan-selected': selectedPlan?.idplan === plan.idplan }"
          @click="selectPlan(plan)"
        >
          <!-- Header -->
          <q-card-section class="text-center">
            <q-icon name="star" size="40px" color="primary" />
            <div class="text-h6 q-mt-sm">{{ plan.nombre }}</div>
            <div class="text-h5 text-bold q-mt-sm text-primary">
              Bs. {{ plan.precio }}
            </div>
            <div class="text-caption text-grey-7">
              {{ plan.duracion }} meses
            </div>
            <div class="text-caption text-grey-6 q-mt-sm">
              {{ plan.descripcion }}
            </div>
          </q-card-section>

          <q-separator />

          <!-- Beneficios estáticos -->
          <q-card-section class="plan-benefits">
            <q-list dense>
              <q-item
                v-for="(beneficio, i) in beneficios"
                :key="i"
                class="plan-item"
              >
                <q-item-section avatar>
                  <q-icon name="check_circle" color="positive" size="20px" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ beneficio }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
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
        color="primary"
        label="Continuar"
        rounded
        glossy
        size="lg"
        :disable="!selectedPlan"
        @click="continuar"
      />
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import { useSuscripcionStore } from "src/stores/suscripcion";
import { api } from "boot/axios";

const $q = useQuasar();
const router = useRouter();
const suscripcionStore = useSuscripcionStore();

const planes = ref([]);
const loading = ref(false);
const selectedPlan = ref(null);

// Beneficios estáticos para todos los planes
const beneficios = [
  "Acceso a todos los cursos",
  "Videos en HD",
  "Certificados oficiales",
  "Soporte por email",
  "Ejercicios prácticos",
];

async function loadPlanes() {
  loading.value = true;
  try {
    const { data } = await api.get("/planes"); // endpoint público
    planes.value = data;
  } catch (err) {
    console.error("❌ Error cargando planes:", err);
    $q.notify({ type: "negative", message: "Error al cargar los planes" });
  } finally {
    loading.value = false;
  }
}

function selectPlan(plan) {
  selectedPlan.value = plan;
}

function continuar() {
  if (!selectedPlan.value) return;

  suscripcionStore.setPlan(selectedPlan.value);

  $q.notify({
    type: "positive",
    message: `Has elegido el plan: ${selectedPlan.value.nombre}`,
  });

  router.push({ name: "pago-tipos" });
}

onMounted(() => {
  loadPlanes();
});
</script>

<style scoped>
.planes-page {
  background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
  min-height: 100vh;
  padding-bottom: 60px;
}
.plan-card {
  border-radius: 16px;
  min-height: 320px;
  display: flex;
  flex-direction: column;
  transition: transform 0.25s, box-shadow 0.25s, border 0.25s;
}
.plan-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.25);
  cursor: pointer;
}
.plan-selected {
  border: 3px solid #ff9800;
  box-shadow: 0 0 20px rgba(255, 152, 0, 0.7) !important;
  transform: translateY(-8px) scale(1.02);
}
.plan-benefits {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
.plan-item {
  align-items: center;
}
</style>
