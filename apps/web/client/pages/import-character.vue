<template>
	<div class="overflow-auto px-4 pt-10">
		<main class="prose dark:prose-invert max-w-5xl mx-auto">
			<PeridotImage />
			<h1>{{ isUpdateMode ? 'Update Character' : 'Import Character' }}</h1>

			<div v-if="isUpdateMode && existingCharacter" class="mb-4 p-3 bg-gray-800 rounded-lg">
				<p class="text-sm text-gray-300 m-0">
					Updating: <strong>{{ existingCharacter.name }}</strong> (Level
					{{ existingCharacter.level }})
				</p>
			</div>

			<div v-if="loadingCharacter" class="mb-6">
				<p class="text-gray-400">
					<i class="pi pi-spin pi-spinner" /> Loading character...
				</p>
			</div>
			<div v-else-if="characterLoadError" class="mb-6">
				<div class="p-3 bg-red-900/30 border border-red-700 rounded-lg">
					<p class="text-red-400 text-sm m-0">{{ characterLoadError }}</p>
				</div>
			</div>
			<div v-else-if="!auth.isLoggedIn" class="mb-6">
				<p class="text-yellow-500">
					You must be logged in to {{ isUpdateMode ? 'update' : 'import' }} a character.
				</p>
				<button
					class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded inline-flex items-center gap-2"
					@click="loginAndReturn"
				>
					<i class="pi pi-discord" />
					<span>Sign in with Discord</span>
				</button>
			</div>
			<template v-else>
				<!-- Import UI: instructions + upload side-by-side -->
				<div class="not-prose flex flex-col md:flex-row gap-8 mb-6">
					<!-- Left column: instructions -->
					<div class="flex-1 min-w-0">
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
							export to update your character's sheet. Tracker values (HP, focus, hero
							points, custom counters) will be preserved.
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
							</div>
						</template>

						<!-- Confirmation widget after file parsed -->
						<template v-else-if="exportData">
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
										@click="submitCharacter"
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

						<!-- Drag-and-drop upload -->
						<template v-else>
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

						<div
							v-if="error"
							class="p-3 bg-red-900/30 border border-red-700 rounded-lg"
						>
							<p class="text-red-400 text-sm m-0">{{ error }}</p>
						</div>
					</div>
				</div>
			</template>
		</main>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import PeridotImage from '@/components/PeridotImage.vue';
import { api } from '@/api/api-client';
import { useAuthStore } from '@/stores/auth';
import type { WgV4Export } from '@kobold/sheet';

const route = useRoute();
const auth = useAuthStore();

const existingCharacter = ref<{ id: number; name: string; level: number | null } | null>(null);
const loadingCharacter = ref(false);
const characterLoadError = ref('');
const fileName = ref('');
const parsedName = ref('');
const parsedLevel = ref(0);
const parsedImageUrl = ref('');
const exportData = ref<WgV4Export | null>(null);
const matchedExisting = ref<{ id: number; name: string } | null>(null);
const error = ref('');
const success = ref('');
const successWasUpdate = ref(false);
const importing = ref(false);
const dragOver = ref(false);

const characterId = computed(() => {
	const id = route.query.characterId;
	return id ? Number(id) : null;
});

const isUpdateMode = computed(() => characterId.value !== null || matchedExisting.value !== null);

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
			}
		} catch (err: unknown) {
			characterLoadError.value =
				err instanceof Error ? err.message : 'Failed to load character.';
		} finally {
			loadingCharacter.value = false;
		}
	}
});

async function loginAndReturn() {
	try {
		const returnTo = route.fullPath;
		const { url } = await api.auth.getAuthUrl({ returnTo });
		window.location.href = url;
	} catch (err) {
		console.error('Failed to get auth URL:', err);
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

function resetForNewImport() {
	clearFile();
	success.value = '';
	successWasUpdate.value = false;
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
	clearFile();
	fileName.value = file.name;

	if (!file.name.endsWith('.json') && file.type !== 'application/json') {
		error.value = 'Please select a JSON file.';
		return;
	}

	const reader = new FileReader();
	reader.onload = async () => {
		try {
			const data = JSON.parse(reader.result as string);

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
					matchedExisting.value = await api.character.findWgCharacterByName({
						name: parsedName.value,
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

async function submitCharacter() {
	if (!exportData.value) return;
	error.value = '';
	success.value = '';
	successWasUpdate.value = false;
	importing.value = true;

	try {
		if (isUpdateMode.value && effectiveCharacterId.value !== null) {
			const result = await api.character.updateWgCharacter({
				characterId: effectiveCharacterId.value,
				exportData: exportData.value,
			});
			success.value = result.name;
			successWasUpdate.value = true;
		} else {
			const result = await api.character.importWgCharacter({
				exportData: exportData.value,
			});
			success.value = result.name;
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
</script>
