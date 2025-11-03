<template>
  <q-page class="perfil-edit-page flex flex-center q-pa-lg">
    <q-card class="perfil-card shadow-10 q-pa-lg">
      <!-- 🌈 Encabezado -->
      <q-card-section class="text-center encabezado-card q-mb-md">
        <div class="text-h4 text-bold text-white">
          <q-icon name="person" class="q-mr-sm" />
          {{ idParam ? "Perfil del Estudiante" : "Mi Perfil" }}
        </div>
        <div class="text-subtitle2 text-white">
          {{
            idParam
              ? "Visualiza la información general del estudiante"
              : "Información general y configuración de tu cuenta"
          }}
        </div>
      </q-card-section>

      <q-separator color="white" />

      <!-- 📸 Foto + datos básicos -->
      <q-card-section class="row items-center q-col-gutter-md q-mt-md">
        <!-- Avatar -->
        <div class="col-auto text-center">
          <q-avatar size="120px" class="avatar-brillante">
            <img
              v-if="previewUrl || fotoUrl"
              :src="previewUrl || fotoUrl"
              alt="avatar"
            />
            <template v-else>
              {{ iniciales }}
            </template>
          </q-avatar>

          <q-btn
            v-if="editMode"
            class="q-mt-sm full-width"
            label="Cambiar foto"
            color="white"
            text-color="deep-purple-7"
            glossy
            size="sm"
            @click="pickFile"
          />
          <input
            ref="fileInput"
            type="file"
            class="hidden"
            accept="image/*"
            @change="handleFileChange"
          />
        </div>

        <!-- Datos -->
        <div class="col">
          <q-input
            v-model="form.nombres"
            label="Nombres"
            outlined
            dense
            :disable="!editMode"
          />
          <q-input
            v-model="form.apellidos"
            label="Apellidos"
            outlined
            dense
            :disable="!editMode"
          />
          <q-input
            v-model="form.nombreusuario"
            label="Usuario"
            outlined
            dense
            :disable="!editMode"
          />
          <q-input
            v-model="form.correo"
            label="Correo"
            outlined
            dense
            :disable="!editMode"
          />
          <q-input
            v-model="form.telefono"
            label="Teléfono"
            outlined
            dense
            :disable="!editMode"
          />
        </div>
      </q-card-section>

      <q-separator color="white" />

      <!-- 🎓 Nivel académico -->
      <q-card-section>
        <div class="text-subtitle2 text-white q-mb-sm">Nivel académico</div>
        <q-select
          v-if="editMode"
          v-model="form.nivelacademico"
          :options="nivelesAcademicos"
          label="Selecciona tu nivel académico"
          outlined
          dense
          emit-value
          map-options
        />
        <q-input
          v-else
          v-model="form.nivelacademico"
          label="Nivel académico"
          outlined
          dense
          disable
        />
      </q-card-section>

      <q-separator color="white" />

      <!-- 🌐 Redes -->
      <q-card-section>
        <div class="text-subtitle2 text-white q-mb-sm">
          Redes y presentación
        </div>
        <q-input
          v-model="form.linkedin_url"
          label="LinkedIn"
          outlined
          dense
          :disable="!editMode"
        />
        <q-input
          v-model="form.github_url"
          label="GitHub"
          outlined
          dense
          :disable="!editMode"
        />
        <q-input
          v-model="form.web_url"
          label="Sitio Web"
          outlined
          dense
          :disable="!editMode"
        />
        <q-input
          v-model="form.bio"
          label="Biografía"
          type="textarea"
          outlined
          dense
          :disable="!editMode"
          autogrow
        />
      </q-card-section>

      <q-separator color="white" />

      <!-- 📌 Categorías -->
      <q-card-section>
        <div class="text-subtitle2 text-white q-mb-sm">
          Intereses / Categorías
        </div>

        <!-- Edición -->
        <div
          v-if="editMode"
          class="q-pa-sm bg-blur rounded-borders row q-col-gutter-sm"
        >
          <q-chip
            v-for="cat in categorias"
            :key="cat.idcategoria"
            :label="cat.nombre"
            color="white"
            text-color="deep-purple-7"
            clickable
            :outline="!cat.seleccionado"
            @click="toggleCategoria(cat)"
          />
        </div>

        <!-- Solo vista -->
        <div v-else class="q-pa-sm bg-blur rounded-borders row q-col-gutter-sm">
          <q-chip
            v-for="cat in categorias.filter((c) => c.seleccionado)"
            :key="cat.idcategoria"
            :label="cat.nombre"
            color="white"
            text-color="deep-purple-7"
          />
          <div
            v-if="categorias.filter((c) => c.seleccionado).length === 0"
            class="text-grey-3 text-italic"
          >
            No seleccionaste categorías
          </div>
        </div>
      </q-card-section>

      <!-- 🔘 Botones -->
      <q-separator color="white" />
      <q-card-actions align="right">
        <q-btn
          v-if="!idParam && !editMode"
          label="Editar perfil"
          color="white"
          text-color="deep-purple-7"
          glossy
          icon="edit"
          @click="enableEdit"
        />
        <q-btn
          v-else-if="!idParam && editMode"
          label="Guardar cambios"
          color="white"
          text-color="green-8"
          glossy
          icon="save"
          :loading="loading"
          @click="updateProfile"
        />
        <q-btn
          v-if="editMode && !idParam"
          flat
          label="Cancelar"
          color="grey-5"
          @click="cancelEdit"
        />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { api } from "boot/axios";

