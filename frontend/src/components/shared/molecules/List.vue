<script setup lang="ts">
export type ListItemType = {
  name: string;
  path?: string;
};

defineProps<{
  items: ListItemType[];
  clickable?: boolean;
}>();
</script>

<template>
  <q-list>
    <q-item
      v-for="item in items"
      :key="item.name"
      header
      class="items-center"
      :clickable="clickable"
      :to="item.path ?? item.path"
    >
      {{ $t(item.name) }}
    </q-item>
  </q-list>
</template>
