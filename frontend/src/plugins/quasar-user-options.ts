import '@quasar/extras/roboto-font/roboto-font.css';
import '@quasar/extras/material-icons/material-icons.css';
import '@quasar/extras/mdi-v5/mdi-v5.css';
import '@quasar/extras/mdi-v6/mdi-v6.css';
import '@quasar/extras/mdi-v7/mdi-v7.css';
import '@quasar/extras/fontawesome-v5/fontawesome-v5.css';
import { Notify, Loading, Dialog } from 'quasar';

// To be used on app.use(Quasar, { ... })
export const quasarConfig = {
  plugins: {
    Notify,
    Loading,
    Dialog
  },
  config: {
    loading: {}
  }
};
