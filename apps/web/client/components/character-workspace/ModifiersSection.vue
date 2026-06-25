<template>
	<section class="panel section-panel">
		<h2>Modifiers</h2>
		<div class="split-sections">
			<div>
				<h3>Assigned to this character</h3>
				<p v-if="assignedModifiers.length === 0" class="empty-copy">
					No assigned modifiers on this character.
				</p>
				<div v-else class="resource-list">
					<ModifierCard
						v-for="modifier in assignedModifiers"
						:key="modifier.meta.id"
						:item="modifier"
						:menu-open="openActionMenuId === modifier.meta.id"
						show-menu
						@toggle-menu="$emit('toggle-menu', modifier.meta.id)"
						@toggle="$emit('toggle-modifier', modifier)"
					/>
				</div>
			</div>
			<div>
				<h3>Available from Library</h3>
				<p v-if="libraryModifiers.length === 0" class="empty-copy">
					No unassigned library modifiers are available.
				</p>
				<div v-else class="resource-list">
					<ModifierCard
						v-for="modifier in libraryModifiers"
						:key="modifier.meta.id"
						:item="modifier"
						muted
						library
						unassigned
						:show-state="false"
					/>
				</div>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import ModifierCard from './ModifierCard.vue';
import type { ModifierAssignedItem, ModifierLibraryItem } from './types';

defineProps<{
	assignedModifiers: ModifierAssignedItem[];
	libraryModifiers: ModifierLibraryItem[];
	openActionMenuId: number | null;
}>();

defineEmits<{
	(event: 'toggle-menu', id: number): void;
	(event: 'toggle-modifier', modifier: ModifierAssignedItem): void;
}>();
</script>
