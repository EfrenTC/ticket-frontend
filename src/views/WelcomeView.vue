<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import Navbar from '../components/layout/Navbar.vue';
import Footer from '../components/layout/Footer.vue';
import api from '../services/api.service';
import type { Ticket, User } from '../types';

const user = ref<User | null>(null);
const loading = ref(true);
const tickets = ref<Ticket[]>([]);

const quickStats = ref([
  { label: 'Tickets este mes', value: 0, target: 0, prefix: '', color: 'blue' },
  { label: 'Gastado', value: 0, target: 0, prefix: '€', color: 'purple' },
  { label: 'Categorías activas', value: 0, target: 0, prefix: '', color: 'green' }
]);

const quickActions = [
  {
    title: 'Nuevo Ticket',
    description: 'Registra un gasto',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>`,
    route: '/tickets/create'
  },
  {
    title: 'Mis Tickets',
    description: 'Ver todos los tickets',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" /></svg>`,
    route: '/tickets'
  },
  {
    title: 'Estadísticas',
    description: 'Análisis y reportes',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>`,
    route: '/stats'
  },
  {
    title: 'Módulos',
    description: 'Nuevas funciones',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" /></svg>`,
    route: '/operations'
  }
];

const statIcons = [
  `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" /></svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M14.25 7.756a4.5 4.5 0 1 0 0 8.488M7.5 10.5h5.25m-5.25 3h5.25M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6Z" /></svg>`
];

const tipsIcons = [
  `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" /></svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>`
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
  if (names.length > 1) return (names[0].charAt(0) + names[1].charAt(0)).toUpperCase();
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
  if (stat.target <= 0) { stat.value = 0; return; }
  const increment = stat.target / (duration / 16);
  const timer = setInterval(() => {
    stat.value += increment;
    if (stat.value >= stat.target) { stat.value = stat.target; clearInterval(timer); }
  }, 16);
};

