import { createRouter, createWebHistory } from 'vue-router';
import { getToken } from '@/services/auth/tokenService';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  scrollBehavior() {
    // always scroll to top
    return { top: 0 };
  },

  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'login',
      meta: { noAuth: true },

      beforeEnter: () => {
        if (getToken()) {
          return { name: 'dashboard' }; //redirect to the dashboard if logged
        }
      },

      component: () => import('@/views/auth/LoginView.vue')
    },
    {
      path: '/',
      name: 'lobby',
      component: () => import('@/views/user/LobbyView.vue')
    }
  ]
});

router.beforeEach(async (to, from) => {
  // Make sure the user is authenticated avoiding an infinite redirect
  if (!to.meta.noAuth && !getToken() && to.name !== 'login') {
    return { name: 'login' }; //redirect the user to the login page
  }
});

export default router;
