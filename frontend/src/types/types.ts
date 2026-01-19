import type { ReservationStatusType } from '@/constants/common';

// Interfaccia per le prenotazioni
export interface Reservation {
  id: string;
  date: string;
  time: string;
  category: string;
  doctor: string;
  status: ReservationStatusType;
  location?: string;
}
