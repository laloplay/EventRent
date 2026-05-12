<template>
  <div class="relative">
    <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
          <h3 class="text-lg font-bold text-slate-800">Control de Inventario</h3>
          <p class="text-sm text-slate-500">Mobiliario disponible para renta</p>
        </div>
        <div class="flex gap-3">
          <button @click="mostrarModalCategorias = true" class="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors flex items-center gap-2">
            <FolderTree class="w-4 h-4" /> Categorías
          </button>
          <button @click="abrirModalNuevo" clasS="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-600 transition-colors flex items-center gap-2">
            <Plus class="w-4 h-4" /> Agregar Producto
          </button>
        </div>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="text-slate-400 text-[11px] uppercase tracking-widest border-b border-slate-100">
              <th class="px-6 py-4 font-bold">ID</th>
              <th class="px-6 py-4 font-bold">Mobiliario</th>
              <th class="px-6 py-4 font-bold">Categoría</th>
              <th class="px-6 py-4 font-bold">Tipo</th>
              <th class="px-6 py-4 font-bold">Precio Renta</th>
              <th class="px-6 py-4 font-bold">Stock</th>
              <th class="px-6 py-4 font-bold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-if="listaMobiliario.length === 0">
              <td colspan="7" class="px-6 py-8 text-center text-slate-400 font-medium">No hay productos en el inventario. Agrega uno nuevo.</td>
            </tr>
            <tr v-for="item in listaMobiliario" :key="item.id" class="hover:bg-indigo-50/30 transition-colors">
              <td class="px-6 py-4 text-sm font-mono text-slate-400">#{{ item.id }}</td>
              <td class="px-6 py-4 font-bold text-slate-700">{{ item.nombre }}</td>
              <td class="px-6 py-4 text-sm font-semibold text-slate-600">{{ item.nombre_categoria || 'Sin asignar' }}</td>
              <td class="px-6 py-4"><span class="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase">{{ item.tipo }}</span></td>
              <td class="px-6 py-4 font-semibold text-emerald-600">${{ item.precio }}</td>
              <td class="px-6 py-4 text-sm">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-slate-700">{{ item.cantidad_disponible }}</span>
                  <span class="text-[10px] text-slate-400 font-medium">unidades</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex justify-center gap-3">
                  <button @click="abrirModalEditar(item)" class="text-slate-400 hover:text-indigo-600 transition-colors" title="Editar"><Edit class="w-4 h-4" /></button>
                  <button @click="prepararEliminacion(item.id, 'mobiliario', `¿Eliminar el producto '${item.nombre}'?`)" class="text-slate-400 hover:text-red-600 transition-colors" title="Eliminar"><Trash2 class="w-4 h-4" /></button>
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
          <h3 class="font-bold text-slate-800 text-lg">{{ modoEdicion ? 'Editar Producto' : 'Nuevo Producto' }}</h3>
          <button @click="cerrarModal" class="text-slate-400 hover:text-slate-700"><X class="w-5 h-5" /></button>
        </div>
        <form @submit.prevent="guardarMobiliario" class="p-6 space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nombre</label>
            <input v-model="nuevoMobiliario.nombre" type="text" required class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none" placeholder="Ej: Silla Tiffany">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Categoría</label>
              <select v-model="nuevoMobiliario.id_categoria" required class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none bg-white">
                  <option value="" disabled>Seleccionar...</option>
                  <option v-for="cat in categoriasLista" :key="cat.id" :value="cat.id">{{ cat.categoria }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tipo / Modelo</label>
              <input v-model="nuevoMobiliario.tipo" type="text" required class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none" placeholder="Ej: Plegable">
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Precio ($)</label>
              <input v-model="nuevoMobiliario.precio" type="number" step="0.01" min="0" required class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Stock Inicial</label>
              <input v-model="nuevoMobiliario.cantidad_disponible" type="number" min="0" required class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none">
            </div>
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

    <div v-if="mostrarModalCategorias" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-60 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[80vh]">
        <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <h3 class="font-bold text-slate-800 text-lg">Listado de Categorías</h3>
          <button @click="mostrarModalCategorias = false" class="text-slate-400 hover:text-slate-700"><X class="w-5 h-5" /></button>
        </div>
        <form @submit.prevent="guardarCategoria" class="p-6 border-b border-slate-100 shrink-0">
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Crear Nueva</label>
          <div class="flex gap-2">
            <input v-model="inputNuevaCategoria" type="text" required class="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none" placeholder="Ej: Vajillas">
            <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition">Agregar</button>
          </div>
        </form>
        <div class="p-6 overflow-y-auto">
          <ul class="space-y-2">
            <li v-for="cat in categoriasLista" :key="cat.id" class="flex justify-between items-center p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition">
              <span class="font-bold text-slate-700">{{ cat.categoria }}</span>
              <button @click="prepararEliminacion(cat.id, 'categoria', `¿Eliminar la categoría '${cat.categoria}'?`)" class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Eliminar categoría">
                <Trash2 class="w-4 h-4" />
              </button>
            </li>
          </ul>
        </div>
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
import { Edit, Trash2, X, Plus, FolderTree, AlertTriangle, XCircle, CheckCircle } from 'lucide-vue-next'; 

const listaMobiliario = ref([]);
const categoriasLista = ref([]);
const mostrarModal = ref(false);
const mostrarModalCategorias = ref(false);
const cargando = ref(false);
const inputNuevaCategoria = ref('');

const modoEdicion = ref(false);
const idEdicion = ref(null);

const modalConfirmacion = ref({ visible: false, id: null, tipo: '', mensaje: '' });
const cargandoEliminar = ref(false);
const modalNotificacion = ref({ visible: false, mensaje: '', tipo: 'error' });

// Actualizado a la nueva base de datos
const mobiliarioVacio = { nombre: '', tipo: '', precio: '', cantidad_disponible: '', id_categoria: '' };
const nuevoMobiliario = ref({ ...mobiliarioVacio });

const mostrarNotificacion = (mensaje, tipo = 'error') => { modalNotificacion.value = { visible: true, mensaje, tipo }; };
const cerrarNotificacion = () => { modalNotificacion.value.visible = false; };

const cargarInventario = async () => {
  try {
    const respuesta = await fetch('http://localhost:3000/api/mobiliario');
    const datos = await respuesta.json();
    if (datos.success) listaMobiliario.value = datos.data;
  } catch (error) { mostrarNotificacion("Error al cargar el mobiliario.", "error"); }
};

const abrirModalNuevo = () => {
  modoEdicion.value = false;
  idEdicion.value = null;
  nuevoMobiliario.value = { ...mobiliarioVacio };
  mostrarModal.value = true;
};

const abrirModalEditar = (item) => {
  modoEdicion.value = true;
  idEdicion.value = item.id;
  // Pasamos los datos que vienen de la tabla al formulario
  nuevoMobiliario.value = { 
    nombre: item.nombre, 
    tipo: item.tipo, 
    precio: item.precio, 
    cantidad_disponible: item.cantidad_disponible,
    id_categoria: item.id_categoria
  };
  mostrarModal.value = true;
};

const guardarMobiliario = async () => {
  cargando.value = true;
  try {
    const url = modoEdicion.value ? `http://localhost:3000/api/mobiliario/${idEdicion.value}` : 'http://localhost:3000/api/mobiliario';
    const metodo = modoEdicion.value ? 'PUT' : 'POST';
    const respuesta = await fetch(url, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoMobiliario.value)
    });
    const datos = await respuesta.json();
    
    if (datos.success) {
      await cargarInventario();
      cerrarModal();
      mostrarNotificacion(modoEdicion.value ? "Mobiliario actualizado con éxito." : "Mobiliario guardado con éxito.", "success");
    } else { mostrarNotificacion(datos.message, "error"); }
  } catch (error) { mostrarNotificacion("Error al guardar.", "error"); } 
  finally { cargando.value = false; }
};

