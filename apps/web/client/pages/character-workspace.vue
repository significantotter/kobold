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
							<ScopeBadge variant="scope-character">
								{{ workspace.character.isActiveCharacter ? 'Active' : 'Character' }}
							</ScopeBadge>
							<ScopeBadge variant="scope-library">
								{{ importSourceLabel(workspace.character.importSource) }}
							</ScopeBadge>
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
						<template v-else>
							<h1>{{ workspace.character.name }}</h1>
						</template>
						<p class="lede">
							Level {{ workspace.character.summary.level ?? 'Unknown' }}
							<span v-if="workspace.character.summary.ancestry">
								· {{ workspace.character.summary.ancestry }}
							</span>
							<span v-if="workspace.character.summary.class">
								· {{ workspace.character.summary.class }}
							</span>
						</p>
						<p class="subtle-copy">
							Overview is scoped for quick upkeep. Actions remain inspect-first;
							modifiers, roll macros, and imports are the first editable MVP surfaces.
						</p>
					</div>
					<div class="hero-actions">
						<button
							class="secondary-button"
							:disabled="savingHeader || workspace.character.isActiveCharacter"
							@click="setCharacterActive"
						>
							Set Active
						</button>
						<button
							v-if="!isRenamingCharacter"
							class="ghost-button"
							:disabled="savingHeader"
							@click="startRenameCharacter"
						>
							Rename
						</button>
						<button
							class="ghost-button"
							:disabled="savingHeader"
							@click="goToImportUpdate"
						>
							Update Import
						</button>
						<RouterLink class="secondary-link" to="/library">Open Library</RouterLink>
						<button
							class="danger-button"
							:disabled="savingHeader"
							@click="deleteCharacterWorkspace"
						>
							Delete
						</button>
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
					<div class="overview-grid">
						<div class="stat-card">
							<p class="stat-label">Attached modifiers</p>
							<p class="stat-value">
								{{ workspace.overview.counts.assignedActiveModifiers }} active ·
								{{ workspace.overview.counts.assignedInactiveModifiers }} inactive
							</p>
						</div>
						<div class="stat-card">
							<p class="stat-label">Visible actions</p>
							<p class="stat-value">
								{{ workspace.overview.counts.localActions }} local ·
								{{ workspace.overview.counts.inheritedActions }} inherited
							</p>
						</div>
						<div class="stat-card">
							<p class="stat-label">Roll macros</p>
							<p class="stat-value">
								{{ workspace.overview.counts.localRollMacros }} local ·
								{{ workspace.overview.counts.inheritedRollMacros }} inherited
							</p>
						</div>
						<div class="stat-card">
							<p class="stat-label">Minions</p>
							<p class="stat-value">
								{{ workspace.overview.counts.assignedMinions }} assigned ·
								{{ workspace.overview.counts.availableLibraryMinions }} available in
								library
							</p>
						</div>
						<div class="stat-card stat-card-wide">
							<p class="stat-label">Conditions</p>
							<p class="stat-value">
								{{ workspace.conditions.items.length }} tracked condition{{
									workspace.conditions.items.length === 1 ? '' : 's'
								}}
							</p>
							<p class="stat-copy">
								This summary answers what affects the character right now without
								opening a full sheet editor.
							</p>
						</div>
					</div>
				</section>

				<section v-else-if="activeSection === 'actions'" class="panel section-panel">
					<h2>Actions</h2>
					<div class="split-sections">
						<div>
							<h3>Local to this character</h3>
							<p v-if="workspace.actions.local.length === 0" class="empty-copy">
								No local actions surfaced here yet.
							</p>
							<div v-else class="resource-list">
								<article
									v-for="action in workspace.actions.local"
									:key="action.meta.id"
									class="resource-card"
								>
									<div class="resource-head">
										<strong>{{ action.payload.name }}</strong>
										<span class="scope-badge scope-character">Character</span>
									</div>
									<p class="resource-copy">
										{{ action.payload.description || 'No description.' }}
									</p>
								</article>
							</div>
						</div>
						<div>
							<h3>Inherited from Library</h3>
							<p v-if="workspace.actions.inherited.length === 0" class="empty-copy">
								No library actions are inherited here yet.
							</p>
							<div v-else class="resource-list">
								<article
									v-for="action in workspace.actions.inherited"
									:key="action.meta.id"
									class="resource-card resource-card-muted"
								>
									<div class="resource-head">
										<strong>{{ action.payload.name }}</strong>
										<RouterLink
											class="scope-badge scope-library scope-badge-link"
											to="/library"
										>
											Inherited
										</RouterLink>
									</div>
									<p class="resource-copy">
										{{ action.payload.description || 'Shared from Library.' }}
									</p>
								</article>
							</div>
						</div>
					</div>
				</section>

				<section v-else-if="activeSection === 'modifiers'" class="panel section-panel">
					<h2>Modifiers</h2>
					<div class="split-sections">
						<div>
							<h3>Assigned to this character</h3>
							<p v-if="assignedModifiers.length === 0" class="empty-copy">
								No assigned modifiers on this character.
							</p>
							<div v-else class="resource-list">
								<article
									v-for="modifier in assignedModifiers"
									:key="modifier.meta.id"
									class="resource-card"
								>
									<div class="resource-head resource-head-stacked">
										<div>
											<strong>{{ modifier.payload.name }}</strong>
											<div class="badge-row">
												<span class="scope-badge scope-character"
													>Character</span
												>
												<span
													class="scope-badge"
													:class="
														modifier.payload.isActive
															? 'scope-active'
															: 'scope-library'
													"
												>
													{{
														modifier.payload.isActive
															? 'Active'
															: 'Inactive'
													}}
												</span>
											</div>
										</div>
										<div class="modifier-actions">
											<button
												class="secondary-button"
												@click="toggleModifier(modifier)"
											>
												{{
													modifier.payload.isActive
														? 'Deactivate'
														: 'Activate'
												}}
											</button>
										</div>
									</div>
									<p class="resource-copy">
										{{
											modifier.payload.description ||
											modifier.payload.note ||
											'No description.'
										}}
									</p>
									<div class="severity-row">
										<label :for="`severity-${modifier.meta.id}`"
											>Severity</label
										>
										<input
											:id="`severity-${modifier.meta.id}`"
											v-model="severityDrafts[modifier.meta.id]"
											type="number"
											class="text-input severity-input"
										/>
										<button
											class="ghost-button"
											@click="saveModifierSeverity(modifier)"
										>
											Save severity
										</button>
									</div>
								</article>
							</div>
						</div>
						<div>
							<h3>Available from Library</h3>
							<p
								v-if="workspace.modifiers.availableFromLibrary.length === 0"
								class="empty-copy"
							>
								No unassigned library modifiers are available.
							</p>
							<div v-else class="resource-list">
								<article
									v-for="modifier in workspace.modifiers.availableFromLibrary"
									:key="modifier.meta.id"
									class="resource-card resource-card-muted"
								>
									<div class="resource-head">
										<strong>{{ modifier.payload.name }}</strong>
										<RouterLink
											class="scope-badge scope-library scope-badge-link"
											to="/library"
										>
											Unassigned
										</RouterLink>
									</div>
									<p class="resource-copy">
										{{
											modifier.payload.description ||
											'Stored in Library and inactive until assignment.'
										}}
									</p>
								</article>
							</div>
						</div>
					</div>
				</section>

				<section v-else-if="activeSection === 'rollMacros'" class="panel section-panel">
					<h2>Roll Macros</h2>
					<div class="split-sections">
						<div>
							<h3>Local to this character</h3>
							<form class="editor-card" @submit.prevent="createCharacterRollMacro">
								<label>
									<span>Name</span>
									<input
										v-model="newRollMacro.name"
										class="text-input"
										maxlength="100"
									/>
								</label>
								<label>
									<span>Macro</span>
									<textarea
										v-model="newRollMacro.macro"
										class="text-area"
										rows="3"
										maxlength="500"
									/>
								</label>
								<button class="primary-button" type="submit">
									Create roll macro
								</button>
							</form>
							<p v-if="workspace.rollMacros.local.length === 0" class="empty-copy">
								No local roll macros yet.
							</p>
							<div v-else class="resource-list">
								<article
									v-for="rollMacro in workspace.rollMacros.local"
									:key="rollMacro.meta.id"
									class="resource-card"
								>
									<div class="resource-head resource-head-stacked">
										<div class="badge-row">
											<strong>{{ rollMacro.payload.name }}</strong>
											<span class="scope-badge scope-character"
												>Character</span
											>
										</div>
										<div class="card-actions">
											<button
												class="ghost-button"
												@click="startRollMacroEdit(rollMacro)"
											>
												Edit
											</button>
											<button
												class="danger-button"
												@click="deleteRollMacro(rollMacro.meta.id)"
											>
												Delete
											</button>
										</div>
									</div>
									<template v-if="editingRollMacroId === rollMacro.meta.id">
										<div class="editor-card compact-editor">
											<input
												v-model="rollMacroDraft.name"
												class="text-input"
												maxlength="100"
											/>
											<textarea
												v-model="rollMacroDraft.macro"
												class="text-area"
												rows="3"
												maxlength="500"
											/>
											<div class="card-actions">
												<button
													class="primary-button"
													@click="saveRollMacroEdit(rollMacro.meta.id)"
												>
													Save
												</button>
												<button
													class="ghost-button"
													@click="cancelRollMacroEdit"
												>
													Cancel
												</button>
											</div>
										</div>
									</template>
									<template v-else>
										<p class="macro-preview">{{ rollMacro.payload.macro }}</p>
									</template>
								</article>
							</div>
						</div>
						<div>
							<h3>Inherited from Library</h3>
							<p
								v-if="workspace.rollMacros.inherited.length === 0"
								class="empty-copy"
							>
								No shared roll macros are inherited here yet.
							</p>
							<div v-else class="resource-list">
								<article
									v-for="rollMacro in workspace.rollMacros.inherited"
									:key="rollMacro.meta.id"
									class="resource-card resource-card-muted"
								>
									<div class="resource-head">
										<strong>{{ rollMacro.payload.name }}</strong>
										<RouterLink
											class="scope-badge scope-library scope-badge-link"
											to="/library"
										>
											Inherited
										</RouterLink>
									</div>
									<p class="macro-preview">{{ rollMacro.payload.macro }}</p>
								</article>
							</div>
						</div>
					</div>
				</section>

				<section v-else-if="activeSection === 'minions'" class="panel section-panel">
					<h2>Minions</h2>
					<div class="split-sections">
						<div>
							<h3>Assigned to this character</h3>
							<p v-if="workspace.minions.assigned.length === 0" class="empty-copy">
								No minions are assigned here.
							</p>
							<div v-else class="resource-list">
								<article
									v-for="minion in workspace.minions.assigned"
									:key="minion.meta.id"
									class="resource-card"
								>
									<div class="resource-head">
										<div>
											<div
												v-if="editingMinionId === minion.meta.id"
												class="rename-row"
											>
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
												<button
													class="ghost-button"
													@click="cancelMinionRename"
												>
													Cancel
												</button>
											</div>
											<template v-else>
												<strong>{{ minion.payload.name }}</strong>
											</template>
											<div class="badge-row mt-2">
												<span class="scope-badge scope-character"
													>Assigned</span
												>
												<span
													v-if="minion.summary.autoJoinInitiative"
													class="scope-badge scope-active"
												>
													Auto-Join
												</span>
											</div>
										</div>
										<div class="card-actions">
											<button
												v-if="editingMinionId !== minion.meta.id"
												class="ghost-button"
												@click="startMinionRename(minion)"
											>
												Rename
											</button>
											<button
												class="secondary-button"
												@click="toggleMinionAutoJoin(minion)"
											>
												{{
													minion.summary.autoJoinInitiative
														? 'Disable Auto-Join'
														: 'Enable Auto-Join'
												}}
											</button>
											<button
												class="ghost-button"
												@click="unassignMinion(minion.meta.id)"
											>
												Unassign
											</button>
											<button
												class="danger-button"
												@click="deleteMinion(minion.meta.id)"
											>
												Delete
											</button>
										</div>
									</div>
									<p class="resource-copy">
										Level {{ minion.summary.level ?? 'Unknown' }}
										<span v-if="minion.summary.ancestry">
											· {{ minion.summary.ancestry }}</span
										>
										<span v-if="minion.summary.class">
											· {{ minion.summary.class }}</span
										>
									</p>
								</article>
							</div>
						</div>
						<div>
							<h3>Available from Library</h3>
							<p
								v-if="workspace.minions.availableFromLibrary.length === 0"
								class="empty-copy"
							>
								No unassigned minions are available.
							</p>
							<div v-else class="resource-list">
								<article
									v-for="minion in workspace.minions.availableFromLibrary"
									:key="minion.meta.id"
									class="resource-card resource-card-muted"
								>
									<div class="resource-head">
										<div>
											<strong>{{ minion.payload.name }}</strong>
											<div class="badge-row mt-2">
												<RouterLink
													class="scope-badge scope-library scope-badge-link"
													to="/library"
												>
													Library
												</RouterLink>
												<span
													v-if="minion.summary.autoJoinInitiative"
													class="scope-badge scope-active"
												>
													Auto-Join
												</span>
											</div>
										</div>
										<button
											class="primary-button"
											@click="assignMinionToCurrentCharacter(minion.meta.id)"
										>
											Assign here
										</button>
									</div>
									<p class="resource-copy">
										Move this minion out of Library and attach it to this
										character.
									</p>
								</article>
							</div>
						</div>
					</div>
				</section>

				<section v-else class="panel section-panel">
					<h2>Conditions</h2>
					<p v-if="workspace.conditions.items.length === 0" class="empty-copy">
						No active conditions recorded on this sheet.
					</p>
					<div v-else class="resource-list">
						<article
							v-for="(condition, index) in workspace.conditions.items"
							:key="`${condition.name}-${index}`"
							class="resource-card"
						>
							<div class="resource-head">
								<strong>{{ condition.name }}</strong>
								<span class="scope-badge scope-character">Condition</span>
							</div>
							<p class="resource-copy">
								{{ condition.description || 'No description.' }}
							</p>
						</article>
					</div>
				</section>
			</template>
		</main>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api } from '@/api/api-client';
