<!-- src/pages/LoginPage.vue -->
<template>
  <q-page class="q-pa-md flex flex-center">
    <q-card class="q-pa-lg" style="max-width: 640px; width: 100%">
      <q-card-section>
        <div class="text-h5 text-weight-bold">Iniciar sesión</div>
        <div class="text-grey-7">Accede con tu correo</div>
      </q-card-section>

      <!-- Banner éxito -->
      <q-card-section v-if="successMsg">
        <q-banner rounded class="bg-green-1 text-green-9">
          {{ successMsg }}
        </q-banner>
      </q-card-section>

      <!-- Banner error general -->
      <q-card-section v-if="errors.general">
        <q-banner rounded class="bg-red-1 text-red-9">
          {{ errors.general }}
        </q-banner>
      </q-card-section>

      <q-form @submit.prevent="onSubmit" class="q-gutter-md">
        <q-card-section class="row q-col-gutter-md">
          <div class="col-12">
            <q-input
              v-model.trim="form.login"
              name="username"
              label="Ingrese con su correo"
              :error="!!fe.login"
              :error-message="fe.login"
              dense
              outlined
              clearable
              autocomplete="username"
              @blur="touch('login')"
              @update:model-value="onTyping"
            />
          </div>

          <div class="col-12">
            <q-input
              v-model="form.password"
              name="current-password"
              :type="showPass ? 'text' : 'password'"
              label="Contraseña *"
              :error="!!fe.password"
              :error-message="fe.password"
              dense
              outlined
              autocomplete="current-password"
              @blur="touch('password')"
              @update:model-value="onTyping"
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
        </q-card-section>

        <q-card-actions class="q-px-md q-pt-none items-center">
          <div class="text-grey-7">
            ¿No tienes cuenta?
            <q-btn
              flat
              color="primary"
              label="Regístrate"
              class="q-ml-xs"
              :to="{ name: 'register' }"
            />
          </div>

          <q-space />

          <q-btn
            flat
            color="primary"
            label="¿Olvidaste tu contraseña?"
            class="q-mr-sm"
            @click="openReset()"
          />

          <q-btn
            unelevated
            color="primary"
            label="Entrar"
            type="submit"
            :loading="loading"
            :disable="loading || !canSubmit"
          />
        </q-card-actions>
      </q-form>
    </q-card>

    <!-- Modal: Recuperar contraseña (redirige a la vista nueva con el email) -->
    <q-dialog v-model="showReset" persistent>
      <q-card style="min-width: 420px; max-width: 520px; width: 100%">
        <q-card-section>
          <div class="text-h6 text-weight-bold">Recuperar contraseña</div>
          <div class="text-grey-7">
            Ingresa tu correo para continuar al cambio de contraseña.
          </div>
        </q-card-section>

        <q-card-section v-if="reset.successMsg">
          <q-banner rounded class="bg-green-1 text-green-9">{{
            reset.successMsg
          }}</q-banner>
        </q-card-section>
        <q-card-section v-if="reset.errors.general">
          <q-banner rounded class="bg-red-1 text-red-9">{{
            reset.errors.general
          }}</q-banner>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model.trim="reset.email"
            label="Ingrese su Correo *"
            type="email"
            dense
            outlined
            :error="!!reset.fe.email"
            :error-message="reset.fe.email"
            autocomplete="email"
            @blur="validateResetField('email')"
            @update:model-value="resetTyping()"
            clearable
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" :disable="reset.loading" v-close-popup />
          <q-btn
            unelevated
            color="primary"
            label="Continuar"
            :loading="reset.loading"
            :disable="reset.loading || !canSubmitReset"
            @click="submitReset"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { api } from "boot/axios";
import { useAuthStore } from "src/stores/auth";

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const loading = ref(false);
const showPass = ref(false);
const successMsg = ref("");

