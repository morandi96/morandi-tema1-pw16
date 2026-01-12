<script setup lang="ts">
import { onMounted } from 'vue';
import { toastMessage } from '@/utils/toastMessage';
import { Notify } from 'quasar';
// eslint-disable-next-line no-duplicate-imports
import type { QNotifyOptions } from 'quasar';

onMounted(() => {
  const { message, color, position, actionHandler } = toastMessage.value;

  Notify.create({
    message,
    color,
    position: position as QNotifyOptions['position'],
    classes: 'toast-message',
    timeout: 5000,
    actions: [{ icon: 'mdi-close-circle-outline', color: 'white', handler: actionHandler }]
  });
});
</script>

<template>
  <div />
</template>

<style scoped>
.toast-message {
  font-size: 16px !important;
}
</style>
