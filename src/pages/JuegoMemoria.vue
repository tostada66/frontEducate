<template>
  <q-page class="q-pa-lg bg-grey-2">
    <!-- 🟪 Portada del juego -->
    <JuegoEncabezado
      ref="encabezadoRef"
      tituloDefault="Juego de Memoria"
      colorFondo="indigo-10"
      @update:form="encabezadoData = $event"
      class="q-mb-xl"
    />

    <!-- 🃏 Editor de pares -->
    <q-card class="q-pa-md q-mb-lg shadow-3">
      <div class="text-h6 text-bold text-primary q-mb-md flex items-center">
        <q-icon name="collections" class="q-mr-sm" />
        Pares de cartas
        <q-space />
        <q-btn
          color="primary"
          glossy
          icon="add_circle"
          label="Nuevo Par"
          @click="agregarPar"
        />
      </div>

      <div v-if="pares.length === 0" class="text-grey text-center q-pa-md">
        No hay pares creados. Añade uno nuevo para comenzar.
      </div>

      <!-- 🔁 Lista de pares -->
      <div
        v-for="(par, index) in pares"
        :key="par.idpar || index"
        class="q-pa-md q-mb-md bg-grey-1 rounded-borders shadow-1"
      >
        <div class="row items-center justify-between q-mb-sm">
          <div class="text-subtitle2 text-weight-medium">
            🃏 Par {{ index + 1 }}
          </div>
          <q-btn
            flat
            round
            dense
            color="negative"
            icon="delete_forever"
            @click="eliminarPar(par, index)"
          >
            <q-tooltip>Eliminar par</q-tooltip>
          </q-btn>
        </div>

        <div class="row q-col-gutter-md">
          <!-- Carta A -->
          <div class="col-12 col-md-6">
            <q-input
              v-model="par.texto_a"
              label="Texto de la carta A"
              outlined
              dense
              class="q-mb-sm"
            />
            <q-file
              outlined
              dense
              accept="image/*"
              label="Seleccionar imagen carta A"
              @update:model-value="
                (file) => onFileChange(file, par, 'imagen_a')
              "
            >
              <template #prepend>
                <q-icon name="image" color="primary" />
              </template>
            </q-file>
            <div v-if="par.imagen_a_url" class="text-center q-mt-sm">
              <q-img
                :src="par.imagen_a_url"
                style="width: 100px; height: 100px; border-radius: 8px"
              />
            </div>
          </div>

          <!-- Carta B -->
          <div class="col-12 col-md-6">
            <q-input
              v-model="par.texto_b"
              label="Texto de la carta B"
              outlined
              dense
              class="q-mb-sm"
            />
            <q-file
              outlined
              dense
              accept="image/*"
              label="Seleccionar imagen carta B"
              @update:model-value="
                (file) => onFileChange(file, par, 'imagen_b')
              "
            >
              <template #prepend>
                <q-icon name="image" color="primary" />
              </template>
            </q-file>
            <div v-if="par.imagen_b_url" class="text-center q-mt-sm">
              <q-img
                :src="par.imagen_b_url"
                style="width: 100px; height: 100px; border-radius: 8px"
              />
            </div>
          </div>
        </div>
      </div>
    </q-card>

    <!-- 💾 Botones inferiores -->
    <div class="text-center q-mt-md">
      <q-btn
        color="positive"
        glossy
        icon="save"
        label="Guardar Juego"
        :loading="guardando"
        @click="guardarJuego"
      />
      <q-btn
        flat
        color="blue"
        icon="arrow_back"
        label="Volver"
        class="q-ml-sm"
        @click="volverJuegos"
      />
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { api } from "boot/axios";
import JuegoEncabezado from "components/JuegoEncabezado.vue";

const $q = useQuasar();
const route = useRoute();
const router = useRouter();

const idcurso = route.params.idcurso;
const idunidad = route.params.idunidad;
const idcursojuego = route.params.idcursojuego;

const encabezadoRef = ref(null);
const encabezadoData = ref({});
const pares = ref([]);
const guardando = ref(false);

// 📦 Cargar pares existentes
async function cargarPares() {
  try {
    const { data } = await api.get(`/curso-juego/${idcursojuego}/cartas`);

    // 🧠 Normalizar datos (algunos campos pueden venir con nombres distintos)
    pares.value = (data.data || []).map((p) => ({
      idpar: p.idpar,
      texto_a: p.texto_a ?? p.nombre_a ?? "",
      texto_b: p.texto_b ?? p.nombre_b ?? "",
      imagen_a_url: p.imagen_a_url ?? (p.imagen_a ? p.imagen_a : null),
      imagen_b_url: p.imagen_b_url ?? (p.imagen_b ? p.imagen_b : null),
    }));
  } catch (e) {
    console.warn("⚠️ No se pudieron cargar las cartas:", e);
  }
}

// ➕ Nuevo par
function agregarPar() {
  pares.value.push({
    texto_a: "",
    texto_b: "",
    imagen_a_url: null,
    imagen_b_url: null,
  });
}

// ❌ Eliminar par
function eliminarPar(par, index) {
  if (!par.idpar) {
    pares.value.splice(index, 1);
    return;
  }

  $q.dialog({
    title: "Eliminar par",
    message: "¿Seguro que deseas eliminar este par?",
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await api.delete(`/curso-juego/carta/${par.idpar}`);
      pares.value.splice(index, 1);
      $q.notify({ type: "positive", message: "Par eliminado correctamente" });
    } catch (e) {
      $q.notify({ type: "negative", message: "Error al eliminar el par" });
    }
  });
}

// 🖼️ Cargar imagen local (vista previa)
function onFileChange(file, par, campo) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    par[`${campo}_url`] = e.target.result;
  };
  reader.readAsDataURL(file);
}

// 💾 Guardar encabezado y pares
async function guardarJuego() {
  try {
    guardando.value = true;

    // 🟣 Guardar encabezado
    const form = encabezadoRef.value?.form || encabezadoData.value;
    const fd = new FormData();
    fd.append("nombre_tema", form.nombre_tema || "");
    fd.append("nivel", form.nivel || 1);
    fd.append("activo", form.activo ? 1 : 0);
    if (form.imagenFile) fd.append("imagen", form.imagenFile);

    await api.post(`/curso-juego/${idcursojuego}?_method=PUT`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // 🧩 Guardar o actualizar pares
    for (const p of pares.value) {
      if (p.idpar) {
        await api.put(`/curso-juego/carta/${p.idpar}`, {
          texto_a: p.texto_a,
          texto_b: p.texto_b,
          imagen_a: p.imagen_a_url,
          imagen_b: p.imagen_b_url,
        });
      } else {
        await api.post(`/curso-juego/${idcursojuego}/cartas`, {
          pares: [
            {
              texto_a: p.texto_a,
              texto_b: p.texto_b,
              imagen_a: p.imagen_a_url,
              imagen_b: p.imagen_b_url,
            },
          ],
        });
      }
    }

    $q.notify({
      type: "positive",
      message: "Juego de memoria guardado correctamente.",
    });

    router.push({ name: "juegos-unidad", params: { idcurso, idunidad } });
  } catch (e) {
    console.error("❌ Error al guardar:", e);
    $q.notify({
      type: "negative",
      message: "Error al guardar el juego.",
    });
  } finally {
    guardando.value = false;
  }
}

// 🔙 Volver
function volverJuegos() {
  router.push({ name: "juegos-unidad", params: { idcurso, idunidad } });
}

onMounted(() => cargarPares());
</script>

<style scoped>
.q-page {
  max-width: 1100px;
  margin: auto;
}
</style>
