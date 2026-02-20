<script setup lang="ts">
import Navbar from '../components/layout/Navbar.vue';
import Footer from '../components/layout/Footer.vue';
</script>

<template>
  <div class="min-h-screen bg-black text-white overflow-hidden">
    <div class="fixed inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
    <div class="fixed top-0 left-1/3 w-96 h-96 bg-violet-700 rounded-full blur-3xl opacity-10 pointer-events-none"></div>

    <Navbar />

    <main class="max-w-5xl mx-auto mt-24 px-4 pb-10">
      <section class="panel-card rounded-2xl p-8 md:p-10 animate-fade-in">
        <div class="inline-flex items-center gap-2 mb-4 border border-violet-700/40 bg-violet-950/30 px-4 py-1.5 rounded-full">
          <span class="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse"></span>
          <span class="text-violet-300 text-xs font-medium tracking-wide">Soporte</span>
        </div>

        <h1 class="text-3xl font-bold text-white tracking-tight mb-2">Contacto</h1>
        <p class="text-gray-500 text-sm mb-8">Datos de contacto para soporte y atención al cliente.</p>

        <div class="grid md:grid-cols-2 gap-5 text-sm">
          <div class="card-box p-5 rounded-xl">
            <p class="text-gray-400 uppercase text-xs mb-2">Email</p>
            <p class="text-white font-medium">support@ticketmanager.app</p>
          </div>
          <div class="card-box p-5 rounded-xl">
            <p class="text-gray-400 uppercase text-xs mb-2">Teléfono</p>
            <p class="text-white font-medium">+34 900 123 456</p>
          </div>
          <div class="card-box p-5 rounded-xl md:col-span-2">
            <p class="text-gray-400 uppercase text-xs mb-2">Dirección</p>
            <p class="text-white font-medium">C/ Gran Vía 123, 28013 Avilés, España</p>
          </div>
          <div class="card-box p-5 rounded-xl md:col-span-2">
            <p class="text-gray-400 uppercase text-xs mb-2">Horario</p>
            <p class="text-white font-medium">Lunes a viernes · 09:00 - 18:00 (CET)</p>
          </div>
        </div>
      </section>
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

.panel-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(139, 92, 246, 0.12);
}

.card-box {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
}
</style>
