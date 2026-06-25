<template>
	<section class="panel section-panel">
		<h2>Roll Macros</h2>
		<div class="split-sections">
			<div>
				<h3>Local to this character</h3>
				<p v-if="localRollMacros.length === 0" class="empty-copy">
					No local roll macros yet.
				</p>
				<div v-else class="resource-list">
					<RollMacroCard
						v-for="rollMacro in localRollMacros"
						:key="rollMacro.meta.id"
						:roll-macro="rollMacro"
						:menu-open="openActionMenuId === rollMacro.meta.id"
						@toggle-menu="$emit('toggle-menu', rollMacro.meta.id)"
						@delete="$emit('delete', rollMacro.meta.id)"
					/>
				</div>
			</div>
			<div>
				<h3>Inherited from Library</h3>
				<p v-if="inheritedRollMacros.length === 0" class="empty-copy">
					No shared roll macros are inherited here yet.
				</p>
				<div v-else class="resource-list">
					<RollMacroCard
						v-for="rollMacro in inheritedRollMacros"
						:key="rollMacro.meta.id"
						:roll-macro="rollMacro"
						inherited
					/>
				</div>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import RollMacroCard from './RollMacroCard.vue';
import type { RollMacroItem } from './types';

defineProps<{
	localRollMacros: RollMacroItem[];
	inheritedRollMacros: RollMacroItem[];
	openActionMenuId: number | null;
}>();

defineEmits<{
	(event: 'toggle-menu', id: number): void;
	(event: 'delete', id: number): void;
}>();
</script>
