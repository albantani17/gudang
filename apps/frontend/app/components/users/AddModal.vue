<script setup lang="ts">
import { useUsersForm } from "~/composables/users/useUsersForm";

const props = defineProps<{
  refresh?: () => void;
}>();

const open = ref(false);

const {
  schema,
  stateForm,
  create,
  loading,
  searchRole,
  loadingRoles,
  rolesItem,
} = useUsersForm({ onSuccess: () => props.refresh?.() });

const onSubmit = () => {
  create();
  open.value = false;
};
</script>
<template>
  <UModal v-model:open="open" modal overlay title="Tambah User">
    <UButton label="Tambah User" />

    <template #body>
      <UForm
        class="space-y-4"
        :schema="schema"
        :state="stateForm"
        @submit="onSubmit"
      >
        <UFormField name="name" label="Nama" required>
          <UInput v-model="stateForm.name" class="w-full" />
        </UFormField>

        <UFormField name="email" label="Email" required>
          <UInput v-model="stateForm.email" class="w-full" />
        </UFormField>

        <UFormField name="username" label="Username" required>
          <UInput v-model="stateForm.username" class="w-full" />
        </UFormField>

        <UFormField name="roleId" label="Role" required>
          <UInputMenu
            v-model="stateForm.roleId"
            :items="rolesItem"
            :loading="loadingRoles"
            v-model:search-term="searchRole"
            class="w-full"
          />
        </UFormField>

        <UFormField name="password" label="Password" required>
          <UInput v-model="stateForm.password" type="password" class="w-full" />
        </UFormField>
        <div class="flex justfiy-end gap-3">
          <UButton
            label="Batal"
            color="neutral"
            variant="subtle"
            :disabled="loading"
            @click="open = false"
          />
          <UButton
            label="Tambah User"
            color="primary"
            :loading="loading"
            :disabled="loading"
            type="submit"
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
