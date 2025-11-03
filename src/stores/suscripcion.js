import { defineStore } from "pinia";
import { ref } from "vue";
import { api } from "boot/axios";
import { useAuthStore } from "./auth";
import { useRouter } from "vue-router";

export const useSuscripcionStore = defineStore(
  "suscripcion",
  () => {
    // 📦 Estado principal
    const selectedPlan = ref(null);
    const selectedTipoPago = ref(null);
    const paymentData = ref(null); // { nombre, nit, razon_social, ... }
    const factura = ref(null);

    const loading = ref(false);
    const error = ref(null);

    const router = useRouter();

    // 🔹 Setters
    function setPlan(plan) {
      selectedPlan.value = plan;
    }

    function setTipoPago(tipo) {
      selectedTipoPago.value = tipo;
    }

    function setPaymentData(data) {
      paymentData.value = data;
    }

    // 💳 Procesar pago de suscripción
    async function procesarSuscripcion() {
      if (!selectedPlan.value || !selectedTipoPago.value) {
        throw new Error("Faltan datos en el flujo de suscripción");
      }

      loading.value = true;
      error.value = null;

      try {
        // 📤 Enviar los datos correctos según el backend
        const { data } = await api.post("/suscripciones/pagar", {
          idplan: selectedPlan.value.idplan || selectedPlan.value.id,
          idtipo_pago:
            selectedTipoPago.value.idtipo_pago || selectedTipoPago.value.id,
          nit: paymentData.value?.nit || null,
          razon_social: paymentData.value?.razon_social || null,
          nombre_factura: paymentData.value?.nombre || null,
        });

        factura.value = data.factura;

        // 🔄 Refrescar sesión del usuario (para reflejar nueva suscripción)
        const auth = useAuthStore();
        await auth.fetchMe();

        auth.user.suscripcion_activa = true;
        auth.user.fecha_fin = factura.value?.suscripcion?.fecha_fin || null;

        // ✅ Redirigir a la pantalla de éxito si todo salió bien
        if (factura.value?.idfactura) {
          router.replace({
            name: "pago-exito",
            params: { id: factura.value.idfactura },
          });
        }

        return data;
      } catch (err) {
        error.value = err.response?.data?.message || "Error procesando el pago";
        throw err;
      } finally {
        loading.value = false;
      }
    }

    // 🧹 Reset del flujo completo
    function reset() {
      selectedPlan.value = null;
      selectedTipoPago.value = null;
      paymentData.value = null;
      factura.value = null;
      error.value = null;

      // 🔒 Limpia también el localStorage del store
      localStorage.removeItem("pinia-suscripcion");
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
  },
  {
    // 🔐 Persistencia entre recargas
    persist: {
      storage: localStorage,
    },
  }
);
