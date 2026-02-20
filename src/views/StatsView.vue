<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import Navbar from '../components/layout/Navbar.vue';
import Footer from '../components/layout/Footer.vue';
import api from '../services/api.service';
import type { Ticket } from '../types';

const tickets = ref<Ticket[]>([]);
const loading = ref(true);

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('es-ES');

const totalTickets = computed(() => tickets.value.length);
const totalSpend = computed(() => tickets.value.reduce((sum, t) => sum + Number(t.importe || 0), 0));
const pendingCount = computed(() => tickets.value.filter(t => t.conciliado === 'pendiente').length);
const finishedCount = computed(() => tickets.value.filter(t => t.conciliado === 'terminado').length);

const monthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const monthlyTickets = computed(() => {
  const key = monthKey(new Date());
  return tickets.value.filter(t => monthKey(new Date(t.fecha)) === key);
});

const monthlySpend = computed(() =>
  monthlyTickets.value.reduce((sum, t) => sum + Number(t.importe || 0), 0)
);

const averageTicket = computed(() =>
  tickets.value.length === 0 ? 0 : totalSpend.value / tickets.value.length
);

const categoriesSummary = computed(() => {
  const map = new Map<string, { total: number; count: number }>();
  tickets.value.forEach(ticket => {
    const current = map.get(ticket.categoria) || { total: 0, count: 0 };
    current.total += Number(ticket.importe || 0);
    current.count += 1;
    map.set(ticket.categoria, current);
  });
  return Array.from(map.entries())
    .map(([name, data]) => ({ name, total: data.total, count: data.count }))
    .sort((a, b) => b.total - a.total);
});

const paymentSummary = computed(() => {
  const map = new Map<string, number>();
  tickets.value.forEach(ticket => {
    map.set(ticket.metodo_pago, (map.get(ticket.metodo_pago) || 0) + 1);
  });
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
});

const lastTickets = computed(() =>
  [...tickets.value]
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 5)
);

const lastTwelveMonths = computed(() => {
  const now = new Date();
  const months = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (11 - index), 1);
    const key = monthKey(date);
    const label = date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
    return { key, label, total: 0 };
  });
  const totals = new Map<string, number>();
  tickets.value.forEach(ticket => {
    const key = monthKey(new Date(ticket.fecha));
    totals.set(key, (totals.get(key) || 0) + Number(ticket.importe || 0));
  });
  return months.map(month => ({ ...month, total: totals.get(month.key) || 0 }));
});

const maxMonthlyTotal = computed(() =>
  Math.max(1, ...lastTwelveMonths.value.map(item => item.total))
);

const maxCategoryTotal = computed(() =>
  Math.max(1, ...categoriesSummary.value.map(c => c.total))
);

const maxPaymentCount = computed(() =>
  Math.max(1, ...paymentSummary.value.map(p => p.count))
);

