import LoginView from '@/views/LoginView.vue';
import Reservation from '@/views/Reservation.vue';
import Cancellation from '@/views/Cancellation.vue';
import Report from '@/views/Report.vue';
import { createRouter, createWebHashHistory } from 'vue-router';

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: Reservation
    },
    {
      path: '/login',
      name: 'Login',
      component: LoginView
    },
    {
      path: '/prenotazioni',
      name: 'Reservation',
      component: Reservation
    },
    {
      path: '/disdette',
      name: 'Cancellation',
      component: Cancellation
    },
    {
      path: '/referti',
      name: 'Report',
      component: Report
    }
  ]
});

export default router;
