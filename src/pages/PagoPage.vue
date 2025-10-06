<template>
  <q-page class="q-pa-lg flex flex-center bg-grey-2">
    <div class="row q-col-gutter-xl full-width justify-center">
      <!-- Formulario de pago -->
      <div class="col-12 col-md-7">
        <q-card class="payment-card shadow-4">
          <!-- Título -->
          <q-card-section class="text-center">
            <q-icon name="credit_card" size="48px" color="primary" />
            <div class="text-h5 text-primary text-bold">Pago con Tarjeta</div>
            <div class="text-subtitle2 text-grey-7">
              Completa los datos de tu tarjeta para finalizar la suscripción
            </div>
          </q-card-section>

          <q-separator />

          <!-- Formulario -->
          <q-form @submit.prevent="procesarPago" class="q-pa-md">
            <!-- Nombre -->
            <q-input
              v-model="form.nombre"
              label="Nombre completo en la tarjeta"
              outlined
              dense
              class="q-mb-md"
            >
              <template v-slot:prepend><q-icon name="person" /></template>
            </q-input>

            <!-- Número -->
            <q-input
              v-model="form.numero"
              label="Número de tarjeta"
              mask="#### #### #### ####"
              outlined
              dense
              class="q-mb-md"
            >
              <template v-slot:prepend><q-icon name="credit_card" /></template>
            </q-input>

            <!-- Tipo -->
            <q-select
              v-model="form.tipo"
              :options="['Visa', 'MasterCard', 'Amex']"
              label="Tipo de tarjeta"
              outlined
              dense
              class="q-mb-md"
            >
              <template v-slot:prepend><q-icon name="style" /></template>
            </q-select>

            <!-- Expiración y CVV -->
            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-4">
                <q-input
                  v-model="form.mes"
                  label="Mes (MM)"
                  mask="##"
                  outlined
                  dense
                >
                  <template v-slot:prepend><q-icon name="event" /></template>
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
                  <template v-slot:prepend><q-icon name="event" /></template>
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
                  <template v-slot:prepend><q-icon name="lock" /></template>
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
              <template v-slot:prepend><q-icon name="home" /></template>
            </q-input>

            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-6">
                <q-input v-model="form.ciudad" label="Ciudad" outlined dense>
                  <template v-slot:prepend
                    ><q-icon name="location_city"
                  /></template>
                </q-input>
              </div>
              <div class="col-6">
                <q-input
                  v-model="form.codigoPostal"
                  label="Código Postal"
                  outlined
                  dense
                >
                  <template v-slot:prepend
                    ><q-icon name="markunread_mailbox"
                  /></template>
                </q-input>
              </div>
            </div>

            <!-- País -->
            <q-select
              v-model="form.pais"
              :options="['Bolivia', 'Argentina', 'Chile', 'Perú']"
              label="País"
              outlined
              dense
              class="q-mb-md"
            >
              <template v-slot:prepend><q-icon name="public" /></template>
            </q-select>

            <!-- Datos de factura -->
            <q-separator />
            <div class="text-subtitle1 text-bold text-primary q-mt-md q-mb-sm">
              Datos para la Factura
            </div>

            <q-input
              v-model="form.nit"
              label="NIT (opcional)"
              outlined
              dense
              class="q-mb-md"
            >
              <template v-slot:prepend><q-icon name="badge" /></template>
            </q-input>

            <q-input
              v-model="form.razon_social"
              label="Razón Social (opcional)"
              outlined
              dense
              class="q-mb-md"
            >
              <template v-slot:prepend><q-icon name="business" /></template>
            </q-input>

            <!-- Botón -->
            <div class="q-mt-lg text-center">
              <q-btn
                label="PAGAR AHORA"
                color="primary"
                size="lg"
                rounded
                unelevated
                type="submit"
                class="full-width"
              />
            </div>
          </q-form>
        </q-card>
      </div>

      <!-- Resumen de plan -->
      <div class="col-12 col-md-4">
        <q-card class="plan-summary shadow-3">
          <q-card-section>
            <div class="text-h6 text-bold text-primary">
              <q-icon name="assignment" class="q-mr-sm" /> Resumen del Plan
            </div>
            <div class="text-subtitle2 text-grey-7">
              Revisa los detalles antes de pagar
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section v-if="plan">
            <div class="text-subtitle1 q-mb-sm">
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

          <q-card-section class="text-h6 text-right text-bold" v-if="plan">
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
import { useRouter } from "vue-router";
import { api } from "boot/axios";
import { useAuthStore } from "src/stores/auth";
import { useSuscripcionStore } from "src/stores/suscripcion";

const $q = useQuasar();
const router = useRouter();
const auth = useAuthStore();
const suscripcionStore = useSuscripcionStore();

// 👉 plan elegido desde Pinia
const plan = suscripcionStore.selectedPlan;

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
  try {
    const { data } = await api.post("/suscripciones/pagar", {
      idplan: plan.idplan,
      idpago: suscripcionStore.selectedTipoPago?.idpago,
      nit: form.value.nit || null,
      razon_social: form.value.razon_social || null,
      nombre_factura: form.value.nombre || null,
    });

    // ✅ Actualizar auth.user con el usuario actualizado del backend
    if (data.user) {
      auth.user = { ...data.user };
    }

    $q.notify({ type: "positive", message: "Pago procesado con éxito ✅" });

    router.push({
      name: "pago-exito",
      params: { id: data.factura.idfactura },
    });
  } catch (err) {
    console.error("❌ Error procesando pago:", err);
    $q.notify({ type: "negative", message: "Error al procesar el pago" });
  }
}
</script>

<style scoped>
.payment-card {
  width: 100%;
  border-radius: 16px;
}
.plan-summary {
  border-radius: 16px;
}
</style>
