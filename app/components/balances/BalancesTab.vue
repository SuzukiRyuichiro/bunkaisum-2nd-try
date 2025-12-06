<template>
  <div class="grid gap-4">
    <UModal scrollable>
      <UButton class="justify-center" icon="i-lucide-coins" size="lg"
        >精算する</UButton
      >

      <template #title>
        <h1 class="text-lg">💡精算方法</h1>
      </template>
      <template #body>
        <div class="grid gap-4 px-8 py-4">
          <Card v-for="settlement in settlements || []">
            <div class="grid grid-cols-[1fr_1rem_1fr] items-center">
              <div class="flex items-center gap-4">
                <UAvatar
                  :src="
                    settlement.from.profilePictureUrl ||
                    'https://placehold.jp/150x150.png'
                  "
                  size="xl"
                />
                <p class="font-semibold">{{ settlement.from.displayName }}</p>
              </div>
              <UIcon name="i-lucide-arrow-right" class="xl" />
              <div class="flex items-center gap-4 flex-row-reverse">
                <UAvatar
                  :src="
                    settlement.to.profilePictureUrl ||
                    'https://placehold.jp/150x150.png'
                  "
                  size="xl"
                />
                <p class="font-semibold">{{ settlement.to.displayName }}</p>
              </div>
            </div>
            <USeparator class="my-5" />
            <div class="text-center">
              <p class="text-lg">
                支払い金額: ¥
                <span class="font-semibold">{{ settlement.amount }}</span>
              </p>
            </div>
            <UButton
              icon="i-lucide-check"
              class="w-full justify-center mt-2"
              :to="{
                path: '/expenses/new',
                query: {
                  totalAmount: settlement.amount,
                  userId: settlement.from.userId,
                  creditorId: settlement.to.userId,
                  title: `${settlement.from.displayName}から${settlement.to.displayName}の支払い`,
                  emoji: '💸',
                  type: 'manual',
                },
              }"
              >精算済み</UButton
            >
          </Card>
        </div>
      </template>
    </UModal>

    <BalanceCardList :balances="balances || []" />
  </div>
</template>

<script setup lang="ts">
import BalanceCardList from "@/components/balances/BalanceCardList.vue";
import Card from "@/components/misc/Card.vue";

defineProps<{ balances: any; settlements: any }>();
</script>
