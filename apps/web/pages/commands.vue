<template>
	<main class="container mx-auto grid gap-auto grid-cols-1 prose dark:prose-invert">
		<CommandRenderer :commands="commands" />
	</main>
</template>
<script setup lang="ts">
import { commands } from '@kobold/documentation';
import CommandRenderer from '~/components/command-renderer/CommandRenderer.vue';
</script>
