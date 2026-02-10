<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '../composables/useAuth';
import Navbar from '../components/layout/Navbar.vue';
import type { RegisterPayload } from '../types'; 

const { register, errors } = useAuth();

const form = ref<RegisterPayload>({
  name: '',
  email: '',
  password: '',
  password_confirmation: ''
});

const handleSubmit = async () => {
  await register(form.value);
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />
    
    <div class="flex items-center justify-center mt-12 px-4">
      <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h2 class="text-3xl font-bold text-gray-900 text-center mb-8">Crea tu cuenta</h2>
        
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nombre completo</label>
            <input v-model="form.name" type="text" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition">
            <p v-if="errors.name" class="text-red-500 text-xs mt-1">{{ errors.name[0] }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input v-model="form.email" type="email" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition">
            <p v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email[0] }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
            <input v-model="form.password" type="password" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition">
            <p v-if="errors.password" class="text-red-500 text-xs mt-1">{{ errors.password[0] }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Confirmar Contraseña</label>
            <input v-model="form.password_confirmation" type="password" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition">
          </div>

          <button type="submit" class="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transform active:scale-95 transition-all shadow-lg shadow-blue-200">
            Registrarse ahora
          </button>
        </form>
      </div>
    </div>
  </div>
</template>