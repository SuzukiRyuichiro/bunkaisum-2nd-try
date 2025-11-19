<template>
  <div class="flex gap-8 mt-5">
    <p class="text-5xl">{{ expense?.emoji }}</p>
    <div class="grow">
      <h1 class="text-xl font-semibold">{{ expense?.title }}</h1>
      <p class="text-sm text-slate-600">支払日: {{ expense?.paidAt }}</p>
    </div>
  </div>
  <div class="grid gap-4 mt-8">
    <Card class="grid gap-3">
      <h3>合計額</h3>
      <h2 class="text-3xl font-bold">¥ {{ expense?.totalAmount }}</h2>
    </Card>

    <Card>
      <template v-slot:tag>
        <p class="mt-3">支払った人</p>
      </template>
      <div class="flex gap-2 items-center">
        <div class="grow flex gap-4">
          <UAvatar src="https://github.com/benjamincanac.png" size="2xl" />
          <div>
            <h3 class="" font-semibold>
              {{ expense?.user?.displayName }}
            </h3>
            <p class="text-xs">が全額払いました</p>
          </div>
        </div>
        <p class="text-red-600 text-xl">
          ¥{{
            expense?.involvements.find(
              (involvement) => involvement.type == "payment"
            )?.amount
          }}
        </p>
      </div>
    </Card>
    <Card>
      <template v-slot:tag>
        <div class="flex gap-2 mt-4">
          <p>詳細</p>
          <UBadge variant="soft" size="xs" v-if="expense?.splitType === 'equal'"
            >🟰 均等に割り勘</UBadge
          >
          <UBadge
            variant="soft"
            size="xs"
            v-else-if="expense?.splitType === 'exact'"
            >➗ 比率で割り勘</UBadge
          >
          <UBadge variant="soft" size="xs" v-else>🧮 マニュアルの金額</UBadge>
        </div>
      </template>
      <div class="flex gap-4 flex-col">
        <div
          v-for="involvement in expense?.involvements.filter(
            (involvement) => involvement.type === 'share'
          )"
          class="flex gap-4 justify-between items-center"
        >
          <UAvatar src="https://github.com/benjamincanac.png" size="xl" />
          <p class="grow font-lg font-medium">
            {{ involvement.user?.displayName }}
          </p>
          <span class="font-semibold">¥{{ -involvement.amount }}</span>
        </div>
      </div>
    </Card>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  layout: "back",
});
import Card from "~~/app/components/misc/Card.vue";

const route = useRoute();

const { data: expense } = await useFetch(`/api/expenses/${route.params.id}`);
</script>
