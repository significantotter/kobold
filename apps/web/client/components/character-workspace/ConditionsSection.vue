<template>
	<section class="panel section-panel">
		<h2>Conditions</h2>
		<p v-if="conditions.length === 0" class="empty-copy">
			No active conditions recorded on this sheet.
		</p>
		<div v-else class="resource-list">
			<ModifierCard
				v-for="(condition, index) in conditions"
				:key="`${condition.name}-${index}`"
				:item="condition"
			/>
		</div>
	</section>
</template>

<script setup lang="ts">
import ModifierCard from './ModifierCard.vue';
import type { ConditionItem } from './types';

defineProps<{
	conditions: ConditionItem[];
}>();
</script>
