<template>
	<div id="commands-grid" class="commands-page">
		<aside id="commands-toc" class="panel">
			<button
				class="toc-toggle"
				type="button"
				:aria-expanded="tocOpen"
				@click="tocOpen = !tocOpen"
			>
				<span>
					<span class="eyebrow">Command Reference</span>
					<strong>Contents</strong>
				</span>
				<i :class="['pi', tocOpen ? 'pi-chevron-up' : 'pi-chevron-down']" />
			</button>
			<div class="toc-menu-shell" :class="{ 'toc-menu-shell-open': tocOpen }">
				<Menu :model="menuItems">
					<template #start>
						<div class="toc-head">
							<p class="eyebrow">Command Reference</p>
							<h2>Contents</h2>
						</div>
					</template>
					<template #item="{ item, props }">
						<a
							:id="`toc-item_${item.id}`"
							:key="`toc-item_${item.id}`"
							v-bind="props.action"
							:class="{
								'ml-4': item.id.split('_').length > 1,
								prose: true,
								'dark:prose-invert': true,
								selected:
									item.id === commandActiveId ||
									item.id === commandActiveId.split('_')[0],
							}"
							@click="
								setTocValueActive({
									commandName: item.commandName,
									subCommandName: item.subCommandName,
								})
							"
						>
							{{ item.label }}
						</a>
					</template>
				</Menu>
			</div>
		</aside>
		<div id="commands-content-wrapper" ref="commandRenderer">
			<div class="page-portrait">
				<img src="/peridot.png" alt="kobold portrait" width="200" height="200" />
			</div>
			<section class="hero-panel">
				<div>
					<p class="eyebrow">Discord Slash Commands</p>
					<h1>Commands</h1>
					<p class="lede">
						Browse Kobold's command set for characters, initiative, counters, rolls,
						conditions, and reference lookups.
					</p>
				</div>
			</section>
			<section id="commands-content" class="panel prose dark:prose-invert">
				<CommandRenderer :commands="commands" />
			</section>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, watch, type Ref, onMounted, nextTick } from 'vue';
import Menu from 'primevue/menu';
import { commands } from '@kobold/documentation';
import CommandRenderer from '@/components/command-renderer/CommandRenderer.vue';
import { useActiveScroll } from 'vue-use-active-scroll';

const subCommandsToc = commands
	.flatMap(command =>
		Object.values(command.definition.subCommands).map(subCommand => ({
			commandName: command.definition.metadata.name,
			subCommandName: subCommand.name,
			id: `${command.definition.metadata.name}_${subCommand.name}`,
			label: subCommand.name,
		}))
	)
	.flat();

const tableOfContents = commands
	.map(command => ({
		commandName: command.definition.metadata.name,
		subCommandName: '',
		id: command.definition.metadata.name,
		label: command.definition.metadata.name,
	}))
	.concat(subCommandsToc)
	.sort(
		(a, b) =>
			a.commandName.localeCompare(b.commandName) ||
			a.subCommandName.localeCompare(b.subCommandName)
	);

const menuItems = computed(() => {
	return tableOfContents.map(item => ({
		label: item.label,
		url: `#${item.id}`,
		commandName: item.commandName,
		subCommandName: item.subCommandName,
		id: item.id,
		key: `toc-item_${item.id}`,
		class: {
			'ml-4': item.id!.includes(' '),
			selected: item.id === commandActiveId.value,
			'toc-link': true,
			[`toc-item_${item.id}`]: true,
		},
	}));
});

const tocOpen = ref(false);

const setTocValueActive = (item: { commandName: string; subCommandName: string }) => {
	const targetId = item.subCommandName
		? `${item.commandName}_${item.subCommandName}`
		: item.commandName;
	document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
	tocOpen.value = false;
};

const commandRenderer: Ref<HTMLElement | null> = ref(null);
const commandTargets = ref<HTMLElement[]>([]);

function resetTargets() {
	commandTargets.value = [];
}

function setTargets(container: HTMLElement) {
	const _commandTargets: HTMLElement[] = [];
	container.querySelectorAll('.command-toc.command-toc-2').forEach(element => {
		_commandTargets.push(element as HTMLElement);
	});
	commandTargets.value = _commandTargets;
}

// Set targets after component is mounted and DOM is ready
onMounted(async () => {
	await nextTick();
	// Give time for CommandRenderer to render
	setTimeout(() => {
		if (commandRenderer.value) {
			setTargets(commandRenderer.value);
		}
	}, 100);
});

