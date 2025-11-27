<template>
  <div class="pb-10">
    <div class="py-2">
      <h1 class="text-lg font-semibold">新しい支払いを記録する</h1>
    </div>
    <ExpenseForm
      v-if="users"
      :users="users"
      :initial-data="{
        totalAmount: initialTotalAmount,
        emoji: initialEmoji,
        title: initialTitle,
        userId: initialUserId,
        participantIds: initialParticipantIds,
        splitType: initialSplitType,
      }"
      submit-button-text="💾 追加"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import ExpenseForm from "~/components/expenses/ExpenseForm.vue";

definePageMeta({
  layout: "back",
});

const { data: users } = await useFetch("/api/users");

// Get query parameters from route
const route = useRoute();
const queryParams = route.query;

// Parse query parameters for form initialization
const initialTotalAmount = queryParams.totalAmount
  ? Number(queryParams.totalAmount)
  : 0;
const initialUserId = queryParams.userId
  ? Number(queryParams.userId)
  : undefined;
const initialCreditorId = queryParams.creditorId
  ? Number(queryParams.creditorId)
  : undefined;
const initialTitle = queryParams.title ? String(queryParams.title) : "";
const initialEmoji = queryParams.emoji ? String(queryParams.emoji) : "";
const initialSplitType = queryParams.type === "manual" ? "manual" : "equal";

// If creditorId is provided, set participantIds to only include the creditor
const initialParticipantIds = initialCreditorId
  ? [initialCreditorId]
  : users.value?.map((u) => u.id);

const handleSuccess = (id: number) => {
  navigateTo(`/expenses/${id}`);
};
</script>
