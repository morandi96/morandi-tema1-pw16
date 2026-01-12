<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { QTooltipProps } from 'quasar';

// eslint-disable-next-line no-undef
withDefaults(defineProps<{
  name?: string
  color?: string
  size?: string
  tooltip?: string,
  tooltipColor?: string
  tooltipAnchor?: QTooltipProps['anchor']
  tooltipSelf?: QTooltipProps['self']
  tooltipOffset?: QTooltipProps['offset']
}>(), {
  name: 'edit',
  color: 'primary',
  size: 'md',
  tooltip: '',
  tooltipColor: 'primary',
  tooltipAnchor: 'center right',
  tooltipSelf: 'center left',
  tooltipOffset: () => [10, 10]
});

const showTooltip = ref(false);

onMounted(() => {
  setTimeout(() => {
    showTooltip.value = false;
  }, 4000);
});
</script>

<template>
  <q-icon
    :name="name"
    :color="color"
    :size="size"
    @click="('click')"
  >
    <q-tooltip
      v-if="tooltip !== ''"
      v-model="showTooltip"
      :anchor="tooltipAnchor"
      :self="tooltipSelf"
      :offset="tooltipOffset"
      :class="`bg-${tooltipColor}`"
    >
      <span class="text-caption text-weight-bold">{{ tooltip }}</span>
    </q-tooltip>
  </q-icon>
</template>