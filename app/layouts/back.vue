<template>
  <UContainer>
    <UButton
      @click="router.go(-1)"
      icon="i-lucide-arrow-left"
      variant="ghost"
      class="mt-4"
      >戻る</UButton
    ><slot
  /></UContainer>
</template>

<script setup lang="ts">
const router = useRouter();
</script>
