<template>
  <q-page class="q-pa-md flex flex-center">
    <q-card class="q-pa-lg" style="max-width: 600px; width: 100%">
      <!-- Header -->
      <q-card-section>
        <div class="text-h6 text-primary">
          {{ isEdit ? "Editar Curso" : "Nuevo Curso" }}
        </div>
        <div class="text-subtitle2 text-grey-7">
          Completa la información del curso
        </div>
      </q-card-section>

      <q-separator />

      <!-- Formulario -->
      <q-card-section>
        <q-form @submit.prevent="saveCurso" class="q-gutter-md">
          <!-- Nombre -->
          <q-input
            v-model="form.nombre"
            label="Título del curso"
            outlined
            dense
            required
          />

          <!-- Nivel -->
          <q-select
            v-model="form.nivel"
            :options="['Básico', 'Intermedio', 'Avanzado']"
            label="Nivel"
            outlined
            dense
            behavior="menu"
            popup-content-class="select-popup"
          />

          <!-- Categoría -->
          <q-select
            v-model="form.idcategoria"
            :options="categoriasOptions"
            option-label="nombre"
            option-value="idcategoria"
            emit-value
            map-options
            label="Categoría"
            outlined
            dense
            :loading="loadingCategorias"
            behavior="menu"
            popup-content-class="select-popup"
          />

          <!-- Imagen -->
          <div>
            <div class="text-subtitle2 q-mb-sm">Imagen del curso</div>
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

          <!-- Descripción -->
          <q-input
            v-model="form.descripcion"
            label="Descripción"
            type="textarea"
            outlined
            dense
            autogrow
          />

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

const isEdit = !!route.params.idcurso;
const loading = ref(false);

// Datos del formulario (sin estado)
const form = ref({
  nombre: "",
  descripcion: "",
  nivel: "",
  idcategoria: null,
});

// Imagen
const imagenFile = ref(null);
const previewUrl = ref(null);

// Categorías
const categoriasOptions = ref([]);
const loadingCategorias = ref(false);

async function loadCategorias() {
  loadingCategorias.value = true;
  try {
    const { data } = await api.get("/categorias");
    categoriasOptions.value = data;
  } catch (err) {
    console.error("❌ Error cargando categorías:", err.response?.data || err);
  } finally {
    loadingCategorias.value = false;
  }
}

// Manejo de imagen
function onFileChange(e) {
  const file = e.target.files[0];
  if (file) {
    imagenFile.value = file;
    previewUrl.value = URL.createObjectURL(file);
  }
}

// Cargar curso (si es edición)
async function loadCurso() {
  try {
    const { data } = await api.get(`/cursos/${route.params.idcurso}`);
    form.value = {
      nombre: data.nombre,
      descripcion: data.descripcion,
      nivel: data.nivel,
      idcategoria: data.idcategoria,
    };
    if (data.imagen_url) {
      previewUrl.value = data.imagen_url;
    }
  } catch (err) {
    console.error("❌ Error cargando curso:", err.response?.data || err);
  }
}

// Guardar curso
async function saveCurso() {
  loading.value = true;
  try {
    const fd = new FormData();
    fd.append("nombre", form.value.nombre);
    fd.append("descripcion", form.value.descripcion);
    fd.append("nivel", form.value.nivel);
    fd.append("idcategoria", form.value.idcategoria);
    if (imagenFile.value) fd.append("imagen", imagenFile.value);

    if (isEdit) {
      await api.post(`/cursos/${route.params.idcurso}?_method=PATCH`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      router.push({ name: "cursos-list" });
    } else {
      const { data } = await api.post("/cursos", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const newId = data.curso?.idcurso;
      if (newId) {
        router.push({ name: "unidad-create", params: { idcurso: newId } });
      } else {
        router.push({ name: "cursos-list" });
      }
    }
  } catch (err) {
    console.error("❌ Error guardando curso:", err.response?.data || err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadCategorias();
  if (isEdit) loadCurso();
});
</script>

<style>
.select-popup {
  max-height: 250px;
  overflow-y: auto;
}
</style>
