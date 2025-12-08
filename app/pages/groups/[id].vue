<template>
  <div>
    <div class="flex gap-8 my-5">
      <p class="text-5xl">{{ group?.emoji }}</p>
      <div class="grow">
        <h1 class="text-xl font-semibold">{{ group?.name }}</h1>
        <p class="text-sm text-slate-600">{{ group?.membersCount }}人</p>
      </div>
    </div>
    <UTabs
      :items="items"
      color="primary"
      v-model="active"
      :unmount-on-hide="false"
    >
      <template #expenses>
        <ExpensesTab
          class="pt-4"
          :expenses="expenses"
          :group-id="route.params.id"
        />
      </template>

      <template #balances>
        <BalancesTab
          :group-id="parseInt(route.params.id)"
          class="pt-4"
          :balances="balances"
          :settlements="settlements"
        />
      </template>
    </UTabs>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "back",
  backTo: "/",
});

const router = useRouter();
const route = useRoute();

const { data: group } = await useFetch(`/api/groups/${route.params.id}`);
const { data: expenses } = await useFetch(
  `/api/groups/${route.params.id}/expenses`
);

const { data } = await useFetch(`/api/groups/${route.params.id}/balances`);
const { settlements, balances } = data.value || {
  settlements: [],
  balances: [],
};

const items = [
  {
    label: "出納表",
    icon: "i-lucide-receipt-japanese-yen",
    slot: "expenses",
    value: "expenses",
  },
  {
    label: "貸借対照表",
    icon: "i-lucide-hand-coins",
    slot: "balances",
    value: "balances",
  },
];
const active = computed({
  get() {
    return (route.query.tab as string) || "expenses";
  },
  set(tab) {
    router.push({
      path: route.path,
      query: { tab },
    });
  },
});
</script>
