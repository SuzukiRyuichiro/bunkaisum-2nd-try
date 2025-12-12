<template>
  <div>
    <div class="py-2">
      <h1 class="text-lg font-semibold">新しいグループを作る</h1>
    </div>

    <UForm
      :schema="groupSchema"
      :state="formState"
      class="grid gap-4"
      @submit="addGroup"
    >
      <Card>
        <UFormField label="名前" name="name">
          <UInput
            class="w-full"
            size="lg"
            variant="soft"
            v-model="formState.name"
            @change="suggestEmoji"
            placeholder="静岡旅行"
          />
        </UFormField>
      </Card>

      <Card>
        <UFormField label="絵文字を選んでね" name="emoji">
          <URadioGroup
            indicator="hidden"
            variant="card"
            size="md"
            :ui="{
              item: 'text-3xl bg-elevated/50 has-data-[state=checked]:bg-primary/10 has-data-[state=checked]:border-primary/10',
              fieldset: 'flex-wrap',
            }"
            default-value="System"
            orientation="horizontal"
            v-model="formState.emoji"
            :items="items"
          />
        </UFormField>
      </Card>

      <Card>
        <UFormField label="参加者" name="userIds">
          <UCheckboxGroup
            v-model="formState.userIds"
            :items="users"
            value-key="id"
            :ui="{
              item: 'items-center',
              fieldset: 'gap-3 pt-2',
            }"
          >
            <template #label="{ item }">
              <div class="flex gap-3 items-center">
                <UAvatar
                  :src="
                    item?.profilePictureUrl
                      ? item?.profilePictureUrl
                      : 'https://github.com/benjamincanac.png'
                  "
                  size="2xl"
                />
                <p>{{ item?.displayName }}</p>
              </div>
            </template>
          </UCheckboxGroup>
        </UFormField>
      </Card>

      <UButton
        size="xl"
        color="success"
        :leading="false"
        :ui="{ base: 'justify-center' }"
        type="submit"
        >💾 追加</UButton
      >
    </UForm>
  </div>
</template>
<script lang="ts" setup>
import * as z from "zod";
import Card from "~/components/misc/Card.vue";
definePageMeta({
  layout: "back",
});

const formState = ref<Partial<GroupSchema>>({
  name: "",
  emoji: "",
  userIds: [],
});

const items = [
  "🏠", // Home & Household
  "✈️", // Travel & Vacations
  "💰", // General Spending/Savings
  "🛒", // Shopping & Groceries
  "🎉", // Celebrations & Events
];

const groupSchema = z.object({
  name: z.string().min(1, "名前を入力してください"),
  emoji: z.emoji("絵文字をえらんでください"),
  userIds: z.array(z.number()).min(2, {
    message: "二人以上参加者を選んでください",
  }),
});
type GroupSchema = z.output<typeof groupSchema>;

const suggestEmoji = async () => {
  // If emoji is already chosen, don't change
  if (formState.value.emoji !== "") return;

  const emoji = await $fetch("/api/emojis/suggest", {
    method: "POST",
    body: { title: formState.value.name },
  });

  if (emoji) {
    formState.value.emoji = emoji;
  }
};

const route = useRoute();
const { data: users } = await useFetch(`/api/users`);

const addGroup = async () => {
  const response = await $fetch("/api/groups", {
    method: "POST",
    body: JSON.stringify(formState.value),
  });
  // On success, redirect the user to the show page

  if (response.success) {
    navigateTo({
      path: "/",
    });
  }
};
</script>
