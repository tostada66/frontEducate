<!-- src/pages/ResetPasswordPage.vue -->
<template>
  <q-page class="reset-password-page">
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
    <div class="reset-container">
      <!-- Header -->
      <div class="reset-header">
        <div class="logo">🔑</div>
        <h1 class="reset-title">Restablecer contraseña</h1>
        <p class="reset-subtitle">
          Completa los campos para cambiar tu contraseña.
        </p>
      </div>

      <!-- Banner éxito -->
      <div v-if="msg.success" class="banner-success">
        {{ msg.success }}
      </div>

      <!-- Banner error -->
      <div v-if="msg.error" class="banner-error">
        {{ msg.error }}
      </div>

      <!-- Formulario -->
      <q-form @submit.prevent="onSubmit" class="reset-form">
        <!-- Campo Email (readonly) -->
        <div class="form-group">
          <div class="input-wrapper">
            <q-input
              v-model="form.email"
              class="custom-input readonly-input"
              outlined
              readonly
              :disable="true"
            />
            <label class="floating-label active"> Correo </label>
          </div>
        </div>

        <!-- Campo Contraseña Actual -->
        <div class="form-group">
          <div class="input-wrapper">
            <q-input
              v-model="form.current_password"
              :type="show.current ? 'text' : 'password'"
              class="custom-input"
              :error="!!fe.current_password"
              :error-message="fe.current_password"
              outlined
              autocomplete="current-password"
              @focus="currentPasswordFocused = true"
              @blur="
                currentPasswordFocused = false;
                touch('current_password');
              "
              @update:model-value="clearMsg"
            >
              <template #append>
                <q-btn
                  flat
                  dense
                  round
                  :icon="show.current ? 'visibility_off' : 'visibility'"
                  @click="show.current = !show.current"
                  class="password-toggle-btn"
                />
              </template>
            </q-input>
            <label
              class="floating-label"
              :class="{
                active: form.current_password || currentPasswordFocused,
              }"
            >
              Contraseña actual *
            </label>
          </div>
        </div>

        <!-- Campo Nueva Contraseña -->
        <div class="form-group">
          <div class="input-wrapper">
            <q-input
              v-model="form.password"
              :type="show.new ? 'text' : 'password'"
              class="custom-input"
              :error="!!fe.password"
              :error-message="fe.password"
              outlined
              autocomplete="new-password"
              @focus="newPasswordFocused = true"
              @blur="
                newPasswordFocused = false;
                touch('password');
              "
              @update:model-value="clearMsg"
            >
              <template #append>
                <q-btn
                  flat
                  dense
                  round
                  :icon="show.new ? 'visibility_off' : 'visibility'"
                  @click="show.new = !show.new"
                  class="password-toggle-btn"
                />
              </template>
            </q-input>
            <label
              class="floating-label"
              :class="{ active: form.password || newPasswordFocused }"
            >
              Nueva contraseña *
            </label>
          </div>
        </div>

        <!-- Campo Confirmar Nueva Contraseña -->
        <div class="form-group">
          <div class="input-wrapper">
            <q-input
              v-model="form.password_confirmation"
              :type="show.confirm ? 'text' : 'password'"
              class="custom-input"
              :error="!!fe.password_confirmation"
              :error-message="fe.password_confirmation"
              outlined
              autocomplete="new-password"
              @focus="confirmPasswordFocused = true"
              @blur="
                confirmPasswordFocused = false;
                touch('password_confirmation');
              "
              @update:model-value="clearMsg"
            >
              <template #append>
                <q-btn
                  flat
                  dense
                  round
                  :icon="show.confirm ? 'visibility_off' : 'visibility'"
                  @click="show.confirm = !show.confirm"
                  class="password-toggle-btn"
                />
              </template>
            </q-input>
            <label
              class="floating-label"
              :class="{
                active: form.password_confirmation || confirmPasswordFocused,
              }"
            >
              Confirmar nueva contraseña *
            </label>
          </div>
        </div>

        <!-- Botones -->
        <div class="button-group">
          <q-btn
            flat
            label="VOLVER A INICIAR SESIÓN"
            :to="{ name: 'login' }"
            class="back-button"
            no-caps
          />

          <q-btn
            unelevated
            label="CAMBIAR CONTRASEÑA"
            type="submit"
            :loading="loading"
            :disable="loading || !canSubmit"
            class="submit-button"
            no-caps
          />
        </div>
      </q-form>
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { api } from "boot/axios";

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const msg = reactive({ error: "", success: "" });

// 👇 SOLO AGREGUÉ ESTAS VARIABLES PARA LOS LABELS FLOTANTES
const currentPasswordFocused = ref(false);
const newPasswordFocused = ref(false);
const confirmPasswordFocused = ref(false);

const form = reactive({
  email: (typeof route.query.email === "string"
    ? route.query.email
    : ""
  ).trim(),
  current_password: "",
  password: "",
  password_confirmation: "",
});

const show = reactive({ current: false, new: false, confirm: false });

const fe = reactive({
  current_password: "",
  password: "",
  password_confirmation: "",
});

const emailish = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function clearMsg() {
  msg.error = "";
  msg.success = "";
}

function touch(k) {
  validateField(k);
}

function validateField(k) {
  switch (k) {
    case "current_password":
      fe.current_password = !form.current_password
        ? "Obligatorio."
        : form.current_password.length < 4
        ? "La contraseña actual es muy corta."
        : "";
      break;
    case "password":
      fe.password = !form.password
        ? "Obligatorio."
        : form.password.length < 8
        ? "Mínimo 8 caracteres."
        : "";
      // Si cambia la nueva, revalida confirmación
      validateField("password_confirmation");
      break;
    case "password_confirmation":
      fe.password_confirmation = !form.password_confirmation
        ? "Obligatorio."
        : form.password_confirmation !== form.password
        ? "Las contraseñas no coinciden."
        : "";
      break;
  }
}

watch(
  () => ({
    current_password: form.current_password,
    password: form.password,
    password_confirmation: form.password_confirmation,
    email: form.email,
  }),
  () => {
    validateField("current_password");
    validateField("password");
    validateField("password_confirmation");
  }
);

const canSubmit = computed(() => {
  if (!emailish.test(form.email)) return false;
  if (!form.current_password || form.current_password.length < 4) return false;
  if (!form.password || form.password.length < 8) return false;
  if (form.password_confirmation !== form.password) return false;
  return true;
});

// ❗ Ajusta esta ruta a la que tengas en tu backend.
// Ejemplo propuesto: POST /password/reset/by-email
const API_PATH = "/password/reset/by-email";

async function onSubmit() {
  // Validación final
  validateField("current_password");
  validateField("password");
  validateField("password_confirmation");

  if (!canSubmit.value) {
    msg.error = "Revisa los campos marcados.";
    msg.success = "";
    return;
  }

  loading.value = true;
  msg.error = "";
  msg.success = "";

  try {
    const payload = {
      email: form.email.trim(),
      current_password: form.current_password,
      password: form.password,
      password_confirmation: form.password_confirmation,
    };

    await api.post(API_PATH, payload);

    // ✅ éxito + redirección al login
    msg.success =
      "Tu contraseña se cambió correctamente. Te redirigiremos al login…";
    setTimeout(() => {
      // Si quieres autocompletar el correo en el login:
      // router.replace({ name: "login", query: { email: form.email } });
      router.replace({ name: "login" });
    }, 1200);

    // ▶ Si la quieres inmediata, usa:
    // router.replace({ name: "login" });
  } catch (err) {
    const status = err?.response?.status;
    const data = err?.response?.data;

    if (status === 422) {
      msg.error = data?.message || "Datos inválidos.";
      fe.current_password =
        data?.errors?.current_password?.[0] || fe.current_password;
      fe.password = data?.errors?.password?.[0] || fe.password;
      fe.password_confirmation =
        data?.errors?.password_confirmation?.[0] || fe.password_confirmation;
    } else if (status === 401) {
      msg.error =
        data?.message ||
        "Credenciales incorrectas. Verifica tu contraseña actual.";
    } else if (status === 404) {
      msg.error = data?.message || "No encontramos un usuario con ese correo.";
    } else {
      msg.error =
        data?.message ||
        err?.message ||
        "No fue posible cambiar la contraseña.";
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

.reset-password-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $bg-dark;
  position: relative;
  overflow: hidden;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

// Fondo animado con burbujas
.bubble-bg {
  position: absolute;
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

// Ondas de fondo
.wave-bg {
  position: absolute;
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

// Contenedor principal
.reset-container {
  background: rgba(25, 25, 59, 0.25);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2.5rem;
  width: 100%;
  max-width: 500px;
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

// Header
.reset-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, $primary, $accent);
  border-radius: 50%;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
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

.reset-title {
  color: $secondary;
  font-size: 1.8rem;
  font-weight: 300;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, $secondary, $accent);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.reset-subtitle {
  color: $neutral;
  font-size: 0.95rem;
}

// Banners
.banner-success,
.banner-error {
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1rem;
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

// Formulario
.reset-form {
  width: 100%;
}

.form-group {
  margin-bottom: 1.5rem;
  position: relative;
}

.input-wrapper {
  position: relative;
}

// Input personalizado
:deep(.custom-input) {
  .q-field__control {
    background: rgba(255, 255, 255, 0.08) !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    border-radius: 12px !important;
    backdrop-filter: blur(10px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:before {
      display: none !important;
    }

    &:after {
      display: none !important;
    }
  }

  .q-field__native {
    color: $secondary !important;
    padding: 1.2rem 1rem 0.8rem !important;
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

    .q-field__native {
      background: transparent !important;
    }
  }
}

// Input readonly
:deep(.readonly-input) {
  .q-field__control {
    background: rgba(255, 255, 255, 0.05) !important;
    border: 1px solid rgba(255, 255, 255, 0.15) !important;
    opacity: 0.7;
  }

  .q-field__native {
    color: $neutral !important;
  }
}

// Label flotante personalizado
.floating-label {
  position: absolute;
  top: 0.5rem;
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

// Password toggle
:deep(.password-toggle-btn) {
  color: $neutral !important;

  &:hover {
    color: $accent !important;
    background: rgba(255, 107, 107, 0.1) !important;
  }
}

// Botones
.button-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
}

:deep(.back-button) {
  width: 100%;
  padding: 1rem !important;
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  border-radius: 12px !important;
  color: $accent !important;
  font-size: 0.9rem !important;
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
  width: 100%;
  padding: 1rem !important;
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

// Responsive
@media (max-width: 480px) {
  .reset-container {
    margin: 1rem;
    padding: 2rem 1.5rem;
    max-width: 400px;
  }

  .reset-title {
    font-size: 1.6rem;
  }

  .button-group {
    margin-top: 1.5rem;
  }
}
</style>
