<template>
	<div class="management-page overflow-auto px-4 py-8">
		<main class="mx-auto max-w-6xl">
			<PeridotImage v-if="!auth.isLoggedIn" class="page-portrait" />
			<section v-if="auth.isLoggedIn" class="hero-panel">
				<div>
					<p class="eyebrow">Management Hub</p>
					<h1>My Characters</h1>
					<p class="lede">
						Find the active character fast, jump into a workspace, and handle quick
						upkeep before a session.
					</p>
				</div>
				<div class="hero-actions">
					<RouterLink class="primary-link" to="/import">Import Character</RouterLink>
					<RouterLink class="secondary-link" to="/library">Open Library</RouterLink>
				</div>
			</section>

			<PageBanner :message="flashMessage" tone="success" />
			<PageBanner :message="error" tone="error" />

			<section v-if="loading" class="state-panel">
				<p><i class="pi pi-spin pi-spinner" /> Loading characters...</p>
			</section>

			<LoginRequiredCard
				v-else-if="!auth.isLoggedIn"
				message="You must be logged in to manage your characters."
			/>

			<section v-else-if="characters.length === 0" class="empty-state">
				<h2>No characters yet</h2>
				<p>
					Import your first character to start managing workspaces, or open Library to
					keep reusable roll macros, modifiers, and unassigned minions ready.
				</p>
				<div class="hero-actions">
					<RouterLink class="primary-link" to="/import"
						>Import your first character</RouterLink
					>
					<RouterLink class="secondary-link" to="/library">Open Library</RouterLink>
				</div>
			</section>

			<section v-else class="character-grid">
				<article v-for="character in characters" :key="character.id" class="character-card">
					<div class="card-header">
						<div>
							<div class="badge-row">
								<ScopeBadge
									:variant="
										character.isActiveCharacter
											? 'scope-active'
											: 'scope-library'
									"
								>
									{{ character.isActiveCharacter ? 'Active' : 'Owned' }}
								</ScopeBadge>
								<ScopeBadge variant="scope-character">
									{{ importSourceLabel(character.importSource) }}
								</ScopeBadge>
							</div>
							<template v-if="editingCharacterId === character.id">
								<div class="inline-form">
									<input
										v-model="renameDraft"
										class="text-input"
										maxlength="100"
									/>
									<div class="inline-actions">
										<button
											class="primary-button"
											:disabled="busyCharacterId === character.id"
											@click="saveRename(character)"
										>
											Save
										</button>
										<button class="ghost-button" @click="cancelRename">
											Cancel
										</button>
									</div>
								</div>
							</template>
							<template v-else>
								<h2>{{ character.name }}</h2>
							</template>
							<p class="summary-line">
								Level {{ character.summary.level ?? 'Unknown' }}
								<span v-if="character.summary.ancestry">
									· {{ character.summary.ancestry }}</span
								>
								<span v-if="character.summary.class">
									· {{ character.summary.class }}</span
								>
							</p>
							<p v-if="character.summary.heritage" class="summary-line subtle">
								{{ character.summary.heritage }}
							</p>
						</div>
						<RouterLink class="open-link" :to="`/characters/${character.id}`">
							Open Workspace
						</RouterLink>
					</div>

					<dl class="count-grid">
						<div>
							<dt>Modifiers</dt>
							<dd>{{ character.counts.modifiers }}</dd>
						</div>
						<div>
							<dt>Visible actions</dt>
							<dd>{{ character.counts.visibleActions }}</dd>
						</div>
						<div>
							<dt>Roll macros</dt>
							<dd>{{ character.counts.visibleRollMacros }}</dd>
						</div>
						<div>
							<dt>Minions</dt>
							<dd>{{ character.counts.assignedMinions }}</dd>
						</div>
					</dl>

					<div class="card-actions">
						<button
							class="secondary-button"
							:disabled="
								busyCharacterId === character.id || character.isActiveCharacter
							"
							@click="setActive(character)"
						>
							Set Active
						</button>
						<button
							v-if="editingCharacterId !== character.id"
							class="ghost-button"
							:disabled="busyCharacterId === character.id"
							@click="startRename(character)"
						>
							Rename
						</button>
						<button
							class="ghost-button"
							:disabled="busyCharacterId === character.id"
							@click="updateImport(character.id)"
						>
							Update Import
						</button>
						<button
							class="danger-button"
							:disabled="busyCharacterId === character.id"
							@click="deleteCharacter(character)"
						>
							Delete
						</button>
					</div>
				</article>
			</section>
		</main>
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '@/api/api-client';
import LoginRequiredCard from '@/components/LoginRequiredCard.vue';
import PeridotImage from '@/components/PeridotImage.vue';
import PageBanner from '@/components/PageBanner.vue';
import ScopeBadge from '@/components/ScopeBadge.vue';
import { useAuthStore } from '@/stores/auth';

