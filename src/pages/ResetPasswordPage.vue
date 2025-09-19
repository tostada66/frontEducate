<!-- src/pages/ResetPasswordPage.vue -->
<template>
  <q-page class="q-pa-md flex flex-center page-bg">
    <q-card class="q-pa-lg" style="max-width: 640px; width: 100%">
      <q-card-section>
        <div class="text-h5 text-weight-bold">Restablecer contraseña</div>
        <div class="text-grey-7">
          Completa los campos para cambiar tu contraseña.
        </div>
      </q-card-section>

      <!-- Banner éxito -->
      <q-card-section v-if="msg.success">
        <q-banner rounded class="bg-green-1 text-green-9">
          {{ msg.success }}
        </q-banner>
      </q-card-section>

      <!-- Banner error -->
      <q-card-section v-if="msg.error">
        <q-banner rounded class="bg-red-1 text-red-9">
          {{ msg.error }}
        </q-banner>
      </q-card-section>

      <q-form @submit.prevent="onSubmit" class="q-gutter-md">
        <q-card-section class="row q-col-gutter-md">
          <div class="col-12">
            <q-input
              v-model="form.email"
              label="Correo"
              dense
              outlined
              readonly
              :disable="true"
            />
          </div>

          <div class="col-12">
            <q-input
              v-model="form.current_password"
              :type="show.current ? 'text' : 'password'"
              label="Contraseña actual *"
              dense
              outlined
              :error="!!fe.current_password"
              :error-message="fe.current_password"
              autocomplete="current-password"
              @blur="touch('current_password')"
              @update:model-value="clearMsg"
            >
              <template #append>
                <q-icon
                  :name="show.current ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="show.current = !show.current"
                />
              </template>
            </q-input>
          </div>

          <div class="col-12">
            <q-input
              v-model="form.password"
              :type="show.new ? 'text' : 'password'"
              label="Nueva contraseña *"
              dense
              outlined
              :error="!!fe.password"
              :error-message="fe.password"
              autocomplete="new-password"
              @blur="touch('password')"
              @update:model-value="clearMsg"
            >
              <template #append>
                <q-icon
                  :name="show.new ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="show.new = !show.new"
                />
              </template>
            </q-input>
          </div>

          <div class="col-12">
            <q-input
              v-model="form.password_confirmation"
              :type="show.confirm ? 'text' : 'password'"
              label="Confirmar nueva contraseña *"
              dense
              outlined
              :error="!!fe.password_confirmation"
              :error-message="fe.password_confirmation"
              autocomplete="new-password"
              @blur="touch('password_confirmation')"
              @update:model-value="clearMsg"
            >
              <template #append>
                <q-icon
                  :name="show.confirm ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="show.confirm = !show.confirm"
                />
              </template>
            </q-input>
          </div>
        </q-card-section>

        <q-card-actions class="q-px-md q-pt-none items-center">
          <q-btn
            flat
            color="primary"
            label="Volver a iniciar sesión"
            :to="{ name: 'login' }"
          />
          <q-space />
          <q-btn
            unelevated
            color="primary"
            label="Cambiar contraseña"
            type="submit"
            :loading="loading"
            :disable="loading || !canSubmit"
          />
        </q-card-actions>
      </q-form>
    </q-card>
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

<style scoped>
.page-bg {
  background: #0f1324;
}
</style>
