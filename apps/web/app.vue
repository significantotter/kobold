<template>
	<div v-show="isMounted" id="nuxt-app-grid">
		<!-- Markup shared across all pages, ex: NavBar -->
		<div id="nuxt-app-header">
			<AppHeader />
		</div>
		<div id="nuxt-app-body">
			<NuxtPage />
			<!-- <AppCopyright /> -->
		</div>
	</div>
</template>
<script setup lang="ts">
import AppHeader from '~/components/AppHeader.vue';
import 'primeicons/primeicons.css';
// import AppCopyright from './components/AppCopyright.vue';
import type { DiscordMessageOptions } from '@skyra/discord-components-core';

const isMounted = ref(false);

onMounted(() => {
	isMounted.value = true;
});

declare global {
	// eslint-disable-next-line no-var
	var $discordMessage: DiscordMessageOptions | undefined;
}
</script>
<style>
/* auto center */
.child-margin-auto > * {
	text-align: center;
}
#nuxt-app-grid {
	display: grid;
	grid-template-columns: 1fr;
	grid-template-rows: auto 1fr auto;
	grid-template-areas:
		'header'
		'main'
		'footer';
	height: 100vh;
}
#nuxt-app-header {
	grid-area: header;
}
#nuxt-app-body {
	grid-area: main;
	padding: 15px 5px 10px 5px;
	overflow: auto;
}
</style>
