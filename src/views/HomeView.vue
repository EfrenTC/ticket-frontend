<script setup>
import Navbar from '../components/layout/Navbar.vue';
import Footer from '../components/layout/Footer.vue';
import { ref, onMounted } from 'vue';

const stats = ref([
  { label: 'Tickets Procesados', value: 0, target: 15420 },
  { label: 'Ahorro Promedio', value: 0, target: 23, suffix: '%' },
  { label: 'Usuarios Activos', value: 0, target: 2840 }
]);

const features = [
  {
    title: 'Control de Gastos',
    description: 'Registra importes, CIF y métodos de pago en segundos. Mantén un control exhaustivo de cada euro gastado.',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>`
  },
  {
    title: 'Categorización Inteligente',
    description: 'Restauración, transporte, gasolina, alojamiento... todo organizado automáticamente por categorías.',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6Z" /></svg>`
  },
  {
    title: 'Logs en Tiempo Real',
    description: 'Historial inmutable de tus movimientos. Cada cambio queda registrado con MongoDB Atlas.',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>`
  },
  {
    title: 'Múltiples Métodos de Pago',
    description: 'Efectivo, tarjeta u otros. Registra y filtra por tu método de pago preferido.',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" /></svg>`
  },
  {
    title: 'Estado de Conciliación',
    description: 'Marca tus tickets como pendientes o terminados. Lleva un control perfecto de tus cuentas.',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>`
  },
  {
    title: 'Organización Temporal',
    description: 'Filtra por fechas, visualiza tendencias y genera informes mensuales automáticamente.',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>`
  }
];

