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

export type ReservationStatusType =
  (typeof ReservationStatus)[keyof typeof ReservationStatus];

// Colori Quasar per gli stati delle prenotazioni
export const RESERVATION_STATUS_COLORS: Record<ReservationStatusType, string> = {
  [ReservationStatus.CONFERMATA]: 'positive',
  [ReservationStatus.IN_ATTESA]: 'warning',
  [ReservationStatus.COMPLETATA]: 'info',
  [ReservationStatus.ANNULLATA]: 'negative'
};