type CharacterListItem = Awaited<ReturnType<typeof api.character.listMyCharacters>>[number];

const auth = useAuthStore();
const router = useRouter();

const characters = ref<CharacterListItem[]>([]);
const loading = ref(true);
const error = ref('');
const flashMessage = ref('');
const editingCharacterId = ref<number | null>(null);
const busyCharacterId = ref<number | null>(null);
const renameDraft = ref('');

onMounted(async () => {
	if (!auth.loaded) {
		await auth.fetchUser();
	}
	if (auth.isLoggedIn) {
		await loadCharacters();
	} else {
		loading.value = false;
	}
});

async function loadCharacters() {
	loading.value = true;
	error.value = '';
	try {
		characters.value = await api.character.listMyCharacters({});
	} catch (err: unknown) {
		error.value = err instanceof Error ? err.message : 'Failed to load your characters.';
	} finally {
		loading.value = false;
	}
}

function importSourceLabel(importSource: string) {
	if (importSource === 'pathbuilder') return 'Pathbuilder';
	if (importSource === 'wg') return "Wanderer's Guide";
	return importSource;
}

function startRename(character: CharacterListItem) {
	editingCharacterId.value = character.id;
	renameDraft.value = character.name;
}

function cancelRename() {
	editingCharacterId.value = null;
	renameDraft.value = '';
}

async function saveRename(character: CharacterListItem) {
	const name = renameDraft.value.trim();
	if (!name) {
		error.value = 'Character name cannot be empty.';
		return;
	}
	busyCharacterId.value = character.id;
	error.value = '';
	try {
		await api.character.renameCharacter({
			characterId: character.id,
			name,
		});
		flashMessage.value = `Renamed ${character.name} to ${name}.`;
		cancelRename();
		await loadCharacters();
	} catch (err: unknown) {
		error.value = err instanceof Error ? err.message : 'Failed to rename character.';
	} finally {
		busyCharacterId.value = null;
	}
}

async function setActive(character: CharacterListItem) {
	busyCharacterId.value = character.id;
	error.value = '';
	try {
		await api.character.setActiveCharacter({ characterId: character.id });
		flashMessage.value = `${character.name} is now your active character.`;
		await loadCharacters();
	} catch (err: unknown) {
		error.value = err instanceof Error ? err.message : 'Failed to set active character.';
	} finally {
		busyCharacterId.value = null;
	}
}

function updateImport(characterId: number) {
	router.push({ name: 'import-character', query: { characterId: String(characterId) } });
}

async function deleteCharacter(character: CharacterListItem) {
	if (!window.confirm(`Delete ${character.name}? This removes the character workspace.`)) {
		return;
	}
	busyCharacterId.value = character.id;
	error.value = '';
	try {
		await api.character.deleteCharacter({ characterId: character.id });
		flashMessage.value = `${character.name} was deleted.`;
		if (editingCharacterId.value === character.id) {
			cancelRename();
		}
		await loadCharacters();
	} catch (err: unknown) {
		error.value = err instanceof Error ? err.message : 'Failed to delete character.';
	} finally {
		busyCharacterId.value = null;
	}
}
</script>

<style scoped>
.management-page {
	background:
		radial-gradient(circle at top left, rgba(96, 165, 250, 0.18), transparent 28%),
		radial-gradient(circle at top right, rgba(34, 197, 94, 0.12), transparent 24%),
		linear-gradient(180deg, rgba(24, 24, 27, 0.98), rgba(9, 9, 11, 1));
	min-height: 100%;
}

.page-portrait {
	margin-bottom: 1rem;
}

