<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import Navbar from '../components/layout/Navbar.vue';
import api from '../services/api.service';
import type { Ticket, User } from '../types';

const user = ref<User | null>(null);
const tickets = ref<Ticket[]>([]);
const loading = ref(true);

const profileForm = ref({
  name: '',
  email: ''
});

const passwordForm = ref({
  current_password: '',
  password: '',
  password_confirmation: ''
});

const profileErrors = ref<Record<string, string[]>>({});
const passwordErrors = ref<Record<string, string[]>>({});
const profileSuccess = ref('');
const passwordSuccess = ref('');

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
};

const formatDate = (value: string) => {
  return new Date(value).toLocaleDateString('es-ES');
};

const totalTickets = computed(() => tickets.value.length);
const totalSpend = computed(() => tickets.value.reduce((sum, t) => sum + Number(t.importe || 0), 0));
const pendingCount = computed(() => tickets.value.filter(t => t.conciliado === 'pendiente').length);

const lastTickets = computed(() => {
  return [...tickets.value]
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 4);
});

const saveProfile = async () => {
  profileErrors.value = {};
  profileSuccess.value = '';
  try {
    await api.put('/api/profile', profileForm.value);
    profileSuccess.value = 'Perfil actualizado correctamente.';
  } catch (error: any) {
    profileErrors.value = error?.response?.data?.errors ?? {};
  }
};

const updatePassword = async () => {
  passwordErrors.value = {};
  passwordSuccess.value = '';
  try {
    await api.post('/api/profile/change-password', {
      current_password: passwordForm.value.current_password,
      new_password: passwordForm.value.password,
      new_password_confirmation: passwordForm.value.password_confirmation,
    });
    passwordSuccess.value = 'Contrasena actualizada.';
    passwordForm.value = {
      current_password: '',
      password: '',
      password_confirmation: ''
    };
  } catch (error: any) {
    passwordErrors.value = error?.response?.data?.errors ?? {};
  }
};

onMounted(async () => {
  try {
    const [userResponse, ticketsResponse] = await Promise.all([
      api.get('/api/profile'),
      api.get('/api/tickets')
    ]);
    user.value = userResponse.data;
    profileForm.value = {
      name: userResponse.data?.name ?? '',
      email: userResponse.data?.email ?? ''
    };
    tickets.value = ticketsResponse.data?.data || [];
  } catch (error) {
    console.error('Error al cargar el perfil', error);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />

    <main class="max-w-6xl mx-auto mt-12 px-4 pb-12">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Mi perfil</h1>
          <p class="text-gray-500">Gestiona tus datos personales y revisa tu actividad.</p>
        </div>
        <router-link
          to="/welcome"
          class="inline-flex items-center justify-center px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
        >
          Volver al inicio
        </router-link>
      </div>

      <div v-if="loading" class="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
        <div class="animate-spin text-4xl mb-4">🌀</div>
        <p class="text-gray-500 font-medium">Cargando perfil...</p>
      </div>

      <div v-else class="grid lg:grid-cols-3 gap-6">
        <section class="lg:col-span-2 space-y-6">
          <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 class="text-xl font-bold text-gray-900 mb-6">Datos personales</h2>
            <form @submit.prevent="saveProfile" class="space-y-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Nombre</label>
                <input
                  v-model="profileForm.name"
                  type="text"
                  class="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                >
                <p v-if="profileErrors.name" class="text-red-500 text-xs mt-1">{{ profileErrors.name[0] }}</p>
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Correo</label>
                <input
                  v-model="profileForm.email"
                  type="email"
                  class="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                >
                <p v-if="profileErrors.email" class="text-red-500 text-xs mt-1">{{ profileErrors.email[0] }}</p>
              </div>
              <div class="flex items-center justify-between">
                <p v-if="profileSuccess" class="text-sm text-green-600 font-semibold">{{ profileSuccess }}</p>
                <button
                  type="submit"
                  class="ml-auto px-6 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition"
                >
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>

          <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 class="text-xl font-bold text-gray-900 mb-6">Seguridad</h2>
            <form @submit.prevent="updatePassword" class="space-y-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Contrasena actual</label>
                <input
                  v-model="passwordForm.current_password"
                  type="password"
                  class="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                >
                <p v-if="passwordErrors.current_password" class="text-red-500 text-xs mt-1">{{ passwordErrors.current_password[0] }}</p>
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Nueva contrasena</label>
                <input
                  v-model="passwordForm.password"
                  type="password"
                  class="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                >
                <p v-if="passwordErrors.password" class="text-red-500 text-xs mt-1">{{ passwordErrors.password[0] }}</p>
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Confirmar contrasena</label>
                <input
                  v-model="passwordForm.password_confirmation"
                  type="password"
                  class="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                >
              </div>
              <div class="flex items-center justify-between">
                <p v-if="passwordSuccess" class="text-sm text-green-600 font-semibold">{{ passwordSuccess }}</p>
                <button
                  type="submit"
                  class="ml-auto px-6 py-2 bg-gray-900 text-white font-semibold rounded-xl hover:bg-black transition"
                >
                  Actualizar contrasena
                </button>
              </div>
            </form>
          </div>
        </section>

        <aside class="space-y-6">
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Resumen rapido</h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-500">Tickets totales</span>
                <span class="font-semibold text-gray-900">{{ totalTickets }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-500">Gasto total</span>
                <span class="font-semibold text-gray-900">{{ formatCurrency(totalSpend) }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-500">Pendientes</span>
                <span class="font-semibold text-gray-900">{{ pendingCount }}</span>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Actividad reciente</h3>
            <div v-if="lastTickets.length === 0" class="text-sm text-gray-500">
              Aun no tienes tickets recientes.
            </div>
            <div v-else class="space-y-4">
              <div v-for="ticket in lastTickets" :key="ticket.id" class="flex items-center justify-between">
                <div>
                  <div class="font-semibold text-gray-900 text-sm">{{ ticket.gasto }}</div>
                  <div class="text-xs text-gray-400">{{ formatDate(ticket.fecha) }}</div>
                </div>
                <div class="text-sm font-semibold text-gray-900">{{ formatCurrency(Number(ticket.importe)) }}</div>
              </div>
            </div>
            <router-link to="/tickets" class="text-blue-600 text-sm font-semibold hover:underline mt-4 inline-block">
              Ver todos los tickets
            </router-link>
          </div>
        </aside>
      </div>
    </main>
  </div>
</template>
