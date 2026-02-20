<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../../services/api.service';
import { useTheme } from '../../composables/useTheme';

const isAuthenticated = ref(false);
const route = useRoute();
const router = useRouter();
const { theme, toggleTheme } = useTheme();

const syncAuth = () => {
  isAuthenticated.value = localStorage.getItem('isAuthenticated') === 'true';
};

const handleLogout = async () => {
  try {
    await api.get('/sanctum/csrf-cookie');
    await api.post('/logout');
  } catch (error) {
  } finally {
    localStorage.removeItem('isAuthenticated');
    syncAuth();
    await router.push({ name: 'home' });
  }
};

onMounted(syncAuth);
watch(() => route.fullPath, syncAuth);
</script>

<template>
  <nav class="navbar fixed top-0 left-0 right-0 z-50 py-4 px-6 flex justify-between items-center">
    <!-- Logo -->
    <router-link
      :to="isAuthenticated ? { name: 'welcome' } : { name: 'home' }"
      class="logo text-xl font-extrabold tracking-tight transition-opacity hover:opacity-80"
    >
      TicketManager
    </router-link>

    <!-- Nav Links -->
    <div class="flex items-center gap-1">
      <button
        type="button"
        class="theme-btn mr-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
        :aria-label="theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
        @click="toggleTheme"
      >
        {{ theme === 'dark' ? '☀️' : '🌙' }}
      </button>

      <template v-if="isAuthenticated">
        <router-link
          v-for="link in [
            { to: '/welcome',    label: 'Inicio'   },
            { to: '/tickets',    label: 'Tickets'  },
            { to: '/stats',      label: 'Stats'    },
            { to: '/profile',    label: 'Perfil'   },
            { to: '/operations', label: 'Módulos'  }
          ]"
          :key="link.to"
          :to="link.to"
          class="nav-link px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
        >
          {{ link.label }}
        </router-link>

        <button
          type="button"
          class="logout-btn ml-3 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
          @click="handleLogout"
        >
          Cerrar sesión
        </button>
      </template>

      <template v-else>
        <router-link
          to="/login"
          class="nav-link px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
        >
          Iniciar sesión
        </router-link>
        <router-link
          to="/register"
          class="register-btn ml-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
        >
          Registrarse
        </router-link>
      </template>
    </div>
  </nav>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

* { font-family: 'DM Sans', sans-serif; }

.navbar {
  background: rgba(0, 0, 0, 0.7);
  border-bottom: 1px solid rgba(139, 92, 246, 0.12);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.logo {
  font-family: 'Syne', sans-serif;
  background: linear-gradient(135deg, #a78bfa 0%, #7c3aed 50%, #c4b5fd 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-link {
  color: rgba(255, 255, 255, 0.5);
}
.nav-link:hover {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.04);
}
.nav-link.router-link-active {
  color: #a78bfa;
  background: rgba(124, 58, 237, 0.1);
}

.theme-btn {
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
}
.theme-btn:hover {
  color: rgba(255, 255, 255, 0.95);
  border-color: rgba(139, 92, 246, 0.35);
  background: rgba(124, 58, 237, 0.14);
}

.logout-btn {
  color: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.logout-btn:hover {
  color: #fca5a5;
  border-color: rgba(248, 113, 113, 0.3);
  background: rgba(239, 68, 68, 0.08);
}

.register-btn {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(124, 58, 237, 0.3);
}
.register-btn:hover {
  box-shadow: 0 6px 24px rgba(124, 58, 237, 0.45);
  transform: translateY(-1px);
}

:global(body.theme-light) .navbar {
  background: rgba(255, 255, 255, 0.86);
  border-bottom: 1px solid rgba(124, 58, 237, 0.18);
}

:global(body.theme-light) .nav-link {
  color: rgba(31, 41, 55, 0.7);
}

:global(body.theme-light) .nav-link:hover {
  color: rgba(17, 24, 39, 0.95);
  background: rgba(124, 58, 237, 0.08);
}

:global(body.theme-light) .logout-btn {
  color: rgba(55, 65, 81, 0.85);
  border: 1px solid rgba(55, 65, 81, 0.16);
}

:global(body.theme-light) .logout-btn:hover {
  color: #dc2626;
  border-color: rgba(220, 38, 38, 0.26);
  background: rgba(239, 68, 68, 0.1);
}

:global(body.theme-light) .theme-btn {
  color: rgba(31, 41, 55, 0.82);
  border: 1px solid rgba(124, 58, 237, 0.2);
  background: rgba(124, 58, 237, 0.06);
}

:global(body.theme-light) .theme-btn:hover {
  color: rgba(17, 24, 39, 0.95);
  border-color: rgba(124, 58, 237, 0.4);
  background: rgba(124, 58, 237, 0.12);
}
</style>