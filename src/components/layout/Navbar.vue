<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../../services/api.service';
import { useTheme } from '../../composables/useTheme';

const isAuthenticated = ref(false);
const isMenuOpen = ref(false);
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
    isMenuOpen.value = false;
    await router.push({ name: 'home' });
  }
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

onMounted(syncAuth);
watch(() => route.fullPath, closeMenu);
</script>

<template>
  <nav class="navbar fixed top-0 left-0 right-0 z-50 py-3 sm:py-4 px-3 sm:px-6 flex justify-between items-center gap-3">
    <!-- Logo -->
    <router-link
      :to="isAuthenticated ? { name: 'welcome' } : { name: 'home' }"
      class="logo text-base sm:text-xl font-extrabold tracking-tight transition-opacity hover:opacity-80 shrink-0"
    >
      TicketManager
    </router-link>

    <!-- Desktop Nav Links -->
    <div class="nav-scroll hidden md:flex items-center gap-1 overflow-x-auto">
      <button
        type="button"
        class="theme-btn mr-1 sm:mr-2 px-2.5 sm:px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap"
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
          class="nav-link px-2.5 sm:px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap"
        >
          {{ link.label }}
        </router-link>

        <button
          type="button"
          class="logout-btn ml-2 sm:ml-3 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap"
          @click="handleLogout"
        >
          Cerrar sesión
        </button>
      </template>

      <template v-else>
        <router-link
          to="/login"
          class="nav-link px-2.5 sm:px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap"
        >
          Iniciar sesión
        </router-link>
        <router-link
          to="/register"
          class="register-btn ml-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap"
        >
          Registrarse
        </router-link>
      </template>
    </div>

    <!-- Mobile Menu Button -->
    <div class="flex items-center gap-2 md:hidden">
      <button
        type="button"
        class="theme-btn px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-200"
        :aria-label="theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
        @click="toggleTheme"
      >
        {{ theme === 'dark' ? '☀️' : '🌙' }}
      </button>

      <button
        type="button"
        class="hamburger-btn px-2.5 py-2 rounded-lg transition-all duration-200"
        :aria-label="isMenuOpen ? 'Cerrar menú' : 'Abrir menú'"
        @click="isMenuOpen = !isMenuOpen"
      >
        <span class="hamburger-icon" :class="{ open: isMenuOpen }">
          <div class="line"></div>
          <div class="line"></div>
          <div class="line"></div>
        </span>
      </button>
    </div>

    <!-- Mobile Menu Dropdown -->
    <transition name="menu-slide">
      <div v-if="isMenuOpen" class="mobile-menu md:hidden fixed top-16 left-0 right-0 bg-gradient-to-b from-black/90 to-black/70 backdrop-blur-lg border-b border-purple-500/10 shadow-lg">
        <div class="flex flex-col gap-1 p-3 space-y-1">
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
              class="mobile-menu-link px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
              @click="closeMenu"
            >
              {{ link.label }}
            </router-link>

            <div class="border-t border-purple-500/10 my-2"></div>

            <button
              type="button"
              class="logout-btn w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
              @click="handleLogout"
            >
              Cerrar sesión
            </button>
          </template>

          <template v-else>
            <router-link
              to="/login"
              class="mobile-menu-link px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
              @click="closeMenu"
            >
              Iniciar sesión
            </router-link>
            <router-link
              to="/register"
              class="register-btn w-full text-center px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
              @click="closeMenu"
            >
              Registrarse
            </router-link>
          </template>
        </div>
      </div>
    </transition>
  </nav>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

* { font-family: 'DM Sans', sans-serif; }

.nav-scroll {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.nav-scroll::-webkit-scrollbar {
  display: none;
}

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

/* Hamburger Button */
.hamburger-btn {
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 3px;
  cursor: pointer;
}

.hamburger-btn:hover {
  color: rgba(255, 255, 255, 0.95);
  border-color: rgba(139, 92, 246, 0.35);
  background: rgba(124, 58, 237, 0.14);
}

.hamburger-icon {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.hamburger-icon .line {
  width: 18px;
  height: 2px;
  background: currentColor;
  border-radius: 1px;
  transition: all 0.3s ease;
}

.hamburger-icon.open .line:nth-child(1) {
  transform: rotate(45deg) translate(7px, 7px);
}

.hamburger-icon.open .line:nth-child(2) {
  opacity: 0;
}

.hamburger-icon.open .line:nth-child(3) {
  transform: rotate(-45deg) translate(6px, -6px);
}

/* Mobile Menu */
.mobile-menu {
  animation: slideDown 0.3s ease-out;
}

.mobile-menu-link {
  color: rgba(255, 255, 255, 0.6);
  display: block;
  transition: all 0.2s ease;
}

.mobile-menu-link:hover {
  color: rgba(255, 255, 255, 0.95);
  background: rgba(124, 58, 237, 0.15);
}

.mobile-menu-link.router-link-active {
  color: #a78bfa;
  background: rgba(124, 58, 237, 0.18);
}

/* Menu Transition */
.menu-slide-enter-active,
.menu-slide-leave-active {
  transition: all 0.3s ease;
}

.menu-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.menu-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Light Mode */
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

:global(body.theme-light) .hamburger-btn {
  color: rgba(31, 41, 55, 0.82);
  border: 1px solid rgba(124, 58, 237, 0.2);
  background: rgba(124, 58, 237, 0.06);
}

:global(body.theme-light) .hamburger-btn:hover {
  color: rgba(17, 24, 39, 0.95);
  border-color: rgba(124, 58, 237, 0.4);
  background: rgba(124, 58, 237, 0.12);
}

:global(body.theme-light) .mobile-menu {
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85)) !important;
  border-bottom: 1px solid rgba(124, 58, 237, 0.12);
}

:global(body.theme-light) .mobile-menu-link {
  color: rgba(31, 41, 55, 0.75);
}

:global(body.theme-light) .mobile-menu-link:hover {
  color: rgba(17, 24, 39, 0.95);
  background: rgba(124, 58, 237, 0.12);
}

:global(body.theme-light) .mobile-menu-link.router-link-active {
  color: #7c3aed;
  background: rgba(124, 58, 237, 0.16);
}
</style>