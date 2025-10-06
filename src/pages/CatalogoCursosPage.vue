<template>
  <q-page class="q-pa-lg bg-grey-2">
    <!-- Título -->
    <div class="text-h5 text-primary text-center q-mb-xl">
      📚 Lista de Cursos
    </div>
    <q-separator color="primary" inset />

    <!-- 🔎 Barra de filtros -->
    <div class="filtros-container q-mb-lg row q-col-gutter-md">
      <!-- Filtro por nombre -->
      <div class="col-12 col-md-6">
        <div class="q-mb-xs text-grey-7 flex items-center">
          <q-icon name="search" size="16px" class="q-mr-xs" color="primary" />
          <span class="text-caption">Buscar por nombre</span>
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

      <!-- Filtro por categoría -->
      <div class="col-12 col-md-3">
        <div class="q-mb-xs text-grey-7 flex items-center">
          <q-icon
            name="category"
            size="16px"
            class="q-mr-xs"
            color="secondary"
          />
          <span class="text-caption">Filtrar por categoría</span>
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

      <!-- Filtro por nivel -->
      <div class="col-12 col-md-3">
        <div class="q-mb-xs text-grey-7 flex items-center">
          <q-icon name="school" size="16px" class="q-mr-xs" color="primary" />
          <span class="text-caption">Filtrar por nivel</span>
        </div>
        <q-select
          v-model="filtros.nivel"
          :options="nivelesConIcono"
          option-value="value"
          option-label="label"
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

    <!-- Grid de cursos -->
    <div class="row q-col-gutter-lg">
      <div
        v-for="curso in cursosFiltrados"
        :key="curso.idcurso"
        class="col-12 col-md-6 col-lg-4"
      >
        <q-card class="curso-card shadow-4">
          <!-- Imagen con efecto -->
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

          <!-- Info -->
          <q-card-section>
            <!-- Categoría y Nivel -->
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
                  class="text-caption"
                  outline
                  :label="curso.nivel || 'General'"
                />
              </div>
            </div>

            <!-- Descripción -->
            <div class="q-mb-sm">
              <span class="info-label">Descripción:</span>
              <span class="info-value">{{
                curso.descripcion || "Sin descripción"
              }}</span>
            </div>

            <!-- Duración -->
            <div>
              <span class="info-label">Duración:</span>
              <span class="info-value">
                {{
                  curso.duracion_total
                    ? curso.duracion_total + " hrs"
                    : "No definida"
                }}
              </span>
            </div>
          </q-card-section>

          <!-- Footer con corazón y botón -->
          <q-card-actions align="right">
            <q-btn
              flat
              round
              color="red"
              :icon="curso.matriculado ? 'favorite' : 'favorite_border'"
              @click="toggleMatricula(curso)"
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

    <!-- Loader -->
    <div class="row justify-center q-mt-lg" v-if="loading">
      <q-spinner-dots color="primary" size="40px" />
    </div>

    <!-- No hay cursos -->
    <div
      v-if="!loading && cursosFiltrados.length === 0"
      class="text-center text-grey q-mt-lg"
    >
      No hay cursos disponibles por el momento.
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { api } from "boot/axios";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { useAuthStore } from "src/stores/auth";

const $q = useQuasar();
const router = useRouter();
const auth = useAuthStore();

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

async function loadCursos() {
  loading.value = true;
  try {
    const { data } = await api.get("/catalogo/cursos");
    cursos.value = Array.isArray(data.data) ? data.data : data;

    // si es estudiante, cargar los cursos inscritos
    if (auth.isStudent) {
      const { data: inscritos } = await api.get("/mis-cursos");
      const idsInscritos = inscritos.map((m) => m.idcurso);
      cursos.value.forEach((c) => {
        c.matriculado = idsInscritos.includes(c.idcurso);
      });
    }

    // categorías únicas
    categorias.value = [
      ...new Map(
        cursos.value
          .filter((c) => c.categoria)
          .map((c) => [c.categoria.idcategoria, c.categoria])
      ).values(),
    ];
  } catch (err) {
    console.error("❌ Error cargando cursos:", err);
    $q.notify({ type: "negative", message: "Error cargando cursos" });
  } finally {
    loading.value = false;
  }
}

async function toggleMatricula(curso) {
  if (!auth.isStudent) {
    $q.notify({
      type: "warning",
      message: "Debes iniciar sesión como estudiante",
    });
    return;
  }

  try {
    if (!curso.matriculado) {
      // 👉 Suscribir
      await api.post(`/cursos/${curso.idcurso}/inscribir`);
      curso.matriculado = true;
      $q.notify({ type: "positive", message: "Curso añadido a Mis cursos ❤️" });
    } else {
      // 👉 Desuscribir
      await api.post(`/cursos/${curso.idcurso}/desuscribir`);
      curso.matriculado = false;
      $q.notify({ type: "warning", message: "Curso eliminado de Mis cursos" });
    }
  } catch (err) {
    console.error("❌ Error en matrícula:", err);
    $q.notify({ type: "negative", message: "No se pudo actualizar matrícula" });
  }
}

function goCursoDetalle(idcurso) {
  router.push({ name: "curso-detalle", params: { idcurso } });
}

function fixUrl(curso) {
  if (curso.imagen_url) return curso.imagen_url;
  if (curso.imagen) return `http://127.0.0.1:8000/storage/${curso.imagen}`;
  return "/images/curso-placeholder.png";
}

const cursosFiltrados = computed(() => {
  return cursos.value.filter((curso) => {
    const nombre = curso.nombre?.toLowerCase() || "";
    const busqueda = filtros.value.busqueda?.toLowerCase() || "";

    const matchBusqueda = !busqueda || nombre.includes(busqueda);
    const matchCategoria =
      !filtros.value.categoria || curso.idcategoria === filtros.value.categoria;
    const matchNivel =
      !filtros.value.nivel || curso.nivel === filtros.value.nivel;

    return matchBusqueda && matchCategoria && matchNivel;
  });
});

onMounted(() => {
  loadCursos();
});
</script>

<style scoped>
/* 🔎 Filtros */
.filtros-container {
  background: #ffffff;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
}

/* 📦 Cards */
.curso-card {
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}
.curso-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.15);
}

/* 🖼 Imagen */
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

/* Labels */
.info-label {
  font-weight: 600;
  color: #37474f;
  margin-right: 4px;
}
.info-value {
  color: #455a64;
}
</style>
