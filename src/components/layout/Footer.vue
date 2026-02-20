<script setup lang="ts">
const currentYear = new Date().getFullYear();
</script>

<template>
  <footer class="tm-footer mt-14 border-t border-white/5">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 grid md:grid-cols-3 gap-8 text-center md:text-left">
      <div class="md:pr-6">
        <h3 class="footer-brand text-lg font-extrabold tracking-tight">TicketManager</h3>
        <p class="footer-text mt-2 text-sm leading-relaxed">
          Plataforma de gestión de tickets y gastos con paneles, estadísticas y control de conciliación.
        </p>
      </div>

      <div>
        <p class="footer-title text-xs font-semibold uppercase tracking-wider mb-3">Enlaces</p>
        <div class="flex flex-col gap-2 text-sm">
          <router-link to="/contact" class="footer-link">Contacto</router-link>
          <router-link to="/terms" class="footer-link">Términos</router-link>
          <router-link to="/about" class="footer-link">About</router-link>
        </div>
      </div>

      <div>
        <p class="footer-title text-xs font-semibold uppercase tracking-wider mb-3">Contacto</p>
        <div class="footer-text text-sm space-y-1.5">
          <p>support@ticketmanager.app</p>
          <p>+34 900 123 456</p>
          <p>C/ Gran Vía 123, Avilés</p>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 pb-6 sm:pb-8 text-center md:text-left">
      <p class="footer-copy text-xs">© {{ currentYear }} TicketManager. Todos los derechos reservados.</p>
    </div>
  </footer>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

* { font-family: 'DM Sans', sans-serif; }

.tm-footer {
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.footer-brand {
  font-family: 'Syne', sans-serif;
  background: linear-gradient(135deg, #a78bfa 0%, #7c3aed 50%, #c4b5fd 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.footer-title { color: rgba(255, 255, 255, 0.72); }
.footer-text { color: rgba(255, 255, 255, 0.5); }
.footer-copy { color: rgba(255, 255, 255, 0.42); }

.footer-link {
  color: rgba(255, 255, 255, 0.65);
  transition: color 180ms ease;
}

.footer-link:hover {
  color: #a78bfa;
}

:global(body.theme-light) .tm-footer {
  background: rgba(255, 255, 255, 0.78);
  border-top-color: rgba(124, 58, 237, 0.16);
}

:global(body.theme-light) .footer-title {
  color: rgba(31, 41, 55, 0.82);
}

:global(body.theme-light) .footer-text {
  color: rgba(55, 65, 81, 0.78);
}

:global(body.theme-light) .footer-copy {
  color: rgba(75, 85, 99, 0.72);
}

:global(body.theme-light) .footer-link {
  color: rgba(31, 41, 55, 0.85);
}

:global(body.theme-light) .footer-link:hover {
  color: #6d28d9;
}
</style>
