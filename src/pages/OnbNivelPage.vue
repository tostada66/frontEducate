<template>
  <q-page class="nivel-page">
    <!-- Fondo con partículas de código más dinámicas -->
    <div class="code-bg">
      <div class="code-particle">function learn() { return knowledge++; }</div>
      <div class="code-particle">const skill = new Programming();</div>
      <div class="code-particle">if (practice) { improve(); }</div>
      <div class="code-particle">while (learning) { grow(); }</div>
      <div class="code-particle">class Developer extends Student {}</div>
      <div class="code-particle">let experience = 0;</div>
      <div class="code-particle">
        for (let i = 0; i &lt; courses.length; i++)
      </div>
      <div class="code-particle">return mastery.level;</div>
      <div class="code-particle">
        async function study() { await progress; }
      </div>
      <div class="code-particle">const journey = new Learning();</div>
    </div>

    <!-- Ondas dinámicas de energía -->
    <div class="energy-waves">
      <div class="energy-wave wave-1"></div>
      <div class="energy-wave wave-2"></div>
      <div class="energy-wave wave-3"></div>
      <div class="energy-wave wave-4"></div>
    </div>

    <!-- Círculos pulsantes -->
    <div class="pulse-circles">
      <div class="pulse-circle circle-1"></div>
      <div class="pulse-circle circle-2"></div>
      <div class="pulse-circle circle-3"></div>
    </div>

    <!-- Partículas flotantes de datos -->
    <div class="data-particles">
      <div class="data-dot"></div>
      <div class="data-dot"></div>
      <div class="data-dot"></div>
      <div class="data-dot"></div>
      <div class="data-dot"></div>
    </div>

    <!-- Contenedor principal -->
    <div class="level-container">
      <!-- Header -->
      <div class="level-header">
        <div class="level-icon">📚</div>
        <h1 class="level-title">¿Cuál es tu nivel de experiencia?</h1>
        <p class="level-subtitle">
          Esto nos ayudará a personalizar el contenido y sugerir cursos
          adecuados para ti
        </p>
      </div>

      <!-- Cards de nivel -->
      <div class="level-options">
        <!-- Principiante -->
        <div
          class="level-card"
          :class="{ selected: selected === 'Principiante' }"
          @click="selectNivel('Principiante')"
        >
          <div class="card-icon beginner-icon">🌱</div>
          <h3 class="card-title">Principiante</h3>
          <p class="card-description">
            Soy nuevo en programación o tengo conocimientos muy básicos
          </p>
          <ul class="card-features">
            <li>Conceptos básicos</li>
            <li>Proyectos guiados</li>
            <li>Explicaciones detalladas</li>
          </ul>
        </div>

        <!-- Intermedio -->
        <div
          class="level-card"
          :class="{ selected: selected === 'Intermedio' }"
          @click="selectNivel('Intermedio')"
        >
          <div class="card-icon intermediate-icon">🚀</div>
          <h3 class="card-title">Intermedio</h3>
          <p class="card-description">
            Tengo algunos conocimientos y he trabajado en proyectos pequeños
          </p>
          <ul class="card-features">
            <li>Estructuras de datos</li>
            <li>Patrones de diseño</li>
            <li>Mejores prácticas</li>
          </ul>
        </div>

        <!-- Avanzado -->
        <div
          class="level-card"
          :class="{ selected: selected === 'Avanzado' }"
          @click="selectNivel('Avanzado')"
        >
          <div class="card-icon advanced-icon">⭐</div>
          <h3 class="card-title">Avanzado</h3>
          <p class="card-description">
            Tengo experiencia sólida y busco especializarme
          </p>
          <ul class="card-features">
            <li>Arquitecturas complejas</li>
            <li>Optimización</li>
            <li>Liderazgo técnico</li>
          </ul>
        </div>
      </div>

      <!-- Botón continuar -->
      <q-btn
        unelevated
        :label="selected ? `Continuar como ${selected}` : 'Continuar'"
        :disable="!selected || loading"
        :loading="loading"
        @click="guardarNivel"
        class="continue-button"
        no-caps
      />
    </div>
  </q-page>
</template>

<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { api } from "boot/axios";

const router = useRouter();
const route = useRoute();

const selected = ref(null);
const loading = ref(false);

// obtenemos idusuario de la query
const idusuario = route.query.idusuario;

function selectNivel(nivel) {
  selected.value = nivel;
}

async function guardarNivel() {
  if (!selected.value || !idusuario) return;
  loading.value = true;

  try {
    await api.post("/register/estudiante/nivel", {
      idusuario: idusuario,
      nivelacademico: selected.value,
    });

    // Después de guardar, lo mandamos a la vista de intereses
    router.replace({
      name: "onb-intereses",
      query: { idusuario },
    });
  } catch (e) {
    console.error(e);
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
$success: #2ecc71;
$info: #3498db;

.nivel-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $bg-dark;
  position: relative;
  overflow: hidden;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  padding: 0.7rem 0; // antes 1rem → todavía más bajo
}

/* =======================
   Fondo con partículas de código
   ======================= */

.code-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
}

