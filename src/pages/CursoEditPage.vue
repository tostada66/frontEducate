<template>
  <q-page class="q-pa-md flex flex-center">
    <q-card class="q-pa-lg" style="max-width: 700px; width: 100%">
      <q-card-section>
        <div class="text-h6 text-primary">Editar curso</div>
        <div class="text-subtitle2 text-grey-7">
          Actualiza la información de tu curso
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-input
          v-model="form.nombre"
          label="Nombre del curso"
          outlined
          dense
        />
        <q-input
          v-model="form.descripcion"
          label="Descripción"
          type="textarea"
          outlined
          dense
        />
        <q-select
          v-model="form.nivel"
          :options="['Básico', 'Intermedio', 'Avanzado']"
          label="Nivel"
          outlined
          dense
        />
        <q-input
          v-model="form.duracion_estimada"
          label="Duración (minutos)"
          type="number"
          outlined
          dense
        />
        <q-select
          v-model="form.estado"
          :options="['borrador', 'publicado', 'archivado']"
          label="Estado"
          outlined
          dense
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="grey" @click="$router.back()" />
        <q-btn
          label="Guardar cambios"
          color="primary"
          :loading="loading"
          @click="updateCurso"
        />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { api } from "boot/axios";

const route = useRoute();
const router = useRouter();
const idcurso = route.params.id;

const form = ref({
  nombre: "",
  descripcion: "",
  nivel: "",
  duracion_estimada: "",
  estado: "borrador",
});

const loading = ref(false);

async function loadCurso() {
  try {
    const { data } = await api.get(`/cursos/${idcurso}`);
    form.value = {
      nombre: data.nombre,
      descripcion: data.descripcion,
      nivel: data.nivel,
      duracion_estimada: data.duracion_estimada,
      estado: data.estado,
    };
  } catch (err) {
    console.error("❌ Error cargando curso:", err.response?.data || err);
  }
}

async function updateCurso() {
  loading.value = true;
  try {
    await api.patch(`/cursos/${idcurso}`, form.value);
    router.push({ name: "cursos-list" }); // redirigir a la lista
  } catch (err) {
    console.error("❌ Error actualizando curso:", err.response?.data || err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadCurso();
});
</script>
