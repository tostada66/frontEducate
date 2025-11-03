<template>
  <q-page class="q-pa-lg bg-grey-2">
    <!-- 🧩 Portada del juego -->
    <JuegoEncabezado
      ref="encabezadoRef"
      tituloDefault="Mecanografía"
      colorFondo="indigo-10"
      @update:form="encabezadoData = $event"
    />

    <!-- 🧠 Sección: agregar palabra -->
    <q-card class="q-pa-md q-mb-lg shadow-3">
      <div class="text-h6 text-bold text-primary q-mb-md">
        Agregar nueva palabra
      </div>

      <div class="row q-col-gutter-md items-end">
        <!-- 📝 Palabra -->
        <div class="col-12 col-md-5">
          <q-input
            v-model="nueva.palabra"
            label="Palabra o frase"
            outlined
            dense
            maxlength="255"
            @keyup.enter.stop
          />
        </div>

        <!-- ⏱ Tiempo -->
        <div class="col-12 col-md-3">
          <q-input
            v-model.number="nueva.tiempo"
            type="number"
            label="Tiempo (segundos)"
            outlined
            dense
            min="1"
          />
        </div>

        <!-- 🎯 Dificultad -->
        <div class="col-12 col-md-3">
          <q-select
            v-model="nueva.dificultad"
            :options="dificultades"
            label="Dificultad"
            outlined
            dense
          />
        </div>

        <!-- ➕ Botón agregar -->
        <div class="col-12 col-md-1 flex justify-end">
          <q-btn
            color="primary"
            glossy
            icon="add_circle"
            label="Agregar"
            :disable="!nueva.palabra"
            @click="agregarPalabra"
          />
        </div>
      </div>
    </q-card>

    <!-- 📋 Tabla de palabras -->
    <q-card class="shadow-3 q-mb-xl">
      <q-card-section class="bg-indigo-1 text-indigo-10 text-bold">
        Palabras registradas
      </q-card-section>

      <q-table
        :rows="palabras"
        :columns="columnas"
        row-key="idpalabra"
        flat
        bordered
        separator="horizontal"
        no-data-label="Aún no hay palabras registradas"
      >
        <!-- ⚙️ Acciones -->
        <template #body-cell-acciones="props">
          <q-td align="center" class="q-gutter-xs">
            <q-btn
              round
              flat
              dense
              color="primary"
              icon="edit"
              @click="editarPalabra(props.row)"
            >
              <q-tooltip>Editar</q-tooltip>
            </q-btn>

            <q-btn
              round
              flat
              dense
              color="negative"
              icon="delete"
              @click="eliminarPalabra(props.row)"
            >
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- 💾 Guardar -->
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

    <!-- ✏️ Modal edición -->
    <q-dialog v-model="dialogoEditar">
      <q-card style="min-width: 400px">
        <q-card-section class="bg-indigo-10 text-white">
          <div class="text-h6 text-bold">Editar palabra</div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input
            v-model="editando.palabra"
            label="Palabra o frase"
            outlined
            dense
          />
          <q-input
            v-model.number="editando.tiempo"
            type="number"
            label="Tiempo (segundos)"
            outlined
            dense
          />
          <q-select
            v-model="editando.dificultad"
            :options="dificultades"
            label="Dificultad"
            outlined
            dense
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn
            color="primary"
            label="Actualizar"
            @click="actualizarPalabra"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
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

const palabras = ref([]);
const dificultades = ref(["fácil", "medio", "difícil"]);
const nueva = ref({ palabra: "", tiempo: 10, dificultad: "fácil" });
const editando = ref({});
const dialogoEditar = ref(false);
const guardando = ref(false);

// 📊 Columnas
const columnas = [
  { name: "palabra", label: "Palabra", field: "palabra", align: "left" },
  { name: "tiempo", label: "Tiempo (s)", field: "tiempo", align: "center" },
  {
    name: "dificultad",
    label: "Dificultad",
    field: "dificultad",
    align: "center",
  },
  { name: "acciones", label: "Acciones", align: "center" },
];

// 📦 Cargar palabras
async function cargarPalabras() {
  try {
    const { data } = await api.get(`/curso-juego/${idcursojuego}/palabras`);
    palabras.value = data.data || [];
  } catch (e) {
    console.warn("⚠️ No hay datos aún o error:", e);
  }
}

// ➕ Agregar palabra
function agregarPalabra() {
  palabras.value.push({
    ...nueva.value,
    activo: true,
    idpalabra: Date.now(),
  });
  nueva.value = { palabra: "", tiempo: 10, dificultad: "fácil" };
}

// ✏️ Editar palabra
function editarPalabra(row) {
  editando.value = { ...row };
  dialogoEditar.value = true;
}

// 💾 Actualizar palabra
function actualizarPalabra() {
  const index = palabras.value.findIndex(
    (p) => p.idpalabra === editando.value.idpalabra
  );
  if (index !== -1) palabras.value[index] = { ...editando.value };
  dialogoEditar.value = false;
  $q.notify({ type: "positive", message: "Palabra actualizada" });
}

// ❌ Eliminar palabra
function eliminarPalabra(row) {
  $q.dialog({
    title: "Eliminar palabra",
    message: `¿Eliminar "${row.palabra}"?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    palabras.value = palabras.value.filter(
      (p) => p.idpalabra !== row.idpalabra
    );
  });
}

// 💾 Guardar todo
async function guardarJuego() {
  try {
    guardando.value = true;

    const form = encabezadoRef.value?.form || encabezadoData.value;
    const fd = new FormData();
    fd.append("nombre_tema", form.nombre_tema || "");
    fd.append("nivel", form.nivel || 1);
    if (form.imagenFile) fd.append("imagen", form.imagenFile);

    // Guardar cabecera
    await api.post(`/curso-juego/${idcursojuego}?_method=PUT`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // Guardar palabras
    if (!palabras.value.length) {
      $q.notify({
        type: "warning",
        message: "Agrega al menos una palabra antes de guardar.",
      });
      return;
    }

    await api.post(`/curso-juego/${idcursojuego}/guardar`, {
      palabras: palabras.value,
    });

    $q.notify({
      type: "positive",
      message: "Juego guardado correctamente.",
    });

    router.push({ name: "juegos-unidad", params: { idcurso, idunidad } });
  } catch (e) {
    console.error(e);
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

onMounted(() => cargarPalabras());
</script>

<style scoped>
.q-table thead th {
  background: #f5f7fa;
  font-weight: bold;
}
.q-page {
  max-width: 1100px;
  margin: auto;
}
</style>
