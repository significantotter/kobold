<template>
	<main
		class="container mx-auto grid gap-auto grid-cols-1 child-margin-auto prose dark:prose-invert pt-10 overflow-auto"
	>
		<PeridotImage />
		<h1>Login Error</h1>
		<p class="text-red-500">{{ errorMessage }}</p>
		<p>
			If you continue to have issues, please
			<a href="https://discord.gg/6bS2GM59uj">join our Discord support server</a>.
		</p>
		<RouterLink to="/login" class="text-indigo-400 hover:text-indigo-300">
			Try again
		</RouterLink>
	</main>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import PeridotImage from '@/components/PeridotImage.vue';

const route = useRoute();

const errorMessage = computed(() => {
	const error = route.query.error as string;
	switch (error) {
		case 'access_denied':
			return 'You denied access to your Discord account.';
		case 'missing_code':
			return 'No authorization code was received from Discord.';
		case 'invalid_state':
			return 'Invalid state parameter. Please try again.';
		default:
			return error || 'An unknown error occurred during login.';
	}
});
</script>
