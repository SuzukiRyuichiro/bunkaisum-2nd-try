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
import type { ExpenseWithUser } from "~~/server/utils/drizzle";
import ExpenseCard from "./ExpenseCard.vue";

const expenses = ref<ExpenseWithUser[]>([]);

const { expenses: responseExpenses } = await $fetch("/api/expenses");

expenses.value = responseExpenses;
</script>
