<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Navbar from '../components/layout/Navbar.vue';
import EditTicketModal from '../components/tickets/EditTicketModal.vue';
import { useTickets } from '../composables/useTickets';
import api from '../services/api.service';
import type { Ticket, TicketPayload } from '../types';

const { tickets, loading, errors, pagination, fetchTickets, deleteTicket, updateTicket } = useTickets();
const categories = ref<Array<{ id: number; name: string }>>([]);
const tags = ref<Array<{ id: number; name: string }>>([]);
const filters = ref({
  q: '',
  category_id: null as number | null,
  conciliado: '',
  page: 1,
});

const showEditModal = ref(false);
const selectedTicket = ref<Ticket | null>(null);

const openEditModal = (ticket: Ticket) => {
  selectedTicket.value = ticket;
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  selectedTicket.value = null;
};

const handleUpdate = async (formData: TicketPayload) => {
  if (!selectedTicket.value) return;
  
  const success = await updateTicket(selectedTicket.value.id, formData);
  if (success) {
    closeEditModal();
    await fetchTickets(); 
  }
};

const applyFilters = async () => {
  await fetchTickets({
    q: filters.value.q || undefined,
    category_id: filters.value.category_id,
    conciliado: filters.value.conciliado || undefined,
    page: filters.value.page,
    per_page: 15,
  });
};

const changePage = async (newPage: number) => {
  if (newPage < 1 || newPage > pagination.value.last_page) return;
  filters.value.page = newPage;
  await applyFilters();
};


onMounted(() => {
  Promise.all([
    applyFilters(),
    api.get('/api/categories').then(response => { categories.value = response.data || []; }),
    api.get('/api/tags').then(response => { tags.value = response.data || []; }),
  ]).catch(error => {
    console.error('No se pudieron cargar catálogos de tickets', error);
  });
});

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />

    <main class="max-w-7xl mx-auto mt-12 px-4 pb-12">
      <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Mis Tickets</h1>
          <p class="text-gray-500">Gestiona y visualiza todos tus gastos registrados.</p>
        </div>
        
        <router-link 
          to="/tickets/create" 
          class="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          <span class="mr-2">➕</span> Nuevo Ticket
        </router-link>
      </div>

      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4 grid md:grid-cols-4 gap-3">
        <input v-model="filters.q" type="text" placeholder="Buscar por concepto, CIF..." class="p-2 border rounded-lg" />
        <select v-model.number="filters.category_id" class="p-2 border rounded-lg bg-white">
          <option :value="null">Todas las categorías</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
        </select>
        <select v-model="filters.conciliado" class="p-2 border rounded-lg bg-white">
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="terminado">Terminado</option>
        </select>
        <button @click="filters.page = 1; applyFilters()" class="bg-blue-600 text-white rounded-lg px-4">Filtrar</button>
      </div>

      <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div v-if="loading && !showEditModal" class="p-20 text-center">
          <div class="animate-spin text-4xl mb-4">🌀</div>
          <p class="text-gray-500 font-medium">Cargando tus tickets...</p>
        </div>

        <div v-else-if="tickets.length === 0" class="p-20 text-center">
          <div class="text-6xl mb-4">📭</div>
          <p class="text-gray-500 text-xl font-medium">Aún no tienes tickets registrados.</p>
          <router-link to="/tickets/create" class="text-blue-600 hover:underline mt-2 inline-block">¡Crea el primero ahora!</router-link>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50/50 border-b border-gray-100">
                <th class="px-6 py-4 text-sm font-semibold text-gray-600 uppercase">Fecha</th>
                <th class="px-6 py-4 text-sm font-semibold text-gray-600 uppercase">Concepto</th>
                <th class="px-6 py-4 text-sm font-semibold text-gray-600 uppercase">CIF / Pago</th>
                <th class="px-6 py-4 text-sm font-semibold text-gray-600 uppercase">Categoría</th>
                <th class="px-6 py-4 text-sm font-semibold text-gray-600 uppercase">Estado</th>
                <th class="px-6 py-4 text-sm font-semibold text-gray-600 uppercase">Importe</th>
                <th class="px-6 py-4 text-sm font-semibold text-gray-600 uppercase text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="ticket in tickets" :key="ticket.id" class="hover:bg-blue-50/30 transition-colors group">
                <td class="px-6 py-4 text-gray-600">
                  {{ new Date(ticket.fecha).toLocaleDateString() }}
                </td>
                <td class="px-6 py-4">
                  <div class="font-bold text-gray-900">{{ ticket.gasto }}</div>
                </td>
                <td class="px-6 py-4 text-sm">
                  <div class="text-gray-700 font-medium">{{ ticket.cif }}</div>
                  <div class="text-gray-400 text-xs">{{ ticket.metodo_pago }}</div>
                </td>
                <td class="px-6 py-4">
                  <span class="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 capitalize">
                    {{ ticket.categoria }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span 
                    class="px-3 py-1 rounded-full text-xs font-bold"
                    :class="ticket.conciliado === 'terminado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'"
                  >
                    {{ ticket.conciliado }}
                  </span>
                </td>
                <td class="px-6 py-4 font-bold text-gray-900">
                  {{ formatCurrency(Number(ticket.importe)) }}
                </td>
                <td class="px-6 py-4 text-right space-x-2">
                  <button @click="openEditModal(ticket)" class="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition" title="Editar">
                    ✏️
                  </button>
                  <button @click="deleteTicket(ticket.id)" class="p-2 text-red-600 hover:bg-red-100 rounded-lg transition" title="Eliminar">
                    🗑️
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="mt-4 flex items-center justify-between bg-white rounded-2xl border border-gray-100 p-4">
        <p class="text-sm text-gray-600">Página {{ pagination.current_page }} de {{ pagination.last_page }} · {{ pagination.total }} tickets</p>
        <div class="space-x-2">
          <button @click="changePage(pagination.current_page - 1)" :disabled="pagination.current_page <= 1" class="px-3 py-1 rounded border disabled:opacity-50">Anterior</button>
          <button @click="changePage(pagination.current_page + 1)" :disabled="pagination.current_page >= pagination.last_page" class="px-3 py-1 rounded border disabled:opacity-50">Siguiente</button>
        </div>
      </div>
    </main>

    <EditTicketModal 
      :show="showEditModal"
      :ticket="selectedTicket"
      :loading="loading"
      :errors="errors"
      :categories="categories"
      :tags="tags"
      @close="closeEditModal"
      @save="handleUpdate"
    />
  </div>
</template>