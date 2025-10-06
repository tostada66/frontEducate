<template>
  <q-page class="q-pa-lg bg-grey-1">
    <!-- Título -->
    <div class="text-h5 text-primary text-center q-mb-xl">❤️ Mis Cursos</div>
    <q-separator color="primary" inset />

    <!-- Grid de cursos -->
    <div v-if="cursos.length" class="row q-col-gutter-lg q-mt-lg">
      <div
        v-for="curso in cursos"
        :key="curso.idcurso"
        class="col-12 col-md-6 col-lg-4"
      >
        <q-card class="curso-card shadow-4">
          <!-- Imagen -->
          <q-img
            :src="fixUrl(curso)"
            :alt="curso.nombre"
            height="180px"
            class="curso-img"
          />

          <!-- Info -->
          <q-card-section>
            <div class="text-subtitle1 text-bold q-mb-xs">
              {{ curso.nombre }}
            </div>
            <div class="text-caption text-grey q-mb-sm">
              {{ curso.categoria?.nombre || "Sin categoría" }}
            </div>

            <!-- Progreso -->
            <div class="q-mt-sm">
              <div class="text-caption text-grey-8 q-mb-xs">
                Avance del curso
              </div>
              <q-linear-progress
                :value="(curso.porcentaje_avance || 0) / 100"
                color="primary"
                size="18px"
                stripe
                rounded
              />
              <div class="text-caption text-right text-primary q-mt-xs">
                {{ curso.porcentaje_avance || 0 }}%
              </div>
            </div>
          </q-card-section>

          <!-- Footer -->
          <q-card-actions align="right">
            <q-btn
              color="primary"
              glossy
              label="Ir al curso"
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

    <!-- Mensaje vacío -->
    <div
      v-if="!loading && cursos.length === 0"
      class="text-center text-grey q-mt-xl"
    >
      Aún no te has inscrito en ningún curso.
      <div class="q-mt-sm">
        <q-btn color="primary" label="Explorar cursos" @click="goCatalogo" />
      </div>
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

async function loadMisCursos() {
  loading.value = true;
  try {
    const { data } = await api.get("/mis-cursos");
    cursos.value = Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("❌ Error cargando mis cursos:", err);
    $q.notify({ type: "negative", message: "Error cargando tus cursos" });
  } finally {
    loading.value = false;
  }
}

function goCursoDetalle(idcurso) {
  router.push({ name: "curso-detalle", params: { idcurso } });
}

function goCatalogo() {
  router.push({ name: "catalogo-cursos" });
}

function fixUrl(curso) {
  if (curso.curso?.imagen_url) return curso.curso.imagen_url;
  if (curso.curso?.imagen)
    return `http://127.0.0.1:8000/storage/${curso.curso.imagen}`;
  if (curso.imagen) return `http://127.0.0.1:8000/storage/${curso.imagen}`;
  return "/images/curso-placeholder.png";
}

onMounted(() => {
  loadMisCursos();
});
</script>

<style scoped>
.curso-card {
  border-radius: 14px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}
.curso-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.15);
}
.curso-img {
  object-fit: cover;
}
</style>
