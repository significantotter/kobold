<template>
	<section class="panel section-panel">
		<h2>Actions</h2>
		<div class="split-sections">
			<div>
				<h3>Local to this character</h3>
				<p v-if="localActions.length === 0" class="empty-copy">
					No local actions surfaced here yet.
				</p>
				<div v-else class="resource-list">
					<ActionCard
						v-for="action in localActions"
						:key="action.meta.id"
						:action="action"
					/>
				</div>
			</div>
			<div>
				<h3>Inherited from Library</h3>
				<p v-if="inheritedActions.length === 0" class="empty-copy">
					No library actions are inherited here yet.
				</p>
				<div v-else class="resource-list">
					<ActionCard
						v-for="action in inheritedActions"
						:key="action.meta.id"
						:action="action"
						inherited
					/>
				</div>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import ActionCard from './ActionCard.vue';
import type { ActionDisplayItem } from './types';

defineProps<{
	localActions: ActionDisplayItem[];
	inheritedActions: ActionDisplayItem[];
}>();
</script>
