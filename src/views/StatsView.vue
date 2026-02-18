<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import Navbar from '../components/layout/Navbar.vue';
import api from '../services/api.service';
import type { Ticket } from '../types';

const tickets = ref<Ticket[]>([]);
const loading = ref(true);

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
};

const formatDate = (value: string) => {
  return new Date(value).toLocaleDateString('es-ES');
};

const totalTickets = computed(() => tickets.value.length);
const totalSpend = computed(() => tickets.value.reduce((sum, t) => sum + Number(t.importe || 0), 0));
const pendingCount = computed(() => tickets.value.filter(t => t.conciliado === 'pendiente').length);
const finishedCount = computed(() => tickets.value.filter(t => t.conciliado === 'terminado').length);

const monthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const monthlyTickets = computed(() => {
  const now = new Date();
  const key = monthKey(now);
  return tickets.value.filter(t => monthKey(new Date(t.fecha)) === key);
});

const monthlySpend = computed(() => {
  return monthlyTickets.value.reduce((sum, t) => sum + Number(t.importe || 0), 0);
});

const averageTicket = computed(() => {
  if (tickets.value.length === 0) return 0;
  return totalSpend.value / tickets.value.length;
});

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
    const current = map.get(ticket.metodo_pago) || 0;
    map.set(ticket.metodo_pago, current + 1);
  });

  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
});

const lastTickets = computed(() => {
  return [...tickets.value]
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 5);
});

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

  return months.map(month => ({
    ...month,
    total: totals.get(month.key) || 0
  }));
});

const maxMonthlyTotal = computed(() => {
  return Math.max(1, ...lastTwelveMonths.value.map(item => item.total));
});

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
  <div class="min-h-screen bg-gray-50">
    <Navbar />

    <main class="max-w-7xl mx-auto mt-12 px-4 pb-12">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Estadisticas</h1>
          <p class="text-gray-500">Analisis de gastos, tickets y tendencias recientes.</p>
        </div>
        <router-link
          to="/tickets"
          class="inline-flex items-center justify-center px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
        >
          Ver tickets
        </router-link>
      </div>

      <div v-if="loading" class="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
        <div class="animate-spin text-4xl mb-4">🌀</div>
        <p class="text-gray-500 font-medium">Cargando estadisticas...</p>
      </div>

      <div v-else-if="tickets.length === 0" class="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
        <div class="text-6xl mb-4">📭</div>
        <p class="text-gray-500 text-xl font-medium">No hay tickets para mostrar.</p>
        <router-link
          to="/tickets/create"
          class="text-blue-600 hover:underline mt-2 inline-block"
        >
          Crea tu primer ticket
        </router-link>
      </div>

      <div v-else class="space-y-8">
        <section class="grid md:grid-cols-4 gap-6">
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p class="text-sm text-gray-500">Tickets totales</p>
            <p class="text-3xl font-bold text-gray-900 mt-2">{{ totalTickets }}</p>
            <p class="text-xs text-gray-400 mt-1">{{ monthlyTickets.length }} este mes</p>
          </div>
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p class="text-sm text-gray-500">Gasto total</p>
            <p class="text-3xl font-bold text-gray-900 mt-2">{{ formatCurrency(totalSpend) }}</p>
            <p class="text-xs text-gray-400 mt-1">{{ formatCurrency(monthlySpend) }} este mes</p>
          </div>
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p class="text-sm text-gray-500">Ticket promedio</p>
            <p class="text-3xl font-bold text-gray-900 mt-2">{{ formatCurrency(averageTicket) }}</p>
            <p class="text-xs text-gray-400 mt-1">Calculo sobre todos los tickets</p>
          </div>
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p class="text-sm text-gray-500">Conciliacion</p>
            <div class="flex items-center gap-3 mt-2">
              <span class="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">Pendiente {{ pendingCount }}</span>
              <span class="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Terminado {{ finishedCount }}</span>
            </div>
            <p class="text-xs text-gray-400 mt-2">Estado de conciliacion actual</p>
          </div>
        </section>

        <section class="grid lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 class="text-xl font-bold text-gray-900 mb-6">Tendencia ultimos 12 meses</h2>
            <div class="flex items-end gap-1 h-48">
              <div
                v-for="month in lastTwelveMonths"
                :key="month.key"
                class="flex-1 flex flex-col items-center gap-2"
              >
                <div class="w-full flex flex-col items-center justify-end h-36 relative">
                  <div
                    class="w-6 bg-blue-600 rounded-t-lg transition-all duration-700 ease-out"
                    :style="{ height: `${(month.total / maxMonthlyTotal) * 100}%`, minHeight: month.total > 0 ? '2px' : '0px' }"
                  ></div>
                </div>
                <div class="text-xs text-gray-500 rotate-45 origin-top-left h-6 flex items-end">{{ month.label }}</div>
                <div class="text-xs font-semibold text-gray-700 mt-1">{{ formatCurrency(month.total) }}</div>
              </div>
            </div>
          </div>

          <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 class="text-xl font-bold text-gray-900 mb-6">Metodos de pago</h2>
            <div class="space-y-4">
              <div v-for="payment in paymentSummary" :key="payment.name" class="flex items-center justify-between">
                <div class="text-sm font-semibold text-gray-700">{{ payment.name }}</div>
                <div class="text-sm text-gray-500">{{ payment.count }} tickets</div>
              </div>
            </div>
          </div>
        </section>

        <section class="grid lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 class="text-xl font-bold text-gray-900 mb-6">Categorias con mayor gasto</h2>
            <div class="space-y-4">
              <div v-for="category in categoriesSummary" :key="category.name" class="flex items-center justify-between">
                <div>
                  <div class="font-semibold text-gray-900">{{ category.name }}</div>
                  <div class="text-xs text-gray-400">{{ category.count }} tickets</div>
                </div>
                <div class="font-bold text-gray-900">{{ formatCurrency(category.total) }}</div>
              </div>
            </div>
          </div>

          <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 class="text-xl font-bold text-gray-900 mb-6">Ultimos tickets</h2>
            <div class="space-y-4">
              <div v-for="ticket in lastTickets" :key="ticket.id" class="flex items-center justify-between">
                <div>
                  <div class="font-semibold text-gray-900">{{ ticket.gasto }}</div>
                  <div class="text-xs text-gray-400">{{ formatDate(ticket.fecha) }}</div>
                </div>
                <div class="font-bold text-gray-900">{{ formatCurrency(Number(ticket.importe)) }}</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>