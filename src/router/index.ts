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
  {
    path: '/stats',
    name: 'stats',
    component: () => import('../views/StatsView.vue')
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/ProfileView.vue')
  },
  {
  path: '/tickets',
  name: 'tickets',
  component: () => import('../views/TicketsView.vue'),
},
{
  path: '/tickets/create',
  name: 'tickets-create',
  component: () => import('../views/CreateTicketView.vue'),
},
{
  path: '/operations',
  name: 'operations',
  component: () => import('../views/OperationsView.vue'),
},
{
  path: '/contact',
  name: 'contact',
  component: () => import('../views/ContactView.vue'),
},
{
  path: '/terms',
  name: 'terms',
  component: () => import('../views/TermsView.vue'),
},
{
  path: '/about',
  name: 'about',
  component: () => import('../views/AboutView.vue'),
},
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const publicRoutes = new Set(['home', 'login', 'register', 'contact', 'terms', 'about']);
  const isPublic = publicRoutes.has(to.name as string);
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  if (!isPublic && !isAuthenticated) {
    next({ name: 'home' });
    return;
  }

  next();
});

export default router