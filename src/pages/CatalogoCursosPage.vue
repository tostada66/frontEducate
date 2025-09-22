<template>
  <q-page class="q-pa-md bg-grey-2">
    <div class="text-h4 text-primary text-center q-mb-lg">
      📚 Catálogo de Cursos
    </div>

    <!-- Grid de cursos -->
    <div class="row q-col-gutter-md">
      <div
        v-for="curso in cursos"
        :key="curso.idcurso"
        class="col-12 col-md-6 col-lg-4"
      >
        <q-card class="my-card shadow-3">
          <!-- Imagen -->
          <q-img
            :src="
              curso.imagen_url ||
              'https://via.placeholder.com/600x300?text=Curso'
            "
            ratio="16/9"
          >
            <div
              class="absolute-bottom bg-black bg-opacity-50 text-white q-pa-sm"
            >
              <div class="text-subtitle1">
                {{ curso.nombre }}
              </div>
            </div>
          </q-img>

          <!-- Info -->
          <q-card-section>
            <div class="text-subtitle2 text-grey-7 q-mb-xs">
              {{ curso.nivel || "General" }}
            </div>

            <div class="q-mb-sm text-body2 ellipsis-3-lines">
              {{ curso.descripcion || "Sin descripción" }}
            </div>

            <div class="row items-center q-mt-sm text-caption text-grey-8">
              <q-icon name="schedule" size="16px" class="q-mr-xs" />
              <span>{{
                curso.duracion
                  ? curso.duracion + " hrs"
                  : "Duración no definida"
              }}</span>
            </div>
          </q-card-section>

          <!-- Footer -->
          <q-card-actions align="between">
            <q-badge
              color="secondary"
              :label="curso.categoria?.nombre || 'Sin categoría'"
            />
            <q-btn
              color="primary"
              flat
              label="Ver curso"
              @click="goCursoDetalle(curso.idcurso)"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- Loader -->
    <div class="row justify-center q-mt-lg" v-if="loading">
      <q-spinner-dots color="primary" size="40px" />
    </div>

    <!-- No hay cursos -->
    <div
      v-if="!loading && cursos.length === 0"
      class="text-center text-grey q-mt-lg"
    >
      No hay cursos disponibles por el momento.
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { api } from "boot/axios";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";

const $q = useQuasar();
const router = useRouter();

const cursos = ref([]);
const loading = ref(false);

async function loadCursos() {
  loading.value = true;
  try {
    const { data } = await api.get("/catalogo/cursos");
    cursos.value = data.data || data;
  } catch (err) {
    console.error("❌ Error cargando cursos:", err);
    $q.notify({ type: "negative", message: "Error cargando cursos" });
  } finally {
    loading.value = false;
  }
}

function goCursoDetalle(idcurso) {
  router.push({ name: "curso-detalle", params: { idcurso } });
}

onMounted(() => {
  loadCursos();
});
</script>

<style scoped>
.my-card {
  transition: transform 0.2s;
  border-radius: 12px;
}
.my-card:hover {
  transform: translateY(-5px);
}
.ellipsis-3-lines {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
