<template>
  <q-page class="q-pa-md flex flex-center">
    <q-card class="q-pa-lg" style="max-width: 900px; width: 100%">
      <!-- Título -->
      <q-card-section>
        <div class="text-h5 text-center text-primary q-mb-sm">
          Personalicemos tu experiencia
        </div>
        <div class="text-subtitle2 text-grey-7 text-center q-mb-md">
          Cuéntanos qué te interesa para recomendarte el mejor contenido
        </div>
      </q-card-section>

      <!-- Opciones de categorías -->
      <q-card-section class="row q-col-gutter-md">
        <div
          v-for="cat in categorias"
          :key="cat.idcategoria"
          class="col-12 col-sm-4"
        >
          <q-card
            class="cursor-pointer q-hoverable full-height text-center"
            :class="{
              'bg-primary text-white': selected.includes(cat.idcategoria),
            }"
            @click="toggleCategoria(cat.idcategoria)"
          >
            <q-card-section>
              <div class="text-h6">{{ cat.nombre }}</div>
              <div class="text-caption">
                {{ cat.descripcion }}
              </div>
            </q-card-section>
          </q-card>
        </div>
      </q-card-section>

      <!-- Botones -->
      <q-card-actions align="between" class="q-pa-md">
        <q-btn
          type="button"
          flat
          label="Omitir por ahora"
          color="negative"
          @click="irAlProfile"
        />
        <q-btn
          type="button"
          unelevated
          color="primary"
          label="Continuar"
          :disable="selected.length === 0 || loading"
          :loading="loading"
          @click="guardarIntereses"
        />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { api } from "boot/axios";

const router = useRouter();
const route = useRoute();

const categorias = ref([]);
const selected = ref([]);
const loading = ref(false);

// obtenemos idusuario de la query (viene desde OnbNivelPage.vue)
const idusuario = route.query.idusuario;

// 📂 Cargar categorías desde backend
onMounted(async () => {
  try {
    const { data } = await api.get("/categorias");
    categorias.value = data;
  } catch (e) {
    console.error("❌ Error cargando categorías:", e.response?.data || e);
  }
});

function toggleCategoria(id) {
  if (selected.value.includes(id)) {
    selected.value = selected.value.filter((x) => x !== id);
  } else {
    selected.value.push(id);
  }
}

// 📂 Guardar intereses
async function guardarIntereses() {
  if (!idusuario || selected.value.length === 0) return;

  loading.value = true;
  try {
    const categoriasUnicas = [...new Set(selected.value)];

    console.log("➡️ Enviando al backend:", {
      idusuario,
      categorias: categoriasUnicas,
    });

    await api.post("/register/estudiante/intereses", {
      idusuario,
      categorias: categoriasUnicas,
    });

    // 👌 después de guardar, redirigir al ProfilePage
    router.replace({ name: "profile", query: { idusuario } });
  } catch (e) {
    console.error("❌ Error guardando intereses:", e.response?.data || e);
  } finally {
    loading.value = false;
  }
}

// 📂 Omitir intereses
function irAlProfile() {
  router.replace({ name: "profile", query: { idusuario } });
}
</script>

<style scoped>
.q-page {
  background: #0f1324;
}
.full-height {
  height: 100%;
}
</style>
