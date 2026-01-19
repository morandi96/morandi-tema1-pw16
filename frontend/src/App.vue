<script setup lang="ts">
import { RouterView } from 'vue-router';
import TopBar from '../src/components/layout/TopBar.vue';
import { useAuth } from './composables/useAuth';

const { user } = useAuth();
</script>

<template>
  <q-layout view="hHh Lpr lff" style="height: 100vh">
    <TopBar v-if="user" />
    <q-page-container :class="`q-pa-sm q-pt-lg app-container`">
      <div class="column gap-8 flex-nowrap">
        <router-view />
      </div>
    </q-page-container>
  </q-layout>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
