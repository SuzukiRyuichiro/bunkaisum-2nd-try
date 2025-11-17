<template>
  <div class="py-4">
    <UButton
      icon="i-lucide-arrow-left"
      variant="ghost"
      @click="() => router.go(-1)"
      >Back</UButton
    >
    <h1>新しい支払いを記録する</h1>

    <UForm>
      <UCard>
        <UFormField label="件名" name="title">
          <UInput v-model="state.title" />
        </UFormField>
      </UCard>

      <UCard>
        <template #header>
          <h2>絵文字を選んでね</h2>
          <p>ChromeでやるとAIが勝手に選んでくれるはず</p>
        </template>
        <URadioGroup
          indicator="hidden"
          variant="card"
          default-value="System"
          orientation="horizontal"
          v-model="state.emoji"
          :items="['🍕', '☕️', '🧻', '✈️', '💸']"
        />
      </UCard>
    </UForm>
  </div>
</template>

<script setup lang="ts">
const router = useRouter();

const state = ref({});
</script>
