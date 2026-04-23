<template>
	<div class="library-page overflow-auto px-4 py-8">
		<main class="mx-auto max-w-6xl">
			<section v-if="flashMessage" class="banner banner-success">{{ flashMessage }}</section>
			<section v-if="error" class="banner banner-error">{{ error }}</section>

			<section v-if="loading" class="panel state-panel">
				<p><i class="pi pi-spin pi-spinner" /> Loading library...</p>
			</section>

			<section v-else-if="!auth.isLoggedIn" class="panel state-panel">
				<h1>Sign in to manage Library</h1>
				<p>Library is a first-class reusable resource hub, not a synthetic character.</p>
				<button class="primary-button" @click="loginAndReturn">Login with Discord</button>
			</section>

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
					<div class="hero-actions">
						<RouterLink class="secondary-link" to="/characters"
							>My Characters</RouterLink
						>
						<RouterLink class="primary-link" to="/import">Import Character</RouterLink>
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
						No shared actions yet. This section stays inspect-first in the MVP.
					</p>
					<div v-else class="resource-list">
						<article
							v-for="action in workspace.sharedActions"
							:key="action.meta.id"
							class="resource-card"
						>
							<div class="resource-head">
								<strong>{{ action.payload.name }}</strong>
								<span class="scope-badge scope-library">Library</span>
							</div>
							<p class="resource-copy">
								{{
									action.payload.description ||
									'Shared across your characters and minions.'
								}}
							</p>
						</article>
					</div>
				</section>

				<section class="panel section-panel">
					<h2>Shared Roll Macros</h2>
					<form class="editor-card" @submit.prevent="createLibraryRollMacro">
						<label>
							<span>Name</span>
							<input v-model="newRollMacro.name" class="text-input" maxlength="100" />
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
						<button class="primary-button" type="submit">Create roll macro</button>
					</form>
					<p
						v-if="!workspace || workspace.sharedRollMacros.length === 0"
						class="empty-copy"
					>
						No shared roll macros yet. Create one here to make it available across
						characters and minions.
					</p>
					<div v-else class="resource-list">
						<article
							v-for="rollMacro in workspace.sharedRollMacros"
							:key="rollMacro.meta.id"
							class="resource-card"
						>
							<div class="resource-head">
								<div class="badge-row">
									<strong>{{ rollMacro.payload.name }}</strong>
									<span class="scope-badge scope-library">Library</span>
								</div>
								<div class="card-actions">
									<button
										class="ghost-button"
										@click="
											startRollMacroEdit(
												rollMacro.payload.id,
												rollMacro.payload.name,
												rollMacro.payload.macro
											)
										"
									>
										Edit
									</button>
									<button
										class="danger-button"
										@click="deleteLibraryRollMacro(rollMacro.payload.id)"
									>
										Delete
									</button>
								</div>
							</div>
							<template v-if="editingRollMacroId === rollMacro.payload.id">
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
											@click="saveLibraryRollMacro(rollMacro.payload.id)"
										>
											Save
										</button>
										<button class="ghost-button" @click="cancelRollMacroEdit">
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
				</section>

				<section class="panel section-panel">
					<h2>Unassigned Modifiers</h2>
					<p
						v-if="!workspace || workspace.unassignedModifiers.length === 0"
						class="empty-copy"
					>
						No unassigned modifiers yet. They will appear here as inventory until
						assignment flows land.
					</p>
					<div v-else class="resource-list">
						<article
							v-for="modifier in workspace.unassignedModifiers"
							:key="modifier.meta.id"
							class="resource-card resource-card-muted"
						>
							<div class="resource-head">
								<strong>{{ modifier.payload.name }}</strong>
								<span class="scope-badge scope-library">Unassigned</span>
							</div>
							<p class="resource-copy">
								{{
									modifier.payload.description ||
									'Stored once in Library and inactive until assigned.'
								}}
							</p>
						</article>
					</div>
				</section>

				<section class="panel section-panel">
					<h2>Unassigned Minions</h2>
					<p
						v-if="!workspace || workspace.unassignedMinions.length === 0"
						class="empty-copy"
					>
						No unassigned minions yet. Create one elsewhere or unassign a minion from a
						character later.
					</p>
					<div v-else class="resource-list">
						<article
							v-for="minion in workspace.unassignedMinions"
							:key="minion.meta.id"
							class="resource-card resource-card-muted"
						>
							<div class="resource-head">
								<div>
									<div
										v-if="editingMinionId === minion.meta.id"
										class="editor-card compact-editor"
									>
										<input
											v-model="minionRenameDraft"
											class="text-input"
											maxlength="100"
										/>
										<div class="card-actions">
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
									</div>
									<template v-else>
										<strong>{{ minion.payload.name }}</strong>
									</template>
									<div class="badge-row mt-2">
										<span class="scope-badge scope-library">Library</span>
										<span
											v-if="minion.summary.autoJoinInitiative"
											class="scope-badge scope-library"
										>
											Auto-Join
										</span>
									</div>
								</div>
								<div class="card-actions">
									<button
										v-if="editingMinionId !== minion.meta.id"
										class="ghost-button"
										@click="
											startMinionRename(minion.meta.id, minion.payload.name)
										"
									>
										Rename
									</button>
									<button
										class="secondary-link"
										@click="
											toggleMinionAutoJoin(
												minion.meta.id,
												minion.summary.autoJoinInitiative,
												minion.payload.name
											)
										"
									>
										{{
											minion.summary.autoJoinInitiative
												? 'Disable Auto-Join'
												: 'Enable Auto-Join'
										}}
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
								<span v-if="minion.summary.autoJoinInitiative">
									· Auto-Join enabled</span
								>
							</p>
							<div class="card-actions">
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
import { useRoute } from 'vue-router';
import { api } from '@/api/api-client';
import { useAuthStore } from '@/stores/auth';

type LibraryWorkspace = Awaited<ReturnType<typeof api.library.getLibraryWorkspace>>;
type CharacterListItem = Awaited<ReturnType<typeof api.character.listMyCharacters>>[number];

const auth = useAuthStore();
const route = useRoute();

const workspace = ref<LibraryWorkspace | null>(null);
const loading = ref(true);
const error = ref('');
const flashMessage = ref('');
const characters = ref<CharacterListItem[]>([]);
const newRollMacro = ref({ name: '', macro: '' });
const editingRollMacroId = ref<number | null>(null);
const rollMacroDraft = ref({ name: '', macro: '' });
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

async function loginAndReturn() {
	const { url } = await api.auth.getAuthUrl({ returnTo: route.fullPath });
	window.location.href = url;
}

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
		editingRollMacroId.value = null;
		rollMacroDraft.value = { name: '', macro: '' };
		newRollMacro.value = { name: '', macro: '' };
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

async function createLibraryRollMacro() {
	if (!newRollMacro.value.name.trim() || !newRollMacro.value.macro.trim()) {
		error.value = 'Provide both a roll macro name and macro value.';
		return;
	}
	error.value = '';
	try {
		await api.character.createRollMacro({
			characterId: null,
			name: newRollMacro.value.name.trim(),
			macro: newRollMacro.value.macro.trim(),
		});
		flashMessage.value = `Created ${newRollMacro.value.name.trim()} in Library.`;
		await loadLibrary();
	} catch (err: unknown) {
		error.value = err instanceof Error ? err.message : 'Failed to create roll macro.';
	}
}

function startRollMacroEdit(id: number, name: string, macro: string) {
	editingRollMacroId.value = id;
	rollMacroDraft.value = { name, macro };
}

function cancelRollMacroEdit() {
	editingRollMacroId.value = null;
	rollMacroDraft.value = { name: '', macro: '' };
}

async function saveLibraryRollMacro(rollMacroId: number) {
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
		await loadLibrary();
	} catch (err: unknown) {
		error.value = err instanceof Error ? err.message : 'Failed to update roll macro.';
	}
}

async function deleteLibraryRollMacro(rollMacroId: number) {
	if (!window.confirm('Delete this shared roll macro?')) return;
	error.value = '';
	try {
		await api.character.deleteRollMacro({ rollMacroId });
		flashMessage.value = 'Roll macro deleted from Library.';
		if (editingRollMacroId.value === rollMacroId) {
			cancelRollMacroEdit();
		}
		await loadLibrary();
	} catch (err: unknown) {
		error.value = err instanceof Error ? err.message : 'Failed to delete roll macro.';
	}
}

function startMinionRename(minionId: number, name: string) {
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
</script>

<style scoped>
.library-page {
	background:
		radial-gradient(circle at top left, rgba(20, 184, 166, 0.14), transparent 23%),
		radial-gradient(circle at 80% 0%, rgba(245, 158, 11, 0.12), transparent 20%),
		linear-gradient(180deg, rgba(24, 24, 27, 0.99), rgba(9, 9, 11, 1));
	min-height: 100%;
}

.panel,
.banner,
.resource-card,
.editor-card,
.stat-card {
	border: 1px solid rgba(63, 63, 70, 0.88);
	background: rgba(24, 24, 27, 0.84);
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

.hero-panel,
.hero-actions,
.resource-head,
.badge-row,
.card-actions,
.overview-grid,
.resource-list {
	display: grid;
	gap: 0.85rem;
}

.hero-panel {
	grid-template-columns: minmax(0, 1fr) auto;
	align-items: end;
	gap: 1rem;
}

.hero-actions {
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
h2,
strong {
	margin: 0;
	color: #fafafa;
}

.lede,
.resource-copy,
.empty-copy,
.macro-preview,
.state-panel p {
	color: #d4d4d8;
}

.overview-grid {
	grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
	margin-top: 1rem;
}

.stat-card,
.resource-card,
.editor-card {
	padding: 1rem;
}

.resource-card-muted {
	background: rgba(39, 39, 42, 0.66);
}

.stat-label {
	margin: 0 0 0.35rem;
	font-size: 0.82rem;
	text-transform: uppercase;
	letter-spacing: 0.12em;
	color: #99f6e4;
}

.stat-value {
	margin: 0;
	font-size: 1.2rem;
	font-weight: 700;
	color: #fafafa;
}

.resource-head {
	grid-template-columns: minmax(0, 1fr) auto;
	align-items: start;
	margin-bottom: 0.6rem;
}

.badge-row,
.card-actions {
	display: flex;
	gap: 0.65rem;
	align-items: center;
	flex-wrap: wrap;
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

.scope-library {
	background: rgba(20, 184, 166, 0.18);
	color: #ccfbf1;
}

.primary-link,
.secondary-link,
.primary-button,
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
	text-decoration: none;
}

.primary-link,
.primary-button {
	background: #0f766e;
	color: white;
	border-color: #0f766e;
}

.secondary-link,
.ghost-button {
	background: rgba(39, 39, 42, 0.88);
	color: #f4f4f5;
	border-color: rgba(82, 82, 91, 1);
}

.danger-button {
	background: rgba(127, 29, 29, 0.4);
	color: #fca5a5;
	border-color: rgba(185, 28, 28, 0.65);
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

@media (max-width: 720px) {
	.hero-panel {
		grid-template-columns: 1fr;
	}

	.hero-actions {
		grid-auto-flow: row;
		justify-content: stretch;
	}
}
</style>
