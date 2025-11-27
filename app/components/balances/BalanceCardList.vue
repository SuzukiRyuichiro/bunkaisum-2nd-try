<template>
  <div class="grid gap-3 w-full">
    <Card class="flex w-full items-center" v-for="balance in balances">
      <div class="grow flex gap-4 items-center">
        <UAvatar
          :src="
            balance?.profilePictureUrl
              ? balance.profilePictureUrl
              : 'https://placehold.jp/150x150.png'
          "
          size="3xl"
        />
        <div>
          <h3 class="font-semibold text-lg">{{ balance.displayName }}</h3>
          <span class="text-sm text-muted">{{
            balance.status === "creditor" ? "債権者" : "債務者"
          }}</span>
        </div>
      </div>
      <p
        class="text-xl font-bold flex items-center"
        :class="[
          balance.status === 'creditor' ? 'text-green-600' : 'text-red-600',
        ]"
      >
        <UIcon
          v-if="balance.status === 'creditor'"
          name="i-lucide-plus"
          class="size-5"
        />
        <UIcon v-else name="i-lucide-minus" class="size-5" />
        ¥{{ Math.abs(balance.netBalance) }}
      </p>
    </Card>
  </div>
</template>

<script setup lang="ts">
import Card from "@/components/misc/Card.vue";
defineProps<{ balances: any[] }>();
</script>
