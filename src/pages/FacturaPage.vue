<!-- src/pages/FacturaPage.vue -->
<template>
  <q-page class="q-pa-lg bg-grey-2">
    <div class="row justify-center">
      <div class="col-12 col-md-8">
        <q-card class="shadow-6 factura-card">
          <!-- Header -->
          <q-card-section
            class="row items-center justify-between bg-primary text-white"
          >
            <div>
              <div class="text-h5 text-bold">Factura</div>
            </div>
            <q-icon name="receipt_long" size="48px" />
          </q-card-section>

          <!-- Datos cliente -->
          <q-card-section>
            <div class="text-h6 text-primary text-bold q-mb-sm">
              👤 Datos del Cliente
            </div>
            <q-list dense separator>
              <q-item v-if="factura?.nombre_factura">
                <q-item-section>A nombre de</q-item-section>
                <q-item-section side>
                  {{ factura.nombre_factura }}
                </q-item-section>
              </q-item>
              <q-item v-else>
                <q-item-section>Usuario</q-item-section>
                <q-item-section side>
                  {{ factura?.usuario?.nombres }}
                  {{ factura?.usuario?.apellidos }}
                </q-item-section>
              </q-item>
              <q-item v-if="factura?.nit">
                <q-item-section>NIT</q-item-section>
                <q-item-section side>{{ factura.nit }}</q-item-section>
              </q-item>
              <q-item v-if="factura?.razon_social">
                <q-item-section>Razón Social</q-item-section>
                <q-item-section side>{{ factura.razon_social }}</q-item-section>
              </q-item>
            </q-list>
          </q-card-section>

          <q-separator />

          <!-- Datos del plan -->
          <q-card-section>
            <div class="text-h6 text-primary text-bold q-mb-sm">
              📦 Suscripción
            </div>
            <q-list dense separator>
              <q-item>
                <q-item-section>Plan</q-item-section>
                <q-item-section side>
                  {{ factura?.plan?.nombre }}
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>Duración</q-item-section>
                <q-item-section side>
                  {{ factura?.plan?.duracion }} meses
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>Precio</q-item-section>
                <q-item-section side>
                  Bs. {{ factura?.plan?.precio }}
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>

          <q-separator />

          <!-- Pago -->
          <q-card-section>
            <div class="text-h6 text-primary text-bold q-mb-sm">
              💳 Detalles de Pago
            </div>
            <q-list dense separator>
              <q-item>
                <q-item-section>Método de pago</q-item-section>
                <q-item-section side>
                  {{ factura?.tipo_pago?.nombre }}
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>Total</q-item-section>
                <q-item-section side class="text-bold text-positive">
                  Bs. {{ factura?.total }}
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>Estado</q-item-section>
                <q-item-section side>
                  <q-badge
                    :color="
                      factura?.estado === 'pagada' ? 'positive' : 'negative'
                    "
                    align="top"
                  >
                    {{ factura?.estado }}
                  </q-badge>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>Fecha</q-item-section>
                <q-item-section side>
                  {{ formatFecha(factura?.fecha) }}
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>

          <q-separator />

          <!-- Acciones -->
          <q-card-actions align="right" class="q-pa-md">
            <q-btn
              flat
              color="primary"
              icon="arrow_back"
              label="Volver"
              @click="goBack"
            />
            <q-btn
              color="primary"
              icon="picture_as_pdf"
              label="Descargar PDF"
              @click="downloadPDF"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { api } from "boot/axios";

const route = useRoute();
const router = useRouter();
const factura = ref(null);

function formatFecha(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function loadFactura() {
  try {
    const { data } = await api.get(`/facturas/${route.params.id}`);
    factura.value = data;
  } catch (err) {
    console.error("❌ Error cargando factura:", err);
  }
}

function goBack() {
  router.push({ name: "estudiante-dashboard" });
}

async function downloadPDF() {
  if (!factura.value?.idfactura) {
    alert("Factura inválida");
    return;
  }

  try {
    const response = await api.get(`/facturas/${factura.value.idfactura}/pdf`, {
      responseType: "blob", // 👈 necesario para PDF
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `factura_${factura.value.idfactura}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    console.error("❌ Error descargando PDF:", err);
    alert("No se pudo descargar el PDF");
  }
}

onMounted(() => {
  loadFactura();
});
</script>

<style scoped>
.factura-card {
  border-radius: 16px;
  overflow: hidden;
}
</style>
