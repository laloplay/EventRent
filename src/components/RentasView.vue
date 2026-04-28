<template>
  <div class="space-y-6">
    <div class="flex justify-between items-end">
      <div>
        <span class="text-indigo-600 font-bold text-xs uppercase tracking-widest">Gestión de Solicitudes</span>
        <h2 class="text-3xl font-black text-slate-800">Rentas Actuales</h2>
      </div>
      <div class="flex gap-2">
        <div class="bg-white border border-slate-200 px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm">
          <span class="text-xs font-bold text-slate-500">Filtrar por:</span>
          <select class="text-xs font-bold bg-transparent outline-none">
            <option>Todas las fechas</option>
            <option>Pendientes hoy</option>
          </select>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white p-5 rounded-2xl border-l-4 border-l-amber-400 shadow-sm border border-slate-100">
        <p class="text-slate-500 text-xs font-bold uppercase tracking-tighter">Por Entregar</p>
        <p class="text-2xl font-black text-slate-800 mt-1">8 Pedidos</p>
      </div>
      <div class="bg-white p-5 rounded-2xl border-l-4 border-l-blue-400 shadow-sm border border-slate-100">
        <p class="text-slate-500 text-xs font-bold uppercase tracking-tighter">En Evento</p>
        <p class="text-2xl font-black text-slate-800 mt-1">12 Activos</p>
      </div>
      <div class="bg-white p-5 rounded-2xl border-l-4 border-l-emerald-400 shadow-sm border border-slate-100">
        <p class="text-slate-500 text-xs font-bold uppercase tracking-tighter">Pagos de Hoy</p>
        <p class="text-2xl font-black text-slate-800 mt-1">$4,250.00</p>
      </div>
    </div>
  </div>
</template>