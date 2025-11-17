<template>
  <div class="py-4">
    <UButton
      icon="i-lucide-arrow-left"
      variant="ghost"
      @click="() => router.go(-1)"
      >Back</UButton
    >
  </div>
</template>

<script setup lang="ts">
const router = useRouter();
</script>