.hero-panel,
.state-panel,
.empty-state,
.character-card,
.banner {
	border: 1px solid rgba(63, 63, 70, 0.9);
	background: rgba(24, 24, 27, 0.82);
	backdrop-filter: blur(10px);
	border-radius: 1rem;
	box-shadow: 0 22px 45px rgba(0, 0, 0, 0.22);
}

.hero-panel {
	display: flex;
	justify-content: space-between;
	gap: 1.5rem;
	padding: 1.5rem;
	margin-bottom: 1rem;
	align-items: end;
	flex-wrap: wrap;
}

.eyebrow {
	text-transform: uppercase;
	letter-spacing: 0.16em;
	font-size: 0.72rem;
	color: #93c5fd;
	margin: 0 0 0.5rem;
}

h1,
h2 {
	margin: 0;
	color: #fafafa;
}

.lede,
.summary-line,
.state-panel p,
.empty-state p {
	color: #d4d4d8;
}

.hero-actions,
.card-actions,
.inline-actions,
.badge-row {
	display: flex;
	gap: 0.65rem;
	flex-wrap: wrap;
	align-items: center;
}

.primary-link,
.secondary-link,
.primary-button,
.secondary-button,
.ghost-button,
.danger-button,
.open-link {
	border-radius: 999px;
	padding: 0.7rem 1rem;
	border: 1px solid transparent;
	font-weight: 600;
	cursor: pointer;
	text-decoration: none;
	transition:
		background 0.16s ease,
		border-color 0.16s ease,
		color 0.16s ease;
}

.primary-link,
.primary-button,
.open-link {
	background: #2563eb;
	color: white;
	border-color: #2563eb;
}

.secondary-link,
.secondary-button {
	background: rgba(39, 39, 42, 0.85);
	color: #e4e4e7;
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

.primary-link:hover,
.primary-button:hover,
.open-link:hover,
.secondary-link:hover,
.secondary-button:hover,
.ghost-button:hover,
.danger-button:hover {
	text-decoration: none;
	filter: brightness(1.08);
}

.primary-button:disabled,
.secondary-button:disabled,
.ghost-button:disabled,
.danger-button:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.banner {
	padding: 0.9rem 1rem;
	margin-bottom: 1rem;
	color: #e4e4e7;
}

.banner-success {
	border-color: rgba(22, 163, 74, 0.5);
	color: #bbf7d0;
}

.banner-error {
	border-color: rgba(220, 38, 38, 0.55);
	color: #fecaca;
}

.state-panel,
.empty-state {
	padding: 1.5rem;
	text-align: center;
}

.character-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
	gap: 1rem;
}

.character-card {
	padding: 1.2rem;
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.card-header {
	display: flex;
	justify-content: space-between;
	gap: 1rem;
	align-items: start;
}

.count-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 0.75rem;
	margin: 0;
}

.count-grid div {
	padding: 0.8rem;
	border-radius: 0.8rem;
	background: rgba(39, 39, 42, 0.75);
	border: 1px solid rgba(63, 63, 70, 0.8);
}

.count-grid dt {
	font-size: 0.8rem;
	color: #a1a1aa;
	margin-bottom: 0.2rem;
}

.count-grid dd {
	margin: 0;
	font-size: 1.35rem;
	font-weight: 700;
	color: #fafafa;
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

.scope-active {
	background: rgba(37, 99, 235, 0.2);
	color: #bfdbfe;
}

.scope-library {
	background: rgba(82, 82, 91, 0.4);
	color: #e4e4e7;
}

.scope-character {
	background: rgba(22, 163, 74, 0.18);
	color: #bbf7d0;
}

.inline-form {
	display: flex;
	flex-direction: column;
	gap: 0.6rem;
	margin-top: 0.5rem;
}

.text-input {
	background: rgba(9, 9, 11, 0.9);
	border: 1px solid rgba(82, 82, 91, 1);
	border-radius: 0.8rem;
	padding: 0.75rem 0.85rem;
	color: #fafafa;
}

.subtle {
	color: #a1a1aa;
	margin-top: 0.2rem;
}

@media (max-width: 720px) {
	.card-header {
		flex-direction: column;
	}

	.hero-panel {
		padding: 1.2rem;
	}
}
</style>
