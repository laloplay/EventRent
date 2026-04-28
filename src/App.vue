<template>
  <div class="min-h-screen bg-slate-50 flex font-sans">
    <Sidebar :activeView="currentView" @change-view="setView" />

    <main class="flex-1 ml-72 transition-all duration-300">
      <header class="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40">
        <div class="flex items-center gap-4 text-slate-400 text-sm font-medium uppercase tracking-wider">
          <span>Administración</span>
          <ChevronRight class="w-4 h-4" />
          <span class="text-slate-900 font-bold capitalize">{{ currentView }}</span>
        </div>
        <div class="flex items-center gap-4 text-slate-400">
          <Bell class="w-5 h-5 cursor-pointer hover:text-indigo-600" />
          <div class="h-6 w-[1px] bg-slate-200"></div>
          <span class="text-sm font-bold text-slate-700">Martes, 28 de Abril</span>
        </div>
      </header>

      <div class="p-10 max-w-7xl mx-auto">
        <div v-if="currentView === 'dashboard'">
          <h2 class="text-2xl font-black text-slate-800 mb-6">Resumen del Negocio</h2>
          <div class="bg-indigo-900 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-900/20">
             <h3 class="text-xl font-bold mb-2">Bienvenido a EventRent Pro</h3>
             <p class="text-indigo-200">Selecciona una opción del menú lateral para comenzar a gestionar tu inventario o clientes.</p>
          </div>
        </div>

        <InventoryList v-if="currentView === 'inventory'" />
        <ClientesView v-if="currentView === 'clientes'" />
        <RentasView v-if="currentView === 'rentas'" />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ChevronRight, Bell } from 'lucide-vue-next';
import Sidebar from './components/Sidebar.vue';
import InventoryList from './components/InventoryList.vue';
import ClientesView from './components/ClientesView.vue';
import RentasView from './components/RentasView.vue';

const currentView = ref('dashboard');

const setView = (viewId) => {
  currentView.value = viewId;
};
</script>