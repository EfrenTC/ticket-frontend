<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import Navbar from '../components/layout/Navbar.vue';
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
    const [
      categoriesRes,
      tagsRes,
      ticketsRes,
      budgetsRes,
      alertsRes,
      goalsRes,
      remindersRes,
      pendingRes,
      widgetsRes,
    ] = await Promise.all([
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
  } catch (error: any) {
    setError(error, 'No se pudo crear la categoría');
  } finally {
    actionLoading.value = false;
  }
};

const deleteCategory = async (id: number) => {
  actionLoading.value = true;
  try {
    await api.delete(`/api/categories/${id}`, { data: { confirm: true } });
    setMessage('Categoría eliminada');
    await loadCore();
  } catch (error: any) {
    setError(error, 'No se pudo eliminar la categoría');
  } finally {
    actionLoading.value = false;
  }
};

const createTag = async () => {
  actionLoading.value = true;
  try {
    await api.post('/api/tags', tagForm.value);
    tagForm.value = { name: '' };
    setMessage('Etiqueta creada correctamente');
    await loadCore();
  } catch (error: any) {
    setError(error, 'No se pudo crear la etiqueta');
  } finally {
    actionLoading.value = false;
  }
};

const deleteTag = async (id: number) => {
  actionLoading.value = true;
  try {
    await api.delete(`/api/tags/${id}`, { data: { confirm: true } });
    setMessage('Etiqueta eliminada');
    await loadCore();
  } catch (error: any) {
    setError(error, 'No se pudo eliminar la etiqueta');
  } finally {
    actionLoading.value = false;
  }
};

const saveBudget = async () => {
  actionLoading.value = true;
  try {
    await api.post('/api/budgets', budgetForm.value);
    setMessage('Presupuesto guardado');
    await loadCore();
  } catch (error: any) {
    setError(error, 'No se pudo guardar el presupuesto');
  } finally {
    actionLoading.value = false;
  }
};

const deleteBudget = async (id: number) => {
  actionLoading.value = true;
  try {
    await api.delete(`/api/budgets/${id}`, { data: { confirm: true } });
    setMessage('Presupuesto eliminado');
    await loadCore();
  } catch (error: any) {
    setError(error, 'No se pudo eliminar el presupuesto');
  } finally {
    actionLoading.value = false;
  }
};

const createGoal = async () => {
  actionLoading.value = true;
  try {
    await api.post('/api/savings-goals', goalForm.value);
    setMessage('Meta creada');
    await loadCore();
  } catch (error: any) {
    setError(error, 'No se pudo crear la meta');
  } finally {
    actionLoading.value = false;
  }
};

const loadGoalProgress = async () => {
  if (!selectedGoalId.value) {
    goalProgress.value = null;
    return;
  }

  actionLoading.value = true;
  try {
    const response = await api.get(`/api/savings-goals/${selectedGoalId.value}/progress`);
    goalProgress.value = response.data;
  } catch (error: any) {
    setError(error, 'No se pudo cargar el progreso de la meta');
  } finally {
    actionLoading.value = false;
  }
};

const deleteGoal = async (id: number) => {
  actionLoading.value = true;
  try {
    await api.delete(`/api/savings-goals/${id}`, { data: { confirm: true } });
    if (selectedGoalId.value === id) {
      selectedGoalId.value = null;
      goalProgress.value = null;
    }
    setMessage('Meta eliminada');
    await loadCore();
  } catch (error: any) {
    setError(error, 'No se pudo eliminar la meta');
  } finally {
    actionLoading.value = false;
  }
};

const bulkReconcile = async () => {
  if (selectedPendingTicketIds.value.length === 0) {
    setError(null, 'Selecciona al menos un ticket pendiente');
    return;
  }

  actionLoading.value = true;
  try {
    const response = await api.post('/api/reconciliation/bulk', {
      ticket_ids: selectedPendingTicketIds.value,
      confirm: true,
    });
    setMessage(`${response.data?.updated_count || 0} tickets conciliados`);
    selectedPendingTicketIds.value = [];
    await loadCore();
  } catch (error: any) {
    setError(error, 'No se pudo completar la conciliación masiva');
  } finally {
    actionLoading.value = false;
  }
};

