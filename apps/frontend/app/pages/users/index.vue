<script setup lang="ts">
import { useUsers, type ResponseUser } from "~/composables/users/useUsers";
import { useUsersColum } from "~/composables/users/useUsersColumn";

const { columns } = useUsersColum();
const { find, refresh } = useUsers();
const dataUsers = ref<ResponseUser | null>(null);

onMounted(() => {
  find().then((res) => (dataUsers.value = res.data));
});
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="List User">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UsersAddModal :refresh="refresh" />
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <DataTable
        :columns="columns"
        class="shrink-0"
        :data="dataUsers?.items || []"
      />
    </template>
  </UDashboardPanel>
</template>
