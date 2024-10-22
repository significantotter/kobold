<template>
	<div>
		<template v-if="isMounted">
			<!-- Markup shared across all pages, ex: NavBar -->
			<AppHeader />
			<PeridotImage />
			<NuxtPage />
			<AppCopyright
		/></template>
	</div>
</template>
<script setup lang="ts">
import AppHeader from '~/components/AppHeader.vue';
import 'primeicons/primeicons.css';
import AppCopyright from './components/AppCopyright.vue';
import PeridotImage from './components/PeridotImage.vue';
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
</style>
