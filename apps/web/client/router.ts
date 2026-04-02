import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
	history: createWebHistory(),
	routes: [
		{
			path: '/',
			name: 'home',
			component: () => import('./pages/index.vue'),
		},
		{
			path: '/about',
			name: 'about',
			component: () => import('./pages/about.vue'),
		},
		{
			path: '/commands',
			name: 'commands',
			component: () => import('./pages/commands.vue'),
		},
		{
			path: '/contact',
			name: 'contact',
			component: () => import('./pages/contact.vue'),
		},
		{
			path: '/login',
			name: 'login',
			component: () => import('./pages/login.vue'),
		},
		{
			path: '/login-error',
			name: 'login-error',
			component: () => import('./pages/login-error.vue'),
		},
		{
			path: '/wg/oauth-request',
			name: 'wg-oauth-request',
			component: () => import('./pages/wg/oauth-request.vue'),
		},
		{
			path: '/wg/oauth-authorized',
			name: 'wg-oauth-authorized',
			component: () => import('./pages/wg/oauth-authorized.vue'),
		},
		{
			path: '/wg/oauth-error',
			name: 'wg-oauth-error',
			component: () => import('./pages/wg/oauth-error.vue'),
		},
	],
});

export default router;
