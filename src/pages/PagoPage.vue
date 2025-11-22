<template>
  <q-page class="pago-page flex flex-center q-pa-lg">
    <!-- 🔹 Fondo dinámico -->
    <div class="animated-bg"></div>

    <div class="row q-col-gutter-xl full-width justify-center">
      <!-- 💳 Formulario de pago -->
      <div class="col-12 col-md-7">
        <q-card class="payment-card shadow-6">
          <q-card-section class="text-center q-pb-sm">
            <q-icon name="credit_card" size="48px" color="morado" />
            <div class="text-h5 text-bold titulo-pago">Pago con Tarjeta</div>
            <div class="text-subtitle2 text-grey-7">
              Completa los datos de tu tarjeta para finalizar la suscripción
            </div>
          </q-card-section>

          <q-separator />

          <!-- 🧾 Formulario -->
          <q-form @submit.prevent="procesarPago" class="q-pa-md">
            <q-input
              v-model="form.nombre"
              label="Nombre completo en la tarjeta"
              outlined
              dense
              class="q-mb-md"
            >
              <template v-slot:prepend>
                <q-icon name="person" color="morado" />
              </template>
            </q-input>

            <q-input
              v-model="form.numero"
              label="Número de tarjeta"
              mask="#### #### #### ####"
              outlined
              dense
              class="q-mb-md"
            >
              <template v-slot:prepend>
                <q-icon name="credit_card" color="morado" />
              </template>
            </q-input>

            <q-select
              v-model="form.tipo"
              :options="['Visa', 'MasterCard', 'Amex']"
              label="Tipo de tarjeta"
              outlined
              dense
              class="q-mb-md"
            >
              <template v-slot:prepend>
                <q-icon name="style" color="morado" />
              </template>
            </q-select>

            <!-- Fecha y CVV -->
            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-4">
                <q-input
                  v-model="form.mes"
                  label="Mes (MM)"
                  mask="##"
                  outlined
                  dense
                >
                  <template v-slot:prepend>
                    <q-icon name="event" color="morado" />
                  </template>
                </q-input>
              </div>
              <div class="col-4">
                <q-input
                  v-model="form.anio"
                  label="Año (AA)"
                  mask="##"
                  outlined
                  dense
                >
                  <template v-slot:prepend>
                    <q-icon name="event" color="morado" />
                  </template>
                </q-input>
              </div>
              <div class="col-4">
                <q-input
                  v-model="form.cvv"
                  label="CVV"
                  type="password"
                  maxlength="4"
                  outlined
                  dense
                >
                  <template v-slot:prepend>
                    <q-icon name="lock" color="morado" />
                  </template>
                </q-input>
              </div>
            </div>

            <q-separator />

            <!-- Dirección -->
            <q-input
              v-model="form.direccion"
              label="Dirección de facturación"
              outlined
              dense
              class="q-mb-md q-mt-md"
            >
              <template v-slot:prepend>
                <q-icon name="home" color="morado" />
              </template>
            </q-input>

            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-6">
                <q-input v-model="form.ciudad" label="Ciudad" outlined dense>
                  <template v-slot:prepend>
                    <q-icon name="location_city" color="morado" />
                  </template>
                </q-input>
              </div>
              <div class="col-6">
                <q-input
                  v-model="form.codigoPostal"
                  label="Código Postal"
                  outlined
                  dense
                >
                  <template v-slot:prepend>
                    <q-icon name="markunread_mailbox" color="morado" />
                  </template>
                </q-input>
              </div>
            </div>

            <q-select
              v-model="form.pais"
              :options="['Bolivia', 'Argentina', 'Chile', 'Perú']"
              label="País"
              outlined
              dense
              class="q-mb-md"
            >
              <template v-slot:prepend>
                <q-icon name="public" color="morado" />
              </template>
            </q-select>

            <!-- Factura -->
            <q-separator />
            <div
              class="text-subtitle1 text-bold factura-titulo q-mt-md q-mb-sm"
            >
              Datos para la Factura
            </div>

            <q-input
              v-model="form.nit"
              label="NIT (opcional)"
              outlined
              dense
              class="q-mb-md"
            >
              <template v-slot:prepend>
                <q-icon name="badge" color="morado" />
              </template>
            </q-input>

            <q-input
              v-model="form.razon_social"
              label="Razón Social (opcional)"
              outlined
              dense
              class="q-mb-md"
            >
              <template v-slot:prepend>
                <q-icon name="business" color="morado" />
              </template>
            </q-input>

            <!-- Botón -->
            <div class="q-mt-lg text-center">
              <q-btn
                label="PAGAR AHORA"
                class="btn-pagar"
                size="lg"
                rounded
                unelevated
                type="submit"
                style="width: 100%"
                :loading="loading"
              />
            </div>
          </q-form>
        </q-card>
      </div>

      <!-- 📋 Resumen -->
      <div class="col-12 col-md-4">
        <q-card class="plan-summary shadow-5">
          <q-card-section>
            <div class="text-h6 text-bold titulo-resumen">
              <q-icon name="assignment" class="q-mr-sm" color="morado" />
              Resumen del Plan
            </div>
            <div class="text-subtitle2 text-grey-7">
              Revisa los detalles antes de pagar
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section v-if="plan">
            <div class="text-subtitle1 q-mb-sm text-dark">
              <q-icon name="star" color="amber" size="20px" class="q-mr-xs" />
              {{ plan.nombre }}
            </div>
            <div class="text-caption text-grey-7 q-mb-xs">
              Duración: {{ plan.duracion }} meses
            </div>
            <div class="text-h5 text-bold text-positive q-mb-md">
              Bs. {{ plan.precio }}
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section
            class="text-h6 text-right text-bold text-dark"
            v-if="plan"
          >
            Total a pagar: Bs. {{ plan.precio }}
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from "vue";
import { useQuasar } from "quasar";
import { useSuscripcionStore } from "src/stores/suscripcion";

const $q = useQuasar();
const suscripcionStore = useSuscripcionStore();

const plan = suscripcionStore.selectedPlan;
const loading = ref(false);

const form = ref({
  nombre: "",
  numero: "",
  tipo: "",
  mes: "",
  anio: "",
  cvv: "",
  direccion: "",
  ciudad: "",
  codigoPostal: "",
  pais: "",
  nit: "",
  razon_social: "",
});

async function procesarPago() {
  loading.value = true;
  try {
    // Guarda los datos de factura en el store antes de procesar
    suscripcionStore.setPaymentData({
      nombre: form.value.nombre,
      nit: form.value.nit,
      razon_social: form.value.razon_social,
    });

    await suscripcionStore.procesarSuscripcion();

    $q.notify({ type: "positive", message: "Pago procesado con éxito ✅" });
  } catch (err) {
    console.error("❌ Error procesando pago:", err);
    $q.notify({
      type: "negative",
      message:
        err.response?.data?.message ||
        "Error al procesar el pago, revisa los datos.",
    });
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.pago-page {
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
  background: radial-gradient(circle, rgba(0, 255, 200, 0.8), transparent 70%);
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

.payment-card,
.plan-summary {
  background: #ffffff;
  border-radius: 18px;
  color: #222;
}
.titulo-pago,
.titulo-resumen {
  color: #6c4ab6;
}
.factura-titulo {
  color: #ff4d6d;
}
:deep(.q-icon[color="morado"]) {
  color: #6c4ab6 !important;
}
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
</style>