.code-particle {
  position: absolute;
  color: $accent;
  font-family: "Courier New", monospace;
  font-size: 14px;
  opacity: 0.15;
  animation: codeFloat 25s infinite linear;
  white-space: nowrap;

  &:nth-child(1) {
    left: 5%;
    animation-delay: 0s;
    color: $info;
  }
  &:nth-child(2) {
    left: 15%;
    animation-delay: 3s;
    color: $success;
  }
  &:nth-child(3) {
    left: 25%;
    animation-delay: 6s;
    color: $warning;
  }
  &:nth-child(4) {
    left: 35%;
    animation-delay: 9s;
    color: $accent;
  }
  &:nth-child(5) {
    left: 45%;
    animation-delay: 12s;
    color: $primary;
  }
  &:nth-child(6) {
    left: 55%;
    animation-delay: 15s;
    color: $info;
  }
  &:nth-child(7) {
    left: 65%;
    animation-delay: 18s;
    color: $success;
  }
  &:nth-child(8) {
    left: 75%;
    animation-delay: 21s;
    color: $warning;
  }
  &:nth-child(9) {
    left: 85%;
    animation-delay: 24s;
    color: $accent;
  }
  &:nth-child(10) {
    left: 95%;
    animation-delay: 27s;
    color: $primary;
  }
}

@keyframes codeFloat {
  0% {
    transform: translateY(100vh) rotate(0deg) scale(0.8);
    opacity: 0;
  }
  5% {
    opacity: 0.15;
    transform: scale(1);
  }
  50% {
    transform: translateY(50vh) rotate(180deg) scale(1.1);
    opacity: 0.2;
  }
  95% {
    opacity: 0.15;
  }
  100% {
    transform: translateY(-10vh) rotate(360deg) scale(0.9);
    opacity: 0;
  }
}

/* =======================
   Ondas dinámicas de energía
   ======================= */

