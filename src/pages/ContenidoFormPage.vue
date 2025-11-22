<template>
  <q-page class="q-pa-md flex flex-center">
    <q-card style="max-width: 600px; width: 100%">
      <!-- Encabezado -->
      <q-card-section>
        <div class="text-h6 text-primary text-center">
          {{ isEdit ? "Editar Contenido" : "Nuevo Contenido" }}
        </div>
      </q-card-section>

      <!-- Formulario -->
      <q-card-section class="q-gutter-md">
        <!-- Título -->
        <q-input v-model="form.titulo" label="Título" outlined dense />

        <!-- Tipo detectado automáticamente -->
        <q-input
          v-model="form.tipo"
          label="Tipo detectado"
          outlined
          dense
          disable
        />

        <!-- Campo archivo -->
        <q-file
          v-model="archivoFile"
          label="Seleccionar archivo"
          outlined
          dense
          counter
          accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
          @update:model-value="onFileChange"
        >
          <template v-slot:prepend>
            <q-icon name="attach_file" />
          </template>
        </q-file>

        <!-- 📌 Solo si es VIDEO: portada opcional -->
        <q-file
          v-if="form.tipo === 'video'"
          v-model="miniaturaFile"
          label="Subir portada (opcional)"
          outlined
          dense
          counter
          accept="image/*"
        >
          <template v-slot:prepend>
            <q-icon name="image" />
          </template>
        </q-file>

        <!-- 📸 Preview de la portada -->
        <div v-if="miniaturaFile" class="q-mt-md text-center">
          <q-img
            :src="URL.createObjectURL(miniaturaFile)"
            style="max-width: 200px; max-height: 120px; border-radius: 8px"
            spinner-color="primary"
          />
          <div class="text-caption text-grey q-mt-xs">
            Vista previa de portada
          </div>
        </div>

        <!-- Progreso de subida -->
        <div v-if="uploadProgress > 0" class="q-mt-md">
          <q-linear-progress
            :value="uploadProgress / 100"
            color="primary"
            size="20px"
            rounded
            stripe
            class="shadow-2"
          />
          <div class="text-caption text-center q-mt-sm">
            Subiendo... {{ uploadProgress }}%
          </div>
        </div>

        <!-- Descripción -->
        <q-input
          v-model="form.descripcion"
          label="Descripción"
          type="textarea"
          outlined
          dense
        />
      </q-card-section>

      <!-- Acciones -->
      <q-card-actions align="right">
        <q-btn flat label="Cancelar" @click="goBack" />
        <q-btn
          color="primary"
          :label="isEdit ? 'Actualizar' : 'Guardar'"
          @click="saveContenido"
          :loading="loading"
        />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { api } from "boot/axios";
import { useRoute, useRouter } from "vue-router";
import { useQuasar } from "quasar";

const $q = useQuasar();
const route = useRoute();
const router = useRouter();

const idcurso = route.params.idcurso;
const idunidad = route.params.idunidad;
const idclase = route.params.idclase;
const idcontenido = route.params.idcontenido || null;

const form = ref({
  titulo: "",
  descripcion: "",
  tipo: "documento", // fallback
  url: "",
});

const archivoFile = ref(null);
const miniaturaFile = ref(null); // portada opcional
const loading = ref(false);
const uploadProgress = ref(0);
const isEdit = computed(() => !!idcontenido);

// 📂 Detectar tipo automáticamente
function onFileChange(file) {
  if (file) {
    form.value.url = file.name;
    const mime = file.type ? file.type.toLowerCase() : "";

    if (mime.startsWith("image/")) {
      form.value.tipo = "imagen";
    } else if (mime.startsWith("video/")) {
      form.value.tipo = "video";
    } else {
      form.value.tipo = "documento";
    }
  } else {
    form.value.tipo = "documento";
  }
}

// 📸 Generar miniatura automática con Canvas
async function captureThumbnail(file) {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.src = URL.createObjectURL(file);
    video.currentTime = 1;

    video.onloadeddata = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth / 2;
      canvas.height = video.videoHeight / 2;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        const thumbnailFile = new File([blob], "miniatura.jpg", {
          type: "image/jpeg",
        });
        resolve(thumbnailFile);
      }, "image/jpeg");
    };
  });
}

// 📂 Guardar contenido
async function saveContenido() {
  loading.value = true;
  uploadProgress.value = 0;

  try {
    const fd = new FormData();
    fd.append("titulo", form.value.titulo);
    fd.append("descripcion", form.value.descripcion);
    fd.append("tipo", form.value.tipo);

    if (archivoFile.value) {
      fd.append("archivo", archivoFile.value);

      // 📌 Solo si es video: decidir portada
      if (form.value.tipo === "video") {
        if (miniaturaFile.value) {
          fd.append("miniatura", miniaturaFile.value);
        } else {
          const autoThumb = await captureThumbnail(archivoFile.value);
          fd.append("miniatura", autoThumb);
        }
      }
    }

    const url = isEdit.value
      ? `/cursos/${idcurso}/unidades/${idunidad}/clases/${idclase}/contenidos/${idcontenido}?_method=PATCH`
      : `/cursos/${idcurso}/unidades/${idunidad}/clases/${idclase}/contenidos`;

    await api.post(url, fd, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 10 * 60 * 1000,
      onUploadProgress: (e) => {
        if (e.total) {
          uploadProgress.value = Math.round((e.loaded * 100) / e.total);
        }
      },
    });

    $q.notify({
      type: "positive",
      message: isEdit.value
        ? "Contenido actualizado correctamente"
        : "Contenido creado correctamente",
    });

    goBack();
  } catch (err) {
    console.error("❌ ERROR COMPLETO:", err.response?.data || err);
    $q.notify({
      type: "negative",
      message: "Error guardando contenido",
      icon: "report_problem",
      position: "top",
    });
  } finally {
    loading.value = false;
    uploadProgress.value = 0;
  }
}

// 📂 Volver a la lista
function goBack() {
  router.push({
    name: "contenidos-list",
    params: { idcurso, idunidad, idclase },
  });
}

// 📂 Cargar datos si es edición
onMounted(async () => {
  if (isEdit.value) {
    try {
      const { data } = await api.get(
        `/cursos/${idcurso}/unidades/${idunidad}/clases/${idclase}/contenidos/${idcontenido}`
      );
      form.value = {
        titulo: data.titulo,
        descripcion: data.descripcion,
        tipo: data.tipo,
        url: data.url,
      };
    } catch (err) {
      console.error(err);
      $q.notify({ type: "negative", message: "Error cargando contenido" });
    }
  }
});
</script>
