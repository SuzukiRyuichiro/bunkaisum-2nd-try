<template>
  <UContainer>
    <UButton
      @click="handleBack"
      icon="i-lucide-arrow-left"
      variant="ghost"
      class="mt-4"
      >戻る</UButton
    ><slot
  /></UContainer>
</template>

<script setup lang="ts">
const router = useRouter();
const route = useRoute();

const handleBack = () => {
  // Check if page defines a custom back route in meta
  const backTo = route.meta.backTo as string | undefined;

  if (backTo) {
    router.push(backTo);
  } else {
    router.go(-1);
  }
};
</script>
