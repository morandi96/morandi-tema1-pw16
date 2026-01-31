import { createI18n } from 'vue-i18n';
import it from '../locales/it.json';
import en from '../locales/en.json';

const i18n = createI18n({
  fallbackWarn: false,
  missingWarn: false,
  allowComposition: true,
  legacy: false,
  locale: 'it',
  fallbackLocale: 'it',
  messages: { it, en }
});

export default i18n;

export const t = i18n.global.t;
