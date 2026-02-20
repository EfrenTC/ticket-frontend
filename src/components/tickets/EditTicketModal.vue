<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Ticket, TicketPayload } from '../../types';

const props = defineProps<{
  show: boolean;
  ticket: Ticket | null;
  loading: boolean;
  errors: any;
  categories?: Array<{ id: number; name: string }>;
  tags?: Array<{ id: number; name: string }>;
}>();

const emit = defineEmits(['close', 'save']);

const form = ref<TicketPayload>({
  gasto: '',
  importe: 0,
  categoria: 'Otros',
  category_id: null,
  cif: '',
  metodo_pago: 'Tarjeta',
  conciliado: 'pendiente',
  fecha: '',
  tag_ids: [],
});

watch(() => props.ticket, (newTicket) => {
  if (newTicket) {
    form.value = {
      gasto: newTicket.gasto,
      importe: Number(newTicket.importe),
      categoria: newTicket.categoria,
      category_id: newTicket.category_id ?? null,
      cif: newTicket.cif,
      metodo_pago: newTicket.metodo_pago,
      conciliado: newTicket.conciliado,
      fecha: new Date(newTicket.fecha).toISOString().split('T')[0],
      tag_ids: (newTicket.tags || []).map(tag => tag.id),
    };
  }
}, { immediate: true });

const categoryOptions = ['Restauración', 'Aparcamiento', 'Peaje', 'Transporte', 'Alojamiento', 'Gasolina', 'Otros'];
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @mousedown.self="$emit('close')"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/70 backdrop-blur-md"></div>

        <!-- Modal -->
        <div class="modal-card relative w-full max-w-2xl rounded-3xl overflow-hidden z-10">

          <!-- Header -->
          <div class="modal-header px-8 py-6 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 text-violet-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-bold text-white tracking-tight">Editar Ticket</h2>
                <p class="text-xs text-gray-500 mt-0.5">Actualiza los datos del gasto</p>
              </div>
            </div>
            <button
              @click="$emit('close')"
              class="close-btn w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Form -->
          <form @submit.prevent="$emit('save', form)" class="px-8 pb-8 space-y-5 max-h-[70vh] overflow-y-auto">

            <!-- Concepto -->
            <div>
              <label class="field-label">Concepto</label>
              <input v-model="form.gasto" type="text" placeholder="Ej. Comida de trabajo"
                class="input-field w-full p-3 rounded-xl outline-none transition-all" />
              <p v-if="errors.gasto" class="error-msg mt-1.5">{{ errors.gasto[0] }}</p>
            </div>

            <!-- Importe + Fecha -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="field-label">Importe (€)</label>
                <input v-model.number="form.importe" type="number" step="0.01" placeholder="0.00"
                  class="input-field w-full p-3 rounded-xl outline-none transition-all" />
              </div>
              <div>
                <label class="field-label">Fecha</label>
                <input v-model="form.fecha" type="date"
                  class="input-field w-full p-3 rounded-xl outline-none transition-all" />
              </div>
            </div>

            <!-- Categoría + Categoría personalizada -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="field-label">Categoría</label>
                <select v-model="form.categoria" class="input-field w-full p-3 rounded-xl outline-none transition-all cursor-pointer">
                  <option v-for="cat in categoryOptions" :key="cat" :value="cat">{{ cat }}</option>
                </select>
              </div>
              <div>
                <label class="field-label">Categoría personalizada</label>
                <select v-model.number="form.category_id" class="input-field w-full p-3 rounded-xl outline-none transition-all cursor-pointer">
                  <option :value="null">Sin categoría</option>
                  <option v-for="item in props.categories || []" :key="item.id" :value="item.id">{{ item.name }}</option>
                </select>
              </div>
            </div>

            <!-- CIF -->
            <div>
              <label class="field-label">CIF Empresa</label>
              <input v-model="form.cif" type="text" placeholder="B12345678"
                class="input-field w-full p-3 rounded-xl outline-none transition-all" />
            </div>

            <!-- Etiquetas -->
            <div>
              <label class="field-label">Etiquetas</label>
              <select v-model="form.tag_ids" multiple
                class="input-field w-full p-3 rounded-xl outline-none transition-all min-h-24 cursor-pointer">
                <option v-for="item in props.tags || []" :key="item.id" :value="item.id">{{ item.name }}</option>
              </select>
              <p class="text-xs text-gray-600 mt-1.5">Mantén Ctrl / Cmd para seleccionar varias.</p>
            </div>

            <!-- Estado de conciliación -->
            <div>
              <label class="field-label mb-3 block">Estado</label>
              <div class="flex gap-3">
                <button
                  type="button"
                  @click="form.conciliado = 'pendiente'"
                  :class="form.conciliado === 'pendiente' ? 'estado-pending-active' : 'estado-inactive'"
                  class="flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  Pendiente
                </button>
                <button
                  type="button"
                  @click="form.conciliado = 'terminado'"
                  :class="form.conciliado === 'terminado' ? 'estado-done-active' : 'estado-inactive'"
                  class="flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  Terminado
                </button>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-3 pt-2">
              <button
                type="button"
                @click="$emit('close')"
                class="cancel-btn flex-1 py-3 rounded-xl text-sm font-medium transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="loading"
                class="submit-btn flex-1 py-3 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ loading ? 'Guardando...' : 'Actualizar Ticket' }}
              </button>
            </div>

          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

