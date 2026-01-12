<script setup lang="ts">
// eslint-disable-next-line no-undef
withDefaults(
  defineProps<{
    cardTitleClass?: string;
    cardContentClass?: string;
    cardActionClass?: string;
    slotNames?: Array<string>;
  }>(),
  {
    cardTitleClass: 'p-2 bg-gray-100 font-medium',
    cardContentClass: 'full-width p-5',
    cardActionClass: '',
    slotNames: () => ['title', 'content']
  }
);
</script>

<template>
  <q-card>
    <q-card-section v-if="slotNames.includes('title')" :class="cardTitleClass">
      <slot name="title" />
    </q-card-section>
    <div v-if="slotNames.includes('content')" :class="cardContentClass">
      <slot name="content" />
    </div>
    <q-card-actions v-if="slotNames.includes('action')" :class="cardActionClass">
      <slot name="action" />
    </q-card-actions>
  </q-card>
</template>
