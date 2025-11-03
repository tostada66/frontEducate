<template>
  <q-page class="factura-page flex flex-center q-pa-lg">
    <!-- 🔹 Fondo dinámico -->
    <div class="animated-bg"></div>

    <div class="row justify-center full-width">
      <div class="col-12 col-md-8">
        <q-card class="shadow-8 factura-card">
          <!-- 🧾 Encabezado -->
          <q-card-section class="row items-center justify-between header-card">
            <div>
              <div class="text-h5 text-bold text-white">
                {{
                  factura?.tipo === "suscripcion"
                    ? "Factura de Suscripción"
                    : ["licencia", "pago_profesor"].includes(factura?.tipo)
                    ? "Factura de Pago a Profesor"
                    : "Factura"
                }}
              </div>
            </div>
            <q-icon name="receipt_long" size="48px" color="white" />
          </q-card-section>

          <!-- 👤 Datos del Cliente -->
          <q-card-section>
            <div class="text-h6 text-morado text-bold q-mb-sm">
              👤 Datos del Cliente
            </div>
            <q-list dense separator>
              <q-item>
                <q-item-section>A nombre de</q-item-section>
                <q-item-section side>
                  {{
                    factura?.cliente
                      ? `${factura.cliente.nombres || ""} ${
                          factura.cliente.apellidos || ""
                        }`
                      : factura?.nombre_factura ||
                        `${factura?.usuario?.nombres || ""} ${
                          factura?.usuario?.apellidos || ""
                        }` ||
                        "Desconocido"
                  }}
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

          <!-- 🧩 Contenido variable -->
          <q-card-section>
            <template v-if="factura?.tipo === 'suscripcion'">
              <div class="text-h6 text-morado text-bold q-mb-sm">
                📦 Detalles de Suscripción
              </div>
              <q-list dense separator>
                <q-item>
                  <q-item-section>Plan</q-item-section>
                  <q-item-section side>
                    {{ factura?.plan?.nombre || "No especificado" }}
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>Duración</q-item-section>
                  <q-item-section side>
                    {{ factura?.plan?.duracion || "-" }} meses
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>Precio</q-item-section>
                  <q-item-section side class="text-rosa">
                    Bs. {{ factura?.plan?.precio || factura?.total }}
                  </q-item-section>
                </q-item>
              </q-list>
            </template>

            <template
              v-else-if="['licencia', 'pago_profesor'].includes(factura?.tipo)"
            >
              <div class="text-h6 text-morado text-bold q-mb-sm">
                🎓 Detalles del Curso
              </div>
              <q-list dense separator>
                <q-item>
                  <q-item-section>Curso</q-item-section>
                  <q-item-section side>
                    {{
                      factura?.licencia?.curso?.nombre ||
                      factura?.pago_profesor?.licencia?.curso?.nombre ||
                      "Curso no disponible"
                    }}
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section>Profesor</q-item-section>
                  <q-item-section side>
                    {{
                      factura?.pago_profesor?.profesor?.usuario?.nombres ||
                      factura?.licencia?.curso?.profesor?.usuario?.nombres ||
                      "Sin datos"
                    }}
                    {{
                      factura?.pago_profesor?.profesor?.usuario?.apellidos ||
                      factura?.licencia?.curso?.profesor?.usuario?.apellidos ||
                      ""
                    }}
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section>Método de pago</q-item-section>
                  <q-item-section side>
                    {{
                      factura?.pago_profesor?.metodo_pago
                        ? formatearMetodo(factura.pago_profesor.metodo_pago)
                        : factura?.tipoPago?.nombre || "Transferencia / QR"
                    }}
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section>Referencia</q-item-section>
                  <q-item-section side>
                    {{
                      factura?.pago_profesor?.referencia ||
                      factura?.referencia ||
                      "-"
                    }}
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section>Monto pagado</q-item-section>
                  <q-item-section side class="text-rosa">
                    Bs. {{ factura?.total }}
                  </q-item-section>
                </q-item>
              </q-list>
            </template>

            <template v-else>
              <div class="text-negative q-mt-sm">
                ⚠️ Tipo de factura desconocido.
              </div>
            </template>
          </q-card-section>

          <q-separator />

          <!-- 💳 Detalles de pago -->
          <q-card-section>
            <div class="text-h6 text-morado text-bold q-mb-sm">
              💳 Detalles Generales del Pago
            </div>
            <q-list dense separator>
              <q-item>
                <q-item-section>Método de pago</q-item-section>
                <q-item-section side>
                  {{
                    factura?.tipoPago?.nombre ||
                    factura?.tipo_pago?.nombre ||
                    factura?.pago_profesor?.metodo_pago ||
                    "No especificado"
                  }}
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section>Total</q-item-section>
                <q-item-section side class="text-bold text-rosa">
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
                    {{ factura?.estado || "sin estado" }}
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

          <!-- 🔘 Acciones -->
          <q-card-actions align="right" class="q-pa-md bg-grey-1">
            <q-btn
              flat
              color="morado"
              icon="arrow_back"
              label="Volver"
              @click="goBack"
            />
            <q-btn
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
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatearMetodo(valor) {
  const metodos = {
    transferencia: "Transferencia Bancaria",
    qr: "Pago por QR",
    efectivo: "Efectivo",
    cheque: "Cheque",
    otro: "Otro",
  };
  return metodos[valor] || valor || "No especificado";
}

async function loadFactura() {
  try {
    const { data } = await api.get(`/facturas/${route.params.id}`);
    factura.value = data.data || data;
  } catch (err) {
    console.error("❌ Error cargando factura:", err);
  }
}

function goBack() {
  if (["licencia", "pago_profesor"].includes(factura.value?.tipo)) {
    router.push({ name: "admin-pagos-profesores" });
  } else {
    router.push({ name: "estudiante-dashboard" });
  }
}

async function downloadPDF() {
  if (!factura.value?.idfactura) return alert("Factura inválida");
  try {
    const response = await api.get(`/facturas/${factura.value.idfactura}/pdf`, {
      responseType: "blob",
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

onMounted(loadFactura);
</script>

<style scoped>
.factura-page {
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
  opacity: 0.5;
  animation: float 20s ease-in-out infinite alternate;
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

/* 🔸 Tarjeta principal */
.factura-card {
  border-radius: 18px;
  background: #ffffff;
  color: #222;
  z-index: 2;
}

/* Encabezado */
.header-card {
  background: linear-gradient(135deg, #111c3c, #1c2a4a);
  border-top-left-radius: 18px;
  border-top-right-radius: 18px;
}

/* Colores de texto */
.text-morado {
  color: #233b72;
}
.text-rosa {
  color: #ff4d6d;
}

/* 🟣 Botón Descargar PDF → morado brillante */
.q-btn {
  background: #6c4ab6; /* morado principal */

  font-weight: bold;
  box-shadow: 0 0 18px rgba(108, 74, 182, 0.5);
  transition: all 0.3s ease;
}
.q-btn[color="rosa"]:hover {
  background: #7d5ed4; /* un poco más claro al hover */
  box-shadow: 0 0 28px rgba(125, 94, 212, 0.6);
  transform: translateY(-2px);
}

/* Botón volver */
.q-btn[color="morado"]:hover {
  color: #1c2a4a;
}
</style>
