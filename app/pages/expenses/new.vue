<template>
  <div class="pb-10">
    <div class="py-2">
      <h1 class="text-lg font-semibold">新しい支払いを記録する</h1>
    </div>
    <UForm
      class="grid gap-4"
      :schema="expenseSchema"
      :state="formState"
      @submit="handleFormSubmit"
    >
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
        <UFormField label="合計額" name="totalAmount">
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
        <UFormField label="支払った人" name="userId">
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
        <UFormField label="支払った日" name="paidAt">
          <UPopover>
            <UButton
              color="neutral"
              variant="soft"
              icon="i-lucide-calendar"
              class="w-full"
            >
              {{ formState.paidAt ? formState.paidAt : "Select a date" }}
            </UButton>

            <template #content>
              <UCalendar v-model="calendarDate" class="p-2" />
            </template>
          </UPopover>
        </UFormField>
      </Card>
      <Card>
        <UFormField label="参加者" name="participantIds">
          <UCheckboxGroup
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

      <Card ref="splitFormCard">
        <UFormField
          label="割り勘の方法"
          name="splitType"
          :error="involvementError"
        >
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
                  <UInput
                    type="number"
                    size="xs"
                    :min="0"
                    icon="i-lucide-japanese-yen"
                    @change="
                      handleManualSplitChange($event, involvement.userId)
                    "
                    :value="manualSplit.get(involvement.userId)"
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
                <UButton @click="resetManualSplit">リセット</UButton>
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
        type="submit"
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
  DateFormatter,
  getLocalTimeZone,
  today,
  parseDate,
} from "@internationalized/date";
import type { CalendarDate } from "@internationalized/date";
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

const { data: users } = await useFetch("/api/users");

// Get query parameters from route
const route = useRoute();
const queryParams = route.query;

// Parse query parameters for form initialization
const initialTotalAmount = queryParams.totalAmount
  ? Number(queryParams.totalAmount)
  : 0;
const initialUserId = queryParams.userId ? Number(queryParams.userId) : undefined;
const initialCreditorId = queryParams.creditorId
  ? Number(queryParams.creditorId)
  : undefined;
const initialTitle = queryParams.title ? String(queryParams.title) : "";
const initialEmoji = queryParams.emoji ? String(queryParams.emoji) : "";
const initialSplitType = queryParams.type === "manual" ? "manual" : "equal";

// If creditorId is provided, set participantIds to only include the creditor
const initialParticipantIds = initialCreditorId
  ? [initialCreditorId]
  : users.value?.map((u) => u.id);

const formState = ref<Partial<ExpenseSchema>>({
  totalAmount: initialTotalAmount,
  emoji: initialEmoji,
  title: initialTitle,
  userId: initialUserId,
  participantIds: initialParticipantIds,
  splitType: initialSplitType,
  paidAt: today(getLocalTimeZone()).toString(),
});

