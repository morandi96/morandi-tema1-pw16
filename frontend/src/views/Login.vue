<script setup lang="ts">
import { Authenticator, translations } from '@aws-amplify/ui-vue';
import '@aws-amplify/ui-vue/styles.css';
import { useRouter } from 'vue-router';
import { ref, onMounted, onUnmounted } from 'vue';
import { getCurrentUser } from 'aws-amplify/auth';
import { Hub, I18n } from 'aws-amplify/utils';

const router = useRouter();
const isLoading = ref(true);

// Traduzioni italiane per Amplify Authenticator, il default è l'inglese
I18n.putVocabularies(translations);
I18n.putVocabularies({
  it: {
    'Sign In': 'Accedi',
    'Sign in': 'Accedi',
    'Sign Up': 'Registrati',
    'Create Account': 'Crea Account',
    'Create account': 'Crea account',
    Email: 'Email',
    Password: 'Password',
    'Confirm Password': 'Conferma Password',
    'Enter your Email': 'Inserisci la tua email',
    'Enter your Password': 'Inserisci la tua password',
    'Please confirm your Password': 'Conferma la tua password',
    'Forgot your password?': 'Password dimenticata?',
    'Reset Password': 'Reimposta Password',
    'Reset password': 'Reimposta password',
    'Send code': 'Invia codice',
    'Back to Sign In': 'Torna al login',
    Code: 'Codice',
    'Confirmation Code': 'Codice di conferma',
    'Enter your code': 'Inserisci il codice',
    'Enter your Confirmation Code': 'Inserisci il codice di conferma',
    'New Password': 'Nuova Password',
    'Enter your new password': 'Inserisci la nuova password',
    Submit: 'Conferma',
    Submitting: 'Invio in corso...',
    'Signing in': 'Accesso in corso...',
    'Creating Account': 'Creazione account...',
    'We Emailed You': 'Ti abbiamo inviato una email',
    'Your code is on the way. To log in, enter the code we emailed to':
      'Il codice è in arrivo. Per accedere, inserisci il codice che abbiamo inviato a',
    'It may take a minute to arrive.': 'Potrebbe impiegare un minuto ad arrivare.',
    Confirm: 'Conferma',
    'Resend Code': 'Reinvia codice',
    'Incorrect username or password.': 'Email o password non corretti.',
    'User does not exist.': 'Utente non trovato.',
    'User already exists': 'Utente già registrato',
    'Invalid verification code provided, please try again.':
      'Codice di verifica non valido, riprova.',
    'Password must have at least 8 characters': 'La password deve avere almeno 8 caratteri',
    'Your passwords must match': 'Le password devono coincidere',
    'Invalid email address format.': 'Formato email non valido.',
    'An account with the given email already exists.': 'Esiste già un account con questa email.'
  }
});
I18n.setLanguage('it');

// Controlla se l'utente è già autenticato
onMounted(async () => {
  try {
    await getCurrentUser();
    router.push('/prenotazioni');
  } catch {
    isLoading.value = false;
  }

  const unsubscribe = Hub.listen('auth', ({ payload }) => {
    if (payload.event === 'signedIn') {
      router.push('/prenotazioni');
    }
  });

  onUnmounted(() => {
    unsubscribe();
  });
});
</script>

<template>
  <div class="login-container">
    <div v-if="isLoading" class="loading-content">
      <q-spinner color="white" size="50px" />
      <p class="text-white q-mt-md">{{ $t('login.verify') }}</p>
    </div>

    <!-- Form di Login/Registrazione -->
    <div v-else>
      <Authenticator
        :hide-sign-up="false"
        :social-providers="[]"
        :login-mechanisms="['email']"
        :sign-up-attributes="['email']"
      >
        <template #header>
          <div class="login-header">
            <q-icon name="local_hospital" size="64px" color="primary" />
            <div class="login-title">{{ $t('common.project') }}</div>
            <p class="login-subtitle">{{ $t('login.title') }}</p>
          </div>
        </template>
      </Authenticator>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  /* min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center; */
  padding-top: 40px;
}

.loading-content {
  text-align: center;
}

.login-header {
  text-align: center;
  margin-bottom: 16px;
}

.login-title {
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: #2a3a54;
}

.login-subtitle {
  color: #666;
  font-size: 0.95rem;
  margin: 0;
}

.signup-header,
.signin-header {
  text-align: center;
  margin-bottom: 20px;
}

.signup-title,
.signin-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2a3a54;
  margin-bottom: 8px;
}

.signup-subtitle,
.signin-subtitle {
  color: #666;
  font-size: 0.9rem;
}

.authenticated-content {
  display: flex;
  justify-content: center;
  padding: 20px;
}

/* Personalizzazione Amplify UI per colore primary del progetto (#2a3a54) */
:deep([data-amplify-authenticator]) {
  --amplify-colors-brand-primary-10: #f0f2f5;
  --amplify-colors-brand-primary-20: #d9dde4;
  --amplify-colors-brand-primary-40: #8a9bab;
  --amplify-colors-brand-primary-60: #4a5f75;
  --amplify-colors-brand-primary-80: #2a3a54;
  --amplify-colors-brand-primary-90: #1f2c40;
  --amplify-colors-brand-primary-100: #151e2c;

  --amplify-components-button-primary-background-color: #2a3a54;
  --amplify-components-button-primary-hover-background-color: #1f2c40;
  --amplify-components-button-primary-active-background-color: #151e2c;
  --amplify-components-button-primary-focus-background-color: #2a3a54;

  --amplify-components-button-link-color: #2a3a54;
  --amplify-components-button-link-hover-color: #1f2c40;

  --amplify-components-fieldcontrol-focus-border-color: #2a3a54;
  --amplify-components-tabs-item-active-color: #2a3a54;
  --amplify-components-tabs-item-active-border-color: #2a3a54;
  --amplify-components-tabs-item-hover-color: #4a5f75;
}
</style>
