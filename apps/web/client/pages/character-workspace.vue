<template>
	<div class="workspace-page overflow-auto px-4 py-8">
		<main class="mx-auto max-w-6xl">
			<PageBanner :message="flashMessage" tone="success" />
			<PageBanner :message="error" tone="error" />

			<section v-if="loading" class="panel state-panel">
				<p><i class="pi pi-spin pi-spinner" /> Loading workspace...</p>
			</section>

			<LoginRequiredCard
				v-else-if="!auth.isLoggedIn"
				message="You must be logged in to open this workspace."
			/>

			<section v-else-if="!workspace" class="panel state-panel">
				<h1>Workspace not found</h1>
				<p>The character may have been deleted or does not belong to you.</p>
				<RouterLink class="primary-link" to="/characters">Back to My Characters</RouterLink>
			</section>

			<template v-else>
				<section class="panel hero-panel">
					<div class="hero-main">
						<div class="hero-topline">
							<RouterLink class="crumb-link" to="/characters"
								>My Characters</RouterLink
							>
						</div>
						<div v-if="isRenamingCharacter" class="rename-row">
							<input
								v-model="renameDraft"
								class="text-input text-input-wide"
								maxlength="100"
							/>
							<button
								class="primary-button"
								:disabled="savingHeader"
								@click="saveCharacterName"
							>
								Save
							</button>
							<button class="ghost-button" @click="cancelRenameCharacter">
								Cancel
							</button>
						</div>
						<SheetMiniPreview
							class="hero-sheet-preview"
							:name="isRenamingCharacter ? undefined : workspace.character.name"
							:summary="workspace.character.summary"
						>
							<template #actions>
								<div class="workspace-card-actions">
									<div class="workspace-action-buttons">
										<button
											class="icon-action-button icon-action-button-sheet"
											type="button"
											:aria-label="`View sheet for ${workspace.character.name}`"
											@click="openCharacterSheet"
										>
											<i class="pi pi-id-card" aria-hidden="true" />
										</button>
										<div class="minion-menu-shell">
											<button
												class="icon-action-button"
												type="button"
												:aria-expanded="openCharacterActionMenu"
												:aria-label="`More actions for ${workspace.character.name}`"
												@click="toggleCharacterActionMenu"
											>
												<span aria-hidden="true">&hellip;</span>
											</button>
											<div
												v-if="openCharacterActionMenu"
												class="minion-action-menu"
											>
												<button
													class="minion-action-menu-item"
													:disabled="
														savingHeader ||
														workspace.character.isActiveCharacter
													"
													@click="setCharacterActive"
												>
													Set Active
												</button>
												<button
													v-if="!isRenamingCharacter"
													class="minion-action-menu-item"
													:disabled="savingHeader"
													@click="startRenameCharacter"
												>
													Rename
												</button>
												<button
													class="minion-action-menu-item"
													:disabled="savingHeader"
													@click="goToImportUpdate"
												>
													Update Import
												</button>
												<button
													class="minion-action-menu-item minion-action-menu-item-danger"
													:disabled="savingHeader"
													@click="deleteCharacterWorkspace"
												>
													Delete
												</button>
											</div>
										</div>
									</div>
									<span
										v-if="workspace.character.isActiveCharacter"
										class="workspace-status-chip"
									>
										Active
									</span>
								</div>
							</template>
						</SheetMiniPreview>
						<dl class="workspace-resource-strip">
							<div>
								<dt>Actions</dt>
								<dd>
									{{
										workspace.overview.counts.localActions +
										workspace.overview.counts.inheritedActions
									}}
								</dd>
							</div>
							<div>
								<dt>Modifiers</dt>
								<dd>
									{{
										workspace.overview.counts.assignedActiveModifiers +
										workspace.overview.counts.assignedInactiveModifiers
									}}
								</dd>
							</div>
							<div>
								<dt>Macros</dt>
								<dd>
									{{
										workspace.overview.counts.localRollMacros +
										workspace.overview.counts.inheritedRollMacros
									}}
								</dd>
							</div>
							<div>
								<dt>Minions</dt>
								<dd>{{ workspace.overview.counts.assignedMinions }}</dd>
							</div>
							<div>
								<dt>Conditions</dt>
								<dd>{{ workspace.conditions.items.length }}</dd>
							</div>
						</dl>
					</div>
				</section>

				<nav class="section-nav">
					<button
						v-for="item in sections"
						:key="item.key"
						class="section-pill"
						:class="item.key === activeSection ? 'section-pill-active' : ''"
						@click="activeSection = item.key"
					>
						{{ item.label }}
					</button>
				</nav>

				<section v-if="activeSection === 'overview'" class="panel section-panel">
					<h2>Overview</h2>
					<div class="overview-pulse-grid">
						<div class="stat-card stat-card-emphasis">
							<p class="stat-label">Conditions</p>
							<p class="stat-value">
								{{ workspace.conditions.items.length }} tracked condition{{
									workspace.conditions.items.length === 1 ? '' : 's'
								}}
							</p>
							<p class="stat-copy">Current effects that may change play decisions.</p>
						</div>
						<div class="stat-card">
							<p class="stat-label">Modifier state</p>
							<p class="stat-value">
								{{ workspace.overview.counts.assignedActiveModifiers }} active ·
								{{ workspace.overview.counts.assignedInactiveModifiers }} inactive
							</p>
						</div>
						<div class="stat-card">
							<p class="stat-label">Inherited tools</p>
							<p class="stat-value">
								{{ workspace.overview.counts.inheritedActions }} actions ·
								{{ workspace.overview.counts.inheritedRollMacros }} macros
							</p>
						</div>
						<div class="stat-card">
							<p class="stat-label">Available in Library</p>
							<p class="stat-value">
								{{ workspace.overview.counts.availableLibraryModifiers }} modifiers
								· {{ workspace.overview.counts.availableLibraryMinions }} minions
							</p>
						</div>
					</div>
				</section>

				<ActionsSection
					v-else-if="activeSection === 'actions'"
					:local-actions="workspace.actions.local"
					:inherited-actions="workspace.actions.inherited"
				/>

				<ModifiersSection
					v-else-if="activeSection === 'modifiers'"
					:assigned-modifiers="assignedModifiers"
					:library-modifiers="workspace.modifiers.availableFromLibrary"
					:open-action-menu-id="openModifierActionMenuId"
					@toggle-menu="toggleModifierActionMenu"
					@toggle-modifier="toggleModifier"
				/>

				<RollMacrosSection
					v-else-if="activeSection === 'rollMacros'"
					:local-roll-macros="workspace.rollMacros.local"
					:inherited-roll-macros="workspace.rollMacros.inherited"
					:open-action-menu-id="openRollMacroActionMenuId"
					@toggle-menu="toggleRollMacroActionMenu"
					@delete="deleteRollMacro"
				/>

				<MinionsSection
					v-else-if="activeSection === 'minions'"
					v-model:minion-rename-draft="minionRenameDraft"
					:assigned-minions="workspace.minions.assigned"
					:available-minions="workspace.minions.availableFromLibrary"
					:open-action-menu-id="openMinionActionMenuId"
					:editing-minion-id="editingMinionId"
					@open-sheet="openMinionSheet"
					@toggle-menu="toggleMinionActionMenu"
					@start-rename="startMinionRename"
					@save-rename="saveMinionRename"
					@cancel-rename="cancelMinionRename"
					@toggle-auto-join="toggleMinionAutoJoin"
					@unassign="unassignMinion"
					@delete="deleteMinion"
					@assign="assignMinionToCurrentCharacter"
				/>

				<ConditionsSection v-else :conditions="workspace.conditions.items" />

				<SheetTray
					v-if="activeSheetDisplay"
					:display="activeSheetDisplay"
					@close="closeSheetTray"
				/>
			</template>
		</main>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api } from '@/api/api-client';
