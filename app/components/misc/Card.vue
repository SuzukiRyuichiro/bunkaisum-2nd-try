<template>
  <div v-if="$slots.tag" class="text-sm text-slate-600 px-1">
    <slot name="tag" />
  </div>
  <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
    <slot />
  </div>
</template>
