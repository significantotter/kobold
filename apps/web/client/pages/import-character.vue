<template>
	<div class="import-page overflow-auto px-4 py-8">
		<main class="mx-auto max-w-6xl">
			<PeridotImage class="page-portrait" />
			<section class="hero-panel">
				<div>
					<p class="eyebrow">Character Tools</p>
					<h1>{{ isUpdateMode ? 'Update Character' : 'Import Character' }}</h1>
					<p class="lede">
						Bring a Pathfinder 2E character into Kobold from Wanderer's Guide or
						Pathbuilder, then manage it from your workspace.
					</p>
				</div>
			</section>

			<div v-if="isUpdateMode && existingCharacter" class="panel update-panel">
				<p class="text-sm text-gray-300 m-0">
					Updating: <strong>{{ existingCharacter.name }}</strong> (Level
					{{ existingCharacter.level }}) via
					{{
						existingCharacter.importSource === 'pathbuilder'
							? 'Pathbuilder'
							: "Wanderer's Guide"
					}}
				</p>
			</div>

			<section v-if="loadingCharacter" class="panel state-panel">
				<p class="text-gray-400">
					<i class="pi pi-spin pi-spinner" /> Loading character...
				</p>
			</section>
			<section v-else-if="characterLoadError" class="panel state-panel">
				<div class="p-3 bg-red-900/30 border border-red-700 rounded-lg">
					<p class="text-red-400 text-sm m-0">{{ characterLoadError }}</p>
				</div>
			</section>
			<LoginRequiredCard
				v-else-if="!auth.isLoggedIn"
				:message="`You must be logged in to ${isUpdateMode ? 'update' : 'import'} a character.`"
			/>
			<section v-else class="panel section-panel">
				<div v-if="!isUpdateMode" class="not-prose mb-6 flex flex-wrap gap-3">
					<button
						class="px-4 py-2 rounded-full border font-semibold transition-colors"
						:class="
							selectedImportSource === 'wg'
								? 'bg-indigo-600 border-indigo-500 text-white'
								: 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500'
						"
						@click="setImportSource('wg')"
					>
						Wanderer's Guide
					</button>
					<button
						class="px-4 py-2 rounded-full border font-semibold transition-colors"
						:class="
							selectedImportSource === 'pathbuilder'
								? 'bg-emerald-700 border-emerald-600 text-white'
								: 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500'
						"
						@click="setImportSource('pathbuilder')"
					>
						Pathbuilder
					</button>
				</div>

				<!-- Import UI: instructions + upload side-by-side -->
				<div class="not-prose flex flex-col md:flex-row gap-8 mb-6">
					<!-- Left column: instructions -->
					<div class="flex-1 min-w-0">
						<template v-if="effectiveImportSource === 'wg'">
							<p v-if="!isUpdateMode" class="text-gray-300 mb-4">
								Import a character from
								<a
									href="https://wanderersguide.app"
									target="_blank"
									rel="noopener"
									class="text-indigo-400 hover:text-indigo-300 underline"
									>Wanderer's Guide</a
								>
								by uploading your exported JSON file.
							</p>
							<p v-else class="text-gray-300 mb-4">
								Upload a new
								<a
									href="https://wanderersguide.app"
									target="_blank"
									rel="noopener"
									class="text-indigo-400 hover:text-indigo-300 underline"
									>Wanderer's Guide</a
								>
								export to update your character's sheet. Tracker values (HP, focus,
								hero points, custom counters) will be preserved.
							</p>

							<h3 class="text-lg font-semibold text-gray-200 mb-3">
								How to export from Wanderer's Guide
							</h3>
							<ol class="list-decimal list-inside text-gray-300 space-y-1">
								<li>
									Open your character on
									<a
										href="https://wanderersguide.app"
										target="_blank"
										rel="noopener"
										class="text-indigo-400 hover:text-indigo-300 underline"
										>wanderersguide.app</a
									>
								</li>
								<li>
									Click the <strong>Export</strong> button (or menu) and choose
									<strong>Export to JSON</strong>
								</li>
								<li>
									Save the
									<code class="bg-gray-700 px-1 rounded text-sm">.json</code>
									file to your computer
								</li>
								<li>Upload it using the box on the right</li>
							</ol>
						</template>
						<template v-else>
							<p class="text-gray-300 mb-4">
								{{
									isUpdateMode
										? 'Update your existing Pathbuilder character by entering the exported JSON ID again. Tracker values stay intact while the sheet refreshes from Pathbuilder.'
										: 'Import a Pathbuilder character by entering its JSON ID. This keeps Pathbuilder as the source of truth while landing you in the same management hub.'
								}}
							</p>
							<h3 class="text-lg font-semibold text-gray-200 mb-3">
								How to import from Pathbuilder
							</h3>
							<ol class="list-decimal list-inside text-gray-300 space-y-1">
								<li>Open your character in Pathbuilder 2E.</li>
								<li>Use the share or export option to generate a JSON ID.</li>
								<li>Paste that JSON ID into the form on the right.</li>
								<li>Optionally enable stamina before importing.</li>
							</ol>
						</template>
					</div>

					<!-- Right column: upload box, confirmation, or success -->
					<div class="flex-1 min-w-0 flex flex-col gap-4">
						<!-- Success widget -->
						<template v-if="success">
							<div class="p-4 bg-green-900/20 border border-green-700 rounded-lg">
								<div class="flex items-center gap-3 mb-3">
									<i
										class="pi pi-check-circle text-green-400 text-4xl w-12 h-12 flex items-center justify-center"
									/>
									<div>
										<p class="text-green-300 font-semibold m-0">
											{{ success }}
										</p>
										<p class="text-green-400/70 text-sm m-0">
											<template v-if="successWasUpdate">
												Successfully updated!
											</template>
											<template v-else>
												Successfully imported! You can now use this
												character with Kobold in Discord.
											</template>
										</p>
									</div>
								</div>
								<button
									class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded inline-flex items-center gap-2"
									@click="resetForNewImport"
								>
									<i class="pi pi-plus" />
									<span>Import another character?</span>
								</button>
								<RouterLink
									v-if="successCharacterId !== null"
									:to="`/characters/${successCharacterId}`"
									class="ml-3 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded inline-flex items-center gap-2 no-underline"
								>
									<i class="pi pi-arrow-right" />
									<span>Open workspace</span>
								</RouterLink>
								<!-- <RouterLink
									to="/characters"
									class="ml-3 text-gray-300 hover:text-white text-sm underline"
								>
									Go to My Characters
								</RouterLink> -->
							</div>
						</template>

						<!-- WG confirmation widget after file parsed -->
						<template v-else-if="effectiveImportSource === 'wg' && exportData">
							<div class="p-4 bg-gray-800 border border-gray-600 rounded-lg">
								<div class="flex items-center gap-3 mb-3">
									<img
										v-if="parsedImageUrl"
										:src="parsedImageUrl"
										:alt="parsedName"
										class="w-12 h-12 rounded-full object-cover"
									/>
									<i
										v-else
										class="pi pi-user text-indigo-400 text-4xl w-12 h-12 flex items-center justify-center"
									/>
									<div>
										<p class="text-gray-200 font-semibold m-0">
											{{ parsedName }}
										</p>
										<p class="text-gray-400 text-sm m-0">
											Level {{ parsedLevel }}
										</p>
									</div>
								</div>
								<p class="text-xs text-gray-500 m-0 mb-3">
									<i class="pi pi-file mr-1" />{{ fileName }}
								</p>
								<p v-if="matchedExisting" class="text-xs text-yellow-500 m-0 mb-3">
									<i class="pi pi-info-circle mr-1" />A character named "{{
										matchedExisting.name
									}}" already exists — this will update it.
								</p>
								<div class="flex items-center justify-between">
									<button
										class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-5 rounded inline-flex items-center gap-2"
										:disabled="importing"
										@click="submitWgCharacter"
									>
										<i v-if="importing" class="pi pi-spin pi-spinner" />
										<i v-else class="pi pi-check" />
										<span>{{
											importing
												? isUpdateMode
													? 'Updating...'
													: 'Importing...'
												: isUpdateMode
													? 'Update Character'
													: 'Import Character'
										}}</span>
									</button>
									<button
										class="text-gray-400 hover:text-white text-sm underline"
										:disabled="importing"
										@click="clearFile"
									>
										Upload a different file
									</button>
								</div>
							</div>
						</template>

						<!-- WG drag-and-drop upload -->
						<template v-else-if="effectiveImportSource === 'wg'">
							<label
								class="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors"
								:class="
									dragOver
										? 'border-indigo-400 bg-indigo-900/20'
										: 'border-gray-600 hover:border-gray-500 bg-gray-800/30'
								"
								@dragover.prevent="dragOver = true"
								@dragleave="dragOver = false"
								@drop.prevent="handleDrop"
							>
								<div class="flex flex-col items-center justify-center pt-5 pb-6">
									<i class="pi pi-upload text-3xl mb-2 text-gray-400" />
									<p class="mb-2 text-sm text-gray-400">
										<span class="font-semibold">Click to upload</span> or drag
										and drop
									</p>
									<p class="text-xs text-gray-500">
										Wanderer's Guide JSON export (.json)
									</p>
								</div>
								<input
									type="file"
									class="hidden"
									accept=".json,application/json"
									@change="handleFileSelect"
								/>
							</label>
						</template>

						<!-- Pathbuilder form -->
						<template v-else>
							<div
								class="p-4 bg-gray-800 border border-gray-600 rounded-lg flex flex-col gap-4"
							>
								<div>
									<label
										class="block text-sm font-medium text-gray-200 mb-2"
										for="pathbuilder-json-id"
									>
										Pathbuilder JSON ID
									</label>
									<input
										id="pathbuilder-json-id"
										v-model="pathbuilderJsonId"
										type="number"
										min="1"
										inputmode="numeric"
										class="w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white"
										placeholder="123456"
									/>
								</div>
								<label class="inline-flex items-center gap-3 text-sm text-gray-300">
									<input
										v-model="pathbuilderUseStamina"
										type="checkbox"
										class="rounded border-gray-600 bg-gray-900 text-emerald-500"
									/>
									<span>Use stamina variant on import</span>
								</label>
								<p class="m-0 text-xs text-gray-500">
									Pathbuilder imports pull the live JSON export by ID instead of
									uploading a file.
								</p>
								<div class="flex items-center justify-between gap-3">
									<button
										class="bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-2 px-5 rounded inline-flex items-center gap-2"
										:disabled="importing"
										@click="submitPathbuilderCharacter"
									>
										<i v-if="importing" class="pi pi-spin pi-spinner" />
										<i v-else class="pi pi-download" />
										<span>
											{{
												importing
													? isUpdateMode
														? 'Updating...'
														: 'Importing...'
													: isUpdateMode
														? 'Update Character'
														: 'Import Character'
											}}
										</span>
									</button>
									<button
										v-if="!isUpdateMode"
										class="text-gray-400 hover:text-white text-sm underline"
										:disabled="importing"
										@click="clearPathbuilderState"
									>
										Clear form
									</button>
								</div>
							</div>
						</template>

						<div
							v-if="error"
							class="p-3 bg-red-900/30 border border-red-700 rounded-lg"
						>
							<p class="text-red-400 text-sm m-0">{{ error }}</p>
						</div>
					</div>
				</div>
			</section>
		</main>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import LoginRequiredCard from '@/components/LoginRequiredCard.vue';