const computeStats = () => {
  const now = new Date();
  const isSameMonth = (date: Date) =>
    date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();

  const monthlyTickets = tickets.value.filter(t => isSameMonth(new Date(t.fecha)));
  const spentThisMonth = monthlyTickets.reduce((total, t) => total + Number(t.importe || 0), 0);
  const activeCategories = new Set(tickets.value.map(t => t.categoria));

  quickStats.value = [
    { label: 'Tickets este mes', value: 0, target: monthlyTickets.length, prefix: '', color: 'blue' },
    { label: 'Gastado', value: 0, target: Math.round(spentThisMonth), prefix: '€', color: 'purple' },
    { label: 'Categorías activas', value: 0, target: activeCategories.size, prefix: '', color: 'green' }
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
  <div class="min-h-screen bg-black text-white overflow-hidden">
    <!-- Background effects -->
    <div class="fixed inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
    <div class="fixed top-0 left-1/4 w-96 h-96 bg-violet-700 rounded-full blur-3xl opacity-10 pointer-events-none"></div>
    <div class="fixed bottom-1/3 right-1/4 w-80 h-80 bg-purple-600 rounded-full blur-3xl opacity-10 pointer-events-none"></div>

    <Navbar />

    <main class="max-w-7xl mx-auto mt-16 px-4 pb-16">

      <!-- Loading State -->
      <div v-if="loading" class="animate-pulse max-w-4xl mx-auto space-y-6 pt-8">
        <div class="h-32 bg-white/5 rounded-3xl"></div>
        <div class="grid md:grid-cols-3 gap-6">
          <div v-for="i in 3" :key="i" class="h-40 bg-white/5 rounded-2xl"></div>
        </div>
      </div>

      <!-- Main Content -->
      <div v-else-if="user" class="animate-fade-in pt-8">

        <!-- Hero Card -->
        <div class="hero-card relative p-10 rounded-3xl mb-10 overflow-hidden">
          <!-- Inner glow -->
          <div class="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>
          <div class="absolute bottom-0 left-0 w-80 h-80 bg-purple-700/10 rounded-full blur-3xl pointer-events-none"></div>

          <div class="text-center relative z-10">
            <!-- Avatar -->
            <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-violet-600 to-purple-700 text-white rounded-full mb-5 shadow-lg shadow-violet-900/40 animate-bounce-subtle">
              <span class="text-3xl font-bold" style="font-family: 'Syne', sans-serif;">{{ userInitials }}</span>
            </div>

            <!-- Session badge -->
            <div class="mb-4">
              <span class="inline-flex items-center gap-1.5 border border-violet-700/40 bg-violet-950/30 px-4 py-1.5 rounded-full text-xs font-medium text-violet-300">
                <span class="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse"></span>
                Sesión activa
              </span>
            </div>

            <h1 class="text-4xl md:text-5xl font-extrabold text-white mb-3 mt-2 tracking-tight">
              {{ greetingMessage }},
              <span class="text-gradient"> {{ user.name }}</span>!
            </h1>

            <p class="text-gray-400 mb-10 max-w-xl mx-auto text-base leading-relaxed">
              Bienvenido a <span class="text-violet-300 font-semibold">TicketManager</span>.
              Gestiona todos tus tickets y gastos desde un solo lugar.
            </p>

            <!-- Quick Actions -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <router-link
                v-for="(action, index) in quickActions"
                :key="index"
                :to="action.route"
                class="group action-card p-5 rounded-2xl transform hover:-translate-y-2 transition-all duration-300"
              >
                <div class="w-8 h-8 mx-auto mb-3 text-violet-400 group-hover:text-violet-300 group-hover:scale-110 transition-all duration-300" v-html="action.svg"></div>
                <h3 class="font-bold text-white text-sm mb-0.5">{{ action.title }}</h3>
                <p class="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">{{ action.description }}</p>
              </router-link>
            </div>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid md:grid-cols-3 gap-6 mb-8">
          <div
            v-for="(stat, index) in quickStats"
            :key="index"
            class="stat-card p-7 rounded-2xl transform hover:scale-105 transition-all duration-300"
          >
            <div class="flex items-center justify-between mb-5">
              <div class="w-10 h-10 text-violet-400" v-html="statIcons[index]"></div>
              <div class="w-2 h-2 rounded-full animate-pulse"
                :class="{
                  'bg-violet-400': stat.color === 'blue',
                  'bg-purple-400': stat.color === 'purple',
                  'bg-violet-300': stat.color === 'green'
                }"
              ></div>
            </div>
            <div class="text-4xl font-bold text-gradient mb-1">
              {{ stat.prefix }}{{ Math.floor(stat.value).toLocaleString() }}
            </div>
            <div class="text-gray-500 text-sm font-medium">{{ stat.label }}</div>
          </div>
        </div>

        <!-- Activity & Tips -->
        <div class="grid md:grid-cols-2 gap-6">

          <!-- Recent Activity -->
          <div class="panel-card p-7 rounded-2xl">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-bold text-white tracking-tight">Actividad Reciente</h2>
              <router-link to="/tickets" class="text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors flex items-center gap-1">
                Ver todo <span>→</span>
              </router-link>
            </div>

            <div class="space-y-3">
              <div
                v-for="(activity, index) in recentActivity"
                :key="index"
                class="activity-row flex items-center justify-between p-4 rounded-xl transition-all duration-300 cursor-pointer"
              >
                <div class="flex-1">
                  <div class="font-semibold text-white text-sm mb-0.5">{{ activity.type }}</div>
                  <div class="text-xs text-gray-600">{{ activity.date }}</div>
                </div>
                <div class="text-right">
                  <div class="text-lg font-bold text-white mb-1">€{{ activity.amount }}</div>
                  <span
                    class="text-xs px-2.5 py-1 rounded-full font-medium"
                    :class="activity.status === 'terminado'
                      ? 'bg-violet-900/50 text-violet-300 border border-violet-700/30'
                      : 'bg-yellow-900/30 text-yellow-400 border border-yellow-700/30'"
                  >
                    {{ activity.status }}
                  </span>
                </div>
              </div>

              <!-- Empty state -->
              <div v-if="recentActivity.length === 0" class="text-center py-8 text-gray-600 text-sm">
                No hay actividad reciente
              </div>
            </div>
          </div>

          <!-- Tips -->
          <div class="tips-card p-7 rounded-2xl">
            <h2 class="text-xl font-bold text-white tracking-tight mb-6">Consejos</h2>

            <div class="space-y-3">
              <div
                v-for="(tip, i) in [
                  { title: 'Organiza por categorías', desc: 'Clasifica tus gastos para un mejor control y análisis mensual.' },
                  { title: 'Concilia regularmente', desc: 'Marca tus tickets como terminados para mantener tus cuentas al día.' },
                  { title: 'Revisa tus estadísticas', desc: 'Analiza tus patrones de gasto y optimiza tu presupuesto.' }
                ]"
                :key="i"
                class="tip-row p-4 rounded-xl border border-violet-700/20 hover:border-violet-600/40 hover:bg-violet-950/20 transition-all duration-300"
              >
                <div class="flex items-start gap-3">
                  <div class="w-5 h-5 text-violet-400 mt-0.5 shrink-0" v-html="tipsIcons[i]"></div>
                  <div>
                    <div class="font-semibold text-white text-sm mb-1">{{ tip.title }}</div>
                    <p class="text-xs text-gray-500 leading-relaxed">{{ tip.desc }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

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

.hero-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(139, 92, 246, 0.15);
  backdrop-filter: blur(16px);
}

.action-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
}
.action-card:hover {
  background: rgba(124, 58, 237, 0.08);
  border-color: rgba(139, 92, 246, 0.3);
}

.stat-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(139, 92, 246, 0.12);
}

.panel-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.tips-card {
  background: rgba(124, 58, 237, 0.04);
  border: 1px solid rgba(139, 92, 246, 0.15);
}

.activity-row {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
}
.activity-row:hover {
  background: rgba(124, 58, 237, 0.06);
  border-color: rgba(139, 92, 246, 0.2);
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes bounce-subtle {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-8px); }
}

.animate-fade-in    { animation: fade-in 0.8s ease-out; }
.animate-bounce-subtle { animation: bounce-subtle 3s ease-in-out infinite; }

html { scroll-behavior: smooth; }
</style>