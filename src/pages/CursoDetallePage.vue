<template>
  <q-page class="q-pa-md">
    <q-card flat bordered>
      <q-img
        :src="
          curso?.imagen_url || 'https://via.placeholder.com/600x250?text=Curso'
        "
        style="height: 250px"
        fit="cover"
      />

      <q-card-section>
        <div class="text-h5">{{ curso?.nombre }}</div>
        <div class="text-subtitle2 text-grey">{{ curso?.nivel }}</div>
        <div class="q-mt-md">{{ curso?.descripcion }}</div>
      </q-card-section>
    </q-card>

    <!-- Clases -->
    <div class="q-mt-lg text-h6">Clases del curso</div>
    <q-list bordered separator class="q-mt-sm">
      <q-item
        v-for="clase in curso?.clases || []"
        :key="clase.idclase"
        clickable
      >
        <q-item-section>{{ clase.titulo }}</q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" />
        </q-item-section>
      </q-item>
    </q-list>

    <!-- Loader -->
    <q-inner-loading :showing="loading">
      <q-spinner-dots color="primary" size="40px" />
    </q-inner-loading>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { api } from "boot/axios";

const route = useRoute();
const curso = ref(null);
const loading = ref(false);

async function loadCurso() {
  loading.value = true;
  try {
    const { data } = await api.get(`/cursos/${route.params.idcurso}`);
    curso.value = data;
  } catch (err) {
    console.error("❌ Error cargando curso:", err.response?.data || err);
  } finally {
    loading.value = false;
  }
}

onMounted(loadCurso);
</script>
