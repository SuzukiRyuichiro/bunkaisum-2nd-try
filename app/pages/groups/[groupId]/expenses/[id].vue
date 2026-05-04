<template>
  <div class="flex gap-8 mt-5">
    <p class="text-5xl">{{ expense?.emoji }}</p>
    <div class="grow">
      <h1 class="text-xl font-semibold">{{ expense?.title }}</h1>
      <p class="text-sm text-slate-600">支払日: {{ expense?.paidAt }}</p>
    </div>
  </div>
  <div class="grid gap-4 mt-8">
    <Card class="grid gap-3" :delay="0">
      <h3>合計額</h3>
      <h2 class="text-3xl font-bold">¥ {{ expense?.totalAmount }}</h2>
    </Card>

    <Card :delay="100">
      <template v-slot:tag>
        <p class="mt-3">支払った人</p>
      </template>
      <div class="flex gap-2 items-center">
        <div class="grow flex gap-4">
          <UAvatar
            :src="
              expense?.involvements.find(
                (involvement) => involvement.type == 'payment'
              )?.user?.profilePictureUrl
                ? expense?.involvements.find(
                    (involvement) => involvement.type == 'payment'
                  )?.user?.profilePictureUrl
                : 'https://github.com/benjamincanac.png'
            "
            size="2xl"
          />
          <div>
            <h3 class="" font-semibold>
              {{
                expense?.involvements.find(
                  (involvement) => involvement.type == "payment"
                )?.user?.displayName
              }}
            </h3>
            <p class="text-xs">が全額払いました</p>
          </div>
        </div>
        <p class="text-red-600 text-xl font-bold">
          ¥{{
            (expense?.involvements.find(
              (involvement) => involvement.type == "payment"
            )?.amount || 0) * -1
          }}
        </p>
      </div>
    </Card>
    <Card :delay="200">
      <template v-slot:tag>
        <div class="flex gap-2 mt-4">
          <p>詳細</p>
          <UBadge variant="soft" size="xs" v-if="expense?.splitType === 'equal'"
            >🟰 均等に割り勘
          </UBadge>
          <UBadge
            variant="soft"
            size="xs"
            v-else-if="expense?.splitType === 'ratio'"
            >➗ 比率で割り勘</UBadge
          >
          <UBadge variant="soft" size="xs" v-else>🧮 マニュアルの金額</UBadge>
        </div>
      </template>
      <div class="flex gap-4 flex-col">
        <div
          v-for="involvement in expense?.involvements.filter(
            (involvement) => involvement.type === 'share'
          )"
          class="flex gap-4 justify-between items-center"
        >
          <UAvatar
            :src="
              involvement?.user?.profilePictureUrl
                ? involvement?.user?.profilePictureUrl
                : 'https://github.com/benjamincanac.png'
            "
            size="xl"
          />
          <p class="grow font-lg font-medium">
            {{ involvement.user?.displayName }}
            <span class="text-muted text-xs" v-if="involvement.shareRatio"
              >{{ involvement.shareRatio }}x</span
            >
          </p>

          <span class="font-semibold">¥{{ involvement.amount }}</span>
        </div>
      </div>
    </Card>
    <Card :delay="300">
      <template v-slot:tag>
        <p class="mt-3">備考</p>
      </template>
      <p class="text-slate-600">
        {{ expense?.user?.displayName }} が
        {{
          new Intl.DateTimeFormat("ja-JP", {
            dateStyle: "full",
            timeStyle: "medium",
          }).format(new Date(expense?.createdAt || null))
        }}
        に記録しました
      </p>
    </Card>
  </div>
</template>

<script lang="ts" setup>
import Card from "~~/app/components/misc/Card.vue";
const route = useRoute();

definePageMeta({
  layout: "back",
});

// TODO: I couldn't figure out how to make nested routes in the API side
const { data: expense } = await useAuthFetch(`/api/expenses/${route.params.id}`);
</script>

