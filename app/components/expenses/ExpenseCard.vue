<template>
  <NuxtLink :to="to">
    <button
      v-if="expense"
      class="animate-card w-full bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-slate-200 hover:border-slate-300 text-left"
      :style="{ animationDelay: `${delay}ms` }"
    >
      <div class="flex items-center gap-4">
        <div class="text-3xl">
          {{ expense?.emoji || "🤑" }}
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-slate-900">{{ expense?.title }}</div>
          <div class="text-sm text-slate-600 mt-0.5">
            {{
              expense?.involvements?.find((inv) => inv.type === "payment")?.user
                ?.displayName
            }}が支払い
            {{ expense?.paidAt }}
          </div>
        </div>
        <div class="text-right">
          <div class="text-slate-900">
            {{
              new Intl.NumberFormat("ja-JP", {
                style: "currency",
                currency: "JPY",
              }).format(expense?.totalAmount || 0)
            }}
          </div>
          <div class="text-xs text-slate-500 mt-0.5">
            {{ expense.participantCount }}人
          </div>
        </div>
      </div>
    </button>
  </NuxtLink>
</template>

<script lang="ts" setup>
const props = defineProps<{
  expense: ExpenseWithUser;
  to: Object;
  delay?: number;
}>();
</script>
