<template>
  <q-page class="q-pa-md flex flex-center">
    <q-card class="q-pa-lg" style="max-width: 800px; width: 100%">
      <q-card-section>
        <div class="text-h6 text-center q-mb-md">
          ¿Cuál es tu nivel de experiencia?
        </div>
        <div class="text-subtitle2 text-grey-7 text-center q-mb-lg">
          Esto nos ayudará a personalizar el contenido y sugerir cursos
          adecuados para ti
        </div>
      </q-card-section>

      <q-card-section class="row q-col-gutter-md">
        <!-- Principiante -->
        <div class="col-12 col-sm-4">
          <q-card
            class="cursor-pointer q-hoverable full-height"
            :class="{ 'bg-primary text-white': selected === 'Principiante' }"
            @click="selectNivel('Principiante')"
          >
            <q-card-section>
              <div class="text-h6">Principiante</div>
              <div class="text-caption">
                Soy nuevo en programación o tengo conocimientos muy básicos
              </div>
              <ul>
                <li>Conceptos básicos</li>
                <li>Proyectos guiados</li>
                <li>Explicaciones detalladas</li>
              </ul>
            </q-card-section>
          </q-card>
        </div>

        <!-- Intermedio -->
        <div class="col-12 col-sm-4">
          <q-card
            class="cursor-pointer q-hoverable full-height"
            :class="{ 'bg-primary text-white': selected === 'Intermedio' }"
            @click="selectNivel('Intermedio')"
          >
            <q-card-section>
              <div class="text-h6">Intermedio</div>
              <div class="text-caption">
                Tengo algunos conocimientos y he trabajado en proyectos pequeños
              </div>
              <ul>
                <li>Estructuras de datos</li>
                <li>Patrones de diseño</li>
                <li>Mejores prácticas</li>
              </ul>
            </q-card-section>
          </q-card>
        </div>

        <!-- Avanzado -->
        <div class="col-12 col-sm-4">
          <q-card
            class="cursor-pointer q-hoverable full-height"
            :class="{ 'bg-primary text-white': selected === 'Avanzado' }"
            @click="selectNivel('Avanzado')"
          >
            <q-card-section>
              <div class="text-h6">Avanzado</div>
              <div class="text-caption">
                Tengo experiencia sólida y busco especializarme
              </div>
              <ul>
                <li>Arquitecturas complejas</li>
                <li>Optimización</li>
                <li>Liderazgo técnico</li>
              </ul>
            </q-card-section>
          </q-card>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn
          unelevated
          color="primary"
          label="Continuar"
          :disable="!selected || loading"
          :loading="loading"
          @click="guardarNivel"
        />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { api } from "boot/axios";

const router = useRouter();
const route = useRoute();

const selected = ref(null);
const loading = ref(false);

// obtenemos idusuario de la query
const idusuario = route.query.idusuario;

function selectNivel(nivel) {
  selected.value = nivel;
}

async function guardarNivel() {
  if (!selected.value || !idusuario) return;
  loading.value = true;

  try {
    await api.post("/register/estudiante/nivel", {
      idusuario: idusuario,
      nivelacademico: selected.value,
    });

    // Después de guardar, lo mandamos a la vista de intereses
    router.replace({
      name: "onb-intereses",
      query: { idusuario },
    });
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
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
