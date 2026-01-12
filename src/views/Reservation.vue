<script setup lang="ts">
import { computed } from 'vue';
import Table from '@/components/shared/organisms/Table.vue';
import ActiveReservation from '@/components/core/reservation/ActiveReservation.vue';
import { RESERVATION_STATUS_COLORS, type ReservationStatusType } from '@/constants/common';
import type { QTableProps } from 'quasar';
import { useActiveReservation, useReservationsList } from '@/stores/async/reservation';

// Vue Query - Prenotazione attiva
const {
  activeReservation,
  isLoading: isLoadingActive,
  isError: isErrorActive
} = useActiveReservation();

// Vue Query - Storico prenotazioni
const {
  reservationsList: pastReservations,
  isLoading: isLoadingList,
  isError: isErrorList
} = useReservationsList();

// Computed per gestire i dati della tabella
const tableData = computed(() => pastReservations.value || []);

// Definizione colonne tabella
const columns: QTableProps['columns'] = [
  {
    name: 'date',
    required: true,
    label: 'Data',
    align: 'left',
    field: 'date',
    sortable: true,
    format: (val: string) => new Date(val).toLocaleDateString('it-IT')
  },
  {
    name: 'time',
    label: 'Ora',
    align: 'left',
    field: 'time',
    sortable: true
  },
  {
    name: 'category',
    label: 'Categoria',
    align: 'left',
    field: 'category',
    sortable: true
  },
  {
    name: 'doctor',
    label: 'Medico',
    align: 'left',
    field: 'doctor',
    sortable: true
  },
  {
    name: 'status',
    label: 'Stato',
    align: 'center',
    field: 'status',
    sortable: true
  }
];

// Funzione per ottenere il colore dello stato
const getStatusColor = (status: ReservationStatusType) => {
  return RESERVATION_STATUS_COLORS[status] || 'grey';
};

// Funzioni azioni
const newReservation = () => {
  console.log('Nuova prenotazione');
  // TODO: Implementare form nuova prenotazione
};
</script>

<template>
  <div class="q-pa-lg">
    <!-- Loading Prenotazione Attiva -->
    <div v-if="isLoadingActive" class="q-mb-xl">
      <q-card class="shadow-3">
        <q-card-section class="text-center q-pa-xl">
          <q-spinner color="primary" size="50px" />
          <div class="text-subtitle2 text-grey-7 q-mt-md">Caricamento prenotazione attiva...</div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Errore Prenotazione Attiva -->
    <div v-else-if="isErrorActive" class="q-mb-xl">
      <q-banner class="bg-negative text-white" rounded>
        <template #avatar>
          <q-icon name="error" color="white" />
        </template>
        Errore nel caricamento della prenotazione attiva
      </q-banner>
    </div>

    <!-- Sezione Prenotazione Attiva -->
    <div v-else-if="activeReservation" class="q-mb-xl">
      <ActiveReservation :reservation="activeReservation" />
    </div>

    <!-- Messaggio se non ci sono prenotazioni attive -->
    <div v-else class="text-center q-pa-xl q-mb-xl">
      <q-card class="shadow-1">
        <q-card-section>
          <q-icon name="event_available" size="64px" color="grey-5" />
          <div class="text-h6 text-grey-7 q-mt-md">Non ci sono appuntamenti prenotati</div>
          <q-btn
            unelevated
            color="primary"
            label="Prenota"
            icon="add"
            class="q-mt-md"
            @click="newReservation"
          />
        </q-card-section>
      </q-card>
    </div>

    <!-- Sezione Storico -->
    <div>
      <div class="text-h5 text-weight-bold q-mb-md">Appuntamenti passati</div>

      <q-card>
        <q-card-section>
          <div class="text-h6 text-weight-bold q-mb-md">
            <q-icon name="event" color="primary" class="q-mr-sm" />
            {{ $t('reservation.activeReservation') }}
          </div>

          <!-- Loading Lista -->
          <div v-if="isLoadingList" class="text-center q-pa-xl">
            <q-spinner color="primary" size="40px" />
            <div class="text-subtitle2 text-grey-7 q-mt-md">Caricamento storico...</div>
          </div>

          <!-- Errore Lista -->
          <q-banner v-else-if="isErrorList" class="bg-negative text-white" rounded>
            <template #avatar>
              <q-icon name="error" color="white" />
            </template>
            Errore nel caricamento dello storico prenotazioni
          </q-banner>

          <!-- Tabella -->
          <Table v-else :headers="columns" :data="tableData" :slot-names="['status']">
            <!-- Slot per lo stato con badge colorato -->
            <template #status="{ rowItem }">
              <q-td :props="rowItem" class="text-center">
                <q-badge
                  :color="getStatusColor(rowItem.row.status)"
                  :label="rowItem.row.status"
                  rounded
                />
              </q-td>
            </template>
          </Table>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<style scoped>
/* Stili personalizzati se necessari */
</style>