import LoginRequiredCard from '@/components/LoginRequiredCard.vue';
import PageBanner from '@/components/PageBanner.vue';
import ScopeBadge from '@/components/ScopeBadge.vue';
import { useAuthStore } from '@/stores/auth';

type CharacterWorkspace = NonNullable<
	Awaited<ReturnType<typeof api.character.getCharacterWorkspace>>
>;
type ModifierItem = CharacterWorkspace['modifiers']['assignedActive'][number];
type RollMacroItem = CharacterWorkspace['rollMacros']['local'][number];
type MinionItem = CharacterWorkspace['minions']['assigned'][number];

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
const severityDrafts = ref<Record<number, string>>({});
const newRollMacro = ref({ name: '', macro: '' });
const editingRollMacroId = ref<number | null>(null);
const rollMacroDraft = ref({ name: '', macro: '' });
const editingMinionId = ref<number | null>(null);
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

function importSourceLabel(importSource: string) {
	if (importSource === 'pathbuilder') return 'Pathbuilder';
	if (importSource === 'wg') return "Wanderer's Guide";
	return importSource;
}

function seedWorkspaceState() {
	if (!workspace.value) return;
	renameDraft.value = workspace.value.character.name;
	severityDrafts.value = Object.fromEntries(
		assignedModifiers.value.map(modifier => [
			modifier.meta.id,
			modifier.payload.severity === null ? '' : String(modifier.payload.severity),
		])
	);
	editingRollMacroId.value = null;
	rollMacroDraft.value = { name: '', macro: '' };
	newRollMacro.value = { name: '', macro: '' };
	editingMinionId.value = null;
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
	router.push({ name: 'import-character', query: { characterId: String(characterId.value) } });
}

