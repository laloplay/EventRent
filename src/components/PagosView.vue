<template>
  <div class="relative">
    <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-6">
      <div class="p-6 bg-slate-50/50 flex justify-between items-center">
        <div>
          <h3 class="text-lg font-bold text-slate-800">Control de Caja y Pagos</h3>
          <p class="text-sm text-slate-500">Monitoreo de deudas, abonos e historial de ingresos</p>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="text-slate-400 text-[11px] uppercase tracking-widest border-b border-slate-100">
              <th class="px-6 py-4 font-bold">Folio</th>
              <th class="px-6 py-4 font-bold">Cliente</th>
              <th class="px-6 py-4 font-bold">Fechas (Inicio - Fin)</th>
              <th class="px-6 py-4 font-bold">Total Pedido</th>
              <th class="px-6 py-4 font-bold">Total Pagado</th>
              <th class="px-6 py-4 font-bold">Adeudo Restante</th>
              <th class="px-6 py-4 font-bold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-if="listaEstados.length === 0">
              <td colspan="7" class="px-6 py-8 text-center text-slate-400 font-medium">No hay rentas registradas para procesar pagos.</td>
            </tr>
            <tr v-for="item in listaEstados" :key="item.folio" class="hover:bg-indigo-50/30 transition-colors">
              <td class="px-6 py-4 text-sm font-mono font-bold text-slate-500">#{{ String(item.folio).padStart(4, '0') }}</td>
              <td class="px-6 py-4 font-bold text-slate-700">{{ item.cliente }}</td>
              <td class="px-6 py-4 text-slate-500 text-sm">
                {{ formatFecha(item.inicio) }} ➔ {{ formatFecha(item.fin) }}
              </td>
              <td class="px-6 py-4 font-bold text-slate-700">${{ parseFloat(item.total).toFixed(2) }}</td>
              <td class="px-6 py-4 font-bold text-emerald-600">${{ parseFloat(item.total_pagado).toFixed(2) }}</td>
              <td class="px-6 py-4">
                <span v-if="parseFloat(item.adeudo) <= 0" class="text-xs font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                  Liquidado ✨
                </span>
                <span v-else class="font-black text-red-600">
                  ${{ parseFloat(item.adeudo).toFixed(2) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex justify-center gap-2">
                  <button 
                    v-if="parseFloat(item.adeudo) > 0"
                    @click="abrirModalAbono(item)" 
                    class="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-indigo-600 transition flex items-center gap-1"
                  >
                    <DollarSign class="w-3.5 h-3.5" /> Abonar
                  </button>
                  <button 
                    @click="verHistorial(item.folio)" 
                    class="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 hover:text-slate-700 transition"
                    title="Ver historial de abonos"
                  >
                    <Receipt class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="mostrarModalAbono" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 class="font-black text-slate-800 text-lg">Registrar Abono</h3>
            <p class="text-xs text-slate-500">Folio del pedido: #{{ String(rentaSeleccionada?.folio).padStart(4, '0') }}</p>
          </div>
          <button @click="cerrarModalAbono" class="text-slate-400 hover:text-slate-700"><X class="w-5 h-5" /></button>
        </div>
        
        <form @submit.prevent="guardarAbono" class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <div>
              <span class="text-[10px] uppercase font-bold text-slate-400">Total Renta</span>
              <p class="text-base font-black text-slate-700">${{ parseFloat(rentaSeleccionada?.total).toFixed(2) }}</p>
            </div>
            <div>
              <span class="text-[10px] uppercase font-bold text-slate-400">Falta por Pagar</span>
              <p class="text-base font-black text-red-600">${{ parseFloat(rentaSeleccionada?.adeudo).toFixed(2) }}</p>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Monto a Abonar ($)</label>
            <input 
              v-model.number="nuevoPago.monto" 
              type="number" 
              step="0.01" 
              :max="rentaSeleccionada?.adeudo"
              required 
              class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-lg font-bold text-slate-700" 
              placeholder="0.00"
            >
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Método de Pago</label>
            <select v-model="nuevoPago.metodo" required class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none bg-white cursor-pointer">
              <option value="Efectivo">💵 Efectivo</option>
              <option value="Transferencia">📱 Transferencia Bancaria</option>
              <option value="Tarjeta">💳 Tarjeta de Crédito/Débito</option>
            </select>
          </div>
          
          <div class="pt-4 flex gap-3">
            <button type="button" @click="cerrarModalAbono" class="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition">Cancelar</button>
            <button type="submit" :disabled="cargandoAbono || nuevoPago.monto <= 0" class="flex-1 px-4 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition disabled:bg-indigo-300">
              {{ cargandoAbono ? 'Procesando...' : 'Confirmar Pago' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="mostrarModalHistorial" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[80vh]">
        <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <div>
            <h3 class="font-black text-slate-800 text-lg">Historial de Abonos</h3>
            <p class="text-xs text-slate-500">Lista completa de ingresos para el Folio #{{ String(folioHistorialSeleccionado).padStart(4, '0') }}</p>
          </div>
          <button @click="mostrarModalHistorial = false" class="text-slate-400 hover:text-slate-700"><X class="w-5 h-5" /></button>
        </div>
        
        <div class="p-6 overflow-y-auto flex-1">
          <div v-if="historialAbonos.length === 0" class="text-center py-8 text-slate-400 font-medium">
            No se han registrado abonos para este pedido todavía.
          </div>
          <div v-else class="space-y-3">
            <div v-for="pago in historialAbonos" :key="pago.id" class="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <p class="font-bold text-slate-800">${{ parseFloat(pago.monto).toFixed(2) }}</p>
                <span class="text-[10px] text-slate-400 font-medium">{{ formatFechaHora(pago.fecha) }}</span>
              </div>
              <span class="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
                {{ pago.metodo }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="modalNotificacion.visible" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-80 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 text-center">
        <div v-if="modalNotificacion.tipo === 'error'" class="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><XCircle class="w-8 h-8" /></div>
        <div v-else class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle class="w-8 h-8" /></div>
        <h3 class="text-xl font-black text-slate-800 mb-2">{{ modalNotificacion.tipo === 'error' ? 'Aviso' : '¡Éxito!' }}</h3>
        <p class="text-slate-500 text-sm mb-6">{{ modalNotificacion.mensaje }}</p>
        <button @click="modalNotificacion.visible = false" class="w-full px-4 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition">Entendido</button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { DollarSign, Receipt, X, XCircle, CheckCircle } from 'lucide-vue-next';

const listaEstados = ref([]);
const mostrarModalAbono = ref(false);
const mostrarModalHistorial = ref(false);
const cargandoAbono = ref(false);

const rentaSeleccionada = ref(null);
const folioHistorialSeleccionado = ref(null);
const historialAbonos = ref([]);

const nuevoPago = ref({ monto: '', metodo: 'Efectivo' });
const modalNotificacion = ref({ visible: false, mensaje: '', tipo: 'error' });

const lanzarNotificacion = (mensaje, tipo = 'error') => {
  modalNotificacion.value = { visible: true, mensaje, tipo };
};

const cargarEstadoCuenta = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/pagos/estado-cuenta');
    const datos = await res.json();
    if (datos.success) {
      listaEstados.value = datos.data;
    }
  } catch (error) {
    lanzarNotificacion("Error de conexión al cargar deudas.");
  }
};

const abrirModalAbono = (item) => {
  rentaSeleccionada.value = item;
  nuevoPago.value = { monto: '', metodo: 'Efectivo' };
  mostrarModalAbono.value = true;
};

const cerrarModalAbono = () => {
  mostrarModalAbono.value = false;
  rentaSeleccionada.value = null;
};

const guardarAbono = async () => {
  if (nuevoPago.value.monto > rentaSeleccionada.value.adeudo) {
    lanzarNotificacion("El abono no puede ser mayor que la deuda restante.");
    return;
  }
  
  cargandoAbono.value = true;
  try {
    const res = await fetch('http://localhost:3000/api/pagos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_solicitud: rentaSeleccionada.value.folio,
        monto: nuevoPago.value.monto,
        metodo: nuevoPago.value.metodo
      })
    });
    const datos = await res.json();

    if (datos.success) {
      await cargarEstadoCuenta();
      cerrarModalAbono();
      lanzarNotificacion("Abono registrado con éxito en la caja.", "success");
    } else {
      lanzarNotificacion(datos.message, "error");
    }
  } catch (error) {
    lanzarNotificacion("Error al guardar el pago.", "error");
  } finally {
    cargandoAbono.value = false;
  }
};

const verHistorial = async (folio) => {
  folioHistorialSeleccionado.value = folio;
  try {
    const res = await fetch(`http://localhost:3000/api/pagos/${folio}`);
    const datos = await res.json();
    if (datos.success) {
      historialAbonos.value = datos.data;
      mostrarModalHistorial.value = true;
    }
  } catch (error) {
    lanzarNotificacion("No se pudo cargar el historial de recibos.");
  }
};

// Formateadores de fechas bonitos
const formatFecha = (stringFecha) => {
  if (!stringFecha) return '---';
  const opciones = { day: '2-digit', month: 'short' };
  return new Date(stringFecha).toLocaleDateString('es-MX', opciones);
};

const formatFechaHora = (stringFecha) => {
  if (!stringFecha) return '---';
  const opciones = { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' };
  return new Date(stringFecha).toLocaleDateString('es-MX', opciones);
};

onMounted(() => {
  cargarEstadoCuenta();
});
</script>