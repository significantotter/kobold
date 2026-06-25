<template>
	<section class="panel section-panel">
		<h2>Minions</h2>
		<div class="split-sections">
			<div>
				<h3>Assigned to this character</h3>
				<p v-if="assignedMinions.length === 0" class="empty-copy">
					No minions are assigned here.
				</p>
				<div v-else class="resource-list">
					<article
						v-for="minion in assignedMinions"
						:key="minion.meta.id"
						class="resource-card minion-card"
						:class="{ 'minion-card-menu-open': openActionMenuId === minion.meta.id }"
					>
						<div v-if="editingMinionId === minion.meta.id" class="rename-row">
							<input
								:value="minionRenameDraft"
								class="text-input"
								maxlength="100"
								@input="updateMinionRenameDraft"
							/>
							<button class="primary-button" @click="$emit('save-rename', minion.meta.id)">
								Save
							</button>
							<button class="ghost-button" @click="$emit('cancel-rename')">
								Cancel
							</button>
						</div>
						<SheetMiniPreview
							v-else
							:name="minion.payload.name"
							:summary="minion.summary"
							compact
						>
							<template #actions>
								<MinionCardActions
									:minion="minion"
									:menu-open="openActionMenuId === minion.meta.id"
									@open-sheet="$emit('open-sheet', minion)"
									@toggle-menu="$emit('toggle-menu', minion.meta.id)"
									@start-rename="$emit('start-rename', minion)"
									@toggle-auto-join="$emit('toggle-auto-join', minion)"
									@unassign="$emit('unassign', minion.meta.id)"
									@delete="$emit('delete', minion.meta.id)"
								/>
							</template>
						</SheetMiniPreview>
					</article>
				</div>
			</div>
			<div>
				<h3>Available from Library</h3>
				<p v-if="availableMinions.length === 0" class="empty-copy">
					No unassigned minions are available.
				</p>
				<div v-else class="resource-list">
					<article
						v-for="minion in availableMinions"
						:key="minion.meta.id"
						class="resource-card resource-card-muted minion-card"
						:class="{ 'minion-card-menu-open': openActionMenuId === minion.meta.id }"
					>
						<SheetMiniPreview
							:name="minion.payload.name"
							:summary="minion.summary"
							compact
						>
							<template #actions>
								<MinionCardActions
									:minion="minion"
									:menu-open="openActionMenuId === minion.meta.id"
									library
									@open-sheet="$emit('open-sheet', minion)"
									@toggle-menu="$emit('toggle-menu', minion.meta.id)"
									@assign="$emit('assign', minion.meta.id)"
								/>
							</template>
						</SheetMiniPreview>
					</article>
				</div>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import SheetMiniPreview from '@/components/SheetMiniPreview.vue';
import MinionCardActions from './MinionCardActions.vue';
import type { MinionItem } from './types';

defineProps<{
	assignedMinions: MinionItem[];
	availableMinions: MinionItem[];
	openActionMenuId: number | null;
	editingMinionId: number | null;
	minionRenameDraft: string;
}>();

const emit = defineEmits<{
	(event: 'update:minionRenameDraft', value: string): void;
	(event: 'open-sheet', minion: MinionItem): void;
	(event: 'toggle-menu', id: number): void;
	(event: 'start-rename', minion: MinionItem): void;
	(event: 'save-rename', id: number): void;
	(event: 'cancel-rename'): void;
	(event: 'toggle-auto-join', minion: MinionItem): void;
	(event: 'unassign', id: number): void;
	(event: 'delete', id: number): void;
	(event: 'assign', id: number): void;
}>();

function updateMinionRenameDraft(event: Event) {
	emit('update:minionRenameDraft', (event.target as HTMLInputElement).value);
}
</script>
