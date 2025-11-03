<template>
  <q-page class="q-pa-lg bg-grey-2">
    <!-- 🟢 Portada del juego -->
    <JuegoEncabezado
      ref="encabezadoRef"
      tituloDefault="Juego de Reciclaje"
      colorFondo="green-10"
      @update:form="encabezadoData = $event"
      class="q-mb-xl"
    />

    <!-- ♻️ Ítems del juego -->
    <q-card class="q-pa-md q-mb-lg shadow-3">
      <div class="text-h6 text-bold text-green-8 q-mb-md flex items-center">
        <q-icon name="recycling" class="q-mr-sm" />
        Ítems del reciclaje
        <q-space />
        <q-btn
          color="green-7"
          glossy
          icon="add_circle"
          label="Nuevo ítem"
          @click="agregarItem"
        />
      </div>

      <div v-if="items.length === 0" class="text-grey text-center q-pa-md">
        No hay ítems registrados. Añade uno nuevo para comenzar.
      </div>

      <!-- 🔁 Lista de ítems -->
      <div
        v-for="(item, index) in items"
        :key="item.iditem || index"
        class="q-pa-md q-mb-md bg-grey-1 rounded-borders shadow-1"
      >
        <div class="row items-center justify-between q-mb-sm">
          <div class="text-subtitle2 text-weight-medium">
            ♻️ Ítem {{ index + 1 }}
          </div>
          <q-btn
            flat
            round
            dense
            color="negative"
            icon="delete_forever"
            @click="eliminarItem(item, index)"
          >
            <q-tooltip>Eliminar ítem</q-tooltip>
          </q-btn>
        </div>

        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input
              v-model="item.nombre"
              label="Nombre del ítem"
              outlined
              dense
              class="q-mb-sm"
            />
            <q-select
              v-model="item.tipo"
              :options="categorias"
              label="Categoría"
              outlined
              dense
              emit-value
              map-options
            />
          </div>

          <div class="col-12 col-md-6">
            <q-file
              outlined
              dense
              accept="image/*"
              label="Seleccionar imagen del ítem"
              @update:model-value="(file) => onFileChange(file, item)"
            >
              <template #prepend>
                <q-icon name="image" color="green-7" />
              </template>
            </q-file>

            <div v-if="item.imagen_url" class="text-center q-mt-sm">
              <q-img
                :src="item.imagen_url"
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
const items = ref([]);
const guardando = ref(false);

const categorias = [
  { label: "Orgánico", value: "organico" },
  { label: "Plástico", value: "plastico" },
  { label: "Papel / Cartón", value: "papel" },
  { label: "Vidrio", value: "vidrio" },
  { label: "Metal", value: "metal" },
  { label: "Otros", value: "otros" },
];

// 📦 Cargar ítems existentes
async function cargarItems() {
  try {
    const { data } = await api.get(`/curso-juego/${idcursojuego}/reciclaje`);
    items.value = (data.data || []).map((i) => ({
      iditem: i.iditem,
      nombre: i.nombre,
      tipo: i.tipo, // ✅ mapeo corregido
      imagen_url: i.imagen_url ?? (i.imagen ? i.imagen : null),
    }));
  } catch (e) {
    console.warn("⚠️ No se pudieron cargar los ítems:", e);
  }
}

// ➕ Agregar ítem
function agregarItem() {
  items.value.push({
    nombre: "",
    tipo: "",
    imagen_url: null,
  });
}

// ❌ Eliminar ítem
function eliminarItem(item, index) {
  if (!item.iditem) {
    items.value.splice(index, 1);
    return;
  }

  $q.dialog({
    title: "Eliminar ítem",
    message: "¿Seguro que deseas eliminar este ítem?",
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await api.delete(`/curso-juego/reciclaje/${item.iditem}`);
      items.value.splice(index, 1);
      $q.notify({ type: "positive", message: "Ítem eliminado correctamente" });
    } catch (e) {
      $q.notify({ type: "negative", message: "Error al eliminar el ítem" });
    }
  });
}

// 🖼️ Cargar imagen local (preview)
function onFileChange(file, item) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    item.imagen_url = e.target.result;
  };
  reader.readAsDataURL(file);
}

// 💾 Guardar encabezado y ítems
async function guardarJuego() {
  try {
    guardando.value = true;

    // 🟢 Guardar encabezado del curso-juego
    const form = encabezadoRef.value?.form || encabezadoData.value;
    const fd = new FormData();
    fd.append("nombre_tema", form.nombre_tema || "");
    fd.append("nivel", form.nivel || 1);
    fd.append("activo", form.activo ? 1 : 0);
    if (form.imagenFile) fd.append("imagen", form.imagenFile);

    await api.post(`/curso-juego/${idcursojuego}?_method=PUT`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // ♻️ Guardar ítems
    for (const i of items.value) {
      if (i.iditem) {
        await api.put(`/curso-juego/reciclaje/${i.iditem}`, {
          nombre: i.nombre,
          tipo: i.tipo, // ✅ cambio clave
          imagen: i.imagen_url,
        });
      } else {
        await api.post(`/curso-juego/${idcursojuego}/reciclaje`, {
          items: [
            {
              nombre: i.nombre,
              tipo: i.tipo, // ✅ cambio clave
              imagen: i.imagen_url,
            },
          ],
        });
      }
    }

    $q.notify({
      type: "positive",
      message: "Juego de reciclaje guardado correctamente.",
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

onMounted(cargarItems);
</script>

<style scoped>
.q-page {
  max-width: 1100px;
  margin: auto;
}
</style>
