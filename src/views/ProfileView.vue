<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import Navbar from '../components/layout/Navbar.vue';
import Footer from '../components/layout/Footer.vue';
import api from '../services/api.service';
import type { Ticket, User } from '../types';

const user = ref<User | null>(null);
const tickets = ref<Ticket[]>([]);
const loading = ref(true);

const profileForm = ref({ name: '', email: '' });
const passwordForm = ref({ current_password: '', password: '', password_confirmation: '' });

const profileErrors = ref<Record<string, string[]>>({});
const passwordErrors = ref<Record<string, string[]>>({});
const profileSuccess = ref('');
const passwordSuccess = ref('');

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('es-ES');

const totalTickets = computed(() => tickets.value.length);
const totalSpend = computed(() => tickets.value.reduce((sum, t) => sum + Number(t.importe || 0), 0));
const pendingCount = computed(() => tickets.value.filter(t => t.conciliado === 'pendiente').length);

const userInitials = computed(() => {
  if (!user.value) return '?';
  const names = user.value.name.split(' ');
  if (names.length > 1) return (names[0].charAt(0) + names[1].charAt(0)).toUpperCase();
  return user.value.name.substring(0, 2).toUpperCase();
});

const lastTickets = computed(() =>
  [...tickets.value]
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 4)
);

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
    passwordSuccess.value = 'Contraseña actualizada.';
    passwordForm.value = { current_password: '', password: '', password_confirmation: '' };
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
  <div class="min-h-screen bg-black text-white overflow-hidden">
    <!-- Background effects -->
    <div class="fixed inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
    <div class="fixed top-0 left-1/3 w-96 h-96 bg-violet-700 rounded-full blur-3xl opacity-10 pointer-events-none"></div>
    <div class="fixed bottom-1/4 right-1/4 w-72 h-72 bg-purple-600 rounded-full blur-3xl opacity-8 pointer-events-none"></div>

    <Navbar />

    <main class="max-w-6xl mx-auto mt-24 px-4 pb-16">

      <!-- Page header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 animate-fade-in">
        <div>
          <div class="inline-flex items-center gap-2 mb-3 border border-violet-700/40 bg-violet-950/30 px-4 py-1.5 rounded-full">
            <span class="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse"></span>
            <span class="text-violet-300 text-xs font-medium tracking-wide">Cuenta</span>
          </div>
          <h1 class="text-3xl font-bold text-white tracking-tight">Mi perfil</h1>
          <p class="text-gray-500 text-sm mt-1">Gestiona tus datos personales y revisa tu actividad.</p>
        </div>
        <router-link
          to="/welcome"
          class="back-btn inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Volver al inicio
        </router-link>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="panel-card p-12 rounded-2xl text-center">
        <div class="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-500 text-sm">Cargando perfil...</p>
      </div>

      <div v-else class="grid lg:grid-cols-3 gap-6 animate-fade-in">

        <!-- Left column: forms -->
        <section class="lg:col-span-2 space-y-6">

          <!-- Datos personales -->
          <div class="panel-card p-8 rounded-2xl">
            <!-- Avatar + name header -->
            <div class="flex items-center gap-4 mb-7 pb-6 border-b border-white/5">
              <div class="w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-xl font-bold shadow-lg shadow-violet-900/30 shrink-0">
                {{ userInitials }}
              </div>
              <div>
                <p class="text-white font-semibold">{{ user?.name }}</p>
                <p class="text-gray-500 text-sm">{{ user?.email }}</p>
              </div>
            </div>

            <h2 class="section-title mb-5">Datos personales</h2>
            <form @submit.prevent="saveProfile" class="space-y-4">
              <div>
                <label class="field-label">Nombre</label>
                <input v-model="profileForm.name" type="text" class="input-field w-full p-3 rounded-xl outline-none transition-all" />
                <p v-if="profileErrors.name" class="error-msg mt-1.5">{{ profileErrors.name[0] }}</p>
              </div>
              <div>
                <label class="field-label">Correo electrónico</label>
                <input v-model="profileForm.email" type="email" class="input-field w-full p-3 rounded-xl outline-none transition-all" />
                <p v-if="profileErrors.email" class="error-msg mt-1.5">{{ profileErrors.email[0] }}</p>
              </div>
              <div class="flex items-center justify-between pt-1">
                <p v-if="profileSuccess" class="text-xs text-violet-400 font-medium flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                  {{ profileSuccess }}
                </p>
                <button type="submit" class="action-btn ml-auto px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5">
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>

          <!-- Seguridad -->
          <div class="panel-card p-8 rounded-2xl">
            <div class="flex items-center gap-3 mb-5">
              <div class="w-8 h-8 text-violet-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              </div>
              <h2 class="section-title">Seguridad</h2>
            </div>
            <form @submit.prevent="updatePassword" class="space-y-4">
              <div>
                <label class="field-label">Contraseña actual</label>
                <input v-model="passwordForm.current_password" type="password" placeholder="••••••••" class="input-field w-full p-3 rounded-xl outline-none transition-all" />
                <p v-if="passwordErrors.current_password" class="error-msg mt-1.5">{{ passwordErrors.current_password[0] }}</p>
              </div>
              <div>
                <label class="field-label">Nueva contraseña</label>
                <input v-model="passwordForm.password" type="password" placeholder="••••••••" class="input-field w-full p-3 rounded-xl outline-none transition-all" />
                <p v-if="passwordErrors.password" class="error-msg mt-1.5">{{ passwordErrors.password[0] }}</p>
              </div>
              <div>
                <label class="field-label">Confirmar contraseña</label>
                <input v-model="passwordForm.password_confirmation" type="password" placeholder="••••••••" class="input-field w-full p-3 rounded-xl outline-none transition-all" />
              </div>
              <div class="flex items-center justify-between pt-1">
                <p v-if="passwordSuccess" class="text-xs text-violet-400 font-medium flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                  {{ passwordSuccess }}
                </p>
                <button type="submit" class="action-btn ml-auto px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5">
                  Actualizar contraseña
                </button>
              </div>
            </form>
          </div>
        </section>

        <!-- Right column: aside -->
        <aside class="space-y-6">

          <!-- Resumen rápido -->
          <div class="panel-card p-6 rounded-2xl">
            <h3 class="section-title mb-5">Resumen</h3>
            <div class="space-y-3">
              <div class="stat-row flex items-center justify-between p-3 rounded-xl">
                <span class="text-xs text-gray-500">Tickets totales</span>
                <span class="text-sm font-bold text-gradient">{{ totalTickets }}</span>
              </div>
              <div class="stat-row flex items-center justify-between p-3 rounded-xl">
                <span class="text-xs text-gray-500">Gasto total</span>
                <span class="text-sm font-bold text-gradient">{{ formatCurrency(totalSpend) }}</span>
              </div>
              <div class="stat-row flex items-center justify-between p-3 rounded-xl">
                <span class="text-xs text-gray-500">Pendientes</span>
                <span class="text-sm font-bold"
                  :class="pendingCount > 0 ? 'text-yellow-400' : 'text-violet-400'"
                >{{ pendingCount }}</span>
              </div>
            </div>
          </div>

          <!-- Actividad reciente -->
          <div class="panel-card p-6 rounded-2xl">
            <h3 class="section-title mb-5">Actividad reciente</h3>
            <div v-if="lastTickets.length === 0" class="text-xs text-gray-600 py-4 text-center">
              Aún no tienes tickets recientes.
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="ticket in lastTickets"
                :key="ticket.id"
                class="activity-row flex items-center justify-between p-3 rounded-xl"
              >
                <div class="min-w-0 flex-1">
                  <div class="text-sm font-medium text-white truncate">{{ ticket.gasto }}</div>
                  <div class="text-xs text-gray-600 mt-0.5">{{ formatDate(ticket.fecha) }}</div>
                </div>
                <div class="text-sm font-semibold text-white ml-3 shrink-0">{{ formatCurrency(Number(ticket.importe)) }}</div>
              </div>
            </div>
            <router-link
              to="/tickets"
              class="mt-4 flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors"
            >
              Ver todos los tickets
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </router-link>
          </div>
        </aside>

      </div>
    </main>

    <Footer />
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

