<template>
  <q-page class="q-pa-md bg-dark-page">
    <!-- 🌟 Encabezado -->
    <div class="text-center q-mb-xl fade-in">
      <div
        class="text-h4 text-weight-bolder text-neon-blue flex flex-center items-center justify-center"
      >
        <q-icon
          name="sports_esports"
          size="42px"
          class="q-mr-sm text-neon-blue"
        />
        Gestión de Juegos Base
      </div>
      <div class="text-grey-5 text-subtitle1 q-mt-xs font-sub">
        Administra los juegos disponibles y controla su estado de activación
      </div>
    </div>

    <!-- 🔍 Buscador -->
    <div class="row justify-start q-mb-md">
      <q-input
        v-model="busqueda"
        filled
        dense
        color="white"
        placeholder="Buscar juego..."
        debounce="300"
        class="col-12 col-md-4 buscador-blanco"
        clearable
        @clear="limpiarBusqueda"
      >
        <template #prepend>
          <q-icon name="search" color="purple-5" />
        </template>
      </q-input>
    </div>

    <!-- 📋 Tabla -->
    <q-card
      flat
      bordered
      class="bg-white text-dark shadow-10 rounded-2xl q-pa-none tabla-container"
    >
      <q-table
        :rows="filtrados"
        :columns="columnas"
        row-key="idjuego"
        flat
        separator="horizontal"
        :loading="cargando"
        no-data-label="No hay juegos registrados"
        class="tabla-luminosa"
      >
        <template #body="props">
          <q-tr :props="props" class="hover-row">
            <!-- 🏷️ Nombre -->
            <q-td
              key="nombre"
              class="text-weight-medium text-dark text-capitalize fuente-principal"
            >
              {{ props.row.nombre }}
            </q-td>

            <!-- 📖 Descripción -->
            <q-td key="descripcion" class="text-grey-8 fuente-principal">
              {{ props.row.descripcion || "Sin descripción" }}
            </q-td>

            <!-- 🟢 Estado -->
            <q-td key="activo" align="center">
              <q-badge
                :color="props.row.activo ? 'green' : 'red'"
                :label="props.row.activo ? 'Activo' : 'Inactivo'"
                class="text-weight-bold text-white text-uppercase fuente-principal"
              />
            </q-td>

            <!-- ⚙️ Acciones -->
            <q-td key="acciones" align="center">
              <q-btn
                round
                dense
                flat
                color="purple"
                icon="edit"
                size="sm"
                @click="editarJuego(props.row)"
              >
                <q-tooltip>Editar juego</q-tooltip>
              </q-btn>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </q-card>

    <!-- 🧩 Diálogo Editar Juego -->
    <q-dialog v-model="dialogoAbierto" persistent>
      <q-card class="card-editar">
        <!-- 🌈 Encabezado -->
        <q-card-section
          class="encabezado-gradiente text-white flex flex-center items-center justify-center"
        >
          <q-icon name="edit_note" size="28px" class="q-mr-sm text-white" />
          <div class="text-h6 text-weight-bold">Editar Juego Base</div>
        </q-card-section>

        <!-- 📋 Contenido -->
        <q-card-section class="q-gutter-md q-pa-lg">
          <!-- 🏷️ Nombre -->
          <q-input
            v-model="form.nombre"
            label="Nombre del juego"
            dense
            outlined
            color="purple-5"
            readonly
            class="input-edit"
          />

          <!-- 📖 Descripción -->
          <q-input
            v-model="form.descripcion"
            label="Descripción"
            type="textarea"
            dense
            outlined
            color="purple-5"
            autogrow
            class="input-edit"
          />

          <!-- ⚙️ Estado -->
          <div class="row items-center justify-between q-mt-md">
            <span class="text-grey-7 text-weight-medium">Estado</span>
            <q-toggle
              v-model="form.activo"
              color="green"
              label="Activo"
              left-label
            />
          </div>
        </q-card-section>

        <!-- 🔘 Botones -->
        <q-card-actions align="right" class="bg-dark q-pa-md botones-card">
          <q-btn flat label="Cancelar" color="grey-5" v-close-popup />
          <q-btn
            glossy
            color="purple-5"
            label="Guardar Cambios"
            @click="guardarJuego"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useQuasar } from "quasar";
import { api } from "boot/axios";

const $q = useQuasar();

const juegos = ref([]);
const cargando = ref(false);
const busqueda = ref("");
const dialogoAbierto = ref(false);
const juegoEditando = ref(null);

