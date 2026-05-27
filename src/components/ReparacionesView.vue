<template>
  <div class="relative">
    <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-6">
      <div class="p-6 bg-slate-50/50 flex justify-between items-center">
        <div>
          <h3 class="text-lg font-bold text-slate-800">Taller y Mantenimiento</h3>
          <p class="text-sm text-slate-500">Control de mobiliario en reparación</p>
        </div>
        <button @click="abrirModalNuevo" class="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors flex items-center gap-2">
          <Wrench class="w-4 h-4" /> Enviar a Taller
        </button>
      </div>
    </div>

    <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="text-slate-400 text-[11px] uppercase tracking-widest border-b border-slate-100">
              <th class="px-6 py-4 font-bold">Mueble / Cantidad</th>
              <th class="px-6 py-4 font-bold">Carpintero</th>
              <th class="px-6 py-4 font-bold">Fechas (Envío - Regreso)</th>
              <th class="px-6 py-4 font-bold">Detalles / Daño</th>
              <th class="px-6 py-4 font-bold text-center">Estatus</th>
              <th class="px-6 py-4 font-bold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-if="listaReparaciones.length === 0">
              <td colspan="6" class="px-6 py-8 text-center text-slate-400 font-medium">No hay mobiliario en reparación.</td>
            </tr>
            <tr v-for="item in listaReparaciones" :key="item.id" class="hover:bg-orange-50/30 transition-colors">
              <td class="px-6 py-4">
                <p class="font-bold text-slate-700">{{ item.nombre_mueble }}</p>
                <span class="text-xs font-black text-orange-600">{{ item.cantidad }} unidades</span>
              </td>
              <td class="px-6 py-4 font-bold text-slate-600">{{ item.nombre_carpintero }}</td>
              <td class="px-6 py-4 text-slate-500 text-sm">
                {{ formatFecha(item.fecha_envio) }} ➔ <span class="font-bold text-slate-700">{{ formatFecha(item.fecha_regreso) }}</span>
              </td>
              <td class="px-6 py-4 text-xs text-slate-500 max-w-50 truncate" :title="item.detalles">
                {{ item.detalles || 'Sin detalles' }}
              </td>
              <td class="px-6 py-4 text-center">
                <span v-if="item.id_estatus === 1" class="text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg bg-orange-100 text-orange-700">En Taller</span>
                <span v-else class="text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg bg-emerald-100 text-emerald-700">Reparado ✨</span>
              </td>
              <td class="px-6 py-4 text-center">
                <button v-if="item.id_estatus === 1" @click="completarReparacion(item.id)" class="bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1 mx-auto">
                  <CheckCircle class="w-3.5 h-3.5" /> Recibir
                </button>
                <span v-else class="text-slate-300 text-xs font-bold">---</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="mostrarModalNuevo" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
        <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div><h3 class="font-black text-slate-800 text-lg">Enviar a Reparación</h3></div>
          <button @click="cerrarModalNuevo" class="text-slate-400 hover:text-slate-700"><X class="w-5 h-5" /></button>
        </div>
        
        <form @submit.prevent="guardarReparacion" class="p-6 space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Selecciona Mueble</label>
            <select v-model="nuevoMantenimiento.id_mobiliario" required class="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none">
              <option value="" disabled>Selecciona una opción...</option>
              <option v-for="m in listaMobiliario" :key="m.id" :value="m.id" :disabled="m.cantidad_disponible <= 0">
                {{ m.nombre }} (Disponibles: {{ m.cantidad_disponible }})
              </option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Cantidad</label>
              <input v-model.number="nuevoMantenimiento.cantidad" type="number" min="1" required class="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none">
            </div>
            <div>
              <label class="flex justify-between text-xs font-bold text-slate-500 uppercase mb-2">
                <span>Carpintero</span>
                <button type="button" @click="mostrarModalCarpintero = true" class="text-indigo-600 hover:underline flex items-center gap-1"><Plus class="w-3 h-3"/> Nuevo</button>
              </label>
              <select v-model="nuevoMantenimiento.id_carpintero" required class="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none">
                <option value="" disabled>Selecciona carpintero...</option>
                <option v-for="c in listaCarpinteros" :key="c.id" :value="c.id">{{ c.nombre }}</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Fecha Envío</label>
              <input v-model="nuevoMantenimiento.fecha_envio" type="date" required class="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Regreso</label>
              <input v-model="nuevoMantenimiento.fecha_regreso" type="date" required class="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none">
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Detalles (Opcional)</label>
            <textarea v-model="nuevoMantenimiento.detalles" rows="2" class="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none resize-none"></textarea>
          </div>
          
          <div class="pt-4 flex gap-3">
            <button type="submit" class="w-full px-4 py-3 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-700 transition">Mandar a Taller</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="mostrarModalCarpintero" class="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-6">
        <h3 class="font-black text-slate-800 text-lg mb-4">Registrar Carpintero</h3>
        <form @submit.prevent="guardarCarpintero" class="space-y-4">
          <input v-model="nuevoCarpintero.nombre" type="text" placeholder="Nombre completo" required class="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none">
          <input v-model="nuevoCarpintero.telefono" type="text" placeholder="Teléfono" class="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none">
          <div class="flex gap-2 pt-2">
            <button type="button" @click="mostrarModalCarpintero = false" class="flex-1 px-4 py-3 rounded-xl border text-slate-600 font-bold">Cancelar</button>
            <button type="submit" class="flex-1 px-4 py-3 rounded-xl bg-indigo-600 text-white font-bold">Guardar</button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Wrench, X, CheckCircle, Plus } from 'lucide-vue-next';

