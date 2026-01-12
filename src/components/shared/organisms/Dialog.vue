<script setup lang="ts">
import { ref, toRefs, watch } from 'vue';

// eslint-disable-next-line no-undef
const props = withDefaults(
  defineProps<{
    dialogClass?: string;
    cardClass?: string;
    cardTitleClass?: string;
    cardContentClass?: string;
    cardActionClass?: string;
    cardMinWidth?: string;
    cardMinHeight?: string;
    position?: 'standard' | 'top' | 'right' | 'bottom' | 'left';
    model: boolean;
    persistent?: boolean;
    slotNames?: Array<string>;
  }>(),
  {
    dialogClass: 'z-40',
    cardClass: '',
    cardMinWidth: '500px',
    cardMinHeight: '',
    cardTitleClass: '',
    cardContentClass: '',
    cardActionClass: '',
    persistent: false,
    position: 'standard',
    slotNames: () => ['title', 'content', 'action']
  }
);

const dialogModel = ref(false);

const { model } = toRefs(props);

watch(model, (value): void => {
  dialogModel.value = value;
});
</script>

<template>
  <!-- :position="position" -->
  <q-dialog
    v-model="dialogModel"
    :class="dialogClass"
    :persistent="persistent"
    :position="position"
    @hide="$emit('close-dialog')"
  >
    <Card
      :style="`min-width: ${cardMinWidth}; min-height: ${cardMinHeight}`"
      :class="cardClass"
      :card-title-class="cardTitleClass"
      :card-content-class="cardContentClass"
      :card-action-class="cardActionClass"
      :slot-names="slotNames"
    >
      <template v-if="slotNames.includes('title')" #title>
        <slot name="title" />
      </template>
      <template v-if="slotNames.includes('content')" #content>
        <slot name="content" />
      </template>
      <template v-if="slotNames.includes('action')" #action>
        <slot name="action" />
      </template>
    </Card>
  </q-dialog>
</template>
