<template>
	<article class="resource-card roll-macro-card" :class="{ 'resource-card-muted': inherited }">
		<div class="roll-macro-card-header">
			<div class="roll-macro-title-block">
				<strong>{{ rollMacro.payload.name }}</strong>
				<div class="modifier-chip-row">
					<span v-if="!inherited && !library" class="modifier-chip modifier-chip-type">
						Character
					</span>
					<RouterLink
						v-else
						class="modifier-chip modifier-chip-library modifier-chip-link"
						to="/library"
					>
						{{ library ? 'Library' : 'Inherited' }}
					</RouterLink>
				</div>
			</div>

			<div v-if="!inherited" class="minion-menu-shell">
				<button
					class="icon-action-button"
					type="button"
					:aria-expanded="menuOpen"
					:aria-label="`More actions for ${rollMacro.payload.name}`"
					@click="$emit('toggle-menu')"
				>
					<span aria-hidden="true">&hellip;</span>
				</button>
				<div v-if="menuOpen" class="minion-action-menu">
					<button
						class="minion-action-menu-item minion-action-menu-item-danger"
						@click="$emit('delete', rollMacro.meta.id)"
					>
						Delete
					</button>
				</div>
			</div>
		</div>

		<code class="roll-macro-expression">{{ rollMacro.payload.macro }}</code>
	</article>
</template>

<script setup lang="ts">
import type { RollMacroItem } from './types';

withDefaults(
	defineProps<{
		rollMacro: RollMacroItem;
		inherited?: boolean;
		library?: boolean;
		menuOpen?: boolean;
	}>(),
	{
		inherited: false,
		library: false,
		menuOpen: false,
	}
);

defineEmits<{
	(event: 'toggle-menu'): void;
	(event: 'delete', id: number): void;
}>();
</script>