const form = reactive({ login: "", password: "" });
const fe = reactive({ login: "", password: "" });
const errors = reactive({ general: "" });

// ======= Validaciones =======
const emailish = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const usernameish = /^[a-zA-Z0-9._-]{3,}$/;

function touch(k) {
  validateField(k);
}

function validateField(k) {
  switch (k) {
    case "login":
      fe.login = !form.login
        ? "Obligatorio."
        : !(emailish.test(form.login) || usernameish.test(form.login))
        ? "Ingresa un correo válido o un usuario (mín. 3)."
        : "";
      break;
    case "password":
      fe.password = !form.password
        ? "Obligatorio."
        : form.password.length < 4
        ? "Muy corta."
        : "";
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
  if (!(emailish.test(form.login) || usernameish.test(form.login)))
    return false;
  if (form.password.length < 4) return false;
  return true;
});

// Normaliza el error
function normalizeError(e) {
  const status = e?.status ?? e?.response?.status;
  const data = e?.data ?? e?.response?.data;
  const message =
    e?.message ??
    e?.response?.data?.message ??
    e?.message ??
    "No fue posible iniciar sesión.";
  return { status, data, message };
}

// ======= Submit Login =======
async function onSubmit() {
  validateField("login");
  validateField("password");
  const hasErrors = !!fe.login || !!fe.password;
  if (hasErrors || !canSubmit.value) {
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

    // 👇 Redirige a IndexPage (o a 'next' si venías de ruta protegida)
    const next = typeof route.query.next === "string" ? route.query.next : null;
    router.replace(next || { name: "index" });
  } catch (raw) {
    const e = normalizeError(raw);
    if (e.status === 422) {
      errors.general = e.data?.message || "Credenciales inválidas.";
      fe.login = e.data?.errors?.login?.[0] || fe.login;
      fe.password = e.data?.errors?.password?.[0] || fe.password;
    } else if (e.status === 401) {
      errors.general = e.data?.message || "Credenciales incorrectas.";
    } else if (e.status === 403) {
      errors.general = e.data?.message || "Usuario inactivo.";
    } else {
      errors.general = e.message || "No fue posible iniciar sesión.";
    }
    successMsg.value = "";
  } finally {
    loading.value = false;
  }
}

// ======= Recuperación de contraseña (redirige a la nueva vista) =======
const showReset = ref(false);
const reset = reactive({
  email: "",
  fe: { email: "" },
  errors: { general: "" },
  successMsg: "",
  loading: false,
});

function openReset() {
  // Prefill con lo que haya tecleado en login si es email válido
  reset.email = emailish.test(form.login) ? form.login.trim() : "";
  reset.fe.email = "";
  reset.errors.general = "";
  reset.successMsg = "";
  reset.loading = false;
  showReset.value = true;
}

function validateResetField(k) {
  if (k === "email") {
    reset.fe.email = !reset.email
      ? "Obligatorio."
      : !emailish.test(reset.email)
      ? "Ingresa un correo válido."
      : "";
  }
}

function resetTyping() {
  reset.errors.general = "";
}

const canSubmitReset = computed(
  () => !!reset.email && emailish.test(reset.email) && !reset.loading
);

// ✅ En lugar de llamar al backend, navegamos a la vista de cambio con el email
async function submitReset() {
  validateResetField("email");
  if (reset.fe.email) {
    reset.errors.general = "Revisa los campos marcados.";
    reset.successMsg = "";
    return;
  }

  showReset.value = false; // cerrar modal al navegar
  router.push({
    name: "password-reset-email",
    query: { email: reset.email.trim() },
  });
}

// (Opcional) si vienes de un redirect y te pasan ?email=..., prefílalo
onMounted(() => {
  if (
    typeof route.query.email === "string" &&
    emailish.test(route.query.email)
  ) {
    form.login = route.query.email.trim();
  }
});
</script>

<style scoped>
.q-page {
  background: #0f1324;
}
</style>
