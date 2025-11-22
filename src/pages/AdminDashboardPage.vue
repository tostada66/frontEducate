<template>
  <q-page class="admin-dashboard-page q-pa-md">
    <!-- 🌌 Hero centrado limpio -->
    <div
      class="hero-admin-clean column items-center justify-center q-pt-xl q-pb-lg"
    >
      <div class="text-h3 hero-title-glow q-mb-sm">
        🧭 Panel del Administrador
      </div>
      <div class="text-subtitle1 hero-subtitle-light">
        Gestiona profesores, estudiantes, cursos, finanzas y más.
      </div>
    </div>

    <!-- 👥 Sección: Gestión de Usuarios -->
    <div class="section-title q-mt-xl">👥 Gestión de Usuarios</div>
    <div class="row justify-center q-col-gutter-lg q-mb-xl q-mt-sm">
      <div
        v-for="item in gestionUsuarios"
        :key="item.label"
        class="col-12 col-sm-6"
      >
        <q-card
          class="dashboard-card"
          @click="$router.push({ name: item.route })"
        >
          <q-card-section class="text-center">
            <q-icon
              :name="item.icon"
              :color="item.color"
              size="70px"
              class="icon-glow"
            />
            <div class="text-h6 text-white q-mt-sm">{{ item.label }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- 📘 Sección: Gestión de Contenido -->
    <div class="section-title q-mt-xl">📚 Gestión de Contenido</div>
    <div class="row justify-center q-col-gutter-lg q-mb-xl q-mt-sm">
      <div
        v-for="item in gestionContenido"
        :key="item.label"
        class="col-12 col-sm-6 col-md-4"
      >
        <q-card
          class="dashboard-card"
          @click="$router.push({ name: item.route })"
        >
          <q-card-section class="text-center">
            <q-icon
              :name="item.icon"
              :color="item.color"
              size="70px"
              class="icon-glow"
            />
            <div class="text-h6 text-white q-mt-sm">{{ item.label }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- 💵 Sección: Finanzas -->
    <div class="section-title q-mt-xl">💰 Finanzas</div>
    <div class="row justify-center q-col-gutter-lg q-mb-xl q-mt-sm">
      <div v-for="item in finanzas" :key="item.label" class="col-12 col-sm-6">
        <q-card
          class="dashboard-card"
          @click="$router.push({ name: item.route })"
        >
          <q-card-section class="text-center">
            <q-icon
              :name="item.icon"
              :color="item.color"
              size="70px"
              class="icon-glow"
            />
            <div class="text-h6 text-white q-mt-sm">{{ item.label }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
const gestionUsuarios = [
  {
    label: "Profesores",
    icon: "school",
    color: "light-blue-5",
    route: "admin-profesores",
  },
  {
    label: "Estudiantes",
    icon: "group",
    color: "teal-4",
    route: "admin-estudiantes",
  },
];

const gestionContenido = [
  {
    label: "Solicitudes Profesores",
    icon: "groups",
    color: "cyan-5",
    route: "admin-solicitudes",
  },
  {
    label: "Cursos Pendientes",
    icon: "menu_book",
    color: "amber-5",
    route: "admin-cursos-pendientes",
  },
  {
    label: "Cursos Generales",
    icon: "grid_view",
    color: "deep-purple-5",
    route: "cursos-list", // 👉 Nuevo botón que lleva al listado general de cursos
  },
];

const finanzas = [
  {
    label: "Pagos a Profesores",
    icon: "paid",
    color: "light-green-5",
    route: "admin-pagos-profesores",
  },
  {
    label: "Historial de Facturas",
    icon: "receipt_long",
    color: "red-5",
    route: "facturas-historial",
  },
  {
    label: "Suscripciones",
    icon: "workspace_premium",
    color: "amber-4",
    route: "admin-suscripciones",
  },
];
</script>

<style scoped>
.admin-dashboard-page {
  background: radial-gradient(circle at 25% 25%, #3b0a73, #1a0033 85%);
  min-height: 100vh;
  color: white;
  font-family: "Segoe UI", sans-serif;
}

/* 🌌 Hero limpio */
.hero-admin-clean {
  text-align: center;
  background: transparent;
}

/* ✨ Título neón animado */
.hero-title-glow {
  font-weight: 900;
  font-size: 2.6rem;
  color: #f5e9ff;
  text-shadow: 0 0 12px #d2a8ff, 0 0 25px #b86cff,
    0 0 45px rgba(184, 58, 255, 0.6);
  letter-spacing: 1px;
  animation: glowPulse 3s ease-in-out infinite alternate;
}

@keyframes glowPulse {
  0% {
    text-shadow: 0 0 10px #d2a8ff, 0 0 25px #a200dc,
      0 0 45px rgba(162, 0, 220, 0.4);
  }
  100% {
    text-shadow: 0 0 18px #e3baff, 0 0 35px #d86cff,
      0 0 65px rgba(184, 58, 255, 0.8);
  }
}

/* 💡 Subtítulo */
.hero-subtitle-light {
  color: #f2eaff;
  opacity: 0.9;
  font-weight: 400;
  letter-spacing: 0.5px;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
  margin-top: 4px;
}

/* 🔹 Sección títulos */
.section-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #d2a8ff;
  text-shadow: 0 0 8px #b86cff, 0 0 16px #a200dc;
  text-align: left;
  margin-bottom: 12px;
}

/* Cards */
.dashboard-card {
  background: linear-gradient(180deg, #4b0082, #2a005a);
  border-radius: 24px;
  box-shadow: 0 0 25px rgba(162, 0, 220, 0.4);
  transition: all 0.3s ease;
  cursor: pointer;
  padding: 10px 0;
}
.dashboard-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 0 35px rgba(184, 58, 255, 0.8);
}

/* Iconos con efecto neón */
.icon-glow {
  text-shadow: 0 0 12px rgba(255, 255, 255, 0.6);
  transition: all 0.3s ease;
}
.dashboard-card:hover .icon-glow {
  transform: scale(1.1);
  text-shadow: 0 0 25px rgba(255, 255, 255, 0.9);
}

/* Texto */
.text-h6 {
  text-shadow: 0 0 6px rgba(255, 255, 255, 0.4);
}
</style>
