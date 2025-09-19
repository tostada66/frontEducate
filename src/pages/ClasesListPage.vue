<template>
  <q-page class="q-pa-md">
    <!-- Encabezado -->
    <div class="row items-center q-mb-md">
      <div class="text-h6">Clases del Curso</div>
      <q-space />
      <q-btn
        color="primary"
        icon="add"
        label="Nueva Clase"
        @click="openForm()"
      />
    </div>

    <!-- Tabla de clases -->
    <q-table
      :rows="clases"
      :columns="columns"
      row-key="idclase"
      flat
      bordered
      :loading="loading"
      no-data-label="No hay clases registradas"
    >
      <template v-slot:body-cell-acciones="props">
        <q-td>
          <!-- Botón editar -->
          <q-btn
            dense
            flat
            icon="edit"
            color="primary"
            @click="openForm(props.row)"
          />
          <!-- Botón eliminar -->
          <q-btn
            dense
            flat
            icon="delete"
            color="negative"
            @click="deleteClase(props.row.idclase)"
          />
          <!-- Botón ir a contenidos -->
          <q-btn
            dense
            flat
            icon="list"
            color="secondary"
            @click="goContenidos(props.row.idclase)"
          />
        </q-td>
      </template>
    </q-table>

    <!-- Dialogo crear/editar -->
    <q-dialog v-model="formDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">
            {{ form.idclase ? "Editar Clase" : "Nueva Clase" }}
          </div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="form.titulo" label="Título" outlined dense />
          <q-input
            v-model="form.descripcion"
            label="Descripción"
            type="textarea"
            outlined
            dense
          />
          <q-input
            v-model.number="form.orden"
            label="Orden"
            type="number"
            outlined
            dense
          />
          <q-input
            v-model.number="form.duracion"
            label="Duración (minutos)"
            type="number"
            outlined
            dense
          />
          <q-select
            v-model="form.estado"
            :options="['borrador', 'publicado']"
            label="Estado"
            outlined
            dense
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            color="primary"
            label="Guardar"
            @click="saveClase"
            :loading="loading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { api } from "boot/axios";
import { useRoute, useRouter } from "vue-router";
import { useQuasar } from "quasar";

const $q = useQuasar();
const route = useRoute();
const router = useRouter();

const idcurso = route.params.idcurso;

const clases = ref([]);
const loading = ref(false);
const formDialog = ref(false);

const form = ref({
  idclase: null,
  titulo: "",
  descripcion: "",
  orden: 1,
  duracion: null,
  estado: "borrador",
});

const columns = [
  { name: "titulo", label: "Título", field: "titulo", align: "left" },
  { name: "orden", label: "Orden", field: "orden", align: "left" },
  { name: "duracion", label: "Duración", field: "duracion", align: "left" },
  { name: "estado", label: "Estado", field: "estado", align: "left" },
  { name: "acciones", label: "Acciones", field: "acciones", align: "right" },
];

async function loadClases() {
  loading.value = true;
  try {
    const { data } = await api.get(`/cursos/${idcurso}/clases`);
    clases.value = data;
  } catch (err) {
    $q.notify({ type: "negative", message: "Error cargando clases" });
    console.error(err);
  } finally {
    loading.value = false;
  }
}

function openForm(clase = null) {
  if (clase) {
    form.value = { ...clase };
  } else {
    form.value = {
      idclase: null,
      titulo: "",
      descripcion: "",
      orden: 1,
      duracion: null,
      estado: "borrador",
    };
  }
  formDialog.value = true;
}

async function saveClase() {
  loading.value = true;
  try {
    if (form.value.idclase) {
      await api.patch(
        `/cursos/${idcurso}/clases/${form.value.idclase}`,
        form.value
      );
      $q.notify({ type: "positive", message: "Clase actualizada" });
    } else {
      await api.post(`/cursos/${idcurso}/clases`, form.value);
      $q.notify({ type: "positive", message: "Clase creada" });
    }
    formDialog.value = false;
    await loadClases();
  } catch (err) {
    $q.notify({ type: "negative", message: "Error guardando clase" });
    console.error(err);
  } finally {
    loading.value = false;
  }
}

async function deleteClase(id) {
  $q.dialog({
    title: "Confirmar",
    message: "¿Eliminar esta clase?",
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await api.delete(`/cursos/${idcurso}/clases/${id}`);
      $q.notify({ type: "positive", message: "Clase eliminada" });
      await loadClases();
    } catch (err) {
      $q.notify({ type: "negative", message: "Error eliminando clase" });
      console.error(err);
    }
  });
}

function goContenidos(idclase) {
  router.push({ name: "contenidos-list", params: { idclase } });
}

onMounted(() => {
  loadClases();
});
</script>