* { font-family: 'DM Sans', sans-serif; }
h1, h2, h3 { font-family: 'Syne', sans-serif; }

.bg-grid-pattern {
  background-image:
    linear-gradient(rgba(139, 92, 246, 0.15) 1px, transparent 1px),
    linear-gradient(90deg, rgba(139, 92, 246, 0.15) 1px, transparent 1px);
  background-size: 60px 60px;
}

.text-gradient {
  background: linear-gradient(135deg, #a78bfa 0%, #7c3aed 50%, #c4b5fd 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.panel-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(139, 92, 246, 0.12);
  backdrop-filter: blur(16px);
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: white;
  letter-spacing: -0.01em;
}

.field-label {
  display: block;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.3);
  margin-bottom: 0.5rem;
}

.input-field {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: white;
  font-size: 0.875rem;
}
.input-field:focus {
  border-color: rgba(139, 92, 246, 0.5);
  background: rgba(124, 58, 237, 0.05);
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}
.input-field::placeholder { color: rgba(255, 255, 255, 0.2); }

.error-msg {
  font-size: 0.7rem;
  color: #f87171;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.action-btn {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(124, 58, 237, 0.25);
}
.action-btn:hover {
  box-shadow: 0 6px 24px rgba(124, 58, 237, 0.4);
}

.back-btn {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.5);
}
.back-btn:hover {
  background: rgba(124, 58, 237, 0.08);
  border-color: rgba(139, 92, 246, 0.3);
  color: rgba(255, 255, 255, 0.8);
}

.stat-row {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.activity-row {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  transition: all 0.2s;
}
.activity-row:hover {
  background: rgba(124, 58, 237, 0.06);
  border-color: rgba(139, 92, 246, 0.2);
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-in { animation: fade-in 0.7s ease-out; }

html { scroll-behavior: smooth; }
</style>