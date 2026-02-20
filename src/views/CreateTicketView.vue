<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useTickets } from '../composables/useTickets';
import Navbar from '../components/layout/Navbar.vue';
import Footer from '../components/layout/Footer.vue';
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
    <div class="min-h-screen bg-black text-white overflow-hidden">
        <!-- Background effects -->
        <div class="fixed inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
        <div class="fixed top-0 right-1/3 w-96 h-96 bg-violet-700 rounded-full blur-3xl opacity-10 pointer-events-none"></div>
        <div class="fixed bottom-1/4 left-1/4 w-72 h-72 bg-purple-600 rounded-full blur-3xl opacity-8 pointer-events-none"></div>

        <Navbar />

        <main class="max-w-3xl mx-auto mt-24 px-4 pb-16">
            <div class="form-card rounded-3xl overflow-hidden animate-fade-in">

                <!-- Header -->
                <div class="form-header px-8 py-7 flex items-center gap-4">
                    <div class="w-10 h-10 text-violet-300">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
                        </svg>
                    </div>
                    <div>
                        <h1 class="text-xl font-bold text-white tracking-tight">Registrar Gasto</h1>
                        <p class="text-xs text-gray-500 mt-0.5">Completa los datos del ticket</p>
                    </div>
                </div>

                <form @submit.prevent="handleSubmit" class="px-8 pb-8 space-y-6">

                    <!-- Concepto + Importe -->
                    <div class="grid md:grid-cols-2 gap-5">
                        <div>
                            <label class="field-label">Concepto</label>
                            <input v-model="form.gasto" type="text" placeholder="Ej. Comida de trabajo"
                                class="input-field w-full p-3 rounded-xl outline-none transition-all duration-200" />
                            <span v-if="errors.gasto" class="error-msg">{{ errors.gasto[0] }}</span>
                        </div>
                        <div>
                            <label class="field-label">Importe (€)</label>
                            <input v-model.number="form.importe" type="number" step="0.01" placeholder="0.00"
                                class="input-field w-full p-3 rounded-xl outline-none transition-all duration-200" />
                            <span v-if="errors.importe" class="error-msg">{{ errors.importe[0] }}</span>
                        </div>
                    </div>

                    <!-- CIF + Categoría -->
                    <div class="grid md:grid-cols-2 gap-5">
                        <div>
                            <label class="field-label">CIF Empresa</label>
                            <input v-model="form.cif" type="text" placeholder="B12345678"
                                class="input-field w-full p-3 rounded-xl outline-none transition-all duration-200" />
                        </div>
                        <div>
                            <label class="field-label">Categoría</label>
                            <select v-model="form.categoria" class="input-field w-full p-3 rounded-xl outline-none transition-all duration-200 cursor-pointer">
                                <option value="Restauración">Restauración</option>
                                <option value="Aparcamiento">Aparcamiento</option>
                                <option value="Peaje">Peaje</option>
                                <option value="Transporte">Transporte</option>
                                <option value="Alojamiento">Alojamiento</option>
                                <option value="Gasolina">Gasolina</option>
                                <option value="Otros">Otros</option>
                            </select>
                        </div>
                    </div>

                    <!-- Categoría personalizada -->
                    <div>
                        <label class="field-label">Categoría personalizada</label>
                        <select v-model.number="form.category_id" class="input-field w-full p-3 rounded-xl outline-none transition-all duration-200 cursor-pointer">
                            <option :value="null">Sin categoría personalizada</option>
                            <option v-for="category in categories" :key="category.id" :value="category.id">
                                {{ category.name }}
                            </option>
                        </select>
                    </div>

                    <!-- Etiquetas -->
                    <div>
                        <label class="field-label">Etiquetas</label>
                        <select v-model="form.tag_ids" multiple
                            class="input-field w-full p-3 rounded-xl outline-none transition-all duration-200 min-h-28 cursor-pointer">
                            <option v-for="tag in tags" :key="tag.id" :value="tag.id">{{ tag.name }}</option>
                        </select>
                        <p class="text-xs text-gray-600 mt-1.5">Mantén Ctrl / Cmd para seleccionar varias.</p>
                    </div>

                    <!-- Fecha -->
                    <div>
                        <label class="field-label">Fecha</label>
                        <input v-model="form.fecha" type="date"
                            class="input-field w-full p-3 rounded-xl outline-none transition-all duration-200" />
                    </div>

                    <!-- Método de Pago -->
                    <div>
                        <label class="field-label mb-3 block">Método de Pago</label>
                        <div class="flex gap-3">
                            <button
                                v-for="m in ['Efectivo', 'Tarjeta', 'Otros']"
                                :key="m"
                                type="button"
                                @click="form.metodo_pago = m"
                                :class="form.metodo_pago === m ? 'pago-active' : 'pago-inactive'"
                                class="flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                            >
                                {{ m }}
                            </button>
                        </div>
                    </div>

                    <!-- Submit -->
                    <button
                        type="submit"
                        :disabled="loading"
                        class="submit-btn w-full py-3.5 rounded-xl font-semibold transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                        {{ loading ? 'Guardando...' : 'Guardar Ticket' }}
                    </button>
                </form>
            </div>
        </main>

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

.form-card {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(139, 92, 246, 0.15);
    backdrop-filter: blur(16px);
}

.form-header {
    background: rgba(124, 58, 237, 0.08);
    border-bottom: 1px solid rgba(139, 92, 246, 0.12);
}

.field-label {
    display: block;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: rgba(255, 255, 255, 0.35);
    margin-bottom: 0.5rem;
}

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
.input-field::placeholder {
    color: rgba(255, 255, 255, 0.18);
}
.input-field option {
    background: #0a0a0a;
    color: white;
}

.error-msg {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    margin-top: 0.375rem;
    font-size: 0.7rem;
    color: #f87171;
}

.pago-active {
    background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
    color: white;
    box-shadow: 0 4px 16px rgba(124, 58, 237, 0.3);
}
.pago-inactive {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.4);
}
.pago-inactive:hover {
    background: rgba(124, 58, 237, 0.08);
    border-color: rgba(139, 92, 246, 0.3);
    color: rgba(255, 255, 255, 0.7);
}

.submit-btn {
    background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
    color: white;
    box-shadow: 0 4px 24px rgba(124, 58, 237, 0.3);
}
.submit-btn:hover:not(:disabled) {
    box-shadow: 0 8px 32px rgba(124, 58, 237, 0.45);
}

@keyframes fade-in {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-in { animation: fade-in 0.7s ease-out; }

/* Date input calendar icon color fix */
input[type="date"]::-webkit-calendar-picker-indicator {
    filter: invert(0.5) sepia(1) saturate(3) hue-rotate(230deg);
    cursor: pointer;
    opacity: 0.6;
}
input[type="date"]::-webkit-calendar-picker-indicator:hover {
    opacity: 1;
}

html { scroll-behavior: smooth; }
</style>