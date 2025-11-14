<template>
  <div>
    <p class="font-semibold">yo</p>
    <UAlert title="Heads up!" />

    <div v-if="loggedIn">
      <h1>Welcome {{ user?.name }}!</h1>
      <h1>{{ user }}</h1>

      <p>Logged in since {{ session?.loggedInAt }}</p>
      <UButton @click="clear">Logout</UButton>

      <UForm
        :schema="schema"
        :state="expense"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Title" name="title">
          <UInput v-model="expense.title" />
        </UFormField>

        <UFormField label="Total amount" name="totalAmount">
          <UInput v-model="expense.totalAmount" type="number" />
        </UFormField>

        <UFormField label="Paid at" name="paidAt">
          <UInput v-model="expense.paidAt" type="date" />
        </UFormField>

        <UButton type="submit"> Submit </UButton>
      </UForm>

      {{ expense }}
    </div>
    <div v-else>
      <h1>Not logged in</h1>
      <UButton
        v-if="!loggedIn"
        :to="lineLoginUrl"
        icon="i-simple-icons-line"
        label="Login with line"
        color="neutral"
        size="xs"
        external
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import * as z from "zod";

const schema = z.object({
  title: z.string(),
  totalAmount: z.number(),
  paidAt: z.iso.date(),
});

const toast = useToast();

const { loggedIn, user, session, clear } = useUserSession();

const lineLoginUrl = computed(() => {
  const state =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  return `/api/auth/line?state=${state}`;
});

const expense = ref({
  totalAmount: 0,
  title: "",
  paidAt: new Date().toISOString().split("T")[0], // "YYYY-MM-DD" format
});

const onSubmit = async () => {
  const response = await $fetch("/api/expenses", {
    method: "POST",
    body: { expense: expense.value },
  });

  toast.add({
    title: "Success",
    description: "The form has been submitted.",
    color: "success",
  });
};
</script>
