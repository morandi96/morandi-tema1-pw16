<script setup lang="ts">
// eslint-disable-next-line no-undef
withDefaults(defineProps<{
  cardClass?: string
  cardTitleClass?: string
  cardContentClass?: string,
  cardTitleWidth?: string,
 }>(), {
  cardClass: '',
  cardTitleClass: '',
  cardContentClass: '',
  cardTitleWidth: '120px'
});
</script>

<template>
  <q-card-section
    horizontal
  >
    <q-card-section
      class="bg-grey-8 text-white text-center items-center"
      :style="`width: ${cardTitleWidth}; display: grid;`"
      :class="cardTitleClass"
    >
      <slot name="title" />
    </q-card-section>
    <q-separator vertical />
    <q-card-section
      class="row items-center full-width"
    >
      <slot name="content" />
    </q-card-section>
  </q-card-section>
</template>