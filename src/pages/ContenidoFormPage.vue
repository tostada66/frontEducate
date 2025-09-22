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
        <q-uploader
          url=""
          label="Subir archivo"
          auto-upload="false"
          accept="*/*"
          @added="onFileChange"
        />

        <!-- Estado -->
        <q-select
          v-model="form.estado"
          :options="['borrador', 'publicado']"
          label="Estado"
          outlined
          dense
        />

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

// 📌 Params de la ruta
const idcurso = route.params.idcurso;
const idunidad = route.params.idunidad;
const idclase = route.params.idclase;
const idcontenido = route.params.idcontenido || null;

const form = ref({
  titulo: "",
  descripcion: "",
  tipo: "otro", // fallback
  url: "",
  estado: "borrador",
});

const archivoFile = ref(null);
const loading = ref(false);

const isEdit = computed(() => !!idcontenido);

// 📂 Detectar tipo automáticamente
function onFileChange(files) {
  if (files.length > 0) {
    const file = files[0];
    archivoFile.value = file;
    form.value.url = file.name;

    const mime = file.type ? file.type.toLowerCase() : "";
    const ext = file.name.split(".").pop().toLowerCase();

    if (mime.startsWith("image/")) {
      form.value.tipo = "imagen";
    } else if (mime.startsWith("video/")) {
      form.value.tipo = "video";
    } else if (mime.startsWith("audio/")) {
      form.value.tipo = "audio";
    } else if (ext === "pdf") {
      form.value.tipo = "pdf";
    } else if (["doc", "docx"].includes(ext)) {
      form.value.tipo = "word";
    } else if (["xls", "xlsx"].includes(ext)) {
      form.value.tipo = "excel";
    } else if (["ppt", "pptx"].includes(ext)) {
      form.value.tipo = "powerpoint";
    } else {
      form.value.tipo = "otro";
    }
  } else {
    form.value.tipo = "otro";
  }
}

// 📂 Guardar contenido
async function saveContenido() {
  loading.value = true;
  try {
    const fd = new FormData();
    fd.append("titulo", form.value.titulo);
    fd.append("descripcion", form.value.descripcion);
    fd.append("tipo", form.value.tipo);
    fd.append("estado", form.value.estado);

    if (archivoFile.value) {
      fd.append("archivo", archivoFile.value);
    }

    if (isEdit.value) {
      await api.post(
        `/cursos/${idcurso}/unidades/${idunidad}/clases/${idclase}/contenidos/${idcontenido}?_method=PATCH`,
        fd,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      $q.notify({ type: "positive", message: "Contenido actualizado" });
    } else {
      await api.post(
        `/cursos/${idcurso}/unidades/${idunidad}/clases/${idclase}/contenidos`,
        fd,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      $q.notify({ type: "positive", message: "Contenido creado" });
    }

    goBack();
  } catch (err) {
    $q.notify({ type: "negative", message: "Error guardando contenido" });
    console.error(err);
  } finally {
    loading.value = false;
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
      form.value = data;
    } catch (err) {
      console.error(err);
      $q.notify({ type: "negative", message: "Error cargando contenido" });
    }
  }
});
</script>
