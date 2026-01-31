export interface CreateReservationRequest {
  date: string;
  time: string;
  category: string;
  doctor: string;
  location?: string;
  status: string;
  notes?: string;
}

export interface Reservation {
  id: string;
  userId: string;
  date: string;
  time: string;
  category: string;
  doctor: string;
  status: "In attesa di conferma" | "Confermata" | "Completata" | "Annullata";
  location: string | null;
  notes: string | null;
  createdAt: string;
}
