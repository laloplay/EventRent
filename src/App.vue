<template>
  <div>
    <LoginView v-if="!estaAutenticado" @login-exitoso="manejarIngreso" />

    <div v-else class="min-h-screen bg-slate-50 flex font-sans">
      <Sidebar :activeView="currentView" :usuario="usuarioActual" @change-view="setView" />

      <main class="flex-1 ml-72 transition-all duration-300">
        <header class="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40">
          <div class="flex items-center gap-4 text-slate-400 text-sm font-medium uppercase tracking-wider">
            <span>Administración</span>
            <span class="text-slate-300">/</span>
            <span class="text-slate-900 font-bold capitalize">{{ currentView }}</span>
          </div>
          <button @click="cerrarSesion" class="text-xs font-bold text-red-500 hover:text-red-700 transition-colors">
            Cerrar Sesión
          </button>
        </header>

        <div class="p-10 max-w-7xl mx-auto">
          <div v-if="currentView === 'dashboard'">
            <h2 class="text-2xl font-black text-slate-800 mb-6">Resumen del Negocio</h2>
            <div class="bg-indigo-900 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-900/20">
               <h3 class="text-xl font-bold mb-2">Bienvenido, {{ usuarioActual?.nombre }}</h3>
               <p class="text-indigo-200">Tu puesto actual es: {{ usuarioActual?.puesto }}</p>
            </div>
          </div>

          <Inventario v-if="currentView === 'inventario' || currentView === 'Inventario'" />
          <ClientesView v-if="currentView === 'clientes'" />
          <RentasView v-if="currentView === 'rentas'" />
          <UsuariosView v-if="currentView === 'usuarios'" />
          
        </div>
      </main>
    </div>

    <div v-if="mostrarModalSeguridad" class="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-100 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div class="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 text-center animate-in zoom-in duration-200">
        <div class="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert class="w-8 h-8" />
        </div>
        <h3 class="text-xl font-black text-slate-800 mb-2">Área Restringida</h3>
        <p class="text-slate-500 text-sm mb-6">Por seguridad, confirma tu contraseña de <span class="font-bold text-indigo-600">{{ usuarioActual?.puesto }}</span> para acceder a la gestión de personal.</p>

        <form @submit.prevent="verificarCredenciales" autocomplete="off">
          
          <input
            v-model="passwordConfirmacion"
            type="password"
            name="new-password"
            required
            autofocus
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            data-lpignore="true"
            data-1p-ignore="true"
            spellcheck="fasle"
            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none mb-4 text-center tracking-[0.3em] font-black text-slate-700"
            placeholder="••••••••"
          >
          <p v-if="errorSeguridad" class="text-red-500 text-xs font-bold mb-4 animate-bounce">{{ errorSeguridad }}</p>

          <div class="flex gap-3">
            <button type="button" @click="cancelarSeguridad" class="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition">Cancelar</button>
            <button type="submit" :disabled="cargandoSeguridad || !passwordConfirmacion" class="flex-1 px-4 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-indigo-600 transition disabled:bg-slate-300">
              {{ cargandoSeguridad ? 'Verificando...' : 'Desbloquear' }}
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ShieldAlert } from 'lucide-vue-next'; 

// IMPORTACIONES DE TUS VISTAS
import LoginView from './components/LoginView.vue';
import Sidebar from './components/Sidebar.vue';
import Inventario from './components/Inventario.vue';
import ClientesView from './components/ClientesView.vue';
import RentasView from './components/RentasView.vue';
import UsuariosView from './components/UsuariosView.vue';

const estaAutenticado = ref(false);
const usuarioActual = ref(null);
const currentView = ref('dashboard');

// ==========================================
// ESTADOS PARA EL CANDADO DE SEGURIDAD
// ==========================================
const mostrarModalSeguridad = ref(false);
const passwordConfirmacion = ref('');
const errorSeguridad = ref('');
const cargandoSeguridad = ref(false);

const manejarIngreso = (datosUsuario) => {
  usuarioActual.value = datosUsuario; 
  estaAutenticado.value = true;       
};

const cerrarSesion = () => {
  estaAutenticado.value = false;
  usuarioActual.value = null;
  currentView.value = 'dashboard'; 
};

// ==========================================
// INTERCEPTOR DE CLICS DEL MENÚ LATERIAL
// ==========================================
const setView = (viewId) => {
  if (viewId === 'usuarios') {
    mostrarModalSeguridad.value = true;
    passwordConfirmacion.value = '';
    errorSeguridad.value = '';
  } else {
    currentView.value = viewId;
  }
};

const cancelarSeguridad = () => {
  mostrarModalSeguridad.value = false;
  passwordConfirmacion.value = '';
  errorSeguridad.value = '';
};

const verificarCredenciales = async () => {
  cargandoSeguridad.value = true;
  errorSeguridad.value = '';

  try {
    const respuesta = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuario: usuarioActual.value.usuario, 
        password: passwordConfirmacion.value  
      })
    });

    const datos = await respuesta.json();

    if (datos.success) {
      mostrarModalSeguridad.value = false;
      currentView.value = 'usuarios';
    } else {
      errorSeguridad.value = 'Contraseña incorrecta. Acceso denegado.';
    }
  } catch (error) {
    errorSeguridad.value = 'Error de conexión con el servidor.';
  } finally {
    cargandoSeguridad.value = false;
    passwordConfirmacion.value = ''; 
  }
};

//prueba
</script>
