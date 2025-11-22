<template>
  <q-page class="q-pa-lg pago-tipos-page relative-position">
    <!-- 🔹 Fondo dinámico con burbujas brillantes -->
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

        <!-- Menú -->
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

    <!-- 🧾 Título -->
    <div class="text-h4 text-center text-bold q-mb-md text-white q-mt-xl">
      Selecciona tu método de pago
    </div>

    <div class="text-subtitle1 text-grey-4 text-center q-mb-xl">
      Estás a punto de suscribirte al plan
      <b>{{ plan?.nombre || "Sin plan seleccionado" }}</b>
    </div>

    <!-- 💳 Opciones de pago -->
    <div
      v-if="!loading"
      class="row q-col-gutter-md justify-center items-stretch"
    >
      <div
        v-for="pago in tiposPago"
        :key="pago.idtipo_pago"
        class="col-12 col-md-4"
      >
        <q-card
          class="pago-card cursor-pointer full-height"
          :class="{
            'pago-selected': selectedPago?.idtipo_pago === pago.idtipo_pago,
          }"
          @click="selectPago(pago)"
        >
          <q-card-section class="text-center">
            <q-icon
              :name="getIcon(pago.nombre)"
              size="56px"
              class="icon-color"
            />
            <div class="text-h6 q-mt-sm text-bold">{{ pago.nombre }}</div>
            <div class="text-subtitle2 text-grey-5">
              {{ pago.descripcion }}
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- ⏳ Loader -->
    <div v-else class="row justify-center q-mt-xl">
      <q-spinner-dots color="primary" size="40px" />
    </div>

    <!-- 🚀 Botón continuar -->
    <div class="row justify-center q-mt-xl">
      <q-btn
        class="btn-continuar"
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
import { api } from "boot/axios";

const router = useRouter();
const suscripcionStore = useSuscripcionStore();

const plan = suscripcionStore.selectedPlan;
const selectedPago = ref(null);
const tiposPago = ref([]);
const loading = ref(false);

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
  suscripcionStore.setTipoPago(selectedPago.value);
  const nombre = selectedPago.value.nombre?.toLowerCase() || "";
  if (nombre.includes("qr")) {
    router.push({ name: "pago-qr" });
  } else if (nombre.includes("tarjeta")) {
    router.push({ name: "pago" });
  } else {
    router.push({ name: "pago" });
  }
}

function getIcon(nombre) {
  if (!nombre) return "payment";
  const n = nombre.toLowerCase();
  if (n.includes("tarjeta")) return "credit_card";
  if (n.includes("qr")) return "qr_code_2";
  if (n.includes("efectivo")) return "attach_money";
  if (n.includes("transferencia")) return "account_balance";
  return "payment";
}

onMounted(() => {
  loadTiposPago();
});
</script>

<style scoped>
/* 🔹 Fondo base */
.pago-tipos-page {
  background: radial-gradient(circle at 25% 25%, #0a0f1d, #030712 80%);
  min-height: 100vh;
  position: relative;
  padding-bottom: 60px;
  overflow: hidden;
}

/* 🔹 Barra superior */
.bg-fondo {
  background-color: #0a0f1d !important;
}

/* 🔹 Fondo con burbujas más claras y vivas */
.animated-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 0;
}

.animated-bg::before,
.animated-bg::after,
.animated-bg .bubble-extra {
  content: "";
  position: absolute;
  width: 340px;
  height: 340px;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.7;
  animation: float 18s ease-in-out infinite alternate;
}

/* 🔸 Burbuja rosada más brillante */
.animated-bg::before {
  top: 15%;
  left: 20%;
  background: radial-gradient(circle, rgba(255, 77, 109, 0.9), transparent 70%);
  animation-delay: 0s;
}

/* 🔸 Burbuja cian viva */
.animated-bg::after {
  bottom: 10%;
  right: 20%;
  background: radial-gradient(circle, rgba(0, 255, 200, 0.8), transparent 70%);
  animation-delay: 3s;
}

/* 🔸 Burbuja violeta más visible */
.animated-bg .bubble-extra {
  top: 40%;
  left: 60%;
  background: radial-gradient(circle, rgba(111, 66, 193, 0.8), transparent 70%);
  animation-delay: 6s;
}

@keyframes float {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 0.8;
  }
  50% {
    transform: translate(30px, -40px) scale(1.1);
    opacity: 1;
  }
  100% {
    transform: translate(-20px, 40px) scale(1);
    opacity: 0.8;
  }
}

/* 🔹 Título */
.text-h4 {
  margin-top: 90px;
}

/* 🔹 Tarjetas con gradiente más luminoso y contraste */
.pago-card {
  border-radius: 18px;
  transition: transform 0.25s, box-shadow 0.25s, background 0.25s;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: linear-gradient(
    145deg,
    rgba(30, 30, 70, 0.98),
    rgba(55, 55, 120, 0.98)
  );
  backdrop-filter: blur(15px);
  color: #f5f5f5;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 4px 20px rgba(255, 255, 255, 0.05);
}
.pago-card:hover {
  transform: translateY(-6px);
  background: linear-gradient(
    145deg,
    rgba(40, 40, 90, 0.98),
    rgba(65, 65, 135, 0.98)
  );
  box-shadow: 0 10px 28px rgba(255, 255, 255, 0.15);
}

/* 🔹 Iconos más vivos */
.icon-color {
  color: #5cc9ff !important;
}

/* 🔹 Tarjeta seleccionada */
.pago-selected {
  border: 2px solid #ff6b6b;
  box-shadow: 0 0 28px rgba(255, 107, 107, 0.85);
  transform: translateY(-8px) scale(1.03);
}

/* 🔹 Botón Continuar (restaurado al rosa original brillante) */
.btn-continuar {
  background: #ff4d6d;
  color: #fff;
  font-weight: 600;
  border: none;
  transition: all 0.3s ease;
  box-shadow: 0 0 20px rgba(255, 77, 109, 0.5);
}
.btn-continuar:hover {
  background: #e63f5d;
  box-shadow: 0 0 30px rgba(255, 77, 109, 0.7);
}
</style>
