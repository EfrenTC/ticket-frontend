<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useTickets } from '../composables/useTickets';
import Navbar from '../components/layout/Navbar.vue';
import api from '../services/api.service';
import type { TicketPayload } from '../types';

const { createTicket, errors, loading } = useTickets();
const router = useRouter();
const categories = ref<Array<{ id: number; name: string }>>([]);
const tags = ref<Array<{ id: number; name: string }>>([]);

const form = ref<TicketPayload>({
    gasto: '',
    importe: null,
    categoria: 'Otros',
    category_id: null,
    cif: '',
    metodo_pago: 'Tarjeta',
    conciliado: 'pendiente',
    fecha: new Date().toISOString().split('T')[0],
    tag_ids: [],
});

const handleSubmit = async () => {
    const success = await createTicket(form.value);
    if (success) router.push({ name: 'tickets' });
};

onMounted(async () => {
    try {
        const [categoriesResponse, tagsResponse] = await Promise.all([
            api.get('/api/categories'),
            api.get('/api/tags'),
        ]);
        categories.value = categoriesResponse.data || [];
        tags.value = tagsResponse.data || [];
    } catch (error) {
        console.error('No se pudo cargar catálogo de categorías/etiquetas', error);
    }
});
</script>

<template>
    <div class="min-h-screen bg-gray-50">
        <Navbar />
        <main class="max-w-3xl mx-auto mt-12 px-4 pb-12">
            <div class="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <div class="bg-blue-600 p-8 text-white">
                    <h1 class="text-2xl font-bold">Registrar Gasto</h1>
                </div>

                <form @submit.prevent="handleSubmit" class="p-8 space-y-5">
                    <div class="grid md:grid-cols-2 gap-5">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Concepto (Gasto)</label>
                            <input v-model="form.gasto" type="text" class="w-full p-3 rounded-xl border">
                            <span v-if="errors.gasto" class="text-red-500 text-xs">{{ errors.gasto[0] }}</span>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Importe (€)</label>
                            <input v-model.number="form.importe" type="number" step="0.01" placeholder="0.00"
                                class="w-full p-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none">
                            <span v-if="errors.importe" class="text-red-500 text-xs">{{ errors.importe[0] }}</span>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">CIF Empresa</label>
                            <input v-model="form.cif" type="text" placeholder="B12345678"
                                class="w-full p-3 rounded-xl border">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                            <select v-model="form.categoria" class="w-full p-3 rounded-xl border bg-white">
                                <option value="Restauración">Restauración</option>
                                <option value="Aparcamiento">Aparcamiento</option>
                                <option value="Peaje">Peaje</option>
                                <option value="Transporte">Transporte</option>
                                <option value="Alojamiento">Alojamiento</option>
                                <option value="Gasolina">Gasolina</option>
                                <option value="Otros">Otros</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Categoría personalizada</label>
                            <select v-model.number="form.category_id" class="w-full p-3 rounded-xl border bg-white">
                                <option :value="null">Sin categoría personalizada</option>
                                <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Etiquetas</label>
                        <select v-model="form.tag_ids" multiple class="w-full p-3 rounded-xl border bg-white min-h-28">
                            <option v-for="tag in tags" :key="tag.id" :value="tag.id">{{ tag.name }}</option>
                        </select>
                        <p class="text-xs text-gray-400 mt-1">Mantén Ctrl/Cmd para seleccionar varias.</p>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Método de Pago</label>
                        <div class="flex gap-3">
                            <button v-for="m in ['Efectivo', 'Tarjeta', 'Otros']" :key="m" type="button"
                                @click="form.metodo_pago = m"
                                :class="form.metodo_pago === m ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'"
                                class="flex-1 py-3 rounded-xl font-medium transition">
                                {{ m }}
                            </button>
                        </div>
                    </div>

                    <button type="submit" :disabled="loading"
                        class="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg">
                        {{ loading ? 'Guardando...' : 'Guardar Ticket' }}
                    </button>
                </form>
            </div>
        </main>
    </div>
</template>