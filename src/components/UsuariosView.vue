<template>
  <div class="relative">
    <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
          <h3 class="text-lg font-bold text-slate-800">Gestión de Personal</h3>
          <p class="text-sm text-slate-500">Control de accesos y roles del sistema</p>
        </div>
        <button @click="abrirModalNuevo" class="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-600 transition-colors flex items-center gap-2">
          <UserPlus class="w-4 h-4" /> Nuevo Usuario
        </button>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="text-slate-400 text-[11px] uppercase tracking-widest border-b border-slate-100">
              <th class="px-6 py-4 font-bold">ID</th>
              <th class="px-6 py-4 font-bold">Nombre del Empleado</th>
              <th class="px-6 py-4 font-bold">Teléfono</th>
              <th class="px-6 py-4 font-bold">Usuario (Login)</th>
              <th class="px-6 py-4 font-bold">Puesto / Rol</th>
              <th class="px-6 py-4 font-bold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-if="listaUsuarios.length === 0">
              <td colspan="6" class="px-6 py-8 text-center text-slate-400 font-medium">Cargando usuarios...</td>
            </tr>
            <tr v-for="user in listaUsuarios" :key="user.id" class="hover:bg-indigo-50/30 transition-colors">
              <td class="px-6 py-4 text-sm font-mono text-slate-400">#{{ user.id }}</td>
              <td class="px-6 py-4 font-bold text-slate-700">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                    {{ user.nombre.charAt(0).toUpperCase() }}
                  </div>
                  {{ user.nombre }}
                </div>
              </td>
              <td class="px-6 py-4 text-slate-600 font-medium">{{ user.telefono || '---' }}</td>
              <td class="px-6 py-4 text-slate-600 font-medium">@{{ user.usuario }}</td>
              <td class="px-6 py-4">
                <span class="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg"
                  :class="user.puesto.toLowerCase().includes('gerencia') || user.puesto.toLowerCase().includes('admin') ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'"
                >
                  {{ user.puesto }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex justify-center gap-3">
                  <button @click="abrirModalEditar(user)" class="text-slate-400 hover:text-indigo-600 transition-colors" title="Editar"><Edit class="w-4 h-4" /></button>
                  <button v-if="user.id !== 1" @click="prepararEliminacion(user.id, `¿Eliminar acceso a '${user.nombre}'?`)" class="text-slate-400 hover:text-red-600 transition-colors" title="Revocar Acceso"><Trash2 class="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="mostrarModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-slate-50 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[95vh]">
        
        <div class="p-6 border-b border-slate-200 flex justify-between items-center bg-white shrink-0">
          <div>
            <h3 class="font-black text-slate-800 text-xl">{{ modoEdicion ? 'Editar Usuario' : 'Crear Nuevo Acceso' }}</h3>
            <p class="text-sm text-slate-500">Configura las credenciales y permisos en el sistema.</p>
          </div>
          <button @click="cerrarModal" class="p-2 bg-slate-100 text-slate-400 rounded-full hover:bg-slate-200 hover:text-slate-700 transition"><X class="w-5 h-5" /></button>
        </div>
        
        <form @submit.prevent="guardarUsuario" class="p-6 overflow-y-auto flex-1 space-y-6">
          <input type="text" style="display:none" autocomplete="username">
          <input type="password" style="display:none" autocomplete="current-password">

          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            
            <div>
              <h4 class="font-black text-indigo-600 text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center"><User class="w-3 h-3" /></span> Datos del Empleado
              </h4>
              
              <div class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nombre Completo</label>
                    <input v-model="nuevoUsuario.nombre" type="text" required autocomplete="none" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none bg-slate-50 hover:bg-white transition-colors" placeholder="Ej: Carlos López">
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Teléfono</label>
                    <input v-model="nuevoUsuario.telefono" type="text" autocomplete="none" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none bg-slate-50 hover:bg-white transition-colors" placeholder="Ej: 961 123 4567">
                  </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Usuario (Login)</label>
                    <input v-model="nuevoUsuario.usuario" type="text" required autocomplete="none" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none bg-slate-50 hover:bg-white transition-colors" placeholder="Ej: clopez">
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Rol / Puesto</label>
                    <select v-model="nuevoUsuario.puesto" required class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none bg-slate-50 hover:bg-white transition-colors cursor-pointer">
                      <option value="Gerencia">Gerencia (Acceso Total)</option>
                      <option value="Mostrador">Mostrador (Atención a Clientes)</option>
                      <option value="Almacen">Almacén (Bodega)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div class="pt-6 border-t border-slate-100">
              <h4 class="font-black text-indigo-600 text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center"><Lock class="w-3 h-3" /></span> Seguridad
              </h4>
              
              <div>
                <label class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                  Contraseña de Acceso
                  <span v-if="modoEdicion" class="text-indigo-500 normal-case font-bold text-[10px] bg-indigo-50 px-2 py-1 rounded-md">Déjalo en blanco para mantener la actual</span>
                </label>
                <input v-model="nuevoUsuario.password" type="password" :required="!modoEdicion" autocomplete="new-password" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none bg-slate-50 hover:bg-white transition-colors tracking-widest font-black text-slate-700" placeholder="••••••••">
              </div>
            </div>

          </div>

          <div class="pt-2 flex gap-4 justify-end">
            <button type="button" @click="cerrarModal" class="px-8 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-white transition">Cancelar</button>
            <button type="submit" :disabled="cargando" class="px-8 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition disabled:bg-indigo-300 shadow-lg shadow-indigo-600/30">
              {{ cargando ? 'Guardando...' : (modoEdicion ? 'Actualizar Cambios' : 'Crear Acceso') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="modalConfirmacion.visible" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-70 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 text-center">
        <div class="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><ShieldAlert class="w-8 h-8" /></div>
        <h3 class="text-xl font-black text-slate-800 mb-2">Revocar Acceso</h3>
        <p class="text-slate-500 text-sm mb-6">{{ modalConfirmacion.mensaje }}</p>
        <div class="flex gap-3">
          <button @click="cancelarEliminacion" class="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition">Cancelar</button>
          <button @click="ejecutarEliminacion" :disabled="cargandoEliminar" class="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition">
            {{ cargandoEliminar ? 'Borrando...' : 'Sí, Eliminar' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="modalNotificacion.visible" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-80 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 text-center">
        <div v-if="modalNotificacion.tipo === 'error'" class="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><XCircle class="w-8 h-8" /></div>
        <div v-else class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle class="w-8 h-8" /></div>
        <h3 class="text-xl font-black text-slate-800 mb-2">{{ modalNotificacion.tipo === 'error' ? 'Aviso' : '¡Éxito!' }}</h3>
        <p class="text-slate-500 text-sm mb-6">{{ modalNotificacion.mensaje }}</p>
        <button @click="cerrarNotificacion" class="w-full px-4 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition">Entendido</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Edit, Trash2, X, XCircle, CheckCircle, UserPlus, ShieldAlert, User, Lock } from 'lucide-vue-next'; 

const listaUsuarios = ref([]);
const mostrarModal = ref(false);
const cargando = ref(false);

const modoEdicion = ref(false);
const idEdicion = ref(null);

const modalConfirmacion = ref({ visible: false, id: null, mensaje: '' });
const cargandoEliminar = ref(false);
const modalNotificacion = ref({ visible: false, mensaje: '', tipo: 'error' });

const usuarioVacio = { nombre: '', usuario: '', password: '', puesto: 'Mostrador', telefono: '' };
const nuevoUsuario = ref({ ...usuarioVacio });

const mostrarNotificacion = (mensaje, tipo = 'error') => { modalNotificacion.value = { visible: true, mensaje, tipo }; };
const cerrarNotificacion = () => { modalNotificacion.value.visible = false; };

const cargarUsuarios = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/usuarios');
    const datos = await res.json();
    if (datos.success) listaUsuarios.value = datos.data;
  } catch (error) { mostrarNotificacion("Error al cargar los usuarios."); }
};

const abrirModalNuevo = () => {
  modoEdicion.value = false;
  idEdicion.value = null;
  nuevoUsuario.value = { ...usuarioVacio };
  mostrarModal.value = true;
};

const abrirModalEditar = (user) => {
  modoEdicion.value = true;
  idEdicion.value = user.id;
  nuevoUsuario.value = { nombre: user.nombre, usuario: user.usuario, password: '', puesto: user.puesto, telefono: user.telefono || '' };
  mostrarModal.value = true;
};

const guardarUsuario = async () => {
  cargando.value = true;
  try {
    const url = modoEdicion.value ? `http://localhost:3000/api/usuarios/${idEdicion.value}` : 'http://localhost:3000/api/usuarios';
    const metodo = modoEdicion.value ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoUsuario.value)
    });
    const datos = await res.json();
    
    if (datos.success) {
      await cargarUsuarios();
      cerrarModal();
      mostrarNotificacion(modoEdicion.value ? "Usuario actualizado correctamente." : "Acceso creado con éxito.", "success");
    } else { mostrarNotificacion(datos.message, "error"); }
  } catch (error) { mostrarNotificacion("Error de red al guardar.", "error"); } 
  finally { cargando.value = false; }
};

const cerrarModal = () => {
  mostrarModal.value = false;
  nuevoUsuario.value = { ...usuarioVacio };
};

const prepararEliminacion = (id, mensaje) => { modalConfirmacion.value = { visible: true, id, mensaje }; };
const cancelarEliminacion = () => { modalConfirmacion.value = { visible: false, id: null, mensaje: '' }; };

const ejecutarEliminacion = async () => {
  cargandoEliminar.value = true;
  try {
    const res = await fetch(`http://localhost:3000/api/usuarios/${modalConfirmacion.value.id}`, { method: 'DELETE' });
    const datos = await res.json();
    
    if (datos.success) {
      await cargarUsuarios();
      cancelarEliminacion();
      mostrarNotificacion("Acceso revocado correctamente.", "success");
    } else {
      cancelarEliminacion();
      mostrarNotificacion(datos.message, "error");
    }
  } catch (error) {
    cancelarEliminacion();
    mostrarNotificacion("Error al intentar eliminar.", "error");
  } finally { cargandoEliminar.value = false; }
};

onMounted(() => { cargarUsuarios(); });
</script>