import ActionsSection from '@/components/character-workspace/ActionsSection.vue';
import ConditionsSection from '@/components/character-workspace/ConditionsSection.vue';
import MinionsSection from '@/components/character-workspace/MinionsSection.vue';
import ModifiersSection from '@/components/character-workspace/ModifiersSection.vue';
import RollMacrosSection from '@/components/character-workspace/RollMacrosSection.vue';
import SheetTray from '@/components/character-workspace/SheetTray.vue';
import type {
	ActiveSheetDisplay,
	CharacterWorkspace,
	MinionItem,
	ModifierAssignedItem,
	Sheet,
} from '@/components/character-workspace/types';
import LoginRequiredCard from '@/components/LoginRequiredCard.vue';
import PageBanner from '@/components/PageBanner.vue';
import SheetMiniPreview from '@/components/SheetMiniPreview.vue';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();

const workspace = ref<CharacterWorkspace | null>(null);
const loading = ref(true);
const error = ref('');
const flashMessage = ref('');
const activeSection = ref<
	'overview' | 'actions' | 'modifiers' | 'rollMacros' | 'minions' | 'conditions'
>('overview');
const isRenamingCharacter = ref(false);
const renameDraft = ref('');
const savingHeader = ref(false);
const editingMinionId = ref<number | null>(null);
const openCharacterActionMenu = ref(false);
const openRollMacroActionMenuId = ref<number | null>(null);
const openModifierActionMenuId = ref<number | null>(null);
const openMinionActionMenuId = ref<number | null>(null);
const selectedCharacterSheet = ref(false);
const selectedMinion = ref<MinionItem | null>(null);
const minionRenameDraft = ref('');

