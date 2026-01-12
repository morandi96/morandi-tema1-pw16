<script setup lang="ts">
import { QBtn, type QTooltipProps } from 'quasar';
import { ref } from 'vue';

// eslint-disable-next-line no-undef
withDefaults(
  defineProps<{
    buttonClass?: string;
    label?: string;
    tooltip?: string;
    color?: string;
    textColor?: string;
    size?: string;
    icon?: string | undefined;
    outline?: boolean;
    round?: boolean;
    rounded?: boolean;
    unelevated?: boolean;
    noCaps?: boolean;
    loading?: boolean;
    disable?: boolean;
    tooltipColor?: string;
    tooltipAnchor?: QTooltipProps['anchor'];
    tooltipSelf?: QTooltipProps['self'];
    tooltipOffset?: QTooltipProps['offset'];
    slotNames?: Array<string>;
  }>(),
  {
    buttonClass: 'border border-black text-weight-regular',
    label: '',
    tooltip: '',
    tooltipColor: 'primary',
    tooltipAnchor: 'center right',
    tooltipSelf: 'center left',
    tooltipOffset: () => [10, 10],
    color: 'primary',
    textColor: 'white',
    size: 'md',
    icon: undefined,
    outline: false,
    round: false,
    rounded: false,
    unelevated: false,
    noCaps: false,
    loading: false,
    disable: false,
    slotNames: () => ['']
  }
);

const showTooltip = ref(false);
</script>

<template>
  <q-btn
    :class="buttonClass"
    :loading="loading"
    :icon="icon"
    :color="color"
    :text-color="textColor"
    :label="label"
    :outline="outline"
    :round="round"
    :rounded="rounded"
    :unelevated="unelevated"
    :no-caps="noCaps"
    :disable="disable"
    :size="size"
    :aria-label="label || 'Generic Button'"
    @click="'click'"
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
    <slot v-if="slotNames.includes('icon')" name="icon" />
  </q-btn>
</template>
