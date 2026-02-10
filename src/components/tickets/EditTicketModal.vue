<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Ticket, TicketPayload } from '../../types';

const props = defineProps<{
  show: boolean;
  ticket: Ticket | null;
  loading: boolean;
  errors: any;
}>();

const emit = defineEmits(['close', 'save']);

const form = ref<TicketPayload>({
  gasto: '',
  importe: 0,
  categoria: '',
  cif: '',
  metodo_pago: '',
  conciliado: 'pendiente',
  fecha: ''
});

// Sincronizar el formulario cuando cambia el ticket seleccionado
watch(() => props.ticket, (newTicket) => {
  if (newTicket) {
    form.value = {
      gasto: newTicket.gasto,
      importe: Number(newTicket.importe),
      categoria: newTicket.categoria,
      cif: newTicket.cif,
      metodo_pago: newTicket.metodo_pago,
      conciliado: newTicket.conciliado,
      fecha: new Date(newTicket.fecha).toISOString().split('T')[0]
    };
  }
}, { immediate: true });

const categories = ['Restauración', 'Aparcamiento', 'Peaje', 'Transporte', 'Alojamiento', 'Gasolina', 'Otros'];
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
      <div class="bg-blue-600 p-6 text-white flex justify-between items-center">
        <h2 class="text-xl font-bold">Editar Ticket</h2>
        <button @click="$emit('close')" class="hover:bg-blue-700 p-2 rounded-full transition">✕</button>
      </div>

      <form @submit.prevent="$emit('save', form)" class="p-8 space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <label class="block text-sm font-semibold text-gray-700 mb-1">Concepto</label>
            <input v-model="form.gasto" type="text" class="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500">
            <p v-if="errors.gasto" class="text-red-500 text-xs mt-1">{{ errors.gasto[0] }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Importe (€)</label>
            <input v-model.number="form.importe" type="number" step="0.01" class="w-full p-3 border rounded-xl">
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Fecha</label>
            <input v-model="form.fecha" type="date" class="w-full p-3 border rounded-xl">
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Categoría</label>
            <select v-model="form.categoria" class="w-full p-3 border rounded-xl bg-white">
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">CIF</label>
            <input v-model="form.cif" type="text" class="w-full p-3 border rounded-xl">
          </div>
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Estado</label>
          <div class="flex gap-4">
            <button type="button" @click="form.conciliado = 'pendiente'" 
              :class="form.conciliado === 'pendiente' ? 'bg-yellow-100 border-yellow-500 text-yellow-700' : 'bg-gray-50 border-gray-200 text-gray-500'"
              class="flex-1 p-3 border rounded-xl font-bold transition">⏳ Pendiente</button>
            <button type="button" @click="form.conciliado = 'terminado'"
              :class="form.conciliado === 'terminado' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-500'"
              class="flex-1 p-3 border rounded-xl font-bold transition">✅ Terminado</button>
          </div>
        </div>

        <div class="flex gap-3 pt-4">
          <button type="button" @click="$emit('close')" class="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition">Cancelar</button>
          <button type="submit" :disabled="loading" class="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg transition">
            {{ loading ? 'Guardando...' : 'Actualizar Ticket' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>