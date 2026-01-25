<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import Table from '@/components/shared/organisms/Table.vue';
import {
  RESERVATION_STATUS_COLORS,
  ReservationStatus,
  type ReservationStatusType
} from '@/constants/common';
import type { QTableProps } from 'quasar';
import { useReservationsList, useUploadDocument } from '@/stores/async/reservation';
import type { Reservation, ReservationDocument } from '@/types/types';

const { t } = useI18n();
const $q = useQuasar();

// Vue Query - Lista prenotazioni (filtriamo quelle completate)
const { reservationsList, isLoading, isError } = useReservationsList();

// Mutation per upload documento
const { mutate: uploadDocument, isPending: isUploading } = useUploadDocument();

// Computed per gestire i dati della tabella (solo prenotazioni completate)
const tableData = computed(() => {
  if (!reservationsList.value) return [];
  return reservationsList.value.filter((r) => r.status === ReservationStatus.COMPLETATA);
});

// Ref per il file input nascosto
const fileInputRef = ref<HTMLInputElement | null>(null);
const currentUploadReservation = ref<{ id: string; type: 'user' | 'doctor' } | null>(null);

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
  },
  {
    name: 'doctorDocument',
    label: 'Ricetta Medico',
    align: 'center',
    field: 'doctorDocument'
  },
  {
    name: 'userDocument',
    label: 'Referto Utente',
    align: 'center',
    field: 'userDocument'
  }
];

// Funzione per ottenere il colore dello stato
const getStatusColor = (status: ReservationStatusType) => {
  return RESERVATION_STATUS_COLORS[status] || 'grey';
};

// Funzione per aprire il file picker
const openFilePicker = (reservationId: string, type: 'user' | 'doctor') => {
  currentUploadReservation.value = { id: reservationId, type };
  fileInputRef.value?.click();
};

// Funzione per verificare se un file è un'immagine
const isImageFile = (fileName: string) => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
  return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
};

// Funzione per ottenere URL blob per anteprima immagini
const getImagePreviewUrl = (doc: ReservationDocument) => {
  try {
    const base64Data = doc.fileBase64.split(',').pop() || doc.fileBase64;
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.codePointAt(i) || 0;
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray]);
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Errore creazione anteprima:', error);
    return null;
  }
};

// Funzione per aprire anteprima immagine in dialog
const previewImage = (doc: ReservationDocument) => {
  const imageUrl = getImagePreviewUrl(doc);
  if (!imageUrl) return;

  $q.dialog({
    title: doc.fileName,
    message: `
      <div class="text-center">
        <img src="${imageUrl}" style="max-width: 100%; max-height: 70vh;" />
      </div>
    `,
    html: true,
    ok: 'Chiudi'
  });
};

// Funzione per gestire la selezione del file
const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file || !currentUploadReservation.value) return;

  // Verifica dimensione file (max 5MB per DynamoDB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    $q.notify({
      type: 'negative',
      message: t('toast.report.file_too_large'),
      position: 'top'
    });
    return;
  }

  // Cattura i valori prima dell'operazione asincrona
  const reservationId = currentUploadReservation.value!.id;
  const documentType = currentUploadReservation.value!.type;

  // Converti in base64
  const reader = new FileReader();
  reader.onload = () => {
    const base64 = reader.result as string;

    const document: ReservationDocument = {
      fileName: file.name,
      fileBase64: base64,
      uploadedAt: new Date().toISOString()
    };

    uploadDocument(
      {
        reservationId,
        document,
        documentType
      },
      {
        onSuccess: () => {
          $q.notify({
            type: 'positive',
            message: t('toast.report.upload.success'),
            position: 'top'
          });
        },
        onError: (error) => {
          console.error("Errore durante l'upload:", error);
          $q.notify({
            type: 'negative',
            message: t('toast.report.upload.error'),
            position: 'top'
          });
        }
      }
    );
  };

  reader.readAsDataURL(file);

  // Reset input
  target.value = '';
  currentUploadReservation.value = null;
};

// Funzione per scaricare un documento
const downloadDocument = (reservation: Reservation, type: 'user' | 'doctor') => {
  const doc = type === 'user' ? reservation.userDocument : reservation.doctorDocument;

  if (!doc) return;

  try {
    // Rimuovi il prefixo data:mime-type;base64, se presente
    const base64Data = doc.fileBase64.split(',').pop() || doc.fileBase64;

    // Converti base64 in blob
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.codePointAt(i) || 0;
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray]);

    // Crea URL temporaneo e avvia il download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = doc.fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    $q.notify({
      type: 'positive',
      message: `Download di ${doc.fileName} completato`,
      position: 'top'
    });
  } catch (error) {
    console.error('Errore durante il download:', error);
    $q.notify({
      type: 'negative',
      message: 'Errore durante il download del documento',
      position: 'top'
    });
  }
};
</script>

