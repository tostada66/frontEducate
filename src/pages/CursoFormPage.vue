<template>
  <q-page class="q-pa-md flex flex-center">
    <q-card class="q-pa-lg" style="max-width: 600px; width: 100%">
      <q-card-section>
        <div class="text-h6">
          {{ isEdit ? "Editar Curso" : "Nuevo Curso" }}
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-form @submit.prevent="saveCurso">
          <!-- Nombre -->
          <q-input
            v-model="form.nombre"
            label="Nombre"
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
          />

          <!-- Nivel -->
          <q-select
            v-model="form.nivel"
            :options="['Básico', 'Intermedio', 'Avanzado']"
            label="Nivel"
            outlined
            dense
          />

          <!-- Imagen (botón + preview) -->
          <div class="q-mt-md">
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
            />

            <!-- Vista previa -->
            <q-img
              v-if="previewUrl"
              :src="previewUrl"
              style="height: 200px; border-radius: 8px; margin-top: 10px"
              contain
            />
          </div>

          <!-- Estado (solo en edición) -->
          <q-select
            v-if="isEdit"
            v-model="form.estado"
            :options="['borrador', 'publicado', 'archivado']"
            label="Estado"
            outlined
            dense
          />

          <!-- Botones -->
          <div class="row justify-end q-mt-md">
            <q-btn
              label="Guardar"
              type="submit"
              color="primary"
              :loading="loading"
            />
            <q-btn
              flat
              label="Cancelar"
              color="secondary"
              class="q-ml-sm"
              @click="$router.back()"
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

const form = ref({
  nombre: "",
  descripcion: "",
  nivel: "",
  estado: "borrador",
});

const imagenFile = ref(null);
const previewUrl = ref(null);

function onFileChange(e) {
  const file = e.target.files[0];
  if (file) {
    imagenFile.value = file;
    previewUrl.value = URL.createObjectURL(file);
  }
}

// 📂 Cargar curso si es edición
async function loadCurso() {
  try {
    const { data } = await api.get(`/cursos/${route.params.idcurso}`);
    form.value = {
      nombre: data.nombre,
      descripcion: data.descripcion,
      nivel: data.nivel,
      estado: data.estado,
    };

    // ✅ usar la URL completa que viene del backend
    if (data.imagen_url) {
      previewUrl.value = data.imagen_url;
    }
  } catch (err) {
    console.error("❌ Error cargando curso:", err.response?.data || err);
  }
}

// 📂 Guardar curso
async function saveCurso() {
  loading.value = true;
  try {
    const fd = new FormData();
    fd.append("nombre", form.value.nombre);
    fd.append("descripcion", form.value.descripcion);
    fd.append("nivel", form.value.nivel);
    if (isEdit) fd.append("estado", form.value.estado);
    if (imagenFile.value) fd.append("imagen", imagenFile.value);

    if (isEdit) {
      await api.post(`/cursos/${route.params.idcurso}?_method=PATCH`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } else {
      await api.post("/cursos", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }

    router.push({ name: "cursos-list" });
  } catch (err) {
    console.error("❌ Error guardando curso:", err.response?.data || err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  if (isEdit) loadCurso();
});
</script>
