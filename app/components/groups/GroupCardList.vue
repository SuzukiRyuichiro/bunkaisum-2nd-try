<template>
  <div class="grid gap-4">
    <nuxt-link
      v-for="(group, index) in groups"
      :to="`/groups/${group.id}`"
      :key="index"
    >
      <GroupCard :group="group" :delay="index * 100" />
    </nuxt-link>
  </div>
</template>

<script setup lang="ts">
import GroupCard from "~/components/groups/GroupCard.vue";

defineProps<{ groups: any }>();
</script>
