export const NODE_ENV: string = (import.meta.env.NODE_ENV || 'svil').toUpperCase();

export const ALERT: Record<string, string> = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  SUCCESS: 'success'
};

export const CALLER_COUNT: Record<string, string> = {
  MAX_VALUE: '2'
};

// Enum per gli stati delle prenotazioni
export const ReservationStatus = {
  IN_ATTESA: 'In attesa di conferma',
  CONFERMATA: 'Confermata',
  COMPLETATA: 'Completata',
  ANNULLATA: 'Annullata'
} as const;

export type ReservationStatusType = (typeof ReservationStatus)[keyof typeof ReservationStatus];

// Colori Quasar per gli stati delle prenotazioni
export const RESERVATION_STATUS_COLORS: Record<ReservationStatusType, string> = {
  [ReservationStatus.CONFERMATA]: 'positive',
  [ReservationStatus.IN_ATTESA]: 'warning',
  [ReservationStatus.COMPLETATA]: 'positive',
  [ReservationStatus.ANNULLATA]: 'negative'
};

export const DOCTORS = [
  'Dr. Mario Rossi',
  'Dr. Anna Verdi',
  'Dr. Luigi Bianchi',
  'Dr. Sara Neri',
  'Dr. Paolo Ferrari'
];

export const AVAILABLE_TIMES = [
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
