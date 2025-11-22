<template>
  <q-card flat bordered class="q-pa-md q-mb-lg shadow-2">
    <!-- 🔹 Título -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6 text-bold text-indigo-10 flex items-center">
        <q-icon name="photo_album" color="indigo-9" class="q-mr-sm" />
        Portada del Juego
      </div>

      <!-- 🟢 Switch de estado -->
      <q-toggle
        v-model="form.activo"
        color="green"
        checked-icon="check_circle"
        unchecked-icon="highlight_off"
        :label="form.activo ? 'Activo' : 'Inactivo'"
        class="text-bold text-indigo-10"
      />
    </div>

    <q-separator class="q-mb-md" />

    <!-- 🧩 Campos principales -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-8">
        <q-input
          v-model="form.nombre_tema"
          label="Nombre o tema personalizado"
          outlined
          dense
          maxlength="150"
        />
      </div>

      <div class="col-12 col-md-4">
        <q-input
          v-model.number="form.nivel"
          label="Nivel de dificultad"
          type="number"
          outlined
          dense
          min="1"
          max="10"
        />
      </div>
    </div>

    <!-- 🖼️ Imagen -->
    <div class="q-mt-md">
      <q-file
        v-model="form.imagenFile"
        label="Imagen de portada (opcional)"
        outlined
        dense
        accept="image/*"
        @update:model-value="onFileChange"
        style="width: 100%"
      >
        <template #prepend>
          <q-icon name="image" color="primary" />
        </template>
      </q-file>
    </div>

    <div v-if="previewUrl" class="flex flex-center q-mt-lg">
      <q-img
        :src="previewUrl"
        class="rounded-borders shadow-violet"
        style="max-width: 700px; border-radius: 14px"
        spinner-color="primary"
      />
    </div>
  </q-card>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { api } from "boot/axios";
import { useRoute } from "vue-router";
import { useQuasar } from "quasar";

const emit = defineEmits(["update:form"]);
const route = useRoute();
const $q = useQuasar();

const form = ref({
  nombre_tema: "",
  nivel: 1,
  activo: true,
  imagenFile: null,
  imagen_url: null,
});

const previewUrl = ref(null);

// 📦 Cargar configuración desde el backend
const cargarConfig = async () => {
  try {
    const { data } = await api.get(
      `/juegos/curso-juego/${route.params.idcursojuego}`
    );

    if (data.ok && data.data) {
      form.value.nombre_tema = data.data.nombre_tema || "";
      form.value.nivel = data.data.nivel || 1;
      form.value.activo = data.data.activo ?? true;
      form.value.imagen_url = data.data.imagen_url || null;

      // 🖼️ Vista previa de imagen si existe
      previewUrl.value = form.value.imagen_url;
    }
  } catch (e) {
    console.error("❌ Error al cargar portada:", e);
    $q.notify({
      type: "negative",
      message: "Error al cargar los datos del juego.",
    });
  }
};

// 🖼️ Vista previa de imagen local
function onFileChange(file) {
  previewUrl.value = file ? URL.createObjectURL(file) : form.value.imagen_url;
}

// 🔄 Emitir datos al padre cada vez que cambien
watch(
  form,
  (nuevo) => {
    emit("update:form", nuevo);
  },
  { deep: true }
);

// 🟢 Actualizar “activo” automáticamente en el backend
watch(
  () => form.value.activo,
  async (nuevoEstado, anterior) => {
    // Evita llamada si aún no se cargó el juego
    if (!route.params.idcursojuego) return;
    if (nuevoEstado === anterior) return;

    try {
      await api.put(`/juegos/curso-juego/${route.params.idcursojuego}`, {
        activo: nuevoEstado,
      });
      $q.notify({
        type: "positive",
        message: nuevoEstado
          ? "Juego activado correctamente"
          : "Juego desactivado correctamente",
      });
    } catch (e) {
      console.error("❌ Error al actualizar estado:", e);
      $q.notify({
        type: "negative",
        message: "Error al actualizar el estado del juego",
      });
    }
  }
);

defineExpose({ form });

onMounted(cargarConfig);
</script>

<style scoped>
.shadow-violet {
  box-shadow: 0 4px 20px rgba(120, 81, 255, 0.35);
}
</style>
