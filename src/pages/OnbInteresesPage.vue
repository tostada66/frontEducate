<template>
  <q-page class="intereses-page flex flex-center q-pa-lg">
    <div class="animated-bg"></div>

    <q-card class="intereses-card q-pa-xl shadow-10">
      <!-- 🟣 Título -->
      <q-card-section class="text-center q-mb-lg">
        <div class="text-h4 text-bold titulo-luminoso">
          Personalicemos tu experiencia
        </div>
        <div class="text-subtitle2 text-grey-4">
          Cuéntanos qué te interesa para recomendarte el mejor contenido ✨
        </div>
      </q-card-section>

      <!-- 🧩 Opciones compactas (2 filas x 3 columnas) -->
      <q-card-section class="row q-col-gutter-lg justify-center">
        <div
          v-for="cat in categorias"
          :key="cat.idcategoria"
          class="col-6 col-sm-4 col-md-4"
        >
          <q-card
            class="categoria-card cursor-pointer text-center q-pa-md"
            :class="{ seleccionada: selected.includes(cat.idcategoria) }"
            @click="toggleCategoria(cat.idcategoria)"
          >
            <q-card-section>
              <div class="text-h6 text-bold q-mb-xs">{{ cat.nombre }}</div>
              <div class="text-caption text-grey-3">
                {{ cat.descripcion }}
              </div>
            </q-card-section>
          </q-card>
        </div>
      </q-card-section>

      <!-- 🧭 Botones -->
      <q-card-actions align="between" class="q-mt-lg">
        <q-btn
          flat
          label="Omitir por ahora"
          color="negative"
          class="text-bold boton-omitir"
          @click="irAlProfile"
        />
        <q-btn
          unelevated
          glossy
          label="Continuar"
          class="boton-continuar"
          :disable="selected.length === 0 || loading"
          :loading="loading"
          @click="guardarIntereses"
        />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { api } from "boot/axios";

const router = useRouter();
const route = useRoute();

const categorias = ref([]);
const selected = ref([]);
const loading = ref(false);

const idusuario = route.query.idusuario;

onMounted(async () => {
  try {
    const { data } = await api.get("/categorias");
    categorias.value = data;
  } catch (e) {
    console.error("❌ Error cargando categorías:", e.response?.data || e);
  }
});

function toggleCategoria(id) {
  selected.value = selected.value.includes(id)
    ? selected.value.filter((x) => x !== id)
    : [...selected.value, id];
}

async function guardarIntereses() {
  if (!idusuario || selected.value.length === 0) return;
  loading.value = true;
  try {
    const categoriasUnicas = [...new Set(selected.value)];
    await api.post("/register/estudiante/intereses", {
      idusuario,
      categorias: categoriasUnicas,
    });
    router.replace({ name: "profile", query: { idusuario } });
  } catch (e) {
    console.error("❌ Error guardando intereses:", e.response?.data || e);
  } finally {
    loading.value = false;
  }
}

function irAlProfile() {
  router.replace({ name: "profile", query: { idusuario } });
}
</script>

<style scoped>
/* 🌌 Fondo general con gradiente suave y luces animadas */
.intereses-page {
  background: radial-gradient(circle at 20% 20%, #1a0033, #080018 80%);
  min-height: 100vh;
  color: white;
  font-family: "Poppins", sans-serif;
  position: relative;
  overflow: hidden;
}

.animated-bg::before,
.animated-bg::after {
  content: "";
  position: absolute;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.4;
  animation: float 18s ease-in-out infinite alternate;
}
.animated-bg::before {
  top: 10%;
  left: 10%;
  background: radial-gradient(circle, rgba(170, 70, 255, 0.8), transparent 70%);
}
.animated-bg::after {
  bottom: 10%;
  right: 10%;
  background: radial-gradient(circle, rgba(60, 0, 255, 0.6), transparent 70%);
}
@keyframes float {
  0% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(40px, -40px) scale(1.05);
  }
  100% {
    transform: translate(-30px, 30px) scale(1);
  }
}

/* 💫 Card principal */
.intereses-card {
  background: rgba(25, 20, 59, 0.65);
  border-radius: 22px;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 40px rgba(150, 70, 255, 0.3);
}

/* ✨ Título */
.titulo-luminoso {
  background: linear-gradient(90deg, #d2a8ff, #b86cff, #7e4dff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 25px rgba(184, 58, 255, 0.6);
}

/* 🧩 Tarjetas */
.categoria-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  transition: all 0.25s ease-in-out;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #fff;
  min-height: 120px;
}
.categoria-card:hover {
  box-shadow: 0 0 22px rgba(170, 60, 255, 0.4);
  transform: translateY(-3px);
}
.categoria-card.seleccionada {
  background: linear-gradient(145deg, #7a00ff, #b060ff);
  box-shadow: 0 0 25px rgba(184, 58, 255, 0.6);
  border-color: rgba(255, 255, 255, 0.25);
}

/* 🧭 Botones */
.boton-omitir {
  font-size: 15px;
  text-transform: uppercase;
}
.boton-continuar {
  font-size: 15px;
  text-transform: uppercase;
  font-weight: 700;
  border-radius: 12px;
  padding: 10px 26px;
  background: linear-gradient(90deg, #8a2eff, #5e00c9);
  box-shadow: 0 4px 18px rgba(160, 60, 255, 0.5);
  color: white;
}
.boton-continuar:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(184, 58, 255, 0.7);
}
</style>
