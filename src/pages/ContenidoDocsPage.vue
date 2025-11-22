<!-- src/pages/ContenidoDocsPage.vue -->
<template>
  <q-page class="q-pa-md bg-grey-2">
    <!-- 🔷 Aviso modo profesor -->
    <div
      v-if="isProfesor"
      class="bg-primary text-white text-center q-pa-sm q-mb-md"
    >
      <q-icon name="visibility" class="q-mr-xs" />
      Vista previa del documento (Profesor)
    </div>

    <!-- Loader -->
    <div v-if="loading" class="row justify-center q-mt-lg">
      <q-spinner-dots color="primary" size="40px" />
    </div>

    <div v-else>
      <!-- Título -->
      <div class="text-h5 text-primary text-bold q-mb-sm">
        {{ contenido?.titulo }}
      </div>
      <div class="text-grey-7 q-mb-lg">
        {{ contenido?.descripcion }}
      </div>

      <!-- 🖼️ Imagen -->
      <div v-if="contenido?.tipo === 'imagen'" class="q-mb-lg">
        <q-img
          :src="contenido?.archivo"
          spinner-color="primary"
          style="max-width: 100%; border-radius: 12px; cursor: zoom-in"
          @click="zoomImg = true"
        />

        <!-- Fullscreen para zoom -->
        <q-dialog v-model="zoomImg" maximized>
          <q-card class="bg-black flex flex-center">
            <q-img
              :src="contenido?.archivo"
              fit="contain"
              style="max-width: 100%; max-height: 100vh"
            >
              <template v-slot:append>
                <q-btn
                  dense
                  flat
                  round
                  color="white"
                  icon="close"
                  class="absolute-top-right q-ma-md"
                  v-close-popup
                />
              </template>
            </q-img>
          </q-card>
        </q-dialog>
      </div>

      <!-- 📄 Documento -->
      <div v-else-if="contenido?.tipo === 'documento'" class="q-mb-lg">
        <q-card class="shadow-3 q-pa-md">
          <div class="text-subtitle1 text-bold q-mb-sm">
            Vista previa del documento
          </div>

          <!-- PDF directo -->
          <iframe
            v-if="contenido?.archivo?.toLowerCase().endsWith('.pdf')"
            :src="contenido?.archivo"
            width="100%"
            height="600px"
            style="border: none; border-radius: 8px"
          ></iframe>

          <!-- Word/Excel/PPT con Google Docs Viewer SOLO si no es local -->
          <iframe
            v-else-if="
              isOfficeDoc(contenido?.archivo) && !isLocalUrl(contenido?.archivo)
            "
            :src="`https://docs.google.com/gview?url=${encodeURIComponent(
              contenido?.archivo
            )}&embedded=true`"
            width="100%"
            height="600px"
            style="border: none; border-radius: 8px"
          ></iframe>

          <!-- Si es Office local u otro tipo -->
          <div v-else class="row items-center q-col-gutter-md">
            <div class="col-auto">
              <q-avatar
                size="64px"
                :color="getDocColor(contenido?.archivo)"
                text-color="white"
              >
                <q-icon :name="getDocIcon(contenido?.archivo)" size="32px" />
              </q-avatar>
            </div>
            <div class="col">
              <div class="text-body1 text-bold">
                {{ contenido?.titulo || "Documento" }}
              </div>
              <div class="text-caption text-grey">
                Archivo disponible para descargar
              </div>
              <q-btn
                :href="contenido?.archivo"
                target="_blank"
                color="primary"
                icon="download"
                label="Descargar documento"
                class="q-mt-sm"
              />
            </div>
          </div>
        </q-card>
      </div>

      <!-- ⚠️ Otros tipos no soportados -->
      <div v-else>
        <q-banner rounded class="bg-orange-2 text-orange-9">
          Tipo de contenido no soportado en esta vista.
        </q-banner>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { api } from "boot/axios";
import { useQuasar } from "quasar";
import { useAuthStore } from "src/stores/auth";

const route = useRoute();
const $q = useQuasar();
const auth = useAuthStore();

const contenido = ref(null);
const loading = ref(false);
const zoomImg = ref(false);

// 🔑 Roles
const isProfesor = computed(() => {
  return auth.role === "profesor" || route.name?.startsWith("profesor-");
});
const isAdmin = computed(() => {
  return auth.role === "admin" || route.name?.startsWith("admin-");
});

// 📂 Cargar contenido
async function loadContenido() {
  loading.value = true;
  try {
    const { idcurso, idunidad, idclase, idcontenido } = route.params;

    // ✅ Mismo endpoint para todos (admin, profesor, estudiante)
    const { data } = await api.get(
      `/cursos/${idcurso}/unidades/${idunidad}/clases/${idclase}/contenidos/${idcontenido}`
    );

    contenido.value = data;
  } catch (err) {
    console.error("❌ Error cargando contenido:", err);
    $q.notify({ type: "negative", message: "Error cargando contenido" });
  } finally {
    loading.value = false;
  }
}

/** Detectar si es Word, Excel o PowerPoint */
function isOfficeDoc(url = "") {
  const lower = url.toLowerCase();
  return (
    lower.endsWith(".doc") ||
    lower.endsWith(".docx") ||
    lower.endsWith(".xls") ||
    lower.endsWith(".xlsx") ||
    lower.endsWith(".ppt") ||
    lower.endsWith(".pptx")
  );
}

/** Detectar si la URL es local */
function isLocalUrl(url = "") {
  return url.includes("localhost") || url.includes("127.0.0.1");
}

/** Iconos y colores */
function getDocIcon(url = "") {
  const lower = url.toLowerCase();
  if (lower.endsWith(".doc") || lower.endsWith(".docx")) return "description";
  if (lower.endsWith(".xls") || lower.endsWith(".xlsx")) return "grid_on";
  if (lower.endsWith(".ppt") || lower.endsWith(".pptx")) return "slideshow";
  return "insert_drive_file";
}

function getDocColor(url = "") {
  const lower = url.toLowerCase();
  if (lower.endsWith(".doc") || lower.endsWith(".docx")) return "blue-8";
  if (lower.endsWith(".xls") || lower.endsWith(".xlsx")) return "green-8";
  if (lower.endsWith(".ppt") || lower.endsWith(".pptx")) return "red-8";
  return "grey-6";
}

onMounted(() => {
  loadContenido();
});
</script>
