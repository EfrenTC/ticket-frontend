<script setup lang="ts">
import Navbar from '../components/layout/Navbar.vue';
import Footer from '../components/layout/Footer.vue';
</script>

<template>
  <div class="min-h-screen bg-black text-white overflow-hidden">
    <div class="fixed inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>

    <Navbar />

    <main class="max-w-5xl mx-auto mt-24 px-4 pb-10">
      <section class="panel-card rounded-2xl p-8 md:p-10 animate-fade-in">
        <div class="inline-flex items-center gap-2 mb-4 border border-violet-700/40 bg-violet-950/30 px-4 py-1.5 rounded-full">
          <span class="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse"></span>
          <span class="text-violet-300 text-xs font-medium tracking-wide">Producto</span>
        </div>

        <h1 class="text-3xl font-bold text-white tracking-tight mb-2">About TicketManager</h1>
        <p class="text-gray-500 text-sm mb-8">Información de la plataforma y su equipo.</p>

        <div class="space-y-6 text-sm leading-relaxed">
          <article class="card-box p-5 rounded-xl">
            <h2 class="text-white font-semibold mb-2">Nuestra misión</h2>
            <p class="text-gray-400">Ayudar a personas y equipos a controlar gastos de forma simple, clara y auditable, con una experiencia rápida y moderna.</p>
          </article>

          <article class="card-box p-5 rounded-xl">
            <h2 class="text-white font-semibold mb-2">Qué ofrecemos</h2>
            <p class="text-gray-400">Registro de tickets, categorización, conciliación, panel de estadísticas y módulos avanzados para análisis y operación diaria.</p>
          </article>

          <article class="card-box p-5 rounded-xl">
            <h2 class="text-white font-semibold mb-2">Equipo</h2>
            <p class="text-gray-400">Equipo multidisciplinar formado por especialistas en frontend, backend y análisis financiero digital.</p>
          </article>
        </div>
      </section>
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

.panel-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(139, 92, 246, 0.12);
}

.card-box {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
}
</style>
