<template>
  <q-page class="q-pa-lg bg-grey-2">
    <!-- 🔹 Encabezado -->
    <div class="row items-center justify-between q-mb-lg">
      <div class="text-h5 text-weight-bold text-primary flex items-center">
        <q-icon name="gamepad" color="primary" size="32px" class="q-mr-sm" />
        Juegos de la Unidad
      </div>

      <div class="row q-gutter-sm">
        <q-btn
          color="indigo"
          glossy
          icon="add_circle"
          label="Nuevo Juego"
          @click="abrirSelector"
        />
        <q-btn
          color="blue"
          glossy
          icon="arrow_back"
          label="Volver a las Unidades"
          @click="volverUnidades"
        />
      </div>
    </div>

    <!-- 🔍 Filtros -->
    <div class="row q-gutter-sm q-mb-md">
      <div class="col-12 col-md-6">
        <q-input
          dense
          outlined
          v-model="filtroTexto"
          placeholder="Buscar por nombre, tipo o tema..."
          clearable
          @clear="filtroTexto = ''"
          debounce="200"
          prefix="🔎"
        />
      </div>

      <div class="col-12 col-md-3">
        <q-select
          dense
          outlined
          v-model="filtroEstado"
          :options="[
            { label: 'Todos', value: 'todos' },
            { label: 'Activos', value: 'activos' },
            { label: 'Inactivos', value: 'inactivos' },
          ]"
          emit-value
          map-options
          label="Estado"
        />
      </div>
    </div>

    <!-- 📋 Tabla de juegos -->
    <q-table
      :rows="juegosFiltrados"
      :columns="columnas"
      row-key="idcursojuego"
      flat
      bordered
      separator="horizontal"
      :loading="cargando"
      no-data-label="No hay juegos registrados en esta unidad"
      class="shadow-2 rounded-borders"
    >
      <!-- 🟩 Portada -->
      <template #body-cell-imagen="props">
        <q-td align="center">
          <q-img
            v-if="props.row.imagen_url"
            :src="props.row.imagen_url"
            spinner-color="primary"
            style="width: 80px; height: 80px; border-radius: 8px"
          />
          <div v-else class="text-grey text-caption">Sin imagen</div>
        </q-td>
      </template>

      <!-- 🎮 Tipo de juego -->
      <template #body-cell-tipo="props">
        <q-td align="center">
          <q-chip
            color="purple"
            text-color="white"
            icon="category"
            class="text-weight-bold"
            square
            dense
          >
            {{ props.row.juego?.nombre || "Sin tipo" }}
          </q-chip>
        </q-td>
      </template>

      <!-- 🟢 Estado -->
      <template #body-cell-activo="props">
        <q-td align="center">
          <q-badge
            :color="props.row.activo ? 'green' : 'red'"
            :label="props.row.activo ? 'Activo' : 'Inactivo'"
            class="text-weight-bold"
          />
        </q-td>
      </template>

      <!-- ⚙️ Acciones -->
      <template #body-cell-acciones="props">
        <q-td align="center" class="q-gutter-sm">
          <q-btn
            round
            dense
            flat
            color="primary"
            icon="play_arrow"
            @click="abrirJuego(props.row)"
          >
            <q-tooltip>Abrir juego</q-tooltip>
          </q-btn>

          <q-btn
            v-if="props.row.activo"
            round
            dense
            flat
            color="negative"
            icon="delete_forever"
            @click="darDeBaja(props.row)"
          >
            <q-tooltip>Dar de baja</q-tooltip>
          </q-btn>

          <q-btn
            v-else
            round
            dense
            flat
            color="positive"
            icon="refresh"
            @click="reactivarJuego(props.row)"
          >
            <q-tooltip>Reactivar</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <!-- 🧠 Modal: Selector de tipo de juego -->
    <q-dialog v-model="selectorAbierto" persistent>
      <q-card class="modal-selector shadow-10">
        <q-card-section class="encabezado-modal text-white text-center">
          <q-icon name="category" size="28px" class="q-mr-sm text-white" />
          <span class="text-h6 text-weight-bold">
            Selecciona el tipo de juego
          </span>
        </q-card-section>

        <q-card-section v-if="!cargandoTipos" class="q-pa-lg">
          <div class="row q-col-gutter-lg justify-center">
            <q-card
              v-for="tipo in tiposJuegos"
              :key="tipo.idjuego"
              class="tipo-card cursor-pointer text-left"
              @click="crearJuego(tipo)"
            >
              <q-card-section>
                <div class="nombre-tipo">{{ tipo.nombre }}</div>
                <div class="descripcion-tipo">
                  {{ tipo.descripcion || "Sin descripción disponible." }}
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-card-section>

        <q-card-section v-else class="flex flex-center q-my-lg">
          <q-spinner color="primary" size="40px" />
        </q-card-section>

        <q-card-actions align="center" class="q-pb-md">
          <q-btn flat label="Cancelar" color="grey-5" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useQuasar } from "quasar";
import { api } from "boot/axios";

const $q = useQuasar();
const router = useRouter();
const route = useRoute();

const juegos = ref([]);
const tiposJuegos = ref([]);
const cargando = ref(false);
const cargandoTipos = ref(false);
const selectorAbierto = ref(false);

// 🔍 Filtros
const filtroTexto = ref("");
const filtroEstado = ref("todos");

