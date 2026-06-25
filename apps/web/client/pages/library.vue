<template>
	<div class="library-page overflow-auto px-4 py-8">
		<main class="mx-auto max-w-6xl">
			<PeridotImage v-if="!auth.isLoggedIn" class="page-portrait" />
			<PageBanner :message="flashMessage" tone="success" />
			<PageBanner :message="error" tone="error" />

			<section v-if="loading" class="panel state-panel">
				<p><i class="pi pi-spin pi-spinner" /> Loading library...</p>
			</section>

			<LoginRequiredCard
				v-else-if="!auth.isLoggedIn"
				message="You must be logged in to manage your library."
			/>

			<template v-else>
				<section class="panel hero-panel">
					<div>
						<p class="eyebrow">Reusable Resources</p>
						<h1>Library</h1>
						<p class="lede">
							Shared actions and roll macros inherit everywhere. Library modifiers
							stay inert until assigned. Unassigned minions wait here for later
							attachment.
						</p>
					</div>
				</section>

				<section class="panel section-panel">
					<h2>Overview</h2>
					<div class="overview-grid">
						<div class="stat-card">
							<p class="stat-label">Shared actions</p>
							<p class="stat-value">
								{{ workspace?.overview.sharedActionCount ?? 0 }}
							</p>
						</div>
						<div class="stat-card">
							<p class="stat-label">Shared roll macros</p>
							<p class="stat-value">
								{{ workspace?.overview.sharedRollMacroCount ?? 0 }}
							</p>
						</div>
						<div class="stat-card">
							<p class="stat-label">Unassigned modifiers</p>
							<p class="stat-value">
								{{ workspace?.overview.unassignedModifierCount ?? 0 }}
							</p>
						</div>
						<div class="stat-card">
							<p class="stat-label">Unassigned minions</p>
							<p class="stat-value">
								{{ workspace?.overview.unassignedMinionCount ?? 0 }}
							</p>
						</div>
					</div>
				</section>

				<section class="panel section-panel">
					<h2>Shared Actions</h2>
					<p v-if="!workspace || workspace.sharedActions.length === 0" class="empty-copy">
						Yip! You don't have any actions in your library yet.
					</p>
					<div v-else class="resource-list">
						<ActionCard
							v-for="action in workspace.sharedActions"
							:key="action.meta.id"
							:action="action"
							library
						/>
					</div>
				</section>

				<section class="panel section-panel">
					<h2>Shared Roll Macros</h2>
					<p
						v-if="!workspace || workspace.sharedRollMacros.length === 0"
						class="empty-copy"
					>
						Yip! You don't have any roll macros in your library yet.
					</p>
					<div v-else class="resource-list">
						<RollMacroCard
							v-for="rollMacro in workspace.sharedRollMacros"
							:key="rollMacro.meta.id"
							:roll-macro="rollMacro"
							:menu-open="openRollMacroActionMenuId === rollMacro.meta.id"
							library
							@toggle-menu="toggleRollMacroActionMenu(rollMacro.meta.id)"
							@delete="deleteLibraryRollMacro"
						/>
					</div>
				</section>

				<section class="panel section-panel">
					<h2>Unassigned Modifiers</h2>
					<p
						v-if="!workspace || workspace.unassignedModifiers.length === 0"
						class="empty-copy"
					>
						Yip! You don't have any modifiers in your library yet.
					</p>
					<div v-else class="resource-list">
						<ModifierCard
							v-for="modifier in workspace.unassignedModifiers"
							:key="modifier.meta.id"
							:item="modifier"
							muted
							library
							unassigned
							:show-state="false"
						/>
					</div>
				</section>

				<section class="panel section-panel">
					<h2>Unassigned Minions</h2>
					<p
						v-if="!workspace || workspace.unassignedMinions.length === 0"
						class="empty-copy"
					>
						Yip! You don't have any minions in your library yet.
					</p>
					<div v-else class="resource-list">
						<article
							v-for="minion in workspace.unassignedMinions"
							:key="minion.meta.id"
							class="resource-card resource-card-muted minion-card"
							:class="{
								'minion-card-menu-open': openMinionActionMenuId === minion.meta.id,
							}"
						>
							<div v-if="editingMinionId === minion.meta.id" class="rename-row">
								<input
									v-model="minionRenameDraft"
									class="text-input"
									maxlength="100"
								/>
								<button
									class="primary-button"
									@click="saveMinionRename(minion.meta.id)"
								>
									Save
								</button>
								<button class="ghost-button" @click="cancelMinionRename">
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
										:menu-open="openMinionActionMenuId === minion.meta.id"
										library
										library-manage
										:show-sheet-button="false"
										@toggle-menu="toggleMinionActionMenu(minion.meta.id)"
										@start-rename="
											startMinionRename(minion.meta.id, minion.payload.name)
										"
										@toggle-auto-join="
											toggleMinionAutoJoin(
												minion.meta.id,
												minion.summary.autoJoinInitiative,
												minion.payload.name
											)
										"
										@delete="deleteMinion(minion.meta.id)"
									/>
								</template>
							</SheetMiniPreview>
							<div class="library-assignment-row">
								<select
									v-model="minionAssignmentTargets[minion.meta.id]"
									class="text-input"
								>
									<option value="">Assign to character...</option>
									<option
										v-for="character in characters"
										:key="character.id"
										:value="String(character.id)"
									>
										{{ character.name }}
									</option>
								</select>
								<button
									class="primary-button"
									@click="assignMinion(minion.meta.id)"
								>
									Assign to character
								</button>
							</div>
						</article>
					</div>
				</section>
			</template>
		</main>
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { api } from '@/api/api-client';
import ActionCard from '@/components/character-workspace/ActionCard.vue';
import MinionCardActions from '@/components/character-workspace/MinionCardActions.vue';
import ModifierCard from '@/components/character-workspace/ModifierCard.vue';
import RollMacroCard from '@/components/character-workspace/RollMacroCard.vue';
import LoginRequiredCard from '@/components/LoginRequiredCard.vue';
import PeridotImage from '@/components/PeridotImage.vue';
import PageBanner from '@/components/PageBanner.vue';
import SheetMiniPreview from '@/components/SheetMiniPreview.vue';
import { useAuthStore } from '@/stores/auth';

