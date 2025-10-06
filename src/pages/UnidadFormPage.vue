<template>
  <q-page class="q-pa-md flex flex-center">
    <q-card class="q-pa-lg" style="max-width: 600px; width: 100%">
      <!-- Header -->
      <q-card-section>
        <div class="text-h6 text-primary">
          {{ isEdit ? "Editar Unidad" : "Nueva Unidad" }}
        </div>
        <div class="text-subtitle2 text-grey-7">
          Completa la información de la unidad
        </div>
      </q-card-section>

      <q-separator />

      <!-- Formulario -->
      <q-card-section>
        <q-form @submit.prevent="saveUnidad" class="q-gutter-md">
          <!-- Título -->
          <q-input
            v-model="form.titulo"
            label="Título de la unidad"
            outlined
            dense
            required
          />

          <!-- Descripción -->
          <q-input
            v-model="form.descripcion"
            label="Descripción"
            type="textarea"
            outlined
            dense
            autogrow
          />

          <!-- Objetivos -->
          <q-input
            v-model="form.objetivos"
            label="Objetivos"
            type="textarea"
            outlined
            dense
            autogrow
          />

          <!-- Imagen -->
          <div>
            <div class="text-subtitle2 q-mb-sm">Imagen de la unidad</div>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="onFileChange"
            />

            <q-btn
              label="Seleccionar imagen"
              color="primary"
              @click="$refs.fileInput.click()"
              flat
              icon="image"
            />

            <q-img
              v-if="previewUrl"
              :src="previewUrl"
              style="height: 200px; border-radius: 8px; margin-top: 10px"
              contain
            />
          </div>

          <!-- Botones -->
          <div class="row justify-end q-gutter-sm q-mt-md">
            <q-btn
              label="Cancelar"
              flat
              color="secondary"
              @click="$router.back()"
            />
            <q-btn
              label="Guardar"
              type="submit"
              color="primary"
              :loading="loading"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { api } from "boot/axios";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const isEdit = !!route.params.idunidad;
const loading = ref(false);
const idcurso = route.params.idcurso;

// Datos del formulario (sin estado)
const form = ref({
  titulo: "",
  descripcion: "",
  objetivos: "",
});

const imagenFile = ref(null);
const previewUrl = ref(null);

// Manejo de imagen
function onFileChange(e) {
  const file = e.target.files[0];
  if (file) {
    imagenFile.value = file;
    previewUrl.value = URL.createObjectURL(file);
  }
}

// 📂 Cargar unidad si es edición
async function loadUnidad() {
  try {
    const { data } = await api.get(
      `/cursos/${idcurso}/unidades/${route.params.idunidad}`
    );
    form.value = {
      titulo: data.titulo,
      descripcion: data.descripcion,
      objetivos: data.objetivos,
    };

    if (data.imagen_url) {
      previewUrl.value = data.imagen_url;
    }
  } catch (err) {
    console.error("❌ Error cargando unidad:", err.response?.data || err);
  }
}

// 📂 Guardar unidad
async function saveUnidad() {
  loading.value = true;
  try {
    const fd = new FormData();
    fd.append("titulo", form.value.titulo);
    fd.append("descripcion", form.value.descripcion);
    fd.append("objetivos", form.value.objetivos);
    if (imagenFile.value) fd.append("imagen", imagenFile.value);

    if (isEdit) {
      await api.post(
        `/cursos/${idcurso}/unidades/${route.params.idunidad}?_method=PATCH`,
        fd,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      router.push({ name: "unidades-list", params: { idcurso } });
    } else {
      const { data } = await api.post(`/cursos/${idcurso}/unidades`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newIdUnidad = data.idunidad;

      if (newIdUnidad) {
        router.push({
          name: "clases-create",
          params: { idcurso, idunidad: newIdUnidad },
        });
      } else {
        router.push({ name: "unidades-list", params: { idcurso } });
      }
    }
  } catch (err) {
    console.error("❌ Error guardando unidad:", err.response?.data || err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  if (isEdit) loadUnidad();
});
</script>

<style>
.select-popup {
  max-height: 250px;
  overflow-y: auto;
}
</style>
