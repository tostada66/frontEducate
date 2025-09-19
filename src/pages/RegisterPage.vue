<template>
  <q-page class="q-pa-md flex flex-center">
    <q-card class="q-pa-lg" style="max-width: 720px; width: 100%">
      <q-card-section>
        <div class="text-h5 text-weight-bold">Crear cuenta</div>
        <div class="text-grey-7">Regístrate para empezar a aprender</div>
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
        <q-card-section class="row q-col-gutter-md">
          <!-- Nombres -->
          <div class="col-12 col-sm-6">
            <q-input
              v-model.trim="form.nombres"
              label="Nombres *"
              :error="!!fe.nombres"
              :error-message="fe.nombres"
              dense
              outlined
              clearable
              @blur="touch('nombres')"
            />
          </div>

          <!-- Apellidos -->
          <div class="col-12 col-sm-6">
            <q-input
              v-model.trim="form.apellidos"
              label="Apellidos *"
              :error="!!fe.apellidos"
              :error-message="fe.apellidos"
              dense
              outlined
              clearable
              @blur="touch('apellidos')"
            />
          </div>

          <!-- Correo -->
          <div class="col-12">
            <q-input
              v-model.trim="form.correo"
              label="Correo *"
              type="email"
              :error="!!fe.correo"
              :error-message="fe.correo"
              dense
              outlined
              clearable
              @update:model-value="normalizeEmail"
              @blur="touch('correo')"
            />
          </div>

          <!-- Nombre usuario -->
          <div class="col-12">
            <q-input
              v-model.trim="form.nombreusuario"
              label="Nombre de usuario *"
              hint="3–20: letras, números, punto o guión bajo"
              :error="!!fe.nombreusuario"
              :error-message="fe.nombreusuario"
              dense
              outlined
              clearable
              @update:model-value="sanitizeUsername"
              @blur="touch('nombreusuario')"
            />
          </div>

          <!-- Teléfono -->
          <div class="col-12">
            <q-input
              v-model.trim="form.telefono"
              label="Teléfono * (ej: +59170000001)"
              :error="!!fe.telefono"
              :error-message="fe.telefono"
              dense
              outlined
              clearable
              @blur="touch('telefono')"
            />
          </div>

          <!-- Password -->
          <div class="col-12 col-sm-6">
            <q-input
              v-model="form.password"
              :type="showPass ? 'text' : 'password'"
              label="Contraseña *"
              :error="!!fe.password"
              :error-message="fe.password"
              dense
              outlined
              @blur="touch('password')"
            >
              <template #append>
                <q-icon
                  :name="showPass ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showPass = !showPass"
                />
              </template>
            </q-input>
          </div>

          <!-- Confirmar Password -->
          <div class="col-12 col-sm-6">
            <q-input
              v-model="form.password_confirmation"
              :type="showConfirm ? 'text' : 'password'"
              label="Confirmar contraseña *"
              :error="!!fe.password_confirmation"
              :error-message="fe.password_confirmation"
              dense
              outlined
              @blur="touch('password_confirmation')"
            >
              <template #append>
                <q-icon
                  :name="showConfirm ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showConfirm = !showConfirm"
                />
              </template>
            </q-input>
          </div>

          <!-- Rol -->
          <div class="col-12">
            <q-input
              v-model="roleLabel"
              label="Rol *"
              dense
              outlined
              readonly
              :error="!!fe.idrol"
              :error-message="fe.idrol"
              @click="showRoleDialog = true"
            >
              <template #append>
                <q-icon name="arrow_drop_down" class="cursor-pointer" />
              </template>
            </q-input>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Volver" color="grey-7" to="/" />
          <q-btn
            unelevated
            color="primary"
            label="Crear cuenta"
            type="submit"
            :loading="loading"
            :disable="loading || !canSubmit"
          />
        </q-card-actions>
      </q-form>
    </q-card>

    <!-- Modal: Seleccionar Rol -->
    <q-dialog v-model="showRoleDialog">
      <q-card style="max-width: 600px; width: 100%">
        <q-card-section>
          <div class="text-h6 text-center">Elige tu rol</div>
        </q-card-section>

        <q-card-section class="row q-col-gutter-md">
          <div class="col-12 col-sm-6">
            <q-card
              class="cursor-pointer q-hoverable"
              @click="selectRole(1, 'Estudiante')"
            >
              <q-card-section>
                <div class="text-h6">Estudiante</div>
                <div class="text-caption text-grey-7">
                  Explora cursos, aprende nuevas habilidades y obtén
                  certificados.
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-sm-6">
            <q-card
              class="cursor-pointer q-hoverable"
              @click="selectRole(2, 'Profesor')"
            >
              <q-card-section>
                <div class="text-h6">Profesor</div>
                <div class="text-caption text-grey-7">
                  Crea cursos, comparte contenidos y evalúa estudiantes.
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import axios from "axios";
import { ref, reactive, computed, watch } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: { Accept: "application/json", "Content-Type": "application/json" },
});

const loading = ref(false);
const showPass = ref(false);
const showConfirm = ref(false);
const successMsg = ref("");

const showRoleDialog = ref(false);
const roleLabel = ref("");

