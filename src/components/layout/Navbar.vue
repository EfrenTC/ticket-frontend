<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../../services/api.service';

const isAuthenticated = ref(false);
const route = useRoute();
const router = useRouter();

const syncAuth = () => {
  isAuthenticated.value = localStorage.getItem('isAuthenticated') === 'true';
};

const handleLogout = async () => {
  try {
    await api.get('/sanctum/csrf-cookie');
    await api.post('/logout');
  } catch (error) {
  } finally {
    localStorage.removeItem('isAuthenticated');
    syncAuth();
    await router.push({ name: 'home' });
  }
};

onMounted(syncAuth);
watch(() => route.fullPath, syncAuth);
</script>

<template>
  <nav class="bg-white border-b border-gray-200 py-4 px-6 flex justify-between items-center shadow-sm">
    <router-link
      :to="isAuthenticated ? { name: 'welcome' } : { name: 'home' }"
      class="text-2xl font-bold text-blue-600 hover:opacity-80 transition-opacity"
    >
      TicketManager
    </router-link>

    <div class="space-x-4">
      <template v-if="isAuthenticated">
        <button
          type="button"
          class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          @click="handleLogout"
        >
          Cerrar sesion
        </button>
      </template>
      <template v-else>
        <router-link to="/login" class="text-gray-600 hover:text-blue-600 font-medium">
          Iniciar sesion
        </router-link>
        <router-link to="/register" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          Registrarse
        </router-link>
      </template>
    </div>
  </nav>
</template>