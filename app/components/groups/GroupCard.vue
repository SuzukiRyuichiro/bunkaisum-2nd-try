<template>
  <Card>
    <div class="flex gap-4 items-center">
      <p class="text-3xl">{{ group?.emoji }}</p>
      <div class="grow">
        <h1 class="text-lg font-semibold">{{ group?.name }}</h1>
        <p class="text-sm text-slate-600">{{ group?.membersCount }}人</p>
      </div>
      <div class="flex -space-x-2">
        <img
          v-for="user in group?.groupMembers"
          :src="user.profilePictureUrl"
          alt=""
          class="size-8 rounded-full ring ring-gray-900 outline"
        />
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import Card from "~/components/misc/Card.vue";
defineProps<{ group: any }>();
</script>