const sections = [
	{ key: 'overview', label: 'Overview' },
	{ key: 'actions', label: 'Actions' },
	{ key: 'modifiers', label: 'Modifiers' },
	{ key: 'rollMacros', label: 'Roll Macros' },
	{ key: 'minions', label: 'Minions' },
	{ key: 'conditions', label: 'Conditions' },
] as const;

const characterId = computed(() => Number(route.params.characterId));
const assignedModifiers = computed(() => {
	if (!workspace.value) return [];
	return [
		...workspace.value.modifiers.assignedActive,
		...workspace.value.modifiers.assignedInactive,
	];
});

const activeSheetDisplay = computed<ActiveSheetDisplay | null>(() => {
	if (selectedCharacterSheet.value && workspace.value) {
		const sheet = workspace.value.character.sheet;
		return {
			id: `character-${workspace.value.character.id}`,
			titleId: `character-sheet-title-${workspace.value.character.id}`,
			eyebrow: 'Character Sheet',
			name: workspace.value.character.name,
			identityLine: sheetIdentityLine(sheet),
			summary: workspace.value.character.summary,
			sheet,
			resourceCounts: {
				actions:
					workspace.value.overview.counts.localActions +
					workspace.value.overview.counts.inheritedActions,
				modifiers:
					workspace.value.overview.counts.assignedActiveModifiers +
					workspace.value.overview.counts.assignedInactiveModifiers,
				macros:
					workspace.value.overview.counts.localRollMacros +
					workspace.value.overview.counts.inheritedRollMacros,
			},
		};
	}
	if (!selectedMinion.value) return null;
	const minion = selectedMinion.value;
	const sheet: Sheet = minion.payload.sheetRecord.sheet;
	return {
		id: `minion-${minion.meta.id}`,
		titleId: `minion-sheet-title-${minion.meta.id}`,
		eyebrow: 'Minion Sheet',
		name: minion.payload.name,
		identityLine: sheetIdentityLine(sheet),
		summary: minion.summary,
		sheet,
		resourceCounts: {
			actions: minion.payload.actions.length,
			modifiers: minion.payload.modifiers.length,
			macros: minion.payload.rollMacros.length,
		},
	};
});

onMounted(async () => {
	if (!auth.loaded) {
		await auth.fetchUser();
	}
	if (auth.isLoggedIn) {
		await loadWorkspace();
	} else {
		loading.value = false;
	}
});

watch(
	() => route.params.characterId,
	async () => {
		if (auth.isLoggedIn) {
			await loadWorkspace();
		}
	}
);