* { font-family: 'DM Sans', sans-serif; }
h2 { font-family: 'Syne', sans-serif; }

/* Modal card */
.modal-card {
  background: #0d0d0d;
  border: 1px solid rgba(139, 92, 246, 0.2);
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.8), 0 0 60px rgba(124, 58, 237, 0.08);
}

/* Header */
.modal-header {
  background: rgba(124, 58, 237, 0.06);
  border-bottom: 1px solid rgba(139, 92, 246, 0.1);
}

/* Close button */
.close-btn { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); }
.close-btn:hover { background: rgba(255, 255, 255, 0.08); border-color: rgba(255, 255, 255, 0.12); }

/* Field label */
.field-label {
  display: block;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.3);
  margin-bottom: 0.5rem;
}

/* Inputs */
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
.input-field::placeholder { color: rgba(255, 255, 255, 0.18); }
.input-field option { background: #0d0d0d; color: white; }

/* Error */
.error-msg { font-size: 0.7rem; color: #f87171; }

/* Estado buttons */
.estado-inactive {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.07);
  color: rgba(255, 255, 255, 0.35);
}
.estado-inactive:hover { background: rgba(255, 255, 255, 0.04); color: rgba(255, 255, 255, 0.6); }

.estado-pending-active {
  background: rgba(234, 179, 8, 0.1);
  border: 1px solid rgba(234, 179, 8, 0.3);
  color: #fbbf24;
}
.estado-done-active {
  background: rgba(124, 58, 237, 0.12);
  border: 1px solid rgba(139, 92, 246, 0.35);
  color: #a78bfa;
}

/* Cancel button */
.cancel-btn {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
  color: rgba(255, 255, 255, 0.4);
}
.cancel-btn:hover { background: rgba(255, 255, 255, 0.06); color: rgba(255, 255, 255, 0.7); }

/* Submit button */
.submit-btn {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  color: white;
  box-shadow: 0 4px 20px rgba(124, 58, 237, 0.3);
}
.submit-btn:hover:not(:disabled) { box-shadow: 0 6px 28px rgba(124, 58, 237, 0.45); }

/* Date input */
input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(0.5) sepia(1) saturate(3) hue-rotate(230deg);
  cursor: pointer; opacity: 0.6;
}
input[type="date"]::-webkit-calendar-picker-indicator:hover { opacity: 1; }

/* Scrollbar */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(139, 92, 246, 0.3); border-radius: 2px; }

/* Modal transition */
.modal-enter-active, .modal-leave-active { transition: all 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.96); }
</style>