.energy-waves {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

.energy-wave {
  position: absolute;
  width: 200%;
  height: 3px;
  background: linear-gradient(
    90deg,
    transparent,
    $accent,
    $primary,
    $info,
    $success,
    transparent
  );
  opacity: 0.2;
  animation: waveMove 12s infinite ease-in-out;

  &.wave-1 {
    top: 20%;
    animation-delay: 0s;
  }
  &.wave-2 {
    top: 40%;
    animation-delay: 2s;
    animation-direction: reverse;
  }
  &.wave-3 {
    top: 60%;
    animation-delay: 4s;
  }
  &.wave-4 {
    top: 80%;
    animation-delay: 6s;
    animation-direction: reverse;
  }
}

@keyframes waveMove {
  0%,
  100% {
    transform: translateX(-50%) scaleX(0.5);
    opacity: 0.1;
  }
  50% {
    transform: translateX(-30%) scaleX(1.2);
    opacity: 0.3;
  }
}

/* =======================
   Círculos pulsantes
   ======================= */

.pulse-circles {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

.pulse-circle {
  position: absolute;
  border-radius: 50%;
  border: 2px solid;
  animation: pulseExpand 8s infinite ease-out;

  &.circle-1 {
    width: 100px;
    height: 100px;
    top: 15%;
    left: 20%;
    border-color: rgba(52, 152, 219, 0.3);
    animation-delay: 0s;
  }

  &.circle-2 {
    width: 150px;
    height: 150px;
    top: 70%;
    right: 15%;
    border-color: rgba(46, 204, 113, 0.3);
    animation-delay: 2s;
  }

  &.circle-3 {
    width: 80px;
    height: 80px;
    top: 50%;
    left: 80%;
    border-color: rgba(243, 156, 18, 0.3);
    animation-delay: 4s;
  }
}

@keyframes pulseExpand {
  0% {
    transform: scale(0.5);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.8;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

/* =======================
   Partículas flotantes de datos
   ======================= */

.data-particles {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

.data-dot {
  position: absolute;
  width: 4px;
  height: 4px;
  background: $accent;
  border-radius: 50%;
  animation: dataFloat 15s infinite linear;
  opacity: 0.6;

  &:nth-child(1) {
    left: 10%;
    animation-delay: 0s;
    background: $info;
  }
  &:nth-child(2) {
    left: 30%;
    animation-delay: 2s;
    background: $success;
  }
  &:nth-child(3) {
    left: 50%;
    animation-delay: 4s;
    background: $warning;
  }
  &:nth-child(4) {
    left: 70%;
    animation-delay: 6s;
    background: $accent;
  }
  &:nth-child(5) {
    left: 90%;
    animation-delay: 8s;
    background: $primary;
  }
}

@keyframes dataFloat {
  0% {
    transform: translateY(100vh) translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 0.6;
  }
  50% {
    transform: translateY(50vh) translateX(50px);
    opacity: 0.8;
  }
  90% {
    opacity: 0.6;
  }
  100% {
    transform: translateY(-10vh) translateX(-30px);
    opacity: 0;
  }
}

/* =======================
   Contenedor principal
   ======================= */

.level-container {
  background: rgba(25, 25, 59, 0.3);
  backdrop-filter: blur(25px);
  border-radius: 24px;
  padding: 1.3rem 1.8rem 1.5rem; // menos padding
  width: 100%;
  max-width: 920px; // ligeramente más angosto
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 26px 52px rgba(0, 0, 0, 0.3);
  animation: fadeInUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  z-index: 2;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translate3d(0, 50px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

/* =======================
   Header (más compacto)
   ======================= */

.level-header {
  text-align: center;
  margin-bottom: 0.9rem; // antes 1.1rem
}

.level-icon {
  width: 54px;
  height: 54px;
  background: linear-gradient(135deg, $primary, $accent);
  border-radius: 50%;
  margin: 0 auto 0.35rem; // pegado al título
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  animation: iconPulse 3s ease-in-out infinite;
}

@keyframes iconPulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.04);
    box-shadow: 0 0 26px rgba(255, 107, 107, 0.4);
  }
}

.level-title {
  color: $secondary;
  font-size: 1.6rem; // antes 1.75
  font-weight: 300;
  margin-bottom: 0.15rem; // antes 0.25
  background: linear-gradient(135deg, $secondary, $accent);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.level-subtitle {
  color: $neutral;
  font-size: 0.94rem;
  line-height: 1.4;
  max-width: 520px;
  margin: 0 auto;
}

/* =======================
   Cards de nivel
   ======================= */

.level-options {
  display: flex;
  justify-content: center;
  gap: 1.3rem; // un poquito más juntas
  margin-bottom: 1.25rem; // antes 1.6
  flex-wrap: nowrap;
}

.level-card {
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 1.3rem 1.2rem; // antes 1.6
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(15px);
  position: relative;
  overflow: hidden;
  flex: 1;
  max-width: 290px;
  min-width: 250px;

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
      rgba(255, 255, 255, 0.1),
      transparent
    );
    transition: left 0.6s ease;
  }

  &:hover::before {
    left: 100%;
  }

  &:hover {
    transform: translateY(-6px);
    border-color: $accent;
    box-shadow: 0 18px 36px rgba(255, 107, 107, 0.2);
    background: rgba(255, 255, 255, 0.12);
  }

  &.selected {
    border-color: $accent;
    background: linear-gradient(
      135deg,
      rgba(184, 58, 45, 0.22),
      rgba(255, 107, 107, 0.22)
    );
    transform: translateY(-3px);
    box-shadow: 0 14px 30px rgba(255, 107, 107, 0.3);
  }
}

.card-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  margin: 0 auto 0.65rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.7rem;
  transition: all 0.3s ease;

  &.beginner-icon {
    background: linear-gradient(135deg, $success, $info);
  }

  &.intermediate-icon {
    background: linear-gradient(135deg, $warning, $accent);
  }

  &.advanced-icon {
    background: linear-gradient(135deg, $primary, $accent);
  }
}

.card-title {
  color: $secondary;
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 0.35rem;
  text-align: center;
}

.card-description {
  color: $neutral;
  font-size: 0.9rem;
  text-align: center;
  margin-bottom: 0.6rem; // menos espacio
  line-height: 1.4;
}

.card-features {
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    color: $secondary;
    font-size: 0.88rem;
    padding: 0.22rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &::before {
      content: "✓";
      color: $accent;
      font-weight: bold;
      font-size: 0.8rem;
    }
  }
}

/* =======================
   Botón continuar
   ======================= */

:deep(.continue-button) {
  width: auto !important;
  min-width: 190px !important;
  padding: 0.8rem 1.8rem !important; // menos alto
  background: linear-gradient(135deg, $primary, $accent) !important;
  border: none !important;
  border-radius: 12px !important;
  color: white !important;
  font-size: 0.98rem !important;
  font-weight: 600 !important;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  display: block;
  margin: 0 auto;

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

  &:hover::before {
    left: 100%;
  }

  &:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 13px 30px rgba(184, 58, 45, 0.4) !important;
  }

  &:disabled {
    opacity: 0.5 !important;
    cursor: not-allowed !important;
    transform: none !important;
    box-shadow: none !important;
  }
}

/* =======================
   Responsive
   ======================= */

@media (max-width: 768px) {
  .level-container {
    padding: 1.2rem 1.3rem 1.3rem;
    margin: 0.7rem;
    max-width: 95%;
  }

  .level-options {
    flex-direction: column;
    align-items: center;
    gap: 0.9rem;
  }

  .level-card {
    padding: 1.25rem;
    max-width: 100%;
    min-width: auto;
    width: 100%;
  }

  .level-title {
    font-size: 1.45rem;
  }

  .level-subtitle {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .nivel-page {
    padding: 0.6rem 0;
  }

  .level-container {
    padding: 1.1rem;
    margin: 0.4rem;
  }

  .level-header {
    margin-bottom: 1.1rem;
  }

  .level-icon {
    width: 52px;
    height: 52px;
    font-size: 1.4rem;
  }
}
</style>
