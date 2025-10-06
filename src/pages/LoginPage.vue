<template>
  <q-page class="login-page">
    <!-- Fondo animado con burbujas -->
    <div class="bubble-bg">
      <div class="bubble bubble-1"></div>
      <div class="bubble bubble-2"></div>
      <div class="bubble bubble-3"></div>
      <div class="bubble bubble-4"></div>
    </div>

    <!-- Ondas -->
    <div class="wave-bg">
      <div class="wave"></div>
    </div>

    <!-- Contenedor principal -->
    <div class="login-container">
      <!-- Header -->
      <div class="login-header">
        <div class="logo">🔐</div>
        <h1 class="login-title">Iniciar sesión</h1>
        <p class="login-subtitle">Accede con tu correo</p>
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
      <q-form @submit.prevent="onSubmit" class="login-form">
        <!-- Email -->
        <div class="form-group">
          <div class="input-wrapper">
            <q-input
              v-model.trim="form.login"
              name="username"
              class="custom-input"
              :error="!!fe.login"
              :error-message="fe.login"
              outlined
              autocomplete="username"
              @focus="loginFocused = true"
              @blur="loginFocused = false"
              @update:model-value="onTyping"
            />
            <label
              class="floating-label"
              :class="{ active: form.login || loginFocused }"
            >
              Correo electrónico
            </label>
          </div>
        </div>

        <!-- Password -->
        <div class="password-group">
          <div class="password-container">
            <div class="input-wrapper">
              <q-input
                v-model="form.password"
                name="current-password"
                :type="showPass ? 'text' : 'password'"
                class="custom-input"
                :error="!!fe.password"
                :error-message="fe.password"
                outlined
                autocomplete="current-password"
                @focus="passwordFocused = true"
                @blur="passwordFocused = false"
                @update:model-value="onTyping"
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
                Contraseña
              </label>
            </div>
          </div>
          <div class="forgot-password">
            <a href="#" @click.prevent="openReset">¿Olvidaste tu contraseña?</a>
          </div>
        </div>

        <!-- Botón submit -->
        <q-btn
          unelevated
          class="submit-button"
          label="ENTRAR"
          type="submit"
          :loading="loading"
          :disable="loading || !canSubmit"
          no-caps
        />

        <!-- Footer -->
        <div class="form-footer">
          <p class="register-link">
            ¿No tienes cuenta?
            <a href="#" @click.prevent="$router.push({ name: 'register' })"
              >Regístrate aquí</a
            >
          </p>
        </div>
      </q-form>
    </div>

    <!-- Modal reset -->
    <q-dialog v-model="showReset" persistent>
      <div class="reset-modal-overlay">
        <div class="modal-bubble-bg">
          <div class="modal-bubble modal-bubble-1"></div>
          <div class="modal-bubble modal-bubble-2"></div>
          <div class="modal-bubble modal-bubble-3"></div>
        </div>

        <div class="reset-modal-container">
          <div class="reset-modal-header">
            <div class="reset-logo">🔓</div>
            <h2 class="reset-modal-title">Recuperar contraseña</h2>
            <p class="reset-modal-subtitle">
              Ingresa tu correo para continuar al cambio de contraseña.
            </p>
          </div>

          <!-- Banner éxito -->
          <div v-if="reset.successMsg" class="reset-banner-success">
            {{ reset.successMsg }}
          </div>

          <!-- Banner error -->
          <div v-if="reset.errors.general" class="reset-banner-error">
            {{ reset.errors.general }}
          </div>

          <!-- Form -->
          <div class="reset-form-section">
            <div class="reset-form-group">
              <div class="reset-input-wrapper">
                <q-input
                  v-model.trim="reset.email"
                  type="email"
                  class="reset-custom-input"
                  :error="!!reset.fe.email"
                  :error-message="reset.fe.email"
                  outlined
                  autocomplete="email"
                  @focus="resetEmailFocused = true"
                  @blur="resetEmailFocused = false"
                  @update:model-value="resetTyping"
                />
                <label
                  class="reset-floating-label"
                  :class="{ active: reset.email || resetEmailFocused }"
                >
                  Ingrese su Correo *
                </label>
              </div>
            </div>

            <!-- Botones -->
            <div class="reset-button-group">
              <q-btn
                flat
                label="CANCELAR"
                :disable="reset.loading"
                v-close-popup
                class="reset-cancel-button"
                no-caps
              />
              <q-btn
                unelevated
                label="CONTINUAR"
                :loading="reset.loading"
                :disable="reset.loading || !canSubmitReset"
                @click="submitReset"
                class="reset-continue-button"
                no-caps
              />
            </div>
          </div>
        </div>
      </div>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { api } from "boot/axios";
