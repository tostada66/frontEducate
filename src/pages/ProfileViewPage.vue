<template>
  <q-page class="q-pa-md flex flex-center">
    <q-card class="q-pa-lg" style="max-width: 900px; width: 100%">
      <!-- Header -->
      <q-card-section>
        <div class="text-h6 text-center text-primary">Mi Perfil</div>
        <div class="text-subtitle2 text-grey-7 text-center">
          Información de tu cuenta
        </div>
      </q-card-section>

      <q-separator />

      <!-- 📷 Foto + datos básicos -->
      <q-card-section class="row items-center q-col-gutter-md">
        <div class="col-auto text-center">
          <q-avatar size="120px" color="primary" text-color="white">
            <!-- ✅ vista previa si selecciona foto, si no, la guardada -->
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
            color="secondary"
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
            type="email"
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

      <q-separator />

      <!-- 🎓 Nivel académico -->
      <q-card-section>
        <div class="text-subtitle1 text-primary q-mb-md">Nivel académico</div>
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

      <q-separator />

      <!-- 🌐 Redes y bio -->
      <q-card-section>
        <div class="text-subtitle1 text-primary q-mb-md">
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

      <q-separator />

      <!-- 📌 Intereses -->
      <q-card-section>
        <div class="text-subtitle1 text-primary q-mb-md">
          Intereses / Categorías
        </div>

        <!-- En edición: TODAS -->
        <div
          v-if="editMode"
          class="q-pa-sm bg-grey-2 rounded-borders row q-col-gutter-sm"
        >
          <q-chip
            v-for="cat in categorias"
            :key="cat.idcategoria"
            :label="cat.nombre"
            color="primary"
            text-color="white"
            clickable
            :outline="!cat.seleccionado"
            @click="toggleCategoria(cat)"
          />
        </div>

        <!-- Solo vista: SOLO seleccionadas -->
        <div
          v-else
          class="q-pa-sm bg-grey-2 rounded-borders row q-col-gutter-sm"
        >
          <q-chip
            v-for="cat in categorias.filter((c) => c.seleccionado)"
            :key="cat.idcategoria"
            :label="cat.nombre"
            color="primary"
            text-color="white"
          />
          <div
            v-if="categorias.filter((c) => c.seleccionado).length === 0"
            class="text-grey"
          >
            No seleccionaste categorías
          </div>
        </div>
      </q-card-section>

      <!-- 🔘 Botones -->
      <q-separator />
      <q-card-actions align="right">
        <q-btn
          v-if="!editMode"
          label="Editar perfil"
          color="primary"
          icon="edit"
          @click="enableEdit"
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

const nivelesAcademicos = ["Principiante", "Intermedio", "Avanzado"];

const categorias = ref([]);
const fotoUrl = ref(null); // foto guardada en backend
const previewUrl = ref(null); // ✅ foto temporal seleccionada
const loading = ref(false);
const editMode = ref(false);
const originalData = ref({});
const idusuario = ref(null);

const iniciales = computed(() => {
  if (!form.value.nombres || !form.value.apellidos) return "U";
  return (
    form.value.nombres.charAt(0).toUpperCase() +
    form.value.apellidos.charAt(0).toUpperCase()
  );
});

const fileInput = ref(null);
function pickFile() {
  fileInput.value.click();
}

// ✅ Manejar archivo para preview inmediato
function handleFileChange(e) {
  const file = e.target.files[0];
  if (!file) return;
  previewUrl.value = URL.createObjectURL(file);
}

// 📂 Guardar cambios
async function updateProfile() {
  loading.value = true;
  try {
    await api.patch("/me/profile", {
      ...form.value,
      categorias: categorias.value
        .filter((c) => c.seleccionado)
        .map((c) => c.idcategoria),
    });

    // si hay una nueva foto, subirla
    if (fileInput.value?.files[0]) {
      const fd = new FormData();
      fd.append("foto", fileInput.value.files[0]);
      const { data } = await api.post("/me/profile/foto", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fotoUrl.value = data.user.foto_url;
      previewUrl.value = null; // limpiar preview, ya está guardada
    }

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
  form.value = { ...originalData.value };
  previewUrl.value = null; // cancelar descarta preview
  editMode.value = false;
  loadProfile();
}

// 📂 Toggle categoría
function toggleCategoria(cat) {
  if (!editMode.value) return;
  cat.seleccionado = !cat.seleccionado;
}

// 📂 Cargar perfil
async function loadProfile() {
  try {
    const { data } = await api.get("/me/profile");
    const u = data.user;

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

    categorias.value = (u.categorias || []).filter((c) => c.seleccionado);

    originalData.value = { ...form.value };
    fotoUrl.value = u.foto_url;
  } catch (err) {
    console.error("❌ Error cargando perfil:", err.response?.data || err);
  }
}

// 📂 Cargar TODAS las categorías en edición
async function loadAllCategorias() {
  try {
    const { data } = await api.get(
      `/estudiantes/${idusuario.value}/categorias`
    );
    categorias.value = data.categorias || [];
  } catch (err) {
    console.error(
      "❌ Error cargando todas las categorías:",
      err.response?.data || err
    );
  }
}

async function enableEdit() {
  editMode.value = true;
  await loadAllCategorias();
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