function seedWorkspaceState() {
	if (!workspace.value) return;
	renameDraft.value = workspace.value.character.name;
	editingMinionId.value = null;
	openCharacterActionMenu.value = false;
	openRollMacroActionMenuId.value = null;
	openModifierActionMenuId.value = null;
	openMinionActionMenuId.value = null;
	selectedCharacterSheet.value = false;
	selectedMinion.value = null;
	minionRenameDraft.value = '';
	if (!sections.some(section => section.key === activeSection.value)) {
		activeSection.value = 'overview';
	}
}

async function loadWorkspace() {
	loading.value = true;
	error.value = '';
	try {
		const result = await api.character.getCharacterWorkspace({
			characterId: characterId.value,
		});
		workspace.value = result;
		seedWorkspaceState();
	} catch (err: unknown) {
		error.value = err instanceof Error ? err.message : 'Failed to load workspace.';
		workspace.value = null;
	} finally {
		loading.value = false;
	}
}

function startRenameCharacter() {
	closeCharacterActionMenu();
	isRenamingCharacter.value = true;
	renameDraft.value = workspace.value?.character.name ?? '';
}

function cancelRenameCharacter() {
	isRenamingCharacter.value = false;
	renameDraft.value = workspace.value?.character.name ?? '';
}

async function saveCharacterName() {
	if (!workspace.value) return;
	const name = renameDraft.value.trim();
	if (!name) {
		error.value = 'Character name cannot be empty.';
		return;
	}
	savingHeader.value = true;
	error.value = '';
	try {
		await api.character.renameCharacter({ characterId: workspace.value.character.id, name });
		flashMessage.value = `Renamed character to ${name}.`;
		isRenamingCharacter.value = false;
		await loadWorkspace();
	} catch (err: unknown) {
		error.value = err instanceof Error ? err.message : 'Failed to rename character.';
	} finally {
		savingHeader.value = false;
	}
}

async function setCharacterActive() {
	if (!workspace.value) return;
	closeCharacterActionMenu();
	savingHeader.value = true;
	error.value = '';
	try {
		await api.character.setActiveCharacter({ characterId: workspace.value.character.id });
		flashMessage.value = `${workspace.value.character.name} is now active.`;
		await loadWorkspace();
	} catch (err: unknown) {
		error.value = err instanceof Error ? err.message : 'Failed to set active character.';
	} finally {
		savingHeader.value = false;
	}
}

function goToImportUpdate() {
	closeCharacterActionMenu();
	router.push({ name: 'import-character', query: { characterId: String(characterId.value) } });
}

async function deleteCharacterWorkspace() {
	if (!workspace.value) return;
	closeCharacterActionMenu();
	if (
		!window.confirm(
			`Delete ${workspace.value.character.name}? This removes the workspace and related sheet.`
		)
	) {
		return;
	}
	savingHeader.value = true;
	error.value = '';
	try {
		await api.character.deleteCharacter({ characterId: workspace.value.character.id });
		router.push('/characters');
	} catch (err: unknown) {
		error.value = err instanceof Error ? err.message : 'Failed to delete character.';
	} finally {
		savingHeader.value = false;
	}
}

async function toggleModifier(modifier: ModifierAssignedItem) {
	closeModifierActionMenu();
	error.value = '';
	try {
		await api.character.updateModifierState({
			modifierId: modifier.meta.id,
			isActive: !modifier.payload.isActive,
		});
		flashMessage.value = `${modifier.payload.name} was updated.`;
		await loadWorkspace();
	} catch (err: unknown) {
		error.value = err instanceof Error ? err.message : 'Failed to update modifier state.';
	}
}

async function deleteRollMacro(rollMacroId: number) {
	closeRollMacroActionMenu();
	if (!window.confirm('Delete this roll macro?')) return;
	error.value = '';
	try {
		await api.character.deleteRollMacro({ rollMacroId });
		flashMessage.value = 'Roll macro deleted.';
		await loadWorkspace();
	} catch (err: unknown) {
		error.value = err instanceof Error ? err.message : 'Failed to delete roll macro.';
	}
}

