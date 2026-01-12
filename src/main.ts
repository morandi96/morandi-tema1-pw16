import { createApp } from 'vue';
import './assets/main.css';
import App from './App.vue';

import { Quasar } from 'quasar';
import { quasarConfig } from './plugins/quasar-user-options';
import 'quasar/src/css/index.sass';

import '@/styles/tailwind.sass';

import i18n from './plugins/i18n';
import { setupVueQuery } from './plugins/vue-query';
import { amplifyConfiguration } from './plugins/amplifyConfig';
import { Amplify } from 'aws-amplify';

import router from './router';

Amplify.configure(amplifyConfiguration);

import Button from '@/components/shared/atoms/Button.vue';
import Icon from '@/components/shared/atoms/Icon.vue';
import LoadingSpinner from '@/components/shared/atoms/LoadingSpinner.vue';
import TextField from '@/components/shared/atoms/TextField.vue';
import ToastMessage from '@/components/shared/atoms/ToastMessage.vue';
import Card from '@/components/shared/molecules/Card.vue';
import HorizontalCard from '@/components/shared/molecules/HorizontalCard.vue';
import Dialog from '@/components/shared/organisms/Dialog.vue';
import Table from '@/components/shared/organisms/Table.vue';

const app = createApp(App);

// Setup Vue Query
setupVueQuery(app);

app
  .use(router)
  .use(Quasar, quasarConfig)
  .use(i18n)
  .component('Button', Button)
  .component('Icon', Icon)
  .component('LoadingSpinner', LoadingSpinner)
  .component('TextField', TextField)
  .component('ToastMessage', ToastMessage)
  .component('Card', Card)
  .component('HorizontalCard', HorizontalCard)
  .component('Dialog', Dialog)
  .component('Table', Table);

app.mount('#app');