// 📦 Variables principales
const route = useRoute();
const idParam = route.params.idusuario || null;

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

const nivelesAcademicos = ["Principiante", "Intermedio", "Avanzado"];
const categorias = ref([]);
const fotoUrl = ref(null);
const previewUrl = ref(null);
const loading = ref(false);
const editMode = ref(false);
const originalData = ref({});
const idusuario = ref(null);

// 🧩 Iniciales del avatar
const iniciales = computed(() => {
  if (!form.value.nombres || !form.value.apellidos) return "U";
  return (
    form.value.nombres.charAt(0).toUpperCase() +
    form.value.apellidos.charAt(0).toUpperCase()
  );
});

// 📸 Manejo de foto
const fileInput = ref(null);
function pickFile() {
  fileInput.value.click();
}
function handleFileChange(e) {
  const file = e.target.files[0];
  if (!file) return;
  previewUrl.value = URL.createObjectURL(file);
}

// 🔄 Cargar perfil (admin o estudiante)
async function loadProfile() {
  try {
    let url;
    if (idParam) {
      url = `/admin/usuarios/${idParam}/perfil`;
    } else {
      url = "/me/profile";
    }

    const { data } = await api.get(url);
    const u = data.user || data;

    idusuario.value = u.idusuario;
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
    categorias.value = u.categorias || [];
    fotoUrl.value = u.foto_url || null;
    originalData.value = { ...form.value };
  } catch (err) {
    console.error("❌ Error cargando perfil:", err.response?.data || err);
  }
}

// 🧾 Guardar perfil propio
async function updateProfile() {
  loading.value = true;
  try {
    await api.patch("/me/profile", {
      ...form.value,
      categorias: categorias.value
        .filter((c) => c.seleccionado)
        .map((c) => c.idcategoria),
    });

    if (fileInput.value?.files[0]) {
      const fd = new FormData();
      fd.append("foto", fileInput.value.files[0]);
      const { data } = await api.post("/me/profile/foto", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fotoUrl.value = data.user.foto_url;
      previewUrl.value = null;
    }

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
  previewUrl.value = null;
  editMode.value = false;
}

function toggleCategoria(cat) {
  if (!editMode.value) return;
  cat.seleccionado = !cat.seleccionado;
}

async function loadAllCategorias() {
  try {
    const { data } = await api.get(
      `/estudiantes/${idusuario.value}/categorias`
    );
    categorias.value = data.categorias || [];
  } catch (err) {
    console.error("❌ Error cargando todas las categorías:", err);
  }
}

async function enableEdit() {
  editMode.value = true;
  await loadAllCategorias();
}

// 🚀 Montaje
onMounted(() => {
  loadProfile();
  if (idParam) {
    editMode.value = false; // admin solo visualiza
  }
});
</script>

<style scoped>
.perfil-edit-page {
  background: radial-gradient(circle at 25% 25%, #1a0033, #0d001a 90%);
  min-height: 100vh;
  font-family: "Poppins", "Segoe UI", sans-serif;
}

/* 🌈 Card principal */
.perfil-card {
  background: linear-gradient(145deg, #5e17eb, #9c27b0, #c653ff);
  border-radius: 18px;
  width: 100%;
  max-width: 900px;
  color: white;
  box-shadow: 0 0 35px rgba(180, 50, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* 🌟 Encabezado */
.encabezado-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.25);
  text-shadow: 0 0 15px rgba(255, 255, 255, 0.6);
}
.encabezado-card .text-h4 {
  font-size: 2.2rem;
  font-weight: 800;
  letter-spacing: 0.5px;
}
.encabezado-card .text-subtitle2 {
  font-size: 1.1rem;
  font-weight: 500;
  opacity: 0.95;
}

/* 🟣 Avatar */
.avatar-brillante {
  background: linear-gradient(135deg, #fff, #e1bfff);
  color: #5e17eb;
  border: 3px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 0 35px rgba(255, 255, 255, 0.9);
  font-size: 44px;
  font-weight: 900;
}

/* ✨ Inputs */
:deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.18);
  border-radius: 10px !important;
  color: #fff !important;
  font-size: 1.15rem !important;
  font-weight: 700 !important;
  letter-spacing: 0.3px;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.6),
    0 0 12px rgba(170, 80, 255, 0.5);
}
:deep(.q-field__label) {
  color: #ffffff !important;
  font-weight: 800;
  font-size: 1rem;
  letter-spacing: 0.4px;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
}

/* ✨ Texto interno */
:deep(input),
:deep(textarea) {
  color: #fff !important;
  font-weight: 800 !important;
  font-size: 1.2rem !important;
}

/* 📘 Subtítulos de secciones */
.text-subtitle2 {
  font-size: 1.3rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

/* 🟪 Chips */
.bg-blur {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.25);
}
.q-chip {
  font-weight: 700;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.4);
}

/* ✨ Botones */
:deep(.q-btn) {
  font-weight: 700 !important;
  letter-spacing: 0.5px;
}
</style>
