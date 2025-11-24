<template>
  <div class="grid gap-4">
    <UButton
      class="justify-center"
      icon="i-lucide-plus"
      size="lg"
      to="/expenses/new"
      >支払いを記録</UButton
    >
    <ExpenseCardList />
  </div>
</template>

<script setup lang="ts">
import ExpenseCardList from "./ExpenseCardList.vue";
</script>
