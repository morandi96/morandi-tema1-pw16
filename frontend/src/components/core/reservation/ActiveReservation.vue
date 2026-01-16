<script setup lang="ts">
import { computed } from 'vue';
import type { Reservation } from '@/types/types';
import { RESERVATION_STATUS_COLORS, type ReservationStatusType } from '@/constants/common';

// Props
const props = defineProps<{
  reservation: Reservation;
}>();

// Data selezionata per il calendario
const selectedDate = computed(() => props.reservation.date);

// Funzione per ottenere il colore dello stato
const getStatusColor = (status: ReservationStatusType) => {
  return RESERVATION_STATUS_COLORS[status] || 'grey';
};

// Formatta la data in italiano
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};
</script>

<template>
  <!-- Card Prenotazione Attiva -->
  <q-card class="shadow-3">
    <q-card-section class="bg-grey-2">
      <div class="text-h6 text-weight-bold">
        <q-icon name="event" color="primary" class="q-mr-sm" />
        {{ $t('reservation.activeReservation') }}
        <q-badge
          :color="getStatusColor(reservation.status)"
          :label="reservation.status"
          rounded
          class="q-ml-md text-body2"
        />
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <div class="row q-col-gutter-lg">
        <!-- Colonna Sinistra: Info Prenotazione -->
        <div class="col-12 col-md-6">
          <div>
            <div class="row items-start q-mb-md">
              <div>
                <div class="text-h6 text-weight-bold">
                  {{ formatDate(reservation.date) }} - {{ reservation.time }}
                </div>
                <div class="text-subtitle2 text-grey-7">
                  {{ reservation.doctor }}
                </div>
              </div>
            </div>

            <q-separator class="q-my-md" />

            <div class="q-mb-sm">
              <div class="text-weight-bold text-subtitle1">
                {{ $t('reservation.reason') }}
              </div>
              <div v-if="reservation.category" class="text-grey-7">{{ reservation.category }}</div>
            </div>

            <q-separator v-if="reservation.location" class="q-my-md" />

            <div v-if="reservation.location">
              <div class="text-weight-bold text-subtitle1">
                {{ $t('reservation.address') }}
              </div>
              <q-icon name="location_on" color="grey-7" class="q-mr-sm" />
              <span class="text-grey-8">{{ reservation.location }}</span>
            </div>
          </div>
        </div>

        <!-- Colonna Destra: Calendario -->
        <div class="col-12 col-md-6">
          <div class="text-center calendar-container">
            <q-date
              :model-value="selectedDate"
              readonly
              :events="[selectedDate]"
              event-color="primary"
              minimal
              class="full-width compact-calendar"
            />
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<style scoped>
.calendar-container {
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.compact-calendar :deep(.q-date) {
  margin-bottom: 0;
  padding-bottom: 0;
}

.compact-calendar :deep(.q-date__content) {
  padding-bottom: 0;
}

.compact-calendar :deep(.q-date__view) {
  min-height: auto;
}
</style>
