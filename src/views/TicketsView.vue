<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Navbar from '../components/layout/Navbar.vue';
import Footer from '../components/layout/Footer.vue';
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

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
</script>

<template>
  <div class="min-h-screen bg-black text-white overflow-hidden">
    <!-- Background effects -->
    <div class="fixed inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
    <div class="fixed top-0 left-1/4 w-96 h-96 bg-violet-700 rounded-full blur-3xl opacity-10 pointer-events-none"></div>
    <div class="fixed bottom-1/3 right-1/4 w-80 h-80 bg-purple-600 rounded-full blur-3xl opacity-10 pointer-events-none"></div>

    <Navbar />

    <main class="max-w-7xl mx-auto mt-20 sm:mt-24 px-3 sm:px-4 pb-12 sm:pb-16">

      <!-- Page header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between mb-6 sm:mb-8 gap-4 animate-fade-in">
        <div>
          <div class="inline-flex items-center gap-2 mb-3 border border-violet-700/40 bg-violet-950/30 px-4 py-1.5 rounded-full">
            <span class="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse"></span>
            <span class="text-violet-300 text-xs font-medium tracking-wide">Gestión</span>
          </div>
          <h1 class="text-3xl font-bold text-white tracking-tight">Mis Tickets</h1>
          <p class="text-gray-500 text-sm mt-1">Gestiona y visualiza todos tus gastos registrados.</p>
        </div>

        <router-link
          to="/tickets/create"
          class="new-btn inline-flex items-center justify-center w-full sm:w-auto gap-2.5 px-5 py-3 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nuevo Ticket
        </router-link>
      </div>

      <!-- Filters -->
      <div class="filter-bar rounded-2xl p-4 mb-5 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          v-model="filters.q"
          type="text"
          placeholder="Buscar por concepto, CIF..."
          class="input-field p-2.5 rounded-xl outline-none transition-all text-sm"
          @keyup.enter="filters.page = 1; applyFilters()"
        />
        <select v-model.number="filters.category_id" class="input-field p-2.5 rounded-xl outline-none transition-all text-sm cursor-pointer">
          <option :value="null">Todas las categorías</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
        </select>
        <select v-model="filters.conciliado" class="input-field p-2.5 rounded-xl outline-none transition-all text-sm cursor-pointer">
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="terminado">Terminado</option>
        </select>
        <button
          @click="filters.page = 1; applyFilters()"
          class="action-btn py-2.5 rounded-xl text-sm font-medium transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
          </svg>
          Filtrar
        </button>
      </div>

      <!-- Table card -->
      <div class="panel-card rounded-3xl overflow-hidden">

        <!-- Loading -->
        <div v-if="loading && !showEditModal" class="p-20 text-center">
          <div class="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-gray-500 text-sm">Cargando tus tickets...</p>
        </div>

        <!-- Empty state -->
        <div v-else-if="tickets.length === 0" class="p-20 text-center">
          <div class="w-16 h-16 mx-auto mb-5 text-violet-900">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
            </svg>
          </div>
          <p class="text-gray-500 text-lg font-medium mb-2">Aún no tienes tickets registrados.</p>
          <router-link to="/tickets/create" class="text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors">
            Crea el primero ahora →
          </router-link>
        </div>

        <!-- Table -->
        <div v-else>
          <div class="md:hidden p-3 space-y-3">
            <article
              v-for="ticket in tickets"
              :key="`mobile-${ticket.id}`"
              class="table-row rounded-2xl border border-white/5 p-4"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="font-semibold text-white text-sm">{{ ticket.gasto }}</p>
                  <p class="text-xs text-gray-500 mt-0.5">{{ new Date(ticket.fecha).toLocaleDateString('es-ES') }}</p>
                </div>
                <span class="text-sm font-bold text-white">{{ formatCurrency(Number(ticket.importe)) }}</span>
              </div>

              <div class="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div class="text-gray-500">CIF</div>
                <div class="text-gray-300 text-right truncate">{{ ticket.cif }}</div>
                <div class="text-gray-500">Método</div>
                <div class="text-gray-300 text-right">{{ ticket.metodo_pago }}</div>
                <div class="text-gray-500">Categoría</div>
                <div class="text-right">
                  <span class="category-badge px-2.5 py-1 rounded-lg text-xs font-medium">{{ ticket.categoria }}</span>
                </div>
              </div>

              <div class="mt-3 flex items-center justify-between">
                <span
                  class="px-2.5 py-1 rounded-lg text-xs font-medium"
                  :class="ticket.conciliado === 'terminado'
                    ? 'bg-violet-900/40 text-violet-300 border border-violet-700/30'
                    : 'bg-yellow-900/30 text-yellow-400 border border-yellow-700/30'"
                >
                  {{ ticket.conciliado }}
                </span>

                <div class="flex items-center gap-2">
                  <button @click="openEditModal(ticket)" class="icon-btn p-2 rounded-lg transition-all" title="Editar">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                    </svg>
                  </button>
                  <button @click="deleteTicket(ticket.id)" class="icon-btn-delete p-2 rounded-lg transition-all" title="Eliminar">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-red-400/70" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            </article>
          </div>

          <div class="hidden md:block overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="table-header border-b border-white/5">
                <th class="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Fecha</th>
                <th class="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Concepto</th>
                <th class="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">CIF / Pago</th>
                <th class="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Categoría</th>
                <th class="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                <th class="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Importe</th>
                <th class="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="ticket in tickets"
                :key="ticket.id"
                class="table-row border-b border-white/[0.03] transition-all duration-200 group"
              >
                <td class="px-6 py-4 text-sm text-gray-500">
                  {{ new Date(ticket.fecha).toLocaleDateString('es-ES') }}
                </td>
                <td class="px-6 py-4">
                  <div class="font-semibold text-white text-sm">{{ ticket.gasto }}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-400">{{ ticket.cif }}</div>
                  <div class="text-xs text-gray-600 mt-0.5">{{ ticket.metodo_pago }}</div>
                </td>
                <td class="px-6 py-4">
                  <span class="category-badge px-2.5 py-1 rounded-lg text-xs font-medium">
                    {{ ticket.categoria }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span
                    class="px-2.5 py-1 rounded-lg text-xs font-medium"
                    :class="ticket.conciliado === 'terminado'
                      ? 'bg-violet-900/40 text-violet-300 border border-violet-700/30'
                      : 'bg-yellow-900/30 text-yellow-400 border border-yellow-700/30'"
                  >
                    {{ ticket.conciliado }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-sm font-bold text-white">{{ formatCurrency(Number(ticket.importe)) }}</span>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button
                      @click="openEditModal(ticket)"
                      class="icon-btn p-2 rounded-lg transition-all"
                      title="Editar"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                      </svg>
                    </button>
                    <button
                      @click="deleteTicket(ticket.id)"
                      class="icon-btn-delete p-2 rounded-lg transition-all"
                      title="Eliminar"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-red-400/70" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="tickets.length > 0" class="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 filter-bar rounded-2xl p-4">
        <p class="text-xs text-gray-500">
          Página <span class="text-white font-medium">{{ pagination.current_page }}</span> de <span class="text-white font-medium">{{ pagination.last_page }}</span>
          · <span class="text-white font-medium">{{ pagination.total }}</span> tickets
        </p>
        <div class="flex w-full sm:w-auto gap-2">
          <button
            @click="changePage(pagination.current_page - 1)"
            :disabled="pagination.current_page <= 1"
            class="page-btn flex-1 sm:flex-none px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Anterior
          </button>
          <button
            @click="changePage(pagination.current_page + 1)"
            :disabled="pagination.current_page >= pagination.last_page"
            class="page-btn flex-1 sm:flex-none px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Siguiente →
          </button>
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

    <Footer />
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

* { font-family: 'DM Sans', sans-serif; }
h1 { font-family: 'Syne', sans-serif; }

.bg-grid-pattern {
  background-image:
    linear-gradient(rgba(139, 92, 246, 0.15) 1px, transparent 1px),
    linear-gradient(90deg, rgba(139, 92, 246, 0.15) 1px, transparent 1px);
  background-size: 60px 60px;
}

/* Panels */
.panel-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(139, 92, 246, 0.12);
  backdrop-filter: blur(16px);
}

.filter-bar {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

/* Inputs */
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
.input-field::placeholder { color: rgba(255, 255, 255, 0.2); }
.input-field option { background: #0a0a0a; color: white; }

/* New ticket button */
.new-btn {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  color: white;
  box-shadow: 0 4px 20px rgba(124, 58, 237, 0.3);
}
.new-btn:hover { box-shadow: 0 6px 28px rgba(124, 58, 237, 0.45); }

/* Filter action button */
.action-btn {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(124, 58, 237, 0.25);
}
.action-btn:hover { box-shadow: 0 6px 24px rgba(124, 58, 237, 0.4); }

/* Table */
.table-header { background: rgba(255, 255, 255, 0.01); }

.table-row:hover { background: rgba(124, 58, 237, 0.04); }
.table-row:last-child { border-bottom: none; }

/* Category badge */
.category-badge {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.6);
}

/* Action icon buttons */
.icon-btn {
  color: rgba(139, 92, 246, 0.7);
}
.icon-btn:hover {
  background: rgba(124, 58, 237, 0.12);
  color: #a78bfa;
}

.icon-btn-delete { color: rgba(248, 113, 113, 0.6); }
.icon-btn-delete:hover {
  background: rgba(239, 68, 68, 0.08);
  color: #f87171;
}

/* Pagination buttons */
.page-btn {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.6);
}
.page-btn:hover:not(:disabled) {
  background: rgba(124, 58, 237, 0.08);
  border-color: rgba(139, 92, 246, 0.3);
  color: white;
}

/* Scrollbar */
::-webkit-scrollbar { height: 4px; width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(139, 92, 246, 0.3); border-radius: 2px; }

@keyframes fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-in { animation: fade-in 0.7s ease-out; }

html { scroll-behavior: smooth; }
</style>