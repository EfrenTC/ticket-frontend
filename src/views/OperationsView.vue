<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import Navbar from '../components/layout/Navbar.vue';
import Footer from '../components/layout/Footer.vue';
import api from '../services/api.service';
import type {
  Budget,
  BudgetAlert,
  Category,
  DashboardWidget,
  Reminder,
  SavingsGoal,
  Tag,
  Ticket,
} from '../types';

const loading = ref(false);
const actionLoading = ref(false);
const globalMessage = ref('');
const globalError = ref('');

const categories = ref<Category[]>([]);
const tags = ref<Tag[]>([]);
const tickets = ref<Ticket[]>([]);
const budgets = ref<Budget[]>([]);
const budgetAlerts = ref<BudgetAlert[]>([]);
const goals = ref<SavingsGoal[]>([]);
const reminders = ref<Reminder[]>([]);
const widgets = ref<DashboardWidget[]>([]);

const pendingSummary = ref<{ pending_tickets: number; message: string } | null>(null);
const reportCompare = ref<Record<string, number> | null>(null);
const reportCharts = ref<any>(null);
const reportCalendar = ref<any>(null);
const reportSummary = ref<any>(null);

const selectedGoalId = ref<number | null>(null);
const goalProgress = ref<any>(null);

const now = new Date();
const currentMonth = now.getMonth() + 1;
const currentYear = now.getFullYear();

const categoryForm = ref({ name: '', color: '#6B7280', icon: '' });
const tagForm = ref({ name: '' });
const budgetForm = ref({ category_id: null as number | null, amount: 0, month: currentMonth, year: currentYear });
const goalForm = ref({ title: '', target_amount: 0, start_date: now.toISOString().split('T')[0], end_date: now.toISOString().split('T')[0] });
const reminderForm = ref({
  ticket_id: null as number | null,
  type: 'in_app',
  title: '',
  message: '',
  send_at: '',
});
const summaryPeriod = ref<'weekly' | 'monthly'>('monthly');

const selectedPendingTicketIds = ref<number[]>([]);
const csvFile = ref<File | null>(null);
const restoreFile = ref<File | null>(null);

const widgetDraft = ref<Array<{ widget_key: string; position: number; enabled: boolean }>>([]);

const pendingTickets = computed(() => tickets.value.filter(t => t.conciliado === 'pendiente'));

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(Number(value || 0));
};

const setError = (error: any, fallback = 'Ha ocurrido un error') => {
  globalMessage.value = '';
  globalError.value = error?.response?.data?.message || fallback;
};

const setMessage = (message: string) => {
  globalError.value = '';
  globalMessage.value = message;
};

const loadCore = async () => {
  loading.value = true;
  globalError.value = '';
  try {
    const [categoriesRes, tagsRes, ticketsRes, budgetsRes, alertsRes, goalsRes, remindersRes, pendingRes, widgetsRes] = await Promise.all([
      api.get('/api/categories'),
      api.get('/api/tags'),
      api.get('/api/tickets', { params: { per_page: 100 } }),
      api.get('/api/budgets'),
      api.get('/api/budgets/alerts/current-month'),
      api.get('/api/savings-goals'),
      api.get('/api/reminders'),
      api.get('/api/reminders/pending-tickets'),
      api.get('/api/dashboard/widgets'),
    ]);
    categories.value = categoriesRes.data || [];
    tags.value = tagsRes.data || [];
    tickets.value = ticketsRes.data?.data || [];
    budgets.value = budgetsRes.data || [];
    budgetAlerts.value = alertsRes.data || [];
    goals.value = goalsRes.data || [];
    reminders.value = remindersRes.data?.data || [];
    pendingSummary.value = pendingRes.data || null;
    widgets.value = widgetsRes.data || [];
    widgetDraft.value = (widgetsRes.data || []).map((item: DashboardWidget) => ({
      widget_key: item.widget_key,
      position: item.position,
      enabled: item.enabled,
    }));
  } catch (error: any) {
    setError(error, 'No se pudieron cargar los módulos avanzados');
  } finally {
    loading.value = false;
  }
};

