<template>
  <q-page class="register-page">
    <!-- Fondo animado con burbujas -->
    <div class="bubble-bg">
      <div class="bubble bubble-1"></div>
      <div class="bubble bubble-2"></div>
      <div class="bubble bubble-3"></div>
      <div class="bubble bubble-4"></div>
    </div>

    <!-- Ondas de fondo -->
    <div class="wave-bg">
      <div class="wave"></div>
    </div>

    <!-- Contenedor principal -->
    <div class="register-container">
      <!-- Header -->
      <div class="register-header">
        <div class="logo">👤</div>
        <h1 class="register-title">Crear cuenta</h1>
        <p class="register-subtitle">Regístrate para empezar a aprender</p>
      </div>

      <!-- Banner éxito -->
      <div v-if="successMsg" class="banner-success">
        {{ successMsg }}
      </div>

      <!-- Banner error -->
      <div v-if="errors.general" class="banner-error">
        {{ errors.general }}
      </div>

      <!-- Formulario -->
      <q-form @submit.prevent="onSubmit" class="register-form">
        <!-- Fila 1: Nombres y Apellidos -->
        <div class="form-row">
          <div class="form-group">
            <div class="input-wrapper">
              <q-input
                v-model.trim="form.nombres"
                class="custom-input"
                :error="!!fe.nombres"
                :error-message="fe.nombres"
                outlined
                @focus="nombresFocused = true"
                @blur="
                  nombresFocused = false;
                  touch('nombres');
                "
              />
              <label
                class="floating-label"
                :class="{ active: form.nombres || nombresFocused }"
              >
                Nombres *
              </label>
            </div>
          </div>

          <div class="form-group">
            <div class="input-wrapper">
              <q-input
                v-model.trim="form.apellidos"
                class="custom-input"
                :error="!!fe.apellidos"
                :error-message="fe.apellidos"
                outlined
                @focus="apellidosFocused = true"
                @blur="
                  apellidosFocused = false;
                  touch('apellidos');
                "
              />
              <label
                class="floating-label"
                :class="{ active: form.apellidos || apellidosFocused }"
              >
                Apellidos *
              </label>
            </div>
          </div>
        </div>

        <!-- Campo Correo -->
        <div class="form-group">
          <div class="input-wrapper">
            <q-input
              v-model.trim="form.correo"
              type="email"
              class="custom-input"
              :error="!!fe.correo"
              :error-message="fe.correo"
              outlined
              @focus="correoFocused = true"
              @blur="
                correoFocused = false;
                touch('correo');
              "
              @update:model-value="normalizeEmail"
            />
            <label
              class="floating-label"
              :class="{ active: form.correo || correoFocused }"
            >
              Correo *
            </label>
          </div>
        </div>

        <!-- Campo Nombre de Usuario -->
        <div class="form-group">
          <div class="input-wrapper">
            <q-input
              v-model.trim="form.nombreusuario"
              class="custom-input"
              :error="!!fe.nombreusuario"
              :error-message="fe.nombreusuario"
              outlined
              @focus="nombreusuarioFocused = true"
              @blur="
                nombreusuarioFocused = false;
                touch('nombreusuario');
              "
              @update:model-value="sanitizeUsername"
            />
            <label
              class="floating-label"
              :class="{ active: form.nombreusuario || nombreusuarioFocused }"
            >
              Nombre de usuario *
            </label>
            <div class="field-hint">
              3–20: letras, números, punto o guión bajo
            </div>
          </div>
        </div>

        <!-- Campo Teléfono -->
        <div class="form-group">
          <div class="input-wrapper">
            <q-input
              v-model.trim="form.telefono"
              class="custom-input"
              :error="!!fe.telefono"
              :error-message="fe.telefono"
              outlined
              @focus="telefonoFocused = true"
              @blur="
                telefonoFocused = false;
                touch('telefono');
              "
            />
            <label
              class="floating-label"
              :class="{ active: form.telefono || telefonoFocused }"
            >
              Teléfono * (ej: +59170000001)
            </label>
          </div>
        </div>

        <!-- Fila 2: Contraseñas -->
        <div class="form-row">
          <div class="form-group">
            <div class="input-wrapper">
              <q-input
                v-model="form.password"
                :type="showPass ? 'text' : 'password'"
                class="custom-input"
                :error="!!fe.password"
                :error-message="fe.password"
                outlined
                @focus="passwordFocused = true"
                @blur="
                  passwordFocused = false;
                  touch('password');
                "
              >
                <template #append>
                  <q-btn
                    flat
                    dense
                    round
                    :icon="showPass ? 'visibility_off' : 'visibility'"
                    @click="showPass = !showPass"
                    class="password-toggle-btn"
                  />
                </template>
              </q-input>
              <label
                class="floating-label"
                :class="{ active: form.password || passwordFocused }"
              >
                Contraseña *
              </label>
            </div>
          </div>

          <div class="form-group">
            <div class="input-wrapper">
              <q-input
                v-model="form.password_confirmation"
                :type="showConfirm ? 'text' : 'password'"
                class="custom-input"
                :error="!!fe.password_confirmation"
                :error-message="fe.password_confirmation"
                outlined
                @focus="passwordConfirmFocused = true"
                @blur="
                  passwordConfirmFocused = false;
                  touch('password_confirmation');
                "
              >
                <template #append>
                  <q-btn
                    flat
                    dense
                    round
                    :icon="showConfirm ? 'visibility_off' : 'visibility'"
                    @click="showConfirm = !showConfirm"
                    class="password-toggle-btn"
                  />
                </template>
              </q-input>
              <label
                class="floating-label"
                :class="{
                  active: form.password_confirmation || passwordConfirmFocused,
                }"
              >
                Confirmar contraseña *
              </label>
            </div>
          </div>
        </div>

        <!-- Campo Rol -->
        <div class="form-group">
          <div class="input-wrapper">
            <q-input
              v-model="roleLabel"
              class="custom-input clickable-input"
              :error="!!fe.idrol"
              :error-message="fe.idrol"
              outlined
              readonly
              @click="showRoleDialog = true"
            >
              <template #append>
                <q-btn
                  flat
                  dense
                  round
                  icon="arrow_drop_down"
                  @click="showRoleDialog = true"
                  class="dropdown-btn"
                />
              </template>
            </q-input>
            <label class="floating-label" :class="{ active: roleLabel }">
              Rol *
            </label>
          </div>
        </div>

        <!-- Botones -->
        <div class="button-group">
          <q-btn
            flat
            label="VOLVER"
            :to="{ name: 'login' }"
            class="back-button"
            no-caps
          />

          <q-btn
            unelevated
            label="CREAR CUENTA"
            type="submit"
            :loading="loading"
            :disable="loading || !canSubmit"
            class="submit-button"
            no-caps
          />
        </div>
      </q-form>
    </div>

    <!-- Modal: Seleccionar Rol -->
    <q-dialog v-model="showRoleDialog">
      <div class="role-modal-overlay">
        <div class="role-modal-container">
          <!-- Header del Modal -->
          <div class="role-modal-header">
            <h2 class="role-modal-title">Elige tu rol</h2>
          </div>

          <!-- Opciones de Rol -->
          <div class="role-options">
            <div class="role-card" @click="selectRole(1, 'Estudiante')">
              <div class="role-icon">🎓</div>
              <h3 class="role-name">Estudiante</h3>
              <p class="role-description">
                Explora cursos, aprende nuevas habilidades y obtén certificados.
              </p>
            </div>

            <div class="role-card" @click="selectRole(2, 'Profesor')">
              <div class="role-icon">👨‍🏫</div>
              <h3 class="role-name">Profesor</h3>
              <p class="role-description">
                Crea cursos, comparte contenidos y evalúa estudiantes.
              </p>
            </div>
          </div>

          <!-- Botón Cancelar -->
          <div class="role-modal-actions">
            <q-btn
              flat
              label="CANCELAR"
              v-close-popup
              class="cancel-button"
              no-caps
            />
          </div>
        </div>
      </div>
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