const calendarDate = computed({
  get: () => parseDate(formState.value.paidAt || ""),
  set: (value: CalendarDate) => {
    formState.value.paidAt = value.toString();
  },
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

// Initialize manual split - if we have a creditor and manual type, set the full amount
const initialManualSplitMap = new Map(
  formState.value?.participantIds?.map((id) => [
    id,
    initialCreditorId === id && initialSplitType === "manual"
      ? initialTotalAmount
      : 0,
  ])
);

const manualSplit = ref(initialManualSplitMap);

const haveManuallySetSplit = ref(
  new Map(
    formState.value?.participantIds?.map((id) => [
      id,
      initialCreditorId === id && initialSplitType === "manual",
    ])
  )
);

const handleManualSplitChange = (event: Event, userId: number | null) => {
  if (userId == null) return;
  haveManuallySetSplit.value.set(userId, true);
  manualSplit.value.set(userId, Number.parseInt(event.target.value));

  // Do the automatic split
  // Count how many people are in the fair split
  const manuallySplitParticipantIds = [...haveManuallySetSplit.value]
    .filter(([_, value]) => value)
    .map(([key, _]) => key);
  const notManuallySplitParticipantIds = [...haveManuallySetSplit.value]
    .filter(([_, value]) => !value)
    .map(([key, _]) => key);

  const manualTotal = manuallySplitParticipantIds.reduce(
    (acc, cv) => (acc += manualSplit.value.get(cv)),
    0
  );

  // Calculate how much money there are left to split
  const remainder = formState.value.totalAmount - manualTotal;

  const remainingFairSplit = fairSplit(
    remainder,
    notManuallySplitParticipantIds
  );

  remainingFairSplit?.keys().forEach((id) => {
    manualSplit.value.set(id, remainingFairSplit.get(id));
  });

  checkInvolvementsValidityAndApplyError();
};

const splitFormCard = ref();
const involvementError = ref<boolean | string>(false);

const resetManualSplit = () => {
  manualSplit.value = new Map(
    formState.value?.participantIds?.map((id) => [id, 0])
  );

  haveManuallySetSplit.value = new Map(
    formState.value?.participantIds?.map((id) => [id, false])
  );
};

const recalculateSplitRatio = () => {
  splitRatio.value = new Map(
    formState.value?.participantIds?.map((id) => [
      id,
      splitRatio.value?.get(id) || 1,
    ])
  );

  resetManualSplit();
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
        amount: split?.get(id) || 0,
        shareRatio: null,
      })) || []),
      {
        userId: formState.value.userId,
        user: users.value?.find((user) => user.id === formState.value.userId),
        type: "payment",
        amount: -formState.value.totalAmount,
        shareRatio: null,
      },
    ];
  } else if (formState.value.splitType === "ratio") {
    const split = ratioSplit(formState.value.totalAmount, splitRatio.value);
    return [
      ...(formState.value.participantIds?.map((id) => ({
        userId: id,
        user: users.value?.find((user) => user.id === id),
        type: "share",
        amount: split?.get(id) || 0,
        shareRatio: splitRatio.value.get(id),
      })) || []),
      {
        userId: formState.value.userId,
        user: users.value?.find((user) => user.id === formState.value.userId),
        type: "payment",
        amount: -formState.value.totalAmount,
        shareRatio: null,
      },
    ];
  } else if (formState.value.splitType === "manual") {
    const split = manualSplit.value;
    return [
      ...(formState.value.participantIds?.map((id) => ({
        userId: id,
        user: users.value?.find((user) => user.id === id),
        type: "share",
        amount: split?.get(id) || 0,
        shareRatio: null,
      })) || []),
      {
        userId: formState.value.userId,
        user: users.value?.find((user) => user.id === formState.value.userId),
        type: "payment",
        amount: -formState.value.totalAmount,
        shareRatio: null,
      },
    ];
  }

  return [];
});

const shareInvolvements = computed(() =>
  involvements.value.filter((involvement) => involvement.type === "share")
);

// Form schema

const expenseSchema = z.object({
  title: z.string().min(1, "件名を入力してください"),
  emoji: z.emoji("絵文字をえらんでください"),
  totalAmount: z.int().min(1, "1円以上の金額を入力してください"),
  userId: z.int("支払った人を選んでください"),
  paidAt: z.preprocess((val: CalendarDate) => {
    return val.toString();
  }, z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  splitType: z.enum(["equal", "ratio", "manual"]),
  participantIds: z.array(z.int()).min(1, "1人以上参加者を選んでください"),
});

const involvementsSchema = z
  .array(
    z
      .object({
        userId: z.number(),
        amount: z.number(),
        shareRatio: z.number().nullable().optional(),
        type: z.enum(["share", "payment"]),
        user: z.object(),
      })
      .omit({ user: true })
      .refine(
        (data) => {
          return data.type === "payment" ? data.amount <= 0 : data.amount >= 0;
        },
        {
          error: "額がマイナスです",
        }
      )
  )
  .refine(
    (items) => {
      const sum = items.reduce((acc, item) => acc + item.amount, 0);
      return sum === 0;
    },
    { error: "合計額が合いません" }
  )
  .min(2, "1人以上割り勘に参加する必要があります");

type ExpenseSchema = z.output<typeof expenseSchema>;

const handleFormSubmit = async (event: FormSubmitEvent<ExpenseSchema>) => {
  // Validate the involvements array
  checkInvolvementsValidityAndApplyError();
  // Build the object to submit
  const payload = {
    expense: {
      title: formState.value.title,
      totalAmount: formState.value.totalAmount,
      emoji: formState.value.emoji,
      paidAt: formState.value.paidAt,
      userId: formState.value.userId,
      splitType: formState.value.splitType,
    },
    involvements: involvements.value.map(
      ({ userId, amount, type, shareRatio }) => ({
        userId,
        amount,
        type,
        shareRatio,
      })
    ),
  };

  const response = await $fetch("/api/expenses", {
    method: "POST",
    body: payload,
  });
  // On success, redirect the user to the show page

  if (response.success) {
    navigateTo(`/expenses/${response.id}`);
  }
};

const checkInvolvementsValidityAndApplyError = () => {
  const { success } = involvementsSchema.safeParse(involvements.value);

  if (!success) {
    involvementError.value = "割り勘にエラーがあります";
    splitFormCard.value?.root?.classList.add("animate-wiggle");
    setTimeout(() => {
      splitFormCard.value?.root?.classList.remove("animate-wiggle");
    }, 900);
  } else {
    involvementError.value = false;
  }
};

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