const { activeId: commandActiveId } = useActiveScroll(commandTargets, {
	overlayHeight: 200,
	root: commandRenderer,
});

function isMobileTocCollapsed() {
	return window.matchMedia('(max-width: 900px)').matches && !tocOpen.value;
}

function scrollActiveTocItemIntoView() {
	if (isMobileTocCollapsed()) return;
	const container = document.getElementById('commands-toc');
	const tocItem = document.getElementsByClassName(`toc-item_${commandActiveId.value}`)[0];
	if (tocItem && container) {
		const rect = tocItem.getBoundingClientRect();
		if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
			return;
		}
		tocItem.scrollIntoView({ behavior: 'smooth' });
	}
}

watch(commandActiveId, () => {
	scrollActiveTocItemIntoView();
});

watch(tocOpen, async open => {
	if (!open) return;
	await nextTick();
	scrollActiveTocItemIntoView();
});
</script>

<style lang="scss" scoped>
#commands-grid {
	display: grid;
	grid-template-columns: 260px 1fr;
	gap: 1rem;
	height: 100%;
	overflow: hidden;
	padding: 1rem;
	background:
		radial-gradient(circle at top left, rgba(96, 165, 250, 0.18), transparent 28%),
		radial-gradient(circle at top right, rgba(34, 197, 94, 0.12), transparent 24%),
		linear-gradient(180deg, rgba(24, 24, 27, 0.98), rgba(9, 9, 11, 1));
}

#commands-toc {
	overflow-y: auto;
	padding: 1rem 0.5rem;

	:deep(.p-menu) {
		background: transparent;
		border: none;
	}

	:deep(.p-menu-item.p-focus .p-menu-item-content:has(:not(.selected))) {
		background: inherit;
		color: inherit;
	}
	:deep(.selected .p-menu-item.p-focus .p-menu-item-content),
	:deep(.p-menu-item-content:has(.selected)) {
		background: rgba(37, 99, 235, 0.2);
		color: #bfdbfe;
		box-shadow: inset 0 0 0 1px rgba(96, 165, 250, 0.42);
	}
}

.toc-toggle {
	display: none;
	width: 100%;
	align-items: center;
	justify-content: space-between;
	gap: 1rem;
	border: 0;
	background: transparent;
	color: #fafafa;
	padding: 0.25rem 0.75rem;
	text-align: left;
	cursor: pointer;
}

.toc-toggle span {
	display: grid;
	gap: 0.25rem;
}

.toc-toggle .eyebrow {
	margin: 0;
}

.toc-menu-shell {
	display: block;
}

#commands-content-wrapper {
	overflow-y: auto;
	padding-right: 0.5rem;
}

#commands-content.prose {
	max-width: 900px;
	margin: 0 auto;
	padding: 1.4rem;

	> img {
		display: block;
		margin-left: auto;
		margin-right: auto;
		margin-top: 0.5rem;
		margin-bottom: 0.5rem;
	}
}

.panel,
.hero-panel {
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
	margin: 0 auto 1rem;
	max-width: 900px;
	align-items: center;
	flex-wrap: wrap;
}

.page-portrait {
	display: flex;
	justify-content: center;
	margin: 0 auto 1rem;
	max-width: 900px;
}

.page-portrait img {
	width: 200px;
	height: 200px;
	object-fit: contain;
}

.toc-head {
	padding: 0.25rem 0.75rem 0.75rem;
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

.lede {
	color: #d4d4d8;
	max-width: 42rem;
	line-height: 1.65;
}

@media (max-width: 900px) {
	#commands-grid {
		grid-template-columns: 1fr;
		grid-template-rows: auto minmax(0, 1fr);
		overflow: hidden;
		height: 100%;
	}

	#commands-content-wrapper {
		overflow-y: auto;
		padding-right: 0;
	}

	#commands-toc {
		overflow: hidden;
		padding: 0.75rem;
	}

	.toc-toggle {
		display: flex;
	}

	.toc-head {
		display: none;
	}

	.toc-menu-shell {
		display: grid;
		grid-template-rows: 0fr;
		overflow: hidden;
		transition: grid-template-rows 0.18s ease;
	}

	.toc-menu-shell :deep(.p-menu) {
		min-height: 0;
		overflow-y: auto;
		max-height: 0;
		transition: max-height 0.18s ease;
	}

	.toc-menu-shell-open {
		grid-template-rows: 1fr;
		margin-top: 0.5rem;
	}

	.toc-menu-shell-open :deep(.p-menu) {
		max-height: 280px;
	}
}
</style>
