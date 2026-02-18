<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import Navbar from '../components/layout/Navbar.vue';
import api from '../services/api.service';
import type { Ticket, User } from '../types';

const user = ref<User | null>(null);
const loading = ref(true);
const showConfetti = ref(false);
const tickets = ref<Ticket[]>([]);

const quickStats = ref([
  { label: 'Tickets este mes', value: 0, target: 0, icon: '🎫', color: 'blue' },
  { label: 'Gastado', value: 0, target: 0, prefix: '€', icon: '💰', color: 'purple' },
  { label: 'Categorías activas', value: 0, target: 0, icon: '🏷️', color: 'green' }
]);

const quickActions = [
  {
    title: 'Nuevo Ticket',
    description: 'Registra un gasto',
    icon: '➕',
    color: 'from-blue-500 to-blue-600',
    route: '/tickets/create'
  },
  {
    title: 'Mis Tickets',
    description: 'Ver todos los tickets',
    icon: '📋',
    color: 'from-purple-500 to-purple-600',
    route: '/tickets'
  },
  {
    title: 'Estadísticas',
    description: 'Análisis y reportes',
    icon: '📊',
    color: 'from-green-500 to-green-600',
    route: '/stats'
  },
  {
    title: 'Módulos',
    description: 'Nuevas funciones',
    icon: '🧩',
    color: 'from-orange-500 to-orange-600',
    route: '/operations'
  }
];

const formatRelativeDate = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'Ahora mismo';
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
  if (diffHours < 24) return `Hace ${diffHours} horas`;
  if (diffDays === 1) return 'Ayer';
  return `Hace ${diffDays} días`;
};

const recentActivity = computed(() => {
  return [...tickets.value]
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 3)
    .map(ticket => ({
      type: ticket.gasto,
      amount: Number(ticket.importe),
      date: formatRelativeDate(ticket.fecha),
      status: ticket.conciliado
    }));
});

const userInitials = computed(() => {
  if (!user.value) return '?';
  const names = user.value.name.split(' ');
  if (names.length > 1) {
    return (names[0].charAt(0) + names[1].charAt(0)).toUpperCase();
  }
  return user.value.name.substring(0, 2).toUpperCase();
});

const greetingMessage = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return '¡Buenos días';
  if (hour < 20) return '¡Buenas tardes';
  return '¡Buenas noches';
});


const animateCounter = (index: number, duration = 1500) => {
  const stat = quickStats.value[index];
  if (stat.target <= 0) {
    stat.value = 0;
    return;
  }

  const increment = stat.target / (duration / 16);
  const timer = setInterval(() => {
    stat.value += increment;
    if (stat.value >= stat.target) {
      stat.value = stat.target;
      clearInterval(timer);
    }
  }, 16);
};

const computeStats = () => {
  const now = new Date();
  const isSameMonth = (date: Date) => (
    date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
  );

  const monthlyTickets = tickets.value.filter(ticket => isSameMonth(new Date(ticket.fecha)));
  const spentThisMonth = monthlyTickets.reduce((total, ticket) => total + Number(ticket.importe || 0), 0);
  const activeCategories = new Set(tickets.value.map(ticket => ticket.categoria));

  quickStats.value = [
    { label: 'Tickets este mes', value: 0, target: monthlyTickets.length, icon: '🎫', color: 'blue' },
    { label: 'Gastado', value: 0, target: Math.round(spentThisMonth), prefix: '€', icon: '💰', color: 'purple' },
    { label: 'Categorías activas', value: 0, target: activeCategories.size, icon: '🏷️', color: 'green' }
  ];
};

