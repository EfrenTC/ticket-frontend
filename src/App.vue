<script setup>
import { onMounted, ref } from 'vue';
import api from './services/api';

const mensaje = ref('Cargando conexión...');

onMounted(async () => {
    try {
        const response = await api.get('/check');
        mensaje.value = response.data.status;
    } catch (error) {
        mensaje.value = 'Error: No se pudo conectar con el servidor';
        console.error(error);
    }
});
</script>

<template>
  <div class="test-container">
    <h1>Estado del Proyecto: {{ mensaje }}</h1>
  </div>
</template>