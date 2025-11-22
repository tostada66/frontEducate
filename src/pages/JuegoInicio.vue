<template>
  <q-page class="juego-inicio-page q-pa-none">
    <!-- 🎓 ENCABEZADO DE LA UNIDAD -->
    <div class="curso-header">
      <img
        :src="unidadImagen"
        alt="Imagen de la unidad"
        class="curso-header-img"
      />
      <div class="curso-header-overlay">
        <div class="curso-header-content">
          <div class="text-h4 text-weight-bold text-white q-mb-sm">
            {{ cursoJuego?.unidad?.titulo || "Unidad sin nombre" }}
          </div>

          <div class="text-body1 text-grey-3 q-mb-xs">
            <b>Curso:</b>
            {{ cursoJuego?.unidad?.curso?.nombre || "Curso desconocido" }}
            &nbsp;|&nbsp;
            <b>Nivel:</b>
            {{ cursoJuego?.unidad?.curso?.nivel || "General" }}
          </div>

          <div class="text-body2 text-grey-4">
            <b>Descripción:</b>
            {{ cursoJuego?.unidad?.descripcion || "Sin descripción" }}
          </div>
        </div>

        <q-btn
          color="blue"
          glossy
          icon="arrow_back"
          label="Volver a la unidad"
          class="boton-volver"
          @click="volverUnidad"
        />
      </div>
    </div>

    <!-- 💜 PORTADA DEL JUEGO -->
    <div class="juego-section">
      <div class="juego-card column items-center justify-center">
        <!-- 🖼️ Imagen del juego -->
        <q-img
          :src="juegoImagen"
          ratio="16/9"
          spinner-color="deep-purple"
          class="juego-portada"
        >
          <template #error>
            <div class="absolute-full flex flex-center bg-grey-7 text-white">
              Sin imagen del juego
            </div>
          </template>
        </q-img>

        <!-- 🎮 Info -->
        <div class="juego-info text-center">
          <div class="text-h5 text-bold text-white q-mb-sm text-glow">
            🎮
            {{ cursoJuego?.nombre_tema || juego?.nombre || "Juego sin título" }}
          </div>

          <div class="text-subtitle1 text-grey-3 q-mb-lg">
            {{ juego?.descripcion || "Sin descripción disponible." }}
          </div>

          <!-- ▶️ Botón -->
          <q-btn
            color="deep-purple-6"
            glossy
            icon="play_arrow"
            label="Comenzar juego"
            size="lg"
            rounded
            class="btn-jugar"
            :disable="!cursoJuego?.activo"
            @click="goToPlay"
          />

          <div v-if="!cursoJuego?.activo" class="text-negative q-mt-md">
            Este juego aún no está activo.
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { api } from "boot/axios";

const $q = useQuasar();
const route = useRoute();
const router = useRouter();

const cursoJuego = ref(null);
const juego = ref(null);
const unidadImagen = ref("/images/unidad-placeholder.jpg");
const juegoImagen = ref("/images/juego-placeholder.jpg");

async function loadJuego() {
  try {
    const { idcursojuego } = route.params;
    const { data } = await api.get(`/curso-juego/${idcursojuego}`);
    cursoJuego.value = data.data;
    juego.value = cursoJuego.value.juego;

    // 🖼️ Imagen de la unidad
    unidadImagen.value =
      cursoJuego.value?.unidad?.imagen_url ||
      (cursoJuego.value?.unidad?.imagen
        ? `http://127.0.0.1:8000/storage/${cursoJuego.value.unidad.imagen}`
        : "/images/unidad-placeholder.jpg");

    // 🖼️ Imagen del juego (prioridad: juego base > curso_juego personalizada)
    juegoImagen.value =
      juego.value?.imagen_url ||
      (cursoJuego.value?.imagen
        ? `http://127.0.0.1:8000/storage/${cursoJuego.value.imagen}`
        : "/images/juego-placeholder.jpg");
  } catch (err) {
    console.error("Error al cargar juego:", err);
    $q.notify({ type: "negative", message: "Error al cargar el juego." });
  }
}

// 🔀 Resolver tipo de juego
function resolveJuegoType() {
  const raw =
    juego.value?.slug ||
    juego.value?.nombre ||
    cursoJuego.value?.juego?.nombre ||
    cursoJuego.value?.nombre_tema ||
    "";
  const tipo = raw
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (tipo.includes("mecanografia")) return "mecanografia";
  if (tipo.includes("memoria")) return "memoria";
  if (tipo.includes("reciclaje")) return "reciclaje";
  return null;
}

// ▶️ Iniciar juego
function goToPlay() {
  const tipo = resolveJuegoType();
  const idcursojuego = cursoJuego.value?.idcursojuego;

  if (!idcursojuego) {
    $q.notify({ type: "negative", message: "Juego inválido." });
    return;
  }

  if (tipo === "mecanografia") {
    router.push({ name: "juego-mecanografia-play", params: { idcursojuego } });
    return;
  }

  if (tipo === "memoria") {
    router.push({ name: "juego-memoria-play", params: { idcursojuego } });
    return;
  }

  if (tipo === "reciclaje") {
    router.push({ name: "juego-reciclaje-play", params: { idcursojuego } });
    return;
  }

  $q.notify({
    type: "warning",
    message:
      "Este tipo de juego aún no tiene una ruta de reproducción configurada.",
  });
}

// 🔙 Volver a la unidad
function volverUnidad() {
  router.push({
    name: "unidad-detalle",
    params: {
      idcurso: cursoJuego.value?.unidad?.curso?.idcurso,
      idunidad: cursoJuego.value?.unidad?.idunidad,
    },
  });
}

onMounted(() => loadJuego());
</script>

<style scoped>
/* 🎓 Encabezado de la unidad */
.curso-header {
  position: relative;
  height: 260px;
  overflow: hidden;
  border-bottom: 3px solid rgba(162, 0, 220, 0.4);
}
.curso-header-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.75);
}
.curso-header-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 30px 40px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.75), transparent);
}
.curso-header-content {
  color: #fff;
  margin-bottom: 10px;
}
.boton-volver {
  align-self: flex-start;
  margin-top: 10px;
  font-weight: 600;
  border-radius: 10px;
}

/* 💜 Portada del juego */
.juego-section {
  background: radial-gradient(circle at center, #4a009f 0%, #210043 100%);
  padding: 80px 20px;
  display: flex;
  justify-content: center;
}
.juego-card {
  max-width: 850px;
  width: 100%;
  border-radius: 30px;
  background: linear-gradient(180deg, #5b02a6, #2e0068);
  box-shadow: 0 0 30px rgba(162, 0, 220, 0.6);
  overflow: hidden;
  text-align: center;
  color: white;
  padding-bottom: 50px;
}
.juego-portada {
  width: 100%;
  height: 260px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.25);
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
  object-fit: cover;
}
.juego-info {
  padding: 40px 20px 0;
}
.text-glow {
  color: #e3c2ff;
  text-shadow: 0 0 10px #b86cff, 0 0 25px #a200dc;
}
.btn-jugar {
  font-weight: 700;
  background: linear-gradient(90deg, #a200dc, #7a00ff) !important;
  box-shadow: 0 0 20px rgba(162, 0, 220, 0.6);
  animation: pulse 2.8s infinite;
}
@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 18px rgba(162, 0, 220, 0.6);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 28px rgba(200, 140, 255, 0.8);
  }
}
</style>
