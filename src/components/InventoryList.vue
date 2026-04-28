<template>
  <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
    <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
      <div>
        <h3 class="text-lg font-bold text-slate-800">Control de Inventario</h3>
        <p class="text-sm text-slate-500">Mobiliario disponible para renta</p>
      </div>
      <button class="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-600 transition-colors">
        + Agregar Producto
      </button>
    </div>
    
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="text-slate-400 text-[11px] uppercase tracking-widest border-b border-slate-100">
            <th class="px-6 py-4 font-bold">ID</th>
            <th class="px-6 py-4 font-bold">Mobiliario</th>
            <th class="px-6 py-4 font-bold">Tipo</th>
            <th class="px-6 py-4 font-bold">Precio Renta</th>
            <th class="px-6 py-4 font-bold">Stock</th>
            <th class="px-6 py-4 font-bold text-center">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          <tr v-for="item in products" :key="item.id" class="hover:bg-indigo-50/30 transition-colors">
            <td class="px-6 py-4 text-sm font-mono text-slate-400">#{{ item.id }}</td>
            <td class="px-6 py-4 font-bold text-slate-700">{{ item.nombre }}</td>
            <td class="px-6 py-4">
              <span class="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase">{{ item.tipo }}</span>
            </td>
            <td class="px-6 py-4 font-semibold text-emerald-600">${{ item.precio }}</td>
            <td class="px-6 py-4 text-sm">
              <div class="flex items-center gap-2">
                <span class="font-bold text-slate-700">{{ item.cantidad }}</span>
                <span class="text-[10px] text-slate-400 font-medium">unidades</span>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="flex justify-center gap-2">
                <button class="p-2 text-slate-400 hover:text-indigo-600 transition-colors">✏️</button>
                <button class="p-2 text-slate-400 hover:text-red-600 transition-colors">🗑️</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
const products = [
  { id: '001', nombre: 'Mesa Redonda', tipo: 'Mesas', precio: 150, cantidad: 20 },
  { id: '002', nombre: 'Silla Tiffany Blanca', tipo: 'Sillas', precio: 25, cantidad: 200 },
  { id: '003', nombre: 'Mantel Rectangular Azul', tipo: 'Mantelería', precio: 45, cantidad: 15 },
  { id: '004', nombre: 'Carpas 6x12m', tipo: 'Estructuras', precio: 1200, cantidad: 4 },
]
</script>