import PeridotImage from '@/components/PeridotImage.vue';
import { api } from '@/api/api-client';
import { useAuthStore } from '@/stores/auth';
import type { WgV4Export } from '@kobold/sheet';

type CharacterImportSource = 'wg' | 'pathbuilder';

const route = useRoute();
const auth = useAuthStore();

const existingCharacter = ref<{
	id: number;
	name: string;
	level: number | null;
	importSource: CharacterImportSource;
	charId: number;
} | null>(null);
const loadingCharacter = ref(false);
const characterLoadError = ref('');
const selectedImportSource = ref<CharacterImportSource>('wg');
const fileName = ref('');
const parsedName = ref('');
const parsedLevel = ref(0);
const parsedImageUrl = ref('');
const exportData = ref<WgV4Export | null>(null);
const matchedExisting = ref<{ id: number; name: string } | null>(null);
const error = ref('');
const success = ref('');
const successWasUpdate = ref(false);
const successCharacterId = ref<number | null>(null);
const importing = ref(false);
const dragOver = ref(false);
const pathbuilderJsonId = ref('');
const pathbuilderUseStamina = ref(false);

const characterId = computed(() => {
	const id = route.query.characterId;
	return id ? Number(id) : null;
});

const isUpdateMode = computed(() => characterId.value !== null || matchedExisting.value !== null);