import { useAuthStore } from "src/stores/auth";

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const loading = ref(false);
const showPass = ref(false);
const successMsg = ref("");

// Focus para labels flotantes
const loginFocused = ref(false);
const passwordFocused = ref(false);
const resetEmailFocused = ref(false);

const form = reactive({ login: "", password: "" });
const fe = reactive({ login: "", password: "" });
const errors = reactive({ general: "" });

// Regex para email
const emailish = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// =======================
// Validaciones
// =======================
function validateField(k) {
  switch (k) {
    case "login":
      fe.login = !form.login
        ? "Obligatorio."
        : !emailish.test(form.login) || !form.login.endsWith(".com")
        ? "Ingresa un correo válido (debe terminar en .com)."
        : "";
      break;
    case "password":
      fe.password = !form.password ? "Obligatorio." : "";
      break;
  }
}

function onTyping() {
  errors.general = "";
}

watch(
  () => ({ login: form.login, password: form.password }),
  () => {
    validateField("login");
    validateField("password");
  }
);

const canSubmit = computed(() => {
  if (!form.login || !form.password) return false;
  if (!emailish.test(form.login) || !form.login.endsWith(".com")) return false;
  return true;
});

// =======================
// Login
// =======================
async function onSubmit() {
  validateField("login");
  validateField("password");

  if (fe.login || fe.password) {
    errors.general = "Revisa los campos marcados.";
    successMsg.value = "";
    return;
  }

  loading.value = true;
  errors.general = "";
  successMsg.value = "";

  try {
    const { data } = await api.post("/login", {
      login: form.login.trim(),
      password: form.password,
    });

    auth.setSession({
      token: data?.token,
      user: data?.user,
      needs_role: data?.needs_role,
    });

    successMsg.value = "Inicio de sesión correcto.";
    const next = typeof route.query.next === "string" ? route.query.next : null;
    router.replace(next || { name: "index" });
  } catch (e) {
    errors.general = "Credenciales inválidas o error en el servidor.";
    successMsg.value = "";
  } finally {
    loading.value = false;
  }
}

// =======================
// Reset contraseña
// =======================
const showReset = ref(false);
const reset = reactive({
  email: "",
  fe: { email: "" },
  errors: { general: "" },
  successMsg: "",
  loading: false,
});

// 👉 Aquí está la corrección
function openReset() {
  if (form.login && emailish.test(form.login)) {
    reset.email = form.login.trim();
  } else {
    reset.email = "";
  }

  reset.fe.email = "";
  reset.errors.general = "";
  reset.successMsg = "";
  reset.loading = false;
  showReset.value = true;
}

function resetTyping() {
  reset.errors.general = "";
}

const canSubmitReset = computed(() => {
  return !!reset.email && emailish.test(reset.email) && !reset.loading;
});

function submitReset() {
  if (!reset.email || !emailish.test(reset.email)) {
    reset.fe.email = "Correo inválido.";
    return;
  }
  showReset.value = false;
  router.push({
    name: "password-reset-email",
    query: { email: reset.email.trim() },
  });
}
</script>

<style lang="scss" scoped>
// ======================
// Variables de colores
// ======================
$primary: #b83a2d;
$accent: #ff6b6b;
$secondary: #ecf0f1;
$neutral: #7f8c8d;
$bg-dark: #111836;
$bg-card: #19193b;
$warning: #f39c12;

// ======================
// Correcciones globales
// ======================

// Color de mensajes de error
:deep(.q-field__messages) {
  color: #ff4d6d !important; /* rosado fuerte */
  font-weight: 600;
}

