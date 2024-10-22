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
import { applyTermsWithTooltips } from '~/utils/text.helpers';

const { text } = defineProps<{
	text: string;
}>();
// the text looks like "Yip! I added the {rollType:Action} roll {rollName:Kaladin} to the action {actionName:Create Lashing}."
// Terms will have the keys rollType, rollName, and actionName, and the values as tooltips
const tokenizedText = applyTermsWithTooltips(text);
</script>