<template>
  <div class="q-pa-lg">
    <!-- Header -->
    <div class="q-mb-lg">
      <q-card class="text-center">
        <q-card-section>
          <div class="text-h3 text-info q-mb-md">
            <q-icon name="description" size="xl" />
          </div>
          <div class="text-h4 text-weight-bold q-mb-md">{{ $t('report.title') }}</div>
          <div class="text-subtitle1 text-grey-7">{{ $t('report.subtitle') }}</div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Input file nascosto -->
    <input
      ref="fileInputRef"
      type="file"
      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
      style="display: none"
      @change="handleFileSelect"
    />

    <!-- Tabella Referti -->
    <q-card>
      <q-card-section class="q-pb-none">
        <div class="text-h6 text-weight-bold">{{ $t('report.table_title') }}</div>
      </q-card-section>

      <q-card-section class="pa-0">
        <!-- Loading -->
        <div v-if="isLoading" class="text-center q-pa-xl">
          <q-spinner color="primary" size="40px" />
          <div class="text-subtitle2 text-grey-7 q-mt-md">
            {{ $t('report.loading') }}
          </div>
        </div>

        <!-- Errore -->
        <q-banner v-else-if="isError" class="bg-negative text-white" rounded>
          <template #avatar>
            <q-icon name="error" color="white" />
          </template>
          {{ $t('report.error') }}
        </q-banner>

        <!-- Nessun dato -->
        <div v-else-if="tableData.length === 0" class="text-center q-pa-xl">
          <q-icon name="folder_open" size="64px" color="grey-5" />
          <div class="text-h6 text-grey-7 q-mt-md">{{ $t('report.no_data') }}</div>
        </div>

        <!-- Tabella -->
        <Table
          v-else
          :headers="columns"
          :data="tableData"
          :slot-names="['status', 'doctorDocument', 'userDocument']"
          flat
        >
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

          <!-- Slot per documento medico (ricetta) -->
          <template #doctorDocument="{ rowItem }">
            <q-td :props="rowItem" class="text-center">
              <div v-if="rowItem.row.doctorDocument" class="q-gutter-sm">
                <!-- Anteprima immagine se è un'immagine -->
                <div v-if="isImageFile(rowItem.row.doctorDocument.fileName)" class="q-mb-sm">
                  <q-avatar size="60px" class="cursor-pointer" @click="previewImage(rowItem.row.doctorDocument)">
                    <q-img
                      :src="getImagePreviewUrl(rowItem.row.doctorDocument) || ''"
                      fit="cover"
                    />
                    <div class="absolute-full flex flex-center bg-black bg-opacity-30">
                      <q-icon name="zoom_in" color="white" size="sm" />
                    </div>
                  </q-avatar>
                </div>

                <!-- Pulsante download -->
                <q-btn
                  flat
                  round
                  color="positive"
                  icon="download"
                  size="sm"
                  @click="downloadDocument(rowItem.row, 'doctor')"
                >
                  <q-tooltip>{{ $t('report.download_prescription') }}</q-tooltip>
                </q-btn>

                <!-- Nome file -->
                <div class="text-caption text-grey-6" style="max-width: 100px; word-break: break-all;">
                  {{ rowItem.row.doctorDocument.fileName }}
                </div>
              </div>
              <div v-else>
                <q-btn
                  flat
                  round
                  color="grey"
                  icon="upload_file"
                  size="sm"
                  :loading="isUploading"
                  @click="openFilePicker(rowItem.row.id, 'doctor')"
                >
                  <q-tooltip>{{ $t('report.upload_prescription') }}</q-tooltip>
                </q-btn>
                <div class="text-caption text-grey-5">
                  {{ $t('report.no_document') }}
                </div>
              </div>
            </q-td>
          </template>

          <!-- Slot per documento utente (referto) -->
          <template #userDocument="{ rowItem }">
            <q-td :props="rowItem" class="text-center">
              <div v-if="rowItem.row.userDocument" class="q-gutter-sm">
                <!-- Anteprima immagine se è un'immagine -->
                <div v-if="isImageFile(rowItem.row.userDocument.fileName)" class="q-mb-sm">
                  <q-avatar size="60px" class="cursor-pointer" @click="previewImage(rowItem.row.userDocument)">
                    <q-img
                      :src="getImagePreviewUrl(rowItem.row.userDocument) || ''"
                      fit="cover"
                    />
                    <div class="absolute-full flex flex-center bg-black bg-opacity-30">
                      <q-icon name="zoom_in" color="white" size="sm" />
                    </div>
                  </q-avatar>
                </div>

                <!-- Pulsante download -->
                <q-btn
                  flat
                  round
                  color="positive"
                  icon="download"
                  size="sm"
                  @click="downloadDocument(rowItem.row, 'user')"
                >
                  <q-tooltip>{{ $t('report.download_report') }}</q-tooltip>
                </q-btn>

                <!-- Nome file -->
                <div class="text-caption text-grey-6" style="max-width: 100px; word-break: break-all;">
                  {{ rowItem.row.userDocument.fileName }}
                </div>
              </div>
              <div v-else>
                <q-btn
                  flat
                  round
                  color="primary"
                  icon="upload_file"
                  size="sm"
                  :loading="isUploading"
                  @click="openFilePicker(rowItem.row.id, 'user')"
                >
                  <q-tooltip>{{ $t('report.upload_report') }}</q-tooltip>
                </q-btn>
                <div class="text-caption text-grey-5">
                  {{ $t('report.no_document') }}
                </div>
              </div>
            </q-td>
          </template>
        </Table>
      </q-card-section>
    </q-card>
  </div>
</template>

<style scoped>
/* Stili personalizzati se necessari */
</style>