function startMinionRename(input: unknown) {
	const minion = input as MinionItem;
	closeMinionActionMenu();
	editingMinionId.value = minion.meta.id;
	minionRenameDraft.value = minion.payload.name;
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
		await loadWorkspace();
	} catch (err: unknown) {
		error.value = err instanceof Error ? err.message : 'Failed to rename minion.';
	}
}

async function assignMinionToCurrentCharacter(minionId: number) {
	if (!workspace.value) return;
	closeMinionActionMenu();
	error.value = '';
	try {
		await api.character.assignMinion({
			minionId,
			characterId: workspace.value.character.id,
		});
		flashMessage.value = 'Minion assigned to this character.';
		await loadWorkspace();
	} catch (err: unknown) {
		error.value = err instanceof Error ? err.message : 'Failed to assign minion.';
	}
}

async function unassignMinion(minionId: number) {
	closeMinionActionMenu();
	if (!window.confirm('Return this minion to Library?')) return;
	error.value = '';
	try {
		await api.character.unassignMinion({ minionId });
		flashMessage.value = 'Minion returned to Library.';
		await loadWorkspace();
	} catch (err: unknown) {
		error.value = err instanceof Error ? err.message : 'Failed to unassign minion.';
	}
}

async function toggleMinionAutoJoin(input: unknown) {
	const minion = input as MinionItem;
	closeMinionActionMenu();
	error.value = '';
	try {
		await api.character.updateMinionAutoJoinInitiative({
			minionId: minion.meta.id,
			autoJoinInitiative: !minion.summary.autoJoinInitiative,
		});
		flashMessage.value = `${minion.payload.name} auto-join updated.`;
		await loadWorkspace();
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
		flashMessage.value = 'Minion deleted.';
		if (editingMinionId.value === minionId) {
			cancelMinionRename();
		}
		await loadWorkspace();
	} catch (err: unknown) {
		error.value = err instanceof Error ? err.message : 'Failed to delete minion.';
	}
}

function openMinionSheet(input: unknown) {
	const minion = input as MinionItem;
	closeCharacterActionMenu();
	closeRollMacroActionMenu();
	closeModifierActionMenu();
	closeMinionActionMenu();
	selectedCharacterSheet.value = false;
	selectedMinion.value = minion;
}

function openCharacterSheet() {
	closeCharacterActionMenu();
	closeRollMacroActionMenu();
	closeModifierActionMenu();
	closeMinionActionMenu();
	selectedMinion.value = null;
	selectedCharacterSheet.value = true;
}

function closeSheetTray() {
	selectedCharacterSheet.value = false;
	selectedMinion.value = null;
}

function toggleCharacterActionMenu() {
	closeRollMacroActionMenu();
	closeModifierActionMenu();
	closeMinionActionMenu();
	openCharacterActionMenu.value = !openCharacterActionMenu.value;
}

function closeCharacterActionMenu() {
	openCharacterActionMenu.value = false;
}

function toggleRollMacroActionMenu(rollMacroId: number) {
	closeCharacterActionMenu();
	closeModifierActionMenu();
	closeMinionActionMenu();
	openRollMacroActionMenuId.value =
		openRollMacroActionMenuId.value === rollMacroId ? null : rollMacroId;
}

function closeRollMacroActionMenu() {
	openRollMacroActionMenuId.value = null;
}

function toggleModifierActionMenu(modifierId: number) {
	closeCharacterActionMenu();
	closeRollMacroActionMenu();
	closeMinionActionMenu();
	openModifierActionMenuId.value =
		openModifierActionMenuId.value === modifierId ? null : modifierId;
}

function closeModifierActionMenu() {
	openModifierActionMenuId.value = null;
}

function toggleMinionActionMenu(minionId: number) {
	closeCharacterActionMenu();
	closeRollMacroActionMenu();
	closeModifierActionMenu();
	openMinionActionMenuId.value = openMinionActionMenuId.value === minionId ? null : minionId;
}

function closeMinionActionMenu() {
	openMinionActionMenuId.value = null;
}

