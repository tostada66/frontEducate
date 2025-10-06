<template>
  <q-page class="flex flex-center bg-gradient q-pa-lg">
    <q-card class="success-card shadow-10">
      <!-- Icono éxito -->
      <q-card-section class="text-center q-py-xl">
        <q-icon name="check_circle" size="100px" color="positive" />
        <div class="text-h4 text-bold text-positive q-mt-md">
          ¡Pago exitoso!
        </div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">
          Tu suscripción al plan
          <b>{{ factura?.plan?.nombre }}</b>
          se activó correctamente
        </div>
      </q-card-section>

      <!-- Detalles de la suscripción -->
      <q-card-section
        v-if="factura && factura.plan"
        class="q-pa-lg bg-white rounded-borders"
      >
        <div class="text-h6 text-bold text-primary q-mb-md">
          📋 Detalles de la suscripción
        </div>

        <q-list dense separator>
          <q-item>
            <q-item-section>Plan</q-item-section>
            <q-item-section side>
              <q-chip color="primary" text-color="white" square>
                {{ factura.plan?.nombre }}
                ({{ factura.plan?.duracion }} meses)
              </q-chip>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>Fecha de inicio</q-item-section>
            <q-item-section side>
              {{
                new Date(factura.suscripcion?.fecha_inicio).toLocaleDateString()
              }}
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>Fecha de fin</q-item-section>
            <q-item-section side>
              {{
                new Date(factura.suscripcion?.fecha_fin).toLocaleDateString()
              }}
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>Monto pagado</q-item-section>
            <q-item-section side>
              <q-badge color="positive" align="top">
                Bs. {{ factura.total }}
              </q-badge>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <!-- Acciones -->
      <q-card-actions vertical align="center" class="q-pa-lg bg-grey-1">
        <q-btn
          color="primary"
          label="Ir a mis cursos"
          class="full-width q-mb-sm"
          rounded
          glossy
          size="lg"
          @click="goCursos"
        />
        <q-btn
          outline
          color="primary"
          label="Ver factura completa"
          class="full-width"
          rounded
          size="md"
          @click="goFactura"
        />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { api } from "boot/axios";
import { Notify } from "quasar";

const router = useRouter();
const route = useRoute();

const facturaId = route.params.id;
const factura = ref(null);

// Cargar factura con suscripción incluida
async function loadFactura() {
  try {
    const { data } = await api.get(`/facturas/${facturaId}`);
    factura.value = data;

    console.log("✅ Factura recibida:", data);
  } catch (err) {
    console.error("❌ Error cargando factura:", err);
    Notify.create({
      type: "negative",
      message: "Error cargando factura",
      caption: err.message,
    });
  }
}

onMounted(() => {
  if (facturaId) loadFactura();
});

// Navegación
function goCursos() {
  router.push({ name: "estudiante-dashboard" });
}
function goFactura() {
  if (!factura.value?.idfactura) {
    Notify.create({
      type: "warning",
      message: "Factura sin ID, no se puede abrir detalle",
    });
    return;
  }
  router.push({ name: "factura", params: { id: factura.value.idfactura } });
}
</script>

<style scoped>
.bg-gradient {
  background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
  min-height: 100vh;
}

.success-card {
  width: 100%;
  max-width: 600px;
  border-radius: 20px;
  overflow: hidden;
}

.rounded-borders {
  border-radius: 12px;
}
</style>