onMounted(async () => {
  try {
    const [userResponse, ticketsResponse] = await Promise.all([
      api.get('/api/user'),
      api.get('/api/tickets')
    ]);
    user.value = userResponse.data;
    tickets.value = ticketsResponse.data?.data || [];
    
    showConfetti.value = true;
    setTimeout(() => showConfetti.value = false, 3000);

    computeStats();
    
    setTimeout(() => {
      quickStats.value.forEach((_, index) => {
        setTimeout(() => animateCounter(index), index * 150);
      });
    }, 300);
    
  } catch (error) {
    console.error("No se pudo obtener el usuario", error);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
    <Navbar />

    <main class="max-w-7xl mx-auto mt-16 px-4 pb-16">
      <!-- Loading State -->
      <div v-if="loading" class="animate-pulse max-w-4xl mx-auto">
        <div class="h-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-3xl mb-8"></div>
        <div class="grid md:grid-cols-3 gap-6">
          <div v-for="i in 3" :key="i" class="h-40 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl"></div>
        </div>
      </div>

      <!-- Welcome Section -->
      <div v-else-if="user" class="animate-fade-in">
        <!-- Hero Card -->
        <div class="relative bg-white/90 backdrop-blur-sm p-12 rounded-3xl shadow-2xl border border-gray-100 mb-12 overflow-hidden">
          <!-- Decorative Background -->
          <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl -z-10"></div>
          <div class="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-pink-400/20 to-yellow-400/20 rounded-full blur-3xl -z-10"></div>
          
          <!-- Confetti Effect -->
          <div v-if="showConfetti" class="absolute inset-0 pointer-events-none">
            <div class="confetti">🎉</div>
            <div class="confetti" style="left: 20%; animation-delay: 0.2s">✨</div>
            <div class="confetti" style="left: 40%; animation-delay: 0.4s">🎊</div>
            <div class="confetti" style="left: 60%; animation-delay: 0.6s">⭐</div>
            <div class="confetti" style="left: 80%; animation-delay: 0.8s">💫</div>
          </div>

          <div class="text-center relative z-10">
            <!-- Avatar -->
            <div class="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full mb-6 shadow-xl transform hover:scale-110 transition-all duration-300 animate-bounce-subtle">
              <span class="text-4xl font-bold">{{ userInitials }}</span>
            </div>
            
            <div class="mb-2">
              <span class="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold">
                ✓ Sesión activa
              </span>
            </div>
            
            <h1 class="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4 mt-6">
              {{ greetingMessage }}, 
              <span class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {{ user.name }}
              </span>!
            </h1>
            
            <p class="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Has iniciado sesión correctamente en <strong class="text-blue-600">TicketManager</strong>. 
              Gestiona todos tus tickets y gastos desde un solo lugar.
            </p>

            <!-- Quick Actions Grid -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <router-link 
                v-for="(action, index) in quickActions" 
                :key="index"
                :to="action.route"
                class="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 transform hover:-translate-y-2 transition-all duration-300"
                :style="{ animationDelay: `${index * 100}ms` }"
              >
                <div class="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {{ action.icon }}
                </div>
                <h3 class="font-bold text-gray-900 mb-1">{{ action.title }}</h3>
                <p class="text-xs text-gray-500">{{ action.description }}</p>
              </router-link>
            </div>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid md:grid-cols-3 gap-6 mb-12">
          <div 
            v-for="(stat, index) in quickStats" 
            :key="index"
            class="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-100 transform hover:scale-105 transition-all duration-300"
            :style="{ animationDelay: `${index * 100}ms` }"
          >
            <div class="flex items-center justify-between mb-4">
              <span class="text-4xl">{{ stat.icon }}</span>
              <div 
                class="w-12 h-12 rounded-full flex items-center justify-center"
                :class="{
                  'bg-blue-100': stat.color === 'blue',
                  'bg-purple-100': stat.color === 'purple',
                  'bg-green-100': stat.color === 'green'
                }"
              >
                <div 
                  class="w-2 h-2 rounded-full animate-pulse"
                  :class="{
                    'bg-blue-600': stat.color === 'blue',
                    'bg-purple-600': stat.color === 'purple',
                    'bg-green-600': stat.color === 'green'
                  }"
                ></div>
              </div>
            </div>
            <div class="text-4xl font-bold mb-2"
              :class="{
                'text-blue-600': stat.color === 'blue',
                'text-purple-600': stat.color === 'purple',
                'text-green-600': stat.color === 'green'
              }"
            >
              {{ stat.prefix || '' }}{{ Math.floor(stat.value).toLocaleString() }}
            </div>
            <div class="text-gray-600 font-medium">{{ stat.label }}</div>
          </div>
        </div>

        <!-- Recent Activity & Tips -->
        <div class="grid md:grid-cols-2 gap-6">
          <!-- Recent Activity -->
          <div class="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-100">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold text-gray-900">📌 Actividad Reciente</h2>
              <router-link to="/tickets" class="text-blue-600 font-semibold text-sm hover:underline">
                Ver todo →
              </router-link>
            </div>
            
            <div class="space-y-4">
              <div 
                v-for="(activity, index) in recentActivity" 
                :key="index"
                class="group flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300 cursor-pointer"
              >
                <div class="flex-1">
                  <div class="font-semibold text-gray-900 mb-1">{{ activity.type }}</div>
                  <div class="text-sm text-gray-500">{{ activity.date }}</div>
                </div>
                <div class="text-right">
                  <div class="text-xl font-bold text-gray-900 mb-1">€{{ activity.amount }}</div>
                  <span 
                    class="text-xs px-2 py-1 rounded-full font-semibold"
                    :class="activity.status === 'terminado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'"
                  >
                    {{ activity.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Tips & Insights -->
          <div class="bg-gradient-to-br from-blue-500 to-purple-600 p-8 rounded-2xl shadow-lg text-white">
            <h2 class="text-2xl font-bold mb-6 flex items-center">
              <span class="mr-2">💡</span>
              Consejos y Ayuda
            </h2>
            
            <div class="space-y-4">
              <div class="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div class="font-semibold mb-2">🎯 Organiza por categorías</div>
                <p class="text-sm opacity-90">Clasifica tus gastos para un mejor control y análisis mensual.</p>
              </div>
              
              <div class="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div class="font-semibold mb-2">⚡ Concilia regularmente</div>
                <p class="text-sm opacity-90">Marca tus tickets como terminados para mantener tus cuentas al día.</p>
              </div>
              
              <div class="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div class="font-semibold mb-2">📊 Revisa tus estadísticas</div>
                <p class="text-sm opacity-90">Analiza tus patrones de gasto y optimiza tu presupuesto.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce-subtle {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes confetti-fall {
  0% {
    transform: translateY(-100%) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}

.animate-fade-in {
  animation: fade-in 0.8s ease-out;
}

.animate-bounce-subtle {
  animation: bounce-subtle 2s ease-in-out infinite;
}

.confetti {
  position: absolute;
  top: -50px;
  font-size: 2rem;
  animation: confetti-fall 3s ease-out forwards;
}

/* Smooth scroll */
html {
  scroll-behavior: smooth;
}

/* Custom transitions */
.group:hover .group-hover\:scale-110 {
  transform: scale(1.1);
}

/* Gradient animation */
@keyframes gradient-shift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.bg-gradient-to-br {
  background-size: 200% 200%;
  animation: gradient-shift 5s ease infinite;
}
</style>