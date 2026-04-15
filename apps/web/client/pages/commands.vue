<template>
	<div id="commands-grid">
		<div id="commands-toc">
			<Menu :model="menuItems">
				<template #start>
					<h2 class="text-xl font-bold text-center mt-4">Table of Contents</h2>
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
		<div id="commands-content-wrapper" ref="commandRenderer">
			<div id="commands-content" class="prose dark:prose-invert">
				<img
					class="m-auto !mt-2 !mb-2"
					src="/peridot.png"
					alt="kobold portrait"
					width="200"
					height="200"
				/>
				<CommandRenderer :commands="commands" />
			</div>
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

const setTocValueActive = (item: { commandName: string; subCommandName: string }) => {
	const targetId = item.subCommandName
		? `${item.commandName}_${item.subCommandName}`
		: item.commandName;
	document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
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

watch(commandActiveId, () => {
	const container = document.getElementById('commands-toc');
	const tocItem = document.getElementsByClassName(`toc-item_${commandActiveId.value}`)[0];
	if (tocItem && container) {
		const rect = tocItem.getBoundingClientRect();
		if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
			return;
		}
		tocItem.scrollIntoView({ behavior: 'smooth' });
	}
});
</script>

<style lang="scss">
#commands-grid {
	display: grid;
	grid-template-columns: 220px 1fr;
	height: 100%;
	overflow: hidden;
}

#commands-toc {
	overflow-y: auto;
	border-right: 1px solid var(--p-surface-200);
	padding: 0 0.5rem;

	.p-menu {
		background: transparent;
		border: none;
	}

	.p-menu-item.p-focus .p-menu-item-content:has(:not(.selected)) {
		background: inherit;
		color: inherit;
	}
	.selected .p-menu-item.p-focus .p-menu-item-content,
	.p-menu-item-content:has(.selected) {
		background: var(--p-tag-success-background);
		color: var(--p-tag-success-color);
	}
}

#commands-content-wrapper {
	overflow-y: auto;
	padding: 1rem 2rem;
}

#commands-content.prose {
	max-width: 900px;
	margin: 0 auto;

	> img {
		display: block;
		margin-left: auto;
		margin-right: auto;
		margin-top: 0.5rem;
		margin-bottom: 0.5rem;
	}
}

/* Dark mode border */
.dark #commands-toc {
	border-right-color: var(--p-surface-700);
}
</style>