// 👇 SOLO AGREGUÉ ESTAS VARIABLES PARA LOS LABELS FLOTANTES
const nombresFocused = ref(false);
const apellidosFocused = ref(false);
const correoFocused = ref(false);
const nombreusuarioFocused = ref(false);
const telefonoFocused = ref(false);
const passwordFocused = ref(false);
const passwordConfirmFocused = ref(false);
const rolFocused = ref(false);

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
<style lang="scss" scoped>
// Variables de colores
$primary: #b83a2d;
$accent: #ff6b6b;
$secondary: #ecf0f1;
$neutral: #7f8c8d;
$bg-dark: #111836;
$bg-card: #19193b;
$warning: #f39c12;

.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $bg-dark;
  position: relative;
  overflow-x: hidden;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  padding: 1.2rem 0; // un poco menos
}

/* ---------- Fondo animado ---------- */

.bubble-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

.bubble {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
  animation: bubbleFloat 20s infinite ease-in-out;

  &.bubble-1 {
    width: 120px;
    height: 120px;
    background: radial-gradient(circle, $accent, $primary);
    left: 10%;
    animation-delay: 0s;
  }

  &.bubble-2 {
    width: 80px;
    height: 80px;
    background: radial-gradient(circle, $warning, $accent);
    left: 80%;
    animation-delay: 5s;
  }

  &.bubble-3 {
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, $primary, $bg-card);
    left: 60%;
    animation-delay: 10s;
  }

  &.bubble-4 {
    width: 60px;
    height: 60px;
    background: radial-gradient(circle, $accent, transparent);
    left: 30%;
    animation-delay: 15s;
  }
}

