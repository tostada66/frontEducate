<!-- src/pages/PortadaPage.vue -->
<template>
  <q-page class="portada-page bg-dark text-white flex flex-center column">
    <!-- Menú superior -->
    <q-header class="bg-dark text-white q-pa-md shadow-2">
      <q-toolbar class="justify-between">
        <!-- Logo -->
        <div
          class="text-h6 text-bold cursor-pointer"
          @click="$router.push({ name: 'portada' })"
        >
          EduPlatform
        </div>

        <!-- Menú -->
        <div class="row items-center q-gutter-md">
          <q-btn
            flat
            label="Ver Cursos"
            to="/catalogo/cursos"
            class="text-white"
          />
          <q-btn flat label="Planes" to="/suscripciones" class="text-white" />
          <q-btn outline color="positive" label="Acceder" to="/login" rounded />
        </div>
      </q-toolbar>
    </q-header>

    <!-- Contenido central -->
    <div class="column items-center text-center q-mt-xl">
      <div class="text-h3 text-bold">La plataforma de aprendizaje</div>
      <div class="text-h4 text-primary q-mt-sm">
        para estudiantes y profesionales
      </div>

      <div class="text-subtitle1 text-grey-4 q-mt-md" style="max-width: 600px">
        Aprende en línea con nuestros cursos especializados en tecnología,
        ingeniería y más. Accede a contenido exclusivo con una suscripción
        flexible.
      </div>

      <!-- Botones principales -->
      <div class="row q-gutter-md q-mt-lg">
        <q-btn
          color="primary"
          label="Ver Cursos"
          size="lg"
          to="/catalogo/cursos"
          rounded
          unelevated
        />
        <q-btn
          outline
          color="secondary"
          label="Ver Planes"
          size="lg"
          to="/suscripciones"
          rounded
        />
        <q-btn
          outline
          color="positive"
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
// Aquí no necesitas lógica todavía
</script>

<style scoped>
.portada-page {
  min-height: 100vh;
  background: linear-gradient(160deg, #0a0a0a 0%, #121a25 100%);
}
</style>
