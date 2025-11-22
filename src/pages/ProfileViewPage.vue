<!-- src/pages/PerfilEditPage.vue -->
<template>
  <q-page class="perfil-edit-page flex flex-center q-pa-lg">
    <q-card class="perfil-card shadow-10 q-pa-lg">
      <!-- 🌈 Encabezado -->
      <q-card-section class="text-center encabezado-card q-mb-md">
        <div class="text-h4 text-bold text-gradient">
          <q-icon name="person" class="q-mr-sm" />
          {{ idParam ? "Perfil del Estudiante" : "Mi Perfil" }}
        </div>
        <div class="text-subtitle2 text-grey-5">
          {{
            idParam
              ? "Visualiza la información general del estudiante"
              : "Información general y configuración de tu cuenta"
          }}
        </div>
      </q-card-section>

      <q-separator color="grey-8" />

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
            class="q-mt-sm full-width btn-secundario"
            label="Cambiar foto"
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
            class="input-dark"
          />
          <q-input
            v-model="form.apellidos"
            label="Apellidos"
            outlined
            dense
            :disable="!editMode"
            class="input-dark"
          />
          <q-input
            v-model="form.nombreusuario"
            label="Usuario"
            outlined
            dense
            :disable="!editMode"
            class="input-dark"
          />
          <q-input
            v-model="form.correo"
            label="Correo"
            outlined
            dense
            :disable="!editMode"
            class="input-dark"
          />
          <q-input
            v-model="form.telefono"
            label="Teléfono"
            outlined
            dense
            :disable="!editMode"
            class="input-dark"
          />
        </div>
      </q-card-section>

      <q-separator color="grey-8" />

      <!-- 🎓 Nivel académico -->
      <q-card-section>
        <div class="text-subtitle2 text-gradient q-mb-sm">Nivel académico</div>
        <q-select
          v-if="editMode"
          v-model="form.nivelacademico"
          :options="nivelesAcademicos"
          label="Selecciona tu nivel académico"
          outlined
          dense
          emit-value
          map-options
          class="input-dark"
        />
        <q-input
          v-else
          v-model="form.nivelacademico"
          label="Nivel académico"
          outlined
          dense
          disable
          class="input-dark"
        />
      </q-card-section>

      <q-separator color="grey-8" />

      <!-- 🌐 Redes -->
      <q-card-section>
        <div class="text-subtitle2 text-gradient q-mb-sm">
          Redes y presentación
        </div>
        <q-input
          v-model="form.linkedin_url"
          label="LinkedIn"
          outlined
          dense
          :disable="!editMode"
          class="input-dark"
        />
        <q-input
          v-model="form.github_url"
          label="GitHub"
          outlined
          dense
          :disable="!editMode"
          class="input-dark"
        />
        <q-input
          v-model="form.web_url"
          label="Sitio Web"
          outlined
          dense
          :disable="!editMode"
          class="input-dark"
        />
        <q-input
          v-model="form.bio"
          label="Biografía"
          type="textarea"
          outlined
          dense
          :disable="!editMode"
          autogrow
          class="input-dark"
        />
      </q-card-section>

      <q-separator color="grey-8" />

      <!-- 📌 Categorías -->
      <q-card-section>
        <div class="text-subtitle2 text-gradient q-mb-sm">
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
            class="text-grey-5 text-italic"
          >
            No seleccionaste categorías
          </div>
        </div>
      </q-card-section>

      <!-- 🔘 Botones -->
      <q-separator color="grey-8" />
      <q-card-actions align="right">
        <q-btn
          v-if="!idParam && !editMode"
          label="Editar perfil"
          class="btn-secundario"
          icon="edit"
          @click="enableEdit"
        />
        <q-btn
          v-else-if="!idParam && editMode"
          label="Guardar cambios"
          class="btn-principal"
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

// ✅ Reglas de validación
const reglas = {
  nombres: [
    (val) => !!val || "Campo obligatorio.",
    (val) =>
      /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(val) ||
      "Solo se permiten letras y espacios.",
  ],
  apellidos: [
    (val) => !!val || "Campo obligatorio.",
    (val) =>
      /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(val) ||
      "Solo se permiten letras y espacios.",
  ],
  nombreusuario: [
    (val) => !!val || "Campo obligatorio.",
    (val) => val.length <= 15 || "Máximo 15 caracteres.",
    (val) => /^[A-Za-z0-9_.-]+$/.test(val) || "Solo letras, números o guiones.",
  ],
  correo: [
    (val) => !!val || "Campo obligatorio.",
    (val) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) ||
      "Debe ser un correo electrónico válido.",
  ],
  telefono: [
    (val) => !!val || "Campo obligatorio.",
    (val) => /^[0-9]+$/.test(val) || "Solo números permitidos.",
    (val) =>
      (Number(val) >= 60000000 && Number(val) <= 79999999) ||
      "Debe estar entre 60000000 y 79999999.",
  ],
};

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

