import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/RegisterView.vue')
  },
  {
    path: '/welcome',
    name: 'welcome',
    component: () => import('../views/WelcomeView.vue')
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const publicRoutes = new Set(['home', 'login', 'register']);
  const isPublic = publicRoutes.has(to.name as string);
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  if (!isPublic && !isAuthenticated) {
    next({ name: 'home' });
    return;
  }

  next();
});

export default router