import type { MaybeRefOrGetter } from 'vue';
import { fetchAuthSession } from 'aws-amplify/auth';

export type QueryOptions = {
  enabled?: MaybeRefOrGetter<boolean>;
};

// Nome dell'API configurata in Amplify
export const API_NAME = 'apiName';

// Configurazione comune per le query
export const queryCommons = {
  retry: 0,
  throwOnError: () => {
    return true;
  }
};

// Helper per recuperare l'ID token da AWS Cognito
export const idToken = async () => {
  const session = await fetchAuthSession();
  const sessionIdToken = session.tokens?.idToken?.toString();

  return sessionIdToken;
};
