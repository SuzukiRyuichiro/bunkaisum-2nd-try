<template>
  <div>
    <!-- Header -->
    <div class="px-2 py-8">
      <div class="flex items-center gap-3">
        <p class="text-4xl cursor-pointer" @dblclick="logout">💸</p>
        <div>
          <h1 className="text-slate-900">Bunkaisum</h1>
          <p className="text-sm text-slate-600">みんなで割り勘アプリ</p>
        </div>
      </div>
    </div>
    <!-- Tabs -->
    <UTabs
      :items="items"
      color="primary"
      v-model="active"
      :unmount-on-hide="false"
    >
      <template #expenses>
        <ExpensesTab class="pt-4" />
      </template>

      <template #balances>
        <BalancesTab class="pt-4" />
      </template>
    </UTabs>
  </div>
</template>

<script setup lang="ts">
const { clear } = useUserSession();

const router = useRouter();

const logout = () => {
  clear();
  router.push("/login");
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

const route = useRoute();
const active = computed({
  get() {
    return (route.query.tab as string) || "expenses";
  },
  set(tab) {
    router.push({
      path: "/",
      query: { tab },
    });
  },
});
</script>
