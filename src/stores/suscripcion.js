import { defineStore } from "pinia";
import { ref } from "vue";
import { api } from "boot/axios";
import { useAuthStore } from "./auth";
import { useRouter } from "vue-router";

export const useSuscripcionStore = defineStore("suscripcion", () => {
  const selectedPlan = ref(null);
  const selectedTipoPago = ref(null);
  const paymentData = ref(null); // { nombre, nit, razon_social, ... }
  const factura = ref(null);

  const loading = ref(false);
  const error = ref(null);

  const router = useRouter();

  function setPlan(plan) {
    selectedPlan.value = plan;
  }

  function setTipoPago(tipo) {
    selectedTipoPago.value = tipo;
  }

  function setPaymentData(data) {
    paymentData.value = data;
  }

  async function procesarSuscripcion() {
    if (!selectedPlan.value || !selectedTipoPago.value) {
      throw new Error("Faltan datos en el flujo de suscripción");
    }

    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.post("/suscripciones/pagar", {
        idplan: selectedPlan.value.idplan || selectedPlan.value.id, // 👈 asegurar idplan
        idpago: selectedTipoPago.value.idpago || selectedTipoPago.value.id, // 👈 corregido
        nit: paymentData.value?.nit || null,
        razon_social: paymentData.value?.razon_social || null,
        nombre_factura: paymentData.value?.nombre || null, // 👈 nuevo campo
      });

      factura.value = data.factura;

      // refrescar sesión
      const auth = useAuthStore();
      await auth.fetchMe();

      // 👇 redirigir directamente al éxito con el ID de la factura
      if (factura.value?.idfactura) {
        router.replace({
          name: "pago-exito",
          params: { id: factura.value.idfactura },
        });
      }

      return data;
    } catch (err) {
      error.value = err.response?.data?.message || "Error procesando pago";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function reset() {
    selectedPlan.value = null;
    selectedTipoPago.value = null;
    paymentData.value = null;
    factura.value = null;
    error.value = null;
  }

  return {
    selectedPlan,
    selectedTipoPago,
    paymentData,
    factura,
    loading,
    error,
    setPlan,
    setTipoPago,
    setPaymentData,
    procesarSuscripcion,
    reset,
  };
});