// 🧭 Cancelar edición
function cancelEdit() {
  form.value = { ...originalData.value };
  previewUrl.value = null;
  editMode.value = false;
}

// 🏷️ Seleccionar categoría
function toggleCategoria(cat) {
  if (!editMode.value) return;
  cat.seleccionado = !cat.seleccionado;
}

// 📚 Cargar categorías
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

// ✏️ Activar modo edición
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
/* 🌌 Fondo principal animado con círculos brillantes */
.perfil-edit-page {
  position: relative;
  overflow: hidden;
  background: radial-gradient(circle at 25% 25%, #19193b, #0a0d1d 90%);
  min-height: 100vh;
  font-family: "Poppins", "Segoe UI", sans-serif;
  color: #ffffff;
}

/* ✨ Círculos animados: mezcla cálido-violeta brillante */
.perfil-edit-page::before,
.perfil-edit-page::after,
.perfil-edit-page::part(extra) {
  content: "";
  position: absolute;
  border-radius: 50%;
  opacity: 0.4;
  filter: blur(70px);
  animation: float 20s infinite ease-in-out;
  z-index: 0;
}

.perfil-edit-page::before {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, #ff5f6d, #ff8e53);
  top: -120px;
  left: -150px;
  animation-delay: 0s;
}

.perfil-edit-page::after {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, #6a5acd, #8e9cff);
  bottom: -160px;
  right: -150px;
  animation-delay: 8s;
}

@keyframes float {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 0.5;
  }
  50% {
    transform: translate(50px, -40px) scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.5;
  }
}

/* 🌈 Card principal */
.perfil-card {
  position: relative;
  z-index: 1;
  background: rgba(28, 34, 66, 0.9);
  border-radius: 20px;
  width: 100%;
  max-width: 900px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
  color: #ffffff;
}

/* ✨ Encabezado */
.encabezado-card {
  border-radius: 12px;
  padding: 20px;
}

/* 🔤 Títulos y subtítulos */
.text-gradient {
  background: linear-gradient(145deg, #7484fa, #6a5acd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.text-subtitle2 {
  color: #ffffff !important;
  font-weight: 700;
}

/* 🟣 Avatar brillante */
.avatar-brillante {
  background: linear-gradient(145deg, #ff8e53, #ff5f6d);
  border: 3px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 0 25px rgba(255, 120, 120, 0.7);
  font-size: 42px;
  font-weight: 900;
  color: white;
}

/* 🧾 Inputs oscuros con más separación y borde naranja en foco */
.input-dark {
  margin-bottom: 14px; /* Más armonía visual entre campos */
}

.input-dark :deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.08);
  color: #fff !important;
  border-radius: 10px !important;
  transition: border 0.3s, box-shadow 0.3s;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* borde naranja cuando se selecciona */
.input-dark :deep(.q-field--focused .q-field__control) {
  border: 2px solid #ff8e53 !important;
  box-shadow: 0 0 10px rgba(255, 120, 80, 0.6);
}

.input-dark :deep(.q-field__label) {
  color: #ffffff !important;
  font-weight: 600;
}
.input-dark :deep(input),
.input-dark :deep(textarea) {
  color: #ffffff !important;
}

/* 🧩 Asegurar texto blanco también en selects */
.input-dark :deep(.q-field__native),
.input-dark :deep(.q-field__native span),
.input-dark :deep(.q-select__content),
.input-dark :deep(.q-item__label) {
  color: #ffffff !important;
}

/* 🎯 Flecha (icono) del select también blanca */
.input-dark :deep(.q-field__append .q-icon) {
  color: #ffffff !important;
}

/* 💠 Chips */
.bg-blur {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.q-chip {
  font-weight: 700;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.15);
}

/* 🔘 Botones */
.btn-principal {
  background: linear-gradient(145deg, #ff5f6d, #ff8e53);
  color: white;
  font-weight: bold;
  border-radius: 10px;
  transition: 0.3s;
}
.btn-principal:hover {
  box-shadow: 0 0 15px rgba(255, 120, 80, 0.8);
}

.btn-secundario {
  background: transparent;
  border: 2px solid #ff8e53;
  color: #ff8e53;
  font-weight: bold;
  border-radius: 10px;
  transition: 0.3s;
}
.btn-secundario:hover {
  background: #ff8e53;
  color: white;
}
</style>
