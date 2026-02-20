<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '../composables/useAuth';
import Navbar from '../components/layout/Navbar.vue'; 
import Footer from '../components/layout/Footer.vue';
import type { LoginPayload } from '../types';

const { login, errors } = useAuth();

const form = ref<LoginPayload>({
  email: '',
  password: '',
  remember: false
});

const handleLogin = async () => {
  await login(form.value);
};
</script>

<template>
  <div class="min-h-screen bg-black text-white overflow-hidden">
    <!-- Background effects -->
    <div class="fixed inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
    <div class="fixed top-0 left-1/3 w-96 h-96 bg-violet-700 rounded-full blur-3xl opacity-10 pointer-events-none"></div>
    <div class="fixed bottom-1/4 right-1/4 w-72 h-72 bg-purple-600 rounded-full blur-3xl opacity-8 pointer-events-none"></div>

    <Navbar />

    <div class="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
      <div class="login-card max-w-md w-full rounded-2xl p-8 animate-fade-in">

        <!-- Header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center gap-2 mb-5 border border-violet-700/40 bg-violet-950/30 px-4 py-1.5 rounded-full">
            <span class="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse"></span>
            <span class="text-violet-300 text-xs font-medium tracking-wide">Acceso seguro</span>
          </div>
          <h2 class="text-3xl font-bold text-white tracking-tight">Iniciar Sesión</h2>
          <p class="text-gray-500 text-sm mt-2">Introduce tus credenciales para continuar</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-5">
          <!-- Email -->
          <div>
            <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="tu@email.com"
              class="input-field w-full px-4 py-3 rounded-xl text-white placeholder-gray-600 outline-none transition-all duration-200"
            />
            <p v-if="errors.email" class="text-red-400 text-xs mt-1.5 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" /></svg>
              {{ errors.email[0] }}
            </p>
          </div>

          <!-- Password -->
          <div>
            <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Contraseña</label>
            <input
              v-model="form.password"
              type="password"
              placeholder="••••••••"
              class="input-field w-full px-4 py-3 rounded-xl text-white placeholder-gray-600 outline-none transition-all duration-200"
            />
          </div>

          <!-- Submit -->
          <button
            type="submit"
            class="submit-btn w-full text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 mt-2"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>

    <Footer />
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

* { font-family: 'DM Sans', sans-serif; }
h2 { font-family: 'Syne', sans-serif; }

.bg-grid-pattern {
  background-image:
    linear-gradient(rgba(139, 92, 246, 0.15) 1px, transparent 1px),
    linear-gradient(90deg, rgba(139, 92, 246, 0.15) 1px, transparent 1px);
  background-size: 60px 60px;
}

.login-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(139, 92, 246, 0.15);
  backdrop-filter: blur(16px);
}

.input-field {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: white;
}

.input-field:focus {
  border-color: rgba(139, 92, 246, 0.5);
  background: rgba(124, 58, 237, 0.05);
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}

.input-field::placeholder {
  color: rgba(255, 255, 255, 0.2);
}

.submit-btn {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  box-shadow: 0 4px 24px rgba(124, 58, 237, 0.3);
}

.submit-btn:hover {
  box-shadow: 0 8px 32px rgba(124, 58, 237, 0.45);
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

.animate-fade-in { animation: fade-in 0.7s ease-out; }

html { scroll-behavior: smooth; }
</style>