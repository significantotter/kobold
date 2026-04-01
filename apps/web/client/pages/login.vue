<template>
	<main
		class="container mx-auto grid gap-auto grid-cols-1 child-margin-auto prose dark:prose-invert pt-10 overflow-auto"
	>
		<PeridotImage />
		<h1>Login</h1>
		<p>Sign in with Discord to manage your Kobold resources.</p>
		<button
			class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded inline-flex items-center gap-2"
			:disabled="loading"
			@click="login"
		>
			<i class="pi pi-discord" />
			<span>{{ loading ? 'Redirecting...' : 'Sign in with Discord' }}</span>
		</button>
	</main>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import PeridotImage from '@/components/PeridotImage.vue';
import { api } from '@/utils/api-client';

const loading = ref(false);

async function login() {
	loading.value = true;
	try {
		const { url } = await api.auth.getAuthUrl();
		window.location.href = url;
	} catch (error) {
		console.error('Failed to get auth URL:', error);
		loading.value = false;
	}
}
</script>
