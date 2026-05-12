<template>
  <div class="relative">
    <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
          <h3 class="text-lg font-bold text-slate-800">Control de Rentas</h3>
          <p class="text-sm text-slate-500">Gestión de pedidos y devoluciones (Horario Local Chiapas)</p>
        </div>
        <button @click="abrirModalNuevo" class="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-600 transition-colors flex items-center gap-2">
          <CalendarPlus class="w-4 h-4" /> Nueva Renta
        </button>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="text-slate-400 text-[11px] uppercase tracking-widest border-b border-slate-100">
              <th class="px-6 py-4 font-bold">Folio</th>
              <th class="px-6 py-4 font-bold">Cliente</th>
              <th class="px-6 py-4 font-bold">Fechas (Inicio - Fin)</th>
              <th class="px-6 py-4 font-bold">Total</th>
              <th class="px-6 py-4 font-bold text-center">Estatus</th>
              <th class="px-6 py-4 font-bold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-if="listaRentas.length === 0">
              <td colspan="6" class="px-6 py-8 text-center text-slate-400 font-medium">No hay rentas registradas.</td>
            </tr>
            <tr v-for="renta in listaRentas" :key="renta.id" class="hover:bg-indigo-50/30 transition-colors">
              <td class="px-6 py-4 text-sm font-mono text-slate-400 font-bold">#{{ renta.id.toString().padStart(4, '0') }}</td>
              <td class="px-6 py-4 font-bold text-slate-700">{{ renta.cliente_nombre || 'Desconocido' }}</td>
              <td class="px-6 py-4 text-sm text-slate-600">
                <div class="flex items-center gap-1">
                  <Calendar class="w-3 h-3 text-indigo-400" />
                  <span>{{ formatearFechaCorta(renta.inicio) }}</span>
                  <ArrowRight class="w-3 h-3 mx-1 text-slate-300" />
                  <span class="font-bold">{{ formatearFechaCorta(renta.fin) }}</span>
                </div>
              </td>
              <td class="px-6 py-4 font-black text-emerald-600">${{ renta.total }}</td>
              <td class="px-6 py-4 text-center">
                <span class="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg"
                  :class="{
                    'bg-amber-100 text-amber-700': renta.id_estatus === 1,
                    'bg-blue-100 text-blue-700': renta.id_estatus === 2,
                    'bg-emerald-100 text-emerald-700': renta.id_estatus === 3,
                    'bg-slate-100 text-slate-500': renta.id_estatus === 4
                  }"
                >
                  {{ renta.id_estatus === 1 ? 'En Proceso' : renta.estatus_nombre }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex justify-center gap-2">
                  <button @click="verDetalles(renta.id)" class="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-indigo-100 hover:text-indigo-600 transition-colors"><Eye class="w-4 h-4" /></button>
                  <button v-if="renta.id_estatus === 1" @click="registrarRecepcion(renta)" class="px-3 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg hover:bg-emerald-600 hover:text-white transition-colors flex items-center gap-1">
                    <CheckSquare class="w-3 h-3" /> Recibir
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="mostrarModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-slate-50 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[95vh]">
        <div class="p-6 border-b border-slate-200 flex justify-between items-center bg-white shrink-0">
          <div>
            <h3 class="font-black text-slate-800 text-xl">Crear Nuevo Pedido</h3>
            <p class="text-sm text-slate-500">Completa la información para registrar la salida de mobiliario.</p>
          </div>
          <button @click="cerrarModal" class="p-2 bg-slate-100 text-slate-400 rounded-full hover:bg-slate-200 hover:text-slate-700 transition"><X class="w-5 h-5" /></button>
        </div>
        
        <div class="p-6 overflow-y-auto flex-1 space-y-6">
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h4 class="font-black text-indigo-600 text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">1</span> Datos del Evento
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Cliente / Responsable</label>
                <select v-model="nuevaRenta.id_cliente" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none bg-slate-50 hover:bg-white transition-colors cursor-pointer">
                  <option value="" disabled>Selecciona un cliente...</option>
                  <option v-for="c in clientesLista" :key="c.id" :value="c.id">{{ c.nombre }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Fecha de Entrega (Inicio)</label>
                <input v-model="nuevaRenta.inicio" type="date" :min="hoy" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none bg-slate-50 hover:bg-white transition-colors cursor-pointer">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Fecha de Recolección (Fin)</label>
                <input v-model="nuevaRenta.fin" type="date" :min="nuevaRenta.inicio" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none bg-slate-50 hover:bg-white transition-colors cursor-pointer">
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h4 class="font-black text-indigo-600 text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">2</span> Mobiliario Requerido
            </h4>
            
            <div class="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div class="flex-1">
                <select v-model="itemSeleccionado" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none bg-white cursor-pointer">
                  <option :value="null" disabled>Busca y selecciona mobiliario...</option>
                  <option 
                    v-for="m in mobiliarioLista" 
                    :key="m.id" 
                    :value="m" 
                    :disabled="m.cantidad_disponible <= 0"
                    :class="{'text-red-500 font-bold': m.cantidad_disponible <= 0}"
                  >
                    {{ m.nombre }} - 
                    {{ m.cantidad_disponible > 0 
                      ? `Disponible: ${m.cantidad_disponible} unidades` 
                      : `🔴 AGOTADO (${m.fecha_regreso ? 'Regresan ' + m.cantidad_regreso + ' unidades el ' + formatearFechaLarga(m.fecha_regreso) : 'Sin fecha de regreso asignada'})` 
                    }}
                  </option>
                </select>
              </div>
              <div class="w-full md:w-32">
                <input v-model.number="cantidadSeleccionada" type="number" min="1" placeholder="Cantidad" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-center">
              </div>
              <button @click="agregarAlCarrito" class="w-full md:w-auto px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20">
                <Plus class="w-5 h-5" /> Agregar
              </button>
            </div>

            <div class="border border-slate-200 rounded-xl overflow-hidden flex flex-col bg-white">
              <div class="min-h-37.5 max-h-75 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                <div v-if="carrito.length === 0" class="h-full flex flex-col items-center justify-center text-slate-400 py-8">
                  <Package class="w-12 h-12 mb-3 text-slate-200" />
                  <p class="text-sm font-medium">Aún no has agregado mobiliario al pedido.</p>
                </div>
                
                <div v-for="(item, index) in carrito" :key="index" class="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-colors">
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-black">
                      x{{ item.cantidad }}
                    </div>
                    <div>
                      <p class="font-bold text-slate-800">{{ item.nombre }}</p>
                      <p class="text-xs font-medium text-slate-500">Precio unitario: ${{ item.precio }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-6">
                    <p class="font-black text-emerald-600 text-lg">${{ item.subtotal }}</p>
                    <button @click="quitarDelCarrito(index)" class="w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors">
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div class="bg-slate-900 text-white p-6 flex justify-between items-center">
                <span class="font-bold text-slate-300 uppercase tracking-widest text-sm">Gran Total a Cobrar</span>
                <span class="font-black text-3xl text-emerald-400">${{ totalCalculado.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="p-6 border-t border-slate-200 flex gap-4 bg-white shrink-0 justify-end">
          <button @click="cerrarModal" class="px-8 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition">Cancelar</button>
          <button @click="guardarRenta" :disabled="cargando || carrito.length === 0 || !nuevaRenta.id_cliente" class="px-8 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition disabled:bg-indigo-300 shadow-lg shadow-indigo-600/30 flex items-center gap-2">
            <CheckSquare class="w-5 h-5" v-if="!cargando" />
            {{ cargando ? 'Procesando...' : 'Confirmar Pedido y Restar Stock' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="mostrarModalDetalles" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-60 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6">
        <h3 class="text-xl font-black text-slate-800 mb-6">Mobiliario Solicitado</h3>
        <ul class="space-y-3 mb-6 max-h-60 overflow-y-auto">
          <li v-for="(det, i) in detallesRenta" :key="i" class="flex justify-between items-center border-b border-slate-100 pb-3 last:border-0">
            <div class="flex items-center gap-3">
              <span class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 font-black flex items-center justify-center text-xs">x{{ det.cantidad }}</span>
              <span class="font-bold text-slate-700">{{ det.mobiliario_nombre }}</span>
            </div>
            <span class="text-slate-500 text-sm font-mono">${{ det.precio }}</span>
          </li>
        </ul>
        <button @click="mostrarModalDetalles = false" class="w-full py-3 bg-slate-900 text-white font-bold rounded-xl">Cerrar</button>
      </div>
    </div>

    <div v-if="modalNotificacion.visible" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-80 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 text-center">
        <div v-if="modalNotificacion.tipo === 'error'" class="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle class="w-8 h-8" />
        </div>
        <div v-else class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle class="w-8 h-8" />
        </div>
        <h3 class="text-xl font-black text-slate-800 mb-2">{{ modalNotificacion.tipo === 'error' ? 'Aviso Importante' : '¡Éxito!' }}</h3>
        <p class="text-slate-500 text-sm mb-6">{{ modalNotificacion.mensaje }}</p>
        <button @click="cerrarNotificacion" class="w-full px-4 py-3 rounded-xl bg-slate-900 text-white font-bold">Entendido</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { CalendarPlus, Calendar, ArrowRight, Plus, Trash2, Eye, CheckSquare, X, Package, XCircle, CheckCircle } from 'lucide-vue-next'; 

const obtenerFechaLocal = () => {
  const fecha = new Date();
  return fecha.toLocaleDateString('en-CA'); 
};

const hoy = ref(obtenerFechaLocal());
const listaRentas = ref([]);
const clientesLista = ref([]);
const mobiliarioLista = ref([]);
const estatusLista = ref([]);
const mostrarModal = ref(false);
const mostrarModalDetalles = ref(false);
const cargando = ref(false);
const modalNotificacion = ref({ visible: false, mensaje: '', tipo: 'error' });

const nuevaRenta = ref({ inicio: hoy.value, fin: hoy.value, id_cliente: '' });
const carrito = ref([]);
const itemSeleccionado = ref(null);
const cantidadSeleccionada = ref(1);
const detallesRenta = ref([]);

const totalCalculado = computed(() => carrito.value.reduce((t, i) => t + i.subtotal, 0));
const mostrarNotificacion = (m, t = 'error') => { modalNotificacion.value = { visible: true, mensaje: m, tipo: t }; };
const cerrarNotificacion = () => { modalNotificacion.value.visible = false; };

// Formato corto para la tabla (ej. 15 may)
const formatearFechaCorta = (fStr) => {
  if (!fStr) return '';
  const f = new Date(fStr);
  f.setMinutes(f.getMinutes() + f.getTimezoneOffset());
  return f.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
};

// Formato largo para el seleccionador de muebles (ej. 15 de mayo)
const formatearFechaLarga = (fStr) => {
  if (!fStr) return '';
  const f = new Date(fStr);
  f.setMinutes(f.getMinutes() + f.getTimezoneOffset());
  return f.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' });
};

const cargarRentas = async () => {
  const res = await fetch('http://localhost:3000/api/solicitudes');
  const d = await res.json();
  if (d.success) listaRentas.value = d.data;
};

const cargarDependencias = async () => {
  const [rc, rm, re] = await Promise.all([
    fetch('http://localhost:3000/api/clientes'),
    fetch('http://localhost:3000/api/mobiliario'),
    fetch('http://localhost:3000/api/estatus')
  ]);
  const dc = await rc.json(); const dm = await rm.json(); const de = await re.json();
  if (dc.success) clientesLista.value = dc.data;
  if (dm.success) mobiliarioLista.value = dm.data;
  if (de.success) estatusLista.value = de.data;
};

const agregarAlCarrito = () => {
  if (!itemSeleccionado.value || cantidadSeleccionada.value < 1) return;
  if (cantidadSeleccionada.value > itemSeleccionado.value.cantidad_disponible) {
    mostrarNotificacion(`Solo quedan ${itemSeleccionado.value.cantidad_disponible} unidades disponibles de este artículo.`, 'error');
    return;
  }
  carrito.value.push({
    id_mobiliario: itemSeleccionado.value.id,
    nombre: itemSeleccionado.value.nombre,
    precio: itemSeleccionado.value.precio,
    cantidad: cantidadSeleccionada.value,
    subtotal: cantidadSeleccionada.value * itemSeleccionado.value.precio
  });
  itemSeleccionado.value = null;
  cantidadSeleccionada.value = 1;
};

const quitarDelCarrito = (i) => carrito.value.splice(i, 1);

const abrirModalNuevo = () => {
  hoy.value = obtenerFechaLocal(); 
  nuevaRenta.value = { inicio: hoy.value, fin: hoy.value, id_cliente: '' };
  carrito.value = [];
  mostrarModal.value = true;
};

const cerrarModal = () => mostrarModal.value = false;

const guardarRenta = async () => {
  cargando.value = true;
  try {
    const res = await fetch('http://localhost:3000/api/solicitudes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...nuevaRenta.value, total: totalCalculado.value, id_estatus: 1, id_usuario: 1, carrito: carrito.value })
    });
    const d = await res.json();
    if (d.success) {
      await cargarRentas(); await cargarDependencias();
      cerrarModal();
      mostrarNotificacion("Renta registrada correctamente. El stock ha sido actualizado.", "success");
    }
  } catch (e) { mostrarNotificacion("Error al guardar.", "error"); }
  finally { cargando.value = false; }
};

const registrarRecepcion = async (r) => {
  const res = await fetch(`http://localhost:3000/api/solicitudes/${r.id}/estatus`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_estatus: 3 })
  });
  const d = await res.json();
  if (d.success) { 
    mostrarNotificacion("Mobiliario devuelto al inventario exitosamente.", "success");
    await cargarRentas(); 
    await cargarDependencias(); 
  }
};

const verDetalles = async (id) => {
  mostrarModalDetalles.value = true;
  const res = await fetch(`http://localhost:3000/api/solicitudes/${id}/detalles`);
  const d = await res.json();
  if (d.success) detallesRenta.value = d.data;
};

onMounted(() => { cargarDependencias(); cargarRentas(); });
</script>