const createCategory = async () => {
  actionLoading.value = true;
  try {
    await api.post('/api/categories', categoryForm.value);
    categoryForm.value = { name: '', color: '#6B7280', icon: '' };
    setMessage('Categoría creada correctamente');
    await loadCore();
  } catch (error: any) { setError(error, 'No se pudo crear la categoría'); } finally { actionLoading.value = false; }
};

const deleteCategory = async (id: number) => {
  actionLoading.value = true;
  try {
    await api.delete(`/api/categories/${id}`, { data: { confirm: true } });
    setMessage('Categoría eliminada');
    await loadCore();
  } catch (error: any) { setError(error, 'No se pudo eliminar la categoría'); } finally { actionLoading.value = false; }
};

const createTag = async () => {
  actionLoading.value = true;
  try {
    await api.post('/api/tags', tagForm.value);
    tagForm.value = { name: '' };
    setMessage('Etiqueta creada correctamente');
    await loadCore();
  } catch (error: any) { setError(error, 'No se pudo crear la etiqueta'); } finally { actionLoading.value = false; }
};

const deleteTag = async (id: number) => {
  actionLoading.value = true;
  try {
    await api.delete(`/api/tags/${id}`, { data: { confirm: true } });
    setMessage('Etiqueta eliminada');
    await loadCore();
  } catch (error: any) { setError(error, 'No se pudo eliminar la etiqueta'); } finally { actionLoading.value = false; }
};

const saveBudget = async () => {
  actionLoading.value = true;
  try {
    await api.post('/api/budgets', budgetForm.value);
    setMessage('Presupuesto guardado');
    await loadCore();
  } catch (error: any) { setError(error, 'No se pudo guardar el presupuesto'); } finally { actionLoading.value = false; }
};

const deleteBudget = async (id: number) => {
  actionLoading.value = true;
  try {
    await api.delete(`/api/budgets/${id}`, { data: { confirm: true } });
    setMessage('Presupuesto eliminado');
    await loadCore();
  } catch (error: any) { setError(error, 'No se pudo eliminar el presupuesto'); } finally { actionLoading.value = false; }
};

const createGoal = async () => {
  actionLoading.value = true;
  try {
    await api.post('/api/savings-goals', goalForm.value);
    setMessage('Meta creada');
    await loadCore();
  } catch (error: any) { setError(error, 'No se pudo crear la meta'); } finally { actionLoading.value = false; }
};

const loadGoalProgress = async () => {
  if (!selectedGoalId.value) { goalProgress.value = null; return; }
  actionLoading.value = true;
  try {
    const response = await api.get(`/api/savings-goals/${selectedGoalId.value}/progress`);
    goalProgress.value = response.data;
  } catch (error: any) { setError(error, 'No se pudo cargar el progreso de la meta'); } finally { actionLoading.value = false; }
};

const deleteGoal = async (id: number) => {
  actionLoading.value = true;
  try {
    await api.delete(`/api/savings-goals/${id}`, { data: { confirm: true } });
    if (selectedGoalId.value === id) { selectedGoalId.value = null; goalProgress.value = null; }
    setMessage('Meta eliminada');
    await loadCore();
  } catch (error: any) { setError(error, 'No se pudo eliminar la meta'); } finally { actionLoading.value = false; }
};

const bulkReconcile = async () => {
  if (selectedPendingTicketIds.value.length === 0) { setError(null, 'Selecciona al menos un ticket pendiente'); return; }
  actionLoading.value = true;
  try {
    const response = await api.post('/api/reconciliation/bulk', { ticket_ids: selectedPendingTicketIds.value, confirm: true });
    setMessage(`${response.data?.updated_count || 0} tickets conciliados`);
    selectedPendingTicketIds.value = [];
    await loadCore();
  } catch (error: any) { setError(error, 'No se pudo completar la conciliación masiva'); } finally { actionLoading.value = false; }
};