const effectiveImportSource = computed<CharacterImportSource>(() => {
	if (!isUpdateMode.value) return selectedImportSource.value;
	return existingCharacter.value?.importSource === 'pathbuilder' ? 'pathbuilder' : 'wg';
});

const effectiveCharacterId = computed(() => {
	return characterId.value ?? matchedExisting.value?.id ?? null;
});

onMounted(async () => {
	if (!auth.loaded) await auth.fetchUser();

	// If in update mode, fetch the existing character info
	if (auth.isLoggedIn && characterId.value !== null) {
		loadingCharacter.value = true;
		try {
			const character = await api.character.getCharacter({
				characterId: characterId.value,
			});
			if (!character) {
				characterLoadError.value =
					'Character not found. It may have been deleted, or you may not have access to it.';
			} else {
				existingCharacter.value = character;
				selectedImportSource.value =
					character.importSource === 'pathbuilder' ? 'pathbuilder' : 'wg';
				if (character.importSource === 'pathbuilder' && character.charId > 0) {
					pathbuilderJsonId.value = String(character.charId);
				}
			}
		} catch (err: unknown) {
			characterLoadError.value =
				err instanceof Error ? err.message : 'Failed to load character.';
		} finally {
			loadingCharacter.value = false;
		}
	}
});

function setImportSource(source: CharacterImportSource) {
	selectedImportSource.value = source;
	error.value = '';
	success.value = '';
	if (source === 'wg') {
		clearPathbuilderState();
	} else {
		clearFile();
	}
}

