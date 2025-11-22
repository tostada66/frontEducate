<template>
  <q-page class="q-pa-lg bg-grey-2">
    <!-- 🧾 Título -->
    <div class="titulo-mis-cursos q-mb-xl">❤️ Mis Cursos Inscritos</div>

    <q-separator color="primary" inset />

    <!-- 🔍 Barra de filtros -->
    <div class="filtros-container q-mb-lg row q-col-gutter-md">
      <!-- Buscar por nombre -->
      <div class="col-12 col-md-4">
        <div class="q-mb-xs text-grey-7 flex items-center">
          <q-icon name="search" size="18px" class="q-mr-xs" color="primary" />
          <span class="filtro-label">Buscar por nombre</span>
        </div>
        <q-input
          v-model="filtros.busqueda"
          outlined
          rounded
          standout="bg-white text-primary"
          dense
          placeholder="Ej. Algoritmos"
          clearable
          debounce="300"
        />
      </div>

      <!-- Categoría -->
      <div class="col-12 col-md-3">
        <div class="q-mb-xs text-grey-7 flex items-center">
          <q-icon
            name="category"
            size="18px"
            class="q-mr-xs"
            color="secondary"
          />
          <span class="filtro-label">Categoría</span>
        </div>
        <q-select
          v-model="filtros.categoria"
          :options="categorias"
          option-value="idcategoria"
          option-label="nombre"
          outlined
          rounded
          standout="bg-white text-primary"
          dense
          clearable
          emit-value
          map-options
          placeholder="Selecciona categoría"
        />
      </div>

      <!-- Nivel -->
      <div class="col-12 col-md-3">
        <div class="q-mb-xs text-grey-7 flex items-center">
          <q-icon name="school" size="18px" class="q-mr-xs" color="primary" />
          <span class="filtro-label">Nivel</span>
        </div>
        <q-select
          v-model="filtros.nivel"
          :options="nivelesConIcono"
          option-value="value"
          option-label="label"
          emit-value
          map-options
          outlined
          rounded
          standout="bg-white text-primary"
          dense
          clearable
          placeholder="Selecciona nivel"
        >
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section avatar>
                <q-icon :name="scope.opt.icon" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ scope.opt.label }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>
    </div>

    <!-- Loader -->
    <div v-if="loading" class="row justify-center q-mt-lg">
      <q-spinner-dots color="primary" size="40px" />
    </div>

    <!-- 📚 Grid de cursos -->
    <div v-else-if="cursosFiltrados.length" class="row q-col-gutter-lg q-mt-lg">
      <div
        v-for="curso in cursosFiltrados"
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
              <div class="curso-titulo">Curso: {{ curso.nombre }}</div>
            </div>
          </div>

          <!-- Información -->
          <q-card-section>
            <div class="row items-center justify-between q-mb-sm">
              <div class="row items-center">
                <span class="info-label q-mr-sm">
                  <q-icon name="category" size="18px" class="q-mr-xs" />
                  Categoría:
                </span>
                <q-badge
                  color="secondary"
                  class="text-caption"
                  :label="curso.categoria?.nombre || 'Sin categoría'"
                />
              </div>
              <div class="row items-center">
                <span class="info-label q-mr-sm">
                  <q-icon name="school" size="18px" class="q-mr-xs" />
                  Nivel:
                </span>
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
              <span class="info-label">
                <q-icon name="person" size="18px" class="q-mr-xs" />
                Profesor:
              </span>
              <span class="info-value">
                {{ curso.profesor?.nombre_completo || "No asignado" }}
              </span>
            </div>

            <!-- 📝 Descripción -->
            <div class="q-mb-sm">
              <span class="info-label">
                <q-icon name="description" size="18px" class="q-mr-xs" />
                Descripción:
              </span>
              <span class="info-value">
                {{ curso.descripcion || "Sin descripción" }}
              </span>
            </div>

            <!-- ⏱ Duración -->
            <div class="q-mb-sm">
              <span class="info-label">
                <q-icon name="schedule" size="18px" class="q-mr-xs" />
                Duración:
              </span>
              <span class="info-value">
                {{
                  curso.duracion_total
                    ? formatearDuracion(curso.duracion_total)
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
import { ref, onMounted, computed } from "vue";
import { api } from "boot/axios";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";

const $q = useQuasar();
const router = useRouter();

const cursos = ref([]);
const categorias = ref([]);
const loading = ref(false);

const filtros = ref({
  busqueda: "",
  categoria: null,
  nivel: null,
});

const nivelesConIcono = [
  { label: "Básico", value: "Básico", icon: "school" },
  { label: "Intermedio", value: "Intermedio", icon: "trending_up" },
  { label: "Avanzado", value: "Avanzado", icon: "workspace_premium" },
];

// 🔹 Normalizar texto
function normalize(input) {
  if (input == null) return "";
  const str = typeof input === "string" ? input : String(input);
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

// 🕒 Formatear duración (segundos -> h:mm:ss / m:ss / Xs)
function formatearDuracion(segundos) {
  if (!segundos || segundos <= 0) return "No definida";

  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  const s = segundos % 60;

  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  if (m > 0) {
    return `${m}:${String(s).padStart(2, "0")}`;
  }
  return `${s}s`;
}

// 🧠 Cargar mis cursos
async function loadMisCursos() {
  loading.value = true;
  try {
    const { data } = await api.get("/mis-cursos");
    cursos.value = Array.isArray(data) ? data : [];

    // categorías únicas
    categorias.value = [
      ...new Map(
        cursos.value
          .filter((c) => c.categoria)
          .map((c) => [c.categoria.idcategoria, c.categoria])
      ).values(),
    ];
  } catch (err) {
    console.error("❌ Error cargando mis cursos:", err);
    $q.notify({ type: "negative", message: "Error cargando tus cursos" });
  } finally {
    loading.value = false;
  }
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

// ➡️ Navegar al detalle del curso
function goCursoDetalle(idcurso) {
  router.push({ name: "curso-detalle", params: { idcurso } });
}

// ➡️ Ir al catálogo general
function goCatalogo() {
  router.push({ name: "catalogo-cursos" });
}

// 🔍 Filtros
const cursosFiltrados = computed(() => {
  return cursos.value.filter((curso) => {
    const nombre = normalize(curso.nombre);
    const busqueda = normalize(filtros.value.busqueda);

    const matchBusqueda = !busqueda || nombre.includes(busqueda);
    const matchCategoria =
      !filtros.value.categoria || curso.idcategoria === filtros.value.categoria;
    const matchNivel =
      !filtros.value.nivel ||
      normalize(curso.nivel) === normalize(filtros.value.nivel);

    return matchBusqueda && matchCategoria && matchNivel;
  });
});

onMounted(() => {
  loadMisCursos();
});
</script>

<style scoped>
/* 🔹 Título principal */
.titulo-mis-cursos {
  font-size: 2rem;
  font-weight: 700;
  color: #1565c0;
  text-align: center;
}

/* 🔹 Caja de filtros */
.filtros-container {
  background: #ffffff;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
}

/* Texto de las etiquetas de los filtros */
.filtro-label {
  font-size: 1rem; /* súbelo a 1.1rem si lo quieres aún más grande */
  font-weight: 600;
  color: #37474f;
}

/* Texto dentro de los inputs/selects del filtro */
:deep(.filtros-container .q-field__native) {
  font-size: 1rem;
}

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
  padding: 10px 14px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
}
.curso-titulo {
  color: #fff;
  font-size: 1.3rem;
  font-weight: 700;
}

/* Info texto dentro de la tarjeta */
.info-label {
  font-weight: 600;
  font-size: 1rem;
  color: #37474f;
  margin-right: 4px;
  display: inline-flex;
  align-items: center;
}
.info-value {
  font-size: 0.98rem;
  color: #455a64;
}
</style>
