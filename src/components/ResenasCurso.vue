<template>
  <div class="q-pa-md" v-if="auth.isReady">
    <!-- ⭐ Promedio -->
    <div class="text-center q-mb-lg">
      <div class="text-h6 text-primary q-mb-xs">Promedio de Reseñas</div>
      <q-rating
        v-model="promedio"
        max="5"
        color="amber"
        size="2.2em"
        readonly
      />
      <div class="text-grey-7 text-caption">
        {{ promedio.toFixed(1) }} / 5 ({{ total }} reseñas)
      </div>
    </div>

    <!-- 🧩 Bloque visible solo si el usuario está logueado -->
    <template v-if="auth.isAuthed && auth.isStudent">
      <!-- ✍️ Nueva reseña -->
      <div
        v-if="puedeComentar === true && !yaComento"
        class="bg-grey-1 q-pa-md q-mb-lg rounded-borders"
      >
        <div class="text-subtitle1 text-primary q-mb-sm">Deja tu reseña</div>

        <q-rating v-model="nueva.puntuacion" color="amber" max="5" size="2em" />

        <q-input
          v-model="nueva.comentario"
          type="textarea"
          outlined
          autogrow
          label="Tu opinión sobre el curso"
          class="q-mt-md"
        />

        <div class="text-right q-mt-sm">
          <q-btn
            color="primary"
            icon="send"
            label="Publicar"
            @click="publicar"
            :loading="loadingPublicar"
          />
        </div>
      </div>

      <!-- 🔐 Aviso solo si no está matriculado -->
      <div
        v-else-if="puedeComentar === false && !yaComento"
        class="text-center text-grey-7 q-mb-lg"
      >
        Solo puedes reseñar cursos en los que estés matriculado.
      </div>
    </template>

    <!-- 💬 Listado de reseñas (para todos) -->
    <q-list v-if="resenas.length" bordered separator>
      <q-item v-for="r in resenas" :key="r.idresena" class="q-pa-md">
        <q-item-section avatar>
          <q-avatar size="42px">
            <img :src="r.foto_url" alt="foto usuario" />
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label>
            <b>{{ r.autor_nombre }}</b>
            <span class="text-grey text-caption q-ml-xs">
              {{ r.created_at }}
            </span>
          </q-item-label>

          <q-rating
            v-model="r.puntuacion"
            color="amber"
            max="5"
            size="1.4em"
            readonly
            class="q-mt-xs"
          />

          <q-item-label caption class="q-mt-xs">
            {{ r.comentario }}
          </q-item-label>

          <div v-if="puedeEliminar(r)" class="q-mt-xs text-right">
            <q-btn
              flat
              dense
              color="negative"
              icon="delete"
              label="Eliminar"
              @click="eliminar(r)"
            />
          </div>
        </q-item-section>
      </q-item>
    </q-list>

    <!-- 🚫 Sin reseñas -->
    <div v-else class="text-center text-grey q-mt-lg">
      Aún no hay reseñas para este curso.
    </div>
  </div>

  <!-- ⏳ Loader inicial -->
  <div v-else class="text-center q-pa-lg">
    <q-spinner-dots color="primary" size="40px" />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { api } from "boot/axios";
import { useQuasar } from "quasar";
import { useAuthStore } from "src/stores/auth";

const props = defineProps({
  idcurso: { type: Number, required: true },
});

const emit = defineEmits(["actualizar-promedio"]); // 👈 Nuevo evento para el padre

const $q = useQuasar();
const auth = useAuthStore();

const resenas = ref([]);
const promedio = ref(0);
const total = ref(0);
const puedeComentar = ref(null);
const yaComento = ref(false);
const nueva = ref({ puntuacion: 0, comentario: "" });
const loadingPublicar = ref(false);

// 🔹 Cargar reseñas del curso
async function cargarResenas() {
  try {
    const { data } = await api.get(`/cursos/${props.idcurso}/resenas`);
    if (data.ok) {
      resenas.value = data.data;
      promedio.value = data.promedio;
      total.value = data.total;
      puedeComentar.value = data.puedeComentar;
      yaComento.value = data.yaComento;
      emit("actualizar-promedio", promedio.value); // 👈 Notifica al padre
    }
  } catch (err) {
    console.error("❌ Error al cargar reseñas:", err);
  }
}

// 🟢 Publicar nueva reseña
async function publicar() {
  if (!nueva.value.puntuacion || !nueva.value.comentario.trim()) {
    $q.notify({ type: "warning", message: "Completa todos los campos" });
    return;
  }

  loadingPublicar.value = true;
  try {
    const { data } = await api.post(
      `/cursos/${props.idcurso}/resenas`,
      nueva.value
    );

    if (data.ok) {
      $q.notify({
        type: "positive",
        message: "Reseña publicada correctamente",
      });

      // 🔁 Espera y recarga datos actualizados
      setTimeout(async () => {
        await cargarResenas();
      }, 400);
    }
  } catch (err) {
    console.error("❌ Error publicando reseña:", err);
    $q.notify({ type: "negative", message: "No se pudo publicar la reseña" });
  } finally {
    loadingPublicar.value = false;
  }
}

// ❌ Eliminar reseña
async function eliminar(r) {
  $q.dialog({
    title: "Eliminar reseña",
    message: "¿Deseas eliminar esta reseña?",
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const { data } = await api.delete(`/resenas/${r.idresena}`);
      if (data.ok) {
        $q.notify({
          type: "positive",
          message: "Reseña eliminada correctamente",
        });
        setTimeout(async () => {
          await cargarResenas();
        }, 400);
      }
    } catch (err) {
      console.error("❌ Error eliminando reseña:", err);
      $q.notify({
        type: "negative",
        message: "Error eliminando reseña",
      });
    }
  });
}

// 🔒 Verificar si puede eliminar la reseña
function puedeEliminar(r) {
  return (
    r.idusuario === auth.user?.idusuario || auth.isProfessor || auth.isAdmin
  );
}

onMounted(cargarResenas);
</script>

<style scoped>
.rounded-borders {
  border-radius: 12px;
}
</style>
