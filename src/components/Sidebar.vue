<template>
  <aside class="fixed inset-y-0 left-0 bg-slate-950 w-72 border-r border-slate-800 flex flex-col z-50">
    <div class="p-8 flex items-center gap-3">
      <div class="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
        <Package class="text-white w-6 h-6" />
      </div>
      <div>
        <h2 class="text-white font-bold text-lg leading-none tracking-tight">EventRent</h2>
      </div>
    </div>

    <nav class="flex-1 px-4 space-y-2">
      <button 
        v-for="item in menuItems" 
        :key="item.id"
        @click="$emit('change-view', item.id)"
        :class="[
          'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
          activeView === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
        ]"
      >
        <component :is="item.icon" :class="['w-5 h-5', activeView === item.id ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400']" />
        <span class="font-medium text-sm">{{ item.name }}</span>
      </button>
    </nav>

    <div class="p-4 m-4 bg-slate-900/50 rounded-2xl border border-slate-800">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
          <User class="w-5 h-5 text-indigo-400" />
        </div>
        <div class="overflow-hidden">
          <p class="text-xs font-bold text-white truncate">Eduardo Admin</p>
          <p class="text-[10px] text-slate-500 truncate">Gerencia General</p>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { LayoutDashboard, Package, ClipboardList, Users, CreditCard, User } from 'lucide-vue-next';

defineProps(['activeView']);
defineEmits(['change-view']);

const menuItems = [
  { id: 'dashboard', name: 'Panel Principal', icon: LayoutDashboard },
  { id: 'inventory', name: 'Inventario', icon: Package },
  { id: 'rentas', name: 'Rentas y Pedidos', icon: ClipboardList },
  { id: 'clientes', name: 'Clientes', icon: Users },
  { id: 'pagos', name: 'Control de Pagos', icon: CreditCard },
];
</script>