type LibraryWorkspace = Awaited<ReturnType<typeof api.library.getLibraryWorkspace>>;
type CharacterListItem = Awaited<ReturnType<typeof api.character.listMyCharacters>>[number];

const auth = useAuthStore();

const workspace = ref<LibraryWorkspace | null>(null);
const loading = ref(true);
const error = ref('');
const flashMessage = ref('');
const characters = ref<CharacterListItem[]>([]);
const openRollMacroActionMenuId = ref<number | null>(null);
const openMinionActionMenuId = ref<number | null>(null);
const editingMinionId = ref<number | null>(null);
const minionRenameDraft = ref('');
const minionAssignmentTargets = ref<Record<number, string>>({});

onMounted(async () => {
	if (!auth.loaded) {
		await auth.fetchUser();
	}
	if (auth.isLoggedIn) {
		await loadLibrary();
	} else {
		loading.value = false;
	}
});

async function loadLibrary() {
	loading.value = true;
	error.value = '';
	try {
		const [libraryWorkspace, ownedCharacters] = await Promise.all([
			api.library.getLibraryWorkspace({}),
			api.character.listMyCharacters({}),
		]);
		workspace.value = libraryWorkspace;
		characters.value = ownedCharacters;
		openRollMacroActionMenuId.value = null;
		openMinionActionMenuId.value = null;
		editingMinionId.value = null;
		minionRenameDraft.value = '';
		minionAssignmentTargets.value = Object.fromEntries(
			(libraryWorkspace.unassignedMinions ?? []).map(minion => [minion.meta.id, ''])
		);
	} catch (err: unknown) {
		error.value = err instanceof Error ? err.message : 'Failed to load library.';
	} finally {
		loading.value = false;
	}
}

async function deleteLibraryRollMacro(rollMacroId: number) {
	closeRollMacroActionMenu();
	if (!window.confirm('Delete this shared roll macro?')) return;
	error.value = '';
	try {
		await api.character.deleteRollMacro({ rollMacroId });
		flashMessage.value = 'Roll macro deleted from Library.';
		await loadLibrary();
	} catch (err: unknown) {
		error.value = err instanceof Error ? err.message : 'Failed to delete roll macro.';
	}
}

function startMinionRename(minionId: number, name: string) {
	closeMinionActionMenu();
	editingMinionId.value = minionId;
	minionRenameDraft.value = name;
}

function cancelMinionRename() {
	editingMinionId.value = null;
	minionRenameDraft.value = '';
}

async function saveMinionRename(minionId: number) {
	const name = minionRenameDraft.value.trim();
	if (!name) {
		error.value = 'Minion name cannot be empty.';
		return;
	}
	error.value = '';
	try {
		await api.character.renameMinion({ minionId, name });
		flashMessage.value = `Renamed minion to ${name}.`;
		cancelMinionRename();
		await loadLibrary();
	} catch (err: unknown) {
		error.value = err instanceof Error ? err.message : 'Failed to rename minion.';
	}
}

