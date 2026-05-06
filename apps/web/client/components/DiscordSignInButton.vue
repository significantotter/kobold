<template>
	<button class="discord-sign-in-button" :class="`discord-sign-in-button-${size}`" :disabled="loading" @click="login">
		<i class="pi pi-discord" />
		<span>{{ loading ? 'Redirecting...' : label }}</span>
	</button>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '@/api/api-client';

const props = withDefaults(
	defineProps<{
		size?: 'header' | 'page';
		label?: string;
		returnToCurrentPage?: boolean;
	}>(),
	{
		size: 'page',
		label: 'Sign in with Discord',
		returnToCurrentPage: true,
	}
);

const route = useRoute();
const loading = ref(false);

async function login() {
	loading.value = true;
	try {
		const input = props.returnToCurrentPage ? { returnTo: route.fullPath } : undefined;
		const { url } = await api.auth.getAuthUrl(input);
		window.location.href = url;
	} catch (error) {
		console.error('Failed to get auth URL:', error);
		loading.value = false;
	}
}
</script>

<style lang="scss" scoped>
.discord-sign-in-button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 0.625rem;
	border: 1px solid #5865f2;
	border-radius: 0.5rem;
	background: #5865f2;
	color: #fff;
	font-weight: 700;
	line-height: 1;
	white-space: nowrap;
	cursor: pointer;
	transition:
		background 0.15s ease,
		border-color 0.15s ease,
		box-shadow 0.15s ease,
		transform 0.15s ease;

	&:hover:not(:disabled) {
		background: #4752c4;
		border-color: #4752c4;
		text-decoration: none;
	}

	&:focus-visible {
		outline: 2px solid #fff;
		outline-offset: 2px;
		box-shadow: 0 0 0 4px rgba(88, 101, 242, 0.45);
	}

	&:active:not(:disabled) {
		transform: translateY(1px);
	}

	&:disabled {
		opacity: 0.65;
		cursor: not-allowed;
	}
}

.discord-sign-in-button-header {
	min-height: 2.5rem;
	padding: 0.625rem 0.875rem;
	font-size: 0.875rem;
}

.discord-sign-in-button-page {
	min-height: 3.5rem;
	padding: 0.875rem 1.5rem;
	font-size: 1.125rem;
}
</style>
