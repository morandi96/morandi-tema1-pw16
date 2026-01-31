import Login from '@/views/Login.vue';
import Reservation from '@/views/Reservation.vue';
import Document from '@/views/Document.vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import { getCurrentUser } from 'aws-amplify/auth';

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: { requiresGuest: true }
    },
    {
      path: '/prenotazioni',
      name: 'Reservation',
      component: Reservation,
      meta: { requiresAuth: true }
    },
    // {
    //   path: '/disdette',
    //   name: 'Cancellation',
    //   component: Cancellation,
    //   meta: { requiresAuth: true }
    // },
    {
      path: '/referti',
      name: 'Document',
      component: Document,
      meta: { requiresAuth: true }
    }
  ]
});

// Auth Guard
router.beforeEach(async (to, _from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const requiresGuest = to.matched.some((record) => record.meta.requiresGuest);

  try {
    const user = await getCurrentUser();
    const isAuthenticated = !!user;

    if (requiresAuth && !isAuthenticated) {
      // Route protetta ma utente non autenticato
      next('/login');
    } else if (requiresGuest && isAuthenticated) {
      // Route per guest ma utente già autenticato
      next('/prenotazioni');
    } else {
      // Tutto OK, procedi
      next();
    }
  } catch {
    // Utente non autenticato
    if (requiresAuth) {
      next('/login');
    } else {
      next();
    }
  }
});

export default router;