// 📊 Columnas (agregamos "tipo")
const columnas = [
  { name: "imagen", label: "Portada", field: "imagen_url", align: "center" },
  {
    name: "tipo",
    label: "Tipo de juego",
    field: (row) => row.juego?.nombre,
    align: "center",
  },
  {
    name: "nombre_tema",
    label: "Nombre / Tema",
    field: "nombre_tema",
    align: "left",
  },
  { name: "nivel", label: "Nivel", field: "nivel", align: "center" },
  { name: "activo", label: "Estado", field: "activo", align: "center" },
  { name: "acciones", label: "Acciones", align: "center" },
];

// 📦 Cargar juegos
const cargarJuegos = async () => {
  cargando.value = true;
  try {
    const { data } = await api.get(`/juegos/unidad/${route.params.idunidad}`);
    juegos.value = data.data || [];
  } catch (e) {
    console.error(e);
    $q.notify({ type: "negative", message: "Error al cargar los juegos." });
  } finally {
    cargando.value = false;
  }
};

// 📊 Filtro reactivo
const juegosFiltrados = computed(() => {
  return juegos.value.filter((j) => {
    const texto = filtroTexto.value.toLowerCase();
    const coincideTexto =
      j.nombre_tema?.toLowerCase().includes(texto) ||
      j.juego?.nombre?.toLowerCase().includes(texto) ||
      texto === "";
    const coincideEstado =
      filtroEstado.value === "todos" ||
      (filtroEstado.value === "activos" && j.activo) ||
      (filtroEstado.value === "inactivos" && !j.activo);
    return coincideTexto && coincideEstado;
  });
});

// 🧭 Volver
function volverUnidades() {
  router.push({
    name: "unidades-list",
    params: { idcurso: route.params.idcurso },
  });
}

// ▶️ Abrir juego
function abrirJuego(juego) {
  const nombre = (juego.juego?.nombre || "").toLowerCase();
  let ruta = "juego-mecanografia";

  if (nombre.includes("memoria") || nombre.includes("cartas"))
    ruta = "juego-memoria";
  else if (nombre.includes("reciclaje") || nombre.includes("recycle"))
    ruta = "juego-reciclaje"; // ♻️ NUEVO CASO

  router.push({
    name: ruta,
    params: {
      idcurso: route.params.idcurso,
      idunidad: route.params.idunidad,
      idcursojuego: juego.idcursojuego,
    },
  });
}

// 🗑 Dar de baja
async function darDeBaja(juego) {
  $q.dialog({
    title: "Dar de baja",
    message: `¿Dar de baja el juego "${juego.nombre_tema || "sin nombre"}"?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await api.patch(`/curso-juego/${juego.idcursojuego}/baja`);
      $q.notify({
        type: "warning",
        message: "Juego dado de baja correctamente.",
      });
      cargarJuegos();
    } catch {
      $q.notify({
        type: "negative",
        message: "Error al dar de baja el juego.",
      });
    }
  });
}

// ♻️ Reactivar
async function reactivarJuego(juego) {
  try {
    await api.patch(`/curso-juego/${juego.idcursojuego}/reactivar`);
    $q.notify({ type: "positive", message: "Juego reactivado correctamente." });
    cargarJuegos();
  } catch {
    $q.notify({ type: "negative", message: "Error al reactivar el juego." });
  }
}

// ➕ Crear juego nuevo
async function crearJuego(tipo) {
  selectorAbierto.value = false;
  try {
    const { data } = await api.post(`/juegos/unidad/${route.params.idunidad}`, {
      idjuego: tipo.idjuego,
    });
    const cursoJuego = data.data || data;

    const nombre = (tipo.nombre || "").toLowerCase();
    let ruta = "juego-mecanografia";

    if (nombre.includes("memoria") || nombre.includes("cartas"))
      ruta = "juego-memoria";
    else if (nombre.includes("reciclaje") || nombre.includes("recycle"))
      ruta = "juego-reciclaje"; // ♻️ NUEVO CASO

    router.push({
      name: ruta,
      params: {
        idcurso: route.params.idcurso,
        idunidad: route.params.idunidad,
        idcursojuego: cursoJuego.idcursojuego,
      },
    });
  } catch {
    $q.notify({ type: "negative", message: "Error al crear el juego." });
  }
}

// 🔄 Cargar tipos
async function cargarTiposJuegos() {
  cargandoTipos.value = true;
  try {
    const { data } = await api.get("/juegos");
    tiposJuegos.value = data.data || data;
  } catch {
    $q.notify({
      type: "negative",
      message: "Error al cargar tipos de juegos.",
    });
  } finally {
    cargandoTipos.value = false;
  }
}

function abrirSelector() {
  selectorAbierto.value = true;
  cargarTiposJuegos();
}

onMounted(() => cargarJuegos());
</script>

<style scoped>
.modal-selector {
  min-width: 650px;
  border-radius: 18px;
  overflow: hidden;
  background: #ffffff;
}
.encabezado-modal {
  background: linear-gradient(90deg, #7b3ff3, #9a4dff, #b266ff);
  padding: 18px 0;
}
.tipo-card {
  width: 240px;
  border-radius: 16px;
  background: linear-gradient(to bottom right, #f8f6ff, #ece5ff);
  box-shadow: 0 0 12px rgba(140, 80, 255, 0.25);
  transition: all 0.25s ease-in-out;
  padding: 12px;
}
.tipo-card:hover {
  transform: scale(1.05);
  box-shadow: 0 0 22px rgba(180, 100, 255, 0.45);
}
.nombre-tipo {
  font-weight: 700;
  color: #4b0082;
  font-size: 16px;
  margin-bottom: 6px;
}
.descripcion-tipo {
  font-size: 14px;
  color: #444;
  line-height: 1.4em;
}
</style>
