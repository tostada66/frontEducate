<template>
  <q-page class="perfil-profesor-page flex flex-center q-pa-lg">
    <q-card class="perfil-card-profesor shadow-10 q-pa-lg">
      <!-- 🌈 ENCABEZADO -->
      <q-card-section class="text-center encabezado-profesor q-mb-md">
        <div
          class="text-h4 text-bold text-white flex flex-center items-center justify-center"
        >
          <q-icon name="school" class="q-mr-sm" size="36px" />
          {{
            modoAprobacion
              ? "Revisión del Profesor"
              : modoSoloVista
              ? "Perfil del Profesor"
              : "Mi Perfil - Profesor"
          }}
        </div>

        <div class="text-subtitle2 text-white">
          {{
            modoAprobacion
              ? "Aprueba o rechaza la solicitud del profesor"
              : modoSoloVista
              ? "Visualiza la información general del profesor"
              : "Información general y configuración de tu cuenta docente"
          }}
        </div>

        <q-badge
          v-if="modoSoloVista && !modoAprobacion"
          color="grey-8"
          class="q-mt-sm q-pa-sm text-uppercase"
          align="middle"
        >
          <q-icon name="visibility" size="18px" class="q-mr-xs" />
          Modo solo lectura
        </q-badge>
      </q-card-section>

      <q-separator color="white" />

      <!-- 📸 FOTO Y DATOS -->
      <q-card-section class="row items-center q-col-gutter-md q-mt-md">
        <div class="col-auto text-center">
          <q-avatar size="130px" class="avatar-brillante-prof">
            <img v-if="fotoPreview" :src="fotoPreview" alt="avatar" />
            <template v-else>{{ iniciales }}</template>
          </q-avatar>

          <q-btn
            v-if="editMode && !modoSoloVista && !modoAprobacion"
            class="q-mt-sm full-width boton-glow"
            label="Cambiar foto"
            color="deep-purple-5"
            glossy
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

        <!-- Datos -->
        <div class="col">
          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-input
                v-model="form.nombres"
                label="Nombres"
                outlined
                dense
                :disable="trueOrDisabled"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="form.apellidos"
                label="Apellidos"
                outlined
                dense
                :disable="trueOrDisabled"
              />
            </div>
          </div>

          <div class="row q-col-gutter-sm q-mt-sm">
            <div class="col-6">
              <q-input
                v-model="form.nombreusuario"
                label="Usuario"
                outlined
                dense
                :disable="trueOrDisabled"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="form.correo"
                label="Correo"
                type="email"
                outlined
                dense
                :disable="trueOrDisabled"
              />
            </div>
          </div>

          <div class="row q-col-gutter-sm q-mt-sm">
            <div class="col-6">
              <q-input
                v-model="form.telefono"
                label="Teléfono"
                outlined
                dense
                :disable="trueOrDisabled"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="form.especialidad"
                label="Especialidad"
                outlined
                dense
                :disable="trueOrDisabled"
              />
            </div>
          </div>
        </div>
      </q-card-section>

      <q-separator color="white" />

      <!-- 🌐 ENLACES -->
      <q-card-section>
        <div class="text-subtitle2 text-white q-mb-sm">Perfiles y enlaces</div>
        <div class="row q-col-gutter-md">
          <div class="col-4">
            <q-input
              v-model="form.linkedin_url"
              label="LinkedIn"
              outlined
              dense
              :disable="trueOrDisabled"
            />
          </div>
          <div class="col-4">
            <q-input
              v-model="form.github_url"
              label="GitHub"
              outlined
              dense
              :disable="trueOrDisabled"
            />
          </div>
          <div class="col-4">
            <q-input
              v-model="form.web_url"
              label="Sitio Web"
              outlined
              dense
              :disable="trueOrDisabled"
            />
          </div>
        </div>

        <q-input
          v-model="form.bio"
          label="Biografía"
          type="textarea"
          outlined
          dense
          autogrow
          class="q-mt-sm"
          :disable="trueOrDisabled"
        />
      </q-card-section>

      <q-separator color="white" />

      <!-- 💼 EXPERIENCIA -->
      <q-card-section>
        <div class="text-subtitle2 text-white q-mb-sm">Experiencia laboral</div>
        <div class="row q-col-gutter-md">
          <div class="col-6">
            <q-input
              v-model="form.empresa"
              label="Empresa"
              outlined
              dense
              :disable="trueOrDisabled"
            />
          </div>
          <div class="col-6">
            <q-input
              v-model="form.cargo"
              label="Cargo"
              outlined
              dense
              :disable="trueOrDisabled"
            />
          </div>
        </div>

        <div class="row q-col-gutter-md q-mt-sm">
          <div class="col-6">
            <q-input
              v-model="form.fecha_inicio"
              type="date"
              label="Inicio"
              outlined
              dense
              :disable="trueOrDisabled"
            />
          </div>
          <div class="col-6">
            <q-input
              v-model="form.fecha_fin"
              type="date"
              label="Fin"
              outlined
              dense
              :disable="trueOrDisabled"
            />
          </div>
        </div>

        <q-input
          v-model="form.detalles"
          label="Detalles"
          type="textarea"
          outlined
          dense
          autogrow
          class="q-mt-sm"
          :disable="trueOrDisabled"
        />
      </q-card-section>

      <q-separator color="white" />

      <!-- ⚙️ BOTONES -->
      <q-card-actions align="right" class="q-mt-sm">
        <!-- 👨‍🏫 Profesor -->
        <template v-if="!modoSoloVista && !modoAprobacion">
          <q-btn
            v-if="!editMode"
            label="Editar perfil"
            class="boton-glow"
            color="deep-purple-6"
            glossy
            icon="edit"
            @click="editMode = true"
          />
          <q-btn
            v-if="editMode"
            label="Guardar cambios"
            class="boton-glow"
            color="green-6"
            glossy
            icon="save"
            :loading="loading"
            @click="updateProfile"
          />
          <q-btn
            v-if="editMode"
            flat
            label="Cancelar"
            color="grey-4"
            @click="cancelEdit"
          />
        </template>

        <!-- 🧑‍⚖️ Admin modo aprobación -->
        <template v-if="modoAprobacion">
          <q-btn
            color="green-6"
            class="boton-glow"
            glossy
            label="Aprobar"
            icon="check"
            @click="cambiarEstado('aprobado')"
          />
          <q-btn
            color="red-6"
            class="boton-glow"
            glossy
            label="Rechazar"
            icon="close"
            @click="cambiarEstado('rechazado')"
          />
        </template>

        <q-btn
          flat
          label="Volver"
          color="grey-4"
          icon="arrow_back"
          @click="$router.back()"
        />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { api } from "boot/axios";
