<script setup>
import { ref } from 'vue';
import Navbar from '../components/layout/Navbar.vue';

const form = ref({
  email: '',
  password: '',
  remember: false
});

const handleLogin = () => {
  console.log("Intentando iniciar sesión en Laravel:", form.value);
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />
    
    <div class="flex items-center justify-center mt-16 px-4">
      <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div class="text-center mb-10">
          <h2 class="text-3xl font-bold text-gray-900">Bienvenido de nuevo</h2>
          <p class="text-gray-500 mt-2">Introduce tus credenciales para entrar</p>
        </div>
        
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
            <input 
              v-model="form.email" 
              type="email" 
              required
              class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" 
              placeholder="tu@email.com"
            >
          </div>

          <div>
            <div class="flex justify-between mb-2">
              <label class="block text-sm font-medium text-gray-700">Contraseña</label>
              <a href="#" class="text-sm text-blue-600 hover:underline">¿Olvidaste tu contraseña?</a>
            </div>
            <input 
              v-model="form.password" 
              type="password" 
              required
              class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" 
              placeholder="••••••••"
            >
          </div>

          <div class="flex items-center">
            <input 
              v-model="form.remember" 
              id="remember" 
              type="checkbox" 
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            >
            <label for="remember" class="ml-2 block text-sm text-gray-700">
              Recordar sesión
            </label>
          </div>

          <button 
            type="submit" 
            class="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transform active:scale-95 transition-all shadow-lg shadow-blue-200"
          >
            Entrar
          </button>
        </form>

        <div class="mt-8 text-center">
          <p class="text-sm text-gray-600">
            ¿No tienes cuenta? 
            <router-link to="/register" class="text-blue-600 font-bold hover:underline">
              Regístrate aquí
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>