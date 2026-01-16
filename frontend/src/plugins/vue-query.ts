import { VueQueryPlugin, type VueQueryPluginOptions } from '@tanstack/vue-query';
import type { App } from 'vue';

const vueQueryOptions: VueQueryPluginOptions = {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 5 * 60 * 1000 // 5 minuti
      }
    }
  }
};

export function setupVueQuery(app: App) {
  app.use(VueQueryPlugin, vueQueryOptions);
}
