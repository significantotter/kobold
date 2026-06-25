<template>
	<div class="minion-card-actions">
		<div class="minion-action-buttons">
			<button
				v-if="showSheetButton"
				class="icon-action-button icon-action-button-sheet"
				type="button"
				:aria-label="`View sheet for ${minion.payload.name}`"
				@click="$emit('open-sheet')"
			>
				<i class="pi pi-id-card" aria-hidden="true" />
			</button>
			<div class="minion-menu-shell">
				<button
					class="icon-action-button"
					type="button"
					:aria-expanded="menuOpen"
					:aria-label="`More actions for ${minion.payload.name}`"
					@click="$emit('toggle-menu')"
				>
					<span aria-hidden="true">&hellip;</span>
				</button>
				<div v-if="menuOpen" class="minion-action-menu">
					<template v-if="library && libraryManage">
						<button class="minion-action-menu-item" @click="$emit('start-rename')">
							Rename
						</button>
						<button class="minion-action-menu-item" @click="$emit('toggle-auto-join')">
							{{
								minion.summary.autoJoinInitiative
									? 'Disable Auto-Join'
									: 'Enable Auto-Join'
							}}
						</button>
						<button
							class="minion-action-menu-item minion-action-menu-item-danger"
							@click="$emit('delete')"
						>
							Delete
						</button>
					</template>
					<button v-else-if="library" class="minion-action-menu-item" @click="$emit('assign')">
						Assign here
					</button>
					<template v-else>
						<button class="minion-action-menu-item" @click="$emit('start-rename')">
							Rename
						</button>
						<button class="minion-action-menu-item" @click="$emit('toggle-auto-join')">
							{{
								minion.summary.autoJoinInitiative
									? 'Disable Auto-Join'
									: 'Enable Auto-Join'
							}}
						</button>
						<button class="minion-action-menu-item" @click="$emit('unassign')">
							Unassign
						</button>
						<button
							class="minion-action-menu-item minion-action-menu-item-danger"
							@click="$emit('delete')"
						>
							Delete
						</button>
					</template>
				</div>
			</div>
		</div>
		<span v-if="minion.summary.autoJoinInitiative" class="minion-status-chip">
			Auto-Join
		</span>
	</div>
</template>

<script setup lang="ts">
import type { MinionItem } from './types';

withDefaults(
	defineProps<{
		minion: MinionItem;
		menuOpen: boolean;
		library?: boolean;
		libraryManage?: boolean;
		showSheetButton?: boolean;
	}>(),
	{
		library: false,
		libraryManage: false,
		showSheetButton: true,
	}
);

defineEmits<{
	(event: 'open-sheet'): void;
	(event: 'toggle-menu'): void;
	(event: 'start-rename'): void;
	(event: 'toggle-auto-join'): void;
	(event: 'unassign'): void;
	(event: 'delete'): void;
	(event: 'assign'): void;
}>();
</script>
