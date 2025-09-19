<template>
  <q-page class="q-pa-md">
    <!-- Encabezado -->
    <div class="row items-center q-mb-md">
      <div class="text-h6">Mis Cursos</div>
      <q-space />
      <!-- Solo visible para profesores -->
      <q-btn
        v-if="auth.isProfessor"
        color="primary"
        icon="add"
        label="Nuevo curso"
        @click="$router.push({ name: 'cursos-create' })"
      />
    </div>

    <!-- Tabla de cursos -->
    <q-table
      :rows="cursos"
      :columns="columns"
      row-key="idcurso"
      flat
      bordered
      :loading="loading"
      no-data-label="No tienes cursos registrados"
    >
      <template v-slot:body-cell-acciones="props">
        <q-td>
          <!-- Botón editar -->
          <q-btn
            v-if="auth.isProfessor"
            dense
            flat
            icon="edit"
            color="primary"
            @click="editCurso(props.row.idcurso)"
          />
          <!-- Botón eliminar -->
          <q-btn
            v-if="auth.isProfessor"
            dense
            flat
            icon="delete"
            color="negative"
            @click="deleteCurso(props.row.idcurso)"
          />
          <!-- Botón clases -->
          <q-btn
            v-if="auth.isProfessor"
            dense
            flat
            icon="school"
            color="secondary"
            @click="goClases(props.row.idcurso)"
          />
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { api } from "boot/axios";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { useAuthStore } from "src/stores/auth";

const $q = useQuasar();
const router = useRouter();
const auth = useAuthStore(); // 👈 acceso a store de autenticación

const cursos = ref([]);
const loading = ref(false);

const columns = [
  { name: "nombre", label: "Nombre", field: "nombre", align: "left" },
  { name: "nivel", label: "Nivel", field: "nivel", align: "left" },
  { name: "estado", label: "Estado", field: "estado", align: "left" },
  { name: "acciones", label: "Acciones", field: "acciones", align: "right" },
];

async function loadCursos() {
  loading.value = true;
  try {
    const { data } = await api.get("/cursos");
    cursos.value = data.data || data;
  } catch (err) {
    console.error("❌ Error cargando cursos:", err);

    if (err.status === 403) {
      $q.notify({
        type: "warning",
        message: "Solo los profesores pueden gestionar cursos",
      });
    } else if (err.status === 401) {
      $q.notify({
        type: "negative",
        message: "No autorizado. Inicia sesión nuevamente",
      });
    } else {
      $q.notify({
        type: "negative",
        message: "Error cargando cursos",
      });
    }
  } finally {
    loading.value = false;
  }
}

function editCurso(id) {
  router.push({ name: "cursos-edit", params: { idcurso: id } });
}

function goClases(id) {
  router.push({ name: "clases-list", params: { idcurso: id } });
}

async function deleteCurso(id) {
  $q.dialog({
    title: "Confirmar",
    message: "¿Seguro que deseas eliminar este curso?",
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await api.delete(`/cursos/${id}`);
      await loadCursos();
      $q.notify({
        type: "positive",
        message: "Curso eliminado correctamente",
      });
    } catch (err) {
      console.error("❌ Error eliminando curso:", err.response?.data || err);
      $q.notify({
        type: "negative",
        message: "Error eliminando curso",
      });
    }
  });
}

onMounted(() => {
  loadCursos();
});
</script>
