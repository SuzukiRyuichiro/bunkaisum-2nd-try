<template>
  <div>
    <!-- Header -->
    <div class="px-2 py-8">
      <div class="flex items-center gap-3">
        <p class="text-4xl cursor-pointer" @dblclick="logout">💸</p>
        <div>
          <h1 className="text-slate-900">Bunkaisum</h1>
          <p className="text-sm text-slate-600">みんなで割り勘アプリ</p>
        </div>
      </div>
    </div>

    <GroupCardList :groups="groups" />
  </div>
</template>

<script setup lang="ts">
import GroupCardList from "~/components/groups/GroupCardList.vue";

const { clear } = useUserSession();
const { status, data: groups } = await useFetch("/api/groups");

const router = useRouter();

const logout = () => {
  clear();
  router.push("/login");
};
</script>