import { useQuasar } from "quasar";
import { useAuthStore } from "stores/auth";

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const auth = useAuthStore();

const modoSoloVista = ref(false);
const modoAprobacion = ref(false);
const form = ref({});
const fotoPreview = ref(null);
const editMode = ref(false);
const loading = ref(false);
const originalData = ref({});
const fileInput = ref(null);

// 🔎 Computed para deshabilitar campos
const trueOrDisabled = computed(
  () => !editMode.value || modoSoloVista.value || modoAprobacion.value
);

onMounted(() => {
  // ✅ Detección automática de modo según ruta y rol
  if (auth.isAdmin) {
    modoSoloVista.value = true;
  }
  if (route.name?.includes("admin") || route.query.vista === "solo") {
    modoSoloVista.value = true;
  }
  if (route.name === "admin-profesor-detalle") {
    modoAprobacion.value = true;
  }
  loadProfile();
});

const iniciales = computed(() => {
  if (!form.value.nombres || !form.value.apellidos) return "P";
  return (
    form.value.nombres.charAt(0).toUpperCase() +
    form.value.apellidos.charAt(0).toUpperCase()
  );
});

async function loadProfile() {
  try {
    const id = route.params.idprofesor || route.params.idusuario;
    let resp;

    if (modoAprobacion.value || modoSoloVista.value) {
      resp = await api.get(`/admin/profesores/${id}`);
    } else {
      resp = await api.get("/me/profile/profesor");
    }

    const u = resp.data.user ?? resp.data;
    form.value = { ...u };
    fotoPreview.value = u.foto_url;
    originalData.value = { ...u };
  } catch (err) {
    console.error("❌ Error cargando perfil:", err);
    $q.notify({ type: "negative", message: "Error al cargar perfil" });
  }
}

function pickFile() {
  fileInput.value.click();
}

function onFileSelected(e) {
  const file = e.target.files[0];
  if (!file) return;
  fotoPreview.value = URL.createObjectURL(file);
}

function cancelEdit() {
  editMode.value = false;
  form.value = { ...originalData.value };
  fotoPreview.value = originalData.value.foto_url;
}

async function updateProfile() {
  loading.value = true;
  try {
    await api.patch("/me/profile/profesor", form.value);
    $q.notify({ type: "positive", message: "Perfil actualizado con éxito" });
    editMode.value = false;
    loadProfile();
  } catch (err) {
    console.error(err);
    $q.notify({ type: "negative", message: "Error al actualizar" });
  } finally {
    loading.value = false;
  }
}