// 👉 Formulario
const form = reactive({
  idrol: null,
  nombres: "",
  apellidos: "",
  correo: "",
  nombreusuario: "",
  telefono: "",
  password: "",
  password_confirmation: "",
});

// 👉 Errores
const fe = reactive({
  idrol: "",
  nombres: "",
  apellidos: "",
  correo: "",
  nombreusuario: "",
  telefono: "",
  password: "",
  password_confirmation: "",
});
const errors = reactive({ general: "" });

// Regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const usernameRegex = /^[a-zA-Z0-9._]{3,20}$/;
const phoneRegex = /^\+?\d{7,15}$/;

// --- Validaciones rápidas ---
function touch(k) {
  validateField(k, true);
}
function validateField(k, touched = false) {
  switch (k) {
    case "idrol":
      fe.idrol = !form.idrol ? "Elige un rol." : "";
      break;
    case "nombres":
      fe.nombres = !form.nombres
        ? "Obligatorio."
        : form.nombres.length < 2
        ? "Mínimo 2 caracteres."
        : "";
      break;
    case "apellidos":
      fe.apellidos = !form.apellidos
        ? "Obligatorio."
        : form.apellidos.length < 2
        ? "Mínimo 2 caracteres."
        : "";
      break;
    case "correo":
      fe.correo = !form.correo
        ? "Obligatorio."
        : !emailRegex.test(form.correo)
        ? "Correo inválido."
        : "";
      break;
    case "nombreusuario":
      fe.nombreusuario = !form.nombreusuario
        ? "Obligatorio."
        : !usernameRegex.test(form.nombreusuario)
        ? "3–20: letras, números, punto o _ ."
        : "";
      break;
    case "telefono":
      fe.telefono = !form.telefono
        ? "Obligatorio."
        : !phoneRegex.test(form.telefono)
        ? "Teléfono inválido."
        : "";
      break;
    case "password":
      fe.password = !form.password
        ? "Obligatorio."
        : form.password.length < 8
        ? "Mínimo 8 caracteres."
        : "";
      if (touched) validateField("password_confirmation");
      break;
    case "password_confirmation":
      fe.password_confirmation = !form.password_confirmation
        ? "Confirma tu contraseña."
        : form.password_confirmation !== form.password
        ? "No coincide."
        : "";
      break;
  }
}
watch(
  () => ({ ...form }),
  () => {
    Object.keys(fe).forEach((k) => validateField(k));
  }
);

const canSubmit = computed(() => {
  return (
    form.idrol &&
    form.nombres &&
    form.apellidos &&
    form.correo &&
    form.nombreusuario &&
    form.telefono &&
    form.password &&
    form.password_confirmation &&
    emailRegex.test(form.correo) &&
    usernameRegex.test(form.nombreusuario) &&
    phoneRegex.test(form.telefono) &&
    form.password.length >= 8 &&
    form.password === form.password_confirmation
  );
});

function normalizeEmail() {
  form.correo = (form.correo || "").toLowerCase().trim();
}
function sanitizeUsername() {
  form.nombreusuario = (form.nombreusuario || "")
    .replace(/\s+/g, "")
    .replace(/[^a-zA-Z0-9._]/g, "")
    .slice(0, 20);
}

function selectRole(id, label) {
  form.idrol = id;
  roleLabel.value = label;
  fe.idrol = "";
  showRoleDialog.value = false;
}

// --- Submit ---
async function onSubmit() {
  Object.keys(fe).forEach((k) => validateField(k, true));
  const hasErrors = Object.values(fe).some(Boolean);
  if (hasErrors || !canSubmit.value) {
    errors.general = "Revisa los campos marcados.";
    return;
  }

  loading.value = true;
  errors.general = "";
  successMsg.value = "";
  try {
    const { data } = await api.post("/register", { ...form });

    if (form.idrol === 1) {
      // estudiante → onboarding nivel académico
      router.replace({
        name: "onb-nivel",
        query: { idusuario: data.user.idusuario },
      });
    } else if (form.idrol === 2) {
      // profesor → redirigir a perfil de profesor
      router.replace({
        name: "register-profesor-profile",
        query: { idusuario: data.user.idusuario },
      });
    } else {
      router.replace({ name: "index" });
    }

    successMsg.value = "Usuario registrado correctamente.";
  } catch (e) {
    console.error("❌ Error en registro:", e.response || e);
    if (e?.response?.status === 422) {
      const errs = e.response.data?.errors || {};
      Object.assign(fe, {
        idrol: errs.idrol?.[0] || "",
        nombres: errs.nombres?.[0] || "",
        apellidos: errs.apellidos?.[0] || "",
        correo: errs.correo?.[0] || "",
        nombreusuario: errs.nombreusuario?.[0] || "",
        telefono: errs.telefono?.[0] || "",
        password: errs.password?.[0] || "",
        password_confirmation: errs.password_confirmation?.[0] || "",
      });
      errors.general = e.response.data?.message || "Datos inválidos.";
    } else {
      errors.general = e?.response?.data?.message || "No se pudo registrar.";
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.q-page {
  background: #0f1324;
}
</style>
