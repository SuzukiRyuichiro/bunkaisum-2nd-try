<template>
  <div class="py-4">
    <Meta
      http-equiv="origin-trial"
      content="AwORxaXj4VOThHQyBt34bbc0gH3tURXD5Smyyj3/ZViATdEobJt1tmo7/iI5O6xjl2JTQKdawqz2HL5Cx4V2CwYAAACUeyJvcmlnaW4iOiJodHRwczovL3NwbGl0LnJ5dWljaGlyb3N1enVraS5jb206NDQzIiwiZmVhdHVyZSI6IkFJUHJvbXB0QVBJTXVsdGltb2RhbElucHV0IiwiZXhwaXJ5IjoxNzc0MzEwNDAwLCJpc1N1YmRvbWFpbiI6dHJ1ZSwiaXNUaGlyZFBhcnR5Ijp0cnVlfQ=="
    />
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
          <UInput v-model="state.title" @change="suggestEmoji" />
        </UFormField>
      </UCard>

      <progress ref="progress" hidden="" id="progress" value="0"></progress>

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
          :items="items"
        />
      </UCard>
    </UForm>
  </div>
</template>

<script setup lang="ts">
const router = useRouter();

const state = ref({});

const items = ["🍕", "☕️", "🧻", "✈️", "💸"];

let sessionCreationTriggered = false;
let localSession = null;

const createSession = async (options = {}) => {
  if (sessionCreationTriggered) {
    return;
  }

  // Only run on client-side, not during SSR
  if (LanguageModel) {
    console.log("LanguageModel API not available");
    return null;
  }

  try {
    const availability = await LanguageModel.availability();
    if (availability === "unavailable") {
      throw new Error("LanguageModel is not available.");
    }

    let modelNewlyDownloaded = false;
    if (availability !== "available") {
      modelNewlyDownloaded = true;
    }
    console.log(`LanguageModel is ${availability}.`);
    sessionCreationTriggered = true;

    const llmSession = await LanguageModel.create({
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
  // Only run on client-side
  if (LanguageModel) {
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
      state.value.title
    }"という文章を総括する様な絵文字を選ぶとしたら、どれを選ぶ？ 絵文字はこれら ${items.join(
      ", "
    )}。インデックスで答えてほしい ${items
      .map((item, index) => `${item} => ${index}`)
      .join(", ")}`;

    const result = await localSession.prompt(prompt, {
      responseConstraint: { type: "integer" },
    });

    state.value.emoji = items[parseInt(result)];
  } catch (err) {
    console.error(err);
  }
};
</script>
