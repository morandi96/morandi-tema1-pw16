import { ref, computed } from 'vue';
import { getCurrentUser, signOut, type AuthUser } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { useRouter } from 'vue-router';

// State globale per l'autenticazione
const user = ref<AuthUser | null>(null);
const isLoading = ref(true);
let listenerSetup = false;

// Funzione per aggiornare lo stato utente
const refreshUser = async () => {
  try {
    const currentUser = await getCurrentUser();
    user.value = currentUser;
  } catch {
    user.value = null;
  } finally {
    isLoading.value = false;
  }
};

export const useAuth = () => {
  const router = useRouter();

  // Computed per verificare se l'utente è autenticato
  const isAuthenticated = computed(() => !!user.value);

  // Inizializza l'auth state
  const initAuth = async () => {
    await refreshUser();
  };

  // Logout
  const logout = async () => {
    try {
      await signOut();
      user.value = null;
      router.push('/login');
    } catch (error) {
      console.error('Errore durante il logout:', error);
    }
  };

  // Listen to auth events (chiamato una sola volta)
  const setupAuthListener = () => {
    if (listenerSetup) return;
    listenerSetup = true;

    // Inizializza lo stato utente all'avvio
    refreshUser();

    // Ascolta eventi di autenticazione
    Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signedIn':
        case 'signInWithRedirect':
        case 'tokenRefresh':
          refreshUser();
          break;
        case 'signedOut':
          user.value = null;
          break;
      }
    });
  };

  return {
    user: computed(() => user.value),
    isAuthenticated,
    isLoading: computed(() => isLoading.value),
    initAuth,
    logout,
    setupAuthListener,
    refreshUser
  };
};