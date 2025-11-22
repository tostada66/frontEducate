<template>
  <q-page class="perfil-page q-pa-lg flex flex-center">
    <q-card class="perfil-card shadow-10 q-pa-lg">
      <!-- 🌈 Encabezado brillante -->
      <q-card-section class="text-center encabezado-card q-mb-md">
        <div
          class="text-h4 text-bold text-white flex flex-center items-center justify-center"
        >
          <q-icon
            name="auto_awesome"
            class="q-mr-sm text-yellow-4"
            size="32px"
          />
          Completa tu perfil
        </div>
        <div class="text-subtitle2 text-white q-mt-xs">
          Agrega tus últimos datos para terminar tu registro
        </div>
      </q-card-section>

      <q-separator color="white" />

      <!-- 📸 Foto -->
      <q-card-section class="row items-center q-col-gutter-md q-mt-md">
        <div class="col-auto text-center">
          <q-avatar size="120px" class="avatar-brillante shadow-10">
            <template v-if="fotoUrl">
              <img :src="fotoUrl" alt="avatar" />
            </template>
            <template v-else>
              {{ iniciales }}
            </template>
          </q-avatar>

          <q-btn
            class="q-mt-sm full-width"
            label="Subir foto"
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
            @change="uploadFoto"
          />
        </div>

        <!-- 📋 Datos básicos -->
        <div class="col">
          <q-input
            v-model="form.nombreusuario"
            label="Usuario"
            outlined
            dense
            readonly
          />
          <q-input
            v-model="form.telefono"
            label="Teléfono"
            outlined
            dense
            readonly
          />
          <q-input
            v-model="form.nivelacademico"
            label="Nivel Académico"
            outlined
            dense
            readonly
          />
        </div>
      </q-card-section>

      <q-separator color="white" />

      <!-- 🎓 Categorías -->
      <q-card-section>
        <div class="text-subtitle2 text-white q-mb-sm text-bold">
          Intereses / Categorías
        </div>
        <div class="q-pa-sm bg-blur rounded-borders">
          <q-chip
            v-for="cat in categoriasSeleccionadas"
            :key="cat"
            color="white"
            text-color="deep-purple-8"
            class="q-mr-sm q-mb-sm chip-luminoso"
          >
            {{ cat }}
          </q-chip>
          <div
            v-if="categoriasSeleccionadas.length === 0"
            class="text-grey-3 text-italic"
          >
            No seleccionaste categorías
          </div>
        </div>
      </q-card-section>

      <q-separator color="white" />

      <!-- 🌐 Datos extendidos -->
      <q-card-section>
        <q-input v-model="form.linkedin_url" label="LinkedIn" outlined dense />
        <q-input v-model="form.github_url" label="GitHub" outlined dense />
        <q-input v-model="form.web_url" label="Sitio Web" outlined dense />
        <q-input
          v-model="form.bio"
          label="Biografía"
          type="textarea"
          outlined
          dense
        />
      </q-card-section>

      <!-- 💾 Guardar -->
      <q-card-actions align="right">
        <q-btn
          label="Finalizar registro"
          color="white"
          text-color="deep-purple-7"
          glossy
          class="guardar-btn"
          :loading="loading"
          @click="saveProfile"
        />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { api } from "boot/axios";

const route = useRoute();
const router = useRouter();
const idusuario = route.query.idusuario;

const form = ref({
  idusuario,
  nombreusuario: "",
  telefono: "",
  nivelacademico: "",
  linkedin_url: "",
  github_url: "",
  web_url: "",
  bio: "",
});

const fotoUrl = ref(null);
const categoriasSeleccionadas = ref([]);
const loading = ref(false);

const iniciales = computed(() =>
  form.value.nombreusuario
    ? form.value.nombreusuario.charAt(0).toUpperCase()
    : "U"
);

const fileInput = ref(null);
function pickFile() {
  fileInput.value.click();
}

