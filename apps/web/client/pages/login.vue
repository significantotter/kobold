<template>
	<main
		class="container mx-auto grid gap-auto grid-cols-1 child-margin-auto prose dark:prose-invert pt-10 overflow-auto"
	>
		<PeridotImage />
		<h1>Login</h1>
		<p>Sign in with Discord to manage your Kobold resources.</p>
		<DiscordSignInButton size="page" :return-to-current-page="false" />
	</main>
</template>

<script setup lang="ts">
import DiscordSignInButton from '@/components/DiscordSignInButton.vue';
import PeridotImage from '@/components/PeridotImage.vue';
</script>