@keyframes bubbleFloat {
  0%,
  100% {
    transform: translateY(100vh) scale(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.1;
    transform: scale(1);
  }
  90% {
    opacity: 0.1;
  }
  100% {
    transform: translateY(-20vh) scale(1.2) rotate(360deg);
    opacity: 0;
  }
}

/* Ondas de fondo */

.wave-bg {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 200px;
  background: linear-gradient(180deg, transparent, rgba(255, 107, 107, 0.05));
  z-index: 1;
  pointer-events: none;
}

.wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 200%;
  height: 100px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(184, 58, 45, 0.1),
    transparent,
    rgba(255, 107, 107, 0.1),
    transparent
  );
  animation: wave 15s ease-in-out infinite;
}

@keyframes wave {
  0%,
  100% {
    transform: translateX(-50%) rotate(0deg);
  }
  50% {
    transform: translateX(-50%) rotate(180deg);
  }
}

/* ---------- Contenedor principal ---------- */

.register-container {
  background: rgba(25, 25, 59, 0.25);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 1.7rem 2rem;
  width: 100%;
  max-width: 540px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 25px 45px rgba(0, 0, 0, 0.2);
  animation: fadeInUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  z-index: 2;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 107, 107, 0.5),
      transparent
    );
    border-radius: 20px 20px 0 0;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translate3d(0, 40px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

/* ---------- Header ---------- */

.register-header {
  text-align: center;
  margin-bottom: 0.6rem; // espacio hacia los inputs
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem; // separación mínima entre logo, título y subtítulo
}

.logo {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, $primary, $accent);
  border-radius: 50%;
  margin: 0; // sin margen extra
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: white;
  animation: logoSpin 2s ease-in-out infinite;
  cursor: pointer;

  &:hover {
    animation: logoSpin 0.5s ease-in-out;
  }
}

@keyframes logoSpin {
  0%,
  100% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(1.1);
  }
}

