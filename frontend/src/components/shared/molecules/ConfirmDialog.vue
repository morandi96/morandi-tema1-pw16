<script setup lang="ts">
import Dialog from '@/components/shared/organisms/Dialog.vue';
import { ref } from 'vue';

defineProps<{
  btnTitle: string;
  btnColor?: string;
  btnOutline?: boolean;
  dialogTitle: string;
  dialogContent: string;
  disabled?: boolean;
}>();
const emit = defineEmits(['action']);

const confirm = () => {
  emit('action');
  isDialogOpen.value = false;
};

const isDialogOpen = ref(false);
</script>
<template>
  <Button
    :outline="btnOutline"
    :text-color="btnColor"
    :label="btnTitle"
    :disabled="disabled"
    @click="isDialogOpen = true"
  />
  <Dialog
    :model="isDialogOpen"
    :slot-names="['content', 'action']"
    card-action-class="justify-end"
    card-content-class="p-3"
    card-class="p-2"
    @close-dialog="isDialogOpen = false"
  >
    <template #content>
      <div class="column gap-5 p-3 pt-4">
        <div class="text-h5 font-medium">{{ dialogTitle }}</div>
        <div class="text-body1">{{ dialogContent }}</div>
      </div>
    </template>
    <template #action>
      <Button
        outline
        text-color="black"
        :label="$t('layout.cancel')"
        @click="isDialogOpen = false"
      />
      <Button :label="$t('layout.confirm')" @click="confirm" />
    </template>
  </Dialog>
</template>
