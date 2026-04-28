<template>
  <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300">
    <div class="flex justify-between items-start">
      <div :class="colorClass" class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
        {{ icon }}
      </div>
      <span :class="trendClass" class="px-3 py-1 rounded-full text-xs font-bold">
        {{ trend }}
      </span>
    </div>
    <div class="mt-5">
      <h3 class="text-slate-500 font-medium text-sm">{{ title }}</h3>
      <p class="text-3xl font-black text-slate-800 mt-1">{{ value }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps(['title', 'value', 'trend', 'icon', 'colorClass', 'trendClass'])
</script>