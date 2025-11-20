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
        <p v-if="config.public.enableEmojiSuggestions">
          ChromeでやるとAIが勝手に選んでくれるはず
        </p>
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
            size="lg"
            v-model="formState.totalAmount"
            :format-options="{
              style: 'currency',
              currency: 'JPY',
              currencyDisplay: 'code',
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
        <UCheckboxGroup
          legend="参加者"
          v-model="formState.participantIds"
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
              <div class="grid gap-2">
                <div v-for="share in split" class="flex w-full justify-between">
                  <span>{{ share.displayName }}</span>
                  <span>¥{{ share.amount || 0 }}</span>
                </div>
              </div>
              <div
                class="flex justify-between"
                v-for="participant in formState.participantIds"
              >
                <span></span>
                <span></span>
              </div>
            </template>
            <template #ratio>
              <h1>ratio</h1>
            </template>
            <template #manual>
              <h1>manual</h1>
            </template>
          </UTabs>
        </UFormField>
      </Card>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import Card from "~/components/misc/Card.vue";
import type { TabsItem } from "@nuxt/ui";

definePageMeta({
  layout: "back",
});
const config = useRuntimeConfig();

const { data: users } = await useFetch("/api/users");

const formState = ref({
  totalAmount: 0,
  emoji: "",
  title: "",
  userId: null,
  participantIds: users.value?.map((u) => u.id),
  splitType: "equal",
});

const items = ["🍕", "☕️", "🧻", "✈️", "🛒", "🎉", "💸"];

const splitOptions = ref<TabsItem[]>([
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
]);

const split = computed<{ displayName: string; amount: number }[]>(() => {
  if (formState.value.splitType === "equal") {
    const shares = fairSplit(
      formState.value.totalAmount,
      formState.value.participantIds?.length || 0
    );

    return formState.value.participantIds?.map((participantId, index) => {
      const user = users.value?.find((user) => user.id === participantId);
      return { displayName: user?.displayName, amount: shares[index] };
    });
  }
});

// Will not use for now
let sessionCreationTriggered = false;
let localSession = null;
const createSession = async (options = {}) => {
  if (sessionCreationTriggered) {
    return;
  }

  // Only run on client-side, not during SSR
  if (typeof window === "undefined" || !window.LanguageModel) {
    console.log("LanguageModel API not available");
    return null;
  }

  try {
    const availability = await window.LanguageModel.availability();
    if (availability === "unavailable") {
      throw new Error("LanguageModel is not available.");
    }

    let modelNewlyDownloaded = false;
    if (availability !== "available") {
      modelNewlyDownloaded = true;
    }
    console.log(`LanguageModel is ${availability}.`);
    sessionCreationTriggered = true;

    const llmSession = await window.LanguageModel.create({
      monitor(m) {
        m.addEventListener("downloadprogress", (e) => {
          console.log(`Downloaded ${e.loaded * 100}%`);
        });
      },
    });

    sessionCreationTriggered = false;
    return llmSession;
  } catch (error) {
    throw error;
  }
};

const suggestEmoji = async () => {
  if (!config.public.enableEmojiSuggestions) {
    // feature flag
    console.log(
      "Please turn on the feature flag if you wish AI to suggest emoji"
    );
    return;
  }

  // Only run on client-side
  if (typeof window === "undefined" || !window.LanguageModel) {
    console.log("LanguageModel API not available - skipping emoji suggestion");
    return;
  }

  try {
    localSession = await createSession({
      expectedInputs: [{ type: "text", languages: ["ja"] }, { type: "text" }],
      expectedOutputs: [{ type: "text", languages: ["ja"] }],
      initialPrompts: [
        {
          role: "system",
          content:
            "あなたは文章を特定の絵文字にカテゴライズすることに特化したアシスタントです。様々な支出を割り勘するためのアプリの補助をしています。",
        },
      ],
    });
  } catch (error) {
    alert(error);
    return;
  }

  if (!localSession) {
    console.log("Failed to create LLM session");
    return;
  }

  try {
    const prompt = `もしこの中の絵文字から"${
      formState.value.title
    }"という文章を総括する様な絵文字を選ぶとしたら、どれを選ぶ？ 絵文字はこれら ${items.join(
      ", "
    )}。インデックスで答えてほしい ${items
      .map((item, index) => `${item} => ${index}`)
      .join(", ")}`;

    const result = await localSession.prompt(prompt, {
      responseConstraint: { type: "integer" },
    });

    formState.value.emoji = items[parseInt(result)];
  } catch (err) {
    console.error(err);
  }
};
</script>