function clearFile() {
	fileName.value = '';
	parsedName.value = '';
	parsedLevel.value = 0;
	parsedImageUrl.value = '';
	exportData.value = null;
	matchedExisting.value = null;
	error.value = '';
	success.value = '';
}

function clearPathbuilderState() {
	pathbuilderJsonId.value =
		isUpdateMode.value && existingCharacter.value?.importSource === 'pathbuilder'
			? String(existingCharacter.value.charId)
			: '';
	pathbuilderUseStamina.value = false;
	error.value = '';
	success.value = '';
}

function resetForNewImport() {
	clearFile();
	clearPathbuilderState();
	success.value = '';
	successWasUpdate.value = false;
	successCharacterId.value = null;
	selectedImportSource.value = 'wg';
}

function handleDrop(e: DragEvent) {
	dragOver.value = false;
	const file = e.dataTransfer?.files?.[0];
	if (file) processFile(file);
}

function handleFileSelect(e: Event) {
	const input = e.target as HTMLInputElement;
	const file = input.files?.[0];
	if (file) processFile(file);
	input.value = '';
}

function processFile(file: File) {
	if (effectiveImportSource.value !== 'wg') return;
	clearFile();
	fileName.value = file.name;
	const processStart = performance.now();

	if (!file.name.endsWith('.json') && file.type !== 'application/json') {
		error.value = 'Please select a JSON file.';
		return;
	}

	const reader = new FileReader();
	reader.onload = async () => {
		try {
			const parseStart = performance.now();
			const data = JSON.parse(reader.result as string);
			console.info('[wg import timing]', {
				event: 'file parsed',
				fileName: file.name,
				fileBytes: file.size,
				readAndParseMs: Math.round(performance.now() - processStart),
				parseMs: Math.round(performance.now() - parseStart),
			});

			if (!data.version || !data.character || !data.content) {
				error.value =
					"This does not appear to be a Wanderer's Guide export. Expected fields: version, character, content.";
				return;
			}

			if (data.version !== 4) {
				error.value = `Unsupported export version: ${data.version}. Only version 4 is supported.`;
				return;
			}

			exportData.value = data;
			parsedName.value = data.character?.name ?? 'Unnamed';
			parsedLevel.value = data.character?.level ?? 0;
			parsedImageUrl.value = data.character?.details?.image_url ?? '';

			// Check if a WG character with this name already exists
			if (!characterId.value && parsedName.value) {
				try {
					const duplicateStart = performance.now();
					matchedExisting.value = await api.character.findWgCharacterByName({
						name: parsedName.value,
					});
					console.info('[wg import timing]', {
						event: 'duplicate lookup complete',
						durationMs: Math.round(performance.now() - duplicateStart),
						foundExisting: !!matchedExisting.value,
					});
				} catch {
					matchedExisting.value = null;
				}
			}
		} catch {
			error.value = 'Failed to parse JSON file. Make sure it is a valid JSON file.';
		}
	};
	reader.onerror = () => {
		error.value = 'Failed to read the file.';
	};
	reader.readAsText(file);
}