function sheetIdentityLine(sheet: Sheet) {
	const parts = [`Level ${sheet.staticInfo.level ?? 'Unknown'}`];
	if (sheet.info.class) parts.push(sheet.info.class);
	if (sheet.info.ancestry) parts.push(sheet.info.ancestry);
	return parts.join(' · ');
}
</script>

<style src="../components/character-workspace/resource-section.css"></style>

<style scoped>
.workspace-page {
	background:
		radial-gradient(circle at top left, rgba(59, 130, 246, 0.17), transparent 25%),
		radial-gradient(circle at 85% 0%, rgba(249, 115, 22, 0.1), transparent 22%),
		linear-gradient(180deg, rgba(24, 24, 27, 0.99), rgba(9, 9, 11, 1));
	min-height: 100%;
}

.hero-panel,
.state-panel {
	padding: 1.4rem;
	margin-bottom: 1rem;
}

.hero-panel {
	position: relative;
	display: grid;
	gap: 0.9rem;
}

.hero-main {
	display: grid;
	gap: 0.75rem;
	min-width: 0;
}

.hero-topline,
.section-nav {
	display: flex;
	gap: 0.75rem;
	flex-wrap: wrap;
	align-items: center;
}

.hero-topline {
	justify-content: space-between;
}

.crumb-link {
	text-decoration: none;
}

.section-nav {
	margin-bottom: 1rem;
	overflow-x: auto;
	padding-bottom: 0.35rem;
}

.section-pill {
	border-radius: 999px;
	padding: 0.65rem 0.95rem;
	border: 1px solid rgba(82, 82, 91, 1);
	background: rgba(24, 24, 27, 0.9);
	color: #d4d4d8;
	font-weight: 600;
	cursor: pointer;
}

.section-pill-active {
	background: #1d4ed8;
	border-color: #1d4ed8;
	color: white;
}

h1,
.subtle-copy,
.state-panel p {
	color: #d4d4d8;
}

.subtle-copy {
	margin-top: 0.6rem;
	max-width: 56rem;
	line-height: 1.5;
}

.stat-card-emphasis {
	border-color: rgba(96, 165, 250, 0.38);
	background:
		radial-gradient(circle at top left, rgba(37, 99, 235, 0.14), transparent 44%),
		rgba(24, 24, 27, 0.82);
}

.workspace-card-actions {
	display: flex;
	flex-direction: column;
	gap: 0.45rem;
	align-items: flex-end;
}

.workspace-action-buttons {
	display: flex;
	gap: 0.35rem;
	align-items: center;
	justify-content: flex-end;
}

.workspace-status-chip {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	padding: 0.22rem 0.55rem;
	border-radius: 999px;
	background: rgba(37, 99, 235, 0.18);
	color: #bfdbfe;
	font-size: 0.7rem;
	font-weight: 700;
	letter-spacing: 0.07em;
	text-transform: uppercase;
	white-space: nowrap;
}

.workspace-resource-strip {
	display: grid;
	grid-template-columns: repeat(5, minmax(0, 1fr));
	margin: 0;
	padding: 0.45rem 0.25rem;
	border: 1px solid rgba(63, 63, 70, 0.46);
	border-radius: 0.75rem;
	background: rgba(24, 24, 27, 0.38);
}

.workspace-resource-strip div {
	display: grid;
	gap: 0.1rem;
	justify-items: center;
	padding: 0.05rem 0.45rem;
	text-align: center;
}

.workspace-resource-strip div + div {
	border-left: 1px solid rgba(63, 63, 70, 0.45);
}

.workspace-resource-strip dt {
	color: #a1a1aa;
	font-size: 0.68rem;
	line-height: 1.1;
}

.workspace-resource-strip dd {
	margin: 0;
	color: #e4e4e7;
	font-size: 0.95rem;
	font-weight: 700;
	line-height: 1.1;
}

.text-input-wide {
	max-width: 28rem;
}

@media (max-width: 720px) {
	.hero-panel,
	.state-panel {
		padding: 1.1rem;
	}

	.section-nav {
		gap: 0.5rem;
	}

	.section-pill {
		white-space: nowrap;
	}
}
</style>
