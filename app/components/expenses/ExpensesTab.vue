<template>
  <div class="grid gap-4">
    <UButton
      class="justify-center"
      icon="i-lucide-plus"
      size="lg"
      to="/expenses/new"
      >Add an expense</UButton
    >
    <ExpenseCardList />
  </div>
</template>

<script setup lang="ts">
import ExpenseCardList from "./ExpenseCardList.vue";
</script>