async function submitWgCharacter() {
	if (!exportData.value) return;
	error.value = '';
	success.value = '';
	successWasUpdate.value = false;
	importing.value = true;

	try {
		const rpcStart = performance.now();
		if (isUpdateMode.value && effectiveCharacterId.value !== null) {
			const result = await api.character.updateWgCharacter({
				characterId: effectiveCharacterId.value,
				exportData: exportData.value,
			});
			console.info('[wg import timing]', {
				event: 'update rpc complete',
				durationMs: Math.round(performance.now() - rpcStart),
			});
			success.value = result.name;
			successWasUpdate.value = true;
			successCharacterId.value = result.characterId;
		} else {
			const result = await api.character.importWgCharacter({
				exportData: exportData.value,
			});
			console.info('[wg import timing]', {
				event: 'import rpc complete',
				durationMs: Math.round(performance.now() - rpcStart),
			});
			success.value = result.name;
			successCharacterId.value = result.characterId;
		}
		exportData.value = null;
		fileName.value = '';
		parsedName.value = '';
		parsedLevel.value = 0;
	} catch (err: unknown) {
		error.value =
			err instanceof Error
				? err.message
				: `An error occurred while ${isUpdateMode.value ? 'updating' : 'importing'} the character.`;
	} finally {
		importing.value = false;
	}
}

async function submitPathbuilderCharacter() {
	const jsonId = Number(pathbuilderJsonId.value);
	if (!Number.isInteger(jsonId) || jsonId <= 0) {
		error.value = 'Enter a valid positive Pathbuilder JSON ID.';
		return;
	}

	error.value = '';
	success.value = '';
	successWasUpdate.value = false;
	importing.value = true;

	try {
		if (isUpdateMode.value && effectiveCharacterId.value !== null) {
			const result = await api.character.updatePathbuilderCharacter({
				characterId: effectiveCharacterId.value,
				jsonId,
				useStamina: pathbuilderUseStamina.value,
			});
			success.value = result.name;
			successWasUpdate.value = true;
			successCharacterId.value = result.characterId;
		} else {
			const result = await api.character.importPathbuilderCharacter({
				jsonId,
				useStamina: pathbuilderUseStamina.value,
			});
			success.value = result.name;
			successCharacterId.value = result.characterId;
		}
	} catch (err: unknown) {
		error.value =
			err instanceof Error
				? err.message
				: `An error occurred while ${isUpdateMode.value ? 'updating' : 'importing'} the character.`;
	} finally {
		importing.value = false;
	}
}
</script>

<style scoped>
.import-page {
	background:
		radial-gradient(circle at top left, rgba(96, 165, 250, 0.18), transparent 28%),
		radial-gradient(circle at top right, rgba(34, 197, 94, 0.12), transparent 24%),
		linear-gradient(180deg, rgba(24, 24, 27, 0.98), rgba(9, 9, 11, 1));
	min-height: 100%;
}

.panel,
.hero-panel {
	border: 1px solid rgba(63, 63, 70, 0.9);
	background: rgba(24, 24, 27, 0.82);
	backdrop-filter: blur(10px);
	border-radius: 1rem;
	box-shadow: 0 22px 45px rgba(0, 0, 0, 0.22);
}

.page-portrait {
	margin-bottom: 1rem;
}

.page-portrait :deep(img) {
	width: 200px;
	height: 200px;
	object-fit: contain;
}

.hero-panel {
	display: flex;
	justify-content: space-between;
	gap: 1.5rem;
	padding: 1.5rem;
	margin-bottom: 1rem;
	align-items: center;
	flex-wrap: wrap;
}

.section-panel,
.state-panel,
.update-panel {
	padding: 1.4rem;
	margin-bottom: 1rem;
}

.eyebrow {
	text-transform: uppercase;
	letter-spacing: 0.16em;
	font-size: 0.72rem;
	color: #93c5fd;
	margin: 0 0 0.5rem;
}

h1,
h2,
h3,
strong {
	color: #fafafa;
}

h1 {
	margin: 0;
}

.lede {
	color: #d4d4d8;
	max-width: 48rem;
	line-height: 1.65;
}

.state-panel p {
	margin: 0;
}
</style>