async function assignMinion(minionId: number) {
	closeMinionActionMenu();
	const selectedCharacterId = Number(minionAssignmentTargets.value[minionId]);
	if (!Number.isInteger(selectedCharacterId) || selectedCharacterId <= 0) {
		error.value = 'Choose a destination character first.';
		return;
	}
	error.value = '';
	try {
		await api.character.assignMinion({
			minionId,
			characterId: selectedCharacterId,
		});
		const targetName =
			characters.value.find(character => character.id === selectedCharacterId)?.name ??
			'the selected character';
		flashMessage.value = `Minion assigned to ${targetName}.`;
		await loadLibrary();
	} catch (err: unknown) {
		error.value = err instanceof Error ? err.message : 'Failed to assign minion.';
	}
}

async function toggleMinionAutoJoin(
	minionId: number,
	autoJoinInitiative: boolean,
	minionName: string
) {
	closeMinionActionMenu();
	error.value = '';
	try {
		await api.character.updateMinionAutoJoinInitiative({
			minionId,
			autoJoinInitiative: !autoJoinInitiative,
		});
		flashMessage.value = `${minionName} auto-join updated.`;
		await loadLibrary();
	} catch (err: unknown) {
		error.value = err instanceof Error ? err.message : 'Failed to update auto-join.';
	}
}

async function deleteMinion(minionId: number) {
	closeMinionActionMenu();
	if (
		!window.confirm(
			'Delete this minion? This removes its sheet and related initiative entries.'
		)
	) {
		return;
	}
	error.value = '';
	try {
		await api.character.deleteMinion({ minionId });
		flashMessage.value = 'Minion deleted from Library.';
		if (editingMinionId.value === minionId) {
			cancelMinionRename();
		}
		await loadLibrary();
	} catch (err: unknown) {
		error.value = err instanceof Error ? err.message : 'Failed to delete minion.';
	}
}

function toggleRollMacroActionMenu(rollMacroId: number) {
	closeMinionActionMenu();
	openRollMacroActionMenuId.value =
		openRollMacroActionMenuId.value === rollMacroId ? null : rollMacroId;
}

function closeRollMacroActionMenu() {
	openRollMacroActionMenuId.value = null;
}

function toggleMinionActionMenu(minionId: number) {
	closeRollMacroActionMenu();
	openMinionActionMenuId.value = openMinionActionMenuId.value === minionId ? null : minionId;
}

function closeMinionActionMenu() {
	openMinionActionMenuId.value = null;
}
</script>

<style src="../components/character-workspace/resource-section.css"></style>

<style scoped>
.library-page {
	background:
		radial-gradient(circle at top left, rgba(20, 184, 166, 0.14), transparent 23%),
		radial-gradient(circle at 80% 0%, rgba(245, 158, 11, 0.12), transparent 20%),
		linear-gradient(180deg, rgba(24, 24, 27, 0.99), rgba(9, 9, 11, 1));
	min-height: 100%;
}

.page-portrait {
	margin-bottom: 1rem;
}

.hero-panel,
.state-panel {
	padding: 1.4rem;
	margin-bottom: 1rem;
}

.hero-panel {
	display: grid;
	grid-template-columns: minmax(0, 1fr) auto;
	align-items: end;
	gap: 1rem;
}

.hero-actions {
	display: grid;
	grid-auto-flow: column;
	align-content: end;
	justify-content: end;
	gap: 0.75rem;
}

.eyebrow {
	text-transform: uppercase;
	letter-spacing: 0.16em;
	font-size: 0.72rem;
	color: #99f6e4;
	margin: 0 0 0.5rem;
}

h1,
h2 {
	margin: 0;
	color: #fafafa;
}

.lede,
.state-panel p {
	color: #d4d4d8;
}

.stat-label {
	color: #99f6e4;
}

.stat-value {
	font-size: 1.2rem;
}

.primary-link,
.primary-button {
	background: #0f766e;
	color: white;
	border-color: #0f766e;
}

.library-assignment-row {
	display: grid;
	grid-template-columns: minmax(0, 1fr) auto;
	align-items: center;
	gap: 0.65rem;
	margin-top: 0.85rem;
}

@media (max-width: 720px) {
	.hero-panel {
		grid-template-columns: 1fr;
	}

	.hero-actions {
		grid-auto-flow: row;
		justify-content: stretch;
	}

	.library-assignment-row {
		grid-template-columns: 1fr;
		align-items: stretch;
	}
}
</style>
