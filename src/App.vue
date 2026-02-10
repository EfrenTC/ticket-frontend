<script setup>
import { onMounted } from 'vue';
import api from './services/api';


onMounted(async () => {
    try {
        const response = await api.get('/check');
        console.log("Backend status:", response.data.status);
    } catch (error) {
        console.error("Error de conexión con el backend:", error);
    }
});
</script>

<template>
  <router-view />
</template>
