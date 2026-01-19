<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import Dialog from '@/components/shared/organisms/Dialog.vue';
import { useCreateReservation } from '@/stores/async/reservation';
import { AVAILABLE_TIMES, DOCTORS, ReservationStatus } from '@/constants/common';
import type { Reservation } from '@/types/types';
import { generateRandomBlockedDates } from '@/utils/common';

// Props
const props = withDefaults(
  defineProps<{
    model: boolean;
  }>(),
  {}
);

// Emits
const emit = defineEmits<{
  'update:model': [value: boolean];
}>();

const { t } = useI18n();
const $q = useQuasar();

const formData = ref({
  doctor: '',
  category: '',
  date: '',
  time: ''
});

const showDatePicker = ref(false);
const blockedDates = ref<string[]>([]);

// Verifica se una data è bloccata (weekend o nelle date bloccate)
const isDateBlocked = (date: string): boolean => {
  if (blockedDates.value.includes(date)) {
    return true;
  }

  // Verifica se è weekend
  const dateObj = new Date(date.replace(/\//g, '-'));
  const dayOfWeek = dateObj.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
};

// Computed per la data formattata in italiano
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

const handleDateSelection = (date: string) => {
  // Converti da YYYY/MM/DD a YYYY-MM-DD
  formData.value.date = date.replace(/\//g, '-');
  showDatePicker.value = false;
};

const handleCloseDialog = () => {
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

  const selectedCategory = RESERVATION_CATEGORIES.value.find(
    (cat) => cat.value === formData.value.category
  );
  const categoryLabel = selectedCategory ? selectedCategory.label : formData.value.category;

  const newReservation: Omit<Reservation, 'id'> = {
    date: formData.value.date,
    time: formData.value.time,
    category: categoryLabel,
    doctor: formData.value.doctor,
    status: ReservationStatus.IN_ATTESA
  };

  createReservation(newReservation, {
    onSuccess: () => {
      $q.notify({
        type: 'positive',
        message: t('toast.reservation.create.success'),
        position: 'top'
      });
      handleCloseDialog();
    },
    onError: (error) => {
      console.error('Errore durante la creazione:', error);
      $q.notify({
        type: 'negative',
        message: t('toast.reservation.create.error'),
        position: 'top'
      });
    }
  });
};

// Inizializza le date bloccate al mount
onMounted(() => {
  blockedDates.value = generateRandomBlockedDates(4);
});
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
              :options="DOCTORS"
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
              placeholder="Clicca per selezionare una data"
            >
              <template #prepend>
                <q-icon name="calendar_today" />
              </template>
              <template #append>
                <q-icon name="arrow_drop_down" />
              </template>

              <q-popup-proxy
                v-model="showDatePicker"
                transition-show="scale"
                transition-hide="scale"
              >
                <q-card>
                  <q-date
                    :model-value="formData.date.replace(/-/g, '/')"
                    @update:model-value="handleDateSelection"
                    mask="YYYY/MM/DD"
                    :locale="{
                      days: ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'],
                      daysShort: ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'],
                      months: [
                        'Gennaio',
                        'Febbraio',
                        'Marzo',
                        'Aprile',
                        'Maggio',
                        'Giugno',
                        'Luglio',
                        'Agosto',
                        'Settembre',
                        'Ottobre',
                        'Novembre',
                        'Dicembre'
                      ],
                      monthsShort: [
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
                    color="primary"
                    class="shadow-4"
                  >
                    <div class="row items-center justify-between q-pa-sm">
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
                </q-card>
              </q-popup-proxy>
            </q-input>
          </div>

          <div class="col-12 col-md-6">
            <q-select
              v-model="formData.time"
              :options="AVAILABLE_TIMES"
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