.register-title {
  color: $secondary;
  font-size: 1.7rem;
  font-weight: 500;
  margin: 0; // pegado al logo/subtítulo
  line-height: 1.1;
  background: linear-gradient(135deg, $secondary, $accent);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.register-subtitle {
  color: $neutral;
  font-size: 1rem;
  margin: 0;
  margin-top: 0.1rem; // un pelín de espacio bajo el título
  line-height: 1.2;
}

/* ---------- Banners ---------- */

.banner-success,
.banner-error {
  padding: 0.7rem;
  border-radius: 10px;
  margin-bottom: 0.65rem;
  font-size: 0.9rem;
}

.banner-success {
  background: rgba(76, 175, 80, 0.15);
  border: 1px solid rgba(76, 175, 80, 0.3);
  color: #4caf50;
}

.banner-error {
  background: rgba(244, 67, 54, 0.15);
  border: 1px solid rgba(244, 67, 54, 0.3);
  color: #f44336;
}

/* ---------- Formulario ---------- */

.register-form {
  width: 100%;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.4rem; // antes 0.5rem
  margin-bottom: 0.35rem; // antes 0.6rem
}

/* Wrapper de cada input */
.form-group {
  margin-bottom: 0.4rem; // antes 0.65rem
  position: relative;
}

.input-wrapper {
  position: relative;
}

/* Inputs compactos con letra más grande */

:deep(.custom-input) {
  .q-field__control {
    background: rgba(255, 255, 255, 0.08) !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    border-radius: 12px !important;
    backdrop-filter: blur(10px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:before,
    &:after {
      display: none !important;
    }
  }

  .q-field__native {
    color: $secondary !important;
    padding: 0.75rem 1rem 0.45rem !important; // altura más baja
    font-size: 1rem;
    background: transparent !important;
  }

  .q-field__control-container {
    background: transparent !important;
  }

  input {
    background: transparent !important;
  }

  &.q-field--focused {
    .q-field__control {
      border-color: $accent !important;
      background: rgba(255, 255, 255, 0.12) !important;
      box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.15) !important;
      transform: translateY(-1px);
    }
  }
}

/* Input clickeable (rol) */

:deep(.clickable-input) {
  .q-field__control {
    cursor: pointer !important;
  }
}

/* Label flotante */

.floating-label {
  position: absolute;
  top: 0.3rem;
  left: 1rem;
  color: $accent;
  font-size: 0.75rem;
  font-weight: 600;
  transition: all 0.3s ease;
  pointer-events: none;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  user-select: none;
  z-index: 1;
  opacity: 0.9;

  &.active {
    color: $accent;
    opacity: 1;
  }
}

.field-hint {
  color: $neutral;
  font-size: 0.8rem;
  margin-top: 0.05rem; // antes 0.15rem
  margin-left: 1rem;
  opacity: 0.8;
}

/* Toggle password / dropdown */

:deep(.password-toggle-btn),
:deep(.dropdown-btn) {
  color: $neutral !important;

  &:hover {
    color: $accent !important;
    background: rgba(255, 107, 107, 0.1) !important;
  }
}

/* ---------- Botones ---------- */

.button-group {
  display: flex;
  gap: 0.7rem;
  margin-top: 0.9rem; // menos espacio encima de los botones
}

:deep(.back-button) {
  flex: 1;
  padding: 0.8rem !important;
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  border-radius: 12px !important;
  color: $accent !important;
  font-size: 0.95rem !important;
  font-weight: 500 !important;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1) !important;
    border-color: $accent !important;
    color: $primary !important;
    transform: translateY(-1px) !important;
  }
}

:deep(.submit-button) {
  flex: 2;
  padding: 0.9rem !important;
  background: linear-gradient(135deg, $primary, $accent) !important;
  border: none !important;
  border-radius: 12px !important;
  color: white !important;
  font-size: 1rem !important;
  font-weight: 600 !important;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    transition: left 0.6s ease;
  }

  &:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 15px 35px rgba(184, 58, 45, 0.4) !important;

    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(0) !important;
  }
}

/* ---------- Modal de rol ---------- */

.role-modal-overlay {
  position: relative;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.role-modal-container {
  background: rgba(25, 25, 59, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 25px 45px rgba(0, 0, 0, 0.3);
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 107, 107, 0.5),
      transparent
    );
    border-radius: 20px 20px 0 0;
  }
}

.role-modal-header {
  text-align: center;
  margin-bottom: 1.6rem;
}

.role-modal-title {
  color: $secondary;
  font-size: 1.3rem;
  font-weight: 300;
  background: linear-gradient(135deg, $secondary, $accent);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.role-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.6rem;
}

.role-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 1.4rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: $accent;
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(255, 107, 107, 0.2);
  }
}

.role-icon {
  font-size: 2rem;
  margin-bottom: 0.4rem;
}

.role-name {
  color: $secondary;
  font-size: 1.05rem;
  font-weight: 600;
  margin-bottom: 0.4rem;
}

.role-description {
  color: $neutral;
  font-size: 0.83rem;
  line-height: 1.4;
  margin: 0;
}

.role-modal-actions {
  text-align: center;
}

:deep(.cancel-button) {
  padding: 0.7rem 2rem !important;
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  border-radius: 12px !important;
  color: $secondary !important;
  font-size: 0.9rem !important;
  font-weight: 500 !important;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15) !important;
    border-color: $neutral !important;
    transform: translateY(-1px) !important;
  }
}

/* ---------- Responsive ---------- */

@media (max-width: 768px) {
  .register-container {
    margin: 0.6rem;
    padding: 1.6rem 1.3rem;
    max-width: 480px;
  }

  .register-title {
    font-size: 1.55rem;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 0.35rem;
  }

  .button-group {
    flex-direction: column;
    gap: 0.6rem;
  }

  .role-options {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .role-modal-container {
    margin: 0.75rem;
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .register-page {
    padding: 0.6rem 0;
  }

  .register-container {
    margin: 0.4rem;
    padding: 1.3rem 0.9rem;
  }

  .form-group {
    margin-bottom: 0.75rem;
  }

  .button-group {
    margin-top: 1rem;
  }
}
</style>