async function uploadFoto(e) {
  const file = e.target.files[0];
  if (!file) return;
  const fd = new FormData();
  fd.append("idusuario", idusuario);
  fd.append("foto", file);
  try {
    const { data } = await api.post("/register/estudiante/foto", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    fotoUrl.value = data.user.foto_url;
  } catch (err) {
    console.error("❌ Error subiendo foto:", err);
  }
}

async function saveProfile() {
  loading.value = true;
  try {
    const payload = {
      idusuario: form.value.idusuario,
      linkedin_url: form.value.linkedin_url,
      github_url: form.value.github_url,
      web_url: form.value.web_url,
      bio: form.value.bio,
    };
    await api.post("/register/estudiante/profile", payload);
    router.replace({ name: "login" });
  } catch (err) {
    console.error("❌ Error guardando perfil:", err);
  } finally {
    loading.value = false;
  }
}

async function loadProfile() {
  try {
    const { data } = await api.get(`/register/estudiante/show/${idusuario}`);
    const u = data.user;
    form.value = {
      idusuario,
      nombreusuario: u.nombreusuario || "",
      telefono: u.telefono || "",
      nivelacademico: u.nivelacademico || "",
      linkedin_url: u.linkedin_url || "",
      github_url: u.github_url || "",
      web_url: u.web_url || "",
      bio: u.bio || "",
    };
    categoriasSeleccionadas.value = u.categorias.map((c) => c.nombre);
    fotoUrl.value = u.foto_url;
  } catch (err) {
    console.error("❌ Error cargando perfil:", err);
  }
}

onMounted(loadProfile);
</script>

<style scoped>
/* 🌌 Fondo general */
.perfil-page {
  background: radial-gradient(circle at 25% 25%, #180032, #0a001a 90%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 💜 Card principal: tono neón-rosado */
.perfil-card {
  background: linear-gradient(145deg, #c34aff, #d663ff);
  border-radius: 22px;
  width: 100%;
  max-width: 850px;
  color: white;
  box-shadow: 0 0 50px rgba(190, 40, 255, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(10px);
  transition: 0.3s ease;
  font-size: 1.08rem;
}

/* ✨ Encabezado */
.encabezado-card {
  background: #7b23ff;
  border-radius: 20px 20px 0 0;
  padding: 1.8rem 1rem;
  text-align: center;
  box-shadow: 0 0 25px rgba(255, 255, 255, 0.3);
  color: #fff;
}

/* 🟣 Avatar */
.avatar-brillante {
  background: linear-gradient(135deg, #fff, #f3d6ff);
  color: #5917eb;
  border: 3px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 0 30px rgba(255, 200, 255, 0.7);
  font-size: 48px;
  font-weight: bold;
}

/* 🧾 Inputs */
:deep(.q-field__control) {
  background: rgba(50, 0, 90, 0.55); /* Contraste fuerte con fondo */
  border-radius: 12px !important;
  border: 1.5px solid rgba(255, 180, 255, 0.4);
  box-shadow: 0 0 12px rgba(255, 120, 255, 0.2),
    inset 0 0 6px rgba(0, 0, 0, 0.3);
  color: #fff !important;
  transition: all 0.3s ease;
}

/* Hover: más luminoso */
:deep(.q-field__control:hover) {
  background: rgba(60, 0, 110, 0.65);
  box-shadow: 0 0 20px rgba(255, 160, 255, 0.4);
}

/* Focus: borde neón */
:deep(.q-field__control.q-field--focused) {
  border-color: #ff66ff;
  box-shadow: 0 0 25px rgba(255, 110, 255, 0.8),
    inset 0 0 8px rgba(255, 255, 255, 0.15);
}

/* ✍️ Texto y etiquetas */
:deep(.q-field__label) {
  color: #fceeff !important;
  font-weight: 700;
  font-size: 1.05rem;
}
:deep(.q-field__native),
:deep(.q-field__input) {
  color: #fff !important;
  font-size: 1.2rem;
  font-weight: 700;
}

/* 📚 Chips */
.chip-luminoso {
  background: linear-gradient(145deg, #fff, #ffd9ff) !important;
  color: #6a00c9 !important;
  box-shadow: 0 0 15px rgba(255, 200, 255, 0.6);
  font-weight: 600;
  transition: 0.3s;
}
.chip-luminoso:hover {
  transform: scale(1.07);
  box-shadow: 0 0 22px rgba(255, 200, 255, 0.8);
}

/* 💾 Botón final */
.guardar-btn {
  font-weight: bold;
  font-size: 1.1rem;
  border-radius: 10px;
  color: #6b17eb;
  background: #fff;
  box-shadow: 0 0 25px rgba(255, 255, 255, 0.6);
  transition: 0.3s;
}
.guardar-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0 40px rgba(255, 190, 255, 0.8);
}

/* 🧩 Secciones internas */
.q-card-section {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 16px;
  margin-bottom: 12px;
  box-shadow: inset 0 0 14px rgba(255, 200, 255, 0.1);
}
</style>
