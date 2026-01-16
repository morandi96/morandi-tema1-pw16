<script setup lang="ts">
import { onMounted, ref, toRefs, watch } from 'vue';

const model = ref('');

// eslint-disable-next-line no-undef
const props = withDefaults(
  defineProps<{
    modelDefaultValue?: string;
    type?:
      | 'number'
      | 'text'
      | 'textarea'
      | 'time'
      | 'password'
      | 'email'
      | 'search'
      | 'tel'
      | 'file'
      | 'url'
      | 'date';
    outlined?: boolean;
    borderless?: boolean;
    dense?: boolean;
    clearable?: boolean;
    disable?: boolean;
  }>(),
  {
    modelDefaultValue: '',
    type: 'text',
    outlined: false,
    borderless: false,
    dense: true,
    clearable: false,
    disable: false
  }
);

const { modelDefaultValue } = toRefs(props);

watch(modelDefaultValue, (value): void => {
  model.value = value;
});

onMounted(() => {
  model.value = modelDefaultValue.value;
});
</script>

<template>
  <q-input
    v-model="model"
    :type="type"
    :outlined="outlined"
    :borderless="borderless"
    :dense="dense"
    :clearable="clearable"
    :disable="disable"
    @update:model-value="$emit('model', model)"
  >
    <template #append>
      <slot name="append" />
    </template>
  </q-input>
</template>
