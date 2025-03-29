import { definePreset } from '@primevue/themes';
import Aura from '@primevue/themes/aura';

const koboldPreset = definePreset(Aura, {
	semantic: {
		primary: {
			50: '{emerald.50}',
			100: '{emerald.100}',
			200: '{emerald.200}',
			300: '{emerald.300}',
			400: '{emerald.400}',
			500: '{emerald.500}',
			600: '{emerald.600}',
			700: '{emerald.700}',
			800: '{emerald.800}',
			900: '{emerald.900}',
			950: '{emerald.950}',
		},
	},
});

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	nitro: {
		esbuild: {
			options: {
				target: 'esnext',
			},
		},
	},
	runtimeConfig: {
		public: {
			VITE_BASE_URL: process.env.VITE_BASE_URL,
		},
	},
	compatibilityDate: '2024-04-03',
	devtools: { enabled: true },
	modules: [
		'@pinia/nuxt',
		'@nuxt/image',
		'@nuxtjs/eslint-module',
		'@nuxt/eslint',
		'@primevue/nuxt-module',
		'@nuxtjs/tailwindcss',
	],
	vue: {
		compilerOptions: {
			isCustomElement: tag => tag.startsWith('discord-'),
		},
	},
	primevue: {
		usePrimeVue: true,
		directives: { include: ['Tooltip'] },
		options: {
			ripple: true,
			unstyled: false,
			theme: {
				preset: koboldPreset,
			},
		},
	},
});
