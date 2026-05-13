<template>
	<section class="login-required-card">
		<p class="login-required-message">
			<slot>{{ message }}</slot>
		</p>
		<DiscordSignInButton size="page" />
	</section>
</template>

<script setup lang="ts">
import DiscordSignInButton from '@/components/DiscordSignInButton.vue';

withDefaults(
	defineProps<{
		message?: string;
	}>(),
	{
		message: '',
	}
);
</script>

<style scoped>
.login-required-card {
	display: grid;
	gap: 1rem;
	align-items: start;
	justify-items: start;
	padding: 1.4rem;
	margin-bottom: 1rem;
	border: 1px solid rgba(63, 63, 70, 0.88);
	background: rgba(24, 24, 27, 0.84);
	backdrop-filter: blur(10px);
	border-radius: 1rem;
	box-shadow: 0 22px 45px rgba(0, 0, 0, 0.24);
}

.login-required-message {
	margin: 0;
	color: #fafafa;
	font-size: 1.2rem;
	font-weight: 600;
	line-height: 1.45;
}
</style>
