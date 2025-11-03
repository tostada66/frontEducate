<!-- src/pages/PortadaPage.vue -->
<template>
  <q-page
    class="portada-page text-white flex flex-center column relative-position"
  >
    <!-- 🔹 Fondo dinámico -->
    <div class="animated-bg"></div>

    <!-- 🔹 Toolbar (mismo color sólido del fondo) -->
    <q-header class="bg-fondo text-white q-pa-md shadow-2">
      <q-toolbar class="justify-between">
        <!-- Logo -->
        <div
          class="text-h6 text-bold cursor-pointer"
          @click="$router.push({ name: 'portada' })"
        >
          EduPlatform
        </div>

        <!-- Menú superior -->
        <div class="row items-center q-gutter-md">
          <q-btn
            flat
            label="Ver Cursos"
            to="/catalogo/cursos"
            class="text-white"
          />
          <q-btn flat label="Planes" to="/suscripciones" class="text-white" />
          <q-btn
            color="positive"
            label="Acceder"
            to="/login"
            rounded
            unelevated
          />
        </div>
      </q-toolbar>
    </q-header>

    <!-- 🔹 Contenido central -->
    <div class="column items-center text-center q-mt-xl contenido">
      <div class="text-h3 text-bold">La plataforma de aprendizaje</div>
      <div class="text-h4 text-primary q-mt-sm">
        para estudiantes y profesionales
      </div>

      <div class="text-subtitle1 text-grey-4 q-mt-md" style="max-width: 600px">
        Aprende en línea con nuestros cursos especializados en tecnología,
        ingeniería y más. Accede a contenido exclusivo con una suscripción
        flexible.
      </div>

      <!-- 🔹 Botones principales -->
      <div class="row q-gutter-md q-mt-lg">
        <q-btn
          class="btn-sutil rojo"
          label="Ver Cursos"
          size="lg"
          to="/catalogo/cursos"
          rounded
        />
        <q-btn
          class="btn-sutil rosado"
          label="Ver Planes"
          size="lg"
          to="/suscripciones"
          rounded
        />
        <q-btn
          class="btn-sutil amarillo"
          label="Acceder"
          size="lg"
          to="/login"
          rounded
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
// No se modifica nada funcional
</script>

<style scoped>
/* 🔹 Fondo con animación elegante y suave */
.portada-page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background: radial-gradient(circle at 25% 25%, #0a0f1d, #030712 80%);
}

/* 🔹 Color sólido del fondo (para la barra superior) */
.bg-fondo {
  background-color: #0a0f1d !important;
}

/* 🔹 Capa de fondo animado */
.animated-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(
      circle at 30% 30%,
      rgba(0, 120, 255, 0.18),
      transparent 50%
    ),
    radial-gradient(circle at 70% 60%, rgba(255, 0, 120, 0.12), transparent 60%),
    radial-gradient(circle at 50% 80%, rgba(0, 255, 200, 0.1), transparent 50%);
  background-blend-mode: screen;
  filter: blur(80px);
  animation: move-bg 25s ease-in-out infinite alternate;
  z-index: 0;
}

@keyframes move-bg {
  0% {
    transform: scale(1) translate(0, 0);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.05) translate(-2%, -2%);
    opacity: 1;
  }
  100% {
    transform: scale(1) translate(2%, 2%);
    opacity: 0.8;
  }
}

/* 🔹 Contenido principal */
.contenido {
  z-index: 1;
  position: relative;
}

/* 🔹 Estilo limpio y plano de los botones */
.btn-sutil {
  font-weight: 600;
  border: 1px solid transparent;
  transition: all 0.3s ease;
  box-shadow: none;
  color: white;
}

/* 🔸 VER CURSOS */
.btn-sutil.rojo {
  background: #b83a2d;
}
.btn-sutil.rojo:hover {
  background: #a13225;
  box-shadow: 0 0 15px rgba(184, 58, 45, 0.4);
}

/* 🔸 VER PLANES */
.btn-sutil.rosado {
  background: #ff4d6d;
}
.btn-sutil.rosado:hover {
  background: #e63f5d;
  box-shadow: 0 0 15px rgba(255, 77, 109, 0.4);
}

/* 🔸 ACCEDER */
.btn-sutil.amarillo {
  background: #4caf50;
  color: #111;
}
.btn-sutil.amarillo:hover {
  background: #55c459;
  box-shadow: 0 0 15px rgba(243, 156, 18, 0.4);
}

/* 🔹 Suavizado del texto */
.text-h3,
.text-h4 {
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
}
</style>
