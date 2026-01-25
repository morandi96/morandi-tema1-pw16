import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { get, post, put } from 'aws-amplify/api';
import { API_NAME, idToken, queryCommons } from './common';
import type { Reservation, ReservationDocument } from '@/types/types';

const KEY = 'reservations';
const basePath = '/reservation';

// Query keys
export const reservationKeys = {
  all: [KEY] as const,
  active: () => [...reservationKeys.all, 'active'] as const,
  list: () => [...reservationKeys.all, 'list'] as const
};

/**
 * Hook per recuperare la prenotazione attiva
 * GET /reservation/active
 */
export const useActiveReservation = () => {
  const query = useQuery({
    ...queryCommons,
    queryKey: reservationKeys.active(),
    queryFn: async () => {
      const restOperation = get({
        apiName: API_NAME,
        path: `${basePath}/active`,
        options: {
          headers: {
            Authorization: `Bearer ${await idToken()}`
          }
        }
      });

      const { body } = await restOperation.response;
      const response = await body.json();

      return response as Reservation | null;
    }
  });

  return { ...query, activeReservation: query.data };
};

/**
 * Hook per recuperare lo storico prenotazioni
 * GET /reservation/list
 */
export const useReservationsList = () => {
  const query = useQuery({
    ...queryCommons,
    queryKey: reservationKeys.list(),
    queryFn: async () => {
      const restOperation = get({
        apiName: API_NAME,
        path: `${basePath}/list`,
        options: {
          headers: {
            Authorization: `Bearer ${await idToken()}`
          }
        }
      });

      const { body } = await restOperation.response;
      const response = await body.json();

      return response as any as Reservation[];
    }
  });

  return { ...query, reservationsList: query.data };
};

/**
 * Hook per annullare una prenotazione (cambia stato in "Annullata")
 * PUT /reservation/cancel/:id
 */
export const useCancelReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reservationId: string) => {
      const restOperation = put({
        apiName: API_NAME,
        path: `${basePath}/cancel/${reservationId}`,
        options: {
          headers: {
            Authorization: `Bearer ${await idToken()}`,
            'Content-Type': 'application/json'
          }
        }
      });

      await restOperation.response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.active() });
      queryClient.invalidateQueries({ queryKey: reservationKeys.list() });
    }
  });
};

/**
 * Hook per creare una nuova prenotazione
 * POST /reservation/create
 */
export const useCreateReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reservation: Omit<Reservation, 'id'>) => {
      const restOperation = post({
        apiName: API_NAME,
        path: `${basePath}/create`,
        options: {
          headers: {
            Authorization: `Bearer ${await idToken()}`,
            'Content-Type': 'application/json'
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          body: reservation as any
        }
      });

      const { body } = await restOperation.response;
      const response = await body.json();

      return response as any as Reservation;
    },
    onSuccess: (newReservation: Reservation) => {
      // Aggiorna la cache con la nuova prenotazione
      queryClient.setQueryData(reservationKeys.active(), newReservation);
      // Invalida la lista per refresh
      queryClient.invalidateQueries({ queryKey: reservationKeys.list() });
    }
  });
};

/**
 * Hook per caricare un documento (referto utente o ricetta medico)
 * PUT /reservation/:id/document
 */
export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reservationId,
      document,
      documentType
    }: {
      reservationId: string;
      document: ReservationDocument;
      documentType: 'user' | 'doctor';
    }) => {
      const restOperation = put({
        apiName: API_NAME,
        path: `${basePath}/${reservationId}/document`,
        options: {
          headers: {
            Authorization: `Bearer ${await idToken()}`,
            'Content-Type': 'application/json'
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          body: { action: 'upload', document, documentType } as any
        }
      });

      const { body } = await restOperation.response;
      const response = await body.json();

      return response as unknown as Reservation;
    },
    onSuccess: () => {
      // Invalida la lista per forzare il refresh
      queryClient.invalidateQueries({ queryKey: reservationKeys.list() });
    }
  });
};

/**
 * Hook per eliminare un documento (referto utente o ricetta medico)
 * PUT /reservation/:id/document
 */
export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reservationId,
      documentType
    }: {
      reservationId: string;
      documentType: 'user' | 'doctor';
    }) => {
      const restOperation = put({
        apiName: API_NAME,
        path: `${basePath}/${reservationId}/document`,
        options: {
          headers: {
            Authorization: `Bearer ${await idToken()}`,
            'Content-Type': 'application/json'
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          body: { action: 'delete', documentType } as any
        }
      });

      const { body } = await restOperation.response;
      const response = await body.json();

      return response as unknown as Reservation;
    },
    onSuccess: () => {
      // Invalida la lista per forzare il refresh
      queryClient.invalidateQueries({ queryKey: reservationKeys.list() });
    }
  });
};
