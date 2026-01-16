<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Dialog from '@/components/shared/organisms/Dialog.vue';
import { useCreateReservation } from '@/stores/async/reservation';
import { ReservationStatus } from '@/constants/common';
import type { Reservation } from '@/types/types';

// eslint-disable-next-line no-undef
const props = withDefaults(
  defineProps<{
    model: boolean;
    availableDates?: string[];
    blockedDates?: string[];
    doctors?: string[];
  }>(),
  {
    availableDates: () => [],
    blockedDates: () => [
      // Esempio date bloccate (weekend e alcune date specifiche)
      '2026/01/18', // Sabato
      '2026/01/19', // Domenica
      '2026/01/25', // Sabato
      '2026/01/26', // Domenica
      '2026/01/22', // Mercoledì - Medico in ferie
      '2026/01/23', // Giovedì - Studio chiuso
      '2026/02/01', // Sabato
      '2026/02/02' // Domenica
    ],
    doctors: () => [
      'Dr. Mario Rossi',
      'Dr. Anna Verdi',
      'Dr. Luigi Bianchi',
      'Dr. Sara Neri',
      'Dr. Paolo Ferrari'
    ]
  }
);

// eslint-disable-next-line no-undef
const emit = defineEmits<{
  'update:model': [value: boolean];
}>();

const { t } = useI18n();

// Form data
const formData = ref({
  doctor: '',
  category: '',
  date: '',
  time: ''
});

// State per il datepicker
const showDatePicker = ref(false);

