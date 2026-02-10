<template>
  <nav class="bg-white border-b border-gray-200 py-4 px-6 flex justify-between items-center shadow-sm">
    <router-link to="/" class="text-2xl font-bold text-blue-600 hover:opacity-80 transition-opacity">
      TicketManager
    </router-link>

    <div class="space-x-4">
      <router-link to="/login" class="text-gray-600 hover:text-blue-600 font-medium">
        Iniciar Sesión
      </router-link>
      <router-link to="/register" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
        Registrarse
      </router-link>
    </div>
  </nav>
</template>