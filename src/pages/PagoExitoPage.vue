<template>
  <q-page class="pago-exito-page flex flex-center q-pa-lg">
    <div class="animated-bg"></div>

    <q-card class="success-card shadow-10">
      <!-- ✅ Encabezado -->
      <q-card-section class="text-center q-py-xl header-section">
        <div class="icon-wrapper">
          <q-icon name="check_circle" size="110px" color="white" />
        </div>
        <div class="text-h4 text-bold text-white q-mt-md glow-title">
          ¡Pago exitoso!
        </div>
        <div class="text-subtitle1 text-white q-mt-sm opacity-90">
          Tu suscripción al plan
          <b class="highlight">{{ factura?.plan?.nombre || "..." }}</b>
          se activó correctamente 🎉
        </div>
      </q-card-section>

      <!-- 📋 Detalles -->
      <q-card-section
        v-if="factura && factura.plan"
        class="q-pa-lg details-card"
      >
        <div class="text-h6 text-bold text-white q-mb-md">
          📋 Detalles de la suscripción
        </div>

        <q-list dense separator>
          <q-item>
            <q-item-section>Plan</q-item-section>
            <q-item-section side>
              <q-chip color="primary" text-color="white" square>
                {{ factura.plan?.nombre }}
                ({{ factura.plan?.duracion || "—" }} meses)
              </q-chip>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>Fecha de inicio</q-item-section>
            <q-item-section side>
              {{ formatFecha(factura.suscripcion?.fecha_inicio) }}
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>Fecha de fin</q-item-section>
            <q-item-section side>
              {{ formatFecha(factura.suscripcion?.fecha_fin) }}
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>Monto pagado</q-item-section>
            <q-item-section side>
              <q-badge color="cyan-7" text-color="white" align="top">
                Bs. {{ factura.total }}
              </q-badge>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <!-- 🔘 Acciones -->
      <q-card-actions vertical align="center" class="q-pa-lg footer-actions">
        <q-btn
          label="Ir a mis cursos"
          class="btn-principal full-width q-mb-sm"
          rounded
          glossy
          size="lg"
          @click="goCursos"
        />
        <q-btn
          outline
          color="white"
          label="Ver factura completa"
          class="btn-secundario full-width"
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
import { useSuscripcionStore } from "src/stores/suscripcion";

const router = useRouter();
const route = useRoute();
const suscripcionStore = useSuscripcionStore();

const facturaId = route.params.id;
const factura = ref(null);

async function loadFactura() {
  try {
    const { data } = await api.get(`/facturas/${facturaId}`);
    factura.value = data.data || data;
  } catch (err) {
    console.error("❌ Error cargando factura:", err);
    Notify.create({
      type: "negative",
      message: "Error cargando factura",
      caption: err.response?.data?.message || err.message,
    });
  }
}

function formatFecha(fechaStr) {
  if (!fechaStr) return "—";
  try {
    const date = new Date(fechaStr);
    if (isNaN(date)) return "—";
    return date.toLocaleDateString("es-BO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

onMounted(async () => {
  if (facturaId) await loadFactura();
  suscripcionStore.reset();
});

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
/* 🌌 Fondo azul animado */
.pago-exito-page {
  background: radial-gradient(circle at 25% 25%, #001a33, #000814 90%);
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  font-family: "Poppins", sans-serif;
}

.animated-bg::before,
.animated-bg::after {
  content: "";
  position: absolute;
  width: 450px;
  height: 450px;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.6;
  animation: float 16s ease-in-out infinite alternate;
}
.animated-bg::before {
  top: 5%;
  left: 10%;
  background: radial-gradient(circle, rgba(0, 180, 255, 0.9), transparent 70%);
}
.animated-bg::after {
  bottom: 5%;
  right: 10%;
  background: radial-gradient(circle, rgba(0, 120, 255, 0.7), transparent 70%);
}
@keyframes float {
  0% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(40px, -30px) scale(1.05);
  }
  100% {
    transform: translate(-30px, 30px) scale(1);
  }
}

/* 💳 Tarjeta */
.success-card {
  width: 100%;
  max-width: 620px;
  border-radius: 25px;
  background: linear-gradient(145deg, #0079ff, #2acfff);
  box-shadow: 0 0 40px rgba(0, 200, 255, 0.5);
  overflow: hidden;
  position: relative;
  z-index: 2;
}

/* ✨ Encabezado */
.header-section {
  background: linear-gradient(145deg, #0095ff, #00e0ff);
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: inset 0 0 25px rgba(255, 255, 255, 0.25);
}

.icon-wrapper {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 130px;
  height: 130px;
  border-radius: 50%;
  background: radial-gradient(circle, #e5faff, #b3eeff);
  box-shadow: 0 0 40px rgba(0, 200, 255, 0.8);
  animation: pulse 3s infinite alternate;
}
@keyframes pulse {
  from {
    transform: scale(1);
    box-shadow: 0 0 30px rgba(0, 200, 255, 0.5);
  }
  to {
    transform: scale(1.06);
    box-shadow: 0 0 55px rgba(0, 220, 255, 0.8);
  }
}

.glow-title {
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.9),
    0 0 35px rgba(0, 200, 255, 0.6);
}

.highlight {
  color: #b3f6ff;
  text-shadow: 0 0 15px rgba(200, 250, 255, 0.9);
}

/* 📋 Detalles */
.details-card {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #eafaff;
}

/* 🔘 Botones */
.btn-principal {
  background: linear-gradient(135deg, #00aaff, #00e6ff);
  color: white;
  font-weight: bold;
  letter-spacing: 0.5px;
  box-shadow: 0 0 25px rgba(0, 200, 255, 0.6);
  transition: 0.3s;
}
.btn-principal:hover {
  transform: scale(1.04);
  box-shadow: 0 0 35px rgba(0, 240, 255, 0.8);
}

.btn-secundario {
  border: 1.5px solid rgba(255, 255, 255, 0.7);
  color: #e8ffff;
  font-weight: 600;
  letter-spacing: 0.4px;
  transition: 0.3s;
}
.btn-secundario:hover {
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 25px rgba(150, 230, 255, 0.5);
}
</style>
