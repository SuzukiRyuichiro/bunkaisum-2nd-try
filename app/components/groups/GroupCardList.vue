<template>
  <div class="grid gap-4">
    <nuxt-link v-for="group in groups" :to="`/groups/${group.id}`">
      <GroupCard :group="group" />
    </nuxt-link>
  </div>
</template>

<script setup lang="ts">
import GroupCard from "~/components/groups/GroupCard.vue";

defineProps<{ groups: any }>();
</script>