const importCsv = async () => {
  if (!csvFile.value) {
    setError(null, 'Selecciona un archivo CSV para importar');
    return;
  }

  actionLoading.value = true;
  try {
    const formData = new FormData();
    formData.append('file', csvFile.value);

    const response = await api.post('/api/reconciliation/import-csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    setMessage(`Importación completada: ${response.data?.matched || 0} conciliados, ${response.data?.not_matched || 0} no conciliados`);
    csvFile.value = null;
    await loadCore();
  } catch (error: any) {
    setError(error, 'No se pudo importar el CSV bancario');
  } finally {
    actionLoading.value = false;
  }
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
  } catch (error: any) {
    setError(error, 'No se pudieron obtener los reportes');
  } finally {
    actionLoading.value = false;
  }
};

const exportReport = async (format: 'csv' | 'xls') => {
  actionLoading.value = true;
  try {
    const response = await api.get('/api/reports/export', {
      params: { format, month: currentMonth, year: currentYear },
      responseType: 'blob',
    });

    const blob = new Blob([response.data], {
      type: format === 'xls' ? 'application/vnd.ms-excel' : 'text/csv',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tickets_${currentYear}_${String(currentMonth).padStart(2, '0')}.${format}`;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    setError(error, 'No se pudo exportar el reporte');
  } finally {
    actionLoading.value = false;
  }
};

const createReminder = async () => {
  actionLoading.value = true;
  try {
    await api.post('/api/reminders', {
      ...reminderForm.value,
      send_at: reminderForm.value.send_at || null,
    });
    reminderForm.value = {
      ticket_id: null,
      type: 'in_app',
      title: '',
      message: '',
      send_at: '',
    };
    setMessage('Recordatorio creado');
    await loadCore();
  } catch (error: any) {
    setError(error, 'No se pudo crear el recordatorio');
  } finally {
    actionLoading.value = false;
  }
};

const markReminderRead = async (id: number) => {
  actionLoading.value = true;
  try {
    await api.post(`/api/reminders/${id}/read`);
    await loadCore();
  } catch (error: any) {
    setError(error, 'No se pudo marcar el recordatorio como leído');
  } finally {
    actionLoading.value = false;
  }
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
  } catch (error: any) {
    setError(error, 'No se pudo exportar el backup');
  } finally {
    actionLoading.value = false;
  }
};

const restoreBackup = async () => {
  if (!restoreFile.value) {
    setError(null, 'Selecciona un archivo de backup .json');
    return;
  }

  actionLoading.value = true;
  try {
    const formData = new FormData();
    formData.append('file', restoreFile.value);
    formData.append('confirm', '1');

    await api.post('/api/backup/restore', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    setMessage('Restauración completada');
    restoreFile.value = null;
    await loadCore();
  } catch (error: any) {
    setError(error, 'No se pudo restaurar el backup');
  } finally {
    actionLoading.value = false;
  }
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
  } catch (error: any) {
    setError(error, 'No se pudieron guardar los widgets');
  } finally {
    actionLoading.value = false;
  }
};

onMounted(async () => {
  await loadCore();
  await loadReports();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />

    <main class="max-w-7xl mx-auto mt-10 px-4 pb-12 space-y-8">
      <section>
        <h1 class="text-3xl font-bold text-gray-900">Módulos avanzados</h1>
        <p class="text-gray-500">Integración completa de las nuevas características del backend.</p>
      </section>

      <div v-if="globalMessage" class="p-4 rounded-xl bg-green-50 text-green-700 border border-green-200">{{ globalMessage }}</div>
      <div v-if="globalError" class="p-4 rounded-xl bg-red-50 text-red-700 border border-red-200">{{ globalError }}</div>

      <div v-if="loading" class="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center text-gray-500">
        Cargando módulos...
      </div>

      <template v-else>
        <section class="grid lg:grid-cols-2 gap-6">
          <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 class="text-xl font-bold mb-4">Categorías</h2>
            <form @submit.prevent="createCategory" class="grid grid-cols-4 gap-3 mb-4">
              <input v-model="categoryForm.name" required type="text" placeholder="Nombre" class="col-span-2 p-2 border rounded-lg" />
              <input v-model="categoryForm.color" type="text" placeholder="#6B7280" class="p-2 border rounded-lg" />
              <input v-model="categoryForm.icon" type="text" placeholder="Icono" class="p-2 border rounded-lg" />
              <button :disabled="actionLoading" class="col-span-4 bg-blue-600 text-white py-2 rounded-lg">Crear categoría</button>
            </form>
            <div class="space-y-2">
              <div v-for="item in categories" :key="item.id" class="flex items-center justify-between border rounded-lg p-2">
                <div>
                  <p class="font-semibold text-gray-900">{{ item.name }}</p>
                  <p class="text-xs text-gray-500">{{ item.color }} · {{ item.icon || 'sin icono' }}</p>
                </div>
                <button @click="deleteCategory(item.id)" class="text-red-600 text-sm">Eliminar</button>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 class="text-xl font-bold mb-4">Etiquetas</h2>
            <form @submit.prevent="createTag" class="flex gap-3 mb-4">
              <input v-model="tagForm.name" required type="text" placeholder="Nombre de etiqueta" class="flex-1 p-2 border rounded-lg" />
              <button :disabled="actionLoading" class="bg-blue-600 text-white px-4 rounded-lg">Crear</button>
            </form>
            <div class="space-y-2">
              <div v-for="item in tags" :key="item.id" class="flex items-center justify-between border rounded-lg p-2">
                <p class="font-semibold text-gray-900">{{ item.name }}</p>
                <button @click="deleteTag(item.id)" class="text-red-600 text-sm">Eliminar</button>
              </div>
            </div>
          </div>
        </section>

        <section class="grid lg:grid-cols-2 gap-6">
          <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 class="text-xl font-bold mb-4">Presupuestos</h2>
            <form @submit.prevent="saveBudget" class="grid grid-cols-2 gap-3 mb-4">
              <select v-model.number="budgetForm.category_id" class="p-2 border rounded-lg">
                <option :value="null">Global</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
              </select>
              <input v-model.number="budgetForm.amount" required min="0" step="0.01" type="number" placeholder="Importe" class="p-2 border rounded-lg" />
              <input v-model.number="budgetForm.month" required min="1" max="12" type="number" placeholder="Mes" class="p-2 border rounded-lg" />
              <input v-model.number="budgetForm.year" required min="2000" max="2100" type="number" placeholder="Año" class="p-2 border rounded-lg" />
              <button :disabled="actionLoading" class="col-span-2 bg-blue-600 text-white py-2 rounded-lg">Guardar presupuesto</button>
            </form>

            <div class="space-y-2">
              <div v-for="item in budgets" :key="item.id" class="flex items-center justify-between border rounded-lg p-2">
                <div>
                  <p class="font-semibold">{{ item.category?.name || 'Global' }} · {{ item.month }}/{{ item.year }}</p>
                  <p class="text-sm text-gray-500">{{ formatCurrency(item.amount) }}</p>
                </div>
                <button @click="deleteBudget(item.id)" class="text-red-600 text-sm">Eliminar</button>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 class="text-xl font-bold mb-4">Alertas de presupuesto</h2>
            <div class="space-y-2">
              <div v-for="alert in budgetAlerts" :key="alert.budget_id" class="border rounded-lg p-3">
                <p class="font-semibold text-gray-900">{{ alert.category_name || 'Global' }}</p>
                <p class="text-sm text-gray-600">{{ formatCurrency(alert.spent) }} / {{ formatCurrency(alert.budget) }}</p>
                <p class="text-xs"
                  :class="alert.status === 'exceeded' ? 'text-red-600' : (alert.status === 'near_limit' ? 'text-yellow-600' : 'text-green-600')"
                >Estado: {{ alert.status }} · Ratio {{ alert.ratio }}</p>
              </div>
            </div>
          </div>
        </section>

        <section class="grid lg:grid-cols-2 gap-6">
          <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 class="text-xl font-bold mb-4">Metas de ahorro</h2>
            <form @submit.prevent="createGoal" class="grid grid-cols-2 gap-3 mb-4">
              <input v-model="goalForm.title" required type="text" placeholder="Título" class="col-span-2 p-2 border rounded-lg" />
              <input v-model.number="goalForm.target_amount" required min="0" step="0.01" type="number" placeholder="Objetivo" class="p-2 border rounded-lg" />
              <div></div>
              <input v-model="goalForm.start_date" required type="date" class="p-2 border rounded-lg" />
              <input v-model="goalForm.end_date" required type="date" class="p-2 border rounded-lg" />
              <button :disabled="actionLoading" class="col-span-2 bg-blue-600 text-white py-2 rounded-lg">Crear meta</button>
            </form>

            <div class="space-y-2">
              <div v-for="item in goals" :key="item.id" class="border rounded-lg p-3">
                <div class="flex items-center justify-between">
                  <p class="font-semibold">{{ item.title }}</p>
                  <div class="space-x-3">
                    <button @click="selectedGoalId = item.id; loadGoalProgress()" class="text-blue-600 text-sm">Progreso</button>
                    <button @click="deleteGoal(item.id)" class="text-red-600 text-sm">Eliminar</button>
                  </div>
                </div>
                <p class="text-sm text-gray-600">{{ formatCurrency(item.target_amount) }} · {{ item.start_date }} → {{ item.end_date }}</p>
              </div>
            </div>

            <div v-if="goalProgress" class="mt-4 border rounded-lg p-3 bg-gray-50">
              <p class="font-semibold">Progreso de {{ goalProgress.goal?.title }}</p>
              <p class="text-sm text-gray-600">Gastado periodo: {{ formatCurrency(goalProgress.spent_in_period) }}</p>
              <p class="text-sm text-gray-600">Ahorro estimado: {{ formatCurrency(goalProgress.saved_amount) }}</p>
              <p class="text-sm text-gray-600">Progreso: {{ goalProgress.progress_percent }}%</p>
            </div>
          </div>

          <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 class="text-xl font-bold mb-4">Conciliación</h2>
            <p class="text-sm text-gray-600 mb-3">Pendientes: {{ pendingSummary?.pending_tickets ?? 0 }}</p>

            <div class="max-h-52 overflow-auto border rounded-lg p-3 space-y-2 mb-4">
              <label v-for="ticket in pendingTickets" :key="ticket.id" class="flex items-center gap-2 text-sm">
                <input v-model="selectedPendingTicketIds" :value="ticket.id" type="checkbox" />
                <span>#{{ ticket.id }} · {{ ticket.gasto }} · {{ formatCurrency(Number(ticket.importe)) }}</span>
              </label>
            </div>

            <button @click="bulkReconcile" :disabled="actionLoading" class="w-full bg-blue-600 text-white py-2 rounded-lg mb-4">
              Conciliación masiva
            </button>

            <div class="border-t pt-4">
              <label class="block text-sm font-semibold mb-2">Importar CSV bancario</label>
              <input type="file" accept=".csv,text/csv" @change="csvFile = (($event.target as HTMLInputElement).files || [])[0] || null" class="mb-3" />
              <button @click="importCsv" :disabled="actionLoading" class="w-full bg-gray-900 text-white py-2 rounded-lg">
                Importar CSV
              </button>
            </div>
          </div>
        </section>

        <section class="grid lg:grid-cols-2 gap-6">
          <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 class="text-xl font-bold mb-4">Reportes</h2>
            <div class="flex gap-2 mb-4">
              <select v-model="summaryPeriod" class="p-2 border rounded-lg">
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
              </select>
              <button @click="loadReports" class="bg-blue-600 text-white px-4 rounded-lg">Actualizar</button>
              <button @click="exportReport('csv')" class="bg-gray-700 text-white px-3 rounded-lg">CSV</button>
              <button @click="exportReport('xls')" class="bg-gray-900 text-white px-3 rounded-lg">XLS</button>
            </div>

            <div v-if="reportCompare" class="border rounded-lg p-3 mb-3">
              <p class="font-semibold">Comparativa</p>
              <p class="text-sm text-gray-600">Mes actual: {{ formatCurrency(reportCompare.current_month) }}</p>
              <p class="text-sm text-gray-600">Mes anterior: {{ formatCurrency(reportCompare.previous_month) }}</p>
              <p class="text-sm text-gray-600">Mismo mes año anterior: {{ formatCurrency(reportCompare.same_month_last_year) }}</p>
            </div>

            <div v-if="reportSummary" class="border rounded-lg p-3 mb-3">
              <p class="font-semibold">Resumen {{ reportSummary.period }}</p>
              <p class="text-sm text-gray-600">Rango: {{ reportSummary.start }} → {{ reportSummary.end }}</p>
              <p class="text-sm text-gray-600">Tickets: {{ reportSummary.total_tickets }}</p>
              <p class="text-sm text-gray-600">Gasto: {{ formatCurrency(reportSummary.total_spent) }}</p>
            </div>

            <div v-if="reportCharts" class="border rounded-lg p-3">
              <p class="font-semibold mb-2">Gráficas (resumen texto)</p>
              <p class="text-xs text-gray-500">Categorías: {{ Object.keys(reportCharts.evolution_by_category || {}).join(', ') || 'sin datos' }}</p>
              <p class="text-xs text-gray-500">Por día semana: {{ Object.keys(reportCharts.expenses_by_weekday || {}).join(', ') || 'sin datos' }}</p>
            </div>
          </div>

          <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 class="text-xl font-bold mb-4">Calendario de gastos</h2>
            <div v-if="!reportCalendar" class="text-sm text-gray-500">Sin datos del calendario.</div>
            <div v-else class="space-y-2 max-h-72 overflow-auto">
              <div v-for="(items, day) in reportCalendar.days" :key="day" class="border rounded-lg p-2">
                <p class="font-semibold">{{ day }}</p>
                <p class="text-xs text-gray-500">{{ items.length }} movimientos</p>
              </div>
            </div>
          </div>
        </section>

        <section class="grid lg:grid-cols-2 gap-6">
          <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 class="text-xl font-bold mb-4">Recordatorios</h2>
            <form @submit.prevent="createReminder" class="grid grid-cols-2 gap-3 mb-4">
              <select v-model.number="reminderForm.ticket_id" class="p-2 border rounded-lg">
                <option :value="null">Sin ticket</option>
                <option v-for="ticket in tickets" :key="ticket.id" :value="ticket.id">#{{ ticket.id }} - {{ ticket.gasto }}</option>
              </select>
              <select v-model="reminderForm.type" class="p-2 border rounded-lg">
                <option value="in_app">In app</option>
                <option value="email">Email</option>
              </select>
              <input v-model="reminderForm.title" required type="text" placeholder="Título" class="col-span-2 p-2 border rounded-lg" />
              <textarea v-model="reminderForm.message" required rows="3" placeholder="Mensaje" class="col-span-2 p-2 border rounded-lg"></textarea>
              <input v-model="reminderForm.send_at" type="datetime-local" class="col-span-2 p-2 border rounded-lg" />
              <button :disabled="actionLoading" class="col-span-2 bg-blue-600 text-white py-2 rounded-lg">Crear recordatorio</button>
            </form>

            <div class="space-y-2 max-h-56 overflow-auto">
              <div v-for="item in reminders" :key="item.id" class="border rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p class="font-semibold">{{ item.title }}</p>
                  <p class="text-xs text-gray-500">{{ item.message }}</p>
                  <p class="text-xs" :class="item.read_at ? 'text-green-600' : 'text-yellow-600'">{{ item.read_at ? 'Leído' : 'Pendiente' }}</p>
                </div>
                <button v-if="!item.read_at" @click="markReminderRead(item.id)" class="text-blue-600 text-sm">Marcar leído</button>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 class="text-xl font-bold mb-4">Backup y widgets</h2>

            <div class="mb-6 border rounded-lg p-3">
              <p class="font-semibold mb-2">Backup</p>
              <div class="flex gap-2 mb-2">
                <button @click="exportBackup" class="bg-gray-900 text-white px-3 py-2 rounded-lg">Exportar backup</button>
              </div>
              <input type="file" accept="application/json,.json" @change="restoreFile = (($event.target as HTMLInputElement).files || [])[0] || null" class="mb-2" />
              <button @click="restoreBackup" class="w-full bg-blue-600 text-white py-2 rounded-lg">Restaurar backup</button>
            </div>

            <div class="border rounded-lg p-3">
              <p class="font-semibold mb-2">Widgets dashboard</p>
              <div class="space-y-2 mb-3">
                <div v-for="(item, index) in widgetDraft" :key="item.widget_key" class="grid grid-cols-3 gap-2 items-center">
                  <input v-model="item.widget_key" class="p-2 border rounded-lg text-sm" />
                  <input v-model.number="item.position" type="number" min="0" class="p-2 border rounded-lg text-sm" />
                  <label class="flex items-center gap-2 text-sm">
                    <input v-model="item.enabled" type="checkbox" /> Activo
                  </label>
                </div>
              </div>
              <button @click="saveWidgets" class="w-full bg-blue-600 text-white py-2 rounded-lg">Guardar widgets</button>
            </div>
          </div>
        </section>
      </template>
    </main>
  </div>
</template>