// Funzione per verificare se una data è bloccata (formato YYYY/MM/DD per QDate)
const isDateBlocked = (date: string): boolean => {
  // date è nel formato 'YYYY/MM/DD' dal QDate
  const dateString = date.replace(/\//g, '-'); // Converti in YYYY-MM-DD

  // Verifica se la data è nei blocked dates
  if (props.blockedDates.includes(date)) {
    return true;
  }

  // Se sono definite availableDates, controlla che la data sia disponibile
  if (props.availableDates.length > 0) {
    return !props.availableDates.includes(dateString);
  }

  // Altrimenti blocca solo i weekend (se non specificato diversamente)
  const dateObj = new Date(dateString);
  const dayOfWeek = dateObj.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // Domenica = 0, Sabato = 6
};

// Funzione per convertire da formato QDate (YYYY/MM/DD) a ISO string (YYYY-MM-DD)
const convertQDateToISO = (qDateString: string): string => {
  if (!qDateString) return '';
  return qDateString.replace(/\//g, '-');
};

// Funzione per convertire da ISO (YYYY-MM-DD) a formato QDate (YYYY/MM/DD)
const convertISOToQDate = (isoString: string): string => {
  if (!isoString) return '';
  return isoString.replace(/-/g, '/');
};

// Computed per la data formattata per il display
const selectedDateFormatted = computed(() => {
  if (!formData.value.date) return '';
  const date = new Date(formData.value.date);
  return date.toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
});

// Gestione selezione data dal datepicker
const handleDateSelection = (date: string) => {
  formData.value.date = convertQDateToISO(date);
  showDatePicker.value = false;
};

// Computed per il valore del QDate
const qDateValue = computed({
  get: () => convertISOToQDate(formData.value.date),
  set: (value: string) => {
    formData.value.date = convertQDateToISO(value);
  }
});

// Orari disponibili
const availableTimes = [
  '08:00',
  '08:30',
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00'
];

// Computed per le categorie traducibili
const RESERVATION_CATEGORIES = computed(() => [
  { value: 'general_checkup', label: t('reservation.categories.general_checkup') },
  { value: 'bone_problems', label: t('reservation.categories.bone_problems') },
  { value: 'respiratory_problems', label: t('reservation.categories.respiratory_problems') },
  { value: 'cardiology_checkup', label: t('reservation.categories.cardiology_checkup') },
  { value: 'dermatology_problems', label: t('reservation.categories.dermatology_problems') },
  { value: 'ophthalmology_checkup', label: t('reservation.categories.ophthalmology_checkup') },
  { value: 'gynecology_checkup', label: t('reservation.categories.gynecology_checkup') },
  {
    value: 'gastrointestinal_problems',
    label: t('reservation.categories.gastrointestinal_problems')
  }
]);

// Validazione form
const isFormValid = computed(() => {
  return (
    formData.value.doctor && formData.value.category && formData.value.date && formData.value.time
  );
});

// Mutation per creare prenotazione
const { mutate: createReservation, isPending: isSubmitting } = useCreateReservation();

const handleCloseDialog = () => {
  // Reset form quando si chiude
  formData.value = {
    doctor: '',
    category: '',
    date: '',
    time: ''
  };
  emit('update:model', false);
};

const handleSubmit = () => {
  if (!isFormValid.value) return;

  // Trova la label della categoria selezionata per salvarla nella prenotazione
  const selectedCategory = RESERVATION_CATEGORIES.value.find(
    (cat) => cat.value === formData.value.category
  );
  const categoryLabel = selectedCategory ? selectedCategory.label : formData.value.category;

  const newReservation: Omit<Reservation, 'id'> = {
    date: formData.value.date,
    time: formData.value.time,
    category: categoryLabel, // Salviamo la label tradotta invece del valore
    doctor: formData.value.doctor,
    status: ReservationStatus.IN_ATTESA
  };

  createReservation(newReservation, {
    onSuccess: () => {
      // TODO: Aggiungere notifica toast di successo
      console.log(t('reservation.new_reservation.success'));
      handleCloseDialog();
    },
    onError: (error) => {
      // TODO: Aggiungere notifica toast di errore
      console.error(t('reservation.new_reservation.error'), error);
    }
  });
};
</script>
<template>
  <Dialog
    :model="props.model"
    @close-dialog="handleCloseDialog"
    card-min-width="1000px"
    card-min-height="auto"
  >
    <template #title>
      <div class="row items-center q-gutter-md">
        <q-icon name="event_note" size="md" color="primary" />
        <div class="text-h5 text-weight-medium">{{ t('reservation.new_reservation.title') }}</div>
      </div>
    </template>

    <template #content>
      <q-form @submit="handleSubmit" class="q-pa-md">
        <div class="row q-col-gutter-lg">
          <!-- Prima riga: Medico e Categoria -->
          <div class="col-12 col-md-6">
            <q-select
              v-model="formData.doctor"
              :options="props.doctors"
              :label="t('reservation.new_reservation.doctor_label')"
              filled
              emit-value
              map-options
              :rules="[(val) => !!val || t('reservation.new_reservation.doctor_required')]"
              lazy-rules
            >
              <template #prepend>
                <q-icon name="person" />
              </template>
              <template #no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    {{ t('reservation.new_reservation.doctor_empty') }}
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <div class="col-12 col-md-6">
            <q-select
              v-model="formData.category"
              :options="RESERVATION_CATEGORIES"
              option-value="value"
              option-label="label"
              :label="t('reservation.new_reservation.category_label')"
              filled
              emit-value
              map-options
              :rules="[(val) => !!val || t('reservation.new_reservation.category_required')]"
              lazy-rules
            >
              <template #prepend>
                <q-icon name="medical_services" />
              </template>
              <template #no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    {{ t('reservation.new_reservation.category_empty') }}
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <!-- Seconda riga: Data e Ora -->
          <div class="col-12 col-md-6">
            <q-input
              :model-value="selectedDateFormatted"
              :label="t('reservation.new_reservation.available_dates_label')"
              filled
              readonly
              :rules="[() => !!formData.date || t('reservation.new_reservation.date_required')]"
              lazy-rules
              @click="showDatePicker = true"
              class="cursor-pointer"
              :placeholder="formData.date ? '' : 'Clicca per selezionare una data'"
            >
              <template #prepend>
                <q-icon name="calendar_today" />
              </template>
              <template #append>
                <q-icon name="arrow_drop_down" />
              </template>

              <!-- QDate Popup -->
              <q-popup-proxy
                v-model="showDatePicker"
                transition-show="scale"
                transition-hide="scale"
              >
                <q-card class="q-pa-none">
                  <q-card-section class="q-pa-none">
                    <q-date
                      v-model="qDateValue"
                      mask="YYYY/MM/DD"
                      :locale="{
                        days: ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'],
                        months: [
                          'Gen',
                          'Feb',
                          'Mar',
                          'Apr',
                          'Mag',
                          'Giu',
                          'Lug',
                          'Ago',
                          'Set',
                          'Ott',
                          'Nov',
                          'Dic'
                        ]
                      }"
                      :options="(date) => !isDateBlocked(date)"
                      today-btn
                      @update:model-value="handleDateSelection"
                      color="primary"
                      class="shadow-4 q-pa-0"
                    >
                      <div class="row items-center justify-between">
                        <div class="text-caption text-grey-6">
                          <q-icon name="info" size="16px" class="q-mr-xs" />
                          Le date in grigio non sono disponibili
                        </div>
                        <q-btn
                          label="Chiudi"
                          flat
                          size="sm"
                          @click="showDatePicker = false"
                          color="primary"
                        />
                      </div>
                    </q-date>
                  </q-card-section>
                </q-card>
              </q-popup-proxy>
            </q-input>
          </div>

          <div class="col-12 col-md-6">
            <q-select
              v-model="formData.time"
              :options="availableTimes"
              :label="t('reservation.new_reservation.time_label')"
              filled
              emit-value
              map-options
              :rules="[(val) => !!val || t('reservation.new_reservation.time_required')]"
              lazy-rules
            >
              <template #prepend>
                <q-icon name="access_time" />
              </template>
              <template #no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    {{ t('reservation.new_reservation.time_empty') }}
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
        </div>

        <!-- Riepilogo prenotazione -->
        <div v-if="isFormValid" class="q-mt-lg">
          <q-separator class="q-mb-md" />
          <div class="text-subtitle1 text-weight-medium q-mb-md">
            <q-icon name="info" class="q-mr-sm" color="info" />
            {{ t('reservation.new_reservation.summary_title') }}
          </div>
          <q-card class="bg-blue-1 q-pa-md">
            <div class="text-body2">
              <div class="q-mb-xs">
                <span class="text-weight-medium">{{
                  t('reservation.new_reservation.summary_doctor')
                }}</span>
                {{ formData.doctor }}
              </div>
              <div class="q-mb-xs">
                <span class="text-weight-medium">{{
                  t('reservation.new_reservation.summary_category')
                }}</span>
                {{
                  RESERVATION_CATEGORIES.find((cat) => cat.value === formData.category)?.label ||
                  formData.category
                }}
              </div>
              <div class="q-mb-xs">
                <span class="text-weight-medium">{{
                  t('reservation.new_reservation.summary_date')
                }}</span>
                {{ selectedDateFormatted }}
              </div>
              <div>
                <span class="text-weight-medium">{{
                  t('reservation.new_reservation.summary_time')
                }}</span>
                {{ formData.time }}
              </div>
            </div>
          </q-card>
        </div>
      </q-form>
    </template>

    <template #action>
      <div class="row q-gutter-sm full-width">
        <q-btn
          flat
          :label="t('reservation.new_reservation.cancel_button')"
          @click="handleCloseDialog"
          :disable="isSubmitting"
          class="col"
        />
        <q-btn
          color="primary"
          :label="t('reservation.new_reservation.confirm_button')"
          @click="handleSubmit"
          :loading="isSubmitting"
          :disable="!isFormValid"
          class="col"
          unelevated
        >
          <template #loading>
            <q-spinner class="q-mr-sm" />
            {{ t('reservation.new_reservation.submitting') }}
          </template>
        </q-btn>
      </div>
    </template>
  </Dialog>
</template>
