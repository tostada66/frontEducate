<template>
  <q-page class="q-pa-md flex flex-center">
    <q-card class="q-pa-lg" style="max-width: 600px; width: 100%">
      <!-- Header -->
      <q-card-section>
        <div class="text-h6 text-primary">
          {{ isEdit ? "Editar Clase" : "Nueva Clase" }}
        </div>
        <div class="text-subtitle2 text-grey-7">
          Completa la información de la clase
        </div>
      </q-card-section>

      <q-separator />

      <!-- Formulario -->
      <q-card-section>
        <q-form @submit.prevent="saveClase" class="q-gutter-md">
          <!-- Título -->
          <q-input
            v-model="form.titulo"
            label="Título de la clase"
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

const isEdit = !!route.params.idclase;
const loading = ref(false);

const form = ref({
  titulo: "",
  descripcion: "",
});

// 📂 Cargar clase si es edición
async function loadClase() {
  try {
    const idcurso = route.params.idcurso;
    const idunidad = route.params.idunidad;

    const { data } = await api.get(
      `/cursos/${idcurso}/unidades/${idunidad}/clases/${route.params.idclase}`
    );

    form.value = {
      titulo: data.titulo,
      descripcion: data.descripcion,
    };
  } catch (err) {
    console.error("❌ Error cargando clase:", err.response?.data || err);
  }
}

// 💾 Guardar clase
async function saveClase() {
  loading.value = true;
  try {
    const idcurso = route.params.idcurso;
    const idunidad = route.params.idunidad;

    const payload = {
      titulo: form.value.titulo,
      descripcion: form.value.descripcion,
    };

    if (isEdit) {
      await api.patch(
        `/cursos/${idcurso}/unidades/${idunidad}/clases/${route.params.idclase}`,
        payload
      );
    } else {
      await api.post(`/cursos/${idcurso}/unidades/${idunidad}/clases`, payload);
    }

    router.push({
      name: "clases-list",
      params: { idcurso, idunidad },
    });
  } catch (err) {
    console.error("❌ Error guardando clase:", err.response?.data || err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  if (isEdit) loadClase();
});
</script>
