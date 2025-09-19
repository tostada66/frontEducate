<template>
  <q-page class="q-pa-md flex flex-center">
    <q-card class="q-pa-lg" style="max-width: 800px; width: 100%">
      <!-- Header -->
      <q-card-section>
        <div class="text-h6 text-center text-primary">Mi Perfil</div>
        <div class="text-subtitle2 text-grey-7 text-center">
          Información de tu cuenta
        </div>
      </q-card-section>

      <q-separator />

      <!-- Foto + datos básicos -->
      <q-card-section class="row items-center q-col-gutter-md">
        <div class="col-auto text-center">
          <q-avatar size="100px" color="primary" text-color="white">
            <template v-if="fotoUrl">
              <img :src="fotoUrl" alt="avatar" />
            </template>
            <template v-else>
              {{ iniciales }}
            </template>
          </q-avatar>

          <q-btn
            v-if="editMode"
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
            @change="uploadFoto"
          />
        </div>

        <!-- Datos básicos -->
        <div class="col">
          <q-input
            v-model="form.nombres"
            label="Nombres"
            outlined
            dense
            :disable="!editMode"
            clearable
          />
          <q-input
            v-model="form.apellidos"
            label="Apellidos"
            outlined
            dense
            :disable="!editMode"
            clearable
          />
          <q-input
            v-model="form.nombreusuario"
            label="Usuario"
            outlined
            dense
            :disable="!editMode"
            clearable
          />
          <q-input
            v-model="form.correo"
            label="Correo"
            type="email"
            outlined
            dense
            :disable="!editMode"
            clearable
          />
          <q-input
            v-model="form.telefono"
            label="Teléfono"
            outlined
            dense
            :disable="!editMode"
            clearable
          />
          <q-input
            v-model="form.nivelacademico"
            label="Nivel Académico"
            outlined
            dense
            :disable="!editMode"
            clearable
          />
        </div>
      </q-card-section>

      <q-separator />

      <!-- Categorías -->
      <q-card-section>
        <div class="text-subtitle2 q-mb-sm">Intereses / Categorías</div>
        <div class="q-pa-sm bg-grey-2 rounded-borders">
          <q-chip
            v-for="cat in categoriasSeleccionadas"
            :key="cat.idcategoria"
            color="primary"
            text-color="white"
            class="q-mr-sm q-mb-sm"
          >
            {{ cat.nombre }}
          </q-chip>
          <div v-if="categoriasSeleccionadas.length === 0" class="text-grey">
            No seleccionaste categorías
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <!-- Datos extendidos -->
      <q-card-section>
        <q-input
          v-model="form.linkedin_url"
          label="LinkedIn"
          outlined
          dense
          :disable="!editMode"
          clearable
        />
        <q-input
          v-model="form.github_url"
          label="GitHub"
          outlined
          dense
          :disable="!editMode"
          clearable
        />
        <q-input
          v-model="form.web_url"
          label="Sitio Web"
          outlined
          dense
          :disable="!editMode"
          clearable
        />
        <q-input
          v-model="form.bio"
          label="Biografía"
          type="textarea"
          outlined
          dense
          :disable="!editMode"
          clearable
        />
      </q-card-section>

      <!-- Botones -->
      <q-card-actions align="right">
        <q-btn
          v-if="!editMode"
          label="Editar perfil"
          color="primary"
          icon="edit"
          @click="editMode = true"
        />
        <q-btn
          v-else
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
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { api } from "boot/axios";

const form = ref({
  nombres: "",
  apellidos: "",
  nombreusuario: "",
  correo: "",
  telefono: "",
  nivelacademico: "",
  linkedin_url: "",
  github_url: "",
  web_url: "",
  bio: "",
});

const categoriasSeleccionadas = ref([]);
const fotoUrl = ref(null);
const loading = ref(false);
const editMode = ref(false);
const originalData = ref({});

// Iniciales si no hay foto
const iniciales = computed(() => {
  if (!form.value.nombres || !form.value.apellidos) return "U";
  return (
    form.value.nombres.charAt(0).toUpperCase() +
    form.value.apellidos.charAt(0).toUpperCase()
  );
});

// File input
const fileInput = ref(null);
function pickFile() {
  fileInput.value.click();
}

// 📂 Subir foto
async function uploadFoto(e) {
  const file = e.target.files[0];
  if (!file) return;
  const fd = new FormData();
  fd.append("foto", file);

  try {
    const { data } = await api.post("/me/profile/foto", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    fotoUrl.value = data.foto_url;
  } catch (err) {
    console.error("❌ Error subiendo foto:", err.response?.data || err);
  }
}

// 📂 Guardar cambios de perfil
async function updateProfile() {
  loading.value = true;
  try {
    await api.patch("/me/profile", form.value);
    editMode.value = false;
    loadProfile();
  } catch (err) {
    console.error("❌ Error actualizando perfil:", err.response?.data || err);
  } finally {
    loading.value = false;
  }
}

// 📂 Cancelar edición
function cancelEdit() {
  form.value = { ...originalData.value }; // restaurar los datos originales
  editMode.value = false;
}

// 📂 Cargar perfil (logueado)
async function loadProfile() {
  try {
    const { data } = await api.get("/me/profile");
    const u = data.user;

    form.value = {
      nombres: u.nombres || "",
      apellidos: u.apellidos || "",
      nombreusuario: u.nombreusuario || "",
      correo: u.correo || "",
      telefono: u.telefono || "",
      nivelacademico: u.nivelacademico || "",
      linkedin_url: u.linkedin_url || "",
      github_url: u.github_url || "",
      web_url: u.web_url || "",
      bio: u.bio || "",
    };

    originalData.value = { ...form.value };
    categoriasSeleccionadas.value = u.categorias || [];
    fotoUrl.value = u.foto_url;
  } catch (err) {
    console.error("❌ Error cargando perfil:", err.response?.data || err);
  }
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
