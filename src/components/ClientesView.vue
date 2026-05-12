<template>
  <div class="relative">
    <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
          <h3 class="text-lg font-bold text-slate-800">Directorio de Clientes</h3>
          <p class="text-sm text-slate-500">Gestión de personas que han rentado mobiliario</p>
        </div>
        <button @click="abrirModalNuevo" class="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-600 transition-colors flex items-center gap-2">
          <UserPlus class="w-4 h-4" /> Registrar Cliente
        </button>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="text-slate-400 text-[11px] uppercase tracking-widest border-b border-slate-100">
              <th class="px-6 py-4 font-bold">ID</th>
              <th class="px-6 py-4 font-bold">Nombre del Cliente</th>
              <th class="px-6 py-4 font-bold">Teléfono</th>
              <th class="px-6 py-4 font-bold">Dirección</th>
              <th class="px-6 py-4 font-bold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-if="listaClientes.length === 0">
              <td colspan="5" class="px-6 py-8 text-center text-slate-400 font-medium">Aún no hay clientes registrados.</td>
            </tr>
            <tr v-for="cliente in listaClientes" :key="cliente.id" class="hover:bg-indigo-50/30 transition-colors">
              <td class="px-6 py-4 text-sm font-mono text-slate-400">#{{ cliente.id }}</td>
              <td class="px-6 py-4 font-bold text-slate-700">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                    {{ cliente.nombre.charAt(0).toUpperCase() }}
                  </div>
                  {{ cliente.nombre }}
                </div>
              </td>
              <td class="px-6 py-4 text-slate-600 font-medium">{{ cliente.telefono || 'No registrado' }}</td>
              <td class="px-6 py-4 text-sm text-slate-500 truncate max-w-50">{{ cliente.direccion || 'Sin dirección' }}</td>
              <td class="px-6 py-4">
                <div class="flex justify-center gap-3">
                  <button @click="abrirModalEditar(cliente)" class="text-slate-400 hover:text-indigo-600 transition-colors" title="Editar"><Edit class="w-4 h-4" /></button>
                  <button @click="prepararEliminacion(cliente.id, `¿Eliminar a '${cliente.nombre}' del registro?`)" class="text-slate-400 hover:text-red-600 transition-colors" title="Eliminar"><Trash2 class="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="mostrarModal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 class="font-bold text-slate-800 text-lg">{{ modoEdicion ? 'Editar Cliente' : 'Nuevo Cliente' }}</h3>
          <button @click="cerrarModal" class="text-slate-400 hover:text-slate-700"><X class="w-5 h-5" /></button>
        </div>
        <form @submit.prevent="guardarCliente" class="p-6 space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nombre Completo</label>
            <input v-model="nuevoCliente.nombre" type="text" required class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none" placeholder="Ej: Juan Pérez">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Teléfono de Contacto</label>
            <input v-model="nuevoCliente.telefono" type="text" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none" placeholder="Ej: 555-123-4567">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Dirección Completa</label>
            <textarea v-model="nuevoCliente.direccion" rows="2" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none resize-none" placeholder="Calle, Número, Colonia..."></textarea>
          </div>
          <div class="pt-4 flex gap-3">
            <button type="button" @click="cerrarModal" class="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition">Cancelar</button>
            <button type="submit" :disabled="cargando" class="flex-1 px-4 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition disabled:bg-indigo-400">
              {{ cargando ? 'Guardando...' : (modoEdicion ? 'Actualizar' : 'Guardar') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="modalConfirmacion.visible" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-70 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 text-center animate-in fade-in zoom-in duration-200">
        <div class="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle class="w-8 h-8" /></div>
        <h3 class="text-xl font-black text-slate-800 mb-2">Confirmar Eliminación</h3>
        <p class="text-slate-500 text-sm mb-6">{{ modalConfirmacion.mensaje }}</p>
        <div class="flex gap-3">
          <button @click="cancelarEliminacion" class="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition">Cancelar</button>
          <button @click="ejecutarEliminacion" :disabled="cargandoEliminar" class="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition disabled:bg-red-400">
            {{ cargandoEliminar ? 'Borrando...' : 'Sí, Eliminar' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="modalNotificacion.visible" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-80 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 text-center animate-in fade-in zoom-in duration-200">
        <div v-if="modalNotificacion.tipo === 'error'" class="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle class="w-8 h-8" />
        </div>
        <div v-else class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle class="w-8 h-8" />
        </div>
        <h3 class="text-xl font-black text-slate-800 mb-2">{{ modalNotificacion.tipo === 'error' ? 'Aviso Importante' : '¡Éxito!' }}</h3>
        <p class="text-slate-500 text-sm mb-6">{{ modalNotificacion.mensaje }}</p>
        <button @click="cerrarNotificacion" class="w-full px-4 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition">Entendido</button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Edit, Trash2, X, AlertTriangle, XCircle, CheckCircle, UserPlus } from 'lucide-vue-next'; 

const listaClientes = ref([]);
const mostrarModal = ref(false);
const cargando = ref(false);

const modoEdicion = ref(false);
const idEdicion = ref(null);

const modalConfirmacion = ref({ visible: false, id: null, mensaje: '' });
const cargandoEliminar = ref(false);
const modalNotificacion = ref({ visible: false, mensaje: '', tipo: 'error' });

const clienteVacio = { nombre: '', direccion: '', telefono: '' };
const nuevoCliente = ref({ ...clienteVacio });

const mostrarNotificacion = (mensaje, tipo = 'error') => { modalNotificacion.value = { visible: true, mensaje, tipo }; };
const cerrarNotificacion = () => { modalNotificacion.value.visible = false; };

const cargarClientes = async () => {
  try {
    const respuesta = await fetch('http://localhost:3000/api/clientes');
    const datos = await respuesta.json();
    if (datos.success) listaClientes.value = datos.data;
  } catch (error) { mostrarNotificacion("Error al cargar los clientes.", "error"); }
};

const abrirModalNuevo = () => {
  modoEdicion.value = false;
  idEdicion.value = null;
  nuevoCliente.value = { ...clienteVacio };
  mostrarModal.value = true;
};

const abrirModalEditar = (cliente) => {
  modoEdicion.value = true;
  idEdicion.value = cliente.id;
  nuevoCliente.value = { nombre: cliente.nombre, direccion: cliente.direccion, telefono: cliente.telefono };
  mostrarModal.value = true;
};

const guardarCliente = async () => {
  cargando.value = true;
  try {
    const url = modoEdicion.value ? `http://localhost:3000/api/clientes/${idEdicion.value}` : 'http://localhost:3000/api/clientes';
    const metodo = modoEdicion.value ? 'PUT' : 'POST';
    const respuesta = await fetch(url, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoCliente.value)
    });
    const datos = await respuesta.json();
    
    if (datos.success) {
      await cargarClientes();
      cerrarModal();
      mostrarNotificacion(modoEdicion.value ? "Cliente actualizado con éxito." : "Cliente registrado con éxito.", "success");
    } else { mostrarNotificacion(datos.message, "error"); }
  } catch (error) { mostrarNotificacion("Error de conexión al guardar.", "error"); } 
  finally { cargando.value = false; }
};

const cerrarModal = () => {
  mostrarModal.value = false;
  nuevoCliente.value = { ...clienteVacio };
  modoEdicion.value = false;
  idEdicion.value = null;
};

const prepararEliminacion = (id, mensaje) => { modalConfirmacion.value = { visible: true, id, mensaje }; };
const cancelarEliminacion = () => { modalConfirmacion.value = { visible: false, id: null, mensaje: '' }; };

const ejecutarEliminacion = async () => {
  cargandoEliminar.value = true;
  const { id } = modalConfirmacion.value;
  try {
    const respuesta = await fetch(`http://localhost:3000/api/clientes/${id}`, { method: 'DELETE' });
    const datos = await respuesta.json();
    
    if (datos.success) {
      await cargarClientes();
      cancelarEliminacion();
      mostrarNotificacion("Cliente eliminado con éxito.", "success");
    } else {
      cancelarEliminacion();
      mostrarNotificacion(datos.message, "error");
    }
  } catch (error) {
    cancelarEliminacion();
    mostrarNotificacion("Error de red al intentar eliminar.", "error");
  } finally { cargandoEliminar.value = false; }
};

onMounted(() => {
  cargarClientes();
});
</script>