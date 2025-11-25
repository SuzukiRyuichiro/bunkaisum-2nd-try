<template>
  <div class="pb-10">
    <Meta
      v-if="config.public.enableEmojiSuggestions"
      http-equiv="origin-trial"
      content="Ay9zgWOzVsfIJ97aKTvjzn6TAUKOKShK05ozaYMbNhuW67sq9wyY97qdI6Bqp28kmUjZrevZzrKIw/kP0h2aagYAAACOeyJvcmlnaW4iOiJodHRwczovL3J5dWljaGlyb3N1enVraS5jb206NDQzIiwiZmVhdHVyZSI6IkFJUHJvbXB0QVBJTXVsdGltb2RhbElucHV0IiwiZXhwaXJ5IjoxNzc0MzEwNDAwLCJpc1N1YmRvbWFpbiI6dHJ1ZSwiaXNUaGlyZFBhcnR5Ijp0cnVlfQ=="
    />
    <div class="py-2">
      <h1 class="text-lg font-semibold">新しい支払いを記録する</h1>
    </div>
    <UForm class="grid gap-4">
      <progress ref="progress" hidden="" id="progress" value="0"></progress>
      <Card>
        <UFormField label="件名" name="title">
          <UInput
            class="w-full"
            size="lg"
            variant="soft"
            v-model="formState.title"
            @change="suggestEmoji"
            placeholder="例: 目黒のランチ"
          />
        </UFormField>
      </Card>

      <Card>
        <URadioGroup
          indicator="hidden"
          legend="絵文字を選んでね"
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
      </Card>
      <Card>
        <UFormField label="合計額" name="total amount">
          <UInputNumber
            class="w-full"
            variant="soft"
            :min="0"
            orientation="vertical"
            size="lg"
            v-model="formState.totalAmount"
            :format-options="{
              style: 'currency',
              currency: 'JPY',
              currencyDisplay: 'symbol',
            }"
          />
        </UFormField>
      </Card>

      <Card>
        <UFormField label="支払った人" name="paid by">
          <USelect
            placeholder="一人選んでください"
            size="lg"
            variant="soft"
            class="w-full"
            v-model="formState.userId"
            value-key="id"
            :items="users.map((u) => ({ id: u.id, label: u.displayName }))"
          />
        </UFormField>
      </Card>

      <Card>
        <UFormField label="支払った日" name="paid at">
          <UPopover>
            <UButton
              color="neutral"
              variant="soft"
              icon="i-lucide-calendar"
              class="w-full"
            >
              {{
                formState.paidAt
                  ? dateFormatter.format(
                      formState.paidAt.toDate(getLocalTimeZone())
                    )
                  : "Select a date"
              }}
            </UButton>

            <template #content>
              <UCalendar v-model="formState.paidAt" class="p-2" />
            </template>
          </UPopover>
        </UFormField>
      </Card>
      <Card>
        <UCheckboxGroup
          legend="参加者"
          v-model="formState.participantIds"
          @update:model-value="recalculateSplitRatio"
          :items="users"
          value-key="id"
          :ui="{
            item: 'items-center',
            fieldset: 'gap-3',
          }"
        >
          <template #label="{ item }">
            <div class="flex gap-3 items-center">
              <UAvatar src="https://github.com/benjamincanac.png" />
              <p>{{ item?.displayName }}</p>
            </div>
          </template>
        </UCheckboxGroup>
      </Card>

      <Card>
        <UFormField label="割り勘の方法">
          <UTabs
            v-model="formState.splitType"
            :items="splitOptions"
            class="w-full mt-2"
          >
            <template #equal>
              <h3>人数で均等に割り勘</h3>
              <USeparator class="my-3" />
              <div class="grid gap-3">
                <div
                  v-for="involvement in shareInvolvements"
                  class="flex w-full justify-between items-center"
                >
                  <span>{{ involvement.user?.displayName }}</span>
                  <span>¥{{ -involvement.amount || 0 }}</span>
                </div>
              </div>
            </template>
            <template #ratio>
              <h3>比率で割り勘</h3>
              <USeparator class="my-3" />
              <div
                class="grid grid-cols-[min-content_1fr_min-content] gap-y-4 gap-x-2 items-center"
              >
                <template
                  v-for="involvement in shareInvolvements"
                  :key="involvement.userId"
                >
                  <p class="text-nowrap">{{ involvement.user?.displayName }}</p>
                  <div class="flex place-self-end self-center gap-2">
                    <p>{{ splitRatio.get(involvement.userId) }}x</p>
                    <UFieldGroup>
                      <UButton
                        size="xs"
                        icon="i-lucide-minus"
                        @click="decrementRatio(involvement.userId || 0)"
                      />
                      <UButton
                        size="xs"
                        icon="i-lucide-plus"
                        @click="incrementRatio(involvement.userId || 0)"
                      />
                    </UFieldGroup>
                  </div>
                  <p class="place-self-end self-center">
                    ¥{{ -involvement.amount || 0 }}
                  </p>
                </template>
              </div>
            </template>
            <template #manual>
              <h3>カスタムの割り勘</h3>
              <USeparator class="my-3" />
              <div class="grid gap-3">
                <div
                  v-for="involvement in shareInvolvements"
                  class="flex w-full justify-between items-center"
                >
                  <span>{{ involvement.user?.displayName }}</span>
                  <UInputNumber
                    size="xs"
                    orientation="vertical"
                    :min="0"
                    :value="manualSplit.get(involvement.userId)"
                    @update:modelValue="
                      (v) => manualSplit.set(involvement.userId, v)
                    "
                    :format-options="{
                      style: 'currency',
                      currency: 'JPY',
                      currencyDisplay: 'symbol',
                    }"
                  />
                </div>
              </div>
              <div
                v-if="
                  formState.totalAmount !==
                  [...manualSplit.values()].reduce((acc, v) => acc + v, 0)
                "
              >
                <USeparator class="my-3" />
                <p class="text-error-500">合計額が合いません</p>
              </div>
            </template>
          </UTabs>
        </UFormField>
      </Card>

      <UButton
        size="xl"
        color="success"
        :leading="false"
        :ui="{ base: 'justify-center' }"
        >💾 追加</UButton
      >
    </UForm>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "back",
});
import Card from "~/components/misc/Card.vue";
import {
  CalendarDate,
  DateFormatter,
  getLocalTimeZone,
  today,
  type DateValue,
} from "@internationalized/date";

