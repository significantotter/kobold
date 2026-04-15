import { createApp } from 'vue';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import Tooltip from 'primevue/tooltip';
import App from './App.vue';
import router from './router';

import 'primeicons/primeicons.css';
import '../assets/main.css';

// Apply dark class by default for PrimeVue
document.documentElement.classList.add('dark');

const app = createApp(App);

// Pinia store
app.use(createPinia());

// Vue Router
app.use(router);

// PrimeVue
app.use(PrimeVue, {
	theme: {
		preset: Aura,
		options: {
			prefix: 'p',
			darkModeSelector: '.dark',
			cssLayer: false,
		},
	},
	ripple: true,
});

// PrimeVue directives
app.directive('tooltip', Tooltip);

// Discord message component global config
declare global {
	// eslint-disable-next-line no-var
	var $discordMessage: import('@skyra/discord-components-core').DiscordMessageOptions | undefined;
}

app.mount('#app');
