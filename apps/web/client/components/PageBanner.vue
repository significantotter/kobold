<template>
	<section v-if="message" class="banner" :class="toneClass">{{ message }}</section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
	message: string;
	tone: 'success' | 'error';
}>();

const toneClass = computed(() => (props.tone === 'success' ? 'banner-success' : 'banner-error'));
</script>
