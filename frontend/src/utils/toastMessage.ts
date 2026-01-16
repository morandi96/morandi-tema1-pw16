import { nextTick, ref } from 'vue';

const renderToastMessage = ref(false);
const toastMessage = ref({
  message: '',
  color: '',
  timeout: 9000000000,
  position: 'top-right',
  actionHandler: () => null
});

const showSuccessToastMessage = (message: string) => {
  toastMessage.value = {
    message,
    color: 'green-9',
    timeout: 9000000000,
    position: 'top-right',
    actionHandler: () => null
  };

  renderToastMessage.value = false;

  nextTick(() => {
    renderToastMessage.value = true;
  });
};

const showErrorToastMessage = (message: string) => {
  toastMessage.value = {
    message,
    color: 'red-8',
    timeout: 9000000000,
    position: 'top-right',
    actionHandler: () => null
  };

  renderToastMessage.value = false;

  nextTick(() => {
    renderToastMessage.value = true;
  });
};

export { renderToastMessage, toastMessage, showSuccessToastMessage, showErrorToastMessage };
