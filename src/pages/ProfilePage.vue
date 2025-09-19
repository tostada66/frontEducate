<template>
  <q-page class="q-pa-md flex flex-center">
    <q-card class="q-pa-lg" style="max-width: 800px; width: 100%">
      <!-- Header -->
      <q-card-section>
        <div class="text-h6 text-center text-primary">Completa tu perfil</div>
        <div class="text-subtitle2 text-grey-7 text-center">
          Agrega tus últimos datos para terminar el registro
        </div>
      </q-card-section>

      <q-separator />

      <!-- Foto -->
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
            label="Subir foto"
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

        <!-- Datos básicos (solo vista) -->
        <div class="col">
          <q-input
            v-model="form.nombreusuario"
            label="Usuario"
            outlined
            dense
            disable
          />
          <q-input
            v-model="form.telefono"
            label="Teléfono"
            outlined
            dense
            disable
          />
          <q-input
            v-model="form.nivelacademico"
            label="Nivel Académico"
            outlined
            dense
            disable
          />
        </div>
      </q-card-section>

      <q-separator />

      <!-- Categorías (solo vista, en chips) -->
      <q-card-section>
        <div class="text-subtitle2 q-mb-sm">Intereses / Categorías</div>
        <div class="q-pa-sm bg-grey-2 rounded-borders">
          <q-chip
            v-for="cat in categoriasSeleccionadas"
            :key="cat"
            color="primary"
            text-color="white"
            class="q-mr-sm q-mb-sm"
          >
            {{ cat }}
          </q-chip>
          <div v-if="categoriasSeleccionadas.length === 0" class="text-grey">
            No seleccionaste categorías
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <!-- Datos extendidos (editables) -->
      <q-card-section>
        <q-input v-model="form.linkedin_url" label="LinkedIn" outlined dense />
        <q-input v-model="form.github_url" label="GitHub" outlined dense />
        <q-input v-model="form.web_url" label="Sitio Web" outlined dense />
        <q-input
          v-model="form.bio"
          label="Biografía"
          type="textarea"
          outlined
          dense
        />
      </q-card-section>

      <!-- Guardar -->
      <q-card-actions align="right">
        <q-btn
          label="Finalizar registro"
          color="primary"
          :loading="loading"
          @click="saveProfile"
        />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { api } from "boot/axios";

const route = useRoute();
const router = useRouter();
const idusuario = route.query.idusuario;

const form = ref({
  idusuario,
  nombreusuario: "",
  telefono: "",
  nivelacademico: "",
  linkedin_url: "",
  github_url: "",
  web_url: "",
  bio: "",
});

const fotoUrl = ref(null);
const categoriasSeleccionadas = ref([]);
const loading = ref(false);

// Iniciales cuando no hay foto
const iniciales = computed(() => {
  if (!form.value.nombreusuario) return "U";
  return form.value.nombreusuario.charAt(0).toUpperCase();
});

// File input
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
    const { data } = await api.post("/register/estudiante/foto", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    fotoUrl.value = data.user.foto_url;
  } catch (err) {
    console.error("❌ Error subiendo foto:", err.response?.data || err);
  }
}

// 📂 Guardar perfil extendido (solo links y bio)
async function saveProfile() {
  loading.value = true;
  try {
    const payload = {
      idusuario: form.value.idusuario,
      linkedin_url: form.value.linkedin_url,
      github_url: form.value.github_url,
      web_url: form.value.web_url,
      bio: form.value.bio,
    };

    console.log("➡️ Enviando perfil final:", payload);

    await api.post("/register/estudiante/profile", payload);
    router.replace({ name: "login" });
  } catch (err) {
    console.error("❌ Error guardando perfil:", err.response?.data || err);
  } finally {
    loading.value = false;
  }
}

// 📂 Cargar perfil de pasos anteriores
async function loadProfile() {
  try {
    const { data } = await api.get(`/register/estudiante/show/${idusuario}`);
    const u = data.user;

    form.value = {
      idusuario,
      nombreusuario: u.nombreusuario || "",
      telefono: u.telefono || "",
      nivelacademico: u.nivelacademico || "",
      linkedin_url: u.linkedin_url || "",
      github_url: u.github_url || "",
      web_url: u.web_url || "",
      bio: u.bio || "",
    };

    categoriasSeleccionadas.value = u.categorias.map((c) => c.nombre);
    fotoUrl.value = u.foto_url;
  } catch (err) {
    console.error("❌ Error cargando perfil:", err.response?.data || err);
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
