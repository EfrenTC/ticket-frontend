<script setup>
import Navbar from '../components/layout/Navbar.vue';
import { ref, onMounted } from 'vue';

const stats = ref([
  { label: 'Tickets Procesados', value: 0, target: 15420 },
  { label: 'Ahorro Promedio', value: 0, target: 23, suffix: '%' },
  { label: 'Usuarios Activos', value: 0, target: 2840 }
]);

const features = [
  {
    icon: '📊',
    title: 'Control de Gastos',
    description: 'Registra importes, CIF y métodos de pago en segundos. Mantén un control exhaustivo de cada euro gastado.',
    color: 'blue'
  },
  {
    icon: '🏷️',
    title: 'Categorización Inteligente',
    description: 'Restauración, transporte, gasolina, alojamiento... todo organizado automáticamente por categorías.',
    color: 'purple'
  },
  {
    icon: '⚡',
    title: 'Logs en Tiempo Real',
    description: 'Historial inmutable de tus movimientos. Cada cambio queda registrado con MongoDB Atlas.',
    color: 'green'
  },
  {
    icon: '💳',
    title: 'Múltiples Métodos de Pago',
    description: 'Efectivo, tarjeta u otros. Registra y filtra por tu método de pago preferido.',
    color: 'orange'
  },
  {
    icon: '✅',
    title: 'Estado de Conciliación',
    description: 'Marca tus tickets como pendientes o terminados. Lleva un control perfecto de tus cuentas.',
    color: 'indigo'
  },
  {
    icon: '📅',
    title: 'Organización Temporal',
    description: 'Filtra por fechas, visualiza tendencias y genera informes mensuales automáticamente.',
    color: 'pink'
  }
];