const categories = [
  { name: 'Restauración', svg: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-3 1.5v-1.5m3 6h-6m6 3h-6m3-6h.008v.008H12V12Z" /></svg>` },
  { name: 'Aparcamiento', svg: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016 2.993 2.993 0 0 0 2.25-1.016 3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" /></svg>` },
  { name: 'Peaje', svg: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>` },
  { name: 'Transporte', svg: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>` },
  { name: 'Alojamiento', svg: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>` },
  { name: 'Gasolina', svg: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" /></svg>` },
  { name: 'Otros', svg: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" /></svg>` }
];

const animateCounter = (index, duration = 2000) => {
  const stat = stats.value[index];
  const increment = stat.target / (duration / 16);
  const timer = setInterval(() => {
    stat.value += increment;
    if (stat.value >= stat.target) {
      stat.value = stat.target;
      clearInterval(timer);
    }
  }, 16);
};

onMounted(() => {
  stats.value.forEach((_, index) => {
    setTimeout(() => animateCounter(index), index * 200);
  });
});
</script>

<template>
  <div class="min-h-screen bg-black text-white overflow-hidden">
    <!-- Background grid -->
    <div class="fixed inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
    <!-- Violet glow blobs -->
    <div class="fixed top-0 left-1/4 w-96 h-96 bg-violet-700 rounded-full blur-3xl opacity-10 pointer-events-none"></div>
    <div class="fixed bottom-1/3 right-1/4 w-80 h-80 bg-purple-600 rounded-full blur-3xl opacity-10 pointer-events-none"></div>

    <Navbar />

    <!-- Hero Section -->
    <section class="max-w-7xl mx-auto mt-16 sm:mt-20 px-4 sm:px-6 pt-16 sm:pt-20 pb-16 sm:pb-24">
      <div class="text-center animate-fade-in">
        <div class="inline-flex items-center gap-2 mb-6 border border-violet-700/40 bg-violet-950/30 px-4 py-2 rounded-full">
          <span class="w-2 h-2 bg-violet-400 rounded-full animate-pulse"></span>
          <span class="text-violet-300 text-sm font-medium tracking-wide">Nueva plataforma de gestión</span>
        </div>

        <h1 class="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
          Gestiona tus tickets<br/>de forma
          <span class="text-gradient animate-gradient"> inteligente</span>
        </h1>

        <p class="text-base sm:text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
          La plataforma definitiva para el control de gastos. Digitaliza tus facturas,
          clasifica por categorías y mantén tus cuentas al día en tiempo real.
        </p>
      </div>

      <!-- Stats -->
      <div class="grid md:grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-20">
        <div
          v-for="(stat, index) in stats"
          :key="index"
          class="stat-card p-6 sm:p-8 rounded-2xl text-center transform hover:scale-105 transition-all duration-300"
          :style="{ animationDelay: `${index * 100}ms` }"
        >
          <div class="text-4xl sm:text-5xl font-bold text-gradient mb-2">
            {{ Math.floor(stat.value).toLocaleString() }}{{ stat.suffix || '' }}
          </div>
          <div class="text-gray-400 font-medium text-sm tracking-wide uppercase">{{ stat.label }}</div>
        </div>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
      <div class="text-center mb-14">
        <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
          Todas tus categorías <span class="text-violet-400">organizadas</span>
        </h2>
        <p class="text-gray-500 text-lg">
          Sistema de clasificación automática para cada tipo de gasto
        </p>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div
          v-for="(category, index) in categories"
          :key="index"
          class="group category-card p-6 rounded-2xl text-center transform hover:-translate-y-2 transition-all duration-300 cursor-pointer"
        >
          <div class="w-10 h-10 mx-auto mb-3 text-violet-400 group-hover:text-violet-300 group-hover:scale-110 transition-all duration-300" v-html="category.svg"></div>
          <div class="text-xs font-semibold text-gray-400 group-hover:text-violet-300 transition-colors">
            {{ category.name }}
          </div>
        </div>
      </div>
    </section>

    <!-- Features Grid -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
      <div class="text-center mb-14">
        <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
          Todo lo que necesitas en <span class="text-violet-400">un solo lugar</span>
        </h2>
        <p class="text-gray-500 text-lg">
          Funcionalidades diseñadas para maximizar tu productividad
        </p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="(feature, index) in features"
          :key="index"
          class="group feature-card p-6 sm:p-8 rounded-2xl transform hover:-translate-y-2 transition-all duration-300"
        >
          <div class="w-12 h-12 mb-5 text-violet-400 group-hover:text-violet-300 group-hover:scale-110 transition-all duration-300" v-html="feature.svg"></div>
          <h3 class="text-xl font-bold mb-3 text-white">{{ feature.title }}</h3>
          <p class="text-gray-500 leading-relaxed text-sm">{{ feature.description }}</p>

          <div class="mt-6 flex items-center text-violet-400 text-sm font-semibold group-hover:translate-x-2 transition-transform duration-300">
            Explorar <span class="ml-2">→</span>
          </div>
        </div>
      </div>
    </section>

    <!-- How it Works -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
      <div class="text-center mb-14">
        <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
          Cómo <span class="text-violet-400">funciona</span>
        </h2>
        <p class="text-gray-500 text-lg">
          Tres pasos para el control total de tus gastos
        </p>
      </div>

      <div class="grid md:grid-cols-3 gap-8 sm:gap-12 relative">
        <div class="hidden md:block absolute top-10 left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] h-px bg-gradient-to-r from-violet-800 via-violet-500 to-violet-800 opacity-40"></div>

        <div
          v-for="(step, i) in [
            { n: '01', title: 'Registra tu Ticket', desc: 'Introduce el importe, CIF, categoría y método de pago. Rápido y sencillo.' },
            { n: '02', title: 'Organiza Automáticamente', desc: 'El sistema clasifica y almacena tu ticket con todos los detalles en tiempo real.' },
            { n: '03', title: 'Analiza y Concilia', desc: 'Revisa tus gastos, marca como conciliados y genera informes cuando lo necesites.' }
          ]"
          :key="i"
          class="relative text-center group"
        >
          <div class="step-number w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10">
            <span class="text-xl font-bold text-violet-300">{{ step.n }}</span>
          </div>
          <h3 class="text-xl font-bold mb-3 text-white">{{ step.title }}</h3>
          <p class="text-gray-500 text-sm leading-relaxed">{{ step.desc }}</p>
        </div>
      </div>
    </section>

    <Footer />
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

* {
  font-family: 'DM Sans', sans-serif;
}

h1, h2, h3 {
  font-family: 'Syne', sans-serif;
}

/* Grid background */
.bg-grid-pattern {
  background-image:
    linear-gradient(rgba(139, 92, 246, 0.15) 1px, transparent 1px),
    linear-gradient(90deg, rgba(139, 92, 246, 0.15) 1px, transparent 1px);
  background-size: 60px 60px;
}

/* Gradient text */
.text-gradient {
  background: linear-gradient(135deg, #a78bfa 0%, #7c3aed 50%, #c4b5fd 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Stat cards */
.stat-card {
  background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(124, 58, 237, 0.05) 100%);
  border: 1px solid rgba(139, 92, 246, 0.15);
  backdrop-filter: blur(12px);
}

/* Category cards */
.category-card {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
}
.category-card:hover {
  background: rgba(124, 58, 237, 0.08);
  border-color: rgba(139, 92, 246, 0.3);
}

/* Feature cards */
.feature-card {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
}
.feature-card:hover {
  background: rgba(124, 58, 237, 0.06);
  border-color: rgba(139, 92, 246, 0.25);
}

/* Step number circle */
.step-number {
  background: rgba(124, 58, 237, 0.12);
  border: 1px solid rgba(139, 92, 246, 0.3);
  box-shadow: 0 0 24px rgba(124, 58, 237, 0.15);
}

/* Animations */
@keyframes fade-in {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes gradient {
  0%, 100% { background-position: 0% 50%; }
  50%       { background-position: 100% 50%; }
}

.animate-fade-in {
  animation: fade-in 1s ease-out;
}

.animate-gradient {
  background-size: 200% 200%;
  animation: gradient 3s ease infinite;
}

/* Scroll */
html { scroll-behavior: smooth; }
</style>