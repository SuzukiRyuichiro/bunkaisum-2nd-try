<template>
  <div class="pb-10">
    <div class="py-2">
      <h1 class="text-lg font-semibold">支払いを編集する</h1>
    </div>
    <ExpenseForm
      v-if="expense && users"
      :users="users"
      :initial-data="{
        title: expense.title,
        emoji: expense.emoji,
        totalAmount: expense.totalAmount,
        userId: expense.userId,
        paidAt: expense.paidAt,
        participantIds: expense.involvements
          .filter((inv) => inv.type === 'share')
          .map((inv) => inv.userId),
        splitType: expense.splitType,
        involvements: expense.involvements,
      }"
      :is-edit="true"
      :expense-id="expense.id"
      submit-button-text="💾 保存"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import ExpenseForm from "~/components/expenses/ExpenseForm.vue";

definePageMeta({
  layout: "back",
  backTo: "/",
});

const route = useRoute();
const expenseId = Number(route.params.id);

const { data: expense } = await useFetch(`/api/expenses/${expenseId}`);
const { data: users } = await useFetch("/api/users");

const handleSuccess = (id: number) => {
  navigateTo(`/expenses/${id}`);
};
</script>
