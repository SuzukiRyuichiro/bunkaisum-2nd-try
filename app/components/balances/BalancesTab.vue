<template>
  <div class="grid gap-4">
    <UButton class="justify-center" icon="i-lucide-coins" size="lg"
      >精算する</UButton
    >

    <BalanceCardList />
  </div>
</template>

<script setup lang="ts">
import BalanceCardList from "@/components/balances/BalanceCardList.vue";
</script>
