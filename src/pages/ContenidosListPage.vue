<template>
  <q-page class="q-pa-md">
    <!-- Encabezado -->
    <div class="row items-center q-mb-md">
      <div class="text-h6">Contenidos de la Clase</div>
      <q-space />
      <q-btn
        color="primary"
        icon="add"
        label="Nuevo Contenido"
        @click="openForm()"
      />
    </div>

    <!-- Tabla -->
    <q-table
      :rows="contenidos"
      :columns="columns"
      row-key="idcontenido"
      flat
      bordered
      :loading="loading"
      no-data-label="No hay contenidos registrados"
    >
      <template v-slot:body-cell-acciones="props">
        <q-td>
          <q-btn
            dense
            flat
            icon="edit"
            color="primary"
            @click="openForm(props.row)"
          />
          <q-btn
            dense
            flat
            icon="delete"
            color="negative"
            @click="deleteContenido(props.row.idcontenido)"
          />
        </q-td>
      </template>
    </q-table>

    <!-- Diálogo -->
    <q-dialog v-model="formDialog">
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">
            {{ form.idcontenido ? "Editar Contenido" : "Nuevo Contenido" }}
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
          <q-select
            v-model="form.tipo"
            :options="['texto', 'video', 'pdf', 'link']"
            label="Tipo"
            outlined
            dense
          />

          <!-- Campo archivo con preview -->
          <div class="q-mt-md">
            <input
              ref="fileInput"
              type="file"
              class="hidden"
              :accept="fileAccept"
              @change="onFileChange"
            />

            <q-btn
              label="Seleccionar archivo"
              color="primary"
              @click="$refs.fileInput.click()"
            />

            <!-- Vista previa si es imagen -->
            <q-img
              v-if="previewUrl && form.tipo === 'texto'"
              :src="previewUrl"
              style="height: 200px; margin-top: 10px; border-radius: 8px"
              contain
            />
            <div v-else-if="previewUrl" class="q-mt-sm text-grey">
              Archivo seleccionado: <b>{{ archivoFile?.name }}</b>
            </div>
          </div>

          <q-input
            v-model.number="form.orden"
            label="Orden"
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
            @click="saveContenido"
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
import { useRoute } from "vue-router";
import { useQuasar } from "quasar";

const $q = useQuasar();
const route = useRoute();
const idclase = route.params.idclase;

const contenidos = ref([]);
const loading = ref(false);
const formDialog = ref(false);

const form = ref(resetForm());
const archivoFile = ref(null);
const previewUrl = ref(null);

function resetForm() {
  return {
    idcontenido: null,
    titulo: "",
    descripcion: "",
    tipo: "texto",
    url: "",
    orden: 1,
    estado: "borrador",
  };
}

const columns = [
  { name: "titulo", label: "Título", field: "titulo", align: "left" },
  { name: "tipo", label: "Tipo", field: "tipo", align: "left" },
  { name: "orden", label: "Orden", field: "orden", align: "left" },
  { name: "estado", label: "Estado", field: "estado", align: "left" },
  { name: "acciones", label: "Acciones", field: "acciones", align: "right" },
];

const fileAccept = ref("*/*");

function onFileChange(e) {
  const file = e.target.files[0];
  if (file) {
    archivoFile.value = file;
    previewUrl.value = URL.createObjectURL(file);
    form.value.url = file.name; // solo referencia
  }
}

async function loadContenidos() {
  loading.value = true;
  try {
    const { data } = await api.get(`/clases/${idclase}/contenidos`);
    contenidos.value = data;
  } catch (err) {
    $q.notify({ type: "negative", message: "Error cargando contenidos" });
    console.error(err);
  } finally {
    loading.value = false;
  }
}

function openForm(contenido = null) {
  form.value = contenido ? { ...contenido } : resetForm();
  previewUrl.value = null;
  archivoFile.value = null;
  formDialog.value = true;
}

async function saveContenido() {
  loading.value = true;
  try {
    const fd = new FormData();
    fd.append("titulo", form.value.titulo);
    fd.append("descripcion", form.value.descripcion);
    fd.append("tipo", form.value.tipo);
    fd.append("orden", form.value.orden);
    fd.append("estado", form.value.estado);
    if (archivoFile.value) {
      fd.append("archivo", archivoFile.value);
    }

    if (form.value.idcontenido) {
      await api.post(
        `/clases/${idclase}/contenidos/${form.value.idcontenido}?_method=PATCH`,
        fd,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      $q.notify({ type: "positive", message: "Contenido actualizado" });
    } else {
      await api.post(`/clases/${idclase}/contenidos`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      $q.notify({ type: "positive", message: "Contenido creado" });
    }

    formDialog.value = false;
    await loadContenidos();
  } catch (err) {
    $q.notify({ type: "negative", message: "Error guardando contenido" });
    console.error(err);
  } finally {
    loading.value = false;
  }
}

async function deleteContenido(id) {
  $q.dialog({
    title: "Confirmar",
    message: "¿Eliminar este contenido?",
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await api.delete(`/clases/${idclase}/contenidos/${id}`);
      $q.notify({ type: "positive", message: "Contenido eliminado" });
      await loadContenidos();
    } catch (err) {
      $q.notify({ type: "negative", message: "Error eliminando contenido" });
      console.error(err);
    }
  });
}

onMounted(() => {
  loadContenidos();
});
</script>
