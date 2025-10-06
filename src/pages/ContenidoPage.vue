<!-- src/pages/ContenidoDetallePage.vue -->
<template>
  <q-page class="q-pa-md bg-grey-2">
    <!-- 🔷 Aviso modo profesor -->
    <div
      v-if="isProfesor"
      class="bg-primary text-white text-center q-pa-sm q-mb-md"
    >
      <q-icon name="visibility" class="q-mr-xs" />
      Vista previa del contenido (Profesor)
    </div>

    <!-- Loader -->
    <div v-if="loading" class="row justify-center q-mt-lg">
      <q-spinner-dots color="primary" size="40px" />
    </div>

    <div v-else class="row q-col-gutter-md">
      <!-- 📺 Columna izquierda (solo videos) -->
      <div class="col-12 col-md-8">
        <!-- Título -->
        <div class="text-h5 text-primary text-bold q-mb-sm">
          {{ contenido?.titulo }}
        </div>
        <div class="text-grey-7 q-mb-lg">
          {{ contenido?.descripcion }}
        </div>

        <!-- 🎥 Video -->
        <div v-if="contenido?.tipo === 'video'" class="video-container q-mb-lg">
          <video controls autoplay style="width: 100%; border-radius: 12px">
            <source :src="contenido?.archivo" type="video/mp4" />
            Tu navegador no soporta videos.
          </video>
        </div>

        <!-- ⚠️ Si no es video -->
        <div v-else>
          <q-banner rounded class="bg-orange-2 text-orange-9">
            Este contenido no es un video. Usa la pestaña <b>Contenidos</b> para
            abrir imágenes o documentos.
          </q-banner>
        </div>
      </div>

      <!-- 📋 Columna derecha (lista lateral) -->
      <div class="col-12 col-md-4">
        <!-- Botones de filtro -->
        <div class="row q-mb-md">
          <q-btn
            flat
            :color="currentTab === 'clases' ? 'primary' : 'grey'"
            label="Ver Clases"
            class="q-mr-sm"
            @click="currentTab = 'clases'"
          />
          <q-btn
            flat
            :color="currentTab === 'contenidos' ? 'primary' : 'grey'"
            label="Contenidos"
            @click="currentTab = 'contenidos'"
          />
        </div>

        <!-- Lista de clases -->
        <div v-if="currentTab === 'clases'">
          <q-list bordered class="rounded-borders">
            <q-item
              v-for="clase in clases"
              :key="clase.idclase"
              clickable
              @click="goToClase(clase)"
            >
              <q-item-section avatar>
                <q-avatar square size="80px" class="relative-position">
                  <img
                    :src="
                      clase.miniatura_publica ||
                      'https://via.placeholder.com/120x80'
                    "
                    alt="miniatura clase"
                    style="
                      width: 100%;
                      height: 100%;
                      object-fit: cover;
                      border-radius: 6px;
                    "
                  />
                  <q-icon
                    v-if="clase.miniatura_publica"
                    name="play_circle"
                    color="white"
                    size="32px"
                    class="absolute-center"
                    style="text-shadow: 0px 0px 6px rgba(0, 0, 0, 0.7)"
                  />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ clase.titulo }}</q-item-label>
                <q-item-label caption>{{ clase.descripcion }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <!-- Lista de contenidos (docs e imágenes → se abren aparte) -->
        <div v-else-if="currentTab === 'contenidos'">
          <q-list bordered class="rounded-borders">
            <q-item
              v-for="c in otrosContenidos"
              :key="c.idcontenido"
              clickable
              @click="goToContenido(c)"
            >
              <q-item-section avatar>
                <!-- Imagen -->
                <q-avatar v-if="c.tipo === 'imagen'" square size="80px">
                  <img
                    :src="c.archivo"
                    alt="preview"
                    style="
                      width: 100%;
                      height: 100%;
                      object-fit: cover;
                      border-radius: 6px;
                    "
                  />
                </q-avatar>

                <!-- Documento -->
                <q-avatar
                  v-else
                  square
                  size="80px"
                  class="bg-blue text-white flex flex-center"
                >
                  <q-icon :name="getDocIcon(c.archivo)" size="md" />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label>{{ c.titulo }}</q-item-label>
                <q-item-label caption>{{ c.tipo }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { api } from "boot/axios";
import { useQuasar } from "quasar";
import { useAuthStore } from "src/stores/auth";

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const auth = useAuthStore();

const contenido = ref(null);
const clases = ref([]);
const otrosContenidos = ref([]);
const loading = ref(false);
const currentTab = ref("clases");

// 🔑 Roles
const isProfesor = computed(() => {
  return auth.role === "profesor" || route.name?.startsWith("profesor-");
});
const isAdmin = computed(() => {
  return auth.role === "admin" || route.name?.startsWith("admin-");
});

// 📄 Iconos documentos
function getDocIcon(url = "") {
  const lower = url.toLowerCase();
  if (lower.endsWith(".pdf")) return "picture_as_pdf";
  if (lower.endsWith(".doc") || lower.endsWith(".docx")) return "description";
  if (lower.endsWith(".xls") || lower.endsWith(".xlsx")) return "grid_on";
  if (lower.endsWith(".ppt") || lower.endsWith(".pptx")) return "slideshow";
  return "insert_drive_file";
}

// 📂 Cargar contenido + clases + otros contenidos
async function loadContenido() {
  loading.value = true;
  try {
    const { idcurso, idunidad, idclase, idcontenido } = route.params;

    const { data } = await api.get(
      `/cursos/${idcurso}/unidades/${idunidad}/clases/${idclase}/contenidos/${idcontenido}`
    );
    contenido.value = data;

    const { data: dataClases } = await api.get(
      `/cursos/${idcurso}/unidades/${idunidad}/clases`
    );
    clases.value = dataClases;

    const { data: dataContenidos } = await api.get(
      `/cursos/${idcurso}/unidades/${idunidad}/clases/${idclase}/contenidos`
    );
    otrosContenidos.value = dataContenidos.filter(
      (c) => c.idcontenido !== parseInt(idcontenido)
    );
  } catch (err) {
    console.error("❌ Error cargando contenido:", err);
    $q.notify({ type: "negative", message: "Error cargando contenido" });
  } finally {
    loading.value = false;
  }
}

// 📂 Navegación a otra clase
function goToClase(clase) {
  let routeName = "clase-detalle";
  if (isProfesor.value) routeName = "profesor-unidad-detalle";
  else if (isAdmin.value) routeName = "admin-unidad-detalle";

  router.push({
    name: routeName,
    params: {
      idcurso: route.params.idcurso,
      idunidad: route.params.idunidad,
      idclase: clase.idclase,
    },
  });
}

// 📂 Navegación a otro contenido (imagen o documento)
function goToContenido(c) {
  let routeName = "contenido-docs";
  if (isProfesor.value) routeName = "profesor-contenido-docs";
  else if (isAdmin.value) routeName = "admin-contenido-docs";

  router.push({
    name: routeName,
    params: {
      idcurso: route.params.idcurso,
      idunidad: route.params.idunidad,
      idclase: route.params.idclase,
      idcontenido: c.idcontenido,
    },
  });
}

onMounted(() => {
  loadContenido();
});
</script>

<style scoped>
.video-container {
  width: 100%;
  max-width: 100%;
  margin: auto;
}
</style>