const listaReparaciones = ref([]);
const listaMobiliario = ref([]);
const listaCarpinteros = ref([]);

const mostrarModalNuevo = ref(false);
const mostrarModalCarpintero = ref(false);

const vacioMantenimiento = { id_mobiliario: '', id_carpintero: '', cantidad: 1, fecha_envio: '', fecha_regreso: '', detalles: '' };
const nuevoMantenimiento = ref({ ...vacioMantenimiento });
const nuevoCarpintero = ref({ nombre: '', telefono: '' });

const cargarDependencias = async () => {
  try {
    const [resM, resC, resR] = await Promise.all([
      fetch('http://localhost:3000/api/mobiliario'),
      fetch('http://localhost:3000/api/carpinteros'),
      fetch('http://localhost:3000/api/reparaciones')
    ]);
    const dM = await resM.json(); const dC = await resC.json(); const dR = await resR.json();
    
    if (dM.success) listaMobiliario.value = dM.data;
    if (dC.success) listaCarpinteros.value = dC.data;
    if (dR.success) listaReparaciones.value = dR.data;
  } catch (e) { console.error("Error cargando datos", e); }
};

const abrirModalNuevo = () => {
  nuevoMantenimiento.value = { ...vacioMantenimiento, fecha_envio: new Date().toISOString().split('T')[0] };
  mostrarModalNuevo.value = true;
};

const cerrarModalNuevo = () => mostrarModalNuevo.value = false;

const guardarCarpintero = async () => {
  const res = await fetch('http://localhost:3000/api/carpinteros', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(nuevoCarpintero.value)
  });
  if (res.ok) {
    await cargarDependencias();
    nuevoCarpintero.value = { nombre: '', telefono: '' };
    mostrarModalCarpintero.value = false;
  }
};

const guardarReparacion = async () => {
  const res = await fetch('http://localhost:3000/api/reparaciones', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(nuevoMantenimiento.value)
  });
  if (res.ok) {
    await cargarDependencias();
    cerrarModalNuevo();
  }
};

const completarReparacion = async (id) => {
  const res = await fetch(`http://localhost:3000/api/reparaciones/${id}/completar`, { method: 'PUT' });
  if (res.ok) await cargarDependencias();
};

const formatFecha = (fStr) => {
  if (!fStr) return '---';
  const f = new Date(fStr);
  f.setMinutes(f.getMinutes() + f.getTimezoneOffset());
  return f.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
};

onMounted(() => cargarDependencias());
</script>