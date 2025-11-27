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
        class="text-xl font-bold"
        :class="[
          balance.status === 'creditor' ? 'text-green-600' : 'text-red-600',
        ]"
      >
        ¥{{ balance.netBalance }}
      </p>
    </Card>
  </div>
</template>

<script setup lang="ts">
import Card from "@/components/misc/Card.vue";
const { status, data: balances } = await useFetch("/api/balances");
</script>
