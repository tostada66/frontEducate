<template>
  <q-page class="q-pa-lg planes-page relative-position">
    <!-- 🔹 Fondo dinámico -->
    <div class="animated-bg"></div>

    <!-- 🔹 Toolbar igual que la portada -->
    <q-header class="bg-fondo text-white q-pa-md shadow-2">
      <q-toolbar class="justify-between">
        <!-- Logo -->
        <div
          class="text-h6 text-bold cursor-pointer"
          @click="$router.push({ name: 'portada' })"
        >
          EduPlatform
        </div>

        <!-- Menú superior -->
        <div class="row items-center q-gutter-md">
          <q-btn
            flat
            label="Ver Cursos"
            to="/catalogo/cursos"
            class="text-white"
          />
          <q-btn flat label="Planes" to="/suscripciones" class="text-white" />
          <q-btn
            color="positive"
            label="Acceder"
            to="/login"
            rounded
            unelevated
          />
        </div>
      </q-toolbar>
    </q-header>

    <!-- 🔹 Título -->
    <div class="text-h4 text-center text-bold q-mb-sm text-white q-mt-lg">
      Elige tu plan
    </div>
    <div class="text-subtitle1 text-center text-grey-3 q-mb-lg">
      Selecciona el plan que mejor se adapte a tus necesidades de aprendizaje
    </div>

    <!-- 🔹 Grid de planes -->
    <div v-if="!loading" class="row justify-center q-col-gutter-lg q-mb-lg">
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

          <!-- Beneficios -->
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

    <!-- 🔹 Loader -->
    <div v-else class="row justify-center q-mt-lg">
      <q-spinner-dots color="primary" size="40px" />
    </div>

    <!-- 🔹 Botón continuar -->
    <div class="row justify-center q-mt-lg">
      <q-btn
        class="btn-continuar"
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
    const { data } = await api.get("/planes");
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
/* 🔹 Fondo coherente con la portada */
.planes-page {
  background: radial-gradient(circle at 25% 25%, #0a0f1d, #030712 80%);
  min-height: 100vh;
  position: relative;
  padding-bottom: 40px;
  overflow: hidden;
}

/* 🔹 Toolbar igual que portada */
.bg-fondo {
  background-color: #0a0f1d !important;
}

/* 🔹 Fondo dinámico */
.animated-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(
      circle at 30% 30%,
      rgba(0, 120, 255, 0.18),
      transparent 50%
    ),
    radial-gradient(circle at 70% 60%, rgba(255, 0, 120, 0.12), transparent 60%),
    radial-gradient(circle at 50% 80%, rgba(0, 255, 200, 0.1), transparent 50%);
  background-blend-mode: screen;
  filter: blur(85px);
  animation: move-bg 20s ease-in-out infinite alternate;
  z-index: 0;
}

@keyframes move-bg {
  0% {
    transform: scale(1) translate(0, 0);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.08) translate(-2%, -3%);
    opacity: 1;
  }
  100% {
    transform: scale(1) translate(2%, 2%);
    opacity: 0.8;
  }
}

/* 🔹 Ajuste para que el título no quede tapado y más arriba */
.text-h4 {
  margin-top: 80px;
}

/* 🔹 Tarjetas */
.plan-card {
  border-radius: 16px;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  transition: transform 0.25s, box-shadow 0.25s, border 0.25s;
  background-color: rgba(20, 20, 40, 0.95);
  backdrop-filter: blur(12px);
  color: #f5f5f5;
  border: 1px solid rgba(255, 255, 255, 0.05);
}
.plan-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  border-color: rgba(255, 255, 255, 0.08);
}

/* 🔹 Plan seleccionado con tu acento */
.plan-selected {
  border: 3px solid #ff6b6b;
  box-shadow: 0 0 25px rgba(255, 107, 107, 0.7) !important;
  transform: translateY(-8px) scale(1.02);
}

/* 🔹 Beneficios */
.plan-benefits {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
.plan-item {
  align-items: center;
}

/* 🔹 Botón Continuar */
.btn-continuar {
  background: #ff4d6d;
  color: #fff;
  font-weight: 600;
  border: none;
  transition: all 0.3s ease;
  box-shadow: 0 0 15px rgba(255, 77, 109, 0.4);
}
.btn-continuar:hover {
  background: #e63f5d;
  box-shadow: 0 0 25px rgba(255, 77, 109, 0.6);
}
</style>
