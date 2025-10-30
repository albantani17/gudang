<script setup lang="ts">
import type { TableColumn } from "#ui/types";
import { usePaginationStore } from "~/stores/pagination.store";

const props = defineProps<{
  columns: TableColumn<any>[];
  data: Record<string, any>[];
}>();

const emit = defineEmits(["update:limit", "update:page", "update:search"]);

const { search, limit, page, reset } = usePaginationStore();

onMounted(() => {
  reset();
});
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="w-full flex justify-between">
      <UInput
        placeholder="Search..."
        leading-icon="i-lucide-search"
        v-model="search"
        @update:model-value="emit('update:search', $event)"
      />
      <slot name="top-actions" />
    </div>
    <UTable :data="props.data" :columns="props.columns" class="flex-1" />
    <div
      class="flex justify-between w-full gap-3 border-t border-default pt-4 mt-auto"
    >
      <USelect
        :items="[10, 20, 30, 40, 50]"
        :model-value="limit"
        @update:model-value="emit('update:limit', $event)"
      />
      <p>Total: {{ props.data.length }} baris</p>
      <UPagination
        :total="props.data.length"
        :limit="limit"
        :page="page"
        @update:page="emit('update:page', $event)"
      />
    </div>
  </div>
</template>
