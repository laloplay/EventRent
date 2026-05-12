<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div class="w-full max-w-md bg-conic/[from_var(--border-angle)] from-white to-white via-indigo-600 animate-rotate-border rounded-3xl p-0.5 shadow-xl">
          <div class="w-full h-full bg-white rounded-3xl p-8">
              <div class="text-center mb-8">
                  <h1 class="text-2xl font-black text-slate-800 tracking-tight">EventRent Pro</h1>
                  <p class="text-sm text-slate-500 mt-2">Ingresa tus credenciales para continuar.</p>
              </div>

              <form @submit.prevent="handleLogin" autocomplete="off" class="space-y-6">
                  
                  <input type="text" style="display:none" autocomplete="username">
                  <input type="password" style="display:none" autocomplete="current-password">

                  <div>
                      <label class="block text-sm font-medium text-slate-700 mb-2">Usuario</label>
                      <input 
                        v-model="credenciales.usuario" 
                        type="text" 
                        required 
                        autocomplete="off" 
                        data-lpignore="true"
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all" 
                        placeholder="Ej: admin"
                      >
                  </div>
                  <div>
                      <label class="block text-sm font-bold text-slate-700 mb-2">Contraseña</label>
                      <input 
                        v-model="credenciales.password" 
                        type="password" 
                        required 
                        autocomplete="new-password" 
                        data-lpignore="true"
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all" 
                        placeholder="********"
                      >
                  </div>
                  <div v-if="mensajeError" class="p-3 bg-red-50 text-sm font-bold rounded-lg border border-red-100 text-center text-red-600">
                      {{ mensajeError }}
                  </div>
                  <button type="submit" :disabled="cargando" class="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-indigo-700 transition-all active:scale-95 disabled:bg-slate-400">
                      {{ cargando ? 'Verificando...' : 'Iniciar sesión' }}
                  </button>
              </form>
          </div>
      </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const credenciales = ref({ usuario: '', password: ''});
const mensajeError = ref('');
const cargando = ref(false);
const emit = defineEmits(['loginExitoso']);

const handleLogin = async () => {
  cargando.value = true;
  mensajeError.value = '';
  try {
      const respuesta = await fetch('http://localhost:3000/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credenciales.value)
      });
      const datos = await respuesta.json();
      if (respuesta.ok && datos.success) {
          emit('loginExitoso', datos.data); 
      } else {
          mensajeError.value = datos.message;
      }
  } catch(error) {
      mensajeError.value = 'Error de conexión. Intenta nuevamente.';
  } finally {
      cargando.value = false;
  }
}
</script>