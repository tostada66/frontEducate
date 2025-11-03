<template>
  <q-page class="q-pa-md bg-grey-1">
    <!-- 🧩 Encabezado -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5 text-primary text-weight-bold">
        {{ isEditMode ? "✏️ Editar Examen" : "🧩 Crear Examen para la Unidad" }}
      </div>

      <q-btn
        color="secondary"
        icon="arrow_back"
        label="Volver a unidades"
        @click="goBack"
      />
    </div>

    <!-- FORMULARIO -->
    <q-form @submit="guardarExamen" class="q-gutter-md">
      <!-- 🔹 Información general -->
      <q-card flat bordered class="q-pa-md">
        <div class="text-subtitle1 text-bold q-mb-sm">Información general</div>

        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input
              v-model="examen.titulo"
              label="Título del examen"
              outlined
              dense
              required
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model.number="examen.minimo_aprobacion"
              type="number"
              label="% mínimo para aprobar"
              outlined
              dense
              min="0"
              max="100"
            />
          </div>
          <div class="col-12">
            <q-input
              v-model="examen.descripcion"
              type="textarea"
              label="Descripción"
              outlined
              dense
              autogrow
            />
          </div>
        </div>

        <div class="row q-col-gutter-md q-mt-sm">
          <div class="col-12 col-md-6">
            <q-input
              v-model.number="examen.vidas"
              type="number"
              label="Número de vidas"
              outlined
              dense
              min="1"
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model.number="examen.duracion_segundos"
              type="number"
              label="Duración total (segundos)"
              outlined
              dense
              readonly
              disable
              color="grey-7"
              :hint="`Se calcula automáticamente (${(
                examen.duracion_segundos / 60
              ).toFixed(1)} min aprox.)`"
            >
              <template #append>
                <q-icon name="timer" color="primary" />
              </template>
            </q-input>
          </div>
        </div>
      </q-card>

      <!-- 🔹 Preguntas -->
      <q-card flat bordered class="q-pa-md q-mt-md">
        <div class="row items-center justify-between q-mb-sm">
          <div class="text-subtitle1 text-bold">Preguntas del examen</div>
          <q-btn
            color="primary"
            icon="add"
            label="Agregar pregunta"
            @click="agregarPregunta"
          />
        </div>

        <q-list bordered separator>
          <q-expansion-item
            v-for="(pregunta, index) in examen.preguntas"
            :key="index"
            expand-separator
            :label="`Pregunta ${index + 1}`"
            :caption="pregunta.texto || 'Sin texto aún...'"
          >
            <div class="q-pa-sm">
              <q-input
                v-model="pregunta.texto"
                label="Texto de la pregunta"
                outlined
                dense
                class="q-mb-sm"
              />

              <div class="row q-col-gutter-md">
                <div class="col-6">
                  <q-input
                    v-model.number="pregunta.tiempo_segundos"
                    type="number"
                    label="Tiempo (segundos)"
                    outlined
                    dense
                    min="5"
                    @update:model-value="recalcularDuracion"
                  />
                </div>
                <div class="col-6">
                  <q-input
                    v-model.number="pregunta.puntos"
                    type="number"
                    label="Puntos"
                    outlined
                    dense
                    min="1"
                  />
                </div>
              </div>

              <!-- Respuestas -->
              <div class="q-mt-sm">
                <div class="text-bold q-mb-xs">Opciones de respuesta:</div>

                <div
                  v-for="(respuesta, ri) in pregunta.respuestas"
                  :key="ri"
                  class="row items-center q-mb-xs"
                >
                  <div class="col-1 text-center">
                    <q-radio
                      v-model="pregunta.respuesta_correcta"
                      :val="ri"
                      color="green"
                      size="sm"
                    />
                  </div>
                  <div class="col">
                    <q-input
                      v-model="respuesta.texto"
                      dense
                      outlined
                      placeholder="Texto de la respuesta"
                    />
                  </div>
                  <div class="col-auto">
                    <q-btn
                      dense
                      flat
                      round
                      color="negative"
                      icon="delete"
                      @click="eliminarRespuesta(index, ri)"
                    />
                  </div>
                </div>

                <q-btn
                  flat
                  dense
                  icon="add_circle"
                  color="primary"
                  label="Agregar respuesta"
                  @click="agregarRespuesta(index)"
                />
              </div>

              <!-- Botones bajo cada bloque -->
              <div class="q-mt-md row justify-between">
                <q-btn
                  flat
                  color="negative"
                  icon="delete"
                  label="Eliminar pregunta"
                  @click="eliminarPregunta(index)"
                />
                <q-btn
                  flat
                  icon="add"
                  color="primary"
                  label="Agregar nueva pregunta debajo"
                  @click="agregarPregunta(index + 1)"
                />
              </div>
            </div>
          </q-expansion-item>
        </q-list>
      </q-card>

      <!-- 🔹 Botones finales -->
      <div class="row justify-between q-mt-md">
        <q-btn
          v-if="isEditMode"
          color="negative"
          icon="delete"
          label="Eliminar examen"
          @click="eliminarExamen"
        />

        <q-btn
          type="submit"
          color="primary"
          :label="isEditMode ? 'Actualizar examen' : 'Guardar examen completo'"
        />
      </div>
    </q-form>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useQuasar } from "quasar";
import { api } from "boot/axios";
import { useRoute, useRouter } from "vue-router";

const $q = useQuasar();
const route = useRoute();
const router = useRouter();

const examen = ref({
  idunidad: Number(route.params.idunidad) || null,
  titulo: "",
  descripcion: "",
  duracion_segundos: 0,
  vidas: 3,
  minimo_aprobacion: 70,
  preguntas: [],
});

const isEditMode = ref(!!route.params.idexamen);

// ➕ Agregar / eliminar preguntas y respuestas
function agregarPregunta(pos = null) {
  const nueva = {
    texto: "",
    tiempo_segundos: 20,
    puntos: 10,
    respuestas: [],
    respuesta_correcta: null,
  };
  if (pos !== null) examen.value.preguntas.splice(pos, 0, nueva);
  else examen.value.preguntas.push(nueva);
  recalcularDuracion();
}
function eliminarPregunta(index) {
  examen.value.preguntas.splice(index, 1);
  recalcularDuracion();
}
function agregarRespuesta(idx) {
  examen.value.preguntas[idx].respuestas.push({ texto: "" });
}
function eliminarRespuesta(idx, ri) {
  examen.value.preguntas[idx].respuestas.splice(ri, 1);
}

// 🧮 Recalcular duración
function recalcularDuracion() {
  examen.value.duracion_segundos = examen.value.preguntas.reduce(
    (acc, p) => acc + (Number(p.tiempo_segundos) || 0),
    0
  );
}

// 💾 Guardar examen
async function guardarExamen() {
  try {
    recalcularDuracion();
    const payload = examen.value;

    if (isEditMode.value) {
      await api.put(`/examenes/${route.params.idexamen}`, payload);
      $q.notify({
        type: "positive",
        message: "✅ Examen actualizado correctamente",
      });
    } else {
      await api.post("/examenes", payload);
      $q.notify({
        type: "positive",
        message: "✅ Examen creado correctamente",
      });
    }

    router.push({
      name: "unidades-list",
      params: { idcurso: route.params.idcurso },
    });
  } catch (err) {
    console.error("❌ Error guardando examen:", err);
    $q.notify({ type: "negative", message: "Error al guardar el examen" });
  }
}

// 🗑️ Eliminar examen
async function eliminarExamen() {
  $q.dialog({
    title: "Confirmar",
    message: "¿Eliminar este examen permanentemente?",
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await api.delete(`/examenes/${route.params.idexamen}`);
      $q.notify({
        type: "positive",
        message: "🗑️ Examen eliminado correctamente",
      });
      router.push({
        name: "unidades-list",
        params: { idcurso: route.params.idcurso },
      });
    } catch (err) {
      console.error("❌ Error eliminando examen:", err);
      $q.notify({ type: "negative", message: "Error eliminando examen" });
    }
  });
}

// 🔁 Cargar datos si está en modo edición
async function loadExamen() {
  if (!isEditMode.value) return;
  try {
    const { data } = await api.get(`/examenes/${route.params.idexamen}`);
    examen.value = {
      ...data,
      preguntas: data.preguntas.map((p) => ({
        ...p,
        respuesta_correcta: p.respuestas.findIndex((r) => r.es_correcta),
      })),
    };
    recalcularDuracion();
  } catch (err) {
    console.error("❌ Error cargando examen:", err);
    $q.notify({ type: "negative", message: "Error cargando examen existente" });
  }
}

// 🔙 Volver
function goBack() {
  router.push({
    name: "unidades-list",
    params: { idcurso: route.params.idcurso },
  });
}

onMounted(loadExamen);
</script>
