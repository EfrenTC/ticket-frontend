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
          <span class="text-violet-300 text-xs font-medium tracking-wide">Legal</span>
        </div>

        <h1 class="text-3xl font-bold text-white tracking-tight mb-2">Términos y condiciones</h1>
        <p class="text-gray-500 text-sm mb-8">Sección legal.</p>

        <div class="space-y-6 text-sm leading-relaxed">
          <article class="card-box p-5 rounded-xl">
            <h2 class="text-white font-semibold mb-2">1. Uso del servicio</h2>
            <p class="text-gray-400">El usuario puede utilizar TicketManager para la gestión personal o empresarial de tickets y gastos. Queda prohibido el uso fraudulento o contrario a la legislación vigente.</p>
          </article>

          <article class="card-box p-5 rounded-xl">
            <h2 class="text-white font-semibold mb-2">2. Privacidad de datos</h2>
            <p class="text-gray-400">La información proporcionada se trata de forma confidencial y se usa exclusivamente para ofrecer funcionalidades de la plataforma y soporte técnico.</p>
          </article>

          <article class="card-box p-5 rounded-xl">
            <h2 class="text-white font-semibold mb-2">3. Disponibilidad</h2>
            <p class="text-gray-400">El servicio se ofrece bajo disponibilidad razonable. Pueden producirse interrupciones temporales por mantenimiento o mejoras técnicas.</p>
          </article>

          <article class="card-box p-5 rounded-xl">
            <h2 class="text-white font-semibold mb-2">4. Responsabilidad</h2>
            <p class="text-gray-400">TicketManager no será responsable de pérdidas indirectas derivadas del uso de la plataforma. El usuario es responsable de la exactitud de los datos introducidos.</p>
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
