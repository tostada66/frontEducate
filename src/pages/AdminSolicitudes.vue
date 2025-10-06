<template>
  <q-page class="q-pa-md bg-grey-2">
    <div class="text-h5 text-primary q-mb-md">Solicitudes de Profesores</div>

    <q-inner-loading :showing="loading">
      <q-spinner size="40px" color="primary" />
    </q-inner-loading>

    <div
      v-if="profesores.length === 0 && !loading"
      class="text-grey text-center q-mt-xl"
    >
      No hay solicitudes pendientes por el momento.
    </div>

    <div class="column q-gutter-md">
      <q-card
        v-for="profe in profesores"
        :key="profe.idprofesor"
        bordered
        flat
        class="shadow-2"
      >
        <q-card-section>
          <div class="row items-center">
            <!-- Foto -->
            <q-avatar size="70px" class="q-mr-md">
              <img
                :src="
                  profe.usuario?.foto_url ||
                  profe.foto_url ||
                  'https://via.placeholder.com/100x100'
                "
                alt="foto"
              />
            </q-avatar>

            <!-- Datos -->
            <div class="col">
              <div class="text-h6">
                {{ profe.usuario?.nombres || profe.nombres }}
                {{ profe.usuario?.apellidos || profe.apellidos }}
              </div>
              <div class="text-caption text-grey-7">
                {{ profe.especialidad || "Sin especialidad" }}
              </div>
              <div class="text-caption text-grey">
                {{ profe.empresa || "Sin institución" }}
              </div>
              <div class="text-caption text-orange">
                Estado: {{ profe.estado_aprobacion || "pendiente" }}
              </div>
            </div>

            <!-- Botón a la derecha -->
            <div class="col-auto">
              <q-btn
                color="primary"
                label="Ver detalle"
                icon="visibility"
                @click="verDetalle(profe)"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { api } from "boot/axios";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";

const profesores = ref([]);
const loading = ref(false);
const $q = useQuasar();
const router = useRouter();

async function loadSolicitudes() {
  loading.value = true;
  try {
    const { data } = await api.get("/admin/profesores/solicitudes");
    profesores.value = Array.isArray(data) ? data : data?.data || [];
  } catch (err) {
    $q.notify({ type: "negative", message: "Error cargando solicitudes" });
  } finally {
    loading.value = false;
  }
}

function verDetalle(profe) {
  router.push({
    name: "admin-profesor-detalle",
    params: { idprofesor: profe.idprofesor },
  });
}

onMounted(() => {
  loadSolicitudes();
});
</script>
