<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

// Tab attivo - sincronizzato con la rotta corrente
const activeTab = ref('prenotazioni');

// Sincronizza activeTab con la rotta corrente
watch(
  () => route.path,
  (newPath) => {
    if (newPath.includes('prenotazioni')) {
      activeTab.value = 'prenotazioni';
    } else if (newPath.includes('disdette')) {
      activeTab.value = 'disdette';
    } else if (newPath.includes('referti')) {
      activeTab.value = 'referti';
    }
  },
  { immediate: true }
);

// Sincronizza la rotta quando cambia il tab
watch(activeTab, (newTab) => {
  const routes: Record<string, string> = {
    prenotazioni: '/prenotazioni',
    disdette: '/disdette',
    referti: '/referti'
  };

  if (routes[newTab] && route.path !== routes[newTab]) {
    router.push(routes[newTab]);
  }
});
</script>

<template>
  <div>
    <!-- Toolbar principale con bottoni azione -->
    <q-toolbar class="bg-white text-grey-8 shadow-2">
      <!-- Logo / Titolo -->
      <q-toolbar-title class="text-primary text-weight-bold">
        <div class="row items-center">
          <q-icon name="local_hospital" size="md" class="q-mr-sm" />
          <div style="line-height: 1.1">
            <div class="text-h6" style="margin-bottom: -4px">Studio Medico</div>
            <div class="text-subtitle1">Dottor Morandi</div>
          </div>
        </div>
      </q-toolbar-title>

      <!-- Icone utente/ricerca -->
      <q-btn flat round dense icon="account_circle" size="lg" />
    </q-toolbar>

    <!-- Barra di navigazione secondaria -->
    <q-toolbar class="bg-primary text-white">
      <q-tabs v-model="activeTab" active-color="white" indicator-color="white" class="full-width">
        <q-tab name="prenotazioni" label="Prenotazioni" icon="calendar_month" />
        <q-tab name="disdette" label="Disdette" icon="cancel_schedule_send" />
        <q-tab name="referti" label="Referti" icon="folder_open" />
      </q-tabs>
    </q-toolbar>
  </div>
</template>
