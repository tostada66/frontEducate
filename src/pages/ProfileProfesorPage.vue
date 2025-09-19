<template>
  <q-page class="q-pa-md flex flex-center">
    <q-card class="q-pa-lg" style="max-width: 800px; width: 100%">
      <!-- Header -->
      <q-card-section>
        <div class="text-h5 text-weight-bold text-primary">Perfil Profesor</div>
        <div class="text-grey-7">
          Completa tu información como profesor antes de iniciar sesión
        </div>
      </q-card-section>

      <!-- ✅ Mensajes -->
      <q-card-section v-if="successMsg">
        <q-banner rounded class="bg-green-1 text-green-9">
          {{ successMsg }}
        </q-banner>
      </q-card-section>
      <q-card-section v-if="errors.general">
        <q-banner rounded class="bg-red-1 text-red-9">
          {{ errors.general }}
        </q-banner>
      </q-card-section>

      <!-- ✅ Formulario -->
      <q-form @submit.prevent="onSubmit" class="q-gutter-md">
        <!-- Foto + Datos básicos -->
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

          <div class="col">
            <q-input
              v-model.trim="form.nombres"
              label="Nombres"
              outlined
              dense
              disable
            />
            <q-input
              v-model.trim="form.apellidos"
              label="Apellidos"
              outlined
              dense
              disable
            />
            <q-input
              v-model.trim="form.correo"
              label="Correo"
              outlined
              dense
              disable
            />
            <q-input
              v-model.trim="form.nombreusuario"
              label="Usuario"
              outlined
              dense
              disable
            />
            <q-input
              v-model.trim="form.telefono"
              label="Teléfono"
              outlined
              dense
              disable
            />
          </div>
        </q-card-section>

        <!-- Datos extendidos -->
        <q-card-section class="row q-col-gutter-md">
          <div class="col-12">
            <q-input
              v-model.trim="form.especialidad"
              label="Especialidad *"
              outlined
              dense
              clearable
              :error="!!fe.especialidad"
              :error-message="fe.especialidad"
              @blur="touch('especialidad')"
            />
          </div>
          <div class="col-12">
            <q-input
              v-model.trim="form.bio"
              label="Biografía"
              type="textarea"
              outlined
              dense
              autogrow
              clearable
            />
          </div>
          <div class="col-12 col-sm-6">
            <q-input
              v-model.trim="form.linkedin_url"
              label="LinkedIn"
              outlined
              dense
              clearable
            />
          </div>
          <div class="col-12 col-sm-6">
            <q-input
              v-model.trim="form.github_url"
              label="GitHub"
              outlined
              dense
              clearable
            />
          </div>
          <div class="col-12">
            <q-input
              v-model.trim="form.web_url"
              label="Sitio Web"
              outlined
              dense
              clearable
            />
          </div>
        </q-card-section>

        <!-- Botones -->
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Omitir" color="grey-7" to="/login" />
          <q-btn
            unelevated
            color="primary"
            label="Guardar y continuar"
            type="submit"
            :loading="loading"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup>
import axios from "axios";
import { ref, reactive, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const idusuario = route.query.idusuario;

const loading = ref(false);
const successMsg = ref("");
const errors = reactive({ general: "" });

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: { Accept: "application/json" },
});

// Formulario
const form = reactive({
  nombres: "",
  apellidos: "",
  correo: "",
  nombreusuario: "",
  telefono: "",
  especialidad: "",
  linkedin_url: "",
  github_url: "",
  web_url: "",
  bio: "",
});

const fotoUrl = ref(null);
const fe = reactive({ especialidad: "" });

// Iniciales si no hay foto
const iniciales = computed(() => {
  if (!form.nombres || !form.apellidos) return "U";
  return (
    form.nombres.charAt(0).toUpperCase() +
    form.apellidos.charAt(0).toUpperCase()
  );
});

// Validación
function touch(k) {
  if (k === "especialidad" && !form.especialidad) {
    fe.especialidad = "La especialidad es obligatoria.";
  } else {
    fe.especialidad = "";
  }
}

// Input file
const fileInput = ref(null);
function pickFile() {
  fileInput.value.click();
}

// 📂 Subir foto (público)
async function uploadFoto(e) {
  const file = e.target.files[0];
  if (!file) return;
  const fd = new FormData();
  fd.append("idusuario", idusuario);
  fd.append("foto", file);

  try {
    const { data } = await api.post("/register/profesor/foto", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    fotoUrl.value = data.user.foto_url;
  } catch (err) {
    console.error("❌ Error subiendo foto:", err.response?.data || err);
    errors.general = "No se pudo subir la foto.";
  }
}

// 📂 Cargar datos desde backend (público)
async function loadProfile() {
  try {
    const { data } = await api.get(`/register/profesor/show/${idusuario}`);
    Object.assign(form, data.user);
    fotoUrl.value = data.user.foto_url;
  } catch (err) {
    console.error(
      "❌ Error cargando perfil profesor:",
      err.response?.data || err
    );
    errors.general = "No se pudo cargar los datos del profesor.";
  }
}

// 📂 Guardar cambios (público)
async function onSubmit() {
  touch("especialidad");
  if (fe.especialidad) return;

  loading.value = true;
  try {
    await api.post("/register/profesor", {
      idusuario,
      especialidad: form.especialidad,
      bio: form.bio,
      linkedin_url: form.linkedin_url,
      github_url: form.github_url,
      web_url: form.web_url,
    });

    successMsg.value = "Perfil guardado correctamente.";
    setTimeout(() => router.replace({ name: "login" }), 1000);
  } catch (e) {
    console.error("❌ Error guardando perfil:", e.response || e);
    errors.general = e?.response?.data?.message || "No se pudo guardar.";
  } finally {
    loading.value = false;
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