// Fix para quitar fondo blanco en autocompletar
:deep(input:-webkit-autofill),
:deep(input:-webkit-autofill:hover),
:deep(input:-webkit-autofill:focus),
:deep(input:-webkit-autofill:active) {
  -webkit-box-shadow: 0 0 0px 1000px $bg-card inset !important;
  -webkit-text-fill-color: $secondary !important;
  transition: background-color 5000s ease-in-out 0s !important;
}

// ======================
// Página
// ======================
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $bg-dark;
  position: relative;
  overflow: hidden;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

// ======================
// Fondo animado
// ======================
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

// ======================
// Ondas
// ======================
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

// ======================
// Contenedor principal
// ======================
.login-container {
  background: rgba(25, 25, 59, 0.25);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2.5rem;
  width: 100%;
  max-width: 400px;
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

// ======================
// Header
// ======================
.login-header {
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

.login-title {
  color: $secondary;
  font-size: 1.8rem;
  font-weight: 300;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, $secondary, $accent);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-subtitle {
  color: $neutral;
  font-size: 0.95rem;
}

// ======================
// Banners
// ======================
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

// ======================
// Formulario
// ======================
.login-form {
  width: 100%;
}

.form-group {
  margin-bottom: 1.5rem;
  position: relative;
}

.password-group {
  margin-bottom: 1.5rem;
}

.input-wrapper {
  position: relative;
}

// Inputs personalizados
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
  }
}

// Label flotante
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

// ======================
// Password
// ======================
.password-container {
  position: relative;
}

:deep(.password-toggle-btn) {
  color: $neutral !important;

  &:hover {
    color: $accent !important;
    background: rgba(255, 107, 107, 0.1) !important;
  }
}

// ✅ Link "Olvidaste tu contraseña"
.forgot-password {
  text-align: right;
  margin-top: 0.5rem;

  a {
    color: $accent;
    text-decoration: none;
    font-size: 0.9rem;
    transition: all 0.3s ease;

    &:hover {
      color: $primary;
      text-decoration: underline;
    }
  }
}

