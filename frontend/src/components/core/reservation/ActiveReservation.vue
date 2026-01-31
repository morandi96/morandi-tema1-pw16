<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Reservation } from '@/types/types';
import { RESERVATION_STATUS_COLORS, type ReservationStatusType } from '@/constants/common';
import { useCancelReservation } from '@/stores/async/reservation';
import { useQuasar } from 'quasar';
import { Quasar } from 'quasar';
import langIt from 'quasar/lang/it';

//Imposta il calendario in italiano
Quasar.lang.set(langIt);

// Props
const props = defineProps<{
  reservation: Reservation;
}>();

const $q = useQuasar();
const { t } = useI18n();

// Mutation per cancellare la prenotazione
const { mutate: cancelReservation, isPending: isCancelling } = useCancelReservation();

const selectedDate = computed(() => {
  // Converte da YYYY-MM-DD (ISO) a YYYY/MM/DD (formato QDate)
  return props.reservation.date.replace(/-/g, '/');
});

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

const handleCancelReservation = () => {
  $q.dialog({
    title: 'Conferma cancellazione',
    message:
      "Sei sicuro di voler cancellare questa prenotazione? L'operazione non può essere annullata.",
    cancel: {
      label: 'Annulla',
      color: 'grey',
      flat: true
    },
    ok: {
      label: 'Cancella prenotazione',
      color: 'negative',
      unelevated: true
    },
    persistent: true
  }).onOk(() => {
    cancelReservation(props.reservation.id, {
      onSuccess: () => {
        $q.notify({
          type: 'positive',
          message: t('toast.reservation.cancel.success'),
          position: 'top'
        });
      },
      onError: (error) => {
        console.error('Errore durante la cancellazione:', error);
        $q.notify({
          type: 'negative',
          message: t('toast.reservation.cancel.error'),
          position: 'top'
        });
      }
    });
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
      <div class="row q-col-gutter-lg items-stretch">
        <!-- Colonna Sinistra: Info Prenotazione -->
        <div class="col-12 col-md-6">
          <div class="column justify-between full-height">
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
                <div v-if="reservation.category" class="text-grey-7">
                  {{ reservation.category }}
                </div>
              </div>
              <q-separator v-if="reservation.location" />
              <div class="q-mt-lg">
                <div class="text-weight-bold text-subtitle1">
                  {{ $t('reservation.address') }}
                </div>
                <q-icon name="location_on" color="grey-7" class="q-mr-sm" />
                <!-- <span class="text-grey-8">{{ reservation.location }}</span> -->
                <span class="text-grey-8">{{
                  'Piazza Giovanni Astengo 22, Settimo Torinese (TO)'
                }}</span>
              </div>
            </div>
            <div>
              <!-- Bottone Cancellazione -->
              <div class="q-mt-lg">
                <q-btn
                  color="negative"
                  outline
                  icon="cancel"
                  label="Cancella prenotazione"
                  @click="handleCancelReservation"
                  :loading="isCancelling"
                  :disable="isCancelling"
                  class="full-width"
                >
                  <template #loading>
                    <q-spinner class="q-mr-sm" />
                    Cancellazione...
                  </template>
                </q-btn>
              </div>
            </div>
          </div>
        </div>

        <!-- Colonna Destra: Calendario -->
        <div class="col-12 col-md-6">
          <div class="calendar-container">
            <q-date
              :model-value="selectedDate"
              readonly
              :events="[selectedDate]"
              event-color="primary"
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
  height: 100%;
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

.full-height {
  height: 100%;
}
</style>