const categories = [
  { name: 'Restauración', icon: '🍽️', color: 'bg-red-100 text-red-600' },
  { name: 'Aparcamiento', icon: '🅿️', color: 'bg-blue-100 text-blue-600' },
  { name: 'Peaje', icon: '🛣️', color: 'bg-yellow-100 text-yellow-600' },
  { name: 'Transporte', icon: '🚌', color: 'bg-green-100 text-green-600' },
  { name: 'Alojamiento', icon: '🏨', color: 'bg-purple-100 text-purple-600' },
  { name: 'Gasolina', icon: '⛽', color: 'bg-orange-100 text-orange-600' },
  { name: 'Otros', icon: '📦', color: 'bg-gray-100 text-gray-600' }
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
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
    <Navbar />
    
    <!-- Hero Section -->
    <section class="max-w-7xl mx-auto mt-20 px-6 pt-16 pb-24">
      <div class="text-center animate-fade-in">
        <div class="inline-block mb-4">
          <span class="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold animate-pulse">
            ✨ Nueva plataforma de gestión
          </span>
        </div>
        
        <h1 class="text-6xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
          Gestiona tus tickets de forma 
          <span class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
            inteligente
          </span>
        </h1>
        
        <p class="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
          La plataforma definitiva para el control de gastos. Digitaliza tus facturas, 
          clasifica por categorías y mantén tus cuentas al día en tiempo real.
        </p>
        
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button class="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            Comenzar Gratis
            <span class="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </button>
          <button class="bg-white text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg shadow-md hover:shadow-lg border border-gray-200 transform hover:-translate-y-1 transition-all duration-300">
            Ver Demo
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid md:grid-cols-3 gap-8 mt-24">
        <div 
          v-for="(stat, index) in stats" 
          :key="index"
          class="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-100 text-center transform hover:scale-105 transition-all duration-300"
          :style="{ animationDelay: `${index * 100}ms` }"
        >
          <div class="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            {{ Math.floor(stat.value).toLocaleString() }}{{ stat.suffix || '' }}
          </div>
          <div class="text-gray-600 font-medium">{{ stat.label }}</div>
        </div>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="max-w-7xl mx-auto px-6 py-16">
      <div class="text-center mb-16">
        <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Todas tus categorías <span class="text-blue-600">organizadas</span>
        </h2>
        <p class="text-xl text-gray-600">
          Sistema de clasificación automática para cada tipo de gasto
        </p>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div 
          v-for="(category, index) in categories" 
          :key="index"
          class="group bg-white p-6 rounded-2xl shadow-md hover:shadow-xl border border-gray-100 text-center transform hover:-translate-y-2 transition-all duration-300 cursor-pointer"
        >
          <div class="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
            {{ category.icon }}
          </div>
          <div :class="category.color" class="text-xs font-semibold px-3 py-1.5 rounded-full inline-block">
            {{ category.name }}
          </div>
        </div>
      </div>
    </section>

    <!-- Features Grid -->
    <section class="max-w-7xl mx-auto px-6 py-16">
      <div class="text-center mb-16">
        <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Todo lo que necesitas en <span class="text-purple-600">un solo lugar</span>
        </h2>
        <p class="text-xl text-gray-600">
          Funcionalidades diseñadas para maximizar tu productividad
        </p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div 
          v-for="(feature, index) in features" 
          :key="index"
          class="group bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:border-blue-300 transform hover:-translate-y-2 transition-all duration-300"
        >
          <div class="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
            {{ feature.icon }}
          </div>
          <h3 class="text-2xl font-bold mb-3 text-gray-900">{{ feature.title }}</h3>
          <p class="text-gray-600 leading-relaxed">{{ feature.description }}</p>
          
          <div class="mt-6 flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
            Explorar <span class="ml-2">→</span>
          </div>
        </div>
      </div>
    </section>

    <!-- How it Works -->
    <section class="max-w-7xl mx-auto px-6 py-16">
      <div class="text-center mb-16">
        <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Cómo <span class="text-blue-600">funciona</span>
        </h2>
        <p class="text-xl text-gray-600">
          Tres simples pasos para el control total de tus gastos
        </p>
      </div>

      <div class="grid md:grid-cols-3 gap-12 relative">
        <!-- Connection Lines (hidden on mobile) -->
        <div class="hidden md:block absolute top-24 left-1/4 right-1/4 h-1 bg-gradient-to-r from-blue-300 via-purple-300 to-green-300"></div>
        
        <div class="relative text-center group">
          <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300 z-10 relative">
            1
          </div>
          <h3 class="text-2xl font-bold mb-3 text-gray-900">Registra tu Ticket</h3>
          <p class="text-gray-600">
            Introduce el importe, CIF, categoría y método de pago. Rápido y sencillo.
          </p>
        </div>

        <div class="relative text-center group">
          <div class="bg-gradient-to-br from-purple-500 to-purple-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300 z-10 relative">
            2
          </div>
          <h3 class="text-2xl font-bold mb-3 text-gray-900">Organiza Automáticamente</h3>
          <p class="text-gray-600">
            El sistema clasifica y almacena tu ticket con todos los detalles en tiempo real.
          </p>
        </div>

        <div class="relative text-center group">
          <div class="bg-gradient-to-br from-green-500 to-green-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300 z-10 relative">
            3
          </div>
          <h3 class="text-2xl font-bold mb-3 text-gray-900">Analiza y Concilia</h3>
          <p class="text-gray-600">
            Revisa tus gastos, marca como conciliados y genera informes cuando lo necesites.
          </p>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="max-w-5xl mx-auto px-6 py-24">
      <div class="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl transform hover:scale-105 transition-all duration-300">
        <h2 class="text-4xl md:text-5xl font-bold mb-6">
          ¿Listo para tomar el control?
        </h2>
        <p class="text-xl mb-8 opacity-90">
          Únete a miles de usuarios que ya gestionan sus gastos de forma inteligente
        </p>
        <button class="bg-white text-blue-600 px-10 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
          Comenzar Ahora - Es Gratis
        </button>
        <p class="mt-4 text-sm opacity-75">
          No requiere tarjeta de crédito • Configuración en 2 minutos
        </p>
      </div>
    </section>

    <!-- Footer -->
    <footer class="max-w-7xl mx-auto px-6 py-12 border-t border-gray-200">
      <div class="text-center text-gray-600">
        <p class="mb-2">© 2026 Gestión de Tickets. Todos los derechos reservados.</p>
        <p class="text-sm">Hecho con 💙 para optimizar tu tiempo y dinero</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes gradient {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.animate-fade-in {
  animation: fade-in 1s ease-out;
}

.animate-gradient {
  background-size: 200% 200%;
  animation: gradient 3s ease infinite;
}

/* Smooth scroll behavior */
html {
  scroll-behavior: smooth;
}

/* Custom hover effects */
.group:hover .group-hover\:scale-110 {
  transform: scale(1.1);
}

.group:hover .group-hover\:translate-x-1 {
  transform: translateX(0.25rem);
}

.group:hover .group-hover\:translate-x-2 {
  transform: translateX(0.5rem);
}
</style>