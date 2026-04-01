<template>
	<span
		v-for="(textToken, textTokenIndex) of tokenizedText"
		:key="['term', textTokenIndex].join('-')"
		v-tooltip="textToken.tooltip"
		:class="textToken.tooltip ? 'bg-stone-800/60' : undefined"
		>{{ textToken.value }}
	</span>
</template>

<script setup lang="ts">
import { applyTermsWithTooltips } from '@/utils/text.helpers';

const { text } = defineProps<{
	text: string;
}>();

const tokenizedText = applyTermsWithTooltips(text);
</script>
