<template>
  <q-page class="pago-qr-page flex flex-center q-pa-lg">
    <!-- 🔹 Fondo dinámico -->
    <div class="animated-bg"></div>

    <q-card class="q-pa-lg shadow-5 pago-card">
      <!-- 🔹 Título -->
      <div class="text-h5 text-center text-weight-bold titulo-pago q-mb-md">
        EduPlatform - Pago por QR
      </div>

      <!-- 📄 Descripción -->
      <div class="text-center text-grey-8 q-mb-lg">
        Estás a punto de suscribirte al plan
        <b class="text-morado">{{ nombrePlan || "..." }}</b
        ><br />
        por un monto de <b class="text-rosa">Bs {{ precioPlan || 0 }}</b
        >.
      </div>

      <!-- 🧾 Datos de facturación -->
      <q-form @submit.prevent="iniciarPago" class="q-mb-md">
        <q-input
          v-model="nombreFactura"
          label="Nombre completo para la factura"
          outlined
          dense
          class="q-mb-sm"
          :rules="[(val) => !!val || 'El nombre es obligatorio']"
        >
          <template v-slot:prepend>
            <q-icon name="person" color="morado" />
          </template>
        </q-input>

        <q-input
          v-model="nit"
          label="NIT (opcional)"
          outlined
          dense
          class="q-mb-sm"
        >
          <template v-slot:prepend>
            <q-icon name="badge" color="morado" />
          </template>
        </q-input>

        <q-input
          v-model="razonSocial"
          label="Razón social (opcional)"
          outlined
          dense
          class="q-mb-md"
        >
          <template v-slot:prepend>
            <q-icon name="business" color="morado" />
          </template>
        </q-input>

        <!-- 🖼️ Imagen QR -->
        <div class="flex flex-center q-mb-md">
          <div class="qr-container">
            <img :src="qrData" alt="QR de pago" class="qr-image" />
          </div>
        </div>

        <!-- ⏳ Estado -->
        <div v-if="!pagando" class="text-center">
          <q-btn
            label="PAGAR AHORA"
            icon="qr_code_2"
            class="btn-pagar"
            glossy
            unelevated
            type="submit"
            style="width: 100%"
          />
        </div>

        <!-- 🔁 Contador simulando pago -->
        <div v-else class="text-center">
          <q-spinner-dots color="morado" size="40px" />
          <div class="text-subtitle1 text-morado q-mt-sm">
            Procesando pago en {{ contador }} segundos...
          </div>
        </div>
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useSuscripcionStore } from "src/stores/suscripcion";
import { useQuasar } from "quasar";

const $q = useQuasar();
const router = useRouter();
const route = useRoute();
const suscripcionStore = useSuscripcionStore();

// 📦 Datos del plan
const nombrePlan = ref("");
const precioPlan = ref(0);

// 🧾 Datos de factura
const nombreFactura = ref("");
const nit = ref("");
const razonSocial = ref("");

// 📲 Imagen QR
const qrData = ref(
  "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=EduPlatform%20Pago%20QR"
);

// 🔁 Control del proceso de pago
const pagando = ref(false);
const contador = ref(5);
let intervalo = null;

// 🕹️ Iniciar pago simulado
async function iniciarPago() {
  if (!nombreFactura.value) {
    $q.notify({
      type: "warning",
      message: "Debes ingresar el nombre completo.",
    });
    return;
  }

  suscripcionStore.setPaymentData({
    nombre: nombreFactura.value,
    nit: nit.value || null,
    razon_social: razonSocial.value || null,
  });

  pagando.value = true;
  contador.value = 5;

  intervalo = setInterval(() => {
    contador.value--;
    if (contador.value <= 0) {
      clearInterval(intervalo);
      procesarPago();
    }
  }, 1000);
}

// 💳 Procesar suscripción real
async function procesarPago() {
  try {
    $q.notify({
      message: "Pago recibido. Activando tu suscripción...",
      color: "positive",
    });
    await suscripcionStore.procesarSuscripcion();
  } catch (err) {
    $q.notify({
      type: "negative",
      message: "Error al procesar el pago",
    });
    pagando.value = false;
  }
}

// ⚙️ Inicialización
onMounted(() => {
  if (suscripcionStore.selectedPlan) {
    nombrePlan.value = suscripcionStore.selectedPlan.nombre;
    precioPlan.value = suscripcionStore.selectedPlan.precio;
  } else if (route.query.nombre && route.query.precio) {
    nombrePlan.value = route.query.nombre;
    precioPlan.value = route.query.precio;
    suscripcionStore.setPlan({
      idplan: route.query.idplan,
      nombre: route.query.nombre,
      precio: route.query.precio,
    });
  }

  if (!suscripcionStore.selectedTipoPago) {
    suscripcionStore.setTipoPago({ nombre: "QR" });
  }
});
</script>

<style scoped>
/* 🔹 Fondo dinámico coherente */
.pago-qr-page {
  background: radial-gradient(circle at 25% 25%, #0a0f1d, #030712 80%);
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.animated-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}
.animated-bg::before,
.animated-bg::after {
  content: "";
  position: absolute;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.6;
  animation: float 18s ease-in-out infinite alternate;
}
.animated-bg::before {
  top: 10%;
  left: 15%;
  background: radial-gradient(circle, rgba(255, 77, 109, 0.9), transparent 70%);
}
.animated-bg::after {
  bottom: 10%;
  right: 15%;
  background: radial-gradient(circle, rgba(108, 74, 182, 0.8), transparent 70%);
}
@keyframes float {
  0% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(40px, -40px) scale(1.1);
  }
  100% {
    transform: translate(-30px, 30px) scale(1);
  }
}

/* 🔸 Contenedor principal */
.pago-card {
  border-radius: 18px;
  background: #ffffff;
  color: #222;
  z-index: 2;
  max-width: 500px;
  width: 100%;
}

/* 🟣 Títulos y colores */
.titulo-pago {
  color: #6c4ab6;
}

.text-morado {
  color: #6c4ab6;
}

.text-rosa {
  color: #ff4d6d;
}

/* 🧾 QR */
.qr-container {
  padding: 12px;
  border-radius: 12px;
  background: rgba(108, 74, 182, 0.05);
  box-shadow: 0 0 20px rgba(108, 74, 182, 0.2);
}
.qr-image {
  width: 240px;
  height: 240px;
  object-fit: contain;
}

/* 💳 Botón coherente */
.btn-pagar {
  background: #ff4d6d;
  color: #fff;
  font-weight: 700;
  box-shadow: 0 0 20px rgba(255, 77, 109, 0.5);
  transition: all 0.3s ease;
}
.btn-pagar:hover {
  background: #e63f5d;
  box-shadow: 0 0 30px rgba(255, 77, 109, 0.7);
}

/* 💜 Color global para íconos morados */
:deep(.q-icon[color="morado"]) {
  color: #6c4ab6 !important;
}
</style>
