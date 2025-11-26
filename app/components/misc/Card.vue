<template>
  <div ref="root">
    <div v-if="$slots.tag" class="text-sm text-slate-600 px-1 mb-3">
      <slot name="tag" />
    </div>
    <div
      v-bind:class="$attrs.class"
      class="bg-white rounded-2xl p-4 shadow-sm border border-slate-200"
    >
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref, defineExpose } from "vue";

const root = ref(null);

defineExpose({ root });
</script>
