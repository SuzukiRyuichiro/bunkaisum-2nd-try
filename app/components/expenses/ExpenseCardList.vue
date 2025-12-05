<template>
  <div class="grid gap-3">
    <div v-if="expenses === undefined || expenses.length === 0">
      <h3>データがありませんでした</h3>
    </div>
    <ExpenseCard
      v-for="(expense, index) in expenses"
      :expense="expense"
      :key="index"
      :to="{ name: 'expenses-id', params: { id: expense.id } }"
    />
  </div>
</template>

<script lang="ts" setup>
import ExpenseCard from "~/components/expenses/ExpenseCard.vue";
defineProps<{ expenses: any }>();
</script>
