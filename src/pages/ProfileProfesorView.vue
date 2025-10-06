<template>
  <q-page class="q-pa-md flex flex-center">
    <q-card class="q-pa-lg" style="max-width: 1000px; width: 100%">
      <!-- Header -->
      <q-card-section>
        <div class="text-h6 text-center text-primary">
          {{ isAdminView ? "Perfil de Profesor" : "Mi Perfil - Profesor" }}
        </div>
        <div class="text-subtitle2 text-grey-7 text-center">
          {{
            isAdminView
              ? "Visualización de datos del profesor"
              : "Información de tu cuenta como profesor"
          }}
        </div>
      </q-card-section>

      <q-separator />

      <!-- Foto + datos básicos -->
      <q-card-section class="row items-center q-col-gutter-md">
        <div class="col-auto text-center">
          <q-avatar size="120px" color="primary" text-color="white">
            <template v-if="fotoPreview">
              <img :src="fotoPreview" alt="avatar" />
            </template>
            <template v-else>
              {{ iniciales }}
            </template>
          </q-avatar>

          <!-- Botón solo si es profesor propio -->
          <q-btn
            v-if="editMode && !isAdminView"
            class="q-mt-sm full-width"
            label="Cambiar foto"
            color="secondary"
            size="sm"
            @click="pickFile"
          />
          <input
            ref="fileInput"
            type="file"
            class="hidden"
            accept="image/*"
            @change="onFileSelected"
          />
        </div>

        <!-- Datos básicos -->
        <div class="col">
          <q-input
            v-model="form.nombres"
            label="Nombres"
            outlined
            dense
            :disable="!editMode || isAdminView"
          />
          <q-input
            v-model="form.apellidos"
            label="Apellidos"
            outlined
            dense
            :disable="!editMode || isAdminView"
          />
          <q-input
            v-model="form.nombreusuario"
            label="Usuario"
            outlined
            dense
            :disable="!editMode || isAdminView"
          />
          <q-input
            v-model="form.correo"
            label="Correo"
            type="email"
            outlined
            dense
            :disable="!editMode || isAdminView"
          />
          <q-input
            v-model="form.telefono"
            label="Teléfono"
            outlined
            dense
            :disable="!editMode || isAdminView"
          />
          <q-input
            v-model="form.especialidad"
            label="Especialidad"
            outlined
            dense
            :disable="!editMode || isAdminView"
          />
        </div>
      </q-card-section>

      <q-separator />

      <!-- Perfil extendido -->
      <q-card-section>
        <q-input
          v-model="form.linkedin_url"
          label="LinkedIn"
          outlined
          dense
          :disable="!editMode || isAdminView"
        />
        <q-input
          v-model="form.github_url"
          label="GitHub"
          outlined
          dense
          :disable="!editMode || isAdminView"
        />
        <q-input
          v-model="form.web_url"
          label="Sitio Web"
          outlined
          dense
          :disable="!editMode || isAdminView"
        />
        <q-input
          v-model="form.bio"
          label="Biografía"
          type="textarea"
          outlined
          dense
          autogrow
          :disable="!editMode || isAdminView"
        />
      </q-card-section>

      <q-separator />

      <!-- Datos adicionales -->
      <q-card-section>
        <div class="text-subtitle1 text-primary q-mb-sm">Datos adicionales</div>
        <q-input
          v-model="form.direccion"
          label="Dirección"
          outlined
          dense
          :disable="!editMode || isAdminView"
        />
        <q-input
          v-model="form.pais"
          label="País"
          outlined
          dense
          :disable="!editMode || isAdminView"
        />
      </q-card-section>

      <q-separator />

      <!-- Experiencia laboral -->
      <q-card-section>
        <div class="text-subtitle1 text-primary q-mb-sm">
          Experiencia laboral
        </div>
        <q-input
          v-model="form.empresa"
          label="Empresa"
          outlined
          dense
          :disable="!editMode || isAdminView"
        />
        <q-input
          v-model="form.cargo"
          label="Cargo"
          outlined
          dense
          :disable="!editMode || isAdminView"
        />
        <div class="row q-col-gutter-md">
          <div class="col-6">
            <q-input
              v-model="form.fecha_inicio"
              type="date"
              label="Fecha inicio"
              outlined
              dense
              :disable="!editMode || isAdminView"
            />
          </div>
          <div class="col-6">
            <q-input
              v-model="form.fecha_fin"
              type="date"
              label="Fecha fin"
              outlined
              dense
              :disable="!editMode || isAdminView"
            />
          </div>
        </div>
        <q-input
          v-model="form.detalles"
          label="Detalles de la experiencia"
          type="textarea"
          outlined
          dense
          autogrow
          :disable="!editMode || isAdminView"
        />
      </q-card-section>

      <!-- Botones -->
      <q-card-actions align="right">
        <!-- Vista profesor -->
        <template v-if="!isAdminView">
          <q-btn
            v-if="!editMode"
            label="Editar perfil"
            color="primary"
            icon="edit"
            @click="editMode = true"
          />
          <q-btn
            v-if="editMode"
            label="Guardar cambios"
            color="positive"
            icon="save"
            :loading="loading"
            @click="updateProfile"
          />
          <q-btn
            v-if="editMode"
            flat
            label="Cancelar"
            color="grey-7"
            @click="cancelEdit"
          />
        </template>

        <!-- Vista admin -->
        <template v-else>
          <q-btn
            color="positive"
            label="Aprobar"
            icon="check"
            @click="cambiarEstado('aprobado')"
          />
          <q-btn
            color="negative"
            label="Rechazar"
            icon="close"
            flat
            @click="cambiarEstado('rechazado')"
          />
        </template>

        <q-btn
          flat
          label="Volver"
          color="secondary"
          icon="arrow_back"
          @click="$router.back()"
        />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { api } from "boot/axios";