const importCsv = async () => {
  if (!csvFile.value) { setError(null, 'Selecciona un archivo CSV para importar'); return; }
  actionLoading.value = true;
  try {
    const formData = new FormData();
    formData.append('file', csvFile.value);
    const response = await api.post('/api/reconciliation/import-csv', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    setMessage(`Importación completada: ${response.data?.matched || 0} conciliados, ${response.data?.not_matched || 0} no conciliados`);
    csvFile.value = null;
    await loadCore();
  } catch (error: any) { setError(error, 'No se pudo importar el CSV bancario'); } finally { actionLoading.value = false; }
};

const loadReports = async () => {
  actionLoading.value = true;
  try {
    const [compareRes, chartsRes, calendarRes, summaryRes] = await Promise.all([
      api.get('/api/reports/compare'),
      api.get('/api/reports/charts', { params: { month: currentMonth, year: currentYear } }),
      api.get('/api/reports/calendar', { params: { month: currentMonth, year: currentYear } }),
      api.get('/api/reports/summary', { params: { period: summaryPeriod.value } }),
    ]);
    reportCompare.value = compareRes.data;
    reportCharts.value = chartsRes.data;
    reportCalendar.value = calendarRes.data;
    reportSummary.value = summaryRes.data;
    setMessage('Reportes actualizados');
  } catch (error: any) { setError(error, 'No se pudieron obtener los reportes'); } finally { actionLoading.value = false; }
};

const exportReport = async (format: 'csv' | 'xls') => {
  actionLoading.value = true;
  try {
    const response = await api.get('/api/reports/export', { params: { format, month: currentMonth, year: currentYear }, responseType: 'blob' });
    const blob = new Blob([response.data], { type: format === 'xls' ? 'application/vnd.ms-excel' : 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tickets_${currentYear}_${String(currentMonth).padStart(2, '0')}.${format}`;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error: any) { setError(error, 'No se pudo exportar el reporte'); } finally { actionLoading.value = false; }
};

const createReminder = async () => {
  actionLoading.value = true;
  try {
    await api.post('/api/reminders', { ...reminderForm.value, send_at: reminderForm.value.send_at || null });
    reminderForm.value = { ticket_id: null, type: 'in_app', title: '', message: '', send_at: '' };
    setMessage('Recordatorio creado');
    await loadCore();
  } catch (error: any) { setError(error, 'No se pudo crear el recordatorio'); } finally { actionLoading.value = false; }
};

const markReminderRead = async (id: number) => {
  actionLoading.value = true;
  try {
    await api.post(`/api/reminders/${id}/read`);
    await loadCore();
  } catch (error: any) { setError(error, 'No se pudo marcar el recordatorio como leído'); } finally { actionLoading.value = false; }
};

const exportBackup = async () => {
  actionLoading.value = true;
  try {
    const response = await api.get('/api/backup/export', { responseType: 'blob' });
    const blob = new Blob([response.data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ticket_manager_backup.json';
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error: any) { setError(error, 'No se pudo exportar el backup'); } finally { actionLoading.value = false; }
};

const restoreBackup = async () => {
  if (!restoreFile.value) { setError(null, 'Selecciona un archivo de backup .json'); return; }
  actionLoading.value = true;
  try {
    const formData = new FormData();
    formData.append('file', restoreFile.value);
    formData.append('confirm', '1');
    await api.post('/api/backup/restore', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    setMessage('Restauración completada');
    restoreFile.value = null;
    await loadCore();
  } catch (error: any) { setError(error, 'No se pudo restaurar el backup'); } finally { actionLoading.value = false; }
};

const saveWidgets = async () => {
  actionLoading.value = true;
  try {
    await api.post('/api/dashboard/widgets', {
      widgets: widgetDraft.value.map((item, index) => ({
        widget_key: item.widget_key,
        position: Number(item.position ?? index),
        enabled: Boolean(item.enabled),
        settings: null,
      })),
    });
    setMessage('Widgets actualizados');
    await loadCore();
  } catch (error: any) { setError(error, 'No se pudieron guardar los widgets'); } finally { actionLoading.value = false; }
};

onMounted(async () => {
  await loadCore();
  await loadReports();
});
</script>

<template>
  <div class="min-h-screen bg-black text-white overflow-hidden">
    <!-- Background effects -->
    <div class="fixed inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
    <div class="fixed top-0 left-1/4 w-96 h-96 bg-violet-700 rounded-full blur-3xl opacity-10 pointer-events-none"></div>
    <div class="fixed bottom-1/3 right-1/4 w-80 h-80 bg-purple-600 rounded-full blur-3xl opacity-10 pointer-events-none"></div>

    <Navbar />

    <main class="max-w-7xl mx-auto mt-20 sm:mt-24 px-3 sm:px-4 pb-12 sm:pb-16 space-y-8">

      <!-- Page Header -->
      <section class="animate-fade-in">
        <div class="inline-flex items-center gap-2 mb-4 border border-violet-700/40 bg-violet-950/30 px-4 py-1.5 rounded-full">
          <span class="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse"></span>
          <span class="text-violet-300 text-xs font-medium tracking-wide">Panel avanzado</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-bold text-white tracking-tight">Módulos avanzados</h1>
        <p class="text-gray-500 mt-1 text-sm">Integración completa de las características del backend.</p>
      </section>

      <!-- Global messages -->
      <div v-if="globalMessage" class="msg-success flex items-center gap-3 p-4 rounded-xl">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-violet-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
        <span class="text-violet-200 text-sm">{{ globalMessage }}</span>
      </div>
      <div v-if="globalError" class="msg-error flex items-center gap-3 p-4 rounded-xl">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" /></svg>
        <span class="text-red-300 text-sm">{{ globalError }}</span>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="panel-card p-10 rounded-2xl text-center text-gray-500 text-sm">
        Cargando módulos...
      </div>

      <template v-else>

        <!-- Categorías + Etiquetas -->
        <section class="grid lg:grid-cols-2 gap-6">
          <div class="panel-card p-6 rounded-2xl">
            <h2 class="section-title mb-5">Categorías</h2>
            <form @submit.prevent="createCategory" class="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-5">
              <input v-model="categoryForm.name" required type="text" placeholder="Nombre" class="input-field col-span-1 sm:col-span-2 p-2.5 rounded-xl outline-none transition-all" />
              <input v-model="categoryForm.color" type="text" placeholder="#6B7280" class="input-field p-2.5 rounded-xl outline-none transition-all" />
              <input v-model="categoryForm.icon" type="text" placeholder="Icono" class="input-field p-2.5 rounded-xl outline-none transition-all" />
              <button :disabled="actionLoading" class="col-span-1 sm:col-span-4 action-btn py-2.5 rounded-xl text-sm font-medium transition-all">Crear categoría</button>
            </form>
            <div class="space-y-2">
              <div v-for="item in categories" :key="item.id" class="list-row flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl gap-2">
                <div>
                  <p class="text-sm font-semibold text-white">{{ item.name }}</p>
                  <p class="text-xs text-gray-600">{{ item.color }} · {{ item.icon || 'sin icono' }}</p>
                </div>
                <button @click="deleteCategory(item.id)" class="delete-btn text-xs px-3 py-1.5 rounded-lg transition-all">Eliminar</button>
              </div>
            </div>
          </div>

          <div class="panel-card p-6 rounded-2xl">
            <h2 class="section-title mb-5">Etiquetas</h2>
            <form @submit.prevent="createTag" class="flex flex-col sm:flex-row gap-3 mb-5">
              <input v-model="tagForm.name" required type="text" placeholder="Nombre de etiqueta" class="input-field flex-1 p-2.5 rounded-xl outline-none transition-all" />
              <button :disabled="actionLoading" class="action-btn px-5 rounded-xl text-sm font-medium transition-all">Crear</button>
            </form>
            <div class="space-y-2">
              <div v-for="item in tags" :key="item.id" class="list-row flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl gap-2">
                <p class="text-sm font-semibold text-white">{{ item.name }}</p>
                <button @click="deleteTag(item.id)" class="delete-btn text-xs px-3 py-1.5 rounded-lg transition-all">Eliminar</button>
              </div>
            </div>
          </div>
        </section>

        <!-- Presupuestos + Alertas -->
        <section class="grid lg:grid-cols-2 gap-6">
          <div class="panel-card p-6 rounded-2xl">
            <h2 class="section-title mb-5">Presupuestos</h2>
            <form @submit.prevent="saveBudget" class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              <select v-model.number="budgetForm.category_id" class="input-field p-2.5 rounded-xl outline-none transition-all cursor-pointer">
                <option :value="null">Global</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
              </select>
              <input v-model.number="budgetForm.amount" required min="0" step="0.01" type="number" placeholder="Importe" class="input-field p-2.5 rounded-xl outline-none transition-all" />
              <input v-model.number="budgetForm.month" required min="1" max="12" type="number" placeholder="Mes" class="input-field p-2.5 rounded-xl outline-none transition-all" />
              <input v-model.number="budgetForm.year" required min="2000" max="2100" type="number" placeholder="Año" class="input-field p-2.5 rounded-xl outline-none transition-all" />
              <button :disabled="actionLoading" class="col-span-1 sm:col-span-2 action-btn py-2.5 rounded-xl text-sm font-medium transition-all">Guardar presupuesto</button>
            </form>
            <div class="space-y-2">
              <div v-for="item in budgets" :key="item.id" class="list-row flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl gap-2">
                <div>
                  <p class="text-sm font-semibold text-white">{{ item.category?.name || 'Global' }} · {{ item.month }}/{{ item.year }}</p>
                  <p class="text-xs text-gray-500">{{ formatCurrency(item.amount) }}</p>
                </div>
                <button @click="deleteBudget(item.id)" class="delete-btn text-xs px-3 py-1.5 rounded-lg transition-all">Eliminar</button>
              </div>
            </div>
          </div>

          <div class="panel-card p-6 rounded-2xl">
            <h2 class="section-title mb-5">Alertas de presupuesto</h2>
            <div class="space-y-2">
              <div v-for="alert in budgetAlerts" :key="alert.budget_id" class="list-row p-3 rounded-xl">
                <p class="text-sm font-semibold text-white mb-1">{{ alert.category_name || 'Global' }}</p>
                <p class="text-xs text-gray-500 mb-1">{{ formatCurrency(alert.spent) }} / {{ formatCurrency(alert.budget) }}</p>
                <!-- Progress bar -->
                <div class="h-1 bg-white/5 rounded-full overflow-hidden mb-1">
                  <div class="h-full rounded-full transition-all duration-500"
                    :class="alert.status === 'exceeded' ? 'bg-red-500' : alert.status === 'near_limit' ? 'bg-yellow-500' : 'bg-violet-500'"
                    :style="{ width: `${Math.min(Number(alert.ratio) * 100, 100)}%` }"
                  ></div>
                </div>
                <span class="text-xs font-medium"
                  :class="alert.status === 'exceeded' ? 'text-red-400' : alert.status === 'near_limit' ? 'text-yellow-400' : 'text-violet-400'"
                >{{ alert.status }} · {{ alert.ratio }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Metas + Conciliación -->
        <section class="grid lg:grid-cols-2 gap-6">
          <div class="panel-card p-6 rounded-2xl">
            <h2 class="section-title mb-5">Metas de ahorro</h2>
            <form @submit.prevent="createGoal" class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              <input v-model="goalForm.title" required type="text" placeholder="Título" class="input-field col-span-1 sm:col-span-2 p-2.5 rounded-xl outline-none transition-all" />
              <input v-model.number="goalForm.target_amount" required min="0" step="0.01" type="number" placeholder="Objetivo (€)" class="input-field p-2.5 rounded-xl outline-none transition-all" />
              <div class="hidden sm:block"></div>
              <input v-model="goalForm.start_date" required type="date" class="input-field p-2.5 rounded-xl outline-none transition-all" />
              <input v-model="goalForm.end_date" required type="date" class="input-field p-2.5 rounded-xl outline-none transition-all" />
              <button :disabled="actionLoading" class="col-span-1 sm:col-span-2 action-btn py-2.5 rounded-xl text-sm font-medium transition-all">Crear meta</button>
            </form>
            <div class="space-y-2">
              <div v-for="item in goals" :key="item.id" class="list-row p-3 rounded-xl">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-2">
                  <p class="text-sm font-semibold text-white">{{ item.title }}</p>
                  <div class="flex gap-2">
                    <button @click="selectedGoalId = item.id; loadGoalProgress()" class="text-xs text-violet-400 hover:text-violet-300 transition-colors">Progreso</button>
                    <button @click="deleteGoal(item.id)" class="delete-btn text-xs px-2.5 py-1 rounded-lg transition-all">Eliminar</button>
                  </div>
                </div>
                <p class="text-xs text-gray-500">{{ formatCurrency(item.target_amount) }} · {{ item.start_date }} → {{ item.end_date }}</p>
              </div>
            </div>
            <div v-if="goalProgress" class="mt-4 progress-card p-4 rounded-xl">
              <p class="text-sm font-semibold text-white mb-2">Progreso: {{ goalProgress.goal?.title }}</p>
              <p class="text-xs text-gray-400">Gastado en periodo: {{ formatCurrency(goalProgress.spent_in_period) }}</p>
              <p class="text-xs text-gray-400">Ahorro estimado: {{ formatCurrency(goalProgress.saved_amount) }}</p>
              <div class="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div class="h-full bg-violet-500 rounded-full transition-all duration-700" :style="{ width: `${Math.min(goalProgress.progress_percent, 100)}%` }"></div>
              </div>
              <p class="text-xs text-violet-400 mt-1">{{ goalProgress.progress_percent }}%</p>
            </div>
          </div>

          <div class="panel-card p-6 rounded-2xl">
            <h2 class="section-title mb-5">Conciliación</h2>
            <p class="text-xs text-gray-500 mb-3">Tickets pendientes: <span class="text-white font-medium">{{ pendingSummary?.pending_tickets ?? 0 }}</span></p>
            <div class="input-field max-h-48 overflow-auto p-3 rounded-xl space-y-2 mb-4">
              <label v-for="ticket in pendingTickets" :key="ticket.id" class="flex items-start gap-2.5 text-sm text-gray-300 cursor-pointer hover:text-white transition-colors">
                <input v-model="selectedPendingTicketIds" :value="ticket.id" type="checkbox" class="accent-violet-500" />
                <span class="leading-snug">#{{ ticket.id }} · {{ ticket.gasto }} · {{ formatCurrency(Number(ticket.importe)) }}</span>
              </label>
            </div>
            <button @click="bulkReconcile" :disabled="actionLoading" class="action-btn w-full py-2.5 rounded-xl text-sm font-medium transition-all mb-4">
              Conciliación masiva
            </button>
            <div class="border-t border-white/5 pt-4">
              <label class="field-label mb-2 block">Importar CSV bancario</label>
              <input type="file" accept=".csv,text/csv"
                @change="csvFile = (($event.target as HTMLInputElement).files || [])[0] || null"
                class="file-input w-full text-xs text-gray-500 mb-3" />
              <button @click="importCsv" :disabled="actionLoading" class="secondary-btn w-full py-2.5 rounded-xl text-sm font-medium transition-all">
                Importar CSV
              </button>
            </div>
          </div>
        </section>

        <!-- Reportes + Calendario -->
        <section class="grid lg:grid-cols-2 gap-6">
          <div class="panel-card p-6 rounded-2xl">
            <h2 class="section-title mb-5">Reportes</h2>
            <div class="flex flex-wrap gap-2 mb-5">
              <select v-model="summaryPeriod" class="input-field p-2.5 rounded-xl outline-none transition-all cursor-pointer text-sm">
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
              </select>
              <button @click="loadReports" class="action-btn px-4 py-2.5 rounded-xl text-sm font-medium transition-all">Actualizar</button>
              <button @click="exportReport('csv')" class="secondary-btn px-4 py-2.5 rounded-xl text-sm font-medium transition-all">CSV</button>
              <button @click="exportReport('xls')" class="secondary-btn px-4 py-2.5 rounded-xl text-sm font-medium transition-all">XLS</button>
            </div>
            <div v-if="reportCompare" class="list-row p-4 rounded-xl mb-3">
              <p class="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-2">Comparativa</p>
              <p class="text-sm text-gray-400">Mes actual: <span class="text-white">{{ formatCurrency(reportCompare.current_month) }}</span></p>
              <p class="text-sm text-gray-400">Mes anterior: <span class="text-white">{{ formatCurrency(reportCompare.previous_month) }}</span></p>
              <p class="text-sm text-gray-400">Mismo mes año anterior: <span class="text-white">{{ formatCurrency(reportCompare.same_month_last_year) }}</span></p>
            </div>
            <div v-if="reportSummary" class="list-row p-4 rounded-xl mb-3">
              <p class="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-2">Resumen {{ reportSummary.period }}</p>
              <p class="text-sm text-gray-400">Rango: <span class="text-white">{{ reportSummary.start }} → {{ reportSummary.end }}</span></p>
              <p class="text-sm text-gray-400">Tickets: <span class="text-white">{{ reportSummary.total_tickets }}</span></p>
              <p class="text-sm text-gray-400">Gasto total: <span class="text-white">{{ formatCurrency(reportSummary.total_spent) }}</span></p>
            </div>
            <div v-if="reportCharts" class="list-row p-4 rounded-xl">
              <p class="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-2">Datos de gráficas</p>
              <p class="text-xs text-gray-500">Categorías: {{ Object.keys(reportCharts.evolution_by_category || {}).join(', ') || 'sin datos' }}</p>
              <p class="text-xs text-gray-500">Por día semana: {{ Object.keys(reportCharts.expenses_by_weekday || {}).join(', ') || 'sin datos' }}</p>
            </div>
          </div>

          <div class="panel-card p-6 rounded-2xl">
            <h2 class="section-title mb-5">Calendario de gastos</h2>
            <div v-if="!reportCalendar" class="text-sm text-gray-600">Sin datos del calendario.</div>
            <div v-else class="space-y-2 max-h-72 overflow-auto pr-1">
              <div v-for="(items, day) in reportCalendar.days" :key="day" class="list-row flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl gap-1">
                <p class="text-sm text-white font-medium">{{ day }}</p>
                <span class="text-xs text-violet-400 font-medium">{{ (items as any[]).length }} movimientos</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Recordatorios + Backup/Widgets -->
        <section class="grid lg:grid-cols-2 gap-6">
          <div class="panel-card p-6 rounded-2xl">
            <h2 class="section-title mb-5">Recordatorios</h2>
            <form @submit.prevent="createReminder" class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              <select v-model.number="reminderForm.ticket_id" class="input-field p-2.5 rounded-xl outline-none transition-all cursor-pointer text-sm">
                <option :value="null">Sin ticket</option>
                <option v-for="ticket in tickets" :key="ticket.id" :value="ticket.id">#{{ ticket.id }} - {{ ticket.gasto }}</option>
              </select>
              <select v-model="reminderForm.type" class="input-field p-2.5 rounded-xl outline-none transition-all cursor-pointer text-sm">
                <option value="in_app">In app</option>
                <option value="email">Email</option>
              </select>
              <input v-model="reminderForm.title" required type="text" placeholder="Título" class="input-field col-span-1 sm:col-span-2 p-2.5 rounded-xl outline-none transition-all" />
              <textarea v-model="reminderForm.message" required rows="3" placeholder="Mensaje" class="input-field col-span-1 sm:col-span-2 p-2.5 rounded-xl outline-none transition-all resize-none"></textarea>
              <input v-model="reminderForm.send_at" type="datetime-local" class="input-field col-span-1 sm:col-span-2 p-2.5 rounded-xl outline-none transition-all" />
              <button :disabled="actionLoading" class="col-span-1 sm:col-span-2 action-btn py-2.5 rounded-xl text-sm font-medium transition-all">Crear recordatorio</button>
            </form>
            <div class="space-y-2 max-h-56 overflow-auto pr-1">
              <div v-for="item in reminders" :key="item.id" class="list-row flex items-start justify-between p-3 rounded-xl gap-3">
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-white truncate">{{ item.title }}</p>
                  <p class="text-xs text-gray-500 mt-0.5 truncate">{{ item.message }}</p>
                  <span class="text-xs font-medium mt-1 inline-block"
                    :class="item.read_at ? 'text-violet-400' : 'text-yellow-400'"
                  >{{ item.read_at ? 'Leído' : 'Pendiente' }}</span>
                </div>
                <button v-if="!item.read_at" @click="markReminderRead(item.id)" class="text-xs text-violet-400 hover:text-violet-300 transition-colors whitespace-nowrap">Marcar leído</button>
              </div>
            </div>
          </div>

          <div class="panel-card p-6 rounded-2xl space-y-6">
            <!-- Backup -->
            <div>
              <h2 class="section-title mb-4">Backup</h2>
              <button @click="exportBackup" class="secondary-btn w-full py-2.5 rounded-xl text-sm font-medium transition-all mb-3">
                Exportar backup
              </button>
              <label class="field-label mb-2 block">Restaurar desde archivo</label>
              <input type="file" accept="application/json,.json"
                @change="restoreFile = (($event.target as HTMLInputElement).files || [])[0] || null"
                class="file-input w-full text-xs text-gray-500 mb-3" />
              <button @click="restoreBackup" class="action-btn w-full py-2.5 rounded-xl text-sm font-medium transition-all">
                Restaurar backup
              </button>
            </div>

            <!-- Widgets -->
            <div class="border-t border-white/5 pt-5">
              <h2 class="section-title mb-4">Widgets del dashboard</h2>
              <div class="space-y-2 mb-4">
                <div v-for="item in widgetDraft" :key="item.widget_key" class="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                  <input v-model="item.widget_key" class="input-field col-span-1 p-2 rounded-lg outline-none transition-all text-xs" />
                  <input v-model.number="item.position" type="number" min="0" class="input-field p-2 rounded-lg outline-none transition-all text-xs" />
                  <label class="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                    <input v-model="item.enabled" type="checkbox" class="accent-violet-500" />
                    Activo
                  </label>
                </div>
              </div>
              <button @click="saveWidgets" class="action-btn w-full py-2.5 rounded-xl text-sm font-medium transition-all">
                Guardar widgets
              </button>
            </div>
          </div>
        </section>

      </template>
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

/* Cards */
.panel-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(139, 92, 246, 0.12);
  backdrop-filter: blur(12px);
}

/* Section titles */
.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: white;
  letter-spacing: -0.01em;
}

/* Form inputs */
.input-field {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: white;
  font-size: 0.85rem;
}
.input-field:focus {
  border-color: rgba(139, 92, 246, 0.5);
  background: rgba(124, 58, 237, 0.05);
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}
.input-field::placeholder { color: rgba(255, 255, 255, 0.2); }
.input-field option { background: #0a0a0a; color: white; }

/* Field label */
.field-label {
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.3);
}

/* List rows */
.list-row {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.2s;
}
.list-row:hover {
  background: rgba(124, 58, 237, 0.05);
  border-color: rgba(139, 92, 246, 0.2);
}

/* Progress card */
.progress-card {
  background: rgba(124, 58, 237, 0.06);
  border: 1px solid rgba(139, 92, 246, 0.2);
}

/* Primary action button */
.action-btn {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(124, 58, 237, 0.25);
}
.action-btn:hover:not(:disabled) {
  box-shadow: 0 6px 24px rgba(124, 58, 237, 0.4);
  transform: translateY(-1px);
}
.action-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* Secondary button */
.secondary-btn {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.7);
}
.secondary-btn:hover { background: rgba(255, 255, 255, 0.07); color: white; border-color: rgba(255, 255, 255, 0.15); }

/* Delete button */
.delete-btn {
  color: rgba(248, 113, 113, 0.7);
  border: 1px solid rgba(248, 113, 113, 0.15);
}
.delete-btn:hover { color: #f87171; background: rgba(239, 68, 68, 0.08); border-color: rgba(248, 113, 113, 0.3); }

/* File input */
.file-input::file-selector-button {
  background: rgba(124, 58, 237, 0.15);
  border: 1px solid rgba(139, 92, 246, 0.3);
  color: #a78bfa;
  padding: 0.25rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  cursor: pointer;
  margin-right: 0.5rem;
  transition: all 0.2s;
}
.file-input::file-selector-button:hover { background: rgba(124, 58, 237, 0.25); }

/* Messages */
.msg-success {
  background: rgba(124, 58, 237, 0.08);
  border: 1px solid rgba(139, 92, 246, 0.25);
}
.msg-error {
  background: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(248, 113, 113, 0.2);
}

/* Date inputs */
input[type="date"]::-webkit-calendar-picker-indicator,
input[type="datetime-local"]::-webkit-calendar-picker-indicator {
  filter: invert(0.5) sepia(1) saturate(3) hue-rotate(230deg);
  cursor: pointer;
  opacity: 0.6;
}
input[type="date"]::-webkit-calendar-picker-indicator:hover,
input[type="datetime-local"]::-webkit-calendar-picker-indicator:hover { opacity: 1; }

/* Scrollbar */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(139, 92, 246, 0.3); border-radius: 2px; }
::-webkit-scrollbar-thumb:hover { background: rgba(139, 92, 246, 0.5); }

@keyframes fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-in { animation: fade-in 0.7s ease-out; }

html { scroll-behavior: smooth; }
</style>