// ======================
// Botón submit
// ======================
:deep(.submit-button) {
  width: 100%;
  padding: 1rem !important;
  background: linear-gradient(135deg, $primary, $accent) !important;
  border: none !important;
  border-radius: 12px !important;
  color: white !important;
  font-size: 1rem !important;
  font-weight: 600 !important;
  margin: 1rem 0 !important;
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

// ======================
// Footer
// ======================
.form-footer {
  text-align: center;
  margin-top: 2rem;
}

.register-link {
  color: $neutral;
  font-size: 0.95rem;

  a {
    color: $accent;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.3s ease;

    &:hover {
      color: $primary;
      text-decoration: underline;
    }
  }
}

// ======================
// Responsive
// ======================
@media (max-width: 480px) {
  .login-container {
    margin: 1rem;
    padding: 2rem 1.5rem;
  }

  .login-title {
    font-size: 1.6rem;
  }

  .form-footer {
    margin-top: 1.5rem;
  }
}
</style>

<style lang="scss" scoped>
// Variables de colores
$primary: #b83a2d;
$accent: #ff6b6b;
$secondary: #ecf0f1;
$neutral: #7f8c8d;
$bg-dark: #111836;
$bg-card: #19193b;
$warning: #f39c12;

.login-page {
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
.login-container {
  background: rgba(25, 25, 59, 0.25);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2.5rem;
  width: 100%;
  max-width: 400px;
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
.login-header {
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

.login-title {
  color: $secondary;
  font-size: 1.8rem;
  font-weight: 300;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, $secondary, $accent);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-subtitle {
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
.login-form {
  width: 100%;
}

.form-group {
  margin-bottom: 1.5rem;
  position: relative;
}

.password-group {
  margin-bottom: 1.5rem;
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

// Password container
.password-container {
  position: relative;
}

:deep(.password-toggle-btn) {
  color: $neutral !important;

  &:hover {
    color: $accent !important;
    background: rgba(255, 107, 107, 0.1) !important;
  }
}

.forgot-password {
  text-align: right;
  margin-top: 0.5rem;

  a {
    color: $accent;
    text-decoration: none;
    font-size: 0.9rem;
    transition: all 0.3s ease;

    &:hover {
      color: $primary;
      text-decoration: underline;
    }
  }
}

// Botón submit
:deep(.submit-button) {
  width: 100%;
  padding: 1rem !important;
  background: linear-gradient(135deg, $primary, $accent) !important;
  border: none !important;
  border-radius: 12px !important;
  color: white !important;
  font-size: 1rem !important;
  font-weight: 600 !important;
  margin: 1rem 0 !important;
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

// Footer
.form-footer {
  text-align: center;
  margin-top: 2rem;
}

.register-link {
  color: $neutral;
  font-size: 0.95rem;

  a {
    color: $accent;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.3s ease;

    &:hover {
      color: $primary;
      text-decoration: underline;
    }
  }
}

// Modal Reset Password
.reset-modal-overlay {
  position: relative;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  max-height: 90vh;
  overflow: hidden;
}

.modal-bubble-bg {
  position: absolute;
  top: -20px;
  left: -20px;
  right: -20px;
  bottom: -20px;
  pointer-events: none;
  z-index: 1;
}

.modal-bubble {
  position: absolute;
  border-radius: 50%;
  opacity: 0.05;
  animation: bubbleFloat 15s infinite ease-in-out;

  &.modal-bubble-1 {
    width: 60px;
    height: 60px;
    background: radial-gradient(circle, $accent, $primary);
    left: 20%;
    animation-delay: 0s;
  }

  &.modal-bubble-2 {
    width: 40px;
    height: 40px;
    background: radial-gradient(circle, $warning, $accent);
    right: 20%;
    animation-delay: 5s;
  }

  &.modal-bubble-3 {
    width: 80px;
    height: 80px;
    background: radial-gradient(circle, $primary, $bg-card);
    left: 60%;
    animation-delay: 10s;
  }
}

.reset-modal-container {
  background: rgba(25, 25, 59, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 25px 45px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 2;
  max-height: 85vh;
  overflow: hidden;

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
    border-radius: 16px 16px 0 0;
  }
}

.reset-modal-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.reset-logo {
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
}

.reset-modal-title {
  color: $secondary;
  font-size: 1.6rem;
  font-weight: 300;
  margin-bottom: 0.8rem;
  background: linear-gradient(135deg, $secondary, $accent);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.reset-modal-subtitle {
  color: $neutral;
  font-size: 0.9rem;
  line-height: 1.4;
}

// Reset form
.reset-form-section {
  margin-top: 1rem;
}

.reset-form-group {
  margin-bottom: 1.5rem;
  position: relative;
}

.reset-input-wrapper {
  position: relative;
}

:deep(.reset-custom-input) {
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

.reset-floating-label {
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

.reset-banner-success,
.reset-banner-error {
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.reset-banner-success {
  background: rgba(76, 175, 80, 0.15);
  border: 1px solid rgba(76, 175, 80, 0.3);
  color: #4caf50;
}

.reset-banner-error {
  background: rgba(244, 67, 54, 0.15);
  border: 1px solid rgba(244, 67, 54, 0.3);
  color: #f44336;
}

// Reset buttons
.reset-button-group {
  display: flex;
  gap: 1rem;
}

:deep(.reset-cancel-button) {
  flex: 1;
  padding: 1rem !important;
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  border-radius: 12px !important;
  color: $secondary !important;
  font-size: 1rem !important;
  font-weight: 600 !important;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15) !important;
    border-color: $neutral !important;
    transform: translateY(-1px) !important;
  }
}

:deep(.reset-continue-button) {
  flex: 1;
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
  .login-container {
    margin: 1rem;
    padding: 2rem 1.5rem;
  }

  .login-title {
    font-size: 1.6rem;
  }

  .form-footer {
    margin-top: 1.5rem;
  }

  .reset-modal-container {
    margin: 1rem;
    padding: 2rem 1.5rem;
  }

  .reset-modal-title {
    font-size: 1.4rem;
  }

  .reset-button-group {
    flex-direction: column;
  }
}
</style>