import { useRoute, useRouter } from "vue-router";
import { useQuasar } from "quasar";

const route = useRoute();
const router = useRouter();
const $q = useQuasar();

const isAdminView = ref(false);

const form = ref({
  nombres: "",
  apellidos: "",
  nombreusuario: "",
  correo: "",
  telefono: "",
  especialidad: "",
  linkedin_url: "",
  github_url: "",
  web_url: "",
  bio: "",
  direccion: "",
  pais: "",
  empresa: "",
  cargo: "",
  fecha_inicio: "",
  fecha_fin: "",
  detalles: "",
});

const fotoUrl = ref(null);
const fotoPreview = ref(null);
const loading = ref(false);
const editMode = ref(false);
const originalData = ref({});

// Iniciales si no hay foto
const iniciales = computed(() => {
  if (!form.value.nombres || !form.value.apellidos) return "P";
  return (
    form.value.nombres.charAt(0).toUpperCase() +
    form.value.apellidos.charAt(0).toUpperCase()
  );
});

// Cargar perfil
async function loadProfile() {
  try {
    let resp;
    if (route.params.idprofesor) {
      isAdminView.value = true;
      resp = await api.get(`/admin/profesores/${route.params.idprofesor}`);
    } else {
      resp = await api.get("/me/profile/profesor");
    }

    const u = resp.data.user; // 👈 ahora siempre es .user
    form.value = {
      nombres: u.nombres || "",
      apellidos: u.apellidos || "",
      nombreusuario: u.nombreusuario || "",
      correo: u.correo || "",
      telefono: u.telefono || "",
      especialidad: u.especialidad || "",
      linkedin_url: u.linkedin_url || "",
      github_url: u.github_url || "",
      web_url: u.web_url || "",
      bio: u.bio || "",
      direccion: u.direccion || "",
      pais: u.pais || "",
      empresa: u.empresa || "",
      cargo: u.cargo || "",
      fecha_inicio: u.fecha_inicio || "",
      fecha_fin: u.fecha_fin || "",
      detalles: u.detalles || "",
    };

    originalData.value = { ...form.value };
    fotoUrl.value = u.foto_url;
    fotoPreview.value = u.foto_url;
  } catch (err) {
    console.error("❌ Error cargando perfil:", err.response?.data || err);
  }
}

// Cambiar estado (admin)
async function cambiarEstado(estado) {
  try {
    await api.post(`/admin/profesores/${route.params.idprofesor}/estado`, {
      estado,
    });
    $q.notify({
      type: estado === "aprobado" ? "positive" : "warning",
      message: `Profesor ${estado}`,
    });
    router.push({ name: "admin-solicitudes" });
  } catch (err) {
    $q.notify({ type: "negative", message: "Error al cambiar estado" });
  }
}

// Guardar cambios (profesor)
async function updateProfile() {
  loading.value = true;
  try {
    await api.patch("/me/profile/profesor", form.value);
    editMode.value = false;
    loadProfile();
  } catch (err) {
    console.error("❌ Error actualizando perfil:", err.response?.data || err);
  } finally {
    loading.value = false;
  }
}

function cancelEdit() {
  form.value = { ...originalData.value };
  editMode.value = false;
  fotoPreview.value = fotoUrl.value;
}

onMounted(() => {
  loadProfile();
});
</script>

<style scoped>
.q-page {
  background: #0f1324;
}
</style>