const cerrarModal = () => {
  mostrarModal.value = false;
  nuevoMobiliario.value = { ...mobiliarioVacio };
  modoEdicion.value = false;
  idEdicion.value = null;
};

const cargarCategorias = async () => {
  try {
    const respuesta = await fetch('http://localhost:3000/api/categorias');
    const datos = await respuesta.json();
    if (datos.success) categoriasLista.value = datos.data;
  } catch (error) { mostrarNotificacion("Error cargando categorías.", "error"); }
};

const guardarCategoria = async () => {
  if (!inputNuevaCategoria.value.trim()) return;
  try {
    const respuesta = await fetch('http://localhost:3000/api/categorias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoria: inputNuevaCategoria.value.trim() })
    });
    const datos = await respuesta.json();
    if (datos.success) {
      await cargarCategorias();
      inputNuevaCategoria.value = ''; 
    } else { mostrarNotificacion(datos.message, "error"); }
  } catch (error) { mostrarNotificacion("Error al guardar la categoría.", "error"); }
};

const prepararEliminacion = (id, tipo, mensaje) => { modalConfirmacion.value = { visible: true, id, tipo, mensaje }; };
const cancelarEliminacion = () => { modalConfirmacion.value = { visible: false, id: null, tipo: '', mensaje: '' }; };

const ejecutarEliminacion = async () => {
  cargandoEliminar.value = true;
  const { id, tipo } = modalConfirmacion.value;
  try {
    const url = tipo === 'categoria' ? `http://localhost:3000/api/categorias/${id}` : `http://localhost:3000/api/mobiliario/${id}`;
    const respuesta = await fetch(url, { method: 'DELETE' });
    const datos = await respuesta.json();
    if (datos.success) {
      if (tipo === 'categoria') await cargarCategorias();
      else await cargarInventario();
      cancelarEliminacion();
      mostrarNotificacion("Eliminación completada con éxito.", "success");
    } else {
      cancelarEliminacion();
      mostrarNotificacion(datos.message, "error");
    }
  } catch (error) {
    cancelarEliminacion();
    mostrarNotificacion("Error de conexión al intentar eliminar.", "error");
  } finally { cargandoEliminar.value = false; }
};

onMounted(() => {
  cargarInventario();
  cargarCategorias();
});
</script>