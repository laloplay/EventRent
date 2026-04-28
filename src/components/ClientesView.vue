<template>
  <div class="space-y-6 animate-in fade-in duration-500">
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-2xl font-black text-slate-800">Directorio de Clientes</h2>
        <p class="text-slate-500 text-sm">Gestiona la base de datos de tus clientes habituales.</p>
      </div>
      <button class="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">
        <UserPlus class="w-4 h-4" /> Registrar Cliente
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 3" :key="i" class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
        <div class="flex items-start justify-between mb-4">
          <div class="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
            <User class="w-6 h-6 text-slate-400 group-hover:text-indigo-600" />
          </div>
          <button class="text-slate-300 hover:text-slate-600">•••</button>
        </div>
        <h3 class="font-bold text-slate-800 text-lg">Cliente Ejemplar #{{i}}</h3>
        <div class="mt-4 space-y-2">
          <div class="flex items-center gap-2 text-sm text-slate-500">
            <Phone class="w-4 h-4" /> +52 961 123 4567
          </div>
          <div class="flex items-center gap-2 text-sm text-slate-500">
            <MapPin class="w-4 h-4" /> Av. Central #123, Tuxtla Gtz.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { User, UserPlus, Phone, MapPin } from 'lucide-vue-next';
</script>