async function deleteCharacterWorkspace() {
	if (!workspace.value) return;
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

async function toggleModifier(modifier: ModifierItem) {
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

async function saveModifierSeverity(modifier: ModifierItem) {
	const raw = severityDrafts.value[modifier.meta.id] ?? '';
	const severity = raw === '' ? null : Number(raw);
	if (severity !== null && Number.isNaN(severity)) {
		error.value = 'Severity must be a number or blank.';
		return;
	}
	error.value = '';
	try {
		await api.character.updateModifierState({
			modifierId: modifier.meta.id,
			severity,
		});
		flashMessage.value = `${modifier.payload.name} severity updated.`;
		await loadWorkspace();
	} catch (err: unknown) {
		error.value = err instanceof Error ? err.message : 'Failed to update modifier severity.';
	}
}

async function createCharacterRollMacro() {
	if (!workspace.value) return;
	if (!newRollMacro.value.name.trim() || !newRollMacro.value.macro.trim()) {
		error.value = 'Provide both a roll macro name and macro value.';
		return;
	}
	error.value = '';
	try {
		await api.character.createRollMacro({
			characterId: workspace.value.character.id,
			name: newRollMacro.value.name.trim(),
			macro: newRollMacro.value.macro.trim(),
		});
		flashMessage.value = `Created ${newRollMacro.value.name.trim()}.`;
		await loadWorkspace();
	} catch (err: unknown) {
		error.value = err instanceof Error ? err.message : 'Failed to create roll macro.';
	}
}

function startRollMacroEdit(rollMacro: RollMacroItem) {
	editingRollMacroId.value = rollMacro.meta.id;
	rollMacroDraft.value = {
		name: rollMacro.payload.name,
		macro: rollMacro.payload.macro,
	};
}

function cancelRollMacroEdit() {
	editingRollMacroId.value = null;
	rollMacroDraft.value = { name: '', macro: '' };
}

async function saveRollMacroEdit(rollMacroId: number) {
	if (!rollMacroDraft.value.name.trim() || !rollMacroDraft.value.macro.trim()) {
		error.value = 'Provide both a roll macro name and macro value.';
		return;
	}
	error.value = '';
	try {
		await api.character.updateRollMacro({
			rollMacroId,
			name: rollMacroDraft.value.name.trim(),
			macro: rollMacroDraft.value.macro.trim(),
		});
		flashMessage.value = `Updated ${rollMacroDraft.value.name.trim()}.`;
		cancelRollMacroEdit();
		await loadWorkspace();
	} catch (err: unknown) {
		error.value = err instanceof Error ? err.message : 'Failed to update roll macro.';
	}
}

async function deleteRollMacro(rollMacroId: number) {
	if (!window.confirm('Delete this roll macro?')) return;
	error.value = '';
	try {
		await api.character.deleteRollMacro({ rollMacroId });
		flashMessage.value = 'Roll macro deleted.';
		if (editingRollMacroId.value === rollMacroId) {
			cancelRollMacroEdit();
		}
		await loadWorkspace();
	} catch (err: unknown) {
		error.value = err instanceof Error ? err.message : 'Failed to delete roll macro.';
	}
}

function startMinionRename(minion: MinionItem) {
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

async function toggleMinionAutoJoin(minion: MinionItem) {
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
</script>

<style scoped>
.workspace-page {
	background:
		radial-gradient(circle at top left, rgba(59, 130, 246, 0.17), transparent 25%),
		radial-gradient(circle at 85% 0%, rgba(249, 115, 22, 0.1), transparent 22%),
		linear-gradient(180deg, rgba(24, 24, 27, 0.99), rgba(9, 9, 11, 1));
	min-height: 100%;
}

.panel,
.banner,
.resource-card,
.editor-card,
.stat-card {
	border: 1px solid rgba(63, 63, 70, 0.88);
	background: rgba(24, 24, 27, 0.82);
	backdrop-filter: blur(10px);
	border-radius: 1rem;
	box-shadow: 0 22px 45px rgba(0, 0, 0, 0.24);
}

.banner {
	padding: 0.9rem 1rem;
	margin-bottom: 1rem;
}

.banner-success {
	color: #bbf7d0;
	border-color: rgba(22, 163, 74, 0.55);
}

.banner-error {
	color: #fecaca;
	border-color: rgba(220, 38, 38, 0.55);
}

.hero-panel,
.section-panel,
.state-panel {
	padding: 1.4rem;
	margin-bottom: 1rem;
}

.hero-panel {
	display: flex;
	justify-content: space-between;
	gap: 1rem;
	flex-wrap: wrap;
}

.hero-main {
	flex: 1;
	min-width: 260px;
}

.hero-topline,
.hero-actions,
.section-nav,
.badge-row,
.card-actions,
.resource-head,
.modifier-actions,
.severity-row,
.split-sections,
.rename-row {
	display: flex;
	gap: 0.75rem;
	flex-wrap: wrap;
	align-items: center;
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

.crumb-link,
.primary-link,
.secondary-link,
.scope-badge-link {
	text-decoration: none;
}

.primary-link,
.secondary-link,
.primary-button,
.secondary-button,
.ghost-button,
.danger-button {
	border-radius: 999px;
	padding: 0.7rem 1rem;
	border: 1px solid transparent;
	font-weight: 600;
	cursor: pointer;
	transition:
		background 0.16s ease,
		border-color 0.16s ease,
		color 0.16s ease;
}

.primary-link,
.primary-button {
	background: #2563eb;
	color: white;
	border-color: #2563eb;
}

.secondary-link,
.secondary-button {
	background: rgba(39, 39, 42, 0.88);
	color: #f4f4f5;
	border-color: rgba(82, 82, 91, 1);
}

.ghost-button {
	background: transparent;
	color: #d4d4d8;
	border-color: rgba(82, 82, 91, 1);
}

.danger-button {
	background: rgba(127, 29, 29, 0.4);
	color: #fca5a5;
	border-color: rgba(185, 28, 28, 0.65);
}

.scope-badge {
	display: inline-flex;
	align-items: center;
	padding: 0.25rem 0.55rem;
	border-radius: 999px;
	font-size: 0.72rem;
	font-weight: 700;
	letter-spacing: 0.04em;
	text-transform: uppercase;
}

.scope-character {
	background: rgba(37, 99, 235, 0.2);
	color: #bfdbfe;
}

.scope-library {
	background: rgba(82, 82, 91, 0.4);
	color: #e4e4e7;
}

.scope-active {
	background: rgba(22, 163, 74, 0.22);
	color: #bbf7d0;
}

h1,
h2,
h3,
strong {
	color: #fafafa;
	margin: 0;
}

.lede,
.subtle-copy,
.resource-copy,
.empty-copy,
.stat-copy,
.macro-preview,
.state-panel p {
	color: #d4d4d8;
}

.subtle-copy {
	margin-top: 0.6rem;
	max-width: 56rem;
	line-height: 1.5;
}

.overview-grid,
.resource-list {
	display: grid;
	gap: 0.85rem;
}

.overview-grid {
	grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
	margin-top: 1rem;
}

.stat-card {
	padding: 1rem;
}

.stat-card-wide {
	grid-column: 1 / -1;
}

.stat-label {
	margin: 0 0 0.35rem;
	font-size: 0.82rem;
	text-transform: uppercase;
	letter-spacing: 0.12em;
	color: #93c5fd;
}

.stat-value {
	margin: 0;
	font-size: 1.1rem;
	font-weight: 700;
}

.split-sections {
	align-items: stretch;
	gap: 1rem;
}

.split-sections > div {
	flex: 1 1 280px;
	min-width: 0;
}

.resource-card,
.editor-card {
	padding: 1rem;
}

.resource-card-muted {
	background: rgba(39, 39, 42, 0.66);
}

.resource-head {
	justify-content: space-between;
	align-items: start;
	margin-bottom: 0.6rem;
}

.resource-head-stacked {
	align-items: start;
}

.editor-card {
	display: grid;
	gap: 0.75rem;
	margin-bottom: 1rem;
}

.compact-editor {
	margin-top: 0.75rem;
	margin-bottom: 0;
}

label {
	display: grid;
	gap: 0.35rem;
	color: #e4e4e7;
	font-size: 0.92rem;
}

.text-input,
.text-area {
	background: rgba(9, 9, 11, 0.92);
	border: 1px solid rgba(82, 82, 91, 1);
	border-radius: 0.8rem;
	padding: 0.75rem 0.85rem;
	color: #fafafa;
	font: inherit;
	width: 100%;
	box-sizing: border-box;
}

.text-input-wide {
	max-width: 28rem;
}

.text-area {
	resize: vertical;
}

.macro-preview {
	margin: 0;
	padding: 0.85rem;
	border-radius: 0.85rem;
	background: rgba(9, 9, 11, 0.72);
	font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
	white-space: pre-wrap;
	word-break: break-word;
}

.severity-row {
	margin-top: 0.75rem;
	align-items: end;
}

.severity-input {
	max-width: 7rem;
}

@media (max-width: 720px) {
	.hero-panel,
	.section-panel,
	.state-panel {
		padding: 1.1rem;
	}

	.hero-panel {
		flex-direction: column;
	}

	.section-nav {
		gap: 0.5rem;
	}

	.section-pill {
		white-space: nowrap;
	}

	.split-sections {
		flex-direction: column;
	}
}
</style>