onMounted(async () => {
  try {
    const response = await api.get('/api/tickets');
    tickets.value = response.data?.data || [];
  } catch (error) {
    console.error('Error al obtener tickets', error);
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

    <main class="max-w-7xl mx-auto mt-24 px-4 pb-16">

      <!-- Page header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 animate-fade-in">
        <div>
          <div class="inline-flex items-center gap-2 mb-3 border border-violet-700/40 bg-violet-950/30 px-4 py-1.5 rounded-full">
            <span class="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse"></span>
            <span class="text-violet-300 text-xs font-medium tracking-wide">Análisis</span>
          </div>
          <h1 class="text-3xl font-bold text-white tracking-tight">Estadísticas</h1>
          <p class="text-gray-500 text-sm mt-1">Análisis de gastos, tickets y tendencias recientes.</p>
        </div>
        <router-link
          to="/tickets"
          class="back-btn inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
          </svg>
          Ver tickets
        </router-link>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="panel-card p-12 rounded-2xl text-center">
        <div class="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-500 text-sm">Cargando estadísticas...</p>
      </div>

      <!-- Empty state -->
      <div v-else-if="tickets.length === 0" class="panel-card p-16 rounded-2xl text-center">
        <div class="w-16 h-16 mx-auto mb-5 text-violet-800">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
        </div>
        <p class="text-gray-500 text-lg font-medium mb-3">No hay tickets para mostrar.</p>
        <router-link to="/tickets/create" class="text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors">
          Crea tu primer ticket →
        </router-link>
      </div>

      <!-- Stats content -->
      <div v-else class="space-y-6 animate-fade-in">

        <!-- Top KPI cards -->
        <section class="grid md:grid-cols-4 gap-5">
          <div class="panel-card p-6 rounded-2xl hover:scale-105 transition-transform duration-300">
            <p class="text-xs text-gray-500 uppercase tracking-wider mb-3">Tickets totales</p>
            <p class="text-3xl font-bold text-gradient">{{ totalTickets }}</p>
            <p class="text-xs text-gray-600 mt-1.5">{{ monthlyTickets.length }} este mes</p>
          </div>
          <div class="panel-card p-6 rounded-2xl hover:scale-105 transition-transform duration-300">
            <p class="text-xs text-gray-500 uppercase tracking-wider mb-3">Gasto total</p>
            <p class="text-3xl font-bold text-gradient">{{ formatCurrency(totalSpend) }}</p>
            <p class="text-xs text-gray-600 mt-1.5">{{ formatCurrency(monthlySpend) }} este mes</p>
          </div>
          <div class="panel-card p-6 rounded-2xl hover:scale-105 transition-transform duration-300">
            <p class="text-xs text-gray-500 uppercase tracking-wider mb-3">Ticket promedio</p>
            <p class="text-3xl font-bold text-gradient">{{ formatCurrency(averageTicket) }}</p>
            <p class="text-xs text-gray-600 mt-1.5">Sobre todos los tickets</p>
          </div>
          <div class="panel-card p-6 rounded-2xl hover:scale-105 transition-transform duration-300">
            <p class="text-xs text-gray-500 uppercase tracking-wider mb-3">Conciliación</p>
            <div class="flex flex-col gap-2 mt-3">
              <div class="flex items-center justify-between">
                <span class="text-xs text-yellow-400 font-medium">Pendiente</span>
                <span class="text-sm font-bold text-white">{{ pendingCount }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-xs text-violet-400 font-medium">Terminado</span>
                <span class="text-sm font-bold text-white">{{ finishedCount }}</span>
              </div>
              <!-- Reconciliation bar -->
              <div class="h-1 bg-white/5 rounded-full overflow-hidden mt-1">
                <div class="h-full bg-gradient-to-r from-violet-600 to-purple-500 rounded-full transition-all duration-700"
                  :style="{ width: totalTickets > 0 ? `${(finishedCount / totalTickets) * 100}%` : '0%' }"
                ></div>
              </div>
            </div>
          </div>
        </section>

        <!-- Bar chart + Payment methods -->
        <section class="grid lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 panel-card p-8 rounded-2xl">
            <h2 class="section-title mb-7">Tendencia últimos 12 meses</h2>
            <div class="flex items-end gap-1.5 h-44">
              <div
                v-for="month in lastTwelveMonths"
                :key="month.key"
                class="group flex-1 flex flex-col items-center justify-end gap-1 h-full relative"
              >
                <!-- Tooltip -->
                <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-violet-900/90 text-violet-200 text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  {{ formatCurrency(month.total) }}
                </div>
                <!-- Bar -->
                <div
                  class="w-full bar-col rounded-t-md transition-all duration-700 ease-out"
                  :style="{ height: `${(month.total / maxMonthlyTotal) * 100}%`, minHeight: month.total > 0 ? '3px' : '0px' }"
                ></div>
                <!-- Label -->
                <div class="text-gray-600 text-xs mt-1 truncate w-full text-center">{{ month.label }}</div>
              </div>
            </div>
          </div>

          <div class="panel-card p-8 rounded-2xl">
            <h2 class="section-title mb-6">Métodos de pago</h2>
            <div class="space-y-4">
              <div v-for="payment in paymentSummary" :key="payment.name">
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-sm text-gray-300 font-medium">{{ payment.name }}</span>
                  <span class="text-xs text-gray-500">{{ payment.count }} tickets</span>
                </div>
                <div class="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div class="h-full rounded-full transition-all duration-700"
                    :class="payment.name === 'Tarjeta' ? 'bg-violet-500' : payment.name === 'Efectivo' ? 'bg-purple-400' : 'bg-violet-700'"
                    :style="{ width: `${(payment.count / maxPaymentCount) * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Categories + Last tickets -->
        <section class="grid lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 panel-card p-8 rounded-2xl">
            <h2 class="section-title mb-6">Categorías con mayor gasto</h2>
            <div class="space-y-4">
              <div v-for="category in categoriesSummary" :key="category.name">
                <div class="flex items-center justify-between mb-1.5">
                  <div>
                    <span class="text-sm font-medium text-white">{{ category.name }}</span>
                    <span class="text-xs text-gray-600 ml-2">{{ category.count }} tickets</span>
                  </div>
                  <span class="text-sm font-bold text-gradient">{{ formatCurrency(category.total) }}</span>
                </div>
                <div class="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div class="h-full bar-col rounded-full transition-all duration-700"
                    :style="{ width: `${(category.total / maxCategoryTotal) * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div class="panel-card p-8 rounded-2xl">
            <h2 class="section-title mb-6">Últimos tickets</h2>
            <div class="space-y-3">
              <div
                v-for="ticket in lastTickets"
                :key="ticket.id"
                class="activity-row flex items-center justify-between p-3 rounded-xl"
              >
                <div class="min-w-0 flex-1">
                  <div class="text-sm font-medium text-white truncate">{{ ticket.gasto }}</div>
                  <div class="text-xs text-gray-600 mt-0.5">{{ formatDate(ticket.fecha) }}</div>
                </div>
                <div class="text-sm font-semibold text-white ml-2 shrink-0">{{ formatCurrency(Number(ticket.importe)) }}</div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>

    <Footer />
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

* { font-family: 'DM Sans', sans-serif; }
h1, h2 { font-family: 'Syne', sans-serif; }

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

/* Chart bars */
.bar-col {
  background: linear-gradient(to top, #6d28d9, #a78bfa);
  opacity: 0.85;
}
.bar-col:hover { opacity: 1; }

/* Activity rows */
.activity-row {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  transition: all 0.2s;
}
.activity-row:hover {
  background: rgba(124, 58, 237, 0.06);
  border-color: rgba(139, 92, 246, 0.2);
}

/* Back button */
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

/* Scrollbar */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(139, 92, 246, 0.3); border-radius: 2px; }

@keyframes fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-in { animation: fade-in 0.7s ease-out; }

html { scroll-behavior: smooth; }
</style>