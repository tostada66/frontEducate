<template>
  <q-page class="q-pa-md">
    <!-- Encabezado -->
    <div class="row items-center q-mb-md">
      <div class="text-h6">📚 Cursos disponibles</div>
    </div>

    <!-- Lista de cursos -->
    <q-card v-for="curso in cursos" :key="curso.idcurso" class="q-mb-md">
      <q-card-section>
        <div class="row items-center">
          <!-- Imagen -->
          <q-img
            v-if="curso.imagen_url"
            :src="curso.imagen_url"
            style="width: 120px; height: 80px; border-radius: 6px"
            class="q-mr-md"
            contain
          />

          <!-- Info -->
          <div class="col">
            <div class="text-h6">{{ curso.nombre }}</div>
            <div class="text-subtitle2 text-grey-7">
              {{ curso.descripcion || "Sin descripción" }}
            </div>
            <q-badge
              :color="
                curso.nivel === 'Avanzado'
                  ? 'red'
                  : curso.nivel === 'Intermedio'
                  ? 'orange'
                  : 'green'
              "
              class="q-mt-sm"
            >
              {{ curso.nivel || "Básico" }}
            </q-badge>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn
          color="primary"
          flat
          label="Ver detalles"
          @click="verCurso(curso.idcurso)"
        />
      </q-card-actions>
    </q-card>

    <!-- Loader -->
    <div v-if="loading" class="text-center q-mt-lg">
      <q-spinner-dots color="primary" size="40px" />
      <div class="text-grey">Cargando cursos...</div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { api } from "boot/axios";
import { useRouter } from "vue-router";

const router = useRouter();
const cursos = ref([]);
const loading = ref(false);

async function loadCursos() {
  loading.value = true;
  try {
    const { data } = await api.get("/catalogo/cursos");
    cursos.value = data.data || data; // soporta paginate
  } catch (err) {
    console.error("❌ Error cargando cursos:", err.response?.data || err);
  } finally {
    loading.value = false;
  }
}

function verCurso(idcurso) {
  router.push({ name: "curso-detalle", params: { idcurso } });
}

onMounted(() => {
  loadCursos();
});
</script>