const form = ref({
  nombre: "",
  descripcion: "",
  activo: true,
});

const columnas = [
  { name: "nombre", label: "Nombre", align: "left", field: "nombre" },
  {
    name: "descripcion",
    label: "Descripción",
    align: "left",
    field: "descripcion",
  },
  { name: "activo", label: "Estado", align: "center", field: "activo" },
  { name: "acciones", label: "Acciones", align: "center" },
];

// 📦 Cargar juegos base
const cargarJuegos = async () => {
  cargando.value = true;
  try {
    const { data } = await api.get("/juegos");
    juegos.value = data.data || [];
  } catch (e) {
    console.error(e);
    $q.notify({ type: "negative", message: "Error al cargar los juegos." });
  } finally {
    cargando.value = false;
  }
};

// 🔍 Filtrado
const filtrados = computed(() => {
  const term = busqueda.value.toLowerCase();
  return juegos.value.filter(
    (j) =>
      j.nombre.toLowerCase().includes(term) ||
      (j.descripcion && j.descripcion.toLowerCase().includes(term))
  );
});

const limpiarBusqueda = () => (busqueda.value = "");

// ✏️ Editar
const editarJuego = (juego) => {
  juegoEditando.value = juego;
  form.value = {
    nombre: juego.nombre,
    descripcion: juego.descripcion,
    activo: juego.activo,
  };
  dialogoAbierto.value = true;
};

// 💾 Guardar cambios
const guardarJuego = async () => {
  try {
    const payload = {
      descripcion: form.value.descripcion,
      activo: form.value.activo ? 1 : 0,
    };

    await api.put(`/juegos/${juegoEditando.value.idjuego}`, payload);

    $q.notify({
      type: "positive",
      message: "Juego actualizado correctamente.",
    });
    dialogoAbierto.value = false;
    cargarJuegos();
  } catch (e) {
    console.error(e);
    $q.notify({ type: "negative", message: "Error al guardar los cambios." });
  }
};

onMounted(() => cargarJuegos());
</script>

<style scoped>
/* 🌌 Fondo general */
.bg-dark-page {
  background: radial-gradient(circle at top, #1a083d 0%, #0e0020 80%);
  min-height: 100vh;
}

/* ✨ Títulos luminosos */
.text-neon-blue {
  color: #7daeff;
  text-shadow: 0 0 10px #5c89ff, 0 0 25px #3a5df5;
}

/* 💜 Tipografía moderna */
.fuente-principal {
  font-family: "Poppins", "Roboto", sans-serif;
  font-size: 15px;
}

.font-sub {
  font-family: "Poppins", "Roboto", sans-serif;
  letter-spacing: 0.3px;
  font-size: 14px;
}

/* 🔍 Buscador blanco */
.buscador-blanco {
  background: #fff !important;
  border-radius: 12px;
  color: #222;
  box-shadow: 0 0 10px rgba(140, 80, 255, 0.25);
}

.buscador-blanco input {
  color: #222 !important;
  font-weight: 500;
}

.buscador-blanco .q-icon {
  color: #7b5cff !important;
}

/* 🌟 Tabla refinada */
.tabla-container {
  border-radius: 16px;
  overflow: hidden;
}

.q-table thead th {
  background: #f8f9fb;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.4px;
  color: #333;
}

.tabla-luminosa .q-td {
  vertical-align: middle !important;
  height: 46px;
  font-size: 15px;
  font-family: "Poppins", sans-serif;
  color: #333;
}

.hover-row:hover {
  background-color: #f4f1ff;
  transition: 0.3s;
}

/* 🧩 Modal editar */
.card-editar {
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 0 15px rgba(100, 60, 200, 0.25);
  min-width: 460px;
}

/* 🌈 Franja morada superior */
.encabezado-gradiente {
  background: linear-gradient(90deg, #7b3ff3, #9a4dff, #b266ff);
  padding: 14px 0;
  text-shadow: 0 0 6px rgba(255, 255, 255, 0.5);
}

/* 📝 Inputs */
.input-edit .q-field__control {
  border-radius: 10px;
}

.input-edit .q-field__label {
  font-weight: 500;
  color: #555 !important;
}

/* 🔘 Zona de botones */
.botones-card {
  border-top: 1px solid rgba(150, 100, 255, 0.15);
}

.botones-card .q-btn {
  font-weight: 600;
  letter-spacing: 0.5px;
}
</style>
