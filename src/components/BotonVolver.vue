<template>
  <q-btn
    flat
    color="white"
    icon="arrow_back"
    class="boton-volver"
    @click="volver"
  />
</template>

<script setup>
import { useRouter } from "vue-router";
const router = useRouter();

function volver() {
  if (window.history.length > 1) router.back();
  else router.push({ name: "index" });
}
</script>

<style scoped>
.boton-volver {
  background-color: #009688; /* Verde esmeralda */
  color: white;
  border-radius: 10px;
  padding: 2px 8px;
  height: 32px;
  width: 48px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.25);
  transition: all 0.2s ease;
}
.boton-volver:hover {
  background-color: #00796b;
  transform: scale(1.05);
}
</style>
