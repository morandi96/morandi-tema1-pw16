<script setup lang="ts">
import router, { type BreadcrumbType } from '@/router';
import { watchEffect } from 'vue';
import { ref } from 'vue';
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';

defineProps<{ customName?: string }>();

const breadcrumbs = ref<BreadcrumbType[]>([]);
const route = useRoute();

const changeToRoute = (path?: string) => {
  let newPath = path;
  if (newPath) {
    const params = { ...route.params };
    Object.keys(params).forEach((paramKey) => {
      if (newPath?.includes(paramKey)) {
        newPath = newPath.replace(`:${paramKey}`, params[paramKey] as string);
      }
    });
  }
  return newPath;
};

watchEffect(() => {
  if (breadcrumbs.value.length) {
    breadcrumbs.value = breadcrumbs.value.map((bread: BreadcrumbType) => ({
      ...bread,
      to: changeToRoute(bread.to)
    }));
  }
});

onMounted(async () => {
  breadcrumbs.value = (router.currentRoute.value.meta?.breadcrumb as BreadcrumbType[]) || [];
});
</script>

<template>
  <q-breadcrumbs>
    <q-breadcrumbs-el
      v-for="(bcrumb, key) in breadcrumbs"
      :key="key"
      class="font-medium text-xl"
      active-class="text-neutral-400 text-sm font-normal"
      :label="bcrumb.name ?? customName"
      :to="bcrumb.to"
    />
  </q-breadcrumbs>
</template>
