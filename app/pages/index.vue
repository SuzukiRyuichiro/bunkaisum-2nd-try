<template>
  <div>
    <!-- Header -->
    <div class="px-2 py-8">
      <div class="flex items-center gap-3">
        <p class="text-4xl cursor-pointer" @dblclick="handleLogout">💸</p>
        <div>
          <h1 className="text-slate-900">Bunkaisum</h1>
          <p className="text-sm text-slate-600">みんなで割り勘アプリ</p>
        </div>
      </div>
    </div>

    <GroupCardList :groups="groups" />

    <UButton
      class="w-full flex justify-center mt-4"
      icon="i-lucide-plus"
      size="lg"
      to="/groups/new"
      >新しいグループを作る</UButton
    >
  </div>
</template>

<script setup lang="ts">
import GroupCardList from "~/components/groups/GroupCardList.vue";

const { logout } = useAuth();
const { status, data: groups } = await useAuthFetch("/api/groups");

const router = useRouter();

const handleLogout = () => {
  logout();
};
</script>
