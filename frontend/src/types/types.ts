import type { ReservationStatusType } from '@/constants/common';

// Interfaccia per i documenti (referto/ricetta)
export interface ReservationDocument {
  fileName: string;
  fileBase64: string;
  uploadedAt: string;
}

// Interfaccia per le prenotazioni
export interface Reservation {
  id: string;
  date: string;
  time: string;
  category: string;
  doctor: string;
  status: ReservationStatusType;
  location?: string;
  // Documento caricato dall'utente (referto)
  userDocument?: ReservationDocument;
  // Documento caricato dal medico (ricetta)
  doctorDocument?: ReservationDocument;
}
