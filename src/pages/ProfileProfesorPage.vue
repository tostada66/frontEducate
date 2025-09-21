<template>
  <q-page class="q-pa-md flex flex-center">
    <q-card class="q-pa-lg" style="max-width: 1000px; width: 100%">
      <!-- Header -->
      <q-card-section>
        <div class="text-h5 text-weight-bold text-primary">
          Completa tu perfil docente
        </div>
        <div class="text-grey-7">
          Esta información aparecerá en tus cursos y ayudará a los estudiantes a
          conocerte mejor
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
      <q-form @submit.prevent="onSubmit" class="q-gutter-md" ref="formRef">
        <!-- Datos básicos -->
        <q-card-section class="row q-col-gutter-md items-start">
          <!-- 📷 Foto -->
          <div class="col-12 col-md-3 text-center">
            <q-avatar size="120px" color="primary" text-color="white">
              <template v-if="fotoUrl">
                <img :src="fotoUrl" alt="avatar" />
              </template>
              <template v-else>
                {{ iniciales }}
              </template>
            </q-avatar>

            <q-btn
              class="q-mt-md full-width"
              label="Seleccionar foto"
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
            <div class="text-caption text-grey-6 q-mt-sm">
              JPG, PNG máx. 2MB
            </div>
          </div>

          <!-- 📋 Campos -->
          <div class="col-12 col-md-9 row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <q-input
                v-model.trim="form.nombres"
                label="Nombre completo *"
                outlined
                dense
                disable
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-input
                v-model.trim="form.especialidad"
                label="Título profesional *"
                outlined
                dense
                :rules="[
                  (val) => !!val || 'El título profesional es obligatorio',
                ]"
              />
            </div>

            <div class="col-12">
              <q-input
                v-model.trim="form.bio"
                label="Descripción profesional *"
                type="textarea"
                outlined
                dense
                autogrow
                :rules="[
                  (val) => !!val || 'La descripción es obligatoria',
                  (val) => val.length >= 20 || 'Mínimo 20 caracteres',
                ]"
              />
            </div>

            <div class="col-12 col-sm-6">
              <q-input
                v-model.trim="form.direccion"
                label="Dirección"
                outlined
                dense
                :rules="[
                  (val) =>
                    !val || val.length >= 5 || 'La dirección es muy corta',
                ]"
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-input
                v-model.trim="form.pais"
                label="País *"
                outlined
                dense
                :rules="[(val) => !!val || 'Debes ingresar el país']"
              />
            </div>
          </div>
        </q-card-section>

        <!-- 🌐 Redes y portafolio -->
        <q-separator spaced />
        <q-card-section>
          <div class="text-subtitle1 text-primary q-mb-md">
            Redes y portafolio
          </div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-4">
              <q-input
                v-model.trim="form.linkedin_url"
                label="LinkedIn"
                outlined
                dense
                clearable
                :rules="[
                  (val) =>
                    !val || val.startsWith('http') || 'Debe ser una URL válida',
                ]"
              />
            </div>
            <div class="col-12 col-sm-4">
              <q-input
                v-model.trim="form.github_url"
                label="GitHub"
                outlined
                dense
                clearable
                :rules="[
                  (val) =>
                    !val || val.startsWith('http') || 'Debe ser una URL válida',
                ]"
              />
            </div>
            <div class="col-12 col-sm-4">
              <q-input
                v-model.trim="form.web_url"
                label="Sitio web"
                outlined
                dense
                clearable
                :rules="[
                  (val) =>
                    !val || val.startsWith('http') || 'Debe ser una URL válida',
                ]"
              />
            </div>
          </div>
        </q-card-section>

        <!-- 🏢 Experiencia laboral -->
        <q-separator spaced />
        <q-card-section>
          <div class="text-subtitle1 text-primary q-mb-md">
            Experiencia laboral
          </div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <q-input
                v-model.trim="form.empresa"
                label="Empresa"
                outlined
                dense
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model.trim="form.cargo" label="Cargo" outlined dense />
            </div>
            <div class="col-12 col-sm-6">
              <q-input
                v-model="form.fecha_inicio"
                type="date"
                label="Fecha inicio"
                outlined
                dense
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-input
                v-model="form.fecha_fin"
                type="date"
                label="Fecha fin"
                outlined
                dense
              />
            </div>
            <div class="col-12">
              <q-input
                v-model.trim="form.detalles"
                label="Detalles de la experiencia"
                type="textarea"
                outlined
                dense
                autogrow
              />
            </div>
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
const formRef = ref(null);

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: { Accept: "application/json" },
});

// Formulario
const form = reactive({
  nombres: "",
  apellidos: "",
  correo: "",
  especialidad: "",
  bio: "",
  direccion: "",
  pais: "",
  empresa: "",
  cargo: "",
  fecha_inicio: "",
  fecha_fin: "",
  detalles: "",
  linkedin_url: "",
  github_url: "",
  web_url: "",
});

const fotoUrl = ref(null);

// Iniciales si no hay foto
const iniciales = computed(() => {
  if (!form.nombres || !form.apellidos) return "U";
  return (
    form.nombres.charAt(0).toUpperCase() +
    form.apellidos.charAt(0).toUpperCase()
  );
});

// Input file
const fileInput = ref(null);
function pickFile() {
  fileInput.value.click();
}

// 📂 Subir foto
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

// 📂 Cargar datos desde backend
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

// 📂 Guardar cambios
async function onSubmit() {
  const valid = await formRef.value.validate();
  if (!valid) {
    errors.general = "Por favor completa los campos obligatorios.";
    return;
  }

  loading.value = true;
  try {
    await api.post("/register/profesor", {
      idusuario,
      ...form,
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