async function cambiarEstado(estado) {
  try {
    const id = route.params.idprofesor || route.params.idusuario;
    await api.post(`/admin/profesores/${id}/estado`, { estado });
    $q.notify({
      type: estado === "aprobado" ? "positive" : "warning",
      message: `Profesor ${estado}`,
    });
    router.push({ name: "admin-solicitudes" });
  } catch {
    $q.notify({ type: "negative", message: "Error al cambiar estado" });
  }
}
</script>

<style scoped>
/* 🌌 Fondo general */
.perfil-profesor-page {
  position: relative;
  background: radial-gradient(circle at 25% 25%, #1a0033, #0d001a 90%);
  min-height: 100vh;
  font-family: "Poppins", "Segoe UI", sans-serif;
  overflow: hidden;
}

/* 🌈 Degradado suave de fondo animado */
.perfil-profesor-page::before,
.perfil-profesor-page::after {
  content: "";
  position: absolute;
  border-radius: 50%;
  filter: blur(160px);
  opacity: 0.3;
  animation: auroraFlow 22s ease-in-out infinite alternate;
}
.perfil-profesor-page::before {
  width: 600px;
  height: 600px;
  top: 10%;
  left: 10%;
  background: radial-gradient(
    circle,
    rgba(255, 200, 255, 0.9),
    transparent 70%
  );
}
.perfil-profesor-page::after {
  width: 700px;
  height: 700px;
  bottom: 15%;
  right: 10%;
  background: radial-gradient(
    circle,
    rgba(190, 120, 255, 0.8),
    transparent 70%
  );
}
@keyframes auroraFlow {
  0% {
    transform: translateY(0px);
  }
  100% {
    transform: translateY(30px);
  }
}

/* 🎴 Tarjeta principal */
.perfil-card-profesor {
  background: linear-gradient(145deg, #6c1aff, #9c27b0, #c653ff);
  border-radius: 22px;
  width: 100%;
  max-width: 1000px;
  color: white;
  box-shadow: 0 0 50px rgba(200, 100, 255, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(18px) saturate(150%);
}

/* 🌟 Encabezado */
.encabezado-profesor {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.25);
  text-shadow: 0 0 20px #ffffff;
  padding: 1.3rem;
}
.encabezado-profesor .text-h4 {
  font-size: 2.3rem;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: 0.8px;
}
.encabezado-profesor .text-subtitle2 {
  font-size: 1.1rem;
  font-weight: 600;
  opacity: 1;
  color: #ffffff;
}

/* 🧊 Avatar */
.avatar-brillante-prof {
  background: radial-gradient(circle, #ffffff, #ece2ff);
  color: #5e17eb;
  border: 3px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 60px #ffffff;
  font-size: 46px;
  font-weight: 900;
  transition: transform 0.3s ease;
}
.avatar-brillante-prof:hover {
  transform: scale(1.05);
  box-shadow: 0 0 80px #ffffff;
}

/* 📘 Subtítulos */
.text-subtitle2 {
  font-size: 1.4rem;
  font-weight: 900;
  letter-spacing: 0.6px;
  color: #fff;
  text-shadow: 0 0 15px rgba(255, 255, 255, 0.7);
}

/* ✨ Inputs */
:deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.18);
  border-radius: 12px !important;
  color: #ffffff !important;
  font-size: 1.2rem !important;
  font-weight: 800 !important;
  box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.15);
  transition: all 0.25s ease;
}
:deep(.q-field__control:hover) {
  background: rgba(255, 255, 255, 0.22);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.35),
    inset 0 0 10px rgba(255, 255, 255, 0.2);
}

/* 🔹 Foco */
:deep(.q-field--focused .q-field__control) {
  background: rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 25px rgba(255, 255, 255, 0.5),
    inset 0 0 10px rgba(255, 255, 255, 0.25);
  animation: pulseGlow 1.5s ease-in-out infinite alternate;
}
@keyframes pulseGlow {
  0% {
    box-shadow: 0 0 25px rgba(255, 255, 255, 0.4);
  }
  100% {
    box-shadow: 0 0 40px rgba(255, 255, 255, 0.6);
  }
}

/* 🔹 Etiquetas */
:deep(.q-field__label) {
  color: #ffffff !important;
  font-weight: 900;
  font-size: 1.05rem;
  letter-spacing: 0.5px;
}

/* 🔹 Texto interno */
:deep(input),
:deep(textarea) {
  color: #ffffff !important;
  font-weight: 900 !important;
  font-size: 1.25rem !important;
}

/* ✨ Botones */
:deep(.q-btn) {
  font-weight: 800 !important;
  letter-spacing: 0.4px;
  color: #fff !important;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.7);
}
.q-separator {
  opacity: 0.25;
}
</style>
