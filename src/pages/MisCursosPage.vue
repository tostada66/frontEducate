<template>
  <q-page class="q-pa-lg bg-grey-2">
    <!-- 🧾 Título -->
    <div class="text-h5 text-primary text-center q-mb-xl">
      ❤️ Mis Cursos Inscritos
    </div>

    <q-separator color="primary" inset />

    <!-- Loader -->
    <div v-if="loading" class="row justify-center q-mt-lg">
      <q-spinner-dots color="primary" size="40px" />
    </div>

    <!-- 📚 Grid de cursos -->
    <div v-else-if="cursos.length" class="row q-col-gutter-lg q-mt-lg">
      <div
        v-for="curso in cursos"
        :key="curso.idcurso"
        class="col-12 col-md-6 col-lg-4"
      >
        <q-card class="curso-card shadow-4">
          <!-- Imagen -->
          <div class="curso-img-container">
            <img
              :src="fixUrl(curso)"
              alt="Imagen del curso"
              class="curso-img"
            />
            <div class="curso-overlay">
              <div class="curso-titulo">{{ curso.nombre }}</div>
            </div>
          </div>

          <!-- Información -->
          <q-card-section>
            <div class="row items-center justify-between q-mb-sm">
              <div class="row items-center">
                <span class="info-label q-mr-sm">Categoría:</span>
                <q-badge
                  color="secondary"
                  class="text-caption"
                  :label="curso.categoria?.nombre || 'Sin categoría'"
                />
              </div>
              <div class="row items-center">
                <span class="info-label q-mr-sm">Nivel:</span>
                <q-badge
                  color="primary"
                  outline
                  class="text-caption"
                  :label="curso.nivel || 'General'"
                />
              </div>
            </div>

            <!-- 👨‍🏫 Profesor -->
            <div class="q-mb-sm">
              <span class="info-label">Profesor:</span>
              <span class="info-value">
                {{ curso.profesor?.nombre_completo || "No asignado" }}
              </span>
            </div>

            <div class="q-mb-sm">
              <span class="info-label">Descripción:</span>
              <span class="info-value">
                {{ curso.descripcion || "Sin descripción" }}
              </span>
            </div>

            <div class="q-mb-sm">
              <span class="info-label">Duración:</span>
              <span class="info-value">
                {{
                  curso.duracion_total
                    ? curso.duracion_total + " hrs"
                    : "No definida"
                }}
              </span>
            </div>

            <!-- 🔹 Progreso -->
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

          <!-- Acciones -->
          <q-card-actions align="right">
            <q-btn
              flat
              round
              color="red"
              icon="favorite"
              @click="desuscribirCurso(curso)"
            />
            <q-btn
              color="primary"
              glossy
              label="Ver curso"
              @click="goCursoDetalle(curso.idcurso)"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- Mensaje vacío -->
    <div v-else class="text-center text-grey q-mt-xl">
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

// 🧠 Cargar mis cursos con info detallada
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

// ➡️ Navegar al detalle del curso
function goCursoDetalle(idcurso) {
  router.push({ name: "curso-detalle", params: { idcurso } });
}

// ➡️ Ir al catálogo general
function goCatalogo() {
  router.push({ name: "catalogo-cursos" });
}

// 💔 Desuscribir curso
async function desuscribirCurso(curso) {
  try {
    await api.post(`/cursos/${curso.idcurso}/desuscribir`);
    cursos.value = cursos.value.filter((c) => c.idcurso !== curso.idcurso);
    $q.notify({ type: "warning", message: "Curso eliminado de Mis Cursos" });
  } catch (err) {
    console.error("❌ Error al desuscribir:", err);
    $q.notify({ type: "negative", message: "No se pudo eliminar el curso" });
  }
}

// 🖼️ Fix URL imagen
function fixUrl(curso) {
  if (curso.imagen_url) return curso.imagen_url;
  if (curso.imagen) return `http://127.0.0.1:8000/storage/${curso.imagen}`;
  return "/images/curso-placeholder.png";
}

onMounted(() => {
  loadMisCursos();
});
</script>

<style scoped>
.curso-card {
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}
.curso-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.15);
}
.curso-img-container {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
}
.curso-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}
.curso-card:hover .curso-img {
  transform: scale(1.1);
}
.curso-overlay {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 8px 12px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.65), transparent);
}
.curso-titulo {
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
}
.info-label {
  font-weight: 600;
  color: #37474f;
  margin-right: 4px;
}
.info-value {
  color: #455a64;
}
</style>
