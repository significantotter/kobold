<template>
	<main
		class="container mx-auto grid gap-auto grid-cols-1 child-margin-auto prose dark:prose-invert"
	>
		<h4>Yip! Authorize Your Character!</h4>
		<FloatLabel class="m-auto w-72 mb-4 mt-4" variant="on">
			<InputText
				id="oauth-request-char-id-input"
				v-model="characterId"
				class="w-72"
				type="number"
			/>
			<label for="oauth-request-char-id-input">Wanderer's Guide Character ID</label>
		</FloatLabel>
		<Button class="m-auto" @click="authorize">Authorize</Button>
	</main>
</template>
<script setup lang="ts">
import InputText from 'primevue/inputtext';
import FloatLabel from 'primevue/floatlabel';
import Button from 'primevue/button';
import { ref } from 'vue';

const runtimeConfig = useRuntimeConfig();

const characterId = ref('');

function authorize() {
	window.location.href = `${runtimeConfig.public.VITE_BASE_URL}/.netlify/functions/oauth?characterId=${characterId.value}`;
}
</script>
