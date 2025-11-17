<template>
  <div class="grid gap-3">
    <div v-if="expenses === undefined || expenses.length === 0">
      <h3>データがありませんでした</h3>
    </div>
    <ExpenseCard
      v-for="(expense, index) in expenses"
      :expense="expense"
      :key="index"
    />
  </div>
</template>

<script lang="ts" setup>
import ExpenseCard from "./ExpenseCard.vue";

const expenses = ref([]);

onMounted(async () => {
  const response = await fetch("/api/expenses");
  const json = await response.json();

  expenses.value = json.expenses;
});
</script>