const config = useRuntimeConfig();

const { data: users } = await useFetch("/api/users");

const formState = ref({
  totalAmount: 0,
  emoji: "",
  title: "",
  userId: null,
  participantIds: users.value?.map((u) => u.id),
  splitType: "equal",
  paidAt: today(getLocalTimeZone()),
});

const dateFormatter = new DateFormatter("ja-JP", {
  dateStyle: "medium",
});

const splitRatio = ref(
  new Map(formState.value?.participantIds?.map((id) => [id, 1]))
);

const incrementRatio = (userId: number) => {
  const ratio = splitRatio.value.get(userId);

  if (ratio === undefined) return;

  splitRatio.value.set(userId, ratio + 1);
};

const decrementRatio = (userId: number) => {
  const ratio = splitRatio.value.get(userId) || 0;

  if (ratio < 1) return;

  splitRatio.value.set(userId, ratio - 1);
};

const manualSplit = ref(
  new Map(formState.value?.participantIds?.map((id) => [id, 0]))
);

const recalculateSplitRatio = () => {
  splitRatio.value = new Map(
    formState.value?.participantIds?.map((id) => [
      id,
      splitRatio.value?.get(id) || 1,
    ])
  );
};

const involvements = computed(() => {
  if (formState.value.splitType === "equal") {
    const split = fairSplit(
      formState.value.totalAmount,
      formState.value.participantIds || []
    );

    return [
      ...(formState.value.participantIds?.map((id) => ({
        userId: id,
        user: users.value?.find((user) => user.id === id),
        type: "share",
        amount: -(split?.get(id) || 0),
      })) || []),
      {
        userId: formState.value.userId,
        user: users.value?.find((user) => user.id === formState.value.userId),
        type: "payment",
        amount: formState.value.totalAmount,
      },
    ];
  } else if (formState.value.splitType === "ratio") {
    const split = ratioSplit(formState.value.totalAmount, splitRatio.value);
    return [
      ...(formState.value.participantIds?.map((id) => ({
        userId: id,
        user: users.value?.find((user) => user.id === id),
        type: "share",
        amount: -(split?.get(id) || 0),
        shareRatio: splitRatio.value.get(id),
      })) || []),
      {
        userId: formState.value.userId,
        user: users.value?.find((user) => user.id === formState.value.userId),
        type: "payment",
        amount: formState.value.totalAmount,
      },
    ];
  } else if (formState.value.splitType === "manual") {
    const split = manualSplit.value;
    return [
      ...(formState.value.participantIds?.map((id) => ({
        userId: id,
        user: users.value?.find((user) => user.id === id),
        type: "share",
        amount: -(split?.get(id) || 0),
      })) || []),
      {
        userId: formState.value.userId,
        user: users.value?.find((user) => user.id === formState.value.userId),
        type: "payment",
        amount: formState.value.totalAmount,
      },
    ];
  }

  return [];
});

const shareInvolvements = computed(() =>
  involvements.value.filter((involvement) => involvement.type === "share")
);

const items = ["🍕", "☕️", "🍺", "🧻", "✈️", "🛒", "🎉", "💸"];

const splitOptions = [
  {
    label: "均等",
    icon: "i-lucide-scale",
    slot: "equal",
    value: "equal",
  },
  {
    label: "比率",
    icon: "i-lucide-divide",
    slot: "ratio",
    value: "ratio",
  },
  {
    label: "マニュアル",
    icon: "i-lucide-calculator",
    slot: "manual",
    value: "manual",
  },
];

const suggestEmoji = async () => {
  // If emoji is already chosen, don't change
  if (formState.value.emoji !== "") return;

  const emoji = await $fetch("/api/emojis/suggest", {
    method: "POST",
    body: { title: formState.value.title },
  });

  if (emoji) {
    formState.value.emoji = emoji;
  }
};
</script>
