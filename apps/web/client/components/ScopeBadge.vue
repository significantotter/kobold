<template>
	<span class="scope-badge" :class="variant"><slot /></span>
</template>

<script setup lang="ts">
defineProps<{
	variant: string;
}>();
</script>
