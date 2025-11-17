<template>
  <div>
    <!-- Header -->
    <div class="px-6 py-8">
      <div class="flex items-center gap-3">
        <p class="text-4xl">💸</p>
        <div>
          <h1 className="text-slate-900">Bunkaisum</h1>
          <p className="text-sm text-slate-600">みんなで割り勘アプリ</p>
        </div>
      </div>
    </div>
    <!-- Tabs -->
    <UTabs :items="items" color="primary" :unmount-on-hide="false">
      <template #expenses>
        <ExpensesTab class="pt-4" />
      </template>

      <template #balance></template>
    </UTabs>
  </div>
</template>

<script setup lang="ts">
const items = [
  {
    label: "Expenses",
    icon: "i-lucide-user",
    slot: "expenses",
  },
  {
    label: "Balance",
    icon: "i-lucide-lock",
    slot: "balance",
  },
];
</script>
