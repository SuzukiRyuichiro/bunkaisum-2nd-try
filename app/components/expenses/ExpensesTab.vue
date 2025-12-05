<template>
  <div class="grid gap-4">
    <UButton
      class="justify-center"
      icon="i-lucide-plus"
      size="lg"
      :to="`/groups/${groupId}/expenses/new`"
      >支払いを記録</UButton
    >
    <ExpenseCardList :expenses="expenses" />
  </div>
</template>

<script setup lang="ts">
import ExpenseCardList from "./ExpenseCardList.vue";

defineProps<{ expenses: any; groupId: any